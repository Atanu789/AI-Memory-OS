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
  Home,
  RefreshCw,
  Code,
  GitPullRequest,
  GitFork,
  Star,
  MessageCircle,
  Plus,
  Trash2,
  GitBranch,
  Calendar
} from 'lucide-react';
import apiService, { TimelineData } from '../services/api.service';

// UI types
type MindMapNode = {
  name: string;
  description: string;
  highlights?: string[];
  children?: MindMapNode[];
  _children?: MindMapNode[]; // Hidden children for collapse functionality
};

type Repository = {
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
};

type D3HierarchyNode = d3.HierarchyPointNode<MindMapNode> & {
  _children?: D3HierarchyNode[];
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
  const [viewMode, setViewMode] = useState<'repos' | 'graph'>("repos");
  
  // Knowledge graph state
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [repoMap, setRepoMap] = useState<Map<string, Repository>>(new Map());
  const [repoAnalysis, setRepoAnalysis] = useState<{
    whatYouDid: string[];
    whenYouDid: string;
    patterns: string[];
    strengths: string[];
    weaknesses: string[];
  } | null>(null);
  const [analysisCache, setAnalysisCache] = useState<Map<string, {
    whatYouDid: string[];
    whenYouDid: string;
    patterns: string[];
    strengths: string[];
    weaknesses: string[];
  }>>(new Map());
  type CommitItem = {
    sha: string;
    message: string;
    date: string;
  };
  const [commitCache, setCommitCache] = useState<Map<string, CommitItem[]>>(new Map());
  const [cacheVersion, setCacheVersion] = useState<number>(0);
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] } | null>(null);
  const [timelinePeriod, setTimelinePeriod] = useState<'week' | 'month' | 'all'>('month');
  const [repoTimeline, setRepoTimeline] = useState<TimelineData | null>(null);

  // Fetch repositories (root nodes)
  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const data = await apiService.getRepositories();
        const repoList: Repository[] = data.repositories || [];
        setRepos(repoList);
        const map = new Map<string, Repository>();
        repoList.forEach((r) => {
          map.set(r.name, r);
        });
        setRepoMap(map);
      } catch (error) {
        console.error('Failed to load repositories', error);
      }
    };
    fetchRepos();
  }, []);

  // Fetch graph data when switching to graph mode
  useEffect(() => {
    const fetchGraph = async () => {
      if (viewMode !== 'graph') return;
      try {
        const data = await apiService.getGraph({ focus: 'last_30_days', depth: 2, minImportance: 0.3 });
        if (data?.nodes?.length) setGraphData(data);
      } catch (err) {
        console.error('Failed to load graph', err);
      }
    };
    fetchGraph();
  }, [viewMode]);

  // Build MindMap hierarchy from repositories
  const transformReposToHierarchy = (repositories: Repository[]): MindMapNode => {
    const repoNodes: MindMapNode[] = repositories.map((repo) => {
      const key = repo.full_name || `${repo.name}`;
      const commits = commitCache.get(key) || [];
      const commitChildren: MindMapNode[] = commits.map((c) => ({
        name: c.message.length > 28 ? c.message.slice(0, 28) + '…' : c.message,
        description: `${c.sha.slice(0,7)} • ${new Date(c.date).toLocaleString()}`,
        highlights: ['commit'],
      }));

      return {
        name: repo.name,
        description: repo.description || 'No description provided',
        highlights: [
          repo.language || 'Unknown language',
          `${repo.stargazers_count}★`,
          `${repo.forks_count} forks`,
        ],
        children: [
          ...(repo.topics || []).map((topic) => ({
            name: topic,
            description: `Topic in ${repo.name}`,
          })),
          ...commitChildren,
        ],
      };
    });

    return {
      name: 'Repositories',
      description: 'Your GitHub repositories as root nodes',
      highlights: ['Click a repo to see AI analysis'],
      children: repoNodes,
    };
  };

  // Transform backend graph to hierarchical structure
  const transformGraphToHierarchy = (graph: { nodes: any[]; edges: any[] }): MindMapNode => {
    const nodeMap = new Map<string, MindMapNode>();
    graph.nodes.forEach((node: any) => {
      nodeMap.set(node.id, {
        name: node.label || node.id,
        description: node.summary || '',
        highlights: [node.type || 'node'],
        children: [],
      });
    });

    const childrenMap = new Map<string, string[]>();
    graph.edges.forEach((edge: any) => {
      const from = edge.from || edge.source;
      const to = edge.to || edge.target;
      if (!childrenMap.has(from)) childrenMap.set(from, []);
      childrenMap.get(from)!.push(to);
    });

    const hasParent = new Set((graph.edges || []).map((e: any) => e.to || e.target));
    const rootNodes: MindMapNode[] = [];
    graph.nodes.forEach((node: any) => {
      if (!hasParent.has(node.id)) {
        const n = nodeMap.get(node.id);
        if (n) rootNodes.push(n);
      }
    });

    const buildChildren = (id: string, visited = new Set<string>()) => {
      if (visited.has(id)) return;
      visited.add(id);
      const childIds = childrenMap.get(id) || [];
      const node = nodeMap.get(id);
      if (!node) return;
      node.children = childIds.map((cid) => nodeMap.get(cid)).filter(Boolean) as MindMapNode[];
      childIds.forEach((cid) => buildChildren(cid, visited));
    };
    graph.nodes.forEach((n: any) => buildChildren(n.id));

    return {
      name: 'Knowledge Graph',
      description: `${graph.nodes.length} memories • ${graph.edges.length} connections`,
      highlights: ['Live data', 'Auto-synced', 'Semantic links'],
      children: rootNodes.length > 0 ? rootNodes : Array.from(nodeMap.values()).slice(0, 10),
    };
  };

  const data = useMemo<MindMapNode>(
    () => {
      if (viewMode === 'repos') {
        if (repos.length > 0) {
          return transformReposToHierarchy(repos);
        }
        return {
          name: "Repositories",
          description: "Click 'Sync' to load your repositories",
          highlights: ["No data yet"],
          children: [],
        };
      }
      if (graphData && graphData.nodes?.length) {
        return transformGraphToHierarchy(graphData);
      }
      return {
        name: "Knowledge Graph",
        description: "Click 'Sync' to load your memory graph",
        highlights: ["No data yet"],
        children: [],
      };
    },
    [viewMode, repos, graphData, cacheVersion]
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

  // Load AI analysis when a repo is focused
  useEffect(() => {
    const repo = repoMap.get(activeName);
    if (!repo) {
      setRepoAnalysis(null);
      setRepoTimeline(null);
      return;
    }

    const load = async () => {
      try {
        const [owner] = repo.full_name.split('/');
        const key = repo.full_name;
        // Use cache if available
        if (analysisCache.has(key)) {
          setRepoAnalysis(analysisCache.get(key)!);
          return;
        }
        const data = await apiService.analyzeRepository(owner, repo.name);
        const analysisData = data.analysis;
        setRepoAnalysis(analysisData);
        // Update caches for analysis and commits
        setAnalysisCache(prev => {
          const next = new Map(prev);
          next.set(key, analysisData);
          return next;
        });
        const commits: CommitItem[] = (data.commits || []).map((c: any) => ({
          sha: c.sha,
          message: c.commit?.message || '',
          date: c.commit?.author?.date || new Date().toISOString(),
        }));
        setCommitCache(prev => {
          const next = new Map(prev);
          next.set(key, commits);
          return next;
        });
        setCacheVersion(v => v + 1);

        // Load timeline and filter for this repo
        try {
          const tl = await apiService.getTimelineData(timelinePeriod);
          const filteredActivities: TimelineData['activities'] = {};
          Object.entries(tl.activities || {}).forEach(([date, acts]) => {
            const f = acts.filter((a: any) => {
              const name = a?.repo?.name || '';
              return name === key || name.endsWith(`/${repo.name}`) || name.includes(repo.name);
            });
            if (f.length > 0) filteredActivities[date] = f;
          });
          const total = Object.values(filteredActivities).reduce((sum, arr) => sum + arr.length, 0);
          setRepoTimeline({ activities: filteredActivities, insight: tl.insight, totalActivities: total });
        } catch (err) {
          console.error('Failed to load timeline for repo', err);
          setRepoTimeline(null);
        }
      } catch (error) {
        console.error('Failed to analyze repository', error);
        setRepoAnalysis(null);
        setRepoTimeline(null);
      }
    };

    load();
  }, [activeName, repoMap]);

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

    const root = d3.hierarchy<MindMapNode>(data) as unknown as D3HierarchyNode;
    
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
    const LEVEL_X_OFFSET = 40; // extra horizontal spacing per depth
    const tree = d3
      .tree<MindMapNode>()
      .size([height - 180, width - 240])
      .separation((a, b) => {
        const la = a.data.name.length;
        const lb = b.data.name.length;
        const base = a.parent === b.parent ? 1.6 : 2.2;
        const extra = Math.min((la + lb) / 60, 0.6);
        return base + extra;
      });

    tree(root);

    // Minimal color palette
    const getNodeColor = (d: D3HierarchyNode) => {
      if (d.data.name === activeName) return "#3b82f6"; // blue-500
      if (pathNames.has(d.data.name)) return "#6366f1"; // indigo-500
      return "#64748b"; // slate-500
    };

    // Previous positions for smooth transitions
    const prevPositions = prevPositionsRef.current;

    // Helper to compute initial position (prev or parent's prev)
    const initialCoord = (d: D3HierarchyNode) => {
      const prev = prevPositions.get(d.data.name);
      if (prev) return { x: prev.x, y: prev.y };
      if (d.parent) {
        const pprev = prevPositions.get(d.parent.data.name);
        if (pprev) return { x: pprev.x, y: pprev.y };
      }
      return { x: d.x, y: d.y + d.depth * LEVEL_X_OFFSET };
    };

    const nodes = root.descendants() as D3HierarchyNode[];
    const linksData = root.links();

    // Horizontal links generator
    const linkGen = d3
      .linkHorizontal<d3.HierarchyPointLink<MindMapNode>, any>()
      .x((d: any) => (d.y + (d.depth || 0) * LEVEL_X_OFFSET))
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

    // Enter: create rect
    nodeEnter
      .append("rect")
      .attr("rx", 6)
      .attr("ry", 6);

    // Enter: create text
    nodeEnter
      .append("text")
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .style("pointer-events", "none");

    // Update + Enter merged
    const nodeMerge = nodeEnter.merge(nodeSel as any);
    nodeMerge
      .transition()
      .duration(300)
      .ease(d3.easeCubicOut)
      .attr("transform", (d) => `translate(${d.y + d.depth * LEVEL_X_OFFSET},${d.x})`);

    // Update previous positions map
    const newPositions = new Map<string, { x: number; y: number }>();
    nodes.forEach((d) => newPositions.set(d.data.name, { x: d.x, y: d.y + d.depth * LEVEL_X_OFFSET }));
    prevPositionsRef.current = newPositions;

    // Update rect attributes and handlers
    const rectMerge = nodeMerge.select<SVGRectElement>("rect");
    rectMerge
      .attr("width", (d: any) => {
        const textLength = d.data.name.length;
        return Math.max(110, textLength * 7.5 + 16);
      })
      .attr("height", (d: any) => (d.depth === 0 ? 50 : 42))
      .attr("x", (d: any) => {
        const textLength = d.data.name.length;
        return -Math.max(110, textLength * 7.5 + 16) / 2;
      })
      .attr("y", (d: any) => (d.depth === 0 ? -25 : -21))
      .attr("fill", (d: any) => {
        if (d.data.name === activeName) return "#1e40af"; // blue-800
        if (pathNames.has(d.data.name)) return "#1e3a8a"; // blue-900
        return "#0f172a"; // slate-950
      })
      .attr("stroke", (d: any) => getNodeColor(d as any))
      .attr("stroke-width", (d: any) => {
        if (d.data.name === activeName) return 2.5;
        if (pathNames.has(d.data.name)) return 2.5;
        return 1.5;
      })
      .attr("opacity", 0.95)
      .style("filter", (d: any) => {
        if (d.data.name === activeName) return "drop-shadow(0 0 10px rgba(59, 130, 246, 0.7))";
        if (pathNames.has(d.data.name)) return "drop-shadow(0 0 6px rgba(99, 102, 241, 0.5))";
        return "none";
      })
      .style("transition", "all 0.2s ease")
      .on("click", (event: any, d: any) => {
        event.stopPropagation();
        if (d.children || (d as any)._children) {
          d3.select(event.currentTarget)
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
      .on("mouseenter", function(this: SVGRectElement, _event, _d: any) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", 1)
          .attr("stroke-width", 3);
      })
      .on("mouseleave", function(this: SVGRectElement, _event, d: any) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", 0.95)
          .attr("stroke-width", () => {
            if (d.data.name === activeName) return 2.5;
            if (pathNames.has(d.data.name)) return 2.5;
            return 1.5;
          });
      });

    // Update text attributes
    const textMerge = nodeMerge.select<SVGTextElement>("text");
    textMerge
      .attr("font-size", (d: any) => (d.depth === 0 ? 18 : 15))
      .attr("font-weight", (d: any) => {
        if (d.data.name === activeName) return 600;
        if (pathNames.has(d.data.name)) return 500;
        return 400;
      })
      .attr("fill", (d: any) => {
        if (d.data.name === activeName) return "#e0f2fe"; // sky-100
        if (pathNames.has(d.data.name)) return "#dbeafe"; // blue-100
        return "#cbd5e1"; // slate-300
      })
      .style("transition", "all 0.3s ease")
      .text((d: any) => {
        const maxLength = d.depth === 0 ? 20 : 16;
        return d.data.name.length > maxLength
          ? d.data.name.substring(0, maxLength) + "..."
          : d.data.name;
      })
      .attr("opacity", 1);

    // Reset and add expand/collapse indicator to avoid duplicates
    nodeMerge.selectAll("g.expand-indicator").remove();
    const indicatorParent = nodeMerge
      .filter((d: any) => Boolean(d.children) || Boolean((d as any)._children))
      .append("g")
      .attr("class", "expand-indicator")
      .attr("transform", (d: any) => {
        const textLength = d.data.name.length;
        return `translate(${Math.max(110, textLength * 7.5 + 16) / 2 + 6}, 0)`;
      })
      .attr("cursor", "pointer")
      .attr("opacity", 0);

    indicatorParent
      .transition()
      .duration(500)
      .delay((d: any, i: number) => d.depth * 100 + i * 20 + 300)
      .ease(d3.easeCubicOut)
      .attr("opacity", 1);

    indicatorParent
      .append("circle")
      .attr("r", 8)
      .attr("fill", (d: any) => getNodeColor(d as any))
      .attr("stroke", "#1e293b")
      .attr("stroke-width", 1.5);

    indicatorParent
      .append("text")
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("font-weight", 700)
      .attr("fill", "#ffffff")
      .text((d: any) => (d.children ? "−" : "+"));
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
            <p className="text-sm text-slate-400 mt-1">
              {viewMode === 'repos'
                ? (repos.length > 0 ? `Repositories • ${repos.length} loaded` : 'Explore how signals move through the system.')
                : (graphData?.nodes?.length ? `Knowledge Graph • ${graphData.nodes.length} memories • ${graphData.edges.length} connections` : 'Explore how signals move through the system.')}
            </p>
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-lg p-1 backdrop-blur-sm">
              <button
                onClick={() => setViewMode('repos')}
                className={`p-2 rounded transition-colors ${viewMode === 'repos' ? 'bg-sky-500/20 border border-sky-500/50' : 'hover:bg-slate-700/50'}`}
                title="Repositories view"
              >
                <span className="text-xs text-slate-200">Repos</span>
              </button>
              <button
                onClick={() => setViewMode('graph')}
                className={`p-2 rounded transition-colors ${viewMode === 'graph' ? 'bg-purple-500/20 border border-purple-500/50' : 'hover:bg-slate-700/50'}`}
                title="Knowledge graph view"
              >
                <span className="text-xs text-slate-200">Graph</span>
              </button>
            </div>
            {/* Sync Button */}
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  await apiService.syncMemories();
                  setTimeout(async () => {
                    if (viewMode === 'repos') {
                      const data = await apiService.getRepositories();
                      const repoList: Repository[] = data.repositories || [];
                      setRepos(repoList);
                      const map = new Map<string, Repository>();
                      repoList.forEach((r) => map.set(r.name, r));
                      setRepoMap(map);
                    } else {
                      const data = await apiService.getGraph({ focus: 'last_30_days', depth: 2, minImportance: 0.3 });
                      setGraphData(data);
                    }
                  }, 2000);
                } catch (error) {
                  console.error('Sync failed:', error);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-sky-500/20 border border-sky-500/50 rounded-lg hover:bg-sky-500/30 transition-colors backdrop-blur-2xl disabled:opacity-50"
              title="Sync memories from GitHub"
            >
              <RefreshCw className={`w-4 h-4 text-sky-400 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm text-sky-300 font-medium">
                {loading ? 'Syncing...' : 'Sync'}
              </span>
            </button>

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

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col gap-4 shadow-2xl backdrop-blur-2xl relative overflow-y-auto max-h-[540px] xl:max-h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-purple-500/5 pointer-events-none"></div>
          {repoTimeline && repoMap.has(activeNode.name) && (
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-blue-400" />
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Timeline</h3>
                  </div>
                <div className="flex items-center gap-2">
                  {(['week','month','all'] as const).map(p => (
                    <button
                      key={p}
                      onClick={async () => {
                        try {
                          setTimelinePeriod(p);
                          const tl = await apiService.getTimelineData(p);
                          const repo = repoMap.get(activeNode.name)!;
                          const key = repo.full_name;
                          const filtered: TimelineData['activities'] = {};
                          Object.entries(tl.activities || {}).forEach(([date, acts]) => {
                            const f = acts.filter((a: any) => {
                              const nm = a?.repo?.name || '';
                              return nm === key || nm.endsWith(`/${repo.name}`) || nm.includes(repo.name);
                            });
                            if (f.length > 0) filtered[date] = f;
                          });
                          const total = Object.values(filtered).reduce((s, arr) => s + arr.length, 0);
                          setRepoTimeline({ activities: filtered, insight: tl.insight, totalActivities: total });
                        } catch (err) {
                          console.error('Timeline reload failed', err);
                        }
                      }}
                      className={`px-2 py-1 rounded text-xs ${timelinePeriod===p ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300' : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'}`}
                    >{p}</button>
                  ))}
                </div>
              </div>
              {repoTimeline.insight && (
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-3">
                  <p className="text-sm text-slate-200">{repoTimeline.insight}</p>
                </div>
              )}
              <div className="space-y-3">
                {Object.entries(repoTimeline.activities).map(([date, acts]) => (
                  <div key={date} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="text-xs text-slate-400 px-2 py-1 rounded-full bg-white/5 border border-white/10">{date}</span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                    <div className="space-y-2">
                      {acts.slice(0,5).map((a: any) => (
                        <div key={a.id} className="group flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-2xl hover:border-white/20 hover:bg-white/10 transition-all duration-300">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                            {(() => {
                              const t = a.type;
                              if (t === 'PushEvent') return <Code className="w-4 h-4" />;
                              if (t === 'PullRequestEvent') return <GitPullRequest className="w-4 h-4" />;
                              if (t === 'ForkEvent') return <GitFork className="w-4 h-4" />;
                              if (t === 'WatchEvent') return <Star className="w-4 h-4" />;
                              if (t === 'IssuesEvent') return <MessageCircle className="w-4 h-4" />;
                              if (t === 'CreateEvent') return <Plus className="w-4 h-4" />;
                              if (t === 'DeleteEvent') return <Trash2 className="w-4 h-4" />;
                              return <GitBranch className="w-4 h-4" />;
                            })()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[11px] font-medium">
                                {String(a.type).replace('Event','')}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 truncate">
                              {a.repo?.name}
                            </p>
                            {a.payload?.commits && a.payload.commits.length > 0 && (
                              <p className="text-[11px] text-slate-500 line-clamp-1">
                                {a.payload.commits[0].message}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {repoTimeline.totalActivities === 0 && (
                  <div className="text-xs text-slate-500">No activity found for this repository.</div>
                )}
              </div>
            </div>
          )}
          
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

          {repoMap.has(activeNode.name) && !repoAnalysis && (
            <div className="relative z-10 bg-slate-800/40 border border-slate-700/60 rounded-lg p-3 text-sm text-slate-300">
              Fetching AI analysis for this repository...
            </div>
          )}

          {repoAnalysis && repoMap.has(activeNode.name) && (
            <div className="relative z-10 space-y-3">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">AI Analysis</p>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-3">
                  <p className="text-xs text-slate-400 font-semibold mb-1">What you did</p>
                  <ul className="list-disc list-inside text-sm text-slate-100 space-y-1">
                    {repoAnalysis.whatYouDid.map((item, idx) => (
                      <li key={`${item}-${idx}`}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-3">
                  <p className="text-xs text-slate-400 font-semibold mb-1">When</p>
                  <p className="text-sm text-slate-100">{repoAnalysis.whenYouDid}</p>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-3">
                  <p className="text-xs text-slate-400 font-semibold mb-1">Patterns</p>
                  <ul className="list-disc list-inside text-sm text-slate-100 space-y-1">
                    {repoAnalysis.patterns.map((item, idx) => (
                      <li key={`${item}-${idx}`}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-3">
                  <p className="text-xs text-slate-400 font-semibold mb-1">Strengths</p>
                  <ul className="list-disc list-inside text-sm text-slate-100 space-y-1">
                    {repoAnalysis.strengths.map((item, idx) => (
                      <li key={`${item}-${idx}`}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-3">
                  <p className="text-xs text-slate-400 font-semibold mb-1">Weaknesses</p>
                  <ul className="list-disc list-inside text-sm text-slate-100 space-y-1">
                    {repoAnalysis.weaknesses.map((item, idx) => (
                      <li key={`${item}-${idx}`}>{item}</li>
                    ))}
                  </ul>
                </div>
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
