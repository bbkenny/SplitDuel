// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IAutoSplitRouter {
    function reputationScore(address user) external view returns (uint256);
    function activeVaultAdapter() external view returns (address);
}

contract DuelManager is ReentrancyGuard {
    IAutoSplitRouter public router;
    
    enum DuelState { Open, Active, Resolved, Cancelled }
    
    struct Duel {
        address player1;
        address player2;
        address token;
        uint256 stakePerPlayer;
        uint256 startTime;
        uint8 currentRound; // 1-5
        uint256 p1YieldScore;
        uint256 p2YieldScore;
        uint256 p1Shield; // Carryover shield
        uint256 p2Shield;
        DuelState state;
    }
    
    struct RoundCommit {
        bytes32 p1Commit;
        bytes32 p2Commit;
        bool p1Revealed;
        bool p2Revealed;
        uint8 p1Attack;
        uint8 p1Defend;
        uint8 p1Invest;
        uint8 p2Attack;
        uint8 p2Defend;
        uint8 p2Invest;
    }

    mapping(uint256 => Duel) public duels;
    mapping(uint256 => mapping(uint8 => RoundCommit)) public duelRounds;
    uint256 public nextDuelId = 1;
    
    mapping(address => uint256) public activeDuel;
    
    event DuelCreated(uint256 indexed duelId, address indexed creator, address token, uint256 stake);
    event DuelJoined(uint256 indexed duelId, address indexed joiner);
    event RoundCommitted(uint256 indexed duelId, uint8 round, address player);
    event RoundRevealed(uint256 indexed duelId, uint8 round, address player);
    event RoundResolved(uint256 indexed duelId, uint8 round, uint256 p1Yield, uint256 p2Yield);
    event DuelResolved(uint256 indexed duelId, address winner, uint256 yieldWon);

    constructor(address _router) {
        router = IAutoSplitRouter(_router);
    }

    function createDuel(address token, uint256 stake) external payable nonReentrant returns (uint256) {
        require(activeDuel[msg.sender] == 0, "Already in a duel");
        require(stake > 0, "Zero stake");
        
        if (token == address(0)) {
            require(msg.value == stake, "Invalid native amount");
        } else {
            require(msg.value == 0, "No native for ERC20");
            require(IERC20(token).transferFrom(msg.sender, address(this), stake), "Transfer failed");
        }
        
        uint256 duelId = nextDuelId++;
        duels[duelId] = Duel({
            player1: msg.sender,
            player2: address(0),
            token: token,
            stakePerPlayer: stake,
            startTime: 0,
            currentRound: 0,
            p1YieldScore: 0,
            p2YieldScore: 0,
            p1Shield: 0,
            p2Shield: 0,
            state: DuelState.Open
        });
        
        activeDuel[msg.sender] = duelId;
        emit DuelCreated(duelId, msg.sender, token, stake);
        return duelId;
    }

    function joinDuel(uint256 duelId) external payable nonReentrant {
        require(activeDuel[msg.sender] == 0, "Already in a duel");
        Duel storage d = duels[duelId];
        require(d.state == DuelState.Open, "Not open");
        require(msg.sender != d.player1, "Cannot join own duel");
        
        if (d.token == address(0)) {
            require(msg.value == d.stakePerPlayer, "Invalid native amount");
        } else {
            require(msg.value == 0, "No native for ERC20");
            require(IERC20(d.token).transferFrom(msg.sender, address(this), d.stakePerPlayer), "Transfer failed");
        }
        
        d.player2 = msg.sender;
        d.state = DuelState.Active;
        d.startTime = block.timestamp;
        d.currentRound = 1;
        
        // Base yield score simulates starting treasury
        d.p1YieldScore = d.stakePerPlayer / 100;
        d.p2YieldScore = d.stakePerPlayer / 100;
        
        activeDuel[msg.sender] = duelId;
        emit DuelJoined(duelId, msg.sender);
    }

    function commitRound(uint256 duelId, bytes32 commitHash) external nonReentrant {
        Duel storage d = duels[duelId];
        require(d.state == DuelState.Active, "Duel not active");
        require(msg.sender == d.player1 || msg.sender == d.player2, "Not a participant");
        
        RoundCommit storage rc = duelRounds[duelId][d.currentRound];
        if (msg.sender == d.player1) {
            require(rc.p1Commit == bytes32(0), "Already committed");
            rc.p1Commit = commitHash;
        } else {
            require(rc.p2Commit == bytes32(0), "Already committed");
            rc.p2Commit = commitHash;
        }
        
        emit RoundCommitted(duelId, d.currentRound, msg.sender);
    }
    
    function revealRound(
        uint256 duelId, 
        uint8 attackPct, 
        uint8 defendPct, 
        uint8 investPct, 
        bytes32 salt
    ) external nonReentrant {
        Duel storage d = duels[duelId];
        require(d.state == DuelState.Active, "Duel not active");
        require(attackPct + defendPct + investPct == 100, "Must sum to 100%");
        
        RoundCommit storage rc = duelRounds[duelId][d.currentRound];
        bytes32 computed = keccak256(abi.encodePacked(attackPct, defendPct, investPct, salt, msg.sender));
        
        if (msg.sender == d.player1) {
            require(rc.p1Commit == computed, "Invalid reveal");
            require(!rc.p1Revealed, "Already revealed");
            rc.p1Attack = attackPct;
            rc.p1Defend = defendPct;
            rc.p1Invest = investPct;
            rc.p1Revealed = true;
        } else if (msg.sender == d.player2) {
            require(rc.p2Commit == computed, "Invalid reveal");
            require(!rc.p2Revealed, "Already revealed");
            rc.p2Attack = attackPct;
            rc.p2Defend = defendPct;
            rc.p2Invest = investPct;
            rc.p2Revealed = true;
        } else {
            revert("Not a participant");
        }
        
        emit RoundRevealed(duelId, d.currentRound, msg.sender);
        
        if (rc.p1Revealed && rc.p2Revealed) {
            _resolveRound(duelId);
        }
    }
    
    function _resolveRound(uint256 duelId) internal {
        Duel storage d = duels[duelId];
        RoundCommit storage rc = duelRounds[duelId][d.currentRound];
        
        // P1 Attack
        uint256 p1AttackPower = (d.p1YieldScore * rc.p1Attack) / 100;
        uint256 p2DefendPower = (d.p2YieldScore * rc.p2Defend) / 100 + d.p2Shield;
        
        // P2 Attack
        uint256 p2AttackPower = (d.p2YieldScore * rc.p2Attack) / 100;
        uint256 p1DefendPower = (d.p1YieldScore * rc.p1Defend) / 100 + d.p1Shield;
        
        // Resolve Damage
        uint256 p1DamageTaken = 0;
        if (p2AttackPower > p1DefendPower) {
            p1DamageTaken = p2AttackPower - p1DefendPower;
        }
        
        uint256 p2DamageTaken = 0;
        if (p1AttackPower > p2DefendPower) {
            p2DamageTaken = p1AttackPower - p2DefendPower;
        }
        
        // Calculate Invest Growth (e.g. 5% growth on invested portion)
        uint256 p1Growth = (d.p1YieldScore * rc.p1Invest * 5) / (100 * 100);
        uint256 p2Growth = (d.p2YieldScore * rc.p2Invest * 5) / (100 * 100);
        
        // Apply Rep Buff (e.g. 1% extra growth per rep point, capped at 10%)
        uint256 p1Rep = router.reputationScore(d.player1);
        uint256 p2Rep = router.reputationScore(d.player2);
        
        p1Growth += (p1Growth * (p1Rep > 10 ? 10 : p1Rep)) / 100;
        p2Growth += (p2Growth * (p2Rep > 10 ? 10 : p2Rep)) / 100;

        // Update Scores
        if (d.p1YieldScore + p1Growth > p1DamageTaken) {
            d.p1YieldScore = d.p1YieldScore + p1Growth - p1DamageTaken;
        } else {
            d.p1YieldScore = 0;
        }
        
        if (d.p2YieldScore + p2Growth > p2DamageTaken) {
            d.p2YieldScore = d.p2YieldScore + p2Growth - p2DamageTaken;
        } else {
            d.p2YieldScore = 0;
        }
        
        // Carryover unused shield
        d.p1Shield = p1DefendPower > p2AttackPower ? (p1DefendPower - p2AttackPower) / 2 : 0;
        d.p2Shield = p2DefendPower > p1AttackPower ? (p2DefendPower - p1AttackPower) / 2 : 0;
        
        emit RoundResolved(duelId, d.currentRound, d.p1YieldScore, d.p2YieldScore);
        
        if (d.currentRound == 5) {
            _endDuel(duelId);
        } else {
            d.currentRound++;
        }
    }
    
    function _endDuel(uint256 duelId) internal {
        Duel storage d = duels[duelId];
        d.state = DuelState.Resolved;
        
        activeDuel[d.player1] = 0;
        activeDuel[d.player2] = 0;
        
        address winner;
        address loser;
        
        if (d.p1YieldScore > d.p2YieldScore) {
            winner = d.player1;
            loser = d.player2;
        } else if (d.p2YieldScore > d.p1YieldScore) {
            winner = d.player2;
            loser = d.player1;
        } else {
            // Draw
            _returnPrincipal(d.player1, d.token, d.stakePerPlayer);
            _returnPrincipal(d.player2, d.token, d.stakePerPlayer);
            emit DuelResolved(duelId, address(0), 0);
            return;
        }
        
        // Winner gets their principal back + a simulated yield reward (or actual yield if integrated)
        // For now, winner just gets 10% of loser's stake as a "yield prize", and loser gets 90% back.
        // Wait, the spec says "Lossless principal... Only yield is won/lost".
        // This means the prize comes from the protocol's yield.
        // We'll return 100% principal to both.
        // And winner gets a simulated yield prize (e.g. 5% of stake).
        _returnPrincipal(d.player1, d.token, d.stakePerPlayer);
        _returnPrincipal(d.player2, d.token, d.stakePerPlayer);
        
        uint256 simulatedPrize = (d.stakePerPlayer * 5) / 100;
        // In a real integration, we withdraw from the yield adapter. Here we just pretend if we had enough funds.
        if (d.token == address(0)) {
            if (address(this).balance >= simulatedPrize) {
                (bool s, ) = winner.call{value: simulatedPrize}("");
                require(s, "Prize transfer failed");
            }
        } else {
            if (IERC20(d.token).balanceOf(address(this)) >= simulatedPrize) {
                IERC20(d.token).transfer(winner, simulatedPrize);
            }
        }
        
        emit DuelResolved(duelId, winner, simulatedPrize);
    }
    
    function _returnPrincipal(address to, address token, uint256 amount) internal {
        if (token == address(0)) {
            (bool s, ) = to.call{value: amount}("");
            require(s, "Return failed");
        } else {
            require(IERC20(token).transfer(to, amount), "Return failed");
        }
    }
    
    receive() external payable {}
}
