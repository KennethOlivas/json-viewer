"use client";

import React, { useCallback, useRef } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

type Props = {
  initialNodes: Node[];
  initialEdges: Edge[];
  onChangeAction?: (nodes: Node[], edges: Edge[]) => void;
  onSelectNodeAction?: (node: Node | null) => void;
};

function Header({ color, title }: { color: string; title: string }) {
  return (
    <div
      className="rounded-t-md px-2 py-1 text-xs font-semibold text-white"
      style={{ background: color }}
    >
      {title}
    </div>
  );
}

function Body({ children }: { children?: React.ReactNode }) {
  return (
    <div className="rounded-b-md bg-[#222] p-2 text-[13px] text-[#ccc]">
      {children}
    </div>
  );
}

function BaseHandles() {
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </>
  );
}

function StartNode({ data }: { data: { text?: string } }) {
  return (
    <div className="min-w-[180px] rounded-md shadow-md">
      <Header color="#10b981" title="Start" />
      <Body>{data?.text ?? "Start"}</Body>
      <BaseHandles />
    </div>
  );
}

function SayTextNode({ data }: { data: { text?: string } }) {
  return (
    <div className="min-w-[220px] rounded-md shadow-md">
      <Header color="#2563eb" title="SayText" />
      <Body>{data?.text ?? "(text)"}</Body>
      <BaseHandles />
    </div>
  );
}

function SwitchNode({ data }: { data: { cases?: Record<string, string> } }) {
  const entries = Object.entries(data?.cases ?? {});
  return (
    <div className="min-w-60 rounded-md shadow-md">
      <Header color="#f59e0b" title="SwitchNode" />
      <Body>
        {entries.length === 0 ? (
          <div className="text-muted-foreground">No cases</div>
        ) : (
          <ul className="grid gap-1">
            {entries.map(([k, v]) => (
              <li key={k}>
                <span className="text-[#ddd]">Case {k}</span> →{" "}
                <span className="text-[#888]">{v}</span>
              </li>
            ))}
          </ul>
        )}
      </Body>
      <BaseHandles />
    </div>
  );
}

function ObjectCardNode({
  data,
}: {
  data: {
    title?: string;
    fields?: Record<string, unknown>;
    children?: Record<string, string>;
  };
}) {
  const fieldEntries = Object.entries(
    (data?.fields as Record<string, unknown> | undefined) ?? {},
  );
  const childEntries = Object.entries(
    (data?.children as Record<string, string> | undefined) ?? {},
  );
  return (
    <div className="min-w-[260px] rounded-md shadow-md">
      <Header color="#7c3aed" title={data?.title ?? "Object"} />
      <Body>
        {fieldEntries.length > 0 && (
          <div className="space-y-1">
            {fieldEntries.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[120px_1fr] gap-2">
                <div className="text-[#aaa]">{k}</div>
                <div className="wrap-break-word">{String(v)}</div>
              </div>
            ))}
          </div>
        )}
        {childEntries.length > 0 && (
          <div className="mt-2 text-xs text-[#bbb]">
            {childEntries.length} child object
            {childEntries.length > 1 ? "s" : ""}
          </div>
        )}
      </Body>
      <BaseHandles />
    </div>
  );
}

const nodeTypes = {
  Start: StartNode,
  SayText: SayTextNode,
  SwitchNode: SwitchNode,
  ObjectCard: ObjectCardNode,
};

export function FlowCanvas({
  initialNodes,
  initialEdges,
  onChangeAction,
  onSelectNodeAction,
}: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const syncingFromParent = useRef(false);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, type: "smoothstep" }, eds));
    },
    [setEdges],
  );

  const onSelectionChange = useCallback(
    ({ nodes: ns }: { nodes: Node[] }) => {
      onSelectNodeAction?.(ns[0] ?? null);
    },
    [onSelectNodeAction],
  );

  React.useEffect(() => {
    if (!onChangeAction) return;
    if (syncingFromParent.current) return;
    onChangeAction(nodes, edges);
  }, [nodes, edges, onChangeAction]);

  // Sync internal state when parent provides new inputs
  React.useEffect(() => {
    // Avoid echoing this change back to parent
    syncingFromParent.current = true;
    setNodes(initialNodes);
    setEdges(initialEdges);
    // Release flag after state updates have flushed to ReactFlow
    queueMicrotask(() => {
      syncingFromParent.current = false;
    });
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="h-[calc(100vh-120px)] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default FlowCanvas;
