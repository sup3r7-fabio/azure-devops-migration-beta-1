// Core resource & navigation types for the dual-pane explorer
// These abstractions allow swapping mock vs. real backend providers later.

export type ResourceKind = 'boards' | 'repos' | 'pipelines' | 'tests' | 'artifacts' | 'folder' | 'item';

export interface ResourceNode {
  id: string;                 // Unique within its org scope
  orgId: string;              // Organization identifier (maps to left/right context)
  kind: ResourceKind;
  name: string;
  parentId?: string;          // Undefined for top-level category roots
  hasChildren?: boolean;      // Hint for lazy loading
  children?: string[];        // Eager children (mock mode); real mode can omit
  path: string[];             // Breadcrumb path of ids, including this node
  meta?: Record<string, any>; // Arbitrary metadata (e.g., repo default branch)
}

export interface BreadcrumbSegment {
  id: string;
  label: string;
}

// Represents a resolved navigation state for a pane
export interface PaneState {
  orgId: string;
  rootIds: string[];          // Category root ids (Boards, Repos, etc.)
  currentFolderId: string;    // Current node whose children we are viewing
  expandedIds: Set<string>;   // Expanded nodes in tree view
  selectedIds: Set<string>;   // Multi-select for bulk ops
}

// Data operations separated so mock and real implementations conform identically
export interface DataProvider {
  loadRoot(orgId: string): Promise<{ nodes: ResourceNode[]; rootIds: string[] }>;
  loadChildren(orgId: string, parentId: string): Promise<ResourceNode[]>;
  rename(orgId: string, id: string, newName: string): Promise<ResourceNode>;
  delete(orgId: string, ids: string[]): Promise<void>;
  move(orgId: string, ids: string[], targetParentId: string): Promise<void>;
  copy(orgId: string, ids: string[], targetParentId: string): Promise<ResourceNode[]>;
}

export interface ExplorerConfig {
  providerKind: 'mock' | 'api';
}
