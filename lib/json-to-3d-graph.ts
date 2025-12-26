import type { JSONValue, JsonPath } from "@/lib/json";

/**
 * 3D Graph Node representation
 */
export type Node3D = {
    id: string;
    label: string;
    type: "object" | "array" | "string" | "number" | "boolean" | "null";
    path: JsonPath;
    depth: number;
    childCount: number;
    color: string;
    val: number; // Size multiplier for force graph
    rawValue?: JSONValue;
};

/**
 * 3D Graph Link representation
 */
export type Link3D = {
    source: string;
    target: string;
    label: string; // Key name
};

/**
 * Complete 3D Graph structure
 */
export type Graph3DData = {
    nodes: Node3D[];
    links: Link3D[];
};

/**
 * Color palette for syntax highlighting in 3D
 */
export const TYPE_COLORS = {
    object: "#ffffff", // White with glow
    array: "#4169E1", // Electric Blue
    string: "#39FF14", // Neon Green
    number: "#00FFFF", // Cyan
    boolean: "#FF6B35", // Orange
    null: "#888888", // Gray
} as const;

/**
 * Get a preview string for a value
 */
function previewValue(v: JSONValue): string {
    if (v === null) return "null";
    if (typeof v === "boolean") return v ? "true" : "false";
    if (typeof v === "number") return String(v);
    if (typeof v === "string") {
        return v.length > 20 ? `"${v.slice(0, 17)}..."` : `"${v}"`;
    }
    if (Array.isArray(v)) return `Array[${v.length}]`;
    if (typeof v === "object") {
        const keys = Object.keys(v);
        return `{${keys.length} keys}`;
    }
    return String(v);
}

/**
 * Get the type of a JSON value
 */
function getValueType(
    v: JSONValue
): "object" | "array" | "string" | "number" | "boolean" | "null" {
    if (v === null) return "null";
    if (Array.isArray(v)) return "array";
    return typeof v as "object" | "string" | "number" | "boolean";
}

/**
 * Convert a JSON value to a 3D graph structure
 */
export function jsonTo3DGraph(root: JSONValue): Graph3DData {
    const nodes: Node3D[] = [];
    const links: Link3D[] = [];

    function countChildren(v: JSONValue): number {
        if (v === null || typeof v !== "object") return 0;
        if (Array.isArray(v)) return v.length;
        return Object.keys(v).length;
    }

    function walk(
        v: JSONValue,
        path: JsonPath = [],
        parentId?: string,
        linkLabel?: string,
        depth = 0
    ) {
        const id = path.length === 0 ? "root" : path.join(".");
        const type = getValueType(v);
        const childCount = countChildren(v);

        // Create node
        const node: Node3D = {
            id,
            label: path.length === 0 ? "root" : previewValue(v),
            type,
            path,
            depth,
            childCount,
            color: TYPE_COLORS[type],
            val: type === "object" || type === "array" ? 2 + childCount * 0.2 : 1,
            rawValue: v,
        };
        nodes.push(node);

        // Create link to parent
        if (parentId !== undefined && linkLabel !== undefined) {
            links.push({
                source: parentId,
                target: id,
                label: linkLabel,
            });
        }

        // Recursively process children
        if (v !== null && typeof v === "object") {
            if (Array.isArray(v)) {
                v.forEach((item, index) => {
                    walk(item, [...path, index], id, `[${index}]`, depth + 1);
                });
            } else {
                Object.entries(v).forEach(([key, value]) => {
                    walk(value, [...path, key], id, key, depth + 1);
                });
            }
        }
    }

    walk(root);
    return { nodes, links };
}

/**
 * Generate path display string from JsonPath
 */
export function pathToString(path: JsonPath): string {
    if (path.length === 0) return "root";
    return path.reduce<string>((acc, segment) => {
        if (typeof segment === "number") {
            return `${acc}[${segment}]`;
        }
        return acc ? `${acc}.${segment}` : segment;
    }, "");
}
