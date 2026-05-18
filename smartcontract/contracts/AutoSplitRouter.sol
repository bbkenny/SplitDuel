// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// AutoSplitRouter
// Payment routing miniapp - splits stablecoin & native CELO payments automatically
// One transaction -> multiple financial outcomes
contract AutoSplitRouter is Ownable, ReentrancyGuard {

    constructor() Ownable(msg.sender) {}

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
        uint256 len = recipients.length;
        require(len == basisPoints.length, "Length mismatch");
        require(len == isVault.length, "Length mismatch");
        require(len > 0, "Empty splits");
        require(len <= 10, "Too many splits"); // Gas limit

        uint256 totalBasisPoints;
        for (uint256 i; i < len; i++) {
            require(basisPoints[i] > 0, "Zero basis points");
            require(recipients[i] != address(0), "Invalid recipient");
            if (isVault[i]) {
                require(vaultAdapters[recipients[i]], "Not a vault adapter");
            }
            totalBasisPoints += basisPoints[i];
        }
        require(totalBasisPoints == 10000, "Must sum to 100%"); 

        delete userSplits[msg.sender];
        for (uint256 i; i < len; i++) {
            userSplits[msg.sender].push(SplitDestination({
                recipient: recipients[i],
                basisPoints: basisPoints[i],
                isVault: isVault[i]
            }));
        }

        emit SplitRuleUpdated(msg.sender, recipients, basisPoints, isVault);
    }

    // Execute split payment
    function routePayment(
        address token,
        uint256 amount
    ) external payable nonReentrant {
        SplitDestination[] storage splits = userSplits[msg.sender];
        uint256 len = splits.length;
        require(len > 0, "No split rules");
        require(amount > 0, "Zero amount");

        if (token == address(0)) {
            require(msg.value == amount, "Amount mismatch with msg.value");
        } else {
            require(msg.value == 0, "Do not send native CELO for ERC20 splits");
            require(
                IERC20(token).transferFrom(msg.sender, address(this), amount),
                "Transfer failed"
            );
        }
        
        uint256 actualAmount = amount;
        address[] memory recipients = new address[](len);
        uint256[] memory amounts = new uint256[](len);

        totalTransactions++;
        totalVolume += actualAmount;

        // Distribute to each destination
        uint256 alreadySent;
        for (uint256 i; i < len; i++) {
            uint256 splitAmount;
            
            if (i == len - 1) {
                splitAmount = actualAmount - alreadySent;
            } else {
                splitAmount = (actualAmount * splits[i].basisPoints) / 10000;
                alreadySent += splitAmount;
            }

            recipients[i] = splits[i].recipient;
            amounts[i] = splitAmount;

            if (splits[i].isVault) {
                if (token == address(0)) {
                    // Send native CELO to VaultAdapter
                    (bool vaultSuccess, ) = splits[i].recipient.call{value: splitAmount}(
                        abi.encodeWithSignature(
                            "deposit(address,address,uint256)",
                            msg.sender,
                            address(0),
                            splitAmount
                        )
                    );
                    require(vaultSuccess, "Vault native deposit failed");
                } else {
                    require(
                        IERC20(token).approve(splits[i].recipient, splitAmount),
                        "Vault approve failed"
                    );
                    (bool vaultSuccess, ) = splits[i].recipient.call(
                        abi.encodeWithSignature(
                            "deposit(address,address,uint256)",
                            msg.sender,
                            token,
                            splitAmount
                        )
                    );
                    require(vaultSuccess, "Vault deposit failed");
                }
            } else {
                if (token == address(0)) {
                    (bool success, ) = splits[i].recipient.call{value: splitAmount}("");
                    require(success, "Native CELO transfer failed");
                } else {
                    require(
                        IERC20(token).transfer(splits[i].recipient, splitAmount),
                        "Transfer failed"
                    );
                }
            }
        }

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
        SplitDestination[] storage splits = userSplits[user];
        uint256 len = splits.length;
        recipients = new address[](len);
        basisPoints = new uint256[](len);
        isVault = new bool[](len);

        for (uint256 i; i < len; i++) {
            recipients[i] = splits[i].recipient;
            basisPoints[i] = splits[i].basisPoints;
            isVault[i] = splits[i].isVault;
        }
    }

    // Revert direct native sends to prevent user errors (must go through routePayment)
    receive() external payable {
        revert("Use routePayment for splits");
    }
}
