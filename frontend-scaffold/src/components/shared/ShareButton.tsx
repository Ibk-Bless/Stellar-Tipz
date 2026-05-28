import React, { useState } from 'react';
import { Share2, Copy, Check, Twitter, Facebook, Linkedin, MessageSquare, ExternalLink } from 'lucide-react';

import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useToastStore } from '@/store/toastStore';
import {
  generateShareURL,
  copyToClipboard,
  nativeShare,
  isNativeShareSupported,
  getRecommendedPlatforms,
  generateShareLink,
  generateShareText,
} from '@/helpers/sharing';

type ShareType = 'tip' | 'achievement' | 'profile';
type SharePlatform = 'twitter' | 'facebook' | 'linkedin' | 'reddit';

interface ShareData {
  amount?: number;
  to?: string;
  from?: string;
  message?: string;
  achievement?: string;
  username?: string;
}

interface ShareButtonProps {
  type: ShareType;
  data: ShareData;
  variant?: 'button' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const platformIcons = {
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  reddit: MessageSquare,
};

const platformNames = {
  twitter: 'Twitter/X',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  reddit: 'Reddit',
};

const platformColors = {
  twitter: 'bg-black text-white hover:bg-gray-800',
  facebook: 'bg-blue-600 text-white hover:bg-blue-700',
  linkedin: 'bg-blue-700 text-white hover:bg-blue-800',
  reddit: 'bg-orange-600 text-white hover:bg-orange-700',
};

const ShareButton: React.FC<ShareButtonProps> = ({
  type,
  data,
  variant = 'button',
  size = 'md',
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addToast } = useToastStore();

  const shareText = generateShareText(type, data);
  const shareUrl = generateShareLink(type, data);
  const platforms = getRecommendedPlatforms();

  const handleNativeShare = async () => {
    const success = await nativeShare(type, data);
    if (success) {
      setIsModalOpen(false);
      addToast({
        type: 'success',
        message: 'Shared successfully!',
        duration: 3000,
      });
    } else {
      // Fallback to modal if native share fails
      setIsModalOpen(true);
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      addToast({
        type: 'success',
        message: 'Link copied to clipboard!',
        duration: 3000,
      });
      setTimeout(() => setCopied(false), 2000);
    } else {
      addToast({
        type: 'error',
        message: 'Failed to copy link',
        duration: 3000,
      });
    }
  };

  const handlePlatformShare = (platform: SharePlatform) => {
    const url = generateShareURL(platform, type, data);
    window.open(url, '_blank', 'width=600,height=400');
    setIsModalOpen(false);
  };

  const handleMainAction = () => {
    if (isNativeShareSupported()) {
      handleNativeShare();
    } else {
      setIsModalOpen(true);
    }
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleMainAction}
          className={`inline-flex items-center justify-center rounded-full border-2 border-black bg-white p-2 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${className}`}
          aria-label="Share"
        >
          <Share2 size={16} />
        </button>
        <ShareModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          shareText={shareText}
          shareUrl={shareUrl}
          platforms={platforms}
          copied={copied}
          onCopyLink={handleCopyLink}
          onPlatformShare={handlePlatformShare}
        />
      </>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size={size}
        onClick={handleMainAction}
        icon={<Share2 size={18} />}
        className={className}
      >
        Share
      </Button>
      <ShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shareText={shareText}
        shareUrl={shareUrl}
        platforms={platforms}
        copied={copied}
        onCopyLink={handleCopyLink}
        onPlatformShare={handlePlatformShare}
      />
    </>
  );
};

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareText: string;
  shareUrl: string;
  platforms: SharePlatform[];
  copied: boolean;
  onCopyLink: () => void;
  onPlatformShare: (platform: SharePlatform) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  shareText,
  shareUrl,
  platforms,
  copied,
  onCopyLink,
  onPlatformShare,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share"
      ariaLabelledBy="share-modal-title"
    >
      <div className="space-y-6 p-6">
        {/* Share text preview */}
        <div className="space-y-2">
          <label className="block text-sm font-black uppercase text-gray-700">
            Share Message:
          </label>
          <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-3">
            <p className="text-sm text-gray-800">{shareText}</p>
          </div>
        </div>

        {/* Platform buttons */}
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase text-gray-700">
            Share on:
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {platforms.map((platform) => {
              const Icon = platformIcons[platform];
              return (
                <button
                  key={platform}
                  onClick={() => onPlatformShare(platform)}
                  className={`flex items-center gap-3 rounded-lg border-2 border-black p-3 font-bold uppercase transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${platformColors[platform]}`}
                >
                  <Icon size={20} />
                  {platformNames[platform]}
                  <ExternalLink size={16} className="ml-auto" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Copy link */}
        <div className="space-y-2">
          <label className="block text-sm font-black uppercase text-gray-700">
            Or copy link:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 rounded-lg border-2 border-gray-300 bg-gray-50 px-3 py-2 text-sm font-mono"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={onCopyLink}
              icon={copied ? <Check size={16} /> : <Copy size={16} />}
              className={copied ? 'border-green-500 text-green-600' : ''}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ShareButton;