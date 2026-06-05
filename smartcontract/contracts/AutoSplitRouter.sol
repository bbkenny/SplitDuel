// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// VaultAdapter interface
interface IVaultAdapter {
    function deposit(address user, address token, uint256 amount) external payable returns (uint256 shares);
    function withdraw(address token, uint256 shares) external returns (uint256 amount);
    function balanceOf(address user, address token) external view returns (uint256);
}

/**
 * @title AutoSplitRouter
 * @notice Elite Treasury Matrix & Yield Router on Celo.
 * Allows teams, DAOs, and gig workers to split incoming revenue instantly among collaborators,
 * while silently diverting a programmed percentage into a yield-generating shared treasury.
 */
contract AutoSplitRouter is ReentrancyGuard {

    struct SplitDestination {
        address recipient;
        uint256 basisPoints; // 10000 = 100%
        bool isVault;       // True = route to the yield-generating shared treasury
    }

    // User-defined split matrix
    mapping(address => SplitDestination[]) public userSplits;
    mapping(address => bool) public vaultAdapters;
    address public activeVaultAdapter; // Primary custody adapter for the Treasury

    // Yield Compounding Treasury Configuration
    uint256 public constant SECONDS_IN_YEAR = 31536000;
    uint256 public apyBasisPoints = 450; // 4.5% APY — governable
    
    // treasuryShares[user][token] => User treasury shares
    mapping(address => mapping(address => uint256)) public treasuryShares;
    mapping(address => uint256) public totalTreasuryShares;
    mapping(address => uint256) public lastSharePriceUpdate;
    mapping(address => uint256) public baseSharePrice; // Base price tracker for tokens

    // Transaction stats
    uint256 public totalTransactions;
    uint256 public totalVolume;

    // Admin Role Flexibility (70% Threshold)
    mapping(address => bool) public isAdmin;
    address[] public adminList;

    struct AdminProposal {
        address target;
        bool isAdd;
        uint256 approvals;
        bool executed;
    }
    
    // proposalId => adminAddress => hasApproved
    mapping(uint256 => mapping(address => bool)) public proposalApprovals;
    
    uint256 public nextProposalId;
    mapping(uint256 => AdminProposal) public proposals;

    uint256 public maxSplits = 10; // Dynamic protocol parameter

    // Events
    event SplitRuleUpdated(address indexed user, address[] recipients, uint256[] basisPoints, bool[] isVault);
    event PaymentRouted(address indexed sender, address token, uint256 amount, address[] recipients, uint256[] amounts);
    event VaultAdapterUpdated(address indexed vault, bool enabled);
    event TreasuryDeposited(address indexed user, address indexed token, uint256 amount, uint256 shares);
    event TreasuryWithdrawn(address indexed user, address indexed token, uint256 amount, uint256 shares);
    event AdminProposalCreated(uint256 indexed proposalId, address indexed target, bool isAdd);
    event AdminProposalApproved(uint256 indexed proposalId, address indexed approver);
    event AdminProposalExecuted(uint256 indexed proposalId, address indexed target, bool isAdd);

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Not an admin");
        _;
    }

    constructor() {
        isAdmin[msg.sender] = true;
        adminList.push(msg.sender);
    }

    // ---------------------------------------------
    // TREASURY INTERNALS (Compound interest simulation)
    // ---------------------------------------------

    /**
     * @notice Get current dynamic share price of underlying treasury vault.
     * Compounds virtually at 4.5% APY based on block timestamp.
     */
    function getCurrentSharePrice(address token) public view returns (uint256) {
        uint256 basePrice = baseSharePrice[token];
        if (basePrice == 0) {
            return 1e18; // Default base price is 1:1 (1e18)
        }
        uint256 lastUpdate = lastSharePriceUpdate[token];
        if (lastUpdate == 0 || block.timestamp <= lastUpdate) {
            return basePrice;
        }
        uint256 elapsed = block.timestamp - lastUpdate;
        uint256 interest = (elapsed * basePrice * apyBasisPoints) / (SECONDS_IN_YEAR * 10000);
        return basePrice + interest;
    }

    function _updateSharePrice(address token) internal {
        uint256 currentPrice = getCurrentSharePrice(token);
        baseSharePrice[token] = currentPrice;
        lastSharePriceUpdate[token] = block.timestamp;
    }

    // ---------------------------------------------
    // SPLIT MATRIX ENGINE
    // ---------------------------------------------

    function setSplitRules(
        address[] calldata recipients,
        uint256[] calldata basisPoints,
        bool[] calldata isVault
    ) external {
        uint256 len = recipients.length;
        require(len == basisPoints.length, "Length mismatch");
        require(len == isVault.length, "Length mismatch");
        require(len > 0, "Empty splits");
        require(len <= maxSplits, "Too many splits");

        uint256 totalBasisPoints;
        for (uint256 i; i < len; i++) {
            totalBasisPoints += basisPoints[i];
        }
        require(totalBasisPoints == 10000, "Must sum to 100%");

        for (uint256 i; i < len; i++) {
            require(basisPoints[i] > 0, "Zero basis points");
            require(recipients[i] != address(0), "Invalid recipient");
            if (isVault[i]) {
                require(vaultAdapters[recipients[i]] || recipients[i] == activeVaultAdapter, "Not an authorized vault");
            }
        }

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

    /**
     * @notice Splits and routes native CELO or ERC20 payments.
     * Portion marked as vault automatically diverts into the shared Treasury.
     */
    function routePayment(
        address token,
        uint256 amount
    ) external payable nonReentrant {
        SplitDestination[] storage splits = userSplits[msg.sender];
        uint256 len = splits.length;
        require(len > 0, "No split rules");
        require(amount > 0, "Zero amount");

        if (token == address(0)) {
            require(msg.value == amount, "Amount mismatch");
        } else {
            require(msg.value == 0, "Native value sent for ERC20");
            require(
                IERC20(token).transferFrom(msg.sender, address(this), amount),
                "Transfer failed"
            );
        }

        totalTransactions++;
        totalVolume += amount;

        uint256 alreadySent;
        address[] memory recipients = new address[](len);
        uint256[] memory amounts = new uint256[](len);

        for (uint256 i; i < len; i++) {
            uint256 splitAmount;
            if (i == len - 1) {
                splitAmount = amount - alreadySent;
            } else {
                splitAmount = (amount * splits[i].basisPoints) / 10000;
                alreadySent += splitAmount;
            }

            recipients[i] = splits[i].recipient;
            amounts[i] = splitAmount;

            if (splits[i].isVault) {
                _depositTreasuryInternal(msg.sender, token, splitAmount);
            } else {
                if (token == address(0)) {
                    (bool success, ) = splits[i].recipient.call{value: splitAmount}("");
                    require(success, "CELO route transfer failed");
                } else {
                    require(
                        IERC20(token).transfer(splits[i].recipient, splitAmount),
                        "ERC20 route transfer failed"
                    );
                }
            }
        }

        emit PaymentRouted(msg.sender, token, amount, recipients, amounts);
    }

    // ---------------------------------------------
    // TREASURY INTERACTIVE FUNCTIONS
    // ---------------------------------------------

    function depositTreasury(address token, uint256 amount) external payable nonReentrant {
        require(amount > 0, "Zero amount");
        if (token == address(0)) {
            require(msg.value == amount, "CELO value mismatch");
        } else {
            require(msg.value == 0, "Native value sent for ERC20");
            require(IERC20(token).transferFrom(msg.sender, address(this), amount), "ERC20 deposit failed");
        }
        _depositTreasuryInternal(msg.sender, token, amount);
    }

    function _depositTreasuryInternal(address user, address token, uint256 amount) internal {
        require(activeVaultAdapter != address(0), "No active vault adapter");
        
        _updateSharePrice(token);
        uint256 price = getCurrentSharePrice(token);
        uint256 shares = (amount * 1e18) / price;

        // Custody deposit: Approve & deposit token into active VaultAdapter
        if (token == address(0)) {
            IVaultAdapter(activeVaultAdapter).deposit{value: amount}(user, address(0), amount);
        } else {
            require(IERC20(token).approve(activeVaultAdapter, amount), "Approve failed");
            IVaultAdapter(activeVaultAdapter).deposit(user, token, amount);
        }

        treasuryShares[user][token] += shares;
        totalTreasuryShares[token] += shares;

        emit TreasuryDeposited(user, token, amount, shares);
    }

    function withdrawTreasury(address token, uint256 amount) external nonReentrant {
        require(amount > 0, "Zero amount");
        require(activeVaultAdapter != address(0), "No active vault");

        uint256 price = getCurrentSharePrice(token);
        uint256 sharesNeeded = (amount * 1e18) / price;
        require(treasuryShares[msg.sender][token] >= sharesNeeded, "Insufficient treasury balance");

        _updateSharePrice(token);

        treasuryShares[msg.sender][token] -= sharesNeeded;
        totalTreasuryShares[token] -= sharesNeeded;

        // Custody withdraw from VaultAdapter
        uint256 withdrawnAmount = IVaultAdapter(activeVaultAdapter).withdraw(token, sharesNeeded);
        require(withdrawnAmount >= amount, "Withdraw amount mismatch");

        if (token == address(0)) {
            (bool success, ) = msg.sender.call{value: withdrawnAmount}("");
            require(success, "CELO withdraw failed");
        } else {
            require(IERC20(token).transfer(msg.sender, withdrawnAmount), "ERC20 withdraw failed");
        }

        emit TreasuryWithdrawn(msg.sender, token, withdrawnAmount, sharesNeeded);
    }

    // ---------------------------------------------
    // HELPERS & GETTERS
    // ---------------------------------------------

    function getTreasuryBalance(address user, address token) external view returns (uint256) {
        uint256 shares = treasuryShares[user][token];
        if (shares == 0) return 0;
        uint256 price = getCurrentSharePrice(token);
        return (shares * price) / 1e18;
    }

    function getSplitRules(address user) external view returns (
        address[] memory recipients,
        uint256[] memory basisPoints,
        bool[] memory isVaultFlags
    ) {
        SplitDestination[] storage splits = userSplits[user];
        uint256 len = splits.length;
        recipients = new address[](len);
        basisPoints = new uint256[](len);
        isVaultFlags = new bool[](len);

        for (uint256 i; i < len; i++) {
            recipients[i] = splits[i].recipient;
            basisPoints[i] = splits[i].basisPoints;
            isVaultFlags[i] = splits[i].isVault;
        }
    }

    // ---------------------------------------------
    // ADMIN FUNCTIONS & MULTI-SIG LOGIC
    // ---------------------------------------------

    function setMaxSplits(uint256 _maxSplits) external onlyAdmin {
        maxSplits = _maxSplits;
    }

    function setVaultAdapter(address vault, bool enabled) external onlyAdmin {
        vaultAdapters[vault] = enabled;
        if (enabled) {
            activeVaultAdapter = vault;
        } else if (activeVaultAdapter == vault) {
            activeVaultAdapter = address(0);
        }
        emit VaultAdapterUpdated(vault, enabled);
    }

    /// @notice Governance: update the virtual APY used in treasury compounding
    function setApyBasisPoints(uint256 _apyBasisPoints) external onlyAdmin {
        apyBasisPoints = _apyBasisPoints;
    }

    // ---------------------------------------------
    // 70% ADMIN THRESHOLD LOGIC
    // ---------------------------------------------

    function proposeAdminChange(address target, bool isAdd) external onlyAdmin {
        require(isAdmin[target] != isAdd, "Target already in desired state");
        
        if (adminList.length == 1) {
            // Immediate execution if only 1 admin exists
            _executeAdminChange(target, isAdd);
            return;
        }

        uint256 proposalId = nextProposalId++;
        AdminProposal storage p = proposals[proposalId];
        p.target = target;
        p.isAdd = isAdd;
        
        proposalApprovals[proposalId][msg.sender] = true;
        p.approvals = 1;
        
        emit AdminProposalCreated(proposalId, target, isAdd);
        emit AdminProposalApproved(proposalId, msg.sender);

        _checkAndExecuteProposal(proposalId);
    }

    function approveAdminChange(uint256 proposalId) external onlyAdmin {
        AdminProposal storage p = proposals[proposalId];
        require(!p.executed, "Already executed");
        require(!proposalApprovals[proposalId][msg.sender], "Already approved");
        require(isAdmin[p.target] != p.isAdd, "Target already in desired state");

        proposalApprovals[proposalId][msg.sender] = true;
        p.approvals++;
        
        emit AdminProposalApproved(proposalId, msg.sender);

        _checkAndExecuteProposal(proposalId);
    }

    function _checkAndExecuteProposal(uint256 proposalId) internal {
        AdminProposal storage p = proposals[proposalId];
        
        // 70% threshold calculation
        uint256 requiredApprovals = (adminList.length * 70 + 99) / 100;
        
        if (p.approvals >= requiredApprovals) {
            p.executed = true;
            _executeAdminChange(p.target, p.isAdd);
            emit AdminProposalExecuted(proposalId, p.target, p.isAdd);
        }
    }

    function _executeAdminChange(address target, bool isAdd) internal {
        if (isAdd) {
            isAdmin[target] = true;
            adminList.push(target);
        } else {
            isAdmin[target] = false;
            for (uint256 i = 0; i < adminList.length; i++) {
                if (adminList[i] == target) {
                    adminList[i] = adminList[adminList.length - 1];
                    adminList.pop();
                    break;
                }
            }
        }
    }

    receive() external payable {
        // Fallback for native splits / deposits
    }
}
