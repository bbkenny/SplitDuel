// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SplitPool is ReentrancyGuard {
    // Daily Tournament Engine
    
    struct Tournament {
        uint256 startTime;
        uint256 endTime;
        uint256 totalPrize;
        bool resolved;
        address winner;
    }
    
    mapping(uint256 => Tournament) public tournaments;
    uint256 public currentTournamentId = 1;
    
    address public admin;
    
    event TournamentStarted(uint256 indexed id, uint256 endTime);
    event TournamentResolved(uint256 indexed id, address winner, uint256 prize);
    
    constructor() {
        admin = msg.sender;
        _startTournament();
    }
    
    function _startTournament() internal {
        tournaments[currentTournamentId] = Tournament({
            startTime: block.timestamp,
            endTime: block.timestamp + 1 days,
            totalPrize: 0,
            resolved: false,
            winner: address(0)
        });
        emit TournamentStarted(currentTournamentId, block.timestamp + 1 days);
    }
    
    function addPrize() external payable {
        tournaments[currentTournamentId].totalPrize += msg.value;
    }
    
    function resolveTournament(address winner) external {
        require(msg.sender == admin, "Only admin");
        Tournament storage t = tournaments[currentTournamentId];
        require(block.timestamp >= t.endTime, "Not ended");
        require(!t.resolved, "Already resolved");
        
        t.resolved = true;
        t.winner = winner;
        
        if (t.totalPrize > 0) {
            (bool s, ) = winner.call{value: t.totalPrize}("");
            require(s, "Transfer failed");
        }
        
        emit TournamentResolved(currentTournamentId, winner, t.totalPrize);
        
        currentTournamentId++;
        _startTournament();
    }
    
    receive() external payable {
        tournaments[currentTournamentId].totalPrize += msg.value;
    }
}
