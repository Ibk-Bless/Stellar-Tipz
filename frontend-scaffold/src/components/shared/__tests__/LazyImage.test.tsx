import { render, screen, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import LazyImage from "../LazyImage";

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

describe("LazyImage", () => {
  beforeEach(() => {
    observerCallbacks = [];
    vi.stubGlobal("IntersectionObserver", ControlledIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders placeholder before the image is visible", () => {
    render(
      <LazyImage
        src="/img/hero.jpg"
        placeholder="/img/hero-blur.jpg"
        alt="hero"
      />,
    );

    const img = screen.getByRole("img", { name: "hero" });
    expect(img).toHaveAttribute("src", "/img/hero-blur.jpg");
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("swaps to the real src when the observer fires", () => {
    render(
      <LazyImage
        src="/img/hero.jpg"
        placeholder="/img/hero-blur.jpg"
        alt="hero"
      />,
    );

    triggerIntersect(true);

    const img = screen.getByRole("img", { name: "hero" });
    expect(img).toHaveAttribute("src", "/img/hero.jpg");
  });

  it("uses eager loading when priority=true", () => {
    render(<LazyImage src="/img/hero.jpg" priority alt="hero" />);

    const img = screen.getByRole("img", { name: "hero" });
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("src", "/img/hero.jpg");
  });
});
