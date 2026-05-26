import React from 'react';
import Button from '@/components/ui/Button';

interface OnboardingTourProps {
  open: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

interface TourStep {
  title: string;
  description: string;
  selector?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to Tipz',
    description:
      'Start your creator journey with fast Stellar tipping, discover top creators, and keep your wallet ready.',
  },
  {
    title: 'Connect Your Wallet',
    description:
      'Use this button to link a Stellar wallet and unlock sending or receiving tips on Tipz.',
    selector: 'button[data-tour-id="tour-wallet-connect"]',
  },
  {
    title: 'Browse Creators',
    description:
      'Find creators, explore profiles, and discover new communities with the leaderboard.',
    selector: 'button[data-tour-id="tour-browse-creators"]',
  },
  {
    title: 'Send a Tip',
    description:
      'Choose a creator, open their profile, and send a tip with just a few clicks.',
    selector: 'button[data-tour-id="tour-send-tip"]',
  },
  {
    title: 'Register Your Creator Profile',
    description:
      'Create your creator profile to start accepting tips and building your leaderboard presence.',
    selector: 'button[data-tour-id="tour-register"]',
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const TOOLTIP_GAP = 18;
const TOOLTIP_HEIGHT = 260;

const OnboardingTour: React.FC<OnboardingTourProps> = ({
  open,
  onComplete,
  onSkip,
}) => {
  const [stepIndex, setStepIndex] = React.useState(0);
  const [tooltipStyle, setTooltipStyle] = React.useState<React.CSSProperties>({});
  const [highlightStyle, setHighlightStyle] = React.useState<React.CSSProperties>({});

  const step = TOUR_STEPS[stepIndex];
  const progressText = `${stepIndex + 1} / ${TOUR_STEPS.length}`;

  React.useEffect(() => {
    if (!open) return;
    setStepIndex(0);
  }, [open]);

  React.useEffect(() => {
    if (!open || typeof window === 'undefined') return;

    const updatePosition = () => {
      const anchor = step.selector
        ? document.querySelector(step.selector) as HTMLElement | null
        : null;
      const isMobile = window.innerWidth < 640;
      if (!anchor || isMobile) {
        setHighlightStyle({ display: 'none' });
        setTooltipStyle({
          position: 'fixed',
          top: isMobile ? 20 : 80,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100vw - 32px)',
          maxWidth: 440,
          zIndex: 10002,
        });
        return;
      }

      const rect = anchor.getBoundingClientRect();
      const tooltipWidth = Math.min(380, window.innerWidth - 40);
      const left = clamp(
        rect.left + rect.width / 2,
        tooltipWidth / 2 + 20,
        window.innerWidth - tooltipWidth / 2 - 20,
      );
      const fitsBelow = rect.bottom + TOOLTIP_GAP + TOOLTIP_HEIGHT < window.innerHeight;
      const top = fitsBelow
        ? rect.bottom + TOOLTIP_GAP
        : Math.max(20, rect.top - TOOLTIP_GAP - TOOLTIP_HEIGHT);

      setHighlightStyle({
        position: 'fixed',
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
        borderRadius: 16,
        border: '2px solid rgba(255,255,255,0.9)',
        boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
        pointerEvents: 'none',
        transition: 'all 200ms ease',
        zIndex: 10001,
      });

      setTooltipStyle({
        position: 'fixed',
        top,
        left,
        transform: 'translateX(-50%)',
        width: tooltipWidth,
        maxWidth: 420,
        zIndex: 10002,
      });
    };

    const anchor = step.selector
      ? document.querySelector(step.selector) as HTMLElement | null
      : null;
    if (anchor && window.innerWidth >= 640) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }

    updatePosition();
    const raf = window.requestAnimationFrame(updatePosition);
    const timeout = window.setTimeout(updatePosition, 350);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, { passive: true });

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [open, stepIndex, step.selector]);

  React.useEffect(() => {
    if (!open || typeof window === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onSkip]);

  if (!open) return null;

  const handleNext = () => {
    if (stepIndex + 1 >= TOUR_STEPS.length) {
      onComplete();
      return;
    }
    setStepIndex((current) => current + 1);
  };

  const handleBack = () => {
    setStepIndex((current) => Math.max(0, current - 1));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Onboarding tour"
      aria-describedby="onboarding-tour-description"
      className="fixed inset-0 overflow-hidden px-4 py-8"
      style={{ background: 'rgba(0,0,0,0.55)', zIndex: 10000 }}
    >
      <div style={highlightStyle} />
      <div
        className="rounded-lg border-2 border-white bg-white p-5 text-black shadow-2xl sm:p-6"
        style={tooltipStyle}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-gray-500">
              {progressText}
            </p>
            <h2 className="mt-2 text-2xl font-black">{step.title}</h2>
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="text-sm font-black uppercase tracking-wide text-gray-600 hover:text-black"
          >
            Skip
          </button>
        </div>
        <div className="mb-5 h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-black transition-all duration-200"
            style={{ width: `${((stepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>
        <p id="onboarding-tour-description" className="mb-6 text-sm leading-6 text-gray-700">
          {step.description}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.35em] text-gray-500">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="underline-offset-4 hover:underline"
              >
                Back
              </button>
            )}
            <span aria-label={`Step ${stepIndex + 1} of ${TOUR_STEPS.length}`}>
              Step {stepIndex + 1}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onSkip}
            >
              End Tour
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
            >
              {stepIndex + 1 >= TOUR_STEPS.length ? 'Finish' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
