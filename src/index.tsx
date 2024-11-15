import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef
} from "react";
import SignaturePad, { Options } from "signature_pad";
import trimCanvas from "trim-canvas";

import { useCombinedRefs } from "./useCombinedRefs";

export interface SignatureCanvasProps extends Options {
  canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
  clearOnResize?: boolean;
  onEnd?: () => void;
  onBegin?: () => void;
  onClear?: () => void;
}

export interface SignatureCanvasHandle {
  on: SignaturePad["on"];
  off: SignaturePad["off"];
  clear: SignaturePad["clear"];
  isEmpty: SignaturePad["isEmpty"];
  fromDataURL: SignaturePad["fromDataURL"];
  toDataURL: SignaturePad["toDataURL"];
  fromData: SignaturePad["fromData"];
  toData: SignaturePad["toData"];
  getHeight: () => number;
  getTrimmedCanvas: () => HTMLCanvasElement | undefined;
  getWidth: () => number;
}

const SignatureCanvas = forwardRef<
  SignatureCanvasHandle | null,
  SignatureCanvasProps
>(
  (
    {
      canvasProps,
      clearOnResize = true,
      onBegin,
      onEnd,
      onClear,
      ...signaturePadProps
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const sigPadRef = useRef<SignaturePad | null>(null);
    const handleRef = useRef<SignatureCanvasHandle | null>(null);
    const combinedRef = useCombinedRefs(ref, handleRef);

    const resizeCanvas = useCallback(() => {
      const { width, height } = canvasProps || {};
      if (typeof width !== "undefined" && typeof height !== "undefined") {
        return;
      }

      if (!canvasRef.current || !sigPadRef.current) return;

      const data = sigPadRef.current.toData();

      const ratio = Math.max(window.devicePixelRatio ?? 1, 1);

      if (typeof width === "undefined") {
        canvasRef.current.width = canvasRef.current.offsetWidth * ratio;
      }

      if (typeof height === "undefined") {
        canvasRef.current.height = canvasRef.current.offsetHeight * ratio;
      }

      canvasRef.current.getContext("2d")!.scale(ratio, ratio);

      if (clearOnResize) {
        sigPadRef.current.clear();
        onClear?.();
      } else if (data) {
        sigPadRef.current.fromData(data);
        onEnd?.();
      }

      console.log(sigPadRef.current.toDataURL("image/svg+xml"));
    }, [canvasRef, canvasProps, sigPadRef, clearOnResize]);

    const checkClearOnResize = useCallback(() => {
      resizeCanvas();
    }, [clearOnResize, resizeCanvas]);

    useImperativeHandle(
      combinedRef,
      () => ({
        on: () => {
          window.addEventListener("resize", checkClearOnResize);
          return sigPadRef.current?.on();
        },
        off: () => {
          window.removeEventListener("resize", checkClearOnResize);
          return sigPadRef.current?.off();
        },
        clear: () => {
          sigPadRef.current?.clear();
          onClear?.();
        },
        isEmpty: () => {
          return sigPadRef.current?.isEmpty() ?? true;
        },
        fromDataURL: (dataUrl, options) => {
          return (
            sigPadRef.current?.fromDataURL(dataUrl, options) ??
            Promise.resolve()
          );
        },
        toDataURL: (type, encoderOptions) => {
          return sigPadRef.current?.toDataURL(type, encoderOptions) || "";
        },
        fromData: (pointGroups, options) => {
          return sigPadRef.current?.fromData(pointGroups, options);
        },
        toData: () => {
          return sigPadRef.current?.toData() ?? [];
        },
        getTrimmedCanvas: () => {
          if (!canvasRef.current) return;

          const copy = document.createElement("canvas");
          copy.width = canvasRef.current.width;
          copy.height = canvasRef.current.height;
          copy.getContext("2d")!.drawImage(canvasRef.current, 0, 0);
          return trimCanvas(copy);
        },
        getHeight: () => {
          return canvasRef.current?.height ?? 0;
        },
        getWidth: () => {
          return canvasRef.current?.width ?? 0;
        }
      }),
      [sigPadRef.current, canvasRef.current]
    );

    useEffect(() => {
      if (!canvasRef.current) return;
      sigPadRef.current = new SignaturePad(
        canvasRef.current,
        signaturePadProps
      );
      if (onBegin) {
        sigPadRef.current.addEventListener("beginStroke", onBegin);
      }

      if (onEnd) {
        sigPadRef.current.addEventListener("endStroke", onEnd);
      }

      resizeCanvas();

      window.addEventListener("resize", checkClearOnResize);
      sigPadRef.current?.on();

      return () => {
        if (onBegin) {
          sigPadRef.current?.removeEventListener("beginStroke", onBegin);
        }

        if (onEnd) {
          sigPadRef.current?.removeEventListener("endStroke", onEnd);
        }

        window.removeEventListener("resize", checkClearOnResize);
        sigPadRef.current?.off();
      };
    }, [
      canvasRef.current,
      sigPadRef.current,
      signaturePadProps,
      onBegin,
      onEnd
    ]);

    return <canvas ref={canvasRef} {...canvasProps} />;
  }
);

export default SignatureCanvas;
