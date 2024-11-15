import { ForwardedRef, MutableRefObject, useEffect, useRef } from "react";

export const useCombinedRefs = <T>(
  ...refs: (MutableRefObject<T | undefined> | ForwardedRef<T>)[]
) => {
  const targetRef = useRef<T | null>(null);

  useEffect(() => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === "function") {
        ref(targetRef.current || null);
        return;
      }

      ref.current = targetRef.current;
    });
  }, [refs]);

  return targetRef;
};
