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
 * @notice Elite Mobile Credit Union & Autonomous Yield Router on Celo.
 * Allows users to split payments, route portions to direct recipients,
 * auto-deposit splits to compound interest vaults, farm financial reputation scores,
 * and borrow under-collateralized micro-loans.
 */
contract AutoSplitRouter is Ownable, ReentrancyGuard {

    struct SplitDestination {
        address recipient;
        uint256 basisPoints; // 10000 = 100%
        bool isVault;       // True = route to yield vault
    }

    struct Loan {
        uint256 id;
        address borrower;
        address token;
        uint256 principal;
        uint256 interest;   // Accrued interest fee
        uint256 borrowedAt;
        bool repaid;
    }

    // User-defined split rules
    mapping(address => SplitDestination[]) public userSplits;
    mapping(address => bool) public vaultAdapters;
    address public activeVaultAdapter; // Primary custody adapter

    // Yield Compounding Vault Configuration
    uint256 public constant SECONDS_IN_YEAR = 31536000;
    uint256 public apyBasisPoints = 450;        // 4.5% APY — governable
    uint256 public loanInterestBps = 200;       // 2% loan interest fee — governable
    uint256 public creditMultiplier = 2;        // Credit limit = score * multiplier tokens — governable
    
    // savingsShares[user][token] => User savings shares in vault
    mapping(address => mapping(address => uint256)) public savingsShares;
    mapping(address => uint256) public totalSavingsShares;
    mapping(address => uint256) public lastSharePriceUpdate;
    mapping(address => uint256) public baseSharePrice; // Base price tracker for tokens

    // Reputation Credit Ledger
    mapping(address => uint256) public savingsReputation;
    mapping(address => mapping(address => uint256)) public borrowedBalance;
    mapping(address => uint256[]) public userLoans;
    mapping(uint256 => Loan) public loans;
    uint256 public nextLoanId = 1;

    // Transaction stats
    uint256 public totalTransactions;
    uint256 public totalVolume;

    // Events
    event SplitRuleUpdated(address indexed user, address[] recipients, uint256[] basisPoints, bool[] isVault);
    event PaymentRouted(address indexed sender, address token, uint256 amount, address[] recipients, uint256[] amounts);
    event VaultAdapterUpdated(address indexed vault, bool enabled);
    event SavingsDeposited(address indexed user, address indexed token, uint256 amount, uint256 shares);
    event SavingsWithdrawn(address indexed user, address indexed token, uint256 amount, uint256 shares);
    event MicroLoanRequested(uint256 indexed loanId, address indexed borrower, address indexed token, uint256 principal);
    event MicroLoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 repayAmount);
    event ReputationBoosted(address indexed user, uint256 amount, string reason);

    constructor() Ownable(msg.sender) {}

    // ---------------------------------------------
    // VAULT INTERNALS (Compound interest simulation)
    // ---------------------------------------------

    /**
     * @notice Get current dynamic share price of underlying savings vault.
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
        require(len <= 10, "Too many splits");

        // Sum and validate total basis points first for test compatibility
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
     * @notice Splits and routes native CELO or ERC20 (cUSD) payments.
     * Portion marked as vault goes into the compound yield vault for user.
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

        // Mint reputation: 1 point per 1 whole unit (1e18) split
        uint256 reputationEarned = amount / 1e18;
        if (reputationEarned > 0) {
            savingsReputation[msg.sender] += reputationEarned;
            emit ReputationBoosted(msg.sender, reputationEarned, "payment_routing");
        }

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
                _depositSavingsInternal(msg.sender, token, splitAmount);
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
    // VAULT INTERACTIVE FUNCTIONS
    // ---------------------------------------------

    function depositSavings(address token, uint256 amount) external payable nonReentrant {
        require(amount > 0, "Zero amount");
        if (token == address(0)) {
            require(msg.value == amount, "CELO value mismatch");
        } else {
            require(msg.value == 0, "Native value sent for ERC20");
            require(IERC20(token).transferFrom(msg.sender, address(this), amount), "ERC20 deposit failed");
        }
        _depositSavingsInternal(msg.sender, token, amount);
    }

    function _depositSavingsInternal(address user, address token, uint256 amount) internal {
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

        savingsShares[user][token] += shares;
        totalSavingsShares[token] += shares;

        // Direct deposit boosts credit reputation even faster (5 points per unit)
        uint256 reputationEarned = (amount * 5) / 1e18;
        if (reputationEarned > 0) {
            savingsReputation[user] += reputationEarned;
            emit ReputationBoosted(user, reputationEarned, "vault_savings");
        }

        emit SavingsDeposited(user, token, amount, shares);
    }

    function withdrawSavings(address token, uint256 amount) external nonReentrant {
        require(amount > 0, "Zero amount");
        require(activeVaultAdapter != address(0), "No active vault");

        uint256 price = getCurrentSharePrice(token);
        uint256 sharesNeeded = (amount * 1e18) / price;
        require(savingsShares[msg.sender][token] >= sharesNeeded, "Insufficient savings balance");

        _updateSharePrice(token);

        savingsShares[msg.sender][token] -= sharesNeeded;
        totalSavingsShares[token] -= sharesNeeded;

        // Custody withdraw from VaultAdapter
        uint256 withdrawnAmount = IVaultAdapter(activeVaultAdapter).withdraw(token, sharesNeeded);
        require(withdrawnAmount >= amount, "Withdraw amount mismatch");

        if (token == address(0)) {
            (bool success, ) = msg.sender.call{value: withdrawnAmount}("");
            require(success, "CELO withdraw failed");
        } else {
            require(IERC20(token).transfer(msg.sender, withdrawnAmount), "ERC20 withdraw failed");
        }

        emit SavingsWithdrawn(msg.sender, token, withdrawnAmount, sharesNeeded);
    }

    // ---------------------------------------------
    // MICRO-CREDIT LENDING ENGINE
    // ---------------------------------------------

    function getUserReputation(address user) public view returns (uint256) {
        return savingsReputation[user];
    }

    function getCreditLimit(address user, address /* token */) public view returns (uint256) {
        // Credit limit: creditMultiplier tokens per reputation point
        return getUserReputation(user) * creditMultiplier * 1e18;
    }

    function requestMicroLoan(uint256 loanAmount, address token) external nonReentrant {
        require(loanAmount > 0, "Zero amount");
        uint256 limit = getCreditLimit(msg.sender, token);
        require(borrowedBalance[msg.sender][token] + loanAmount <= limit, "Exceeds credit limit");
        require(activeVaultAdapter != address(0), "No active vault");

        // Configurable interest fee (governance-controlled via loanInterestBps)
        uint256 interest = (loanAmount * loanInterestBps) / 10000;

        // Pull liquidity from VaultAdapter
        uint256 price = getCurrentSharePrice(token);
        uint256 sharesNeeded = (loanAmount * 1e18) / price;
        uint256 withdrawnAmount = IVaultAdapter(activeVaultAdapter).withdraw(token, sharesNeeded);
        require(withdrawnAmount >= loanAmount, "Withdraw liquidity failed");

        borrowedBalance[msg.sender][token] += loanAmount;

        uint256 loanId = nextLoanId++;
        loans[loanId] = Loan({
            id: loanId,
            borrower: msg.sender,
            token: token,
            principal: loanAmount,
            interest: interest,
            borrowedAt: block.timestamp,
            repaid: false
        });
        userLoans[msg.sender].push(loanId);

        if (token == address(0)) {
            (bool success, ) = msg.sender.call{value: loanAmount}("");
            require(success, "CELO loan transfer failed");
        } else {
            require(IERC20(token).transfer(msg.sender, loanAmount), "ERC20 loan transfer failed");
        }

        emit MicroLoanRequested(loanId, msg.sender, token, loanAmount);
    }

    function repayLoan(uint256 loanId, uint256 amount) external payable nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.borrower == msg.sender, "Not your loan");
        require(!loan.repaid, "Already repaid");

        uint256 totalRepayNeeded = loan.principal + loan.interest;
        require(amount >= totalRepayNeeded, "Repayment amount insufficient");

        if (loan.token == address(0)) {
            require(msg.value == amount, "CELO repayment mismatch");
        } else {
            require(msg.value == 0, "Native value sent for ERC20");
            require(IERC20(loan.token).transferFrom(msg.sender, address(this), amount), "ERC20 repayment failed");
        }

        // Return repaid tokens back to active VaultAdapter
        if (loan.token == address(0)) {
            IVaultAdapter(activeVaultAdapter).deposit{value: amount}(msg.sender, address(0), amount);
        } else {
            require(IERC20(loan.token).approve(activeVaultAdapter, amount), "Repayment approve failed");
            IVaultAdapter(activeVaultAdapter).deposit(msg.sender, loan.token, amount);
        }

        loan.repaid = true;
        borrowedBalance[msg.sender][loan.token] -= loan.principal;

        // Microfinance boost: Timely repayment awards a huge credit rating boost (+15 points)
        savingsReputation[msg.sender] += 15;
        emit ReputationBoosted(msg.sender, 15, "loan_repay");

        emit MicroLoanRepaid(loanId, msg.sender, amount);
    }

    // ---------------------------------------------
    // HELPERS & GETTERS
    // ---------------------------------------------

    function getSavingsBalance(address user, address token) external view returns (uint256) {
        uint256 shares = savingsShares[user][token];
        if (shares == 0) return 0;
        uint256 price = getCurrentSharePrice(token);
        return (shares * price) / 1e18;
    }

    function getUserLoans(address user) external view returns (uint256[] memory) {
        return userLoans[user];
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
    // ADMIN FUNCTIONS
    // ---------------------------------------------

    function setVaultAdapter(address vault, bool enabled) external onlyOwner {
        vaultAdapters[vault] = enabled;
        if (enabled) {
            activeVaultAdapter = vault;
        } else if (activeVaultAdapter == vault) {
            activeVaultAdapter = address(0);
        }
        emit VaultAdapterUpdated(vault, enabled);
    }

    /// @notice Governance: update the virtual APY used in savings compounding
    function setApyBasisPoints(uint256 _apyBasisPoints) external onlyOwner {
        apyBasisPoints = _apyBasisPoints;
    }

    /// @notice Governance: update the loan interest fee in basis points
    function setLoanInterestBps(uint256 _loanInterestBps) external onlyOwner {
        require(_loanInterestBps <= 3000, "Max 30% interest"); // Safety cap
        loanInterestBps = _loanInterestBps;
    }

    /// @notice Governance: update credit limit multiplier (tokens per reputation point)
    function setCreditMultiplier(uint256 _creditMultiplier) external onlyOwner {
        require(_creditMultiplier > 0, "Multiplier must be > 0");
        creditMultiplier = _creditMultiplier;
    }

    receive() external payable {
        // Fallback for native splits / deposits
    }
}
