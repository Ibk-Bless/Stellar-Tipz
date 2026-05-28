import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ConfirmDialog from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Test Dialog',
    message: 'Are you sure you want to proceed?',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog when open', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);
    
    await user.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);
    
    await user.click(screen.getByText('Confirm'));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows consequences when provided', () => {
    const consequences = [
      'Your data will be deleted',
      'This action cannot be undone'
    ];
    
    render(
      <ConfirmDialog 
        {...defaultProps} 
        consequences={consequences}
      />
    );
    
    expect(screen.getByText('This action will:')).toBeInTheDocument();
    expect(screen.getByText('Your data will be deleted')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone')).toBeInTheDocument();
  });

  it('requires typing confirmation when specified', async () => {
    const user = userEvent.setup();
    render(
      <ConfirmDialog 
        {...defaultProps} 
        requireTyping="DELETE"
      />
    );
    
    expect(screen.getByText('Type "DELETE" to confirm:')).toBeInTheDocument();
    
    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toBeDisabled();
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'DELETE');
    
    expect(confirmButton).toBeEnabled();
  });

  it('enables confirm button only when correct text is typed', async () => {
    const user = userEvent.setup();
    render(
      <ConfirmDialog 
        {...defaultProps} 
        requireTyping="alice"
      />
    );
    
    const confirmButton = screen.getByText('Confirm');
    const input = screen.getByRole('textbox');
    
    // Initially disabled
    expect(confirmButton).toBeDisabled();
    
    // Wrong text - still disabled
    await user.type(input, 'bob');
    expect(confirmButton).toBeDisabled();
    
    // Clear and type correct text
    await user.clear(input);
    await user.type(input, 'alice');
    expect(confirmButton).toBeEnabled();
  });

  it('handles Enter key to confirm when enabled', async () => {
    const user = userEvent.setup();
    render(
      <ConfirmDialog 
        {...defaultProps} 
        requireTyping="test"
      />
    );
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'test');
    
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('does not confirm on Enter when disabled', async () => {
    const user = userEvent.setup();
    render(
      <ConfirmDialog 
        {...defaultProps} 
        requireTyping="test"
      />
    );
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'wrong');
    
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(
      <ConfirmDialog 
        {...defaultProps} 
        loading={true}
      />
    );
    
    const confirmButton = screen.getByText('Confirm');
    const cancelButton = screen.getByText('Cancel');
    
    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('uses custom button text', () => {
    render(
      <ConfirmDialog 
        {...defaultProps} 
        confirmText="Delete Now"
        cancelText="Keep It"
      />
    );
    
    expect(screen.getByText('Delete Now')).toBeInTheDocument();
    expect(screen.getByText('Keep It')).toBeInTheDocument();
  });

  it('focuses input when dialog opens', async () => {
    const { rerender } = render(
      <ConfirmDialog 
        {...defaultProps} 
        isOpen={false}
        requireTyping="test"
      />
    );
    
    rerender(
      <ConfirmDialog 
        {...defaultProps} 
        isOpen={true}
        requireTyping="test"
      />
    );
    
    await waitFor(() => {
      const input = screen.getByRole('textbox');
      expect(input).toHaveFocus();
    });
  });

  it('resets input when dialog reopens', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ConfirmDialog 
        {...defaultProps} 
        requireTyping="test"
      />
    );
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'some text');
    
    // Close dialog
    rerender(
      <ConfirmDialog 
        {...defaultProps} 
        isOpen={false}
        requireTyping="test"
      />
    );
    
    // Reopen dialog
    rerender(
      <ConfirmDialog 
        {...defaultProps} 
        isOpen={true}
        requireTyping="test"
      />
    );
    
    const newInput = screen.getByRole('textbox');
    expect(newInput).toHaveValue('');
  });
});