// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DailyReward is Ownable {
    IERC20 public catToken;
    uint256 public rewardAmount;
    
    mapping(address => uint256) public lastClaimTime;
    
    event Claimed(address indexed user, uint256 amount, uint256 time);
    event RewardAmountUpdated(uint256 newAmount);
    
    constructor(address _catToken, uint256 _rewardAmount) Ownable(msg.sender) {
        catToken = IERC20(_catToken);
        rewardAmount = _rewardAmount;
    }
    
    function claim() external {
        require(block.timestamp >= lastClaimTime[msg.sender] + 1 days, "Claim available once every 24 hours");
        require(catToken.balanceOf(address(this)) >= rewardAmount, "Insufficient rewards in pool");
        
        lastClaimTime[msg.sender] = block.timestamp;
        require(catToken.transfer(msg.sender, rewardAmount), "Transfer failed");
        
        emit Claimed(msg.sender, rewardAmount, block.timestamp);
    }
    
    function setRewardAmount(uint256 _newAmount) external onlyOwner {
        rewardAmount = _newAmount;
        emit RewardAmountUpdated(_newAmount);
    }
    
    function withdraw(uint256 amount) external onlyOwner {
        require(catToken.transfer(msg.sender, amount), "Transfer failed");
    }

    function canClaim(address user) external view returns (bool) {
        return block.timestamp >= lastClaimTime[user] + 1 days;
    }
}
