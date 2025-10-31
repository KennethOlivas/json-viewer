import { flowSchema, type FlowJson } from "./schema";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isPrimitive(v: unknown): v is string | number | boolean | null {
  return (
    v === null || ["string", "number", "boolean"].includes(typeof v as string)
  );
}

export function objectToFlow(
  input: unknown,
  rootTitle = "User Info",
): FlowJson | null {
  if (!isRecord(input) && !Array.isArray(input)) return null;

  type NodeShape = {
    id: string;
    type: "ObjectCard";
    data: Record<string, unknown>;
  } & { next?: string };
  const nodes: NodeShape[] = [];

  const makeId = (path: string[]) =>
    path.length === 0 ? "root" : path.join(".");

  const visit = (value: unknown, path: string[], title: string) => {
    if (!isRecord(value) && !Array.isArray(value)) return;

    const id = makeId(path);
    const fields: Record<string, unknown> = {};
    const children: Record<string, string> = {};

    if (Array.isArray(value)) {
      // Primitives inline
      value.forEach((v, i) => {
        if (isPrimitive(v)) {
          fields[String(i)] = v;
        } else if (isRecord(v)) {
          const childId = makeId([...path, `[${i}]`]);
          children[String(i)] = childId;
          // Human label could be like `${title}[${i}]`
          visit(v, [...path, `[${i}]`], `${title}[${i}]`);
        }
      });
    } else {
      Object.entries(value).forEach(([k, v]) => {
        if (isPrimitive(v)) {
          fields[k] = v;
        } else if (isRecord(v)) {
          const childId = makeId([...path, k]);
          children[k] = childId;
          visit(v, [...path, k], k);
        } else if (Array.isArray(v)) {
          // Array: add primitive elements inline, and object elements as children
          const hasObjects = v.some((x) => isRecord(x));
          const hasPrims = v.some((x) => isPrimitive(x));
          if (hasPrims) fields[k] = v.filter(isPrimitive);
          if (hasObjects) {
            v.forEach((item, i) => {
              if (isRecord(item)) {
                const childId = makeId([...path, `${k}[${i}]`]);
                children[`${k}[${i}]`] = childId;
                visit(item, [...path, `${k}[${i}]`], `${k}[${i}]`);
              }
            });
          }
        }
      });
    }

    nodes.push({ id, type: "ObjectCard", data: { title, fields, children } });
  };

  visit(input, [], rootTitle);

  const parsed = flowSchema.safeParse({ nodes });
  return parsed.success ? parsed.data : null;
}
