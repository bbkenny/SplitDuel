import { keccak256, encodePacked, type Address, type Hex } from 'viem';

// ── Commit-reveal helpers ───────────────────────────────────────────────────
// The DuelManager expects:
//   commitHash = keccak256(abi.encodePacked(attackPct, defendPct, investPct, salt, msg.sender))
// with attack/defend/invest as uint8, salt as bytes32, and msg.sender as address.
// We must reproduce that exact packing client-side so the later reveal matches.

export interface RoundAllocation {
  attack: number;
  defend: number;
  invest: number;
}

export interface StoredCommit extends RoundAllocation {
  salt: Hex;
}

/** Generate a cryptographically-random 32-byte salt as a 0x-prefixed hex string. */
export function generateSalt(): Hex {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let hex = '0x';
  for (const b of bytes) hex += b.toString(16).padStart(2, '0');
  return hex as Hex;
}

/** Compute the on-chain commit hash for a round allocation. */
export function computeCommitHash(
  { attack, defend, invest }: RoundAllocation,
  salt: Hex,
  player: Address,
): Hex {
  return keccak256(
    encodePacked(
      ['uint8', 'uint8', 'uint8', 'bytes32', 'address'],
      [attack, defend, invest, salt, player],
    ),
  );
}

// ── Local persistence ───────────────────────────────────────────────────────
// The salt + plaintext split must survive a page refresh between the commit and
// the reveal, so we stash them in localStorage keyed by duel/round/player.
const storageKey = (duelId: bigint | number, round: number, player: Address) =>
  `splitduel:commit:${duelId.toString()}:${round}:${player.toLowerCase()}`;

export function saveCommit(
  duelId: bigint | number,
  round: number,
  player: Address,
  data: StoredCommit,
): void {
  try {
    localStorage.setItem(storageKey(duelId, round, player), JSON.stringify(data));
  } catch {
    // Storage may be unavailable (private mode / quota) — reveal will simply
    // require re-entering the split manually in that case.
  }
}

export function loadCommit(
  duelId: bigint | number,
  round: number,
  player: Address,
): StoredCommit | null {
  try {
    const raw = localStorage.getItem(storageKey(duelId, round, player));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.attack === 'number' &&
      typeof parsed?.defend === 'number' &&
      typeof parsed?.invest === 'number' &&
      typeof parsed?.salt === 'string'
    ) {
      return parsed as StoredCommit;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearCommit(
  duelId: bigint | number,
  round: number,
  player: Address,
): void {
  try {
    localStorage.removeItem(storageKey(duelId, round, player));
  } catch {
    /* no-op */
  }
}
