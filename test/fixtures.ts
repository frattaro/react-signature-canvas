import { PointGroup } from "signature_pad";

import { SignatureCanvasProps } from "../src";

export const props: SignatureCanvasProps = {
  velocityFilterWeight: 0.8,
  minWidth: 0.6,
  maxWidth: 2.6,
  minDistance: 4,
  dotSize: 2,
  penColor: "green",
  throttle: 17,
  canvasProps: { width: 500, height: 500 },
  clearOnResize: false,
  onEnd: () => {
    return "onEnd";
  },
  onBegin: () => {
    return "onBegin";
  }
};

const dotData: PointGroup[] = [
  {
    points: [{ x: 466.59375, y: 189, time: 1564339579755, pressure: 12 }],
    dotSize: 2,
    minWidth: 0.6,
    maxWidth: 2.6,
    penColor: "green",
    velocityFilterWeight: 0.8,
    compositeOperation: "color"
  }
];

const canvasProps = { width: 1011, height: 326 };
const trimmedSize = { width: 5, height: 4 };
export const dotF = { data: dotData, canvasProps, trimmedSize };
