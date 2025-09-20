// Mock data + in-memory implementation of DataProvider
import { DataProvider, ResourceNode } from './types';

// Helper to build consistent IDs
function id(org: string, kind: string, name: string) {
  return `${org}:${kind}:${name}`.toLowerCase();
}

// Seed two orgs with category roots only; children will simulate lazy load.
const orgIds = ['orgA', 'orgB'];

const baseCategories = ['boards', 'repos', 'pipelines', 'tests', 'artifacts'] as const;

interface Store {
  nodes: Map<string, ResourceNode>; // key = node.id
  roots: Map<string, string[]>;     // orgId -> rootIds
}

const store: Store = {
  nodes: new Map(),
  roots: new Map()
};

// Initialize root category nodes
for (const org of orgIds) {
  const rootIds: string[] = [];
  for (const cat of baseCategories) {
    const nodeId = id(org, 'root', cat);
    rootIds.push(nodeId);
    store.nodes.set(nodeId, {
      id: nodeId,
      orgId: org,
      kind: cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      path: [nodeId],
      hasChildren: true,
      children: []
    });
  }
  store.roots.set(org, rootIds);
}

// Simulate child generation on demand
function ensureChildren(orgId: string, parentId: string) {
  const parent = store.nodes.get(parentId);
  if (!parent) return [];
  if (parent.children && parent.children.length > 0) {
    return parent.children.map(cid => store.nodes.get(cid)!).filter(Boolean);
  }
  // Generate between 3–5 child folders/items
  const count = 3;
  const generated: ResourceNode[] = [];
  for (let i = 1; i <= count; i++) {
    const childId = `${parentId}::child${i}`;
    const folder = i % 2 === 1; // alternate folder vs item
    const node: ResourceNode = {
      id: childId,
      orgId,
      kind: folder ? 'folder' : 'item',
      name: folder ? `Folder ${i}` : `Item ${i}`,
      parentId: parentId,
      path: [...parent.path, childId],
      hasChildren: folder,
      children: folder ? [] : undefined
    };
    store.nodes.set(childId, node);
    generated.push(node);
  }
  parent.children = generated.map(c => c.id);
  return generated;
}

function delay<T>(value: T, ms = 150): Promise<T> {
  return new Promise(res => setTimeout(() => res(value), ms));
}

export const mockDataProvider: DataProvider = {
  async loadRoot(orgId: string) {
    const rootIds = store.roots.get(orgId) || [];
    const nodes = rootIds.map(rid => store.nodes.get(rid)!).filter(Boolean);
    return delay({ nodes, rootIds });
  },
  async loadChildren(orgId: string, parentId: string) {
    const createdOrExisting = ensureChildren(orgId, parentId);
    return delay(createdOrExisting);
  },
  async rename(_orgId: string, id: string, newName: string) {
    const node = store.nodes.get(id);
    if (!node) throw new Error('Not found');
    node.name = newName;
    return delay(node);
  },
  async delete(_orgId: string, ids: string[]) {
    // Simple delete; does not cascade robustly (demo only)
    ids.forEach(id => store.nodes.delete(id));
    return delay(undefined);
  },
  async move(_orgId: string, _ids: string[], _targetParentId: string) {
    // Not implemented in mock (no structural recomputation)
    return delay(undefined);
  },
  async copy(_orgId: string, ids: string[], _targetParentId: string) {
    // Return clones (no actual insertion) for demo
    const cloned: ResourceNode[] = ids
      .map(i => store.nodes.get(i))
      .filter(Boolean)
      .map(n => ({ ...n!, id: n!.id + ':copy' }));
    return delay(cloned);
  }
};
