import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import {
  GraphNode, GraphLink, GraphData,
  fetchGraphData, searchGraph, filterByCategory, filterByThreshold, getNodeColor,
  searchDreamsFulltext, filterSymbolsByDemographics, TRANSLATE_MAP,
} from '../services/graphDataService';
import DreamListPanel from './DreamListPanel';
import { useNodeExpansion } from '../hooks/useNodeExpansion';

// ── Props ──────────────────────────────────────────────────
interface KnowledgeGraphProps {
  searchQuery: string;
  activeCategory: string;
  matchThreshold: number;
  isLight: boolean;
  language: string;
  onNodeClick?: (node: GraphNode) => void;
  highlightedUserId?: string;
  // Demographische Filter
  filterGender?: 'all' | 'male' | 'female';
  filterAgeMin?: number;
  filterAgeMax?: number;
  filterCountry?: string;
  // Zeitfilter (Jahre) — null = alle
  filterYears?: number | null;
}

const TIME_FILTER_OPTIONS: { label: string; value: number | null }[] = [
  { label: '1J', value: 1 },
  { label: '3J', value: 3 },
  { label: '5J', value: 5 },
  { label: '10J', value: 10 },
  { label: 'Alle', value: null },
];

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
  filterGender = 'all',
  filterAgeMin = 0,
  filterAgeMax = 99,
  filterCountry = '',
  filterYears: externalFilterYears,
}) => {
  // Interner Zeitfilter-State (wird von externem Prop ueberschrieben wenn vorhanden)
  const [internalYears, setInternalYears] = useState<number | null>(null);
  const activeYears = externalFilterYears !== undefined ? externalFilterYears : internalYears;
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const nodeSelRef = useRef<d3.Selection<SVGGElement, GraphNode, SVGGElement, unknown> | null>(null);
  const linkSelRef = useRef<d3.Selection<SVGLineElement, any, SVGGElement, unknown> | null>(null);

  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  // Expanded node: dblclick to show only its connections, dblclick again to reset
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  // DreamListPanel: zeigt Traum-Liste für ein Symbol-Node
  const [dreamListNode, setDreamListNode] = useState<GraphNode | null>(null);
  // Progressive Live-Filterung: Fulltext-Trefferzahl
  const [fulltextCount, setFulltextCount] = useState<number | null>(null);
  // Graph-Expansion: verbundene Symbole um geklickten Node spawnen
  const { expansion, toggleExpansion, clearExpansion } = useNodeExpansion();
  const [simResetKey, setSimResetKey] = useState(0);

  // ── Load data (re-fetches when time filter changes) ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setExpandedNodeId(null);
    setSelectedNode(null);
    setDreamListNode(null);
    clearExpansion();
    fetchGraphData(500, activeYears).then(data => {
      if (!cancelled) {
        setGraphData(data);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeYears]);

  // ── Debounced Fulltext Search: Trefferzahl aktualisieren (MIT Demografie-Filtern) ──
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setFulltextCount(null);
      return;
    }
    const demoFilters = {
      gender: filterGender,
      ageMin: filterAgeMin,
      ageMax: filterAgeMax,
      country: filterCountry,
    };
    const timer = setTimeout(() => {
      searchDreamsFulltext(searchQuery, 200, demoFilters).then(results => {
        setFulltextCount(results.length);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, filterGender, filterAgeMin, filterAgeMax, filterCountry]);

  // ── Demographische Filter: Symbol-Gewichtung ──
  const [demoFilterCounts, setDemoFilterCounts] = useState<Map<string, number>>(new Map());
  const [demoFilterActive, setDemoFilterActive] = useState(false);
  useEffect(() => {
    const hasDemoFilter = filterGender !== 'all' || filterAgeMin > 0 || filterAgeMax < 99 || !!filterCountry;
    setDemoFilterActive(hasDemoFilter);
    if (!hasDemoFilter) {
      setDemoFilterCounts(new Map());
      return;
    }
    const timer = setTimeout(() => {
      filterSymbolsByDemographics({
        gender: filterGender,
        ageMin: filterAgeMin,
        ageMax: filterAgeMax,
        country: filterCountry,
      }).then(setDemoFilterCounts);
    }, 500);
    return () => clearTimeout(timer);
  }, [filterGender, filterAgeMin, filterAgeMax, filterCountry]);

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

  // ── Expanded node: compute which nodes are visible when a node is clicked ──
  const expandedIds = useMemo(() => {
    if (!expandedNodeId) return new Set<string>();
    const ids = new Set<string>([expandedNodeId]);
    for (const link of filteredData.links) {
      const src = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
      const tgt = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;
      if (src === expandedNodeId) ids.add(tgt);
      if (tgt === expandedNodeId) ids.add(src);
    }
    return ids;
  }, [expandedNodeId, filteredData.links]);

  // ── Combined visibility ref for tick handler (no stale closures) ──
  const visStateRef = useRef({
    query: '', searchIds: new Set<string>(), userIds: new Set<string>(),
    expandedId: null as string | null, expandedIds: new Set<string>(),
    demoFilter: new Map<string, number>(),
    demoFilterActive: false,
    expansionSourceId: null as string | null,
    expansionNodeIds: new Set<string>(),
    hiddenOriginalIds: new Set<string>(),
  });
  visStateRef.current = {
    query: searchQuery, searchIds: highlightedIds, userIds: userHighlightIds,
    expandedId: expandedNodeId, expandedIds,
    demoFilter: demoFilterCounts,
    demoFilterActive,
    expansionSourceId: expansion.sourceNodeId,
    expansionNodeIds: new Set(expansion.nodes.map(n => n.id)),
    hiddenOriginalIds: new Set(
      expansion.nodes
        .map(n => n.hiddenOriginalId)
        .filter((id): id is string => !!id),
    ),
  };

  // Helper: is a node currently visible?
  const isNodeVisible = useCallback((nodeId: string): boolean => {
    const { query, searchIds, userIds, expandedId, expandedIds: expIds, demoFilter, demoFilterActive: isDemoActive, expansionSourceId, expansionNodeIds } = visStateRef.current;
    const hasSearch = query.trim().length >= 2 && searchIds.size > 0;
    const hasUserHL = userIds.size > 0;
    const hasExpand = !!expandedId;
    const hasDemoFilter = isDemoActive;

    // Expansion-Nodes (exp_* / exp_usr_*) sind IMMER sichtbar wenn Expansion aktiv
    if (expansionSourceId && expansionNodeIds.has(nodeId)) return true;

    // If expanded node is active, that takes priority
    if (hasExpand) return expIds.has(nodeId);
    // Search filter
    if (hasSearch) return searchIds.has(nodeId);
    // User highlight
    if (hasUserHL) return userIds.has(nodeId);
    // Demographischer Filter: nur Symbole zeigen die Matches haben
    if (hasDemoFilter) return demoFilter.has(nodeId);
    // No filter active → everything visible
    return true;
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

    svg.call(zoom as any);
    svg.call(zoom.transform as any, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8).translate(-width / 2, -height / 2));

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

    // ── Freeze simulation when mouse/finger enters SVG ──
    const svgEl = svgRef.current!;
    const freezeSim = () => { simulation.stop(); };
    const unfreezeSim = () => {
      // Only restart if simulation hasn't fully settled
      if (simulation.alpha() > simulation.alphaMin()) {
        simulation.restart();
      }
    };
    svgEl.addEventListener('mouseenter', freezeSim);
    svgEl.addEventListener('mouseleave', unfreezeSim);
    svgEl.addEventListener('touchstart', freezeSim, { passive: true });
    svgEl.addEventListener('touchend', unfreezeSim);

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
          // Simulation starten trotz freeze (mouseenter stoppt sie)
          simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
          // Pulsieren stoppen für gedraggten Node
          d3.select(event.sourceEvent?.target?.parentNode).select('animate').remove();
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          // Node bleibt fixiert — fx/fy NICHT auf null setzen
        }));

    // Node circle with pulse animation
    node.append('circle')
      .attr('r', d => d.size)
      .attr('fill', d => d.color)
      .attr('stroke', isLight ? '#e2e8f0' : '#0f172a')
      .attr('stroke-width', 1.5)
      .attr('opacity', 1)
      .each(function(d) {
        // Sanftes Pulsieren via SVG <animate> — stoppt bei Interaktion
        const circle = d3.select(this);
        const baseR = d.size;
        circle.append('animate')
          .attr('attributeName', 'r')
          .attr('values', `${baseR};${baseR * 1.06};${baseR}`)
          .attr('dur', `${3 + Math.random() * 2}s`)
          .attr('repeatCount', 'indefinite')
          .attr('class', 'pulse-anim');
      });

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

    // Hover handlers — only for visible nodes
    node.on('mouseenter', function(_event, d) {
      if (!isNodeVisible(d.id)) return;
      d3.select(this).select('circle')
        .transition().duration(150)
        .attr('filter', 'url(#glow)')
        .attr('r', d.size * 1.3);
      setHoveredNode(d);
    });

    node.on('mouseleave', function(_event, d) {
      const circle = d3.select(this).select('circle');
      circle.transition().duration(150).attr('filter', null);
      // Radius nur zurücksetzen wenn keine Pulse-Animation aktiv
      if (d3.select(this).select('animate').empty()) {
        circle.attr('r', d.size);
      }
      setHoveredNode(null);
    });

    // Click: select node + show detail panel + DreamList + Graph-Expansion für Symbol-Nodes
    node.on('click', (event, d) => {
      event.stopPropagation();
      setSelectedNode(prev => prev?.id === d.id ? null : d);
      if (d.type === 'symbol' && d.metadata?.frequency) {
        // Traum-Liste (Side-Panel)
        setDreamListNode(prev => prev?.id === d.id ? null : d);
        // Graph-Expansion: verbundene Symbole laden & spawnen
        const existingIds = new Set(nodes.map((n: any) => n.id));
        toggleExpansion(d, existingIds);
      } else if (d.type === 'user') {
        // User-Node: DreamListPanel mit User-View (Träume dieses Users)
        const userId = d.metadata?.userId || d.id.replace(/^usr_/, '');
        setDreamListNode(prev =>
          prev?.id === d.id
            ? null
            : { ...d, metadata: { ...d.metadata, userId } }
        );
      }
      onNodeClick?.(d);
      d3.select(event.currentTarget).select('animate').remove();
    });

    // Double-click: expand/collapse connections + fixieren
    node.on('dblclick', (event, d) => {
      event.stopPropagation();
      event.preventDefault();
      // Toggle expand
      setExpandedNodeId(prev => {
        const wasExpanded = prev === d.id;
        if (wasExpanded) {
          // Einklappen: verbundene Nodes lösen
          nodes.forEach(n => {
            if (n.id !== d.id && (n as any)._expandedBy === d.id) {
              n.fx = null;
              n.fy = null;
              delete (n as any)._expandedBy;
            }
          });
          return null;
        } else {
          // Aufklappen: Simulation kurz laufen, dann alle sichtbaren fixieren
          simulation.alpha(0.3).restart();
          setTimeout(() => {
            simulation.stop();
            // Alle sichtbaren Nodes fixieren
            const connectedIds = new Set<string>([d.id]);
            links.forEach(l => {
              const src = typeof l.source === 'string' ? l.source : (l.source as any).id;
              const tgt = typeof l.target === 'string' ? l.target : (l.target as any).id;
              if (src === d.id) connectedIds.add(tgt);
              if (tgt === d.id) connectedIds.add(src);
            });
            nodes.forEach(n => {
              if (connectedIds.has(n.id)) {
                n.fx = n.x;
                n.fy = n.y;
                (n as any)._expandedBy = d.id;
              }
            });
          }, 2000);
          // Pulsieren stoppen für expanded Nodes
          d3.select(event.currentTarget).select('animate').remove();
          return d.id;
        }
      });
      setSelectedNode(d);
    });

    // Click on background: deselect + collapse
    svg.on('click', () => {
      setSelectedNode(null);
      setExpandedNodeId(null);
      setDreamListNode(null);
      clearExpansion();
    });

    // Store selections
    nodeSelRef.current = node;
    linkSelRef.current = link;

    // ── Tick — update positions + visibility ──
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);

      // Determine which filter is active
      const { query, searchIds, expandedId, expandedIds: expIds, userIds, demoFilter, demoFilterActive: isDemoActive } = visStateRef.current;
      const hasSearch = query.trim().length >= 2 && searchIds.size > 0;
      const hasExpand = !!expandedId;
      const hasUserHL = userIds.size > 0;
      const hasDemoFilter = isDemoActive;
      const hasFilter = hasSearch || hasExpand || hasUserHL || hasDemoFilter;

      // Pick the set of visible node IDs
      const { expansionSourceId, expansionNodeIds, hiddenOriginalIds } = visStateRef.current;
      let visibleIds: Set<string>;
      if (hasExpand) {
        visibleIds = new Set(expIds);
        // Expansion-Nodes (exp_* / exp_usr_*) immer sichtbar machen
        if (expansionSourceId) {
          visibleIds.add(expansionSourceId);
          expansionNodeIds.forEach(id => visibleIds.add(id));
        }
      }
      else if (hasSearch) {
        visibleIds = new Set(searchIds);
        // Expansion-Nodes bei aktiver Suche NICHT verstecken
        if (expansionSourceId) {
          visibleIds.add(expansionSourceId);
          expansionNodeIds.forEach(id => visibleIds.add(id));
        }
      }
      else if (hasUserHL) visibleIds = userIds;
      else if (hasDemoFilter) visibleIds = new Set(demoFilter.keys());
      else visibleIds = new Set(); // won't be used since hasFilter is false

      // Nodes: visible or dimmed (demographischer Filter = opacity 0.12 statt 0)
      // Originale User-Nodes die gerade per exp_usr_* dupliziert sind: ausblenden
      node.select('circle')
        .attr('opacity', (d: any) => {
          if (hiddenOriginalIds.has(d.id)) return 0;
          if (!hasFilter) return 1;
          if (visibleIds.has(d.id)) return 1;
          return hasDemoFilter ? 0.12 : 0;
        })
        .attr('r', (d: any) => {
          if (hasExpand && d.id === expandedId) return d.size * 1.5;
          if (hasSearch && searchIds.has(d.id)) return d.size * 1.4;
          // Demographischer Filter: Größe proportional zur Trefferzahl
          if (hasDemoFilter && demoFilter.has(d.id)) {
            const count = demoFilter.get(d.id) || 1;
            return Math.min(d.size * (1 + Math.log2(count) * 0.15), d.size * 2);
          }
          return d.size;
        });

      node.select('text')
        .attr('opacity', (d: any) => {
          if (hiddenOriginalIds.has(d.id)) return 0;
          if (!hasFilter) return 1;
          if (visibleIds.has(d.id)) return 1;
          return hasDemoFilter ? 0.1 : 0;
        });

      // Pointer-events: disable for completely hidden nodes
      node.attr('pointer-events', (d: any) => {
        if (hiddenOriginalIds.has(d.id)) return 'none';
        return hasFilter && !visibleIds.has(d.id) && !hasDemoFilter ? 'none' : 'auto';
      });

      // Links: only show between visible nodes; Links auf ausgeblendete Originale ebenfalls unsichtbar
      link
        .attr('stroke-opacity', (d: any) => {
          const src = typeof d.source === 'string' ? d.source : d.source.id;
          const tgt = typeof d.target === 'string' ? d.target : d.target.id;
          if (hiddenOriginalIds.has(src) || hiddenOriginalIds.has(tgt)) return 0;
          if (!hasFilter) return 0.5;
          return (visibleIds.has(src) && visibleIds.has(tgt)) ? 0.8 : 0;
        })
        .attr('stroke-width', (d: any) => {
          const src = typeof d.source === 'string' ? d.source : d.source.id;
          const tgt = typeof d.target === 'string' ? d.target : d.target.id;
          if (hiddenOriginalIds.has(src) || hiddenOriginalIds.has(tgt)) return 0;
          if (!hasFilter) return Math.max(1, (d.strength || 1) * 1.2);
          return (visibleIds.has(src) && visibleIds.has(tgt)) ? 2.5 : 0;
        });
    });

    setSimResetKey(k => k + 1);

    return () => {
      simulation.stop();
      svgEl.removeEventListener('mouseenter', freezeSim);
      svgEl.removeEventListener('mouseleave', unfreezeSim);
      svgEl.removeEventListener('touchstart', freezeSim);
      svgEl.removeEventListener('touchend', unfreezeSim);
      nodeSelRef.current = null;
      linkSelRef.current = null;
    };
  }, [filteredData, dimensions, isLight, onNodeClick, isNodeVisible]);

  // ── Nudge simulation when filters change so tick re-applies visibility ──
  // Stabile Content-Signatur verhindert Flackern bei Parent-Rerenders (gleiche Daten,
  // aber neue Map/Set-Referenzen). Nur bei echter Aenderung wird alpha() restartet.
  const nudgeKey = useMemo(() => {
    const demoSig = demoFilterCounts.size === 0
      ? ''
      : Array.from(demoFilterCounts.keys()).sort().join(',');
    const searchSig = highlightedIds.size === 0
      ? ''
      : Array.from(highlightedIds).sort().join(',');
    return [
      searchQuery,
      searchSig,
      highlightedUserId || '',
      expandedNodeId || '',
      demoSig,
      expansion.sourceNodeId || '',
      expansion.nodes.length,
    ].join('|');
  }, [searchQuery, highlightedIds, highlightedUserId, expandedNodeId, demoFilterCounts, expansion.sourceNodeId, expansion.nodes.length]);

  const prevNudgeKeyRef = useRef<string>('');
  useEffect(() => {
    const sim = simRef.current;
    if (!sim) return;
    if (prevNudgeKeyRef.current === nudgeKey) return;
    prevNudgeKeyRef.current = nudgeKey;
    sim.alpha(0.005).restart();
  }, [nudgeKey]);

  // ── Auto-Expansion: Bei Suche den besten Symbol-Match expandieren ──
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      clearExpansion();
      setDreamListNode(null);
      setExpandedNodeId(null);
      return;
    }
    setExpandedNodeId(null);
    const timer = setTimeout(() => {
      const terms = searchQuery.trim().toLowerCase().split(/\s+/).filter(t => t.length >= 2);
      if (terms.length === 0) return;

      // Symbol-Nodes finden die direkt zum Suchbegriff passen
      const symbolMatches = filteredData.nodes.filter(n => {
        if (n.type !== 'symbol') return false;
        const label = n.label.toLowerCase();
        return terms.some(t => {
          if (label.includes(t)) return true;
          const tr = TRANSLATE_MAP[t];
          return tr ? tr.some(w => label.includes(w)) : false;
        });
      });

      if (symbolMatches.length === 0) { clearExpansion(); return; }

      // Bestes Match: hoechste Frequenz
      const best = symbolMatches.reduce((a, b) =>
        (b.metadata?.frequency || 0) > (a.metadata?.frequency || 0) ? b : a);

      // Nur wenn anderer Node als aktuell expandiert
      if (expansion.sourceNodeId !== best.id) {
        const ids = new Set(filteredData.nodes.map(n => n.id));
        toggleExpansion(best, ids);
        setSelectedNode(best);
        setDreamListNode(best);
      }
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filteredData.nodes]);

  // ── Graph-Expansion: neue Nodes direkt in D3-Simulation injizieren ──────────
  useEffect(() => {
    const sim = simRef.current;
    const svgEl = svgRef.current;
    if (!sim || !svgEl) return;

    const svg = d3.select(svgEl);
    const g = svg.select<SVGGElement>('g');

    // Cleanup: expansion SVG-Elemente entfernen
    g.selectAll('.exp-link').remove();
    g.selectAll('.exp-node').remove();
    sim.on('tick.exp', null);

    if (!expansion.sourceNodeId || (expansion.nodes.length === 0 && expansion.links.length === 0)) {
      // Expansion-Nodes aus Simulation entfernen
      const cleanNodes = sim.nodes().filter((n: any) => !n.id?.startsWith('exp_'));
      sim.nodes(cleanNodes as any);
      const lf = sim.force('link') as d3.ForceLink<any, any> | null;
      if (lf) {
        const cleanLinks = (lf.links() as any[]).filter((l: any) => {
          const src = typeof l.source === 'object' ? l.source?.id : l.source;
          const tgt = typeof l.target === 'object' ? l.target?.id : l.target;
          return !String(src || '').startsWith('exp_') && !String(tgt || '').startsWith('exp_');
        });
        lf.links(cleanLinks);
      }
      return;
    }

    // Quell-Node im Simulation finden → Startposition für neue Nodes
    const simNodes: any[] = sim.nodes();
    const srcNode = simNodes.find((n: any) => n.id === expansion.sourceNodeId);
    const srcX = srcNode?.x ?? dimensions.width / 2;
    const srcY = srcNode?.y ?? dimensions.height / 2;

    // Kamera auf den expandierten Node zentrieren
    try {
      const svgSel = d3.select<SVGSVGElement, unknown>(svgEl);
      const zoomBehavior = (d3.zoom<SVGSVGElement, unknown>() as any);
      const zoomTransform = d3.zoomIdentity
        .translate(dimensions.width / 2, dimensions.height / 2)
        .scale(1.2)
        .translate(-srcX, -srcY);
      svgSel.transition().duration(800).call(zoomBehavior.transform, zoomTransform);
    } catch { /* zoom nicht verfuegbar */ }

    // Neue Nodes mit Ring-Positionen initialisieren
    const expNodes: any[] = expansion.nodes.map((n, i) => {
      const angle = (i / expansion.nodes.length) * 2 * Math.PI - Math.PI / 2;
      const radius = 140 + (i % 2) * 30;
      return { ...n, x: srcX + radius * Math.cos(angle), y: srcY + radius * Math.sin(angle) };
    });

    // Zur Simulation hinzufügen
    sim.nodes([...simNodes, ...expNodes] as any);

    // Links zur Link-Force hinzufügen
    const lf = sim.force('link') as d3.ForceLink<any, any> | null;
    const expLinkData = expansion.links.map(l => ({
      source: typeof l.source === 'string' ? l.source : (l.source as any)?.id,
      target: typeof l.target === 'string' ? l.target : (l.target as any)?.id,
      strength: l.strength,
      type: l.type,
      _isExp: true,
    }));
    if (lf) lf.links([...(lf.links() as any[]), ...expLinkData]);

    // ── Expansion-Links zeichnen ──────────────────────────────────────────────
    const linkGroup = g.select<SVGGElement>('g.links');
    const expLinkEls = linkGroup.selectAll<SVGLineElement, any>('.exp-link')
      .data(expLinkData)
      .join('line')
      .classed('exp-link', true)
      .attr('stroke', (d: any) => d.type === 'dreamed_by' ? '#10b981' : '#8b5cf6')
      .attr('stroke-opacity', 0)
      .attr('stroke-width', (d: any) => d.type === 'dreamed_by' ? 1 : 1.5)
      .attr('stroke-dasharray', (d: any) => d.type === 'dreamed_by' ? '3 4' : '5 3');

    expLinkEls.transition().duration(700).attr('stroke-opacity', (d: any) => d.type === 'dreamed_by' ? 0.5 : 0.8);

    // ── Expansion-Nodes zeichnen ──────────────────────────────────────────────
    const nodeGroup = g.select<SVGGElement>('g.nodes');
    const expNodeEls = nodeGroup.selectAll<SVGGElement, any>('.exp-node')
      .data(expNodes)
      .join('g')
      .classed('exp-node', true)
      .attr('cursor', 'pointer')
      .attr('opacity', 0);

    expNodeEls.append('circle')
      .attr('r', (d: any) => d.size || 8)
      .attr('fill', (d: any) => d.color)
      .attr('fill-opacity', (d: any) => d.type === 'user' ? 0.7 : 0.85)
      .attr('stroke', (d: any) => d.type === 'user' ? '#059669' : (isLight ? '#fff' : '#1f2937'))
      .attr('stroke-width', (d: any) => d.type === 'user' ? 1 : 1.5);

    // Emoji-Label im Kreis (nur fuer Symbol-Nodes)
    expNodeEls.filter((d: any) => d.type === 'symbol').append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '9px')
      .attr('fill', '#fff')
      .attr('pointer-events', 'none')
      .text((d: any) => d.metadata?.emoji || '');

    // User-Icon im Kreis
    expNodeEls.filter((d: any) => d.type === 'user').append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '8px')
      .attr('fill', '#fff')
      .attr('pointer-events', 'none')
      .text('👤');

    // Name + Häufigkeit unter dem Node
    expNodeEls.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', (d: any) => (d.size || 8) + 12)
      .attr('font-size', (d: any) => d.type === 'user' ? '8px' : '9px')
      .attr('fill', (d: any) => d.type === 'user' ? '#10b981' : (isLight ? '#374151' : '#e5e7eb'))
      .attr('pointer-events', 'none')
      .text((d: any) => {
        if (d.type === 'user') return d.label;
        return `${d.label}${d.metadata?.frequency ? ' ·' + d.metadata.frequency : ''}`;
      });

    // Klick auf Expansion-Node:
    //  - stopPropagation: verhindert svg.on('click') → clearExpansion()
    //  - User-Node: DreamListPanel mit isUserView oeffnen (Traeume dieses Users)
    //  - Symbol-Node: rekursive Expansion (weitere Ring-Ebene um geklickten Node)
    expNodeEls.on('click', (event: any, d: any) => {
      event.stopPropagation();
      if (d.type === 'user') {
        // DreamListPanel oeffnet automatisch den User-View (type==='user' + metadata.userId)
        setDreamListNode(d);
        setSelectedNode(d);
      } else if (d.type === 'symbol') {
        const allIds = new Set<string>(sim.nodes().map((n: any) => n.id));
        toggleExpansion(d, allIds);
        setSelectedNode(d);
        setDreamListNode(d);
      }
    });

    // Einblend-Animation (gestaffelt)
    expNodeEls.transition().duration(600).delay((_: any, i: number) => i * 70)
      .attr('opacity', 1);

    // Tick-Handler für Expansion-Elemente
    sim.on('tick.exp', () => {
      expLinkEls
        .attr('x1', (d: any) => d.source?.x ?? 0)
        .attr('y1', (d: any) => d.source?.y ?? 0)
        .attr('x2', (d: any) => d.target?.x ?? 0)
        .attr('y2', (d: any) => d.target?.y ?? 0);
      expNodeEls.attr('transform', (d: any) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // 2 Sekunden Simulation laufen lassen, dann einfrieren
    sim.alpha(0.4).restart();
    const freezeTimer = setTimeout(() => {
      expNodes.forEach((n: any) => { n.fx = n.x; n.fy = n.y; });
      sim.alphaTarget(0);
    }, 2000);

    return () => clearTimeout(freezeTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expansion.sourceNodeId, expansion.nodes, expansion.links, simResetKey]);

  // ── Render ─────────────────────────────────────────────
  const bgColor = isLight ? '#f8fafc' : '#0a0e1a';
  const panelBg = isLight ? 'bg-white/95 border-gray-200' : 'bg-[#111827]/95 border-white/10';
  const textPrimary = isLight ? 'text-gray-900' : 'text-white';
  const textSecondary = isLight ? 'text-gray-500' : 'text-gray-400';

  // Count visible connections for expanded node
  const expandedConnectionCount = expandedNodeId ? expandedIds.size - 1 : 0;

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

      {/* Zeitfilter (bottom-left) */}
      {externalFilterYears === undefined && (
        <div className={`absolute bottom-3 left-3 flex items-center gap-1 rounded-lg border px-1.5 py-1 backdrop-blur-md ${panelBg}`}>
          <span className={`text-[9px] mr-1 ${textSecondary}`}>Zeitraum:</span>
          {TIME_FILTER_OPTIONS.map((opt, i) => {
            const isActive = opt.label === 'Alle'
              ? activeYears === null
              : opt.value === activeYears;
            return (
              <button
                key={i}
                onClick={() => setInternalYears(opt.value ?? null)}
                className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                  isActive
                    ? 'bg-violet-500/30 text-violet-300 font-semibold'
                    : isLight ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-white/10 text-gray-400'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Node count + status (top-right) */}
      <div className={`absolute top-3 right-3 text-[10px] ${textSecondary} opacity-60`}>
        {expandedNodeId ? (
          <span className="text-violet-400 font-semibold">
            {expandedConnectionCount} Verbindungen
          </span>
        ) : searchQuery && highlightedIds.size > 0 ? (
          <span className="text-violet-400 font-semibold">
            {highlightedIds.size} Symbole{fulltextCount !== null ? ` · ${fulltextCount} Traeume` : ''}
          </span>
        ) : (
          <>
            {filteredData.nodes.length} Knoten &middot; {filteredData.links.length} Verbindungen
            {(filterGender !== 'all' || filterAgeMin > 0 || filterAgeMax < 99 || filterCountry) && (
              <span className="text-amber-400 ml-1">· Filter aktiv</span>
            )}
          </>
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
            <button onClick={() => { setSelectedNode(null); setExpandedNodeId(null); }}
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
                      onClick={() => { setSelectedNode(otherNode); setExpandedNodeId(otherNode.id); onNodeClick?.(otherNode); }}
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

      {/* DreamListPanel: Traum-Liste als Side-Panel (rechts) */}
      {dreamListNode && (
        <DreamListPanel
          node={dreamListNode}
          isLight={isLight}
          onClose={() => { setDreamListNode(null); clearExpansion(); }}
          sidePanel
          demoFilters={{ gender: filterGender, ageMin: filterAgeMin, ageMax: filterAgeMax, country: filterCountry }}
        />
      )}

      {/* Expansion-Loading-Indikator */}
      {expansion.loading && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md bg-violet-500/20 border border-violet-500/30">
          <div className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-[11px] text-violet-300">Verbindungen laden...</span>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraph;
