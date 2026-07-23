import json
import re
from groq import Groq
from shared_config import GROQ_KEY, AnalyzerOutput

client = Groq(api_key=GROQ_KEY)

SYSTEM_PROMPT = """
You are an expert prompt classifier. Given the user's prompt, return ONLY valid JSON:

{
  "complexity": "simple" | "medium" | "complex",
  "segments": [
    {"text": "<verbatim slice of the prompt for this task>",
     "type": "creative" | "math" | "general" | "coding"}
  ]
}

TYPE DEFINITIONS — apply strictly:
- coding   : Writing/debugging actual code, functions, scripts, programs in any language.
             Keywords: "write in Python", "implement", "code", "function", "program", "script",
             "debug", "SQL", "HTML", "CSS", "JavaScript", "Java", "C++", "React", "Flask".
             A creative story that MENTIONS a theorem or language is NOT coding.
- math     : Formal proofs, derivations, integrals, theorems, Big-O theory, statistics theory.
             "Prove that", "derive", "integral of", "solve the equation", "theorem".
- creative : Stories, poems, fiction, imaginative writing, roleplay, metaphors, haiku.
             "Write a story", "write a poem", "creative writing", "imagine", "roleplay".
- general  : Factual Q&A, definitions, explanations, summaries, conversational.

COMPLEXITY:
- simple  : One short single-step task, basic fact.
- medium  : Multi-step or one non-trivial task.
- complex : Multiple hard tasks, deep research, or long multi-part work.

SEGMENTATION RULES — these are mandatory:
1. If the user asks for MORE THAN ONE TYPE of task, you MUST return multiple segments.
2. Never merge a creative task and a math task into one segment.
3. Never merge a coding task and an explanation into one segment.
4. Use clause boundaries ("and", "also", "then", ",") to detect separate tasks.
5. Each segment text must be the exact phrase for that task taken from the prompt.
6. If the whole prompt is a single task type, return exactly one segment.

CRITICAL EXAMPLES — follow these exactly:
- "write a creative story about Euler theorem"
  → ONE segment, type=creative
  (it is asking for a story, not a proof or code)

- "explain Euler theorem and write a Python function for it"
  → TWO segments: {general, explain Euler theorem} + {coding, write a Python function for it}

- "prove Pythagorean theorem and write a story about Pythagoras"
  → TWO segments: {math, prove Pythagorean theorem} + {creative, write a story about Pythagoras}

- "write a poem about gravity and calculate gravitational force"
  → TWO segments: {creative, write a poem about gravity} + {math, calculate gravitational force}

- "implement binary search in Python"
  → ONE segment, type=coding

- "what is machine learning"
  → ONE segment, type=general

Return ONLY the JSON. No markdown fences. No commentary. No explanation.
"""

# Only used as last-resort safety net — minimal and non-overlapping
_STRONG_CODE = re.compile(
    r"(?:"
    r"implement\s+.{0,60}?\bin\s+(python|javascript|java|c\+\+|typescript|go|rust)\b|"
    r"write\s+(a\s+)?(python|javascript|java)\s+(program|function|script|code)\b|"
    r"\bdef\s+\w+\s*\(|\bimport\s+\w+|"
    r"code\s+in\s+(python|javascript|java|c\+\+)|"
    r"(give|show|generate)\s+.{0,40}?\bcode\b"
    r")",
    re.IGNORECASE,
)

_STRONG_CREATIVE = re.compile(
    r"(?:"
    r"write\s+(a\s+)?(creative\s+)?(story|poem|haiku|fiction|narrative|tale)\b|"
    r"creative\s+story|"
    r"roleplay|"
    r"imagine\s+.{0,40}?(?:world|scenario|story)"
    r")",
    re.IGNORECASE,
)

_STRONG_MATH = re.compile(
    r"(?:"
    r"\bprove\s+(that\s+)?(?:the\s+)?\w+|"
    r"\bderive\s+the\b|"
    r"\bintegral\s+of\b|"
    r"\bsolve\s+the\s+(equation|integral|derivative)\b|"
    r"\btime\s+complexity\b|\bspace\s+complexity\b"
    r")",
    re.IGNORECASE,
)


def _safe_fallback_type(text: str) -> str:
    """Determine segment type from text only as absolute last resort."""
    t = (text or "").lower().strip()
    if _STRONG_CREATIVE.search(t):
        return "creative"
    if _STRONG_CODE.search(t):
        return "coding"
    if _STRONG_MATH.search(t):
        return "math"
    return "general"


def _validate_and_fix(user_prompt: str, data: AnalyzerOutput) -> AnalyzerOutput:
    """
    Only fix clearly wrong labels — do not aggressively re-classify.
    Rule: if segment text contains strong creative signal, never label it coding.
    Rule: if segment text contains strong code signal AND no creative signal, label as coding.
    """
    allowed     = frozenset({"creative", "math", "general", "coding"})
    segs        = data.get("segments") or []
    fixed_segs  = []

    for seg in segs:
        text = (seg.get("text") or "").strip()
        typ  = (seg.get("type") or "general").lower().strip()

        if typ not in allowed:
            typ = "general"

        # Rule 1 — if strong creative signal exists, never override to coding
        if _STRONG_CREATIVE.search(text):
            typ = "creative"

        # Rule 2 — only upgrade to coding if STRONG code signal AND no creative signal
        elif typ != "coding" and _STRONG_CODE.search(text) and not _STRONG_CREATIVE.search(text):
            typ = "coding"

        fixed_segs.append({"text": text or user_prompt, "type": typ})

    if not fixed_segs:
        fixed_segs = [{"text": user_prompt, "type": _safe_fallback_type(user_prompt)}]

    data["segments"] = fixed_segs
    return data


def _split_compound_prompt(user_prompt: str, data: AnalyzerOutput) -> AnalyzerOutput:
    """
    If LLM returned 1 segment but prompt has 2+ clearly distinct task types,
    split on natural boundaries and re-classify each part independently.
    Only splits when the resulting parts have different types.
    """
    segs = data.get("segments") or []
    if len(segs) != 1:
        return data

    full = user_prompt.strip()

    # Split on "and", "also", "then", ", and", "; "
    parts = re.split(
        r"(?:\s+and\s+|\s+also\s+|\s*,\s*and\s+|\s*;\s+|\s+then\s+)",
        full,
        flags=re.IGNORECASE,
    )
    parts = [p.strip() for p in parts if p.strip() and len(p.strip()) >= 8]

    if len(parts) < 2:
        return data

    typed = [{"text": p, "type": _safe_fallback_type(p)} for p in parts]

    # Only split if parts are genuinely different types
    distinct_types = {x["type"] for x in typed}
    if len(distinct_types) < 2:
        return data

    data["segments"] = typed

    # Upgrade complexity if we split into multiple different tasks
    if data.get("complexity") == "simple":
        data["complexity"] = "medium"

    return data


def run_analyzer(user_prompt: str) -> AnalyzerOutput:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_prompt},
        ],
        temperature=0.1,
        max_tokens=768,
    )
    raw = response.choices[0].message.content.strip()

    # Strip markdown fences if present
    if raw.startswith("```"):
        parts = raw.split("```")
        raw   = parts[1]
        if raw.startswith("json"):
            raw = raw[4:]

    result: AnalyzerOutput = json.loads(raw.strip())

    # Normalize complexity
    cx = (result.get("complexity") or "simple").lower()
    if cx not in ("simple", "medium", "complex"):
        cx = "medium"
    result["complexity"] = cx

    # Step 1 — fix obvious mislabels (creative story → never coding)
    result = _validate_and_fix(user_prompt, result)

    # Step 2 — if LLM collapsed multi-task into one, split it
    result = _split_compound_prompt(user_prompt, result)

    # Step 3 — re-validate after any splits
    result = _validate_and_fix(user_prompt, result)

    return result


if __name__ == "__main__":
    tests = [
        "write a creative story about Euler's theorem",
        "explain Euler theorem and write a Python function for it",
        "prove Pythagorean theorem and write a story about Pythagoras",
        "write a poem about gravity and calculate gravitational force",
        "implement binary search in Python",
        "what is machine learning",
        "write a creative story about pythagoras theorem",
        "explain quicksort and implement it in Python",
        "write a haiku and compute 15% of 200",
    ]

    print("=" * 60)
    for t in tests:
        out = run_analyzer(t)
        print(f"Prompt  : {t}")
        print(f"Complexity: {out['complexity']}")
        for s in out["segments"]:
            print(f"  [{s['type'].upper()}] {s['text']}")
        print("-" * 60)