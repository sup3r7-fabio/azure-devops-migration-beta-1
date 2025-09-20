// ResourceTree: Renders the visible children of the current folder node.
// Simplified tree using manual indentation; expandable state tracked in pane context.
// Drag start/end integrates with DragAndDrop context for cross-pane moves (mocked).
import React from 'react';
import { useExplorer } from './ExplorerContext';
import { ResourceNode } from './types';
import { ResourceContextMenu } from './ResourceContextMenu';
import { useDragContext } from './DragAndDrop';

interface Props {
  side: 'left' | 'right';
}

// Simple tree rows with indentation & expand toggles
export const ResourceTree: React.FC<Props> = ({ side }) => {
  const { left, right } = useExplorer();
  const pane = side === 'left' ? left : right;
  const drag = useDragContext();
  if (!pane) return null;

  const currentParent = pane.nodesById.get(pane.currentFolderId);
  const children = currentParent?.children?.map(id => pane.nodesById.get(id)).filter(Boolean) as ResourceNode[] || [];

  return (
    <div className="resource-tree">
      {children.map(child => {
        const expanded = pane.expandedIds.has(child.id);
        const isSelected = pane.selectedIds.has(child.id);
        const indent = child.path.length - 1;
        return (
          <div
            key={child.id}
            className={`resource-tree-row${isSelected ? ' selected' : ''}${drag.draggingId === child.id ? ' dragging' : ''}`}
            draggable
            onDragStart={() => drag.beginDrag(child.id, child.orgId)}
            onDragEnd={() => drag.endDrag()}
            onDoubleClick={() => child.hasChildren && pane.navigateTo(child.id)}
            onClick={e => pane.toggleSelect(child.id, e.ctrlKey || e.metaKey)}
          >
            <span className="indent-spacer" style={{ width: indent * 12 }} />
            {child.hasChildren ? (
              <button
                className="chevron-btn"
                aria-label={expanded ? 'Collapse' : 'Expand'}
                onClick={e => { e.stopPropagation(); pane.toggleExpand(child.id); }}
              >{expanded ? '▾' : '▸'}</button>
            ) : <span style={{ width: 18 }} />}
            <span className="name" title={child.name}>{child.name}</span>
            <ResourceContextMenu nodeId={child.id} side={side} />
          </div>
        );
      })}
    </div>
  );
};
