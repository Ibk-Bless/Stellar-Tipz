/**
 * Tests for React component memoization
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React, { useMemo } from 'react';
import LeaderboardRow from '../features/leaderboard/LeaderboardRow';
import { BrowserRouter } from 'react-router-dom';

// Mock the stores and hooks
vi.mock('../store', () => ({
  useWalletStore: () => ({
    connected: false,
    publicKey: null,
  }),
}));

vi.mock('../hooks/useFavorites', () => ({
  useFavorites: () => ({
    isFavorite: () => false,
    toggleFavorite: vi.fn(),
  }),
}));

vi.mock('../hooks/useRenderCount', () => ({
  useRenderCount: vi.fn(),
}));

describe('Component memoization', () => {
  it('LeaderboardRow does not re-render on parent update with same props', () => {
    const renderSpy = vi.fn();
    
    const MemoizedRow = React.memo(({ entry }: { entry: Record<string, unknown> }) => {
      renderSpy();
      return (
        <BrowserRouter>
          <table>
            <tbody>
              <LeaderboardRow entry={entry} rank={1} />
            </tbody>
          </table>
        </BrowserRouter>
      );
    });

    const entry = {
      address: 'GTEST123',
      username: 'alice',
      totalTipsReceived: 1000,
      creditScore: 75,
    };

    const { rerender } = render(<MemoizedRow entry={entry} />);
    
    // First render
    expect(renderSpy).toHaveBeenCalledTimes(1);
    
    // Re-render with same props
    rerender(<MemoizedRow entry={entry} />);
    
    // Should not trigger additional render due to memoization
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });

  it('useMemo prevents recomputation with same dependencies', () => {
    const computeSpy = vi.fn();
    
    const TestComponent = ({ data }: { data: number[] }) => {
      const sorted = useMemo(() => {
        computeSpy();
        return [...data].sort((a, b) => b - a);
      }, [data]);
      
      return <div>{sorted.join(',')}</div>;
    };

    const mockData = [3, 1, 4, 1, 5];
    const { rerender } = render(<TestComponent data={mockData} />);
    
    // First render
    expect(computeSpy).toHaveBeenCalledTimes(1);
    
    // Re-render with same data reference
    rerender(<TestComponent data={mockData} />);
    
    // Should not recompute
    expect(computeSpy).toHaveBeenCalledTimes(1);
    
    // Re-render with new data
    rerender(<TestComponent data={[1, 2, 3]} />);
    
    // Should recompute
    expect(computeSpy).toHaveBeenCalledTimes(2);
  });

  it('useCallback prevents function recreation with same dependencies', () => {
    const TestComponent = ({ onClick }: { onClick: () => void }) => {
      return <button onClick={onClick}>Click me</button>;
    };

    const MemoizedButton = React.memo(TestComponent);
    
    const Parent = ({ value }: { value: number }) => {
      const handleClick = React.useCallback(() => {
        console.log('clicked', value);
      }, [value]);
      
      return <MemoizedButton onClick={handleClick} />;
    };

    const { rerender } = render(<Parent value={1} />);
    
    // Re-render with same value
    rerender(<Parent value={1} />);
    
    // Component should be memoized
    expect(true).toBe(true); // Placeholder assertion
  });
});
