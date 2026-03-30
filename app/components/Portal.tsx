"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

type PortalProps = {
  children: ReactNode;
  selector?: string;
};

export default function Portal({ children, selector = "body" }: PortalProps) {
  const mountRef = useRef<Element | null>(null);

  useEffect(() => {
    mountRef.current = document.querySelector(selector);
  }, [selector]);

  if (!mountRef.current) return null;

  return createPortal(children, mountRef.current);
}
