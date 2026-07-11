// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IAutoSplitRouter {
    function reputationScore(address user) external view returns (uint256);
    function activeVaultAdapter() external view returns (address);
}

/**
 * @title  DuelManager
 * @notice 1v1 tactical yield-battle engine for SplitDuel.
 *         Two players commit secret splits (Attack / Defend / Invest) across
 *         5 rounds using commit-reveal. Higher treasury after Round 5 wins
 *         accumulated yield. Both principals always returned (lossless).
 *
 * Security follows engineering-playbook part-07 & part-13:
 *   - Admin transferability (two-step)
 *   - Configurable parameters with guards
 *   - Reentrancy guard on all fund-moving functions
 *   - 60-second reveal window enforced; forfeitRound() handles timeouts
 *   - Checks-Effects-Interactions pattern throughout
 */
contract DuelManager is ReentrancyGuard {

    // ─── Admin (two-step transfer per playbook 07.3) ─────────────────────────
    address public admin;
    address public pendingAdmin;

    modifier onlyAdmin() {
        require(msg.sender == admin, "ERR: Not admin");
        _;
    }

    function transferAdmin(address _new) external onlyAdmin {
        require(_new != address(0), "ERR: Zero address");
        pendingAdmin = _new;
    }

    function acceptAdmin() external {
        require(msg.sender == pendingAdmin, "ERR: Not pending admin");
        emit AdminTransferred(admin, pendingAdmin);
        admin       = pendingAdmin;
        pendingAdmin = address(0);
    }

    // ─── Constants & Configurable Parameters ─────────────────────────────────
    uint256 public constant REVEAL_WINDOW   = 60;          // seconds — both must reveal within 60s of both committing
    uint256 public constant SECONDS_IN_YEAR = 31536000;

    uint256 public apyBasisPoints  = 500;   // 5% simulated APY on staked principals — admin-tunable
    uint256 public winnerShareBP   = 7000;  // 70% of prize pool → winner; 30% remains seeded

    function setApyBasisPoints(uint256 _apy) external onlyAdmin {
        require(_apy <= 5000, "ERR: APY too high (max 50%)");
        apyBasisPoints = _apy;
    }

    function setWinnerShareBP(uint256 _bp) external onlyAdmin {
        require(_bp >= 5000 && _bp <= 10000, "ERR: Must be 50-10000%");
        winnerShareBP = _bp;
    }

    // ─── AutoSplitRouter Interface ────────────────────────────────────────────
    IAutoSplitRouter public router;

    // ─── Duel Structs ─────────────────────────────────────────────────────────
    enum DuelState { Open, Active, Resolved, Cancelled }

    struct Duel {
        address player1;
        address player2;
        address token;
        uint256 stakePerPlayer;
        uint256 startTime;
        uint8   currentRound;   // 1–5
        uint256 p1YieldScore;
        uint256 p2YieldScore;
        uint256 p1Shield;       // carryover unused defence
        uint256 p2Shield;
        DuelState state;
    }

    struct RoundCommit {
        bytes32  p1Commit;
        bytes32  p2Commit;
        uint256  bothCommittedAt; // timestamp when BOTH committed → starts reveal window
        bool     p1Revealed;
        bool     p2Revealed;
        uint8    p1Attack;
        uint8    p1Defend;
        uint8    p1Invest;
        uint8    p2Attack;
        uint8    p2Defend;
        uint8    p2Invest;
    }

    // ─── Duel Storage ─────────────────────────────────────────────────────────
    mapping(uint256 => Duel)                         public duels;
    mapping(uint256 => mapping(uint8 => RoundCommit)) public duelRounds;
    uint256 public nextDuelId = 1;

    mapping(address => uint256) public activeDuel;  // player → duelId (0 = not in duel)

    // ─── Prize Pool (simulated yield on staked principals) ───────────────────
    mapping(address => uint256) public prizePool;    // token → accumulated yield
    mapping(address => uint256) public totalStaked;  // token → total principal staked across active duels
    uint256 public lastYieldUpdate;

    // ─── Events ───────────────────────────────────────────────────────────────
    event DuelCreated(uint256 indexed duelId, address indexed creator, address token, uint256 stake);
    event DuelJoined(uint256 indexed duelId, address indexed joiner);
    event RoundCommitted(uint256 indexed duelId, uint8 round, address player);
    event RoundRevealed(uint256 indexed duelId, uint8 round, address player);
    event RoundResolved(uint256 indexed duelId, uint8 round, uint256 p1Score, uint256 p2Score);
    event RoundForfeited(uint256 indexed duelId, uint8 round, address indexed forfeiter);
    event DuelResolved(uint256 indexed duelId, address indexed winner, uint256 yieldWon);
    event DuelCancelled(uint256 indexed duelId);
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor(address _router) {
        router          = IAutoSplitRouter(_router);
        admin           = msg.sender;
        lastYieldUpdate = block.timestamp;
    }

    // ─── Internal: Yield Accrual ──────────────────────────────────────────────
    /**
     * @dev Accrues simulated yield on total staked principal per token.
     *      Called before any stake change or duel resolution.
     */
    function _accrueYield(address token) internal {
        uint256 elapsed = block.timestamp - lastYieldUpdate;
        if (elapsed > 0 && totalStaked[token] > 0) {
            uint256 newYield = (totalStaked[token] * apyBasisPoints * elapsed) / (SECONDS_IN_YEAR * 10000);
            prizePool[token] += newYield;
        }
        lastYieldUpdate = block.timestamp;
    }

    // ─── Duel Lifecycle ───────────────────────────────────────────────────────
    /**
     * @notice Create a new open duel. Deposits stake immediately.
     * @param token  Token address (address(0) = native CELO)
     * @param stake  Amount to stake (must match msg.value for native CELO)
     */
    function createDuel(address token, uint256 stake) external payable nonReentrant returns (uint256) {
        require(activeDuel[msg.sender] == 0, "ERR: Already in a duel");
        require(stake > 0, "ERR: Zero stake");

        if (token == address(0)) {
            require(msg.value == stake, "ERR: msg.value must equal stake");
        } else {
            require(msg.value == 0, "ERR: Do not send native CELO for ERC20");
            require(IERC20(token).transferFrom(msg.sender, address(this), stake), "ERR: Transfer failed");
        }

        _accrueYield(token);
        totalStaked[token] += stake;

        uint256 duelId = nextDuelId++;
        duels[duelId] = Duel({
            player1:       msg.sender,
            player2:       address(0),
            token:         token,
            stakePerPlayer: stake,
            startTime:     0,
            currentRound:  0,
            p1YieldScore:  0,
            p2YieldScore:  0,
            p1Shield:      0,
            p2Shield:      0,
            state:         DuelState.Open
        });

        activeDuel[msg.sender] = duelId;
        emit DuelCreated(duelId, msg.sender, token, stake);
        return duelId;
    }

    /**
     * @notice Join an existing open duel as player 2.
     */
    function joinDuel(uint256 duelId) external payable nonReentrant {
        require(activeDuel[msg.sender] == 0, "ERR: Already in a duel");

        Duel storage d = duels[duelId];
        require(d.state == DuelState.Open,          "ERR: Duel not open");
        require(msg.sender != d.player1,            "ERR: Cannot join your own duel");

        if (d.token == address(0)) {
            require(msg.value == d.stakePerPlayer,  "ERR: msg.value must equal stake");
        } else {
            require(msg.value == 0, "ERR: Do not send native CELO for ERC20");
            require(IERC20(d.token).transferFrom(msg.sender, address(this), d.stakePerPlayer), "ERR: Transfer failed");
        }

        _accrueYield(d.token);
        totalStaked[d.token] += d.stakePerPlayer;

        d.player2     = msg.sender;
        d.state       = DuelState.Active;
        d.startTime   = block.timestamp;
        d.currentRound = 1;

        // Initial treasury: 1% of stake — simulates a small seed for game mechanics
        d.p1YieldScore = d.stakePerPlayer / 100;
        d.p2YieldScore = d.stakePerPlayer / 100;

        activeDuel[msg.sender] = duelId;
        emit DuelJoined(duelId, msg.sender);
    }

    // ─── Commit / Reveal ──────────────────────────────────────────────────────
    /**
     * @notice Submit your secret commit for the current round.
     *         commitHash = keccak256(abi.encodePacked(attackPct, defendPct, investPct, salt, msg.sender))
     */
    function commitRound(uint256 duelId, bytes32 commitHash) external nonReentrant {
        Duel storage d = duels[duelId];
        require(d.state == DuelState.Active,                         "ERR: Duel not active");
        require(msg.sender == d.player1 || msg.sender == d.player2,  "ERR: Not a participant");

        RoundCommit storage rc = duelRounds[duelId][d.currentRound];

        if (msg.sender == d.player1) {
            require(rc.p1Commit == bytes32(0), "ERR: Already committed this round");
            rc.p1Commit = commitHash;
        } else {
            require(rc.p2Commit == bytes32(0), "ERR: Already committed this round");
            rc.p2Commit = commitHash;
        }

        // Record timestamp when BOTH have committed (reveal window starts)
        if (rc.p1Commit != bytes32(0) && rc.p2Commit != bytes32(0) && rc.bothCommittedAt == 0) {
            rc.bothCommittedAt = block.timestamp;
        }

        emit RoundCommitted(duelId, d.currentRound, msg.sender);
    }

    /**
     * @notice Reveal your split for the current round.
     *         Must be called within REVEAL_WINDOW seconds of both players committing.
     *         attackPct + defendPct + investPct must equal 100.
     */
    function revealRound(
        uint256 duelId,
        uint8   attackPct,
        uint8   defendPct,
        uint8   investPct,
        bytes32 salt
    ) external nonReentrant {
        Duel storage d = duels[duelId];
        require(d.state == DuelState.Active,  "ERR: Duel not active");
        require(attackPct + defendPct + investPct == 100, "ERR: Split must sum to 100%");

        RoundCommit storage rc = duelRounds[duelId][d.currentRound];

        // Both must have committed before either can reveal
        require(rc.p1Commit != bytes32(0) && rc.p2Commit != bytes32(0), "ERR: Both players must commit first");

        // Enforce reveal window
        require(
            block.timestamp <= rc.bothCommittedAt + REVEAL_WINDOW,
            "ERR: Reveal window expired. Call forfeitRound() instead"
        );

        bytes32 computed = keccak256(abi.encodePacked(attackPct, defendPct, investPct, salt, msg.sender));

        if (msg.sender == d.player1) {
            require(rc.p1Commit == computed, "ERR: Reveal hash does not match commit");
            require(!rc.p1Revealed,          "ERR: Already revealed this round");
            rc.p1Attack   = attackPct;
            rc.p1Defend   = defendPct;
            rc.p1Invest   = investPct;
            rc.p1Revealed = true;
        } else if (msg.sender == d.player2) {
            require(rc.p2Commit == computed, "ERR: Reveal hash does not match commit");
            require(!rc.p2Revealed,          "ERR: Already revealed this round");
            rc.p2Attack   = attackPct;
            rc.p2Defend   = defendPct;
            rc.p2Invest   = investPct;
            rc.p2Revealed = true;
        } else {
            revert("ERR: Not a participant");
        }

        emit RoundRevealed(duelId, d.currentRound, msg.sender);

        // Auto-resolve when both have revealed
        if (rc.p1Revealed && rc.p2Revealed) {
            _resolveRound(duelId);
        }
    }

    /**
     * @notice Called by anyone after REVEAL_WINDOW expires if one (or both) players
     *         failed to reveal. The non-revealer(s) take a 20% yield-score penalty.
     *         Round then advances (or duel ends on round 5).
     */
    function forfeitRound(uint256 duelId) external nonReentrant {
        Duel storage d = duels[duelId];
        require(d.state == DuelState.Active, "ERR: Duel not active");

        RoundCommit storage rc = duelRounds[duelId][d.currentRound];
        require(rc.bothCommittedAt != 0, "ERR: Both players have not committed yet");
        require(block.timestamp > rc.bothCommittedAt + REVEAL_WINDOW, "ERR: Reveal window still open");

        // Apply 20% penalty to non-revealer(s)
        if (!rc.p1Revealed && !rc.p2Revealed) {
            // Both forfeited — mutual penalty (round treated as neutral)
            emit RoundForfeited(duelId, d.currentRound, address(0));
        } else if (!rc.p1Revealed) {
            d.p1YieldScore = d.p1YieldScore - (d.p1YieldScore / 5);
            emit RoundForfeited(duelId, d.currentRound, d.player1);
        } else {
            d.p2YieldScore = d.p2YieldScore - (d.p2YieldScore / 5);
            emit RoundForfeited(duelId, d.currentRound, d.player2);
        }

        if (d.currentRound == 5) {
            _endDuel(duelId);
        } else {
            d.currentRound++;
        }
    }

    // ─── Internal: Round Resolution ───────────────────────────────────────────
    function _resolveRound(uint256 duelId) internal {
        Duel storage d  = duels[duelId];
        RoundCommit storage rc = duelRounds[duelId][d.currentRound];

        // ── Attack vs Defend ──────────────────────────────────────────────────
        uint256 p1AttackPower = (d.p1YieldScore * rc.p1Attack) / 100;
        uint256 p2AttackPower = (d.p2YieldScore * rc.p2Attack) / 100;

        uint256 p1DefendPower = (d.p1YieldScore * rc.p1Defend) / 100 + d.p1Shield;
        uint256 p2DefendPower = (d.p2YieldScore * rc.p2Defend) / 100 + d.p2Shield;

        uint256 p1Damage = p2AttackPower > p1DefendPower ? p2AttackPower - p1DefendPower : 0;
        uint256 p2Damage = p1AttackPower > p2DefendPower ? p1AttackPower - p2DefendPower : 0;

        // ── Invest Growth (5% on invested portion) ────────────────────────────
        uint256 p1Growth = (d.p1YieldScore * rc.p1Invest * 5) / (100 * 100);
        uint256 p2Growth = (d.p2YieldScore * rc.p2Invest * 5) / (100 * 100);

        // ── Reputation buff (capped at 10 rep points = +10% to growth) ────────
        uint256 p1Rep = _safeGetRep(d.player1);
        uint256 p2Rep = _safeGetRep(d.player2);
        p1Growth += (p1Growth * (p1Rep > 10 ? 10 : p1Rep)) / 100;
        p2Growth += (p2Growth * (p2Rep > 10 ? 10 : p2Rep)) / 100;

        // ── Apply to scores (floor at 0) ──────────────────────────────────────
        uint256 p1New = d.p1YieldScore + p1Growth;
        d.p1YieldScore = p1New > p1Damage ? p1New - p1Damage : 0;

        uint256 p2New = d.p2YieldScore + p2Growth;
        d.p2YieldScore = p2New > p2Damage ? p2New - p2Damage : 0;

        // ── Carryover shield (50% of unused defence) ──────────────────────────
        d.p1Shield = p1DefendPower > p2AttackPower ? (p1DefendPower - p2AttackPower) / 2 : 0;
        d.p2Shield = p2DefendPower > p1AttackPower ? (p2DefendPower - p1AttackPower) / 2 : 0;

        emit RoundResolved(duelId, d.currentRound, d.p1YieldScore, d.p2YieldScore);

        if (d.currentRound == 5) {
            _endDuel(duelId);
        } else {
            d.currentRound++;
        }
    }

    // ─── Internal: End Duel ───────────────────────────────────────────────────
    function _endDuel(uint256 duelId) internal {
        Duel storage d = duels[duelId];

        // ── Effects first (CEI) ───────────────────────────────────────────────
        d.state = DuelState.Resolved;
        activeDuel[d.player1] = 0;
        activeDuel[d.player2] = 0;

        address token  = d.token;
        uint256 stake  = d.stakePerPlayer;
        address p1     = d.player1;
        address p2     = d.player2;

        // Accrue final yield, then remove staked principal from tracking
        _accrueYield(token);
        totalStaked[token] = totalStaked[token] >= stake * 2 ? totalStaked[token] - stake * 2 : 0;

        // Determine winner
        address winner;
        if (d.p1YieldScore > d.p2YieldScore) {
            winner = p1;
        } else if (d.p2YieldScore > d.p1YieldScore) {
            winner = p2;
        }
        // (draw case: winner stays address(0))

        // Yield prize from prize pool
        uint256 prize    = 0;
        uint256 poolLeft = 0;
        if (winner != address(0) && prizePool[token] > 0) {
            uint256 total = prizePool[token];
            prize    = (total * winnerShareBP) / 10000;
            poolLeft = total - prize; // remainder stays seeded for future duels
            prizePool[token] = poolLeft;
        }

        // ── Interactions (after all state changes) ────────────────────────────
        _safeTransfer(p1, token, stake);
        _safeTransfer(p2, token, stake);

        if (prize > 0) {
            _safeTransfer(winner, token, prize);
        }

        emit DuelResolved(duelId, winner, prize);
    }

    // ─── Admin: Cancel Open Duel ──────────────────────────────────────────────
    /**
     * @notice Cancel an open (unjoined) duel. Refunds player1's stake.
     *         Callable by player1 or admin.
     */
    function cancelDuel(uint256 duelId) external nonReentrant {
        Duel storage d = duels[duelId];
        require(d.state == DuelState.Open,                              "ERR: Can only cancel open duels");
        require(msg.sender == d.player1 || msg.sender == admin,         "ERR: Not authorized");

        // Effects
        d.state = DuelState.Cancelled;
        activeDuel[d.player1] = 0;
        address token  = d.token;
        uint256 stake  = d.stakePerPlayer;
        address p1     = d.player1;

        _accrueYield(token);
        totalStaked[token] = totalStaked[token] >= stake ? totalStaked[token] - stake : 0;

        // Interactions
        _safeTransfer(p1, token, stake);

        emit DuelCancelled(duelId);
    }

    // ─── Internal: Safe Transfer ──────────────────────────────────────────────
    function _safeTransfer(address to, address token, uint256 amount) internal {
        if (amount == 0) return;
        if (token == address(0)) {
            (bool s, ) = to.call{value: amount}("");
            require(s, "ERR: Native transfer failed");
        } else {
            require(IERC20(token).transfer(to, amount), "ERR: ERC20 transfer failed");
        }
    }

    function _safeGetRep(address player) internal view returns (uint256) {
        try router.reputationScore(player) returns (uint256 rep) {
            return rep;
        } catch {
            return 0;
        }
    }

    // ─── View Helpers ─────────────────────────────────────────────────────────
    function getDuel(uint256 duelId) external view returns (Duel memory) {
        return duels[duelId];
    }

    function getRoundCommit(uint256 duelId, uint8 round) external view returns (RoundCommit memory) {
        return duelRounds[duelId][round];
    }

    /**
     * @notice Returns current prize pool + pending (unaccrued) yield for a token.
     */
    function getPrizePool(address token) external view returns (uint256) {
        uint256 elapsed = block.timestamp - lastYieldUpdate;
        uint256 pending = 0;
        if (elapsed > 0 && totalStaked[token] > 0) {
            pending = (totalStaked[token] * apyBasisPoints * elapsed) / (SECONDS_IN_YEAR * 10000);
        }
        return prizePool[token] + pending;
    }

    receive() external payable {}
}
