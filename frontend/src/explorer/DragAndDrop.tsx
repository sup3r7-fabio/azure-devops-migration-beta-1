import React, { createContext, useContext, useState } from 'react';

// Lightweight custom drag context (can be replaced by react-dnd later without changing consumers)

interface DragState {
  draggingId?: string;
  sourceOrg?: string;
  dragOverOrg?: string;
}

interface DragContextValue extends DragState {
  beginDrag(id: string, orgId: string): void;
  endDrag(): void;
  setDragOver(orgId?: string): void;
}

const DragContext = createContext<DragContextValue | undefined>(undefined);

export const DragAndDropProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drag, setDrag] = useState<DragState>({});

  const beginDrag = (id: string, orgId: string) => setDrag({ draggingId: id, sourceOrg: orgId });
  const endDrag = () => setDrag({});
  const setDragOver = (orgId?: string) => setDrag(prev => ({ ...prev, dragOverOrg: orgId }));

  return (
  <DragContext.Provider value={{ ...drag, beginDrag, endDrag, setDragOver }}>
      {children}
    </DragContext.Provider>
  );
};

export function useDragContext() {
  const ctx = useContext(DragContext);
  if (!ctx) throw new Error('useDragContext must be used within DragAndDropProvider');
  return ctx;
}
