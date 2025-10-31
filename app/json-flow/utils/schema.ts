import { z } from "zod";

export const nodeTypeEnum = z.enum([
  "Start",
  "SayText",
  "SwitchNode",
  "ObjectCard",
]);

export const flowNodeSchema = z.object({
  id: z.string(),
  type: nodeTypeEnum,
  data: z.record(z.string(), z.any()).default({}),
  next: z.string().optional(),
});

export const flowSchema = z.object({
  nodes: z.array(flowNodeSchema),
});

export type FlowJson = z.infer<typeof flowSchema>;
export type FlowJsonNode = z.infer<typeof flowNodeSchema>;
