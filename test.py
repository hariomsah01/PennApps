#!/usr/bin/env python3
"""
test.py — LLM-free, filler-free prompt trimming with optional sentence compression.

Pipeline:
1) Query extraction (last question sentence, else first)
2) BM25 sentence relevance (no stoplists)
3) MMR diversity (TF-IDF cosine)
4) Knapsack selection (strict token budget)
5) Auto keyword preservation (unsupervised TF*IDF)
6) Optional spaCy compression: 'readable' or 'telegraphic' (offline)

Examples (Windows):
  py -3 test.py --text "Give a concise history of the USA..." --budget 300 --meta
  py -3 test.py --text "Give a concise history..." --budget 300 --compress telegraphic --meta
  py -3 test.py --input prompt.txt --budget 400 --json
"""

import re
import math
import sys
import json
import argparse
from collections import Counter
from typing import List, Tuple, Dict, Optional

# ---------------------- tiny token utils ----------------------

def _word_tokens(text: str) -> List[str]:
    """Lowercased word tokens (no stoplist)."""
    return [t.lower() for t in re.findall(r"\b[\w']+\b", text)]

def rough_token_count(text: str) -> int:
    """Fast token-ish count: words + punctuation."""
    return max(1, len(re.findall(r"\w+|[^\w\s]", text)))

_SENT_SPLIT = re.compile(r'(?<=[.!?])\s+(?=[A-Z0-9"\')\]])')

def split_sentences(text: str) -> List[str]:
    text = re.sub(r"\s+", " ", text.strip())
    if not text:
        return []
    return [s.strip() for s in re.split(_SENT_SPLIT, text) if s.strip()]

def extract_query(prompt: str) -> str:
    sents = split_sentences(prompt)
    for s in reversed(sents):
        if s.endswith("?"):
            return s
    return sents[0] if sents else prompt

# ---------------------- BM25 ----------------------

def bm25_scores(sentences: List[str], query: str, k1: float = 1.5, b: float = 0.75) -> List[float]:
    docs = [_word_tokens(s) for s in sentences]
    q = Counter(_word_tokens(query))
    N = max(1, len(docs))
    df = Counter()
    for d in docs:
        for w in set(d):
            df[w] += 1
    avgdl = sum(len(d) for d in docs) / N
    scores: List[float] = []
    for d in docs:
        dl = len(d)
        tf = Counter(d)
        score = 0.0
        for w in q:
            n_w = df.get(w, 0)
            if n_w == 0:
                continue
            idf = math.log(1 + (N - n_w + 0.5) / (n_w + 0.5))
            denom = tf[w] + k1 * (1 - b + b * dl / (avgdl or 1.0))
            score += idf * (tf[w] * (k1 + 1) / (denom or 1.0))
        scores.append(score)
    return scores

# ---------------------- TF-IDF + cosine (for MMR) ----------------------

def _tfidf_vectors(sentences: List[str]) -> List[Dict[str, float]]:
    toks = [_word_tokens(s) for s in sentences]
    N = max(1, len(toks))
    df = Counter()
    for t in toks:
        for w in set(t):
            df[w] += 1
    vecs: List[Dict[str, float]] = []
    for t in toks:
        tf = Counter(t)
        v: Dict[str, float] = {}
        L = len(t) or 1
        for w, c in tf.items():
            idf = math.log((N + 1) / (df[w] + 1)) + 1.0
            v[w] = (c / L) * idf
        vecs.append(v)
    return vecs

def _cosine(a: Dict[str, float], b: Dict[str, float]) -> float:
    if not a or not b:
        return 0.0
    common = set(a) & set(b)
    num = sum(a[w] * b[w] for w in common)
    na = math.sqrt(sum(v * v for v in a.values()))
    nb = math.sqrt(sum(v * v for v in b.values()))
    return (num / (na * nb)) if na and nb else 0.0

# ---------------------- MMR ----------------------

def mmr_select(sentences: List[str],
               base_scores: List[float],
               k: int = 10,
               lambda_param: float = 0.6) -> List[int]:
    vecs = _tfidf_vectors(sentences)
    pool = sorted(range(len(sentences)), key=lambda i: base_scores[i], reverse=True)
    chosen: List[int] = []
    while pool and len(chosen) < k:
        if not chosen:
            chosen.append(pool.pop(0))
            continue
        best_i, best_score = None, -1e18
        for i in pool:
            rel = base_scores[i]
            red = max(_cosine(vecs[i], vecs[j]) for j in chosen) if chosen else 0.0
            mmr = lambda_param * rel - (1.0 - lambda_param) * red
            if mmr > best_score:
                best_score, best_i = mmr, i
        chosen.append(best_i)              # type: ignore
        pool.remove(best_i)                # type: ignore
    return chosen

# ---------------------- Knapsack (strict budget) ----------------------

def _knapsack_choose(sentences: List[str], values: List[float], budget_tokens: int) -> List[int]:
    costs = [max(1, rough_token_count(s)) for s in sentences]
    n = len(sentences)
    B = max(1, budget_tokens)

    # safety: avoid huge DP tables
    if B * n > 2_000_000:
        order = sorted(range(n), key=lambda i: (values[i] / costs[i], values[i]), reverse=True)
        chosen, used = [], 0
        for i in order:
            if used + costs[i] <= B:
                chosen.append(i); used += costs[i]
        return sorted(chosen)

    dp = [[0.0] * (B + 1) for _ in range(n + 1)]
    keep = [[False] * (B + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        v, w = values[i - 1], costs[i - 1]
        for b in range(B + 1):
            dp[i][b] = dp[i - 1][b]
            if w <= b and dp[i - 1][b - w] + v > dp[i][b]:
                dp[i][b] = dp[i - 1][b - w] + v
                keep[i][b] = True
    b = B; chosen: List[int] = []
    for i in range(n, 0, -1):
        if keep[i][b]:
            chosen.append(i - 1)
            b -= costs[i - 1]
    return sorted(chosen)

# ---------------------- Auto keyword preservation ----------------------

def _top_keywords(text: str, k: int = 8) -> List[str]:
    sents = split_sentences(text)
    toks = [_word_tokens(s) for s in sents] if sents else [_word_tokens(text)]
    N = max(1, len(toks))
    df = Counter()
    for t in toks:
        for w in set(t):
            df[w] += 1
    tf = Counter(_word_tokens(text))
    scores: Dict[str, float] = {}
    for w, c in tf.items():
        idf = math.log((N + 1) / (1 + df.get(w, 0))) + 1.0
        scores[w] = c * idf
    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return [w for w, _ in ranked[:max(0, k)]]

def _ensure_keywords(original: str, trimmed: str, sentences: List[str], budget: int, topk: int = 8) -> str:
    kws = _top_keywords(original, k=topk)
    missing = [w for w in kws if w not in _word_tokens(trimmed)]
    if not missing:
        return trimmed
    for s in sentences:
        stoks = set(_word_tokens(s))
        if all(w in stoks for w in missing):
            candidate = (trimmed + " " + s).strip()
            if rough_token_count(candidate) <= budget:
                return candidate
    return trimmed

# ---------------------- Optional spaCy compression ----------------------

try:
    import spacy
    _NLP = spacy.load("en_core_web_sm")
except Exception:
    _NLP = None

def compress_text(text: str, mode: str = "telegraphic") -> str:
    """
    Dependency-based sentence compression (offline).
    - Keeps entities, numbers, negations; favors PROPN/NOUN/VERB/ADJ/NUM.
    - Drops auxiliaries/determiners/connectives/punct.
    - 'telegraphic' lemmatizes verbs for extra brevity.
    If spaCy is unavailable, returns the text unchanged (warns once).
    """
    if _NLP is None or not text.strip():
        if _NLP is None and mode != "none":
            sys.stderr.write("[warn] spaCy/en_core_web_sm not available; skipping compression.\n")
        return text

    doc = _NLP(text)
    out_sents = []
    DROP_DEPS = {"aux", "auxpass", "cop", "det", "case", "mark", "punct", "cc", "discourse", "intj"}
    DROP_POS  = {"PRON", "DET", "PART", "SCONJ", "CCONJ", "PUNCT", "SPACE"}

    for sent in doc.sents:
        keep = []
        for t in sent:
            # keep entities & numbers
            if t.ent_type_ or t.like_num:
                keep.append(t.text); continue
            # keep negation (never drop "not"/"no")
            if t.dep_ == "neg" or t.lower_ in {"not", "no"}:
                keep.append(t.text); continue
            # keep core content tokens
            if t.pos_ in {"PROPN", "NOUN", "VERB", "ADJ", "NUM"} and t.dep_ not in DROP_DEPS:
                keep.append(t.lemma_ if (mode == "telegraphic" and t.pos_ == "VERB") else t.text)
                continue
            # drop function-like tokens
            if t.dep_ in DROP_DEPS or t.pos_ in DROP_POS:
                continue
            # fallback: rare leftovers
            keep.append(t.text)

        s = " ".join(keep)
        s = re.sub(r"\s+([.,;:!?])", r"\1", s)
        out_sents.append(s.strip())

    return " ".join(s for s in out_sents if s)

# ---------------------- Public pipeline ----------------------

def trim_prompt(prompt: str,
                token_budget: int = 400,
                mmr_pool: int = 10,
                mmr_lambda: float = 0.6,
                keyword_topk: int = 8) -> Tuple[str, Dict]:
    sents = split_sentences(prompt)
    if not sents:
        return prompt.strip(), {
            "strategy": "bm25+mmr+knapsack",
            "kept": 0,
            "tokens_after": rough_token_count(prompt.strip())
        }

    query = extract_query(prompt)
    bm25 = bm25_scores(sents, query)

    pool_k = min(max(1, mmr_pool), len(sents))
    pool_idx = mmr_select(sents, bm25, k=pool_k, lambda_param=mmr_lambda)
    pool_sents = [sents[i] for i in pool_idx]
    pool_vals  = [bm25[i] for i in pool_idx]

    chosen_idx = _knapsack_choose(pool_sents, pool_vals, token_budget)
    kept_sents = [pool_sents[i] for i in chosen_idx] or [pool_sents[0]]
    out = " ".join(kept_sents)

    out = _ensure_keywords(prompt, out, sents, token_budget, topk=keyword_topk)

    meta = {
        "strategy": "bm25+mmr+knapsack",
        "query": query,
        "pool_size": len(pool_sents),
        "kept": len(kept_sents),
        "tokens_before": rough_token_count(prompt),
        "tokens_after": rough_token_count(out)
    }
    return out, meta

# ---------------------- CLI ----------------------

def _read_input(args: argparse.Namespace) -> str:
    if args.text is not None:
        return args.text
    if args.input and args.input != "-":
        with open(args.input, "r", encoding="utf-8") as f:
            return f.read()
    return sys.stdin.read()

def main():
    ap = argparse.ArgumentParser(description="LLM-free prompt trimming with optional compression")
    src = ap.add_mutually_exclusive_group(required=False)
    src.add_argument("--text", type=str, help="Inline text to trim")
    src.add_argument("--input", type=str, default="-", help="Path to input file (or '-' for stdin)")
    ap.add_argument("--budget", type=int, default=400, help="Token budget (strict cap)")
    ap.add_argument("--pool", type=int, default=10, help="MMR pool size (candidate sentences)")
    ap.add_argument("--mmr", type=float, default=0.6, help="MMR lambda (0..1): higher=relevance, lower=novelty")
    ap.add_argument("--topk", type=int, default=8, help="Top keywords to preserve (auto TF-IDF)")
    ap.add_argument("--compress", choices=["none", "readable", "telegraphic"], default="none",
                    help="Sentence compression (offline spaCy).")
    ap.add_argument("--json", action="store_true", help="Emit JSON (text + meta) to STDOUT")
    ap.add_argument("--meta", action="store_true", help="Print metadata summary to STDERR")
    ap.add_argument("--show-sentences", action="store_true", help="(Debug) print sentences after selection")

    args = ap.parse_args()
    prompt = _read_input(args)

    trimmed, meta = trim_prompt(prompt,
                                token_budget=max(1, args.budget),
                                mmr_pool=max(1, args.pool),
                                mmr_lambda=args.mmr,
                                keyword_topk=max(0, args.topk))

    if args.compress != "none":
        trimmed = compress_text(trimmed, mode=args.compress)
        meta["tokens_after"] = rough_token_count(trimmed)
        meta["compression"] = args.compress

    if args.show_sentences:
        sys.stderr.write("\n-- sentences after selection/compression --\n")
        for s in split_sentences(trimmed):
            sys.stderr.write(f"* {s}\n")

    if args.json:
        print(json.dumps({"optimized": trimmed, "meta": meta}, ensure_ascii=False, indent=2))
        return

    print(trimmed)
    if args.meta:
        sys.stderr.write("\n--- meta ---\n")
        for k, v in meta.items():
            sys.stderr.write(f"{k}: {v}\n")

if __name__ == "__main__":
    main()
