"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type PortalProps = {
  children: ReactNode;
  selector?: string;
};

export default function Portal({ children, selector = "body" }: PortalProps) {
  const [mountNode, setMountNode] = useState<Element | null>(null);

  useEffect(() => {
    setMountNode(document.querySelector(selector));
  }, [selector]);

  if (!mountNode) return null;

  return createPortal(children, mountNode);
}
