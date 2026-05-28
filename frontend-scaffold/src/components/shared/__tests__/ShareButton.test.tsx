import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ShareButton from '../ShareButton';

// Mock the sharing helpers
vi.mock('@/helpers/sharing', () => ({
  generateShareURL: vi.fn((platform, type, data) => `https://${platform}.com/share?data=${JSON.stringify(data)}`),
  generateShareLink: vi.fn((type, data) => `https://tipz.app/@${data.username || 'test'}`),
  generateShareText: vi.fn((type, data) => `Test share text for ${type}`),
  copyToClipboard: vi.fn(),
  nativeShare: vi.fn(),
  isNativeShareSupported: vi.fn(),
  getRecommendedPlatforms: vi.fn(() => ['twitter', 'facebook']),
}));

// Mock toast store
vi.mock('@/store/toastStore', () => ({
  useToastStore: () => ({
    addToast: vi.fn(),
  }),
}));

const mockSharing = await import('@/helpers/sharing');

describe('ShareButton', () => {
  const defaultProps = {
    type: 'tip' as const,
    data: { amount: 10, to: 'alice' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (mockSharing.isNativeShareSupported as any).mockReturnValue(false);
  });

  it('renders button variant by default', () => {
    render(<ShareButton {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });

  it('renders icon variant when specified', () => {
    render(<ShareButton {...defaultProps} variant="icon" />);
    
    const button = screen.getByRole('button', { name: /share/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('rounded-full');
  });

  it('opens modal when clicked and native share not supported', async () => {
    const user = userEvent.setup();
    render(<ShareButton {...defaultProps} />);
    
    await user.click(screen.getByRole('button', { name: /share/i }));
    
    expect(screen.getByText('Share')).toBeInTheDocument();
    expect(screen.getByText('Share on:')).toBeInTheDocument();
  });

  it('uses native share when supported', async () => {
    (mockSharing.isNativeShareSupported as any).mockReturnValue(true);
    (mockSharing.nativeShare as any).mockResolvedValue(true);
    
    const user = userEvent.setup();
    render(<ShareButton {...defaultProps} />);
    
    await user.click(screen.getByRole('button', { name: /share/i }));
    
    expect(mockSharing.nativeShare).toHaveBeenCalledWith('tip', defaultProps.data);
  });

  it('falls back to modal when native share fails', async () => {
    (mockSharing.isNativeShareSupported as any).mockReturnValue(true);
    (mockSharing.nativeShare as any).mockResolvedValue(false);
    
    const user = userEvent.setup();
    render(<ShareButton {...defaultProps} />);
    
    await user.click(screen.getByRole('button', { name: /share/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Share on:')).toBeInTheDocument();
    });
  });

  it('displays share text in modal', async () => {
    const user = userEvent.setup();
    render(<ShareButton {...defaultProps} />);
    
    await user.click(screen.getByRole('button', { name: /share/i }));
    
    expect(screen.getByText('Test share text for tip')).toBeInTheDocument();
  });

  it('shows platform buttons in modal', async () => {
    const user = userEvent.setup();
    render(<ShareButton {...defaultProps} />);
    
    await user.click(screen.getByRole('button', { name: /share/i }));
    
    expect(screen.getByText('Twitter/X')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
  });

  it('opens platform share window when platform button clicked', async () => {
    const mockOpen = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = userEvent.setup();
    
    render(<ShareButton {...defaultProps} />);
    
    await user.click(screen.getByRole('button', { name: /share/i }));
    await user.click(screen.getByText('Twitter/X'));
    
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com'),
      '_blank',
      'width=600,height=400'
    );
    
    mockOpen.mockRestore();
  });

  it('copies link to clipboard when copy button clicked', async () => {
    (mockSharing.copyToClipboard as any).mockResolvedValue(true);
    const user = userEvent.setup();
    
    render(<ShareButton {...defaultProps} />);
    
    await user.click(screen.getByRole('button', { name: /share/i }));
    await user.click(screen.getByText('Copy'));
    
    expect(mockSharing.copyToClipboard).toHaveBeenCalledWith('https://tipz.app/@alice');
  });

  it('shows copied state after successful copy', async () => {
    (mockSharing.copyToClipboard as any).mockResolvedValue(true);
    const user = userEvent.setup();
    
    render(<ShareButton {...defaultProps} />);
    
    await user.click(screen.getByRole('button', { name: /share/i }));
    await user.click(screen.getByText('Copy'));
    
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('displays share URL in readonly input', async () => {
    const user = userEvent.setup();
    render(<ShareButton {...defaultProps} />);
    
    await user.click(screen.getByRole('button', { name: /share/i }));
    
    const input = screen.getByDisplayValue('https://tipz.app/@alice');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('readonly');
  });

  it('closes modal when close button clicked', async () => {
    const user = userEvent.setup();
    render(<ShareButton {...defaultProps} />);
    
    await user.click(screen.getByRole('button', { name: /share/i }));
    
    // Modal should be open
    expect(screen.getByText('Share on:')).toBeInTheDocument();
    
    // Close modal (assuming Modal component has a close button)
    fireEvent.keyDown(document, { key: 'Escape' });
    
    await waitFor(() => {
      expect(screen.queryByText('Share on:')).not.toBeInTheDocument();
    });
  });

  it('handles different share types', () => {
    const achievementProps = {
      type: 'achievement' as const,
      data: { achievement: 'First Tip', username: 'bob' },
    };
    
    render(<ShareButton {...achievementProps} />);
    
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ShareButton {...defaultProps} className="custom-class" />);
    
    const button = screen.getByRole('button', { name: /share/i });
    expect(button).toHaveClass('custom-class');
  });

  it('supports different sizes', () => {
    render(<ShareButton {...defaultProps} size="lg" />);
    
    const button = screen.getByRole('button', { name: /share/i });
    expect(button).toBeInTheDocument();
  });
});