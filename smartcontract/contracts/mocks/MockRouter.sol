// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title  MockRouter
 * @notice Test stub that implements the IAutoSplitRouter interface.
 *         Returns a configurable reputationScore for any address.
 *         Used exclusively in DuelManager tests — never deploy to mainnet.
 */
contract MockRouter {
    mapping(address => uint256) private _reputationScores;
    address private _activeVaultAdapter;

    function setReputationScore(address user, uint256 score) external {
        _reputationScores[user] = score;
    }

    function reputationScore(address user) external view returns (uint256) {
        return _reputationScores[user];
    }

    function setActiveVaultAdapter(address adapter) external {
        _activeVaultAdapter = adapter;
    }

    function activeVaultAdapter() external view returns (address) {
        return _activeVaultAdapter;
    }
}
