import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useFavorites } from "../useFavorites";
import { useWalletStore } from "../../store/walletStore";
import { useFavoritesStore } from "../../store/favoritesStore";

describe("useFavorites", () => {
  const mockWallet = "GD1234567890ABCDEF";
  const mockCreator = { address: "GABC123", username: "alice" };

  beforeEach(() => {
    // Reset stores
    useWalletStore.setState({
      publicKey: mockWallet,
      connected: true,
    });
    useFavoritesStore.setState({
      favoritesByWallet: {},
    });
  });

  it("should add a creator to favorites", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite(mockCreator);
    });

    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0].address).toBe(mockCreator.address);
    expect(result.current.isFavorite(mockCreator.address)).toBe(true);
  });

  it("should remove a creator from favorites", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite(mockCreator);
    });
    expect(result.current.favorites).toHaveLength(1);

    act(() => {
      result.current.toggleFavorite(mockCreator);
    });
    expect(result.current.favorites).toHaveLength(0);
    expect(result.current.isFavorite(mockCreator.address)).toBe(false);
  });

  it("should sort favorites", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite({ address: "ADDR1", username: "Charlie" });
      result.current.toggleFavorite({ address: "ADDR2", username: "Alice" });
      result.current.toggleFavorite({ address: "ADDR3", username: "Bob" });
    });

    // Alphabetical
    const alpha = result.current.sortedFavorites("alphabetical");
    expect(alpha[0].username).toBe("Alice");
    expect(alpha[1].username).toBe("Bob");
    expect(alpha[2].username).toBe("Charlie");

    // Most tipped (record some tips)
    act(() => {
        result.current.recordTip("ADDR3"); // Bob
        result.current.recordTip("ADDR3");
        result.current.recordTip("ADDR1"); // Charlie
    });

    const mostTipped = result.current.sortedFavorites("most_tipped");
    expect(mostTipped[0].username).toBe("Bob"); // 2 tips
    expect(mostTipped[1].username).toBe("Charlie"); // 1 tip
    expect(mostTipped[2].username).toBe("Alice"); // 0 tips
  });

  it("should be wallet-specific", () => {
    const { result, rerender } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite(mockCreator);
    });
    expect(result.current.favorites).toHaveLength(1);

    // Switch wallet
    act(() => {
      useWalletStore.setState({ publicKey: "GOTH888", connected: true });
    });
    
    // We need to wait for the hook to react to store change if it uses selectors
    // renderHook with zustand usually reacts immediately if it's using the store
    
    expect(result.current.favorites).toHaveLength(0);

    act(() => {
        result.current.toggleFavorite({ address: "GXYZ", username: "bob" });
    });
    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0].username).toBe("bob");

    // Switch back
    act(() => {
        useWalletStore.setState({ publicKey: mockWallet, connected: true });
    });
    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0].username).toBe("alice");
  });
});
