// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IYieldProtocol {
    function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
}

// VaultAdapter
// Handles deposits and withdrawals of both native CELO and ERC20 tokens (like cUSD).
// Now fully integrated with Moola Market for real yield generation.
contract VaultAdapter is Ownable {
    string public name;

    // balances[user][token] = amount (internal tracking for router)
    mapping(address => mapping(address => uint256)) public balances;
    mapping(address => uint256) public totalDeposits;
    
    // Yield configuration
    // token address => Moola Market LendingPool address
    mapping(address => address) public yieldPools;
    
    // Native CELO wrapper for Celo blockchain
    address public constant CELO_ERC20 = 0x471EcE3750Da237f93B8E339c536989b8978a438;

    event Deposited(address indexed user, address indexed token, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, address indexed token, uint256 amount, uint256 shares);
    event YieldPoolConfigured(address indexed token, address indexed pool);

    constructor(string memory _name) Ownable(msg.sender) {
        name = _name;
    }

    /**
     * @notice Set Moola Market pool address for a specific token
     */
    function setYieldPool(address token, address pool) external onlyOwner {
        yieldPools[token] = pool;
        emit YieldPoolConfigured(token, pool);
    }

    // Deposit tokens and receive shares (1:1 mapped to AutoSplitRouter)
    function deposit(address user, address token, uint256 amount) external payable returns (uint256 shares) {
        require(amount > 0, "Zero amount");

        address assetForYield = token;

        if (token == address(0)) {
            require(msg.value == amount, "Native amount mismatch");
            assetForYield = CELO_ERC20; // Native CELO is treated as the ERC20 equivalent on Celo
        } else {
            require(msg.value == 0, "No native value for ERC20");
            require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        }

        // Deposit into yield pool if configured
        address pool = yieldPools[token];
        if (pool != address(0)) {
            IERC20(assetForYield).approve(pool, amount);
            IYieldProtocol(pool).deposit(assetForYield, amount, address(this), 0);
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

        amount = shares; // 1:1 mapping with router's internal accounting
        balances[msg.sender][token] -= shares;
        totalDeposits[token] -= amount;

        address pool = yieldPools[token];
        address assetForYield = token == address(0) ? CELO_ERC20 : token;

        if (pool != address(0)) {
            // Withdraw from Moola Market directly to msg.sender (the router)
            IYieldProtocol(pool).withdraw(assetForYield, amount, msg.sender);
        } else {
            // Not connected to yield pool, send from local balance
            if (token == address(0)) {
                (bool success, ) = msg.sender.call{value: amount}("");
                require(success, "Native CELO transfer failed");
            } else {
                require(IERC20(token).transfer(msg.sender, amount), "Transfer failed");
            }
        }

        emit Withdrawn(msg.sender, token, amount, shares);
        return amount;
    }

    // View user balance in underlying token (principal)
    function balanceOf(address user, address token) external view returns (uint256) {
        return balances[user][token];
    }

    // Admin: emergency withdraw of a specific token (collects accrued yield + idle principal)
    function emergencyWithdraw(address token) external onlyOwner {
        if (token == address(0)) {
            uint256 bal = address(this).balance;
            if (bal > 0) {
                (bool success, ) = owner().call{value: bal}("");
                require(success, "Transfer failed");
            }
        } else {
            uint256 bal = IERC20(token).balanceOf(address(this));
            if (bal > 0) {
                require(IERC20(token).transfer(owner(), bal), "Transfer failed");
            }
        }
    }

    // Receive raw CELO from splits
    receive() external payable {}
}
