import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const HeaderActionsPortalContext = createContext<HTMLDivElement | null>(null);

/**
 * Wrap the app with this to provide the slot ref to consumers.
 */
export function HeaderActionsProvider({
  slotRef,
  children,
}: {
  slotRef: React.RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    setNode(slotRef.current);
  }, [slotRef]);

  return (
    <HeaderActionsPortalContext.Provider value={node}>
      {children}
    </HeaderActionsPortalContext.Provider>
  );
}

/**
 * Renders children into the header actions slot via a portal.
 */
export function HeaderActions({ children }: { children: ReactNode }) {
  const portalNode = useContext(HeaderActionsPortalContext);
  if (!portalNode) return null;
  return createPortal(children, portalNode);
}
