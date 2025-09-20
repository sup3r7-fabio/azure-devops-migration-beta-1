import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DataProvider, ExplorerConfig, PaneState, ResourceNode } from './types';
import { getDataProvider } from './dataProvider';

interface PaneController extends PaneState {
  nodesById: Map<string, ResourceNode>;
  visibleChildren: ResourceNode[]; // children of currentFolderId
  filterText: string;
  setFilter(text: string): void;
  navigateTo(nodeId: string): void;
  toggleExpand(nodeId: string): void;
  toggleSelect(nodeId: string, multi?: boolean): void;
  rename(nodeId: string, newName: string): Promise<void>;
  refreshChildren(nodeId: string): Promise<void>;
}

interface ExplorerContextValue {
  left: PaneController | null;
  right: PaneController | null;
  provider: DataProvider;
  config: ExplorerConfig;
}

const ExplorerContext = createContext<ExplorerContextValue | undefined>(undefined);

interface Props {
  providerKind?: 'mock' | 'api';
  leftOrgId: string;
  rightOrgId: string;
  children: React.ReactNode;
}

interface InternalPaneState {
  pane: PaneState;
  nodesById: Map<string, ResourceNode>;
  filterText: string;
}

function usePane(orgId: string, provider: DataProvider): PaneController | null {
  const [state, setState] = useState<InternalPaneState | null>(null);

  // Initial load
  useEffect(() => {
    let mounted = true;
    provider.loadRoot(orgId).then(({ nodes, rootIds }) => {
      if (!mounted) return;
      const map = new Map<string, ResourceNode>();
      nodes.forEach(n => map.set(n.id, n));
      const first = rootIds[0];
      setState({
        pane: {
          orgId,
          rootIds,
          currentFolderId: first,
          expandedIds: new Set([first]),
          selectedIds: new Set()
        },
        nodesById: map,
        filterText: ''
      });
      // Pre-load children for first root
      provider.loadChildren(orgId, first).then(children => {
        if (!mounted) return;
        setState(prev => {
          if (!prev) return prev;
          const updated = new Map(prev.nodesById);
          children.forEach(c => updated.set(c.id, c));
          return { ...prev, nodesById: updated };
        });
      });
    });
    return () => { mounted = false; };
  }, [orgId, provider]);

  const navigateTo = useCallback((nodeId: string) => {
    setState(prev => prev ? { ...prev, pane: { ...prev.pane, currentFolderId: nodeId } } : prev);
  }, []);

  const toggleExpand = useCallback((nodeId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const expanded = new Set(prev.pane.expandedIds);
      if (expanded.has(nodeId)) expanded.delete(nodeId); else expanded.add(nodeId);
      return { ...prev, pane: { ...prev.pane, expandedIds: expanded } };
    });
  }, []);

  const toggleSelect = useCallback((nodeId: string, multi?: boolean) => {
    setState(prev => {
      if (!prev) return prev;
      const selected = multi ? new Set(prev.pane.selectedIds) : new Set<string>();
      if (selected.has(nodeId)) selected.delete(nodeId); else selected.add(nodeId);
      return { ...prev, pane: { ...prev.pane, selectedIds: selected } };
    });
  }, []);

  const rename = useCallback(async (nodeId: string, newName: string) => {
    const node = state?.nodesById.get(nodeId);
    if (!node) return;
    const updated = await provider.rename(node.orgId, nodeId, newName);
    setState(prev => {
      if (!prev) return prev;
      const map = new Map(prev.nodesById);
      map.set(updated.id, updated);
      return { ...prev, nodesById: map };
    });
  }, [provider, state]);

  const refreshChildren = useCallback(async (nodeId: string) => {
    const node = state?.nodesById.get(nodeId);
    if (!node) return;
    const children = await provider.loadChildren(node.orgId, nodeId);
    setState(prev => {
      if (!prev) return prev;
      const map = new Map(prev.nodesById);
      children.forEach(c => map.set(c.id, c));
      return { ...prev, nodesById: map };
    });
  }, [provider, state]);

  const visibleChildren = useMemo(() => {
    if (!state) return [] as ResourceNode[];
    const node = state.nodesById.get(state.pane.currentFolderId);
    if (!node) return [];
    if (!node.children) return [];
    let list = node.children.map(cid => state.nodesById.get(cid)).filter(Boolean) as ResourceNode[];
    if (state.filterText) {
      const f = state.filterText.toLowerCase();
      list = list.filter(n => n.name.toLowerCase().includes(f));
    }
    return list;
  }, [state]);

  if (!state) return null;

  return {
    ...state.pane,
    nodesById: state.nodesById,
    visibleChildren,
    filterText: state.filterText,
    setFilter: (text: string) => setState(prev => prev ? { ...prev, filterText: text } : prev),
    navigateTo,
    toggleExpand,
    toggleSelect,
    rename,
    refreshChildren
  };
}

export const ExplorerProvider: React.FC<Props> = ({ providerKind = 'mock', leftOrgId, rightOrgId, children }) => {
  const provider = useMemo(() => getDataProvider(providerKind), [providerKind]);
  const left = usePane(leftOrgId, provider);
  const right = usePane(rightOrgId, provider);

  const value: ExplorerContextValue = {
    left,
    right,
    provider,
    config: { providerKind }
  };

  return <ExplorerContext.Provider value={value}>{children}</ExplorerContext.Provider>;
};

export function useExplorer() {
  const ctx = useContext(ExplorerContext);
  if (!ctx) throw new Error('useExplorer must be used within ExplorerProvider');
  return ctx;
}
