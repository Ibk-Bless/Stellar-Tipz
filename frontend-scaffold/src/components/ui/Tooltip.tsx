import React, { useState, useRef, useEffect, useCallback } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  id?: string;
  maxWidth?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
  id,
  maxWidth = 240,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generatedId = React.useId();
  const tooltipId = id ?? generatedId;

  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  }, []);

  const show = useCallback(() => {
    clearTimeouts();
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [delay, clearTimeouts]);

  const hide = useCallback(() => {
    clearTimeouts();
    setIsVisible(false);
    setAdjustedPosition(position);
  }, [clearTimeouts, position]);

  // Escape key dismissal
  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, hide]);

  // Auto-reposition to stay within viewport
  useEffect(() => {
    if (!isVisible || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let newPos = position;

    switch (position) {
      case 'top':
        if (rect.top < 100) newPos = 'bottom';
        break;
      case 'bottom':
        if (vh - rect.bottom < 100) newPos = 'top';
        break;
      case 'left':
        if (rect.left < 120) newPos = 'right';
        break;
      case 'right':
        if (vw - rect.right < 120) newPos = 'left';
        break;
    }

    if (newPos !== adjustedPosition) {
      setAdjustedPosition(newPos);
    }
  }, [isVisible, position, adjustedPosition]);

  // Touch long press
  const handleTouchStart = () => {
    longPressRef.current = setTimeout(() => setIsVisible(true), 500);
  };

  const handleTouchEnd = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  useEffect(() => clearTimeouts, [clearTimeouts]);

  const positionClasses: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses: Record<string, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-black border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-black border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-black border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-black border-t-transparent border-b-transparent border-l-transparent',
  };

  // Clone child to add aria-describedby when id is provided
  let enhancedChild = children;
  if (id) {
    try {
      const child = React.Children.only(children);
      enhancedChild = React.cloneElement(child as React.ReactElement, {
        'aria-describedby': tooltipId,
      });
    } catch {
      enhancedChild = children;
    }
  }

  return (
    <div
      className="relative inline-block"
      ref={triggerRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {enhancedChild}
      {isVisible && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={`absolute z-50 px-3 py-1.5 text-sm bg-black text-white border-2 border-black ${positionClasses[adjustedPosition]}`}
          style={{
            boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
            maxWidth,
          }}
        >
          {content}
          <div
            className={`absolute border-solid border-[6px] ${arrowClasses[adjustedPosition]}`}
            style={{ width: 0, height: 0 }}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
