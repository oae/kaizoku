import "@xyflow/react/dist/style.css";

import { type AddSeriesState } from "@/components/kzk/series/add-series";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/trpc/react";

import { Slider } from "@/components/ui/slider";
import {
  Background,
  ConnectionLineType,
  Handle,
  Panel,
  Position,
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeProps,
} from "@xyflow/react";

import { Input } from "@/components/ui/input";
import { FilePenLine, RotateCcw, Scaling, Trash } from "lucide-react";
import { nanoid } from "nanoid";
import React from "react";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

interface FlowState {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  addEdge: (data: Omit<Edge, "id">) => void;
  removeEdge: (source: string, target: string) => void;
  removeNode: (id: string) => void;
  addNode: (node: Node) => void;
  updateNode: (
    id: string,
    data: Partial<
      UpScaleNodeDataType | RenameNodeDataType | InputNodeDataType | undefined
    >,
  ) => void;
  clearState: (chapterName: string) => void;
}

const useStore = createWithEqualityFn<FlowState>(
  (set, get) => ({
    nodes: [],
    edges: [],

    onNodesChange(changes: NodeChange[]) {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },

    onEdgesChange(changes) {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },

    addEdge(data) {
      const id = nanoid(6);
      const edge = { id, ...data };

      set({ edges: [edge, ...get().edges] });
    },

    removeEdge(source, target) {
      set({
        edges: get().edges.filter(
          (edge) => !(edge.source === source && edge.target === target),
        ),
      });
    },

    addNode(node) {
      set({ nodes: [node, ...get().nodes] });
    },
    removeNode(id) {
      const sourceEdge = get().edges.find((edge) => edge.source === id);
      const targetEdge = get().edges.find((edge) => edge.target === id);
      if (sourceEdge) {
        set({
          edges: get().edges.filter(
            (edge) =>
              !(edge.source === id && edge.target === sourceEdge.target),
          ),
        });
      }
      if (targetEdge) {
        set({
          edges: get().edges.filter(
            (edge) =>
              !(edge.source === targetEdge.source && edge.target === id),
          ),
        });
      }
      if (sourceEdge && targetEdge) {
        set({
          edges: [
            {
              id: nanoid(6),
              source: targetEdge.source,
              target: sourceEdge.target,
            },
            ...get().edges,
          ],
        });
      }
      set({ nodes: get().nodes.filter((node) => node.id !== id) });
    },

    updateNode(id, data) {
      set({
        nodes: get().nodes.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, ...data } } : node,
        ),
      });
    },
    clearState(chapterName) {
      set({
        nodes: [
          {
            type: "InputNode",
            id: "input",
            data: { chapterName: chapterName },
            position: { x: 50, y: 0 },
          },
          {
            type: "OutputNode",
            id: "output",
            data: { chapterName: chapterName },
            position: { x: 50, y: 100 },
          },
        ],
        edges: [
          {
            id: nanoid(6),
            source: "input",
            target: "output",
          },
        ],
      });
    },
  }),
  shallow,
);

type UpScaleNodeDataType = {
  multiplier: number;
};

type UpScaleNodeType = Node<UpScaleNodeDataType>;

function UpScaleNode({ id, data }: NodeProps<UpScaleNodeType>) {
  const { updateNode, removeNode } = useStore();
  return (
    <Card className="min-w-48 p-0">
      <CardHeader className="relative flex h-12 flex-row items-center bg-muted/50 p-3">
        <div className="text-md grow font-bold">UpScale</div>
        <Button
          variant="destructive"
          size="icon"
          className="h-6 w-6 rounded-sm"
          onClick={() => {
            removeNode(id);
          }}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-2">
        <div className="text-xs text-muted-foreground">
          <div className="w-full text-sm text-primary">
            Multiplier:
            <span className="ml-1 text-muted-foreground">
              {data.multiplier}x
            </span>
          </div>
          <Slider
            className="nodrag my-3"
            defaultValue={[data.multiplier]}
            max={4}
            min={1}
            step={1}
            onValueChange={(newValue) => {
              if (Array.isArray(newValue) && newValue.length > 0) {
                const value = Number(newValue[0]);
                updateNode(id, { multiplier: value });
              }
            }}
          />
        </div>
      </CardContent>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
    </Card>
  );
}

type RenameNodeDataType = {
  pattern: string;
};

type RenameNodeType = Node<RenameNodeDataType>;

function RenameNode({ id, data }: NodeProps<RenameNodeType>) {
  const { updateNode, removeNode } = useStore();
  return (
    <Card className="min-w-48 p-0">
      <CardHeader className="relative flex h-12 flex-row items-center bg-muted/50 p-3">
        <div className="text-md grow font-bold">Rename</div>
        <Button
          variant="destructive"
          size="icon"
          className="h-6 w-6 rounded-sm"
          onClick={() => {
            removeNode(id);
          }}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-2">
        <div className="text-xs text-muted-foreground">
          <div className="w-full text-sm text-primary">Pattern:</div>
          <Input
            type="text"
            className="nodrag my-3"
            value={data.pattern}
            onChange={(e) => updateNode(id, { pattern: e.target.value })}
          />
        </div>
      </CardContent>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
    </Card>
  );
}

type InputNodeDataType = {
  chapterName: string;
};

type InputNodeType = Node<InputNodeDataType>;
function InputNode({ data }: NodeProps<InputNodeType>) {
  return (
    <Card className="min-w-48 p-0">
      <CardHeader className="relative flex h-12 flex-row items-center bg-muted/50 p-3">
        <div className="text-md grow font-bold">Input</div>
      </CardHeader>
      <CardContent className="p-2">
        <div className="text-xs text-muted-foreground">
          <div className="w-full text-sm text-primary">Chapter Name:</div>
          {data.chapterName}
        </div>
      </CardContent>
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
}

function OutputNode() {
  const { nodes } = useStore();
  const renameNode = nodes.find(
    (node) => node.id === "rename",
  ) as unknown as RenameNodeType;
  const upscaleNode = nodes.find(
    (node) => node.id === "upscale",
  ) as unknown as UpScaleNodeType;
  const inputNode = nodes.find(
    (node) => node.id === "input",
  ) as unknown as InputNodeType;

  return (
    <Card className="min-w-48 p-0">
      <CardHeader className="relative flex h-12 flex-row items-center bg-muted/50 p-3">
        <div className="text-md grow font-bold">Output</div>
      </CardHeader>
      <CardContent className="p-2">
        <div className="text-xs text-muted-foreground">
          <div className="w-full text-sm text-primary">File Name:</div>
          {inputNode?.data?.chapterName
            ? `${inputNode?.data?.chapterName.replaceAll(" ", "_")}.cbz`
            : ""}
        </div>
        <div className="my-2 text-xs text-muted-foreground">
          <div className="w-full text-sm text-primary">Rename Pattern:</div>
          {renameNode?.data?.pattern ? renameNode?.data?.pattern : "None"}
        </div>
        <div className="text-xs text-muted-foreground">
          <div className="w-full text-sm text-primary">Upscale Multiplier:</div>
          {upscaleNode?.data?.multiplier
            ? `${upscaleNode?.data?.multiplier}x`
            : "None"}
        </div>
      </CardContent>
      <Handle type="target" position={Position.Top} />
    </Card>
  );
}

export function SelectFlowStep({
  formState,
}: {
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setCanProgress: React.Dispatch<React.SetStateAction<boolean>>;
  formState: AddSeriesState;
  setFormState: React.Dispatch<React.SetStateAction<AddSeriesState>>;
}) {
  const {
    addEdge,
    removeEdge,
    edges,
    nodes,
    onEdgesChange,
    onNodesChange,
    addNode,
    clearState,
  } = useStore();
  const seriesQuery = api.series.fetchFullSeriesData.useQuery(
    {
      seriesId: formState.series?.id ?? 0,
    },
    {
      enabled: !!formState.series?.id,
    },
  );
  React.useEffect(() => {
    const series = seriesQuery.data;
    if (!series?.chapters.length) return;
    const chapter = series.chapters[0];
    if (!chapter) return;
    clearState(chapter?.name);
    addNode({
      type: "InputNode",
      id: "input",
      data: { chapterName: chapter?.name },
      position: { x: 50, y: 20 },
    });
    addNode({
      type: "OutputNode",
      id: "output",
      data: {},
      position: { x: 50, y: 150 },
    });
    addEdge({
      source: "input",
      target: "output",
    });
  }, [seriesQuery.data, addNode, addEdge, clearState]);

  if (seriesQuery.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-4 grid h-96 gap-2 rounded-md border bg-secondary p-4">
      <ReactFlow
        data-vaul-no-drag
        nodeTypes={{
          InputNode,
          UpScaleNode,
          RenameNode,
          OutputNode,
        }}
        nodes={nodes}
        fitView
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodesConnectable={false}
        connectionLineType={ConnectionLineType.Bezier}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ animated: true }}
      >
        <Background className="" />
        <Panel position="bottom-left" className="flex flex-col gap-2">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="default"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    const hasUpScaleNode = nodes.some(
                      (node) => node.id === "upscale",
                    );
                    if (hasUpScaleNode) {
                      return;
                    }
                    addNode({
                      type: "UpScaleNode",
                      id: "upscale",
                      data: { multiplier: 1 } satisfies UpScaleNodeDataType,
                      position: { x: 50, y: 50 },
                    });
                    const hasRenameNode = nodes.some(
                      (node) => node.id === "rename",
                    );

                    if (!hasRenameNode) {
                      addEdge({
                        source: "input",
                        target: "upscale",
                      });
                      addEdge({
                        source: "upscale",
                        target: "output",
                      });
                    } else {
                      addEdge({
                        source: "rename",
                        target: "upscale",
                      });
                      addEdge({
                        source: "upscale",
                        target: "output",
                      });
                    }
                    removeEdge("rename", "output");
                    removeEdge("input", "output");
                  }}
                >
                  <Scaling className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-card">
                <p>Add UpScale Node</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="default"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    const hasRenameNode = nodes.some(
                      (node) => node.id === "rename",
                    );
                    if (hasRenameNode) {
                      return;
                    }
                    addNode({
                      type: "RenameNode",
                      id: "rename",
                      data: { pattern: "" } satisfies RenameNodeDataType,
                      position: { x: 50, y: 50 },
                    });
                    const hasUpScaleNode = nodes.some(
                      (node) => node.id === "upscale",
                    );

                    if (!hasUpScaleNode) {
                      addEdge({
                        source: "input",
                        target: "rename",
                      });
                      addEdge({
                        source: "rename",
                        target: "output",
                      });
                    } else {
                      addEdge({
                        source: "upscale",
                        target: "rename",
                      });
                      addEdge({
                        source: "rename",
                        target: "output",
                      });
                    }
                    removeEdge("upscale", "output");
                    removeEdge("input", "output");
                  }}
                >
                  <FilePenLine className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-card">
                <p>Add Rename Node</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    clearState(seriesQuery.data?.chapters[0]?.name ?? "");
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-card">
                <p>Reset</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Panel>
      </ReactFlow>
    </div>
  );
}
