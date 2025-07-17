import { useEffect, RefObject } from "react";

type Handler = () => void;

export default function useOutsideClick<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: Handler,
  active = true
) {
  useEffect(() => {
    if (!active) return;

    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };

    document.addEventListener("mousedown", listener);

    // Unmount the event listener
    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, [ref, handler, active]);
}
