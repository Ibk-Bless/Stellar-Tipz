import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProfileCard from "../ProfileCard";
import { useFavorites } from "../../../hooks/useFavorites";

// Mock useFavorites
vi.mock("../../../hooks/useFavorites", () => ({
  useFavorites: vi.fn(),
}));

describe("ProfileCard", () => {
  const mockToggleFavorite = vi.fn();
  const mockIsFavorite = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useFavorites as any).mockReturnValue({
      isFavorite: mockIsFavorite,
      toggleFavorite: mockToggleFavorite,
    });
  });

  it("calls toggleFavorite when heart button is clicked", () => {
    mockIsFavorite.mockReturnValue(false);
    render(
      <ProfileCard 
        handle="alice" 
        publicKey="G123" 
      />
    );

    const favoriteButton = screen.getByLabelText(/Add to favorites/i);
    fireEvent.click(favoriteButton);

    expect(mockToggleFavorite).toHaveBeenCalledWith({ address: "G123", username: "alice" });
  });

  it("shows filled heart when is favorite", () => {
    mockIsFavorite.mockReturnValue(true);
    render(
      <ProfileCard 
        handle="alice" 
        publicKey="G123" 
      />
    );

    const favoriteButton = screen.getByLabelText(/Remove from favorites/i);
    expect(favoriteButton).toBeInTheDocument();
    
    // Check for filled heart (the icon has fill prop set to currentColor when favorite)
    const heartIcon = favoriteButton.querySelector('svg');
    expect(heartIcon).toHaveAttribute('fill', 'currentColor');
  });
});
