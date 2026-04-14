import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import {
  GraphNode, GraphLink, GraphData,
  fetchGraphData, searchGraph, filterByCategory, filterByThreshold, getNodeColor,
} from '../services/graphDataService';

// ── Props ──────────────────────────────────────────────────
interface KnowledgeGraphProps {
  searchQuery: string;
  activeCategory: string;
  matchThreshold: number;
  isLight: boolean;
  language: string;
  onNodeClick?: (node: GraphNode) => void;
  highlightedUserId?: string;
}

// ── Node type labels ───────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  symbol: 'Symbol', culture: 'Tradition', user: 'Traumer',
  emotion: 'Emotion', element: 'Element',
};

// ── Component ──────────────────────────────────────────────
const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  searchQuery,
  activeCategory,
  matchThreshold,
  isLight,
  language,
  onNodeClick,
  highlightedUserId,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const nodeSelRef = useRef<d3.Selection<SVGGElement, GraphNode, SVGGElement, unknown> | null>(null);
  const linkSelRef = useRef<d3.Selection<SVGLineElement, any, SVGGElement, unknown> | null>(null);

  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  // ── Load data ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchGraphData(50).then(data => {
      if (!cancelled) {
        setGraphData(data);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  // ── Measure container ──────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setDimensions({ width, height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Filter + search ────────────────────────────────────
  const filteredData = useMemo(() => {
    let { nodes, links } = filterByCategory(activeCategory, graphData.nodes, graphData.links);
    links = filterByThreshold(matchThreshold, links);
    return { nodes, links };
  }, [graphData, activeCategory, matchThreshold]);

  const highlightedIds = useMemo(
    () => searchGraph(searchQuery, filteredData.nodes, filteredData.links),
    [searchQuery, filteredData.nodes, filteredData.links],
  );

  const userHighlightIds = useMemo(() => {
    if (!highlightedUserId) return new Set<string>();
    const userId = `usr_${highlightedUserId}`;
    const ids = new Set<string>([userId]);
    for (const link of filteredData.links) {
      const src = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
      const tgt = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;
      if (src === userId) ids.add(tgt);
      if (tgt === userId) ids.add(src);
    }
    return ids;
  }, [highlightedUserId, filteredData.links]);

  // ── Search state as ref (for tick handler access without stale closures) ──
  const searchStateRef = useRef({ query: '', ids: new Set<string>(), userIds: new Set<string>() });
  searchStateRef.current = { query: searchQuery, ids: highlightedIds, userIds: userHighlightIds };

  const getNodeOpacity = useCallback((node: GraphNode) => {
    const { query, ids, userIds } = searchStateRef.current;
    if (query.trim().length >= 2 && ids.size > 0) {
      return ids.has(node.id) ? 1 : 0;
    }
    if (userIds.size > 0) {
      return userIds.has(node.id) ? 1 : 0;
    }
    return 1;
  }, []);

  // ── D3 Simulation ──────────────────────────────────────
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (!svg.node() || filteredData.nodes.length === 0) return;

    const { width, height } = dimensions;

    // Clear previous
    svg.selectAll('*').remove();

    // Create deep copies for D3 (it mutates the data)
    const nodes: GraphNode[] = filteredData.nodes.map(n => ({ ...n }));
    const links: GraphLink[] = filteredData.links.map(l => ({
      ...l,
      source: typeof l.source === 'string' ? l.source : (l.source as GraphNode).id,
      target: typeof l.target === 'string' ? l.target : (l.target as GraphNode).id,
    }));

    // SVG defs for glow
    const defs = svg.append('defs');
    const glowFilter = defs.append('filter').attr('id', 'glow');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Container group for zoom/pan
    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8).translate(-width / 2, -height / 2));

    // Force simulation
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, any>(links)
        .id((d: any) => d.id)
        .distance((d: any) => 120 - (d.strength || 1) * 20)
        .strength((d: any) => (d.strength || 1) * 0.12))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<GraphNode>().radius(d => (d.size || 8) + 6))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05))
      .alphaDecay(0.1)
      .alphaMin(0.001)
      .velocityDecay(0.75);

    simRef.current = simulation;

    // Draw links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll<SVGLineElement, any>('line')
      .data(links)
      .join('line')
      .attr('stroke', isLight ? '#94a3b8' : '#475569')
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', (d: any) => Math.max(1, d.strength * 1.2));

    // Draw nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.1).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          // Node bleibt fixiert wo der User es hingelegt hat
          // Doppelklick zum Lösen (wird unten registriert)
        }));

    // Node circle
    node.append('circle')
      .attr('r', d => d.size)
      .attr('fill', d => d.color)
      .attr('stroke', isLight ? '#e2e8f0' : '#0f172a')
      .attr('stroke-width', 1.5)
      .attr('opacity', 1);

    // Node label
    node.append('text')
      .text(d => d.metadata?.emoji ? `${d.metadata.emoji} ${d.label}` : d.label)
      .attr('dy', d => d.size + 14)
      .attr('text-anchor', 'middle')
      .attr('font-size', d => d.size > 14 ? '11px' : '9px')
      .attr('font-family', 'inherit')
      .attr('fill', isLight ? '#334155' : '#94a3b8')
      .attr('opacity', 1)
      .attr('pointer-events', 'none');

    // Hover + Click handlers
    node.on('mouseenter', function(event, d) {
      // Don't show hover effects for hidden (non-matching) nodes
      const { query, ids } = searchStateRef.current;
      const hasSearch = query.trim().length >= 2 && ids.size > 0;
      if (hasSearch && !ids.has(d.id)) return;

      d3.select(this).select('circle')
        .transition().duration(150)
        .attr('filter', 'url(#glow)')
        .attr('r', d.size * 1.3);
      setHoveredNode(d);
    });

    node.on('mouseleave', function(event, d) {
      d3.select(this).select('circle')
        .transition().duration(150)
        .attr('filter', null)
        .attr('r', d.size);
      setHoveredNode(null);
    });

    // Double-click to unfix a dragged node
    node.on('dblclick', (event, d) => {
      event.stopPropagation();
      d.fx = null;
      d.fy = null;
      simulation.alpha(0.1).restart();
    });

    node.on('click', (event, d) => {
      event.stopPropagation();
      setSelectedNode(prev => prev?.id === d.id ? null : d);
      onNodeClick?.(d);
    });

    // Click on background to deselect
    svg.on('click', () => setSelectedNode(null));

    // Store selections for the opacity effect
    nodeSelRef.current = node;
    linkSelRef.current = link;

    // Tick — update positions + apply search highlights every frame
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);

      // Apply search/highlight opacity (reads from ref, no stale closure)
      const { query, ids, userIds } = searchStateRef.current;
      const hasSearch = query.trim().length >= 2 && ids.size > 0;
      const hasUserHighlight = userIds.size > 0;
      const hasFilter = hasSearch || hasUserHighlight;
      const visibleIds = hasSearch ? ids : userIds;

      node.select('circle')
        .attr('opacity', (d: any) => hasFilter ? (visibleIds.has(d.id) ? 1 : 0) : 1)
        .attr('r', (d: any) => hasSearch && ids.has(d.id) ? d.size * 1.4 : d.size);

      node.select('text')
        .attr('opacity', (d: any) => hasFilter ? (visibleIds.has(d.id) ? 1 : 0) : 1);

      // Hide non-matching nodes completely (no hover/interaction)
      node.attr('pointer-events', (d: any) => hasFilter && !visibleIds.has(d.id) ? 'none' : 'auto');

      link
        .attr('stroke-opacity', (d: any) => {
          if (!hasFilter) return 0.5;
          const src = typeof d.source === 'string' ? d.source : d.source.id;
          const tgt = typeof d.target === 'string' ? d.target : d.target.id;
          return (visibleIds.has(src) && visibleIds.has(tgt)) ? 0.8 : 0;
        })
        .attr('stroke-width', (d: any) => {
          if (!hasFilter) return Math.max(1, (d.strength || 1) * 1.2);
          const src = typeof d.source === 'string' ? d.source : d.source.id;
          const tgt = typeof d.target === 'string' ? d.target : d.target.id;
          return (visibleIds.has(src) && visibleIds.has(tgt)) ? 2.5 : 0;
        });
    });

    return () => {
      simulation.stop();
      nodeSelRef.current = null;
      linkSelRef.current = null;
    };
  }, [filteredData, dimensions, isLight, onNodeClick]);

  // ── Nudge simulation on search change so tick handler applies opacity ──
  useEffect(() => {
    const sim = simRef.current;
    if (sim) {
      sim.alpha(0.005).restart();
    }
  }, [searchQuery, highlightedIds, highlightedUserId]);

  // ── Render ─────────────────────────────────────────────
  const bgColor = isLight ? '#f8fafc' : '#0a0e1a';
  const panelBg = isLight ? 'bg-white/95 border-gray-200' : 'bg-[#111827]/95 border-white/10';
  const textPrimary = isLight ? 'text-gray-900' : 'text-white';
  const textSecondary = isLight ? 'text-gray-500' : 'text-gray-400';

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-0 overflow-hidden rounded-2xl" style={{ background: bgColor }}>
      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span className={`text-sm ${textSecondary}`}>Knowledge Graph laden...</span>
          </div>
        </div>
      )}

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />

      {/* Legend (top-left) */}
      <div className={`absolute top-3 left-3 flex flex-wrap gap-1.5 text-[10px] ${textSecondary}`}>
        {(['symbol', 'culture', 'emotion', 'element', 'user'] as const).map(type => (
          <span key={type} className="flex items-center gap-1 opacity-70">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: getNodeColor(type) }} />
            {TYPE_LABELS[type]}
          </span>
        ))}
      </div>

      {/* Node count + search status (top-right) */}
      <div className={`absolute top-3 right-3 text-[10px] ${textSecondary} opacity-60`}>
        {searchQuery && highlightedIds.size > 0 ? (
          <span className="text-violet-400 font-semibold">
            {highlightedIds.size} Treffer
          </span>
        ) : (
          <>{filteredData.nodes.length} Knoten &middot; {filteredData.links.length} Verbindungen</>
        )}
      </div>

      {/* Hovered node tooltip */}
      {hoveredNode && !selectedNode && (
        <div className={`absolute bottom-3 left-3 right-3 mx-auto max-w-xs rounded-xl border px-3 py-2 backdrop-blur-md ${panelBg}`}>
          <div className="flex items-center gap-2">
            {hoveredNode.metadata?.emoji && <span className="text-lg">{hoveredNode.metadata.emoji}</span>}
            <div>
              <span className={`text-sm font-semibold ${textPrimary}`}>{hoveredNode.label}</span>
              <span className={`text-[10px] ml-2 px-1.5 py-0.5 rounded-full`}
                style={{ backgroundColor: hoveredNode.color + '30', color: hoveredNode.color }}>
                {TYPE_LABELS[hoveredNode.type]}
              </span>
            </div>
          </div>
          {hoveredNode.metadata?.frequency && (
            <p className={`text-[10px] mt-0.5 ${textSecondary}`}>
              {hoveredNode.metadata.frequency}x getraeumt
            </p>
          )}
        </div>
      )}

      {/* Selected node detail panel */}
      {selectedNode && (
        <div className={`absolute top-2 right-2 w-64 max-h-[calc(100%-16px)] overflow-y-auto rounded-2xl border p-3 backdrop-blur-md ${panelBg}`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {selectedNode.metadata?.emoji && <span className="text-xl">{selectedNode.metadata.emoji}</span>}
              <div>
                <h3 className={`text-sm font-bold ${textPrimary}`}>{selectedNode.label}</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: selectedNode.color + '30', color: selectedNode.color }}>
                  {TYPE_LABELS[selectedNode.type]}
                </span>
              </div>
            </div>
            <button onClick={() => setSelectedNode(null)}
              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${isLight ? 'hover:bg-gray-100 text-gray-400' : 'hover:bg-white/10 text-white/40'}`}>
              <span className="material-icons text-sm">close</span>
            </button>
          </div>

          {selectedNode.metadata?.kategorie && (
            <p className={`text-[10px] ${textSecondary} mb-1`}>Kategorie: {selectedNode.metadata.kategorie}</p>
          )}
          {selectedNode.metadata?.frequency && (
            <p className={`text-[10px] ${textSecondary} mb-1`}>{selectedNode.metadata.frequency}x in Traeumen gefunden</p>
          )}
          {selectedNode.metadata?.interpretationSummary && (
            <p className={`text-xs ${textSecondary} mt-2 leading-relaxed`}>{selectedNode.metadata.interpretationSummary}</p>
          )}

          {/* Connected nodes */}
          <div className="mt-3 pt-2 border-t border-white/5">
            <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${textSecondary}`}>Verbunden mit</p>
            <div className="flex flex-wrap gap-1">
              {filteredData.links
                .filter(l => {
                  const src = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
                  const tgt = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
                  return src === selectedNode.id || tgt === selectedNode.id;
                })
                .slice(0, 10)
                .map((l, i) => {
                  const otherId = (typeof l.source === 'string' ? l.source : (l.source as GraphNode).id) === selectedNode.id
                    ? (typeof l.target === 'string' ? l.target : (l.target as GraphNode).id)
                    : (typeof l.source === 'string' ? l.source : (l.source as GraphNode).id);
                  const otherNode = filteredData.nodes.find(n => n.id === otherId);
                  if (!otherNode) return null;
                  return (
                    <button key={i}
                      onClick={() => { setSelectedNode(otherNode); onNodeClick?.(otherNode); }}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                        isLight ? 'border-gray-200 hover:bg-gray-50' : 'border-white/10 hover:bg-white/5'
                      }`}
                      style={{ color: otherNode.color }}>
                      {otherNode.metadata?.emoji || ''} {otherNode.label}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraph;
