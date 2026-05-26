import React, { useState } from 'react';
import { AlertCircle, Loader } from 'lucide-react';

interface VerificationRequestFormProps {
  onSubmit: (verificationType: 'Identity' | 'SocialMedia' | 'Community') => Promise<void>;
  isLoading?: boolean;
  error?: string;
  onClose?: () => void;
}

export const VerificationRequestForm: React.FC<VerificationRequestFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  onClose,
}) => {
  const [selectedType, setSelectedType] = useState<'Identity' | 'SocialMedia' | 'Community' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    setIsSubmitting(true);
    try {
      await onSubmit(selectedType);
      setSelectedType(null);
      onClose?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  const verificationTypes = [
    {
      id: 'Identity',
      label: 'Identity Verification',
      description: 'Verify your real-world identity',
    },
    {
      id: 'SocialMedia',
      label: 'Social Media Verification',
      description: 'Link and verify your social media accounts',
    },
    {
      id: 'Community',
      label: 'Community Verification',
      description: 'Verified by community members',
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        {verificationTypes.map((type) => (
          <label
            key={type.id}
            className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
          >
            <input
              type="radio"
              name="verificationType"
              value={type.id}
              checked={selectedType === type.id}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="mt-1"
            />
            <div className="flex-1">
              <p className="font-medium text-sm">{type.label}</p>
              <p className="text-xs text-gray-600">{type.description}</p>
            </div>
          </label>
        ))}
      </div>

      {error && (
        <div
          className="flex items-center gap-2 p-3 bg-red-50 rounded-lg"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <AlertCircle className="w-4 h-4 text-red-600" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
          disabled={isSubmitting || isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!selectedType || isSubmitting || isLoading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Request Verification'
          )}
        </button>
      </div>
    </form>
  );
};

export default VerificationRequestForm;
