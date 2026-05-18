// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// VaultAdapter
// Handles deposits and withdrawals of both native CELO and ERC20 tokens (like cUSD)
contract VaultAdapter is Ownable {
    string public name;

    // balances[user][token] = amount
    mapping(address => mapping(address => uint256)) public balances;
    mapping(address => uint256) public totalDeposits;

    event Deposited(address indexed user, address indexed token, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, address indexed token, uint256 amount, uint256 shares);

    constructor(string memory _name) Ownable(msg.sender) {
        name = _name;
    }

    // Deposit tokens and receive shares (1:1)
    function deposit(address user, address token, uint256 amount) external payable returns (uint256 shares) {
        require(amount > 0, "Zero amount");

        if (token == address(0)) {
            require(msg.value == amount, "Native amount mismatch");
        } else {
            require(msg.value == 0, "No native value for ERC20");
            require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        }

        shares = amount; // 1:1 shares
        balances[user][token] += shares;
        totalDeposits[token] += amount;

        emit Deposited(user, token, amount, shares);
        return shares;
    }

    // Withdraw tokens by shares
    function withdraw(address token, uint256 shares) external returns (uint256 amount) {
        require(shares > 0, "Zero shares");
        require(balances[msg.sender][token] >= shares, "Insufficient shares");

        amount = shares; // 1:1
        balances[msg.sender][token] -= shares;
        totalDeposits[token] -= amount;

        if (token == address(0)) {
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success, "Native CELO transfer failed");
        } else {
            require(IERC20(token).transfer(msg.sender, amount), "Transfer failed");
        }

        emit Withdrawn(msg.sender, token, amount, shares);
        return amount;
    }

    // View user balance in underlying token
    function balanceOf(address user, address token) external view returns (uint256) {
        return balances[user][token];
    }

    // Admin: emergency withdraw of a specific token
    function emergencyWithdraw(address token) external onlyOwner {
        if (token == address(0)) {
            uint256 bal = address(this).balance;
            (bool success, ) = owner().call{value: bal}("");
            require(success, "Transfer failed");
        } else {
            uint256 bal = IERC20(token).balanceOf(address(this));
            require(IERC20(token).transfer(owner(), bal), "Transfer failed");
        }
    }

    // Receive raw CELO from splits
    receive() external payable {}
}
