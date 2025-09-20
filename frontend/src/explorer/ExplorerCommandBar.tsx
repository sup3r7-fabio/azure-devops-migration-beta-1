import React from 'react';
import { useExplorer } from './ExplorerContext';

interface Props { side: 'left' | 'right'; }

// Lightweight command bar inspired by Azure DevOps query editor toolbars.
export const ExplorerCommandBar: React.FC<Props> = ({ side }) => {
  const { left, right } = useExplorer();
  const pane = side === 'left' ? left : right;
  if (!pane) return null;

  const selected = Array.from(pane.selectedIds);

  const refresh = () => pane.refreshChildren(pane.currentFolderId);
  const collapseAll = () => {
    // Keep current folder expanded only.
    // (Mock approach: clear expanded except current)
    pane.expandedIds.forEach(id => { /* read only mut; replaced by setState ideally */ });
    // Not exposed setter; future improvement: add method in controller. For now alert.
    // eslint-disable-next-line no-alert
    alert('(Mock) Collapse All not yet implemented via state mutation');
  };
  const expandAll = () => {
    // eslint-disable-next-line no-alert
    alert('(Mock) Expand All not implemented');
  };
  const createItem = () => {
    // eslint-disable-next-line no-alert
    alert('(Mock) New item dialog');
  };
  const rename = () => {
    if (selected.length !== 1) return;
    const id = selected[0];
    const node = pane.nodesById.get(id);
    if (!node) return;
    const newName = prompt('Rename to:', node.name);
    if (newName && newName.trim() && newName !== node.name) {
      pane.rename(id, newName.trim());
    }
  };
  const del = () => {
    if (!selected.length) return;
    // eslint-disable-next-line no-alert
    alert('(Mock) Delete ' + selected.join(', '));
  };

  const disabledMulti = selected.length === 0;
  const renameDisabled = selected.length !== 1;

  return (
    <div className="explorer-command-bar" role="toolbar" aria-label="Explorer commands">
      <div className="cmd-group">
        <button onClick={refresh} title="Refresh">Refresh</button>
        <button onClick={collapseAll} title="Collapse All" disabled>Collapse</button>
        <button onClick={expandAll} title="Expand All" disabled>Expand</button>
      </div>
      <div className="cmd-separator" />
      <div className="cmd-group">
        <button onClick={createItem} title="New">New</button>
        <button onClick={rename} title="Rename" disabled={renameDisabled}>Rename</button>
        <button onClick={del} title="Delete" disabled={disabledMulti}>Delete</button>
      </div>
    </div>
  );
};
