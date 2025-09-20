import React from 'react';
import { Breadcrumb } from 'azure-devops-ui/Breadcrumb';
import { useExplorer } from './ExplorerContext';
import { ResourceNode } from './types';

interface Props {
  side: 'left' | 'right';
}

export const ResourceBreadcrumbs: React.FC<Props> = ({ side }) => {
  const { left, right } = useExplorer();
  const pane = side === 'left' ? left : right;
  if (!pane) return null;

  const current = pane.nodesById.get(pane.currentFolderId);
  if (!current) return null;

  const chain: ResourceNode[] = current.path
    .map(id => pane.nodesById.get(id))
    .filter(Boolean) as ResourceNode[];

  // Collapse long breadcrumb chains: keep first + last 3, collapse middle.
  const MAX_VISIBLE = 5; // first + ellipsis + last (up to 3)
  let displayChain: ResourceNode[] = chain;
  let collapsed = false;
  if (chain.length > MAX_VISIBLE) {
    collapsed = true;
    const first = chain[0];
    const tail = chain.slice(-3);
    displayChain = [first, ...tail];
  }

  const items = [] as any[]; // azure-devops-ui's Breadcrumb accepts objects with key/text/onClick

  displayChain.forEach((node, idx) => {
    // Insert ellipsis placeholder after first item if collapsed.
    if (collapsed && idx === 1) {
      items.push({
        key: 'ellipsis',
        text: '…',
        // Provide a click to expand full path (simple approach for now)
        onClick: () => {
          // Navigate to current to force full path expansion (no collapse) by using a no-op state path.
          // For simplicity we just alert for now; future: stateful toggle.
          // eslint-disable-next-line no-alert
          alert(chain.map(c => c.name).join(' / '));
        }
      });
    }
    items.push({
      key: node.id,
      text: node.name,
      onClick: () => pane.navigateTo(node.id)
    });
  });

  return (
    <div className="explorer-breadcrumbs" aria-label="Breadcrumb navigation">
      <Breadcrumb items={items} />
    </div>
  );
};
