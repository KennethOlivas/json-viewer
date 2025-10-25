export type RangeRule = { min: number; max: number; integer?: boolean };

type NumberOrRange = number | RangeRule;
type LoremRule =
  | number
  | {
      words?: number;
      sentences?: number;
      paragraphs?: number;
      separator?: string;
    };

type RandomObjectRule = {
  keys: NumberOrRange; // number of keys
  keyLength?: NumberOrRange; // default 5-10
  keyCharset?: string; // default a-z
  value: unknown; // sub-template for values
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function hasRequiredKeys(obj: Record<string, unknown>, required: string[]) {
  return required.every((k) => Object.prototype.hasOwnProperty.call(obj, k));
}

function keysSubsetOf(obj: Record<string, unknown>, allowed: string[]) {
  const keys = Object.keys(obj);
  return keys.every((k) => allowed.includes(k));
}

function resolveCount(v: NumberOrRange, dMin: number, dMax: number) {
  if (typeof v === "number") return v;
  const min = typeof v.min === "number" ? Math.floor(v.min) : dMin;
  const max = typeof v.max === "number" ? Math.floor(v.max) : dMax;
  return randomInt(min, max);
}

const DEFAULT_CHARSET = "abcdefghijklmnopqrstuvwxyz";
function randomString(len: number, charset = DEFAULT_CHARSET) {
  let s = "";
  for (let i = 0; i < len; i++) {
    const idx = randomInt(0, charset.length - 1);
    s += charset[idx];
  }
  return s;
}

// Basic lorem ipsum word list (short but sufficient for randomization)
const LOREM_WORDS =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(
    " ",
  );

function loremWords(count: number) {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    const w = LOREM_WORDS[randomInt(0, LOREM_WORDS.length - 1)];
    words.push(w);
  }
  return words.join(" ");
}

function capitalize(s: string) {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

function loremSentences(count: number) {
  const sentences: string[] = [];
  for (let i = 0; i < count; i++) {
    const len = randomInt(8, 15);
    const sentence = capitalize(loremWords(len)) + ".";
    sentences.push(sentence);
  }
  return sentences.join(" ");
}

function loremParagraphs(count: number) {
  const paragraphs: string[] = [];
  for (let i = 0; i < count; i++) {
    const sCount = randomInt(3, 6);
    paragraphs.push(loremSentences(sCount));
  }
  return paragraphs.join("\n\n");
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

    // Lorem rule: { lorem: number | { words?|sentences?|paragraphs? } }
    if (
      hasRequiredKeys(obj, ["lorem"]) &&
      keysSubsetOf(obj, [
        "lorem",
        "separator",
        "capitalize",
        "prefix",
        "suffix",
      ])
    ) {
      const spec = obj.lorem as LoremRule;
      let text: string;
      if (typeof spec === "number") text = loremWords(spec);
      else {
        const { words, sentences, paragraphs, separator } = spec ?? {};
        if (typeof paragraphs === "number") text = loremParagraphs(paragraphs);
        else if (typeof sentences === "number")
          text = loremSentences(sentences);
        else if (typeof words === "number") text = loremWords(words);
        else text = loremSentences(1) + (separator ? separator : "");
      }
      if (obj.capitalize === true) text = capitalize(text);
      if (typeof obj.prefix === "string") text = obj.prefix + text;
      if (typeof obj.suffix === "string") text = text + obj.suffix;
      return text;
    }

    // Random object rule: { randomObject: { keys, keyLength?, keyCharset?, value } }
    if (
      hasRequiredKeys(obj, ["randomObject"]) &&
      keysSubsetOf(obj, ["randomObject", "keyPrefix"])
    ) {
      const spec = obj.randomObject as RandomObjectRule;
      const count = resolveCount(spec.keys, 1, 5);
      const keyLen = resolveCount(
        spec.keyLength ?? { min: 5, max: 10, integer: true },
        5,
        10,
      );
      const charset = spec.keyCharset || DEFAULT_CHARSET;
      const keyPrefix =
        typeof (obj as Record<string, unknown>).keyPrefix === "string"
          ? (obj as Record<string, unknown>).keyPrefix
          : "";
      const out: Record<string, unknown> = {};
      for (let i = 0; i < count; i++) {
        let key = keyPrefix + randomString(keyLen, charset);
        // ensure uniqueness
        // if collision, append a digit
        while (Object.prototype.hasOwnProperty.call(out, key)) {
          key = key + randomInt(0, 9).toString();
        }
        out[key] = generateRandomJson(spec.value);
      }
      return out;
    }

    // Repeat rule for arrays: { repeat: number|Range, of: template }
    if (
      hasRequiredKeys(obj, ["repeat", "of"]) &&
      keysSubsetOf(obj, ["repeat", "of", "joinWith"])
    ) {
      const count = resolveCount(obj.repeat as NumberOrRange, 1, 5);
      const itemTpl = obj.of;
      const arr: unknown[] = [];
      for (let i = 0; i < count; i++) arr.push(generateRandomJson(itemTpl));
      const joinWith =
        typeof (obj as Record<string, unknown>).joinWith === "string"
          ? ((obj as Record<string, unknown>).joinWith as string)
          : undefined;
      if (joinWith && arr.every((x) => typeof x === "string")) {
        return (arr as string[]).join(joinWith);
      }
      return arr;
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
