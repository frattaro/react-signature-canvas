import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import SignatureCanvas, { SignatureCanvasHandle } from "../../src/index.tsx";
// @ts-expect-error
import * as styles from "./styles.module.css";

export default function App() {
  const [dataUrl, setDataUrl] = useState("");
  const sigRef = useRef<SignatureCanvasHandle>(null);

  return (
    <div className={styles.container}>
      <div className={styles.sigContainer}>
        <SignatureCanvas
          canvasProps={{ className: styles.sigPad }}
          clearOnResize={false}
          ref={sigRef}
        />
      </div>
      <div>
        <button
          className={styles.buttons}
          onClick={() => {
            sigRef.current?.clear();
          }}
        >
          Clear
        </button>
        <button
          className={styles.buttons}
          onClick={() => {
            setDataUrl(sigRef.current?.toDataURL("image/svg+xml") ?? "");
          }}
        >
          Trim
        </button>
      </div>
      {dataUrl ? (
        <img className={styles.sigImage} alt="signature" src={dataUrl} />
      ) : null}
    </div>
  );
}

// @ts-expect-error
createRoot(document.getElementById("container")).render(<App />);
