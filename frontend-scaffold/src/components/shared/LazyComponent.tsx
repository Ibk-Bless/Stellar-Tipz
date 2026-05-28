import React, {
  ComponentType,
  LazyExoticComponent,
  PropsWithChildren,
  ReactNode,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";

export type LazyComponentProps = PropsWithChildren<{
  /** Rendered while the child is not in view or while a lazy chunk loads. */
  fallback?: ReactNode;
  /** Margin (in px) around the viewport that still counts as "visible". */
  rootMargin?: string;
  /** Once-only render guard. Defaults to true. */
  once?: boolean;
  /** Skip the IntersectionObserver and render immediately. */
  eager?: boolean;
}>;

/**
 * Defers rendering children until the wrapper enters the viewport.
 *
 * Charts, maps, and other heavy components can be wrapped to avoid paying
 * their cost during initial page load.
 */
const LazyComponent: React.FC<LazyComponentProps> = ({
  children,
  fallback = null,
  rootMargin = "200px",
  once = true,
  eager = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(eager);

  useEffect(() => {
    if (eager) {
      return;
    }

    const node = containerRef.current;
    if (!node) {
      return;
    }

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              observer.disconnect();
            }
          } else if (!once) {
            setIsVisible(false);
          }
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [rootMargin, once, eager]);

  return (
    <div ref={containerRef}>
      {isVisible ? (
        <Suspense fallback={fallback}>{children}</Suspense>
      ) : (
        fallback
      )}
    </div>
  );
};

export default LazyComponent;

/**
 * Helper to wrap a React.lazy() import in viewport-deferred Suspense.
 */
export function withLazyVisible<P extends object>(
  Component: LazyExoticComponent<ComponentType<P>>,
  options?: Omit<LazyComponentProps, "children">,
): React.FC<P> {
  const Wrapped: React.FC<P> = (props) => (
    <LazyComponent {...options}>
      <Component {...props} />
    </LazyComponent>
  );
  Wrapped.displayName = `WithLazyVisible(${Component.displayName ?? "Component"})`;
  return Wrapped;
}
