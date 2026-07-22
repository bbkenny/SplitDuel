import { parseAbi } from 'viem';

// ── DuelManager — 1v1 tactical yield-battle engine (Celo mainnet) ───────────
// Deployed contract that powers the 5-round commit-reveal duel described in the
// game design spec. Distinct from SplitPool (the daily tournament engine).
export const DUEL_MANAGER_ADDRESS = '0xb564244275a393567dECede23cfB2fB3424AFc0F' as const;

// Native CELO is represented on-chain as the zero address.
export const NATIVE_CELO = '0x0000000000000000000000000000000000000000' as const;

// Duel lifecycle states — mirrors the Solidity `DuelState` enum ordering.
export enum DuelState {
  Open = 0,
  Active = 1,
  Resolved = 2,
  Cancelled = 3,
}

// Reveal window (seconds) both players get once BOTH have committed a round.
export const REVEAL_WINDOW = 60;

// Total rounds per duel.
export const TOTAL_ROUNDS = 5;

export const DUEL_MANAGER_ABI = parseAbi([
  // ── Writes ────────────────────────────────────────────────────────────────
  'function createDuel(address token, uint256 stake) external payable returns (uint256)',
  'function joinDuel(uint256 duelId) external payable',
  'function commitRound(uint256 duelId, bytes32 commitHash) external',
  'function revealRound(uint256 duelId, uint8 attackPct, uint8 defendPct, uint8 investPct, bytes32 salt) external',
  'function forfeitRound(uint256 duelId) external',
  'function cancelDuel(uint256 duelId) external',

  // ── Reads ─────────────────────────────────────────────────────────────────
  'function nextDuelId() external view returns (uint256)',
  'function activeDuel(address player) external view returns (uint256)',
  'function getPrizePool(address token) external view returns (uint256)',
  'function REVEAL_WINDOW() external view returns (uint256)',
  'function duels(uint256 duelId) external view returns (address player1, address player2, address token, uint256 stakePerPlayer, uint256 startTime, uint8 currentRound, uint256 p1YieldScore, uint256 p2YieldScore, uint256 p1Shield, uint256 p2Shield, uint8 state)',
  'function duelRounds(uint256 duelId, uint8 round) external view returns (bytes32 p1Commit, bytes32 p2Commit, uint256 bothCommittedAt, bool p1Revealed, bool p2Revealed, uint8 p1Attack, uint8 p1Defend, uint8 p1Invest, uint8 p2Attack, uint8 p2Defend, uint8 p2Invest)',

  // ── Events ──────────────────────────────────────────────────────────────────
  'event DuelCreated(uint256 indexed duelId, address indexed creator, address token, uint256 stake)',
  'event DuelJoined(uint256 indexed duelId, address indexed joiner)',
  'event RoundCommitted(uint256 indexed duelId, uint8 round, address player)',
  'event RoundRevealed(uint256 indexed duelId, uint8 round, address player)',
  'event RoundResolved(uint256 indexed duelId, uint8 round, uint256 p1Score, uint256 p2Score)',
  'event RoundForfeited(uint256 indexed duelId, uint8 round, address indexed forfeiter)',
  'event DuelResolved(uint256 indexed duelId, address indexed winner, uint256 yieldWon)',
  'event DuelCancelled(uint256 indexed duelId)',
]);

// Minimal ERC-20 surface needed to stake a non-native token into a duel.
export const ERC20_ABI = parseAbi([
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
]);
