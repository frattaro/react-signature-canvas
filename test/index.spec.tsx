import { RenderResult, render } from "@testing-library/react";
import React from "react";
import { describe, expect, it, test, vi } from "vitest";

import SignatureCanvas, {
  SignatureCanvasHandle,
  SignatureCanvasProps
} from "../src/index";
import { dotF, props } from "./fixtures";

function renderSCWithRef(props?: SignatureCanvasProps): {
  wrapper: RenderResult;
  instance: SignatureCanvasHandle;
  ref: React.RefObject<SignatureCanvasHandle>;
} {
  const ref = React.createRef<SignatureCanvasHandle>();
  const wrapper = render(<SignatureCanvas {...props} ref={ref} />);
  const instance = ref.current!;
  return { wrapper, instance, ref };
}

test("mounts canvas and instance properly", () => {
  const {
    wrapper: { container },
    instance
  } = renderSCWithRef();
  expect(container.querySelector("canvas")).toBeTruthy();
  expect(instance.isEmpty()).toBe(true);
});

describe("SigCanvas wrapper methods return equivalent to SigPad", () => {
  const { instance } = renderSCWithRef(props);
  const rSigPad = instance;

  test("toData should be equivalent", () => {
    const rData = rSigPad.toData();
    expect(rData).toStrictEqual([]);
  });

  test("fromData should be equivalent", () => {
    rSigPad.fromData(dotF.data);
    const rData = rSigPad.toData();
    expect(rData).toStrictEqual(dotF.data);
  });

  test("toDataURL should be equivalent", () => {
    rSigPad.fromData(dotF.data);
    expect(rSigPad.toDataURL()).toBe("");
    expect(rSigPad.toDataURL("image/jpg")).toBe("");
    expect(rSigPad.toDataURL("image/jpg", 0.7)).toBe("");
    expect(rSigPad.toDataURL("image/svg+xml")).toBe("");
  });

  test("fromDataURL should be equivalent", () => {
    rSigPad.fromData(dotF.data);
    const dotFDataURL = rSigPad.toDataURL();

    rSigPad.fromDataURL(dotFDataURL);
    const rDataURL = rSigPad.toDataURL();

    expect(rDataURL).toBe(dotFDataURL);
  });

  test("isEmpty & clear should be equivalent", () => {
    rSigPad.fromData(dotF.data);
    let isEmpty = rSigPad.isEmpty();
    expect(isEmpty).toBe(false);

    // both empty after clear
    rSigPad.clear();
    isEmpty = rSigPad.isEmpty();
    expect(isEmpty).toBe(true);
  });
});

// comes after props and wrapper methods as it uses both
describe("get methods", () => {
  const { instance } = renderSCWithRef({ canvasProps: dotF.canvasProps });
  instance.fromData(dotF.data);

  test("getTrimmedCanvas should return a trimmed canvas", () => {
    const trimmed = instance.getTrimmedCanvas();
    expect(trimmed?.width).toBe(dotF.trimmedSize.width);
    expect(trimmed?.height).toBe(dotF.trimmedSize.height);
  });
});

// comes after props, wrappers, and gets as it uses them all
describe("canvas resizing", () => {
  const { wrapper, instance, ref } = renderSCWithRef(props);

  it("should clear on resize", () => {
    instance.fromData(dotF.data);
    expect(instance.isEmpty()).toBe(false);

    window.resizeTo(500, 500);
    expect(instance.isEmpty()).toBe(false);
  });

  it("should not clear when clearOnResize is false", () => {
    wrapper.rerender(<SignatureCanvas ref={ref} clearOnResize={false} />);

    instance.fromData(dotF.data);
    expect(instance.isEmpty()).toBe(false);

    window.resizeTo(500, 500);
    expect(instance.isEmpty()).toBe(false);
  });

  const size = { width: 100, height: 100 };
  it("should not change size if fixed width & height", () => {
    // reset clearOnResize back to true after previous test
    wrapper.rerender(
      <SignatureCanvas ref={ref} clearOnResize canvasProps={size} />
    );
    window.resizeTo(500, 500);

    expect(instance.getWidth()).toBe(size.width);
    expect(instance.getHeight()).toBe(size.height);
  });

  it("should change size if no width or height", () => {
    wrapper.rerender(<SignatureCanvas ref={ref} canvasProps={{}} />);
    window.resizeTo(500, 500);

    expect(instance.getWidth()).not.toBe(size.width);
    expect(instance.getHeight()).not.toBe(size.height);
  });

  it("should partially change size if one of width or height", () => {
    wrapper.rerender(
      <SignatureCanvas ref={ref} canvasProps={{ width: size.width }} />
    );
    window.resizeTo(500, 500);

    expect(instance.getWidth()).toBe(size.width);
    expect(instance.getHeight()).not.toBe(size.height);

    // now do height instead
    wrapper.rerender(
      <SignatureCanvas ref={ref} canvasProps={{ height: size.height }} />
    );
    window.resizeTo(500, 500);

    expect(instance.getWidth()).not.toBe(size.width);
    expect(instance.getHeight()).toBe(size.height);
  });
});

// comes after wrappers and resizing as it uses both
describe("on & off methods", () => {
  const { wrapper, instance } = renderSCWithRef();

  it("should not clear when off, should clear when back on", () => {
    instance.fromData(dotF.data);
    expect(instance.isEmpty()).toBe(false);

    instance.off();
    window.resizeTo(500, 500);
    expect(instance.isEmpty()).toBe(false);

    instance.on();
    window.resizeTo(500, 500);
    expect(instance.isEmpty()).toBe(false);
  });

  it("should no longer fire after unmount", () => {
    // monkey-patch on with a mock to tell if it were called, as there's no way
    // to check what event listeners are attached to window
    const origOn = instance.on;
    instance.on = vi.fn(origOn);

    wrapper.unmount();
    window.resizeTo(500, 500);
    expect(instance.on).not.toBeCalled();
  });
});
