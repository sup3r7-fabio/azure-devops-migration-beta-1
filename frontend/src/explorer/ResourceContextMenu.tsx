import React, { useState } from 'react';
import './ExplorerStyles.css';
import { useExplorer } from './ExplorerContext';

interface Props {
  nodeId: string;
  side: 'left' | 'right';
}

// Simplified context menu using Dropdown (azure-devops-ui lacks a direct ContextMenu trigger in some versions)
export const ResourceContextMenu: React.FC<Props> = ({ nodeId, side }) => {
  const { left, right } = useExplorer();
  const pane = side === 'left' ? left : right;
  const node = pane?.nodesById.get(nodeId);
  const [open, setOpen] = useState(false);
  const items = [
    { id: 'rename', text: 'Rename' },
    { id: 'delete', text: 'Delete' },
    { id: 'copy', text: 'Copy (mock)' },
    { id: 'move', text: 'Move (mock)' }
  ];

  if (!pane || !node) return null;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button className="resource-context-menu-trigger" aria-label={`Actions for ${node.name}`} onClick={() => setOpen(o => !o)}>⋮</button>
      {open && (
        <ul className="simple-menu">
          {items.map(it => (
            <li key={it.id}>
              <button
                onClick={() => {
                  if (it.id === 'rename') {
                    const newName = prompt('New name', node.name);
                    if (newName && newName !== node.name) pane.rename(node.id, newName);
                  } else if (it.id === 'delete') {
                    alert('Mock delete not fully implemented');
                  }
                  setOpen(false);
                }}
              >{it.text}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
