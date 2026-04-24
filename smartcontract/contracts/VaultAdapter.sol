// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// VaultAdapter
// Optional vault integration for AutoSplit router
// Handles deposit/withdraw to/from yield protocols
contract VaultAdapter is Ownable {
    IERC20 public token;
    string public name;

    mapping(address => uint256) public balances;
    uint256 public totalDeposits;

    event Deposited(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, uint256 amount, uint256 shares);

    constructor(address _token, string memory _name) Ownable(msg.sender) {
        token = IERC20(_token);
        name = _name;
    }

    // Deposit tokens and receive shares (1:1 for MVP)
    function deposit(address user, uint256 amount) external returns (uint256 shares) {
        require(amount > 0, "Zero amount");
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        shares = amount; // 1:1 shares for simplicity
        balances[user] += shares;
        totalDeposits += amount;

        emit Deposited(user, amount, shares);
        return shares;
    }

    // Withdraw tokens by shares
    function withdraw(uint256 shares) external returns (uint256 amount) {
        require(shares > 0, "Zero shares");
        require(balances[msg.sender] >= shares, "Insufficient shares");

        amount = shares; // 1:1
        balances[msg.sender] -= shares;
        totalDeposits -= amount;

        require(token.transfer(msg.sender, amount), "Transfer failed");
        emit Withdrawn(msg.sender, amount, shares);
        return amount;
    }

    // View user balance in underlying tokens
    function balanceOf(address user) external view returns (uint256) {
        return balances[user];
    }

    // Admin: emergency withdraw (pause scenario)
    function emergencyWithdraw() external onlyOwner {
        uint256 bal = token.balanceOf(address(this));
        require(token.transfer(owner(), bal), "Transfer failed");
    }
}
