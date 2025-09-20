// Data provider switching logic; the real API provider can later call backend endpoints.
import { DataProvider, ResourceNode } from './types';
import { mockDataProvider } from './mockData';

export function getDataProvider(kind: 'mock' | 'api'): DataProvider {
  if (kind === 'mock') return mockDataProvider;
  // Placeholder: real provider not yet implemented.
  return mockDataProvider;
}

// Utility to clone nodes (avoid leaking internal mutable references from provider)
export function cloneNodes(nodes: ResourceNode[]): ResourceNode[] {
  return nodes.map(n => ({ ...n, path: [...n.path], children: n.children ? [...n.children] : undefined }));
}
