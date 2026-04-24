// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// AutoSplitRouter
// Payment routing miniapp - splits stablecoin payments automatically
// One transaction -> multiple financial outcomes
contract AutoSplitRouter is Ownable {
    // Split destination configuration

    constructor() Ownable(msg.sender) {
    }
    struct SplitDestination {
        address recipient;
        uint256 basisPoints; // 10000 = 100%
        bool isVault;       // True = route to vault adapter
    }

    // User-defined split rules
    mapping(address => SplitDestination[]) public userSplits;
    mapping(address => bool) public vaultAdapters;

    // Transaction tracking
    uint256 public totalTransactions;
    uint256 public totalVolume;

    // Events
    event SplitRuleUpdated(
        address indexed user,
        address[] recipients,
        uint256[] basisPoints,
        bool[] isVault
    );
    event PaymentRouted(
        address indexed sender,
        address token,
        uint256 amount,
        address[] recipients,
        uint256[] amounts
    );
    event VaultAdapterUpdated(
        address indexed vault,
        bool enabled
    );

    // Set multiple split destinations for caller
    function setSplitRules(
        address[] calldata recipients,
        uint256[] calldata basisPoints,
        bool[] calldata isVault
    ) external {
        require(recipients.length == basisPoints.length, "Length mismatch");
        require(recipients.length == isVault.length, "Length mismatch");
        require(recipients.length > 0, "Empty splits");
        require(recipients.length <= 10, "Too many splits"); // Gas limit

        uint256 totalBasisPoints;
        for (uint256 i; i < basisPoints.length; i++) {
            require(basisPoints[i] > 0, "Zero basis points");
            require(recipients[i] != address(0), "Invalid recipient");
            // If vault, check it's registered
            if (isVault[i]) {
                require(vaultAdapters[recipients[i]], "Not a vault adapter");
            }
            totalBasisPoints += basisPoints[i];
        }
        require(totalBasisPoints == 10000, "Must sum to 100%"); // 10000 = 100%

        // Clear old and set new
        delete userSplits[msg.sender];
        for (uint256 i; i < recipients.length; i++) {
            userSplits[msg.sender].push(SplitDestination({
                recipient: recipients[i],
                basisPoints: basisPoints[i],
                isVault: isVault[i]
            }));
        }

        emit SplitRuleUpdated(msg.sender, recipients, basisPoints, isVault);
    }

    // Execute split payment (caller must approve token first)
    function routePayment(
        address token,
        uint256 amount
    ) external {
        SplitDestination[] memory splits = userSplits[msg.sender];
        require(splits.length > 0, "No split rules");
        require(amount > 0, "Zero amount");

        // Pull tokens from sender
        uint256 balanceBefore = IERC20(token).balanceOf(address(this));
        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        uint256 balanceAfter = IERC20(token).balanceOf(address(this));
        uint256 actualAmount = balanceAfter - balanceBefore;

        address[] memory recipients = new address[](splits.length);
        uint256[] memory amounts = new uint256[](splits.length);

        // Distribute to each destination
        for (uint256 i; i < splits.length; i++) {
            uint256 splitAmount = (actualAmount * splits[i].basisPoints) / 10000;
            // Last recipient gets remainder to avoid dust
            if (i == splits.length - 1) {
                uint256 alreadySent;
                for (uint256 j; j < i; j++) {
                    alreadySent += amounts[j];
                }
                splitAmount = actualAmount - alreadySent;
            }

            recipients[i] = splits[i].recipient;
            amounts[i] = splitAmount;

            if (splits[i].isVault) {
                // Route to vault adapter
                require(
                    IERC20(token).approve(splits[i].recipient, splitAmount),
                    "Vault approve failed"
                );
                // Vault adapter expected interface: deposit(address,uint256)
                (bool vaultSuccess, ) = splits[i].recipient.call(
                    abi.encodeWithSelector(
                        0xb6b55f25, // deposit(address,uint256) selector
                        msg.sender,
                        splitAmount
                    )
                );
                require(vaultSuccess, "Vault deposit failed");
            } else {
                // Direct transfer
                require(
                    IERC20(token).transfer(splits[i].recipient, splitAmount),
                    "Transfer failed"
                );
            }
        }

        totalTransactions++;
        totalVolume += actualAmount;

        emit PaymentRouted(msg.sender, token, actualAmount, recipients, amounts);
    }

    // Admin: register vault adapter
    function setVaultAdapter(address vault, bool enabled) external onlyOwner {
        vaultAdapters[vault] = enabled;
        emit VaultAdapterUpdated(vault, enabled);
    }

    // View helpers
    function getSplitRules(address user) external view returns (
        address[] memory recipients,
        uint256[] memory basisPoints,
        bool[] memory isVault
    ) {
        SplitDestination[] memory splits = userSplits[user];
        recipients = new address[](splits.length);
        basisPoints = new uint256[](splits.length);
        isVault = new bool[](splits.length);

        for (uint256 i; i < splits.length; i++) {
            recipients[i] = splits[i].recipient;
            basisPoints[i] = splits[i].basisPoints;
            isVault[i] = splits[i].isVault;
        }
    }

    // Prevent accidental ETH sends
    receive() external payable {
        revert("Use ERC20 tokens for splits");
    }
}
