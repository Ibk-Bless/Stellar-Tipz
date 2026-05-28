import { render, screen, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import LazyComponent from "../LazyComponent";

type ObserverCallback = (entries: IntersectionObserverEntry[]) => void;

let observerCallbacks: ObserverCallback[] = [];

class ControlledIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds = [];

  constructor(private readonly callback: ObserverCallback) {
    observerCallbacks.push(callback);
  }

  disconnect(): void {
    observerCallbacks = observerCallbacks.filter((cb) => cb !== this.callback);
  }
  observe(): void {}
  unobserve(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

const triggerIntersect = (isIntersecting: boolean): void => {
  const entry = {
    isIntersecting,
    target: document.createElement("div"),
  } as unknown as IntersectionObserverEntry;
  act(() => {
    for (const cb of [...observerCallbacks]) {
      cb([entry]);
    }
  });
};

describe("LazyComponent", () => {
  beforeEach(() => {
    observerCallbacks = [];
    vi.stubGlobal("IntersectionObserver", ControlledIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the fallback while the wrapper is off-screen", () => {
    render(
      <LazyComponent fallback={<span data-testid="fallback">loading</span>}>
        <span data-testid="child">child</span>
      </LazyComponent>,
    );

    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    expect(screen.queryByTestId("child")).toBeNull();
  });

  it("renders children once visible", () => {
    render(
      <LazyComponent fallback={<span data-testid="fallback">loading</span>}>
        <span data-testid="child">child</span>
      </LazyComponent>,
    );

    triggerIntersect(true);

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders children immediately when eager", () => {
    render(
      <LazyComponent eager fallback={<span>loading</span>}>
        <span data-testid="child">child</span>
      </LazyComponent>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
