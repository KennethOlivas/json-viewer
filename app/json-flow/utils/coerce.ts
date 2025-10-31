import { flowSchema, type FlowJson } from "./schema";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function coerceArbitraryJsonToFlow(input: unknown): FlowJson | null {
  // If it already validates, return as-is
  const direct = flowSchema.safeParse(input);
  if (direct.success) return direct.data;

  if (!isRecord(input)) return null;

  const nodes: FlowJson["nodes"] = [];

  // Create a start node that points to the first group (if any)
  const startId = "start";
  let firstNext: string | undefined;

  // For each top-level key, if it looks like a map of booleans, create a SwitchNode with cases -> SayText nodes
  for (const [sectionKey, sectionVal] of Object.entries(input)) {
    if (!isRecord(sectionVal)) continue;
    const entries = Object.entries(sectionVal);
    if (entries.length === 0) continue;
    // Determine if it's mostly boolean flags
    const boolLikeCount = entries.filter(
      ([, v]) => typeof v === "boolean",
    ).length;
    if (boolLikeCount / entries.length < 0.5) {
      // Not primarily booleans — create a SayText summary node
      const sayId = `${sectionKey}`;
      nodes.push({ id: sayId, type: "SayText", data: { text: sectionKey } });
      if (!firstNext) firstNext = sayId;
      continue;
    }

    const switchId = `${sectionKey}`;
    const cases: Record<string, string> = {};
    // Create SayText nodes for truthy flags and build cases mapping
    for (const [k, v] of entries) {
      if (v === true) {
        const sayId = `${sectionKey}_${k}`;
        nodes.push({
          id: sayId,
          type: "SayText",
          data: { text: `${sectionKey}.${k}` },
        });
        cases[k] = sayId;
      }
    }
    nodes.push({ id: switchId, type: "SwitchNode", data: { cases } });
    if (!firstNext) firstNext = switchId;
  }

  nodes.unshift({
    id: startId,
    type: "Start",
    data: { text: "Start" },
    next: firstNext,
  });

  const parsed = flowSchema.safeParse({ nodes });
  return parsed.success ? parsed.data : null;
}
