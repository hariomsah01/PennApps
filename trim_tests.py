#!/usr/bin/env python3
# trim_tests.py — batch tests for test.py (BM25+MMR+Knapsack + spaCy compression)

import os, re, importlib.util, textwrap

HERE = os.path.dirname(os.path.abspath(__file__))
TEST_PATH = os.path.join(HERE, "test.py")

# Load your test.py as a module (avoid name clash with stdlib 'test')
spec = importlib.util.spec_from_file_location("eco_trim_module", TEST_PATH)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)  # type: ignore

trim_prompt      = mod.trim_prompt
compress_text    = getattr(mod, "compress_text", None)
rough_token_count= mod.rough_token_count

def contains(word, text):
    return re.search(rf"\b{re.escape(word.lower())}\b", text.lower()) is not None

def run_case(name, text, must_have=(), must_keep_not=False, expect_drop=False, budget=400):
    original_tokens = rough_token_count(text)
    trimmed, meta = trim_prompt(text, token_budget=budget)

    # Use telegraphic compression if available
    out = compress_text(trimmed, "telegraphic") if callable(compress_text) else trimmed
    after_tokens = rough_token_count(out)

    ok = True
    reasons = []

    if must_keep_not:
        if not re.search(r"\bnot\b", out.lower()):
            ok = False
            reasons.append("negation 'not' missing")

    for w in must_have:
        if not contains(w, out):
            ok = False
            reasons.append(f"missing keyword '{w}'")

    if expect_drop and after_tokens >= original_tokens:
        # not fatal, but warn if no shrink happened
        reasons.append(f"no token drop (before={original_tokens}, after={after_tokens})")

    status = "PASS" if ok else "FAIL"
    print(f"[{status}] {name}")
    print(f"  in : {textwrap.shorten(text, 140)}")
    print(f"  out: {out}")
    print(f"  tokens: {original_tokens} -> {after_tokens}")
    if reasons:
        print("  notes:", "; ".join(reasons))
    print()

# ------------------------ TEST SUITE ------------------------

CASES = [
    # Polite / redundant phrasing
    ("Polite: French Revolution",
     "Hi, could you please provide me with a comprehensive summary of the French Revolution?",
     ("French","Revolution","summary"), False, True),
    ("Polite: ML process",
     "I was wondering if you could explain the process of machine learning to me.",
     ("explain","machine","learning"), False, True),
    ("Polite: weather today",
     "Can you kindly tell me what the weather is like today?",
     ("weather","today"), False, True),
    ("Polite: blockchain",
     "Would you be so kind as to let me know how blockchain works?",
     ("blockchain",), False, True),

    # Stop-words & intensifiers
    ("Intensifiers 1",
     "This is just really extremely important to me, so kindly explain it very thoroughly.",
     ("important","explain"), False, True),
    ("Intensifiers 2",
     "Actually, I basically just wanted to ask you something simple.",
     ("ask","simple"), False, True),
    ("Intensifiers 3",
     "Please tell me kindly and really clearly what the answer is.",
     ("answer","clearly"), False, True),

    # Articles / pronouns
    ("Articles 1",
     "Explain the process in detail.",
     ("explain","process","detail"), False, True),
    ("Articles 2",
     "Give me a summary of the book.",
     ("summary","book"), False, True),
    ("Articles 3",
     "That is the thing I want to know.",
     ("want","know"), False, True),

    # Passive voice
    ("Passive 1",
     "It is requested that you provide the report by tomorrow.",
     ("provide","report","tomorrow"), False, True),
    ("Passive 2",
     "It is required that you submit the form.",
     ("submit","form"), False, True),
    ("Passive 3",
     "It is asked that you explain the solution step by step.",
     ("explain","solution"), False, True),

    # Verbose phrases
    ("Verbose 1",
     "We need to act in order to prevent climate change.",
     ("act","prevent","climate","change"), False, True),
    ("Verbose 2",
     "Please provide a comprehensive explanation of quantum entanglement.",
     ("provide","explanation","quantum","entanglement"), False, True),
    ("Verbose 3",
     "Send me the files as soon as possible.",
     ("send","files"), False, True),

    # Compound / structured
    ("Compound 1",
     "Can you give me a comprehensive summary of the book along with its key themes and main characters?",
     ("summary","book","themes","characters"), False, True),
    ("Compound 2",
     "Please explain Newton's laws together with examples and also the historical background.",
     ("explain","newton","laws","examples","historical","background"), False, True),
    ("Compound 3",
     "Summarize the article along with its strengths and weaknesses, and also mention the conclusion.",
     ("summarize","article","strengths","weaknesses","conclusion"), False, True),

    # Keyword extraction stress test
    ("Keywords 1",
     "Describe the economic impacts of climate change on developing countries.",
     ("economic","impacts","climate","change","developing","countries"), False, True),
    ("Keywords 2",
     "What are the possible solutions to global poverty in order to improve sustainability and long-term growth?",
     ("solutions","global","poverty","sustainability","growth"), False, True),
    ("Keywords 3",
     "Tell me kindly, really clearly, the very detailed explanation of the complicated blockchain technology process in order to understand it better as soon as possible.",
     ("explanation","blockchain","technology","process"), False, True),

    # Edge / corner cases
    ("Negation 1",
     "Do not delete these important records.",
     ("delete","records"), True, False),
    ("Negation 2",
     "I am not sure whether the answer is correct.",
     ("answer","correct"), True, False),
    ("Short command 1",
     "Summarize this.",
     ("summarize",), False, False),
    ("Short command 2",
     "Explain.",
     ("explain",), False, False),
    ("Weird casing",
     "PLEASE, could you REALLY, REALLY explain!!!",
     ("explain",), False, True),
    ("Mixed polite+passive+verbose",
     "Hi there, it is requested that you kindly provide me with a very detailed and comprehensive explanation of how AI works, along with examples and also challenges.",
     ("explanation","ai","works","examples","challenges"), False, True),
]

if __name__ == "__main__":
    # Ensure the user actually updated test.py to include compress_text
    if not callable(compress_text):
        print("[warn] test.py has no compress_text(); tests will run without compression (less shrink visible).")
        print("       Make sure you pasted the final script with --compress support.\n")

    for (name, text, must, keep_not, drop) in CASES:
        run_case(name, text, must_have=must, must_keep_not=keep_not, expect_drop=drop, budget=400)
