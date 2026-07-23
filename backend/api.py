import os
import re
import sys

_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from person1_pipeline import run_pipeline

app = FastAPI(title="SmartRouter API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # Chrome sends Access-Control-Request-Private-Network on preflight to loopback;
    # without this, OPTIONS returns 400 "Disallowed CORS private-network".
    allow_private_network=True,
)


class RouteRequest(BaseModel):
    prompt: str = Field(..., min_length=1)


def map_complexity(c: str) -> str:
    return {"simple": "low", "medium": "medium", "complex": "high"}.get(c or "simple", "low")


def build_type_summary(segments: list) -> str:
    labels = {
        "general": "General",
        "creative": "Creative",
        "math": "Math",
        "coding": "Coding",
    }
    if not segments:
        return "General"
    ordered = []
    for seg in segments:
        t = (seg.get("type") or "general").lower()
        lab = labels.get(t, "General")
        if lab not in ordered:
            ordered.append(lab)
    if len(ordered) == 1:
        return ordered[0]
    return " + ".join(ordered)


def frontend_display_type(segments: list) -> str:
    """Badge key for RoutingInfo: simple | creative | math | coding | mixed."""
    if not segments:
        return "simple"
    if len(segments) > 1:
        return "mixed"
    t = (segments[0].get("type") or "general").lower()
    return {
        "creative": "creative",
        "math": "math",
        "coding": "coding",
        "general": "simple",
    }.get(t, "simple")


def model_display_label(model_name: str) -> str:
    m = (model_name or "").lower()
    if "8b" in m:
        return "Llama 3.1 · 8B"
    if "llama" in m and "70b" in m:
        return "Llama 3.3 · 70B"
    if "gpt-oss" in m or "openai/" in m:
        return "GPT-OSS 120B"
    if "qwen" in m:
        return "Qwen 3 · 32B"
    return model_name or "—"


def models_summary_from_breakdown(breakdown: list) -> str:
    labels: list[str] = []
    for b in breakdown:
        mn = b.get("model_name") or ""
        lab = model_display_label(mn)
        if lab and lab not in labels:
            labels.append(lab)
    return " · ".join(labels) if labels else "—"


def _parse_difficulty_note(note: str) -> str | None:
    if not note:
        return None
    m = re.search(r"difficulty[=:]\s*([\d.]+)\s*/\s*10", note, re.I)
    if m:
        return f"{m.group(1)}/10"
    return None


def _segment_type_label(raw: str) -> str:
    return (raw or "general").strip().upper()


def build_segment_executions(
    execution_results: list, analyzer_complexity: str, total_segments: int
) -> list:
    out = []
    for r in execution_results:
        p = r.get("params_used") or {}
        note = p.get("note") or ""
        temp = float(p.get("temperature") or 0)
        max_tok = int(p.get("max_tokens") or 0)
        diff = _parse_difficulty_note(note)
        seg_type = r.get("segment_type") or "general"
        title = (r.get("segment_text") or "")[:72] + (
            "…" if len(r.get("segment_text") or "") > 72 else ""
        )
        fb = r.get("fallback_used", False)
        flags = []
        if total_segments > 1:
            flags.append("multi-part")
        if (analyzer_complexity or "").lower() == "complex":
            flags.append("complex prompt")
        elif not flags:
            flags.append("single segment")
        footer_extra = f"{r.get('tokens_used', 0)} tokens used · {'fallback used' if fb else 'no fallback'}"
        out.append(
            {
                "title": title,
                "segment_type": _segment_type_label(seg_type),
                "complexity": (analyzer_complexity or "simple").lower(),
                "model_line": f"{r.get('model_name', '')} · temp {temp:.2f} · {max_tok} tokens budget",
                "latency_ms": round(float(r.get("latency_ms") or 0), 1),
                "cost_usd": float(r.get("cost_usd") or 0),
                "quality_score": float(r.get("quality_score") or 0),
                "quality_bar_pct": min(
                    100.0, max(0.0, float(r.get("quality_score") or 0) * 10.0)
                ),
                "difficulty_label": diff,
                "footer_flags": ", ".join(flags) if flags else "",
                "footer_detail": footer_extra,
            }
        )
    return out


def build_tasks(segments: list) -> list:
    tasks = []
    for i, seg in enumerate(segments, 1):
        st = (seg.get("type") or "general").lower()
        if st == "creative":
            part = "creative"
        elif st == "coding":
            part = "coding"
        else:
            part = "reasoning"
        text = seg.get("text", "")
        tasks.append(
            {
                "task_id": f"T{i}",
                "part": part,
                "description": text,
                "subtask": text,
            }
        )
    return tasks


def build_frontend_payload(pipeline_out: dict) -> dict:
    final = pipeline_out["final"]
    analyzer = pipeline_out["analyzer"]
    execution = pipeline_out["execution"]
    reward_data = pipeline_out["reward_data"]
    metrics = final["metrics"]
    segments = analyzer.get("segments") or []
    breakdown = metrics.get("segment_breakdown") or []
    exec_results = execution.get("results") or []
    analyzer_cx = analyzer.get("complexity") or "simple"
    n_seg = len(exec_results) or len(segments) or 1

    first_params = (breakdown[0].get("params_used") or {}) if breakdown else {}
    temperature = float(first_params.get("temperature", 0.5))
    model_used_str = (
        breakdown[0].get("model_name", "llama-3.3-70b-versatile")
        if breakdown
        else "llama-3.3-70b-versatile"
    )

    credits = float(reward_data.get("reward", {}).get("credits_earned", 0.0))

    disp_type = frontend_display_type(segments)
    type_summary = build_type_summary(segments)
    tasks = build_tasks(segments) if len(segments) > 1 else []
    models_summary = models_summary_from_breakdown(breakdown)
    model_label = model_display_label(model_used_str)

    qc = metrics.get("quality", {})
    cost = metrics.get("cost", {})
    summary = (
        f"{metrics.get('total_segments', 0)} segment(s) · "
        f"quality {qc.get('avg_score', 0):.1f}/10 · "
        f"${cost.get('total_usd', 0):.5f} · "
        f"{len(metrics.get('models_used', []))} model(s)"
    )

    segment_executions = build_segment_executions(
        exec_results, analyzer_cx, n_seg
    )

    lifetime = float(reward_data.get("total_credits", 0.0))
    total_runs = int(reward_data.get("total_runs", 0))
    badges = reward_data.get("all_badges") or []

    return {
        "type": disp_type,
        "type_summary": type_summary,
        "complexity": map_complexity(analyzer.get("complexity", "simple")),
        "model_used": model_used_str,
        "model_label": model_label,
        "models_summary": models_summary,
        "latency_ms": round(metrics.get("latency", {}).get("total_ms", 0), 1),
        "temperature": temperature,
        "cost_estimate": float(cost.get("total_usd", 0.0)),
        "credits_earned": credits,
        "response": final.get("combined_response", ""),
        "summary": summary,
        "tasks": tasks,
        "segment_executions": segment_executions,
        "credits_rewards": {
            "credits_this_run": round(credits, 4),
            "lifetime_credits": round(lifetime, 4),
            "total_runs": total_runs,
            "badges": badges,
        },
    }


@app.post("/route")
def route(req: RouteRequest):
    p = req.prompt.strip()
    if not p:
        raise HTTPException(status_code=400, detail="Prompt is required.")
    try:
        out = run_pipeline(p)
        return build_frontend_payload(out)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.get("/health")
def health():
    return {"status": "ok"}
