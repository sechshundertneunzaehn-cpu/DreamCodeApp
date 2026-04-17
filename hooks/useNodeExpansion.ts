import { useState, useCallback } from 'react';
import type { GraphNode, GraphLink } from '../services/graphDataService';

export interface ConnectedSymbol {
  id: string;
  name: string;
  emoji?: string;
  kategorie?: string;
  frequency: number;
  coOccurrenceCount: number;
}

export interface ConnectedDreamer {
  user_id: string;
  display_name: string;
  dream_count: number;
}

export interface ExpansionState {
  sourceNodeId: string | null;
  nodes: GraphNode[];
  links: GraphLink[];
  loading: boolean;
  error?: string | null;
  empty?: boolean;
}

const EMPTY: ExpansionState = {
  sourceNodeId: null, nodes: [], links: [], loading: false, error: null, empty: false,
};

const EXP_COLORS = ['#c4b5fd', '#fbbf24', '#6ee7b7', '#f9a8d4', '#93c5fd', '#fdba74', '#a5f3fc', '#86efac'];

export function useNodeExpansion() {
  const [expansion, setExpansion] = useState<ExpansionState>(EMPTY);

  const toggleExpansion = useCallback(async (
    node: GraphNode,
    existingNodeIds: Set<string>,
  ) => {
    // Toggle off
    if (expansion.sourceNodeId === node.id) {
      console.debug('[expansion] toggle off', { nodeId: node.id });
      setExpansion(EMPTY);
      return;
    }

    // ID-Prefix entfernen (auch bei rekursiver Expansion: exp_xxx, exp_usr_xxx)
    const dbId = node.id.replace(/^exp_usr_/, '').replace(/^exp_/, '').replace(/^sym_/, '');
    setExpansion({ ...EMPTY, sourceNodeId: node.id, loading: true });

    try {
      const base = (import.meta.env.VITE_API_BASE_URL as string) || '';
      const url = `${base}/api/graph/symbol/${dbId}`;
      console.debug('[expansion] fetch', { base, dbId });
      const res = await fetch(url);
      if (!res.ok) {
        console.warn('[expansion] http fail', { dbId, status: res.status, url });
        setExpansion({ ...EMPTY, error: `http_${res.status}` });
        return;
      }

      const data = await res.json();
      const connected: ConnectedSymbol[] = data.connected || [];
      const dreamers: ConnectedDreamer[] = data.dreamers || [];

      if (connected.length === 0 && dreamers.length === 0) {
        console.info('[expansion] empty result', { dbId });
        setExpansion({ ...EMPTY, empty: true });
        return;
      }

      const nodes: GraphNode[] = [];
      const links: GraphLink[] = [];

      // Symbol-Nodes
      connected.forEach((s, i) => {
        const existingId = `sym_${s.id}`;
        const targetId = existingNodeIds.has(existingId) ? existingId : `exp_${s.id}`;

        if (!existingNodeIds.has(existingId)) {
          nodes.push({
            id: targetId,
            label: s.name,
            type: 'symbol',
            size: Math.min(6 + Math.sqrt(s.frequency || 1) * 1.5, 18),
            color: EXP_COLORS[i % EXP_COLORS.length],
            metadata: { kategorie: s.kategorie, emoji: s.emoji, frequency: s.frequency },
          });
        }

        links.push({
          source: node.id,
          target: targetId,
          strength: Math.min(Math.ceil((s.coOccurrenceCount || 1) / 2), 3),
          type: 'related',
        });
      });

      // User/Dreamer-Nodes
      dreamers.forEach(d => {
        const userId = `usr_${d.user_id}`;
        const targetId = existingNodeIds.has(userId) ? userId : `exp_usr_${d.user_id}`;

        if (!existingNodeIds.has(userId)) {
          nodes.push({
            id: targetId,
            label: d.display_name || 'Anonym',
            type: 'user',
            size: Math.min(5 + Math.sqrt(d.dream_count) * 1.5, 12),
            color: '#10b981',
            metadata: { userId: d.user_id },
          });
        }

        links.push({
          source: node.id,
          target: targetId,
          strength: Math.min(d.dream_count, 3),
          type: 'dreamed_by',
        });
      });

      console.info('[expansion] ok', {
        nodeId: node.id,
        symbols: connected.length,
        users: dreamers.length,
      });
      setExpansion({ sourceNodeId: node.id, nodes, links, loading: false, error: null, empty: false });
    } catch (e) {
      console.error('[expansion] exception', { dbId, err: e });
      setExpansion({ ...EMPTY, error: String(e) });
    }
  }, [expansion.sourceNodeId]);

  const clearExpansion = useCallback(() => setExpansion(EMPTY), []);

  return { expansion, toggleExpansion, clearExpansion };
}
