export type RangeRule = { min: number; max: number; integer?: boolean };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function generateRandomJson(template: unknown): unknown {
  // Arrays:
  // - Array of primitives/booleans => pick a random element (enum behavior)
  // - Array with a single object template => return that literal array (fallback)
  if (Array.isArray(template)) {
    if (template.length === 0) return [];
    // If all primitives/booleans/strings: choose one option
    const allPrimitive = template.every(
      (x) => x === null || ["string", "number", "boolean"].includes(typeof x),
    );
    if (allPrimitive) {
      const idx = randomInt(0, template.length - 1);
      return template[idx];
    }
    // Otherwise, map each entry recursively (static array template)
    return template.map((t) => generateRandomJson(t));
  }

  // Objects:
  if (isPlainObject(template)) {
    const obj = template as Record<string, unknown>;
    // Range rule: { min, max, integer? }
    if (
      Object.prototype.hasOwnProperty.call(obj, "min") &&
      Object.prototype.hasOwnProperty.call(obj, "max") &&
      typeof obj.min === "number" &&
      typeof obj.max === "number"
    ) {
      const rule = obj as unknown as RangeRule;
      return rule.integer !== false
        ? randomInt(rule.min, rule.max)
        : randomFloat(rule.min, rule.max);
    }
    // Nested object template
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = generateRandomJson(v);
    }
    return out;
  }

  // Primitives pass-through
  return template;
}
