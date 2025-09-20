// ExplorerPane: Combines breadcrumbs + resource tree + drop target surface for one org.
import React from 'react';
import { ResourceBreadcrumbs } from './ResourceBreadcrumbs';
import { ResourceTree } from './ResourceTree';
import { ExplorerCommandBar } from './ExplorerCommandBar';
import { useExplorer } from './ExplorerContext';
import { useDragContext } from './DragAndDrop';
import './ExplorerStyles.css';

interface Props { side: 'left' | 'right'; title?: string }

export const ExplorerPane: React.FC<Props> = ({ side, title }) => {
  const { left, right } = useExplorer();
  const pane = side === 'left' ? left : right;
  const drag = useDragContext();

  if (!pane) return <div>Loading...</div>;

  const cls = 'explorer-pane' + (drag.dragOverOrg === pane.orgId ? ' drag-over' : '');
  return (
    <div
      className={cls}
      onDragEnter={e => { e.preventDefault(); drag.setDragOver(pane.orgId); }}
      onDragOver={e => { e.preventDefault(); drag.setDragOver(pane.orgId); }}
      onDragLeave={e => { if (e.currentTarget === e.target) drag.setDragOver(undefined); }}
      onDrop={e => {
        e.preventDefault();
        drag.setDragOver(undefined);
        if (drag.draggingId && drag.sourceOrg !== pane.orgId) {
          alert(`(Mock) Would move ${drag.draggingId} to org ${pane.orgId}`);
        }
      }}
    >
      <div className="explorer-pane-header">
        <span>{title || pane.orgId}</span>
        <span className="org-badge">{pane.orgId}</span>
      </div>
      <ExplorerCommandBar side={side} />
      <div className="explorer-filter-bar">
        <input
          type="text"
          placeholder="Filter items..."
          value={pane.filterText}
          onChange={e => pane.setFilter(e.target.value)}
          aria-label="Filter items"
        />
      </div>
      <div className="explorer-breadcrumbs">
        <ResourceBreadcrumbs side={side} />
      </div>
      <div className="resource-tree-wrapper">
        <ResourceTree side={side} />
      </div>
    </div>
  );
};
