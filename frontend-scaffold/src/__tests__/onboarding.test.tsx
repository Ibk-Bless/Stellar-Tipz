import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OnboardingTour from '../features/onboarding/OnboardingTour';
import { useOnboarding } from '../hooks/useOnboarding';

const TestHarness = () => {
  const { isTourOpen, completeTour, skipTour } = useOnboarding();
  return (
    <>
      <OnboardingTour open={isTourOpen} onComplete={completeTour} onSkip={skipTour} />
    </>
  );
};

describe('Onboarding', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows tour on first visit', async () => {
    render(<TestHarness />);

    expect(await screen.findByText(/welcome to tipz/i)).toBeInTheDocument();
  });

  it('does not show on repeat visit', async () => {
    localStorage.setItem('tipz_onboarding', 'completed');

    render(<TestHarness />);

    await waitFor(() => {
      expect(screen.queryByText(/welcome to tipz/i)).not.toBeInTheDocument();
    });
  });

  it('advances through steps', async () => {
    const user = userEvent.setup();

    render(<TestHarness />);

    await user.click(await screen.findByRole('button', { name: /next/i }));

    expect(await screen.findByText(/connect your wallet/i)).toBeInTheDocument();
  });

  it('can be skipped', async () => {
    const user = userEvent.setup();

    render(<TestHarness />);

    await user.click(await screen.findByRole('button', { name: /skip/i }));

    await waitFor(() => {
      expect(screen.queryByText(/welcome to tipz/i)).not.toBeInTheDocument();
    });
  });
});
