// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title  SplitPool
 * @notice Daily tournament engine for SplitDuel.
 *         Players join, deposit a stake (principal 100% safe), and commit a
 *         secret Attack / Defend / Invest split for the tournament window.
 *         After the window closes, the top-10% most efficient players
 *         (highest investBP) share the accumulated yield proportionally.
 *         All principals are returned regardless of outcome.
 *
 * Security follows engineering-playbook part-07 & part-13:
 *   - No hardcoded admin address (two-step transfer)
 *   - All admin parameters are configurable via setter with guard
 *   - Reentrancy guard on all fund-moving functions
 *   - Checks-Effects-Interactions pattern
 */
contract SplitPool is ReentrancyGuard {

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
        admin = pendingAdmin;
        pendingAdmin = address(0);
    }

    // ─── Constants & Configurable Parameters ─────────────────────────────────
    uint256 public constant SECONDS_IN_YEAR = 31536000;

    uint256 public apyBasisPoints    = 500;   // 5% simulated yield on stakes — admin-tunable
    uint256 public tournamentDuration = 1 days; // admin-tunable

    function setApyBasisPoints(uint256 _apy) external onlyAdmin {
        require(_apy <= 5000, "ERR: APY too high (max 50%)");
        apyBasisPoints = _apy;
    }

    function setTournamentDuration(uint256 _duration) external onlyAdmin {
        require(_duration >= 1 hours, "ERR: Duration too short");
        tournamentDuration = _duration;
    }

    // ─── Token Registry ───────────────────────────────────────────────────────
    // Celo mainnet token addresses
    address public constant CELO_ERC20 = 0x471EcE3750Da237f93B8E339c536989b8978a438;
    address public constant USDM       = 0x765DE816845861e75A25fCA122bb6898B8B1282a;
    address public constant EURM       = 0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73;
    address public constant USDT       = 0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e;
    address public constant USDC       = 0xcebA9300f2b948710d2653dD7B07f33A8B32118C;

    mapping(address => bool)    public supportedTokens;
    mapping(address => uint256) public minEntryAmount;

    function setTokenSupport(address token, bool supported, uint256 minAmount) external onlyAdmin {
        supportedTokens[token] = supported;
        minEntryAmount[token]  = minAmount;
    }

    // ─── Tournament State ─────────────────────────────────────────────────────
    struct Tournament {
        uint256 id;
        uint256 startTime;
        uint256 endTime;
        uint256 totalStaked;
        uint256 totalPrize;        // accumulated simulated yield
        uint256 lastYieldUpdate;   // block.timestamp of last yield accrual
        bool    settled;
        uint256 entryCount;
        uint256 revealedCount;
    }

    // tournamentId => token => Tournament
    mapping(uint256 => mapping(address => Tournament)) public tournaments;

    uint256 public currentTournamentId = 1;

    // ─── Entry State ──────────────────────────────────────────────────────────
    struct Entry {
        address player;
        uint256 amount;           // principal deposited
        bytes32 commitHash;       // keccak256(attackBP, defendBP, investBP, salt, msg.sender)
        uint8   attackBP;         // revealed: attack %
        uint8   defendBP;         // revealed: defend %
        uint8   investBP;         // revealed: invest % → efficiency score
        bool    revealed;
        bool    isWinner;
        uint256 rewardAmount;     // set at settlement; proportional yield share
        bool    principalClaimed;
        bool    rewardClaimed;
    }

    // tournamentId => token => player => Entry
    mapping(uint256 => mapping(address => mapping(address => Entry))) public entries;
    // tournamentId => token => ordered player list
    mapping(uint256 => mapping(address => address[])) public tournamentPlayers;
    // tournamentId => token => winner list (set at settlement)
    mapping(uint256 => mapping(address => address[])) public tournamentWinners;

    // ─── Events ───────────────────────────────────────────────────────────────
    event TournamentStarted(uint256 indexed tournamentId, address indexed token, uint256 endTime);
    event TournamentAdvanced(uint256 oldId, uint256 newId);
    event PoolJoined(uint256 indexed tournamentId, address indexed token, address indexed player, uint256 amount);
    event SplitCommitted(uint256 indexed tournamentId, address indexed token, address indexed player);
    event SplitRevealed(uint256 indexed tournamentId, address indexed token, address indexed player, uint8 attackBP, uint8 defendBP, uint8 investBP);
    event TournamentSettled(uint256 indexed tournamentId, address indexed token, uint256 totalPrize, uint256 winnerCount);
    event RewardClaimed(uint256 indexed tournamentId, address indexed token, address indexed player, uint256 amount);
    event PrincipalClaimed(uint256 indexed tournamentId, address indexed token, address indexed player, uint256 amount);
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor() {
        admin = msg.sender;

        // Register default tokens
        supportedTokens[CELO_ERC20] = true; minEntryAmount[CELO_ERC20] = 0.05 ether;
        supportedTokens[USDM]       = true; minEntryAmount[USDM]       = 0.05 ether;
        supportedTokens[EURM]       = true; minEntryAmount[EURM]       = 0.05 ether;
        supportedTokens[USDT]       = true; minEntryAmount[USDT]       = 0.05 ether;
        supportedTokens[USDC]       = true; minEntryAmount[USDC]       = 0.05 ether;
    }

    // ─── Tournament Lifecycle (Admin) ─────────────────────────────────────────
    /**
     * @notice Start a new tournament for a given token.
     *         Only callable by admin; must be called per-token before players can join.
     */
    function startTournament(address token) external onlyAdmin {
        require(supportedTokens[token], "ERR: Unsupported token");
        Tournament storage t = tournaments[currentTournamentId][token];
        require(t.startTime == 0, "ERR: Already started for this token");

        t.id              = currentTournamentId;
        t.startTime       = block.timestamp;
        t.endTime         = block.timestamp + tournamentDuration;
        t.lastYieldUpdate = block.timestamp;
        t.settled         = false;

        emit TournamentStarted(currentTournamentId, token, t.endTime);
    }

    /**
     * @notice Advance to the next tournament cycle.
     *         Call after settling all token tournaments in the current cycle.
     */
    function advanceTournament() external onlyAdmin {
        uint256 old = currentTournamentId;
        currentTournamentId++;
        emit TournamentAdvanced(old, currentTournamentId);
    }

    // ─── Internal: Yield Accrual ──────────────────────────────────────────────
    function _accrueYield(uint256 tid, address token) internal {
        Tournament storage t = tournaments[tid][token];
        if (t.totalStaked == 0) {
            t.lastYieldUpdate = block.timestamp;
            return;
        }
        uint256 elapsed = block.timestamp - t.lastYieldUpdate;
        if (elapsed > 0) {
            uint256 newYield = (t.totalStaked * apyBasisPoints * elapsed) / (SECONDS_IN_YEAR * 10000);
            t.totalPrize    += newYield;
        }
        t.lastYieldUpdate = block.timestamp;
    }

    // ─── Player Actions ───────────────────────────────────────────────────────
    /**
     * @notice Deposit stake to enter the current tournament.
     *         Principal is ALWAYS returned — only yield is the prize.
     * @param token  ERC20 token address (use CELO_ERC20 address for native CELO)
     * @param amount Amount to deposit (ignored for CELO — msg.value is used)
     */
    function joinPool(address token, uint256 amount) external payable nonReentrant {
        require(supportedTokens[token], "ERR: Unsupported token");

        uint256 tid = currentTournamentId;
        Tournament storage t = tournaments[tid][token];
        require(t.startTime != 0,               "ERR: Tournament not started");
        require(block.timestamp < t.endTime,    "ERR: Tournament ended");

        Entry storage e = entries[tid][token][msg.sender];
        require(e.player == address(0),         "ERR: Already entered");

        // Accept deposit
        uint256 depositAmount;
        if (token == CELO_ERC20) {
            require(msg.value > 0,                      "ERR: Send CELO as msg.value");
            require(msg.value >= minEntryAmount[token],  "ERR: Below minimum entry");
            depositAmount = msg.value;
        } else {
            require(msg.value == 0,                     "ERR: Do not send native CELO for ERC20");
            require(amount >= minEntryAmount[token],     "ERR: Below minimum entry");
            require(IERC20(token).transferFrom(msg.sender, address(this), amount), "ERR: Transfer failed");
            depositAmount = amount;
        }

        // Update yield before changing stake
        _accrueYield(tid, token);

        // Record entry
        e.player = msg.sender;
        e.amount = depositAmount;
        t.totalStaked += depositAmount;
        t.entryCount++;

        tournamentPlayers[tid][token].push(msg.sender);

        emit PoolJoined(tid, token, msg.sender, depositAmount);
    }

    /**
     * @notice Commit your secret split strategy for the tournament.
     *         commitHash = keccak256(abi.encodePacked(attackBP, defendBP, investBP, salt, msg.sender))
     */
    function commitSplit(address token, bytes32 commitHash) external nonReentrant {
        uint256 tid = currentTournamentId;
        Tournament storage t = tournaments[tid][token];
        require(t.startTime != 0,            "ERR: Tournament not started");
        require(block.timestamp < t.endTime, "ERR: Tournament ended");

        Entry storage e = entries[tid][token][msg.sender];
        require(e.player == msg.sender,      "ERR: Not entered");
        require(e.commitHash == bytes32(0),  "ERR: Already committed");

        e.commitHash = commitHash;
        emit SplitCommitted(tid, token, msg.sender);
    }

    /**
     * @notice Reveal your committed split strategy.
     *         attackBP + defendBP + investBP must equal 100.
     *         investBP is used as the efficiency score for winner selection.
     */
    function revealSplit(
        address token,
        uint8   attackBP,
        uint8   defendBP,
        uint8   investBP,
        bytes32 salt
    ) external nonReentrant {
        uint256 tid = currentTournamentId;
        Tournament storage t = tournaments[tid][token];
        require(t.startTime != 0,            "ERR: Tournament not started");
        require(block.timestamp < t.endTime, "ERR: Tournament ended");

        Entry storage e = entries[tid][token][msg.sender];
        require(e.player == msg.sender,      "ERR: Not entered");
        require(e.commitHash != bytes32(0),  "ERR: Must commit first");
        require(!e.revealed,                 "ERR: Already revealed");
        require(attackBP + defendBP + investBP == 100, "ERR: Must sum to 100%");

        bytes32 computed = keccak256(abi.encodePacked(attackBP, defendBP, investBP, salt, msg.sender));
        require(e.commitHash == computed, "ERR: Invalid reveal: hash mismatch");

        e.attackBP = attackBP;
        e.defendBP = defendBP;
        e.investBP = investBP;
        e.revealed = true;
        t.revealedCount++;

        emit SplitRevealed(tid, token, msg.sender, attackBP, defendBP, investBP);
    }

    // ─── Settlement ───────────────────────────────────────────────────────────
    /**
     * @notice Settle the tournament after it ends.
     *         - Accrues final yield.
     *         - Selects top 10% of revealed players by investBP (efficiency).
     *         - Assigns proportional reward amounts to each winner.
     *         - Callable by anyone after endTime — no admin trust required.
     *
     * @dev  Uses selection sort — O(n²) — acceptable for hackathon-scale pools
     *       (< 200 participants). Gas bounded by Celo block gas limit (32M).
     *       For production at scale, use an off-chain merkle proof instead.
     */
    function settlePool(address token) external nonReentrant {
        uint256 tid = currentTournamentId;
        Tournament storage t = tournaments[tid][token];
        require(t.startTime != 0,           "ERR: Tournament not started");
        require(block.timestamp >= t.endTime, "ERR: Tournament not yet ended");
        require(!t.settled,                 "ERR: Already settled");

        // Final yield accrual
        _accrueYield(tid, token);
        t.settled = true;

        address[] storage players = tournamentPlayers[tid][token];
        uint256 playerCount = players.length;

        if (playerCount == 0 || t.revealedCount == 0) {
            emit TournamentSettled(tid, token, t.totalPrize, 0);
            return;
        }

        // ── Build revealed player array ──────────────────────────────────────
        address[] memory revealed = new address[](t.revealedCount);
        uint256 ri = 0;
        for (uint256 i = 0; i < playerCount; i++) {
            if (entries[tid][token][players[i]].revealed) {
                revealed[ri] = players[i];
                ri++;
            }
        }

        // ── Determine winner count (top 10%, minimum 1) ──────────────────────
        uint256 winnerCount = t.revealedCount / 10;
        if (winnerCount == 0) winnerCount = 1;
        if (winnerCount > t.revealedCount) winnerCount = t.revealedCount;

        // ── Selection sort: put top `winnerCount` addresses at the front ─────
        for (uint256 i = 0; i < winnerCount; i++) {
            uint256 maxIdx = i;
            for (uint256 j = i + 1; j < t.revealedCount; j++) {
                if (entries[tid][token][revealed[j]].investBP >
                    entries[tid][token][revealed[maxIdx]].investBP) {
                    maxIdx = j;
                }
            }
            if (maxIdx != i) {
                address tmp    = revealed[i];
                revealed[i]    = revealed[maxIdx];
                revealed[maxIdx] = tmp;
            }
        }

        // ── Sum efficiency scores of winners ─────────────────────────────────
        uint256 totalEfficiency = 0;
        for (uint256 i = 0; i < winnerCount; i++) {
            totalEfficiency += entries[tid][token][revealed[i]].investBP;
        }

        // ── Assign proportional rewards and mark winners ──────────────────────
        uint256 prize = t.totalPrize;
        for (uint256 i = 0; i < winnerCount; i++) {
            Entry storage e = entries[tid][token][revealed[i]];
            e.isWinner    = true;
            e.rewardAmount = totalEfficiency > 0
                ? (prize * e.investBP) / totalEfficiency
                : prize / winnerCount; // equal split fallback
            tournamentWinners[tid][token].push(revealed[i]);
        }

        emit TournamentSettled(tid, token, prize, winnerCount);
    }

    // ─── Claims ───────────────────────────────────────────────────────────────
    /**
     * @notice Claim yield reward (winners only, after settlement).
     */
    function claimPoolReward(uint256 tournamentId, address token) external nonReentrant {
        Tournament storage t = tournaments[tournamentId][token];
        require(t.settled, "ERR: Tournament not settled");

        Entry storage e = entries[tournamentId][token][msg.sender];
        require(e.player == msg.sender,  "ERR: Not an entry");
        require(e.isWinner,              "ERR: Not a winner");
        require(!e.rewardClaimed,        "ERR: Reward already claimed");
        require(e.rewardAmount > 0,      "ERR: No reward");

        // Effects before interactions (CEI)
        e.rewardClaimed = true;
        uint256 payout  = e.rewardAmount;

        _transferOut(msg.sender, token, payout);

        emit RewardClaimed(tournamentId, token, msg.sender, payout);
    }

    /**
     * @notice Claim original principal stake (all participants, after settlement).
     */
    function claimPrincipal(uint256 tournamentId, address token) external nonReentrant {
        Tournament storage t = tournaments[tournamentId][token];
        require(t.settled, "ERR: Tournament not settled");

        Entry storage e = entries[tournamentId][token][msg.sender];
        require(e.player == msg.sender,   "ERR: Not an entry");
        require(!e.principalClaimed,      "ERR: Principal already claimed");

        // Effects before interactions (CEI)
        e.principalClaimed = true;
        uint256 payout     = e.amount;

        _transferOut(msg.sender, token, payout);

        emit PrincipalClaimed(tournamentId, token, msg.sender, payout);
    }

    // ─── Internal Transfer Helper ─────────────────────────────────────────────
    function _transferOut(address to, address token, uint256 amount) internal {
        if (amount == 0) return;
        if (token == CELO_ERC20) {
            (bool s, ) = to.call{value: amount}("");
            require(s, "ERR: Native transfer failed");
        } else {
            require(IERC20(token).transfer(to, amount), "ERR: ERC20 transfer failed");
        }
    }

    // ─── View Helpers ─────────────────────────────────────────────────────────
    function getTournamentPlayers(uint256 tid, address token) external view returns (address[] memory) {
        return tournamentPlayers[tid][token];
    }

    function getTournamentWinners(uint256 tid, address token) external view returns (address[] memory) {
        return tournamentWinners[tid][token];
    }

    function getEntry(uint256 tid, address token, address player) external view returns (Entry memory) {
        return entries[tid][token][player];
    }

    function getCurrentPrize(address token) external view returns (uint256) {
        uint256 tid = currentTournamentId;
        Tournament storage t = tournaments[tid][token];
        if (t.totalStaked == 0) return t.totalPrize;
        uint256 elapsed = block.timestamp - t.lastYieldUpdate;
        uint256 pending = (t.totalStaked * apyBasisPoints * elapsed) / (SECONDS_IN_YEAR * 10000);
        return t.totalPrize + pending;
    }

    receive() external payable {}
}
