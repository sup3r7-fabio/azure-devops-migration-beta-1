// DualExplorerPage: Hosts two panes (left/right) each bound to a distinct org id.
// Uses mock provider; swap providerKind to 'api' once real backend endpoints exist.
import React from 'react';
import { ExplorerProvider } from '../../explorer/ExplorerContext';
import { DragAndDropProvider } from '../../explorer/DragAndDrop';
import { ExplorerPane } from '../../explorer/ExplorerPane';

export const DualExplorerPage: React.FC = () => {
  return (
    <ExplorerProvider providerKind="mock" leftOrgId="orgA" rightOrgId="orgB">
      <DragAndDropProvider>
        <div style={{ display: 'flex', gap: 8, padding: 8 }}>
          <ExplorerPane side="left" title="Organization A" />
          <ExplorerPane side="right" title="Organization B" />
        </div>
      </DragAndDropProvider>
    </ExplorerProvider>
  );
};

export default DualExplorerPage;
