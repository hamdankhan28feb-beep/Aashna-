// Spell Assist — offline word autocomplete for fingerspelling.
//
// A trie over the vocabulary is built once at module load; prefix lookups
// then run entirely in memory (no network calls, lookups complete in
// microseconds — far under the 50 ms budget).
//
// Ranking combines two signals:
//   score = frequency + letter-practice boost
// - frequency: each word's rank position within its vocabulary category
//   (see data/vocabulary.ts — earlier = more common, normalized to 0–1).
// - letter-practice boost: words containing letters the user has practiced
//   a lot (their SRS letterStats from progressService) score higher, so
//   suggestions personalize to the user's own signing history.
//
// The letter stats are passed in by the caller rather than imported here,
// keeping this module pure and free of the Firebase-backed service.

import { vocabulary } from '../data/vocabulary';

interface TrieNode {
  children: Map<string, TrieNode>;
  /** Set on terminal nodes: the full (lowercase) word. */
  word: string | null;
  /** 0–1, higher = more common (rank within the word's category). */
  freq: number;
}

function createNode(): TrieNode {
  return { children: new Map(), word: null, freq: 0 };
}

function buildTrie(): TrieNode {
  const root = createNode();
  const seen = new Set<string>();
  for (const words of Object.values(vocabulary)) {
    const total = words.length;
    words.forEach((word, index) => {
      const w = word.toLowerCase();
      if (seen.has(w)) return; // defensive: first category wins
      seen.add(w);
      let node = root;
      for (const ch of w) {
        let child = node.children.get(ch);
        if (!child) {
          child = createNode();
          node.children.set(ch, child);
        }
        node = child;
      }
      node.word = w;
      node.freq = 1 - index / total;
    });
  }
  return root;
}

// Built once when the module is first imported.
const root = buildTrie();

// --- Letter-practice boost -------------------------------------------------
//
// Practice volume per letter, capped so a single heavily-drilled letter
// can't dominate; scaled by STATS_WEIGHT so frequency stays the primary
// signal while the user's own history can reorder close candidates.
const ATTEMPT_CAP = 20;
const STATS_WEIGHT = 0.35;

function letterBoost(word: string, letterStats: Record<string, { attempts: number }>): number {
  if (!letterStats) return 0;
  let sum = 0;
  for (const ch of word) {
    sum += Math.min(letterStats[ch.toUpperCase()]?.attempts ?? 0, ATTEMPT_CAP) / ATTEMPT_CAP;
  }
  return (sum / word.length) * STATS_WEIGHT;
}

// --- Suggestions -----------------------------------------------------------

/**
 * Return up to `limit` vocabulary words matching `prefix`, best first.
 *
 * The prefix is matched case-insensitively and must contain letters only —
 * anything else (digits, symbols) yields no suggestions, which keeps the
 * Numbers mode and stray characters from producing word matches.
 */
export function getSuggestions(
  prefix: string,
  letterStats: Record<string, { attempts: number }> = {},
  limit = 3,
): string[] {
  const p = prefix.toLowerCase();
  if (!/^[a-z]+$/.test(p)) return [];

  // Walk the trie down to the prefix node.
  let node = root;
  for (const ch of p) {
    const next = node.children.get(ch);
    if (!next) return [];
    node = next;
  }

  // Collect every word in the prefix's subtree, scored.
  const candidates: { word: string; score: number }[] = [];
  const stack: TrieNode[] = [node];
  while (stack.length > 0) {
    const n = stack.pop()!;
    if (n.word) {
      candidates.push({ word: n.word, score: n.freq + letterBoost(n.word, letterStats) });
    }
    for (const child of n.children.values()) stack.push(child);
  }

  candidates.sort(
    (a, b) =>
      b.score - a.score ||
      a.word.length - b.word.length ||
      a.word.localeCompare(b.word),
  );
  return candidates.slice(0, limit).map((c) => c.word);
}
