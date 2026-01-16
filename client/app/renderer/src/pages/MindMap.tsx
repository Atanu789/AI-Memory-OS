import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { AppBackground } from '../components/ui/app-background';
import { motion } from 'framer-motion';
import { 
  Search, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Download, 
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Home
} from 'lucide-react';

type MindMapNode = {
  name: string;
  description: string;
  highlights?: string[];
  children?: MindMapNode[];
  _children?: MindMapNode[]; // Hidden children for collapse functionality
};

type D3HierarchyNode = d3.HierarchyNode<MindMapNode> & {
  _children?: D3HierarchyNode[];
  x?: number;
  y?: number;
};

function findNode(root: MindMapNode, target: string): MindMapNode | null {
  if (root.name === target) return root;
  if (!root.children) return null;
  for (const child of root.children) {
    const result = findNode(child, target);
    if (result) return result;
  }
  return null;
}

function getAllNodes(root: MindMapNode): MindMapNode[] {
  const nodes: MindMapNode[] = [root];
  if (root.children) {
    root.children.forEach(child => {
      nodes.push(...getAllNodes(child));
    });
  }
  return nodes;
}

function getBreadcrumb(root: MindMapNode, target: string): string[] {
  if (root.name === target) return [root.name];
  if (!root.children) return [];
  
  for (const child of root.children) {
    const path = getBreadcrumb(child, target);
    if (path.length > 0) {
      return [root.name, ...path];
    }
  }
  return [];
}

function getPathToNode(root: d3.HierarchyNode<MindMapNode>, target: string): d3.HierarchyNode<MindMapNode>[] {
  // Return path when current node matches
  if (root.data.name === target) return [root];
  // Consider both visible children and collapsed children (_children)
  const kids: Array<d3.HierarchyNode<MindMapNode>> | undefined = (root as any).children ?? (root as any)._children;
  if (!kids || kids.length === 0) return [];

  for (const child of kids) {
    const path = getPathToNode(child, target);
    if (path.length > 0) {
      return [root, ...path];
    }
  }
  return [];
}

export default function MindMap() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const prevPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const data = useMemo<MindMapNode>(
    () => ({
      name: "Memory OS",
      description: "How the system captures, organizes, and surfaces knowledge.",
      highlights: ["Zoom and pan", "Click nodes", "Radial layout"],
      children: [
        {
          name: "Capture",
          description: "Sources that feed the knowledge base in real time.",
          highlights: ["App events", "Git activity", "User notes"],
          children: [
            {
              name: "Telemetry",
              description: "Usage signals like focus, windows, and activity spikes.",
              highlights: ["Window focus", "Process stats"],
            },
            {
              name: "Integrations",
              description: "External tools that push structured updates.",
              highlights: ["GitHub", "Calendar", "Docs"],
              children: [
                {
                  name: "GitHub Events",
                  description: "Real-time monitoring of all GitHub activity streams.",
                  highlights: ["Webhooks", "GraphQL API", "REST API"],
                  children: [
                    {
                      name: "Commits",
                      description: "Track every code change with context and patterns.",
                      highlights: ["Messages", "Diff analysis", "File changes", "Authors"],
                    },
                    {
                      name: "Pull Requests",
                      description: "Monitor PR lifecycle from creation to merge.",
                      highlights: ["Reviews", "Comments", "Approvals", "CI status"],
                    },
                    {
                      name: "Issues",
                      description: "Track bugs, features, and project management.",
                      highlights: ["Labels", "Milestones", "Assignees", "Comments"],
                    },
                    {
                      name: "Releases",
                      description: "Version tracking and deployment history.",
                      highlights: ["Tags", "Changelogs", "Assets", "Pre-releases"],
                    },
                  ],
                },
                {
                  name: "Repository Intelligence",
                  description: "Deep analysis of codebase structure and health.",
                  highlights: ["Languages", "Dependencies", "Activity"],
                  children: [
                    {
                      name: "Code Patterns",
                      description: "Identify recurring patterns and best practices.",
                      highlights: ["Refactoring", "Architecture", "Tech debt"],
                    },
                    {
                      name: "Collaboration",
                      description: "Team dynamics and contribution patterns.",
                      highlights: ["Contributors", "Reviews", "Pair programming"],
                    },
                    {
                      name: "Branch Strategy",
                      description: "Git flow and branching patterns analysis.",
                      highlights: ["Feature branches", "Hotfixes", "Release flow"],
                    },
                  ],
                },
              ],
            },
            {
              name: "Manual Notes",
              description: "User-authored context that anchors the stream.",
              highlights: ["Quick captures", "Tags"],
            },
          ],
        },
        {
          name: "Organize",
          description: "Pipelines that structure, dedupe, and cluster knowledge.",
          highlights: ["Embeddings", "Chunking", "Threading"],
          children: [
            {
              name: "Temporal",
              description: "Time-aware grouping to retain narrative flow.",
              highlights: ["Timeline", "Session rollups"],
            },
            {
              name: "Entities",
              description: "People, repos, projects, and topics extracted from text.",
              highlights: ["NER", "Topic tags"],
              children: [
                {
                  name: "GitHub Entities",
                  description: "Extract and link GitHub-specific entities.",
                  highlights: ["Repos", "Contributors", "Organizations"],
                  children: [
                    {
                      name: "Developers",
                      description: "Track individual contributors and their expertise.",
                      highlights: ["Skills", "Activity patterns", "Code ownership"],
                    },
                    {
                      name: "Projects",
                      description: "Group repositories into logical project clusters.",
                      highlights: ["Microservices", "Monorepos", "Dependencies"],
                    },
                    {
                      name: "Tech Stack",
                      description: "Language and framework usage across codebases.",
                      highlights: ["Languages", "Frameworks", "Tools", "Versions"],
                    },
                  ],
                },
              ],
            },
            {
              name: "Quality",
              description: "Signal-to-noise filters to keep the graph clean.",
              highlights: ["Dedup", "Source weighting"],
            },
          ],
        },
        {
          name: "Surface",
          description: "Ways the user sees, queries, and navigates the memory.",
          highlights: ["Dashboards", "Mind map", "Search"],
          children: [
            {
              name: "Insights",
              description: "Daily and weekly summaries driven by embeddings.",
              highlights: ["Streaks", "Anomalies"],
              children: [
                {
                  name: "GitHub Analytics",
                  description: "Visualize coding patterns and productivity metrics.",
                  highlights: ["Commit graphs", "PR velocity", "Review time"],
                  children: [
                    {
                      name: "Productivity Metrics",
                      description: "Quantify development velocity and efficiency.",
                      highlights: ["Lines changed", "Files touched", "Merge frequency"],
                    },
                    {
                      name: "Code Quality",
                      description: "Track technical debt and code health indicators.",
                      highlights: ["Test coverage", "Complexity", "Duplication"],
                    },
                    {
                      name: "Collaboration Health",
                      description: "Measure team interaction and knowledge sharing.",
                      highlights: ["PR discussions", "Code reviews", "Pair stats"],
                    },
                  ],
                },
              ],
            },
            {
              name: "Ask",
              description: "Natural language entry point over the memory graph.",
              highlights: ["Chat", "Source citations"],
              children: [
                {
                  name: "GitHub Queries",
                  description: "Ask questions about your code and contributions.",
                  highlights: ["Commit history", "PR status", "Code search"],
                  children: [
                    {
                      name: "Code Context",
                      description: "Understand 'what', 'when', and 'why' of changes.",
                      highlights: ["Blame info", "Change motivation", "Related commits"],
                    },
                    {
                      name: "Impact Analysis",
                      description: "Explore ripple effects of code changes.",
                      highlights: ["Affected files", "Breaking changes", "Dependencies"],
                    },
                  ],
                },
              ],
            },
            {
              name: "Links",
              description: "Connections across people, projects, and artifacts.",
              highlights: ["Bidirectional edges", "Context hops"],
            },
          ],
        },
        {
          name: "Automate",
          description: "Workers that trigger actions when patterns are detected.",
          highlights: ["Schedules", "Graph triggers"],
          children: [
            {
              name: "Agents",
              description: "Task-focused routines with scoped memory access.",
              highlights: ["Workers", "Safety rails"],
              children: [
                {
                  name: "GitHub Automation",
                  description: "Intelligent bots for code and workflow management.",
                  highlights: ["Auto-review", "PR suggestions", "Issue triage"],
                  children: [
                    {
                      name: "Code Review Bot",
                      description: "AI-powered code review and suggestions.",
                      highlights: ["Best practices", "Security checks", "Style guide"],
                    },
                    {
                      name: "PR Assistant",
                      description: "Auto-generate descriptions and manage PR lifecycle.",
                      highlights: ["Descriptions", "Labels", "Merge strategy"],
                    },
                    {
                      name: "Issue Classifier",
                      description: "Intelligent labeling and assignment of issues.",
                      highlights: ["Priority", "Type detection", "Auto-assign"],
                    },
                  ],
                },
              ],
            },
            {
              name: "Feedback",
              description: "Human loop for corrections that feed retraining.",
              highlights: ["Thumbs", "Labels"],
            },
            {
              name: "Delivery",
              description: "Notifications and integrations that ship outcomes.",
              highlights: ["Email", "Slack", "Webhooks"],
              children: [
                {
                  name: "GitHub Notifications",
                  description: "Smart filtering and routing of GitHub events.",
                  highlights: ["PR mentions", "Review requests", "CI failures"],
                  children: [
                    {
                      name: "Alert Priorities",
                      description: "ML-ranked notifications based on importance.",
                      highlights: ["Urgency", "Context", "Your involvement"],
                    },
                    {
                      name: "Digest Summaries",
                      description: "Batched updates for non-urgent activities.",
                      highlights: ["Daily recap", "Weekly report", "Team updates"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
    []
  );

  const [activeName, setActiveName] = useState<string>(data.name);
  const activeNode = useMemo(() => findNode(data, activeName) ?? data, [data, activeName]);
  const breadcrumb = useMemo(() => getBreadcrumb(data, activeName), [data, activeName]);
  const allNodes = useMemo(() => getAllNodes(data), [data]);
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return allNodes;
    return allNodes.filter(node => 
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allNodes, searchQuery]);

  const navigateToNode = (nodeName: string) => {
    setActiveName(nodeName);
    const newHistory = navigationHistory.slice(0, historyIndex + 1);
    newHistory.push(nodeName);
    setNavigationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setActiveName(navigationHistory[historyIndex - 1]);
    }
  };

  const goForward = () => {
    if (historyIndex < navigationHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setActiveName(navigationHistory[historyIndex + 1]);
    }
  };

  const goToRoot = () => {
    navigateToNode(data.name);
  };

  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 0.7);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(500)
        .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mindmap.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleNode = (nodeName: string) => {
    setCollapsedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeName)) {
        newSet.delete(nodeName);
      } else {
        newSet.add(nodeName);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth || 960;
    const height = svgRef.current.clientHeight || 640;

    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    svg.attr("role", "img").attr("aria-label", "Mind map of AI Memory OS");

    const rootGroup = svg.append("g").attr("transform", `translate(80, ${height / 2})`);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 2.0])
      .on("zoom", (event) => {
        transformRef.current = event.transform;
        const { x, y, k } = event.transform;
        rootGroup.attr("transform", `translate(${80 + x}, ${height / 2 + y}) scale(${k})`);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom).on("dblclick.zoom", null);
    
    // Restore previous transform state
    if (transformRef.current) {
      svg.call(zoom.transform as any, transformRef.current);
    }

    const root = d3.hierarchy<MindMapNode>(data) as D3HierarchyNode;
    
    // Apply collapsed state
    const applyCollapse = (node: D3HierarchyNode) => {
      if (node.children && collapsedNodes.has(node.data.name)) {
        node._children = node.children;
        node.children = undefined;
      }
      if (node.children) {
        node.children.forEach(applyCollapse);
      }
    };
    applyCollapse(root);
    
    // Get path to active node for highlighting
    const pathToActive = getPathToNode(root, activeName);
    const pathNames = new Set(pathToActive.map(n => n.data.name));
    
    // Horizontal tree layout
    const tree = d3
      .tree<MindMapNode>()
      .size([height - 200, width - 300])
      .separation((a, b) => {
        return a.parent === b.parent ? 1 : 1.2;
      });

    tree(root);

    // Minimal color palette
    const getNodeColor = (d: d3.HierarchyPointNode<MindMapNode>) => {
      if (d.data.name === activeName) return "#3b82f6"; // blue-500
      if (pathNames.has(d.data.name)) return "#6366f1"; // indigo-500
      return "#64748b"; // slate-500
    };

    // Previous positions for smooth transitions
    const prevPositions = prevPositionsRef.current;

    // Helper to compute initial position (prev or parent's prev)
    const initialCoord = (d: d3.HierarchyPointNode<MindMapNode>) => {
      const prev = prevPositions.get(d.data.name);
      if (prev) return { x: prev.x, y: prev.y };
      if (d.parent) {
        const pprev = prevPositions.get(d.parent.data.name);
        if (pprev) return { x: pprev.x, y: pprev.y };
      }
      return { x: d.x ?? 0, y: d.y ?? 0 };
    };

    const nodes = root.descendants();
    const linksData = root.links();

    // Horizontal links generator
    const linkGen = d3
      .linkHorizontal<d3.HierarchyPointLink<MindMapNode>, any>()
      .x((d: any) => d.y)
      .y((d: any) => d.x);

    // Links selection with keyed join
    const linkGroup = rootGroup.append("g").attr("class", "links");
    const linkSel = linkGroup
      .selectAll<SVGPathElement, d3.HierarchyPointLink<MindMapNode>>("path.link")
      .data(linksData, (d: any) => `${d.source.data.name}->${d.target.data.name}`);

    linkSel.exit()
      .transition()
      .duration(250)
      .style("opacity", 0)
      .remove();

    const linkEnter = linkSel.enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.4)
      .attr("stroke", (d) => (pathNames.has(d.target.data.name) && pathNames.has(d.source.data.name)) ? "#60a5fa" : "#475569")
      .attr("stroke-width", (d) => (pathNames.has(d.target.data.name) && pathNames.has(d.source.data.name)) ? 3 : 1.5)
      .attr("d", (d) => {
        const s0 = initialCoord(d.source as any);
        const t0 = initialCoord(d.target as any);
        return linkGen({ source: s0, target: t0 } as any);
      });

    const linkMerge = linkEnter.merge(linkSel as any);
    linkMerge
      .transition()
      .duration(300)
      .ease(d3.easeCubicOut)
      .attr("stroke", (d) => (pathNames.has(d.target.data.name) && pathNames.has(d.source.data.name)) ? "#60a5fa" : "#475569")
      .attr("stroke-width", (d) => (pathNames.has(d.target.data.name) && pathNames.has(d.source.data.name)) ? 3 : 1.5)
      .attr("d", (d) => linkGen(d as any));

    // Nodes selection with keyed join
    const nodesGroup = rootGroup.append("g").attr("class", "nodes");
    const nodeSel = nodesGroup
      .selectAll<SVGGElement, d3.HierarchyPointNode<MindMapNode>>("g.node")
      .data(nodes, (d: any) => d.data.name);

    nodeSel.exit()
      .transition()
      .duration(250)
      .attr("opacity", 0)
      .remove();

    const nodeEnter = nodeSel.enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => {
        const p = initialCoord(d);
        return `translate(${p.y},${p.x})`;
      })
      .attr("cursor", "pointer")
      .attr("opacity", 1);

    const nodeMerge = nodeEnter.merge(nodeSel as any);
    nodeMerge
      .transition()
      .duration(300)
      .ease(d3.easeCubicOut)
      .attr("transform", (d) => `translate(${d.y},${d.x})`);

    // Update previous positions map
    const newPositions = new Map<string, { x: number; y: number }>();
    nodes.forEach((d) => newPositions.set(d.data.name, { x: d.x ?? 0, y: d.y ?? 0 }));
    prevPositionsRef.current = newPositions;

    // Add rectangular boxes
    nodeMerge
      .append("rect")
      .attr("width", (d) => {
        const textLength = d.data.name.length;
        return Math.max(110, textLength * 7.5 + 16);
      })
      .attr("height", (d) => (d.depth === 0 ? 50 : 42))
      .attr("x", (d) => {
        const textLength = d.data.name.length;
        return -Math.max(110, textLength * 7.5 + 16) / 2;
      })
      .attr("y", (d) => (d.depth === 0 ? -25 : -21))
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("fill", (d) => {
        if (d.data.name === activeName) return "#1e40af"; // blue-800
        if (pathNames.has(d.data.name)) return "#1e3a8a"; // blue-900
        return "#0f172a"; // slate-950
      })
      .attr("stroke", (d) => getNodeColor(d))
      .attr("stroke-width", (d) => {
        if (d.data.name === activeName) return 2.5;
        if (pathNames.has(d.data.name)) return 2.5;
        return 1.5;
      })
      .attr("opacity", 0.95)
      .style("filter", (d) => {
        if (d.data.name === activeName) return "drop-shadow(0 0 10px rgba(59, 130, 246, 0.7))";
        if (pathNames.has(d.data.name)) return "drop-shadow(0 0 6px rgba(99, 102, 241, 0.5))";
        return "none";
      })
      .style("transition", "all 0.2s ease")
      .on("click", (event, d) => {
        event.stopPropagation();
        if (d.children || d._children) {
          // Add scale animation on toggle
          d3.select(event.currentTarget)
            .select("rect")
            .transition()
            .duration(150)
            .attr("transform", "scale(1.1)")
            .transition()
            .duration(150)
            .attr("transform", "scale(1)");
          toggleNode(d.data.name);
        } else {
          setActiveName(d.data.name);
        }
      })
      .on("mouseenter", function(event, d) {
        d3.select(this)
          .select("rect")
          .transition()
          .duration(150)
          .attr("opacity", 1)
          .attr("stroke-width", 3);
      })
      .on("mouseleave", function(event, d) {
        d3.select(this)
          .select("rect")
          .transition()
          .duration(150)
          .attr("opacity", 0.95)
          .attr("stroke-width", (d: any) => {
            if (d.data.name === activeName) return 2.5;
            if (pathNames.has(d.data.name)) return 2.5;
            return 1.5;
          });
      });

    // Add text labels
    nodeMerge
      .append("text")
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("font-size", (d) => (d.depth === 0 ? 18 : 15))
      .attr("font-weight", (d) => {
        if (d.data.name === activeName) return 600;
        if (pathNames.has(d.data.name)) return 500;
        return 400;
      })
      .attr("fill", (d) => {
        if (d.data.name === activeName) return "#e0f2fe"; // sky-100
        if (pathNames.has(d.data.name)) return "#dbeafe"; // blue-100
        return "#cbd5e1"; // slate-300
      })
      .style("transition", "all 0.3s ease")
      .style("pointer-events", "none")
      .text((d) => {
        const maxLength = d.depth === 0 ? 20 : 16;
        return d.data.name.length > maxLength 
          ? d.data.name.substring(0, maxLength) + '...' 
          : d.data.name;
      })
      .attr("opacity", 1);

    // Add expand/collapse indicator for nodes with children
    const expandIndicator = nodeMerge
      .filter((d) => d.children || d._children)
      .append("g")
      .attr("transform", (d) => {
        const textLength = d.data.name.length;
        return `translate(${Math.max(110, textLength * 7.5 + 16) / 2 + 6}, 0)`;
      })
      .attr("cursor", "pointer")
      .attr("opacity", 0);

    expandIndicator
      .transition()
      .duration(500)
      .delay((d, i) => d.depth * 100 + i * 20 + 300)
      .ease(d3.easeCubicOut)
      .attr("opacity", 1);

    expandIndicator
      .append("circle")
      .attr("r", 8)
      .attr("fill", (d) => getNodeColor(d))
      .attr("stroke", "#1e293b")
      .attr("stroke-width", 1.5);

    expandIndicator
      .append("text")
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("font-weight", 700)
      .attr("fill", "#ffffff")
      .text((d) => d.children ? "−" : "+");
  }, [data, activeName, collapsedNodes]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AppBackground />
      
      <div className="relative z-10 h-full w-full px-6 py-4 flex flex-col gap-4">
        {/* Header with Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-50 bg-gradient-to-r from-sky-400 to-purple-500 bg-clip-text text-transparent">
              Memory Mind Map
            </h1>
            <p className="text-sm text-slate-400 mt-1">Explore how signals move through the system.</p>
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            {/* History Navigation */}
            <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-lg p-1 backdrop-blur-sm">
              <button
                onClick={goBack}
                disabled={historyIndex <= 0}
                className="p-2 rounded hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-4 h-4 text-slate-300" />
              </button>
              <button
                onClick={goForward}
                disabled={historyIndex >= navigationHistory.length - 1}
                className="p-2 rounded hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Go forward"
              >
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </button>
              <button
                onClick={goToRoot}
                className="p-2 rounded hover:bg-slate-700/50 transition-colors"
                title="Go to root"
              >
                <Home className="w-4 h-4 text-slate-300" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-lg p-1 backdrop-blur-sm">
              <button
                onClick={handleZoomIn}
                className="p-2 rounded hover:bg-slate-700/50 transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4 text-slate-300" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2 rounded hover:bg-slate-700/50 transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4 text-slate-300" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-2 rounded hover:bg-slate-700/50 transition-colors"
                title="Reset zoom"
              >
                <Maximize2 className="w-4 h-4 text-slate-300" />
              </button>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportSVG}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors backdrop-blur-2xl"
              title="Export as SVG"
            >
              <Download className="w-4 h-4 text-slate-300" />
              <span className="text-xs text-slate-300">Export</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nodes..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-colors backdrop-blur-2xl"
          />
          {searchQuery && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
              {filteredNodes.length} results
            </div>
          )}
        </div>

        {/* Breadcrumb Navigation */}
        {breadcrumb.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-slate-400 bg-white/5 border border-white/10 rounded-lg px-4 py-2 backdrop-blur-2xl overflow-x-auto"
          >
            {breadcrumb.map((node, idx) => (
              <div key={node} className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveName(node)}
                  className={`hover:text-sky-400 transition-colors ${idx === breadcrumb.length - 1 ? 'text-sky-400 font-semibold' : ''}`}
                >
                  {node}
                </button>
                {idx < breadcrumb.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Search Results */}
        {searchQuery && filteredNodes.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-h-32 overflow-y-auto bg-white/5 border border-white/10 rounded-lg p-2 backdrop-blur-2xl"
          >
            <div className="space-y-1">
              {filteredNodes.slice(0, 5).map((node) => (
                <button
                  key={node.name}
                  onClick={() => {
                    setActiveName(node.name);
                    setSearchQuery("");
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-white/10 transition-colors group"
                >
                  <div className="text-sm text-slate-200 group-hover:text-sky-400 transition-colors">
                    {node.name}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {node.description}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 flex-1 min-h-0">
        <div className="col-span-1 xl:col-span-2 rounded-2xl border border-white/10 bg-white/5 shadow-2xl overflow-hidden backdrop-blur-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-purple-500/5 pointer-events-none"></div>
          <svg ref={svgRef} className="w-full h-[540px] xl:h-full relative z-10" />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col gap-4 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-purple-500/5 pointer-events-none"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Focused Node</p>
              <h2 className="text-2xl font-bold text-slate-50 leading-tight">{activeNode?.name}</h2>
            </div>
            <span className="text-xs font-semibold text-slate-300 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 shadow-sm backdrop-blur-xl">
              {activeNode?.children ? `${activeNode.children.length} ${activeNode.children.length === 1 ? 'branch' : 'branches'}` : "Leaf node"}
            </span>
          </div>

          <div className="relative z-10 bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-xl">
            <p className="text-sm text-slate-200 leading-relaxed">{activeNode?.description}</p>
          </div>

          {activeNode?.highlights && activeNode.highlights.length > 0 && (
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Key Features</p>
              <div className="flex flex-wrap gap-2">
                {activeNode.highlights.map((item, idx) => (
                  <span
                    key={item}
                    className="text-xs font-medium text-slate-100 bg-gradient-to-r from-sky-500/20 to-purple-500/20 border border-sky-400/30 rounded-full px-3 py-1.5 shadow-sm backdrop-blur-sm"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeNode?.children && activeNode.children.length > 0 && (
            <div className="mt-auto relative z-10">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Navigate to</p>
              <div className="flex flex-wrap gap-2">
                {activeNode.children.map((child) => (
                  <button
                    key={child.name}
                    onClick={() => navigateToNode(child.name)}
                    className="text-xs font-medium text-slate-100 bg-slate-800/80 border border-slate-700/80 hover:border-sky-400 hover:bg-sky-500/10 hover:text-sky-200 rounded-lg px-3 py-2 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(!activeNode?.children || activeNode.children.length === 0) && (
            <div className="mt-auto relative z-10 bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
              <p className="text-xs text-slate-400 text-center italic">This is a leaf node with no children.</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
