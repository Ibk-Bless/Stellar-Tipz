import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import TransactionStatus from "@/components/shared/TransactionStatus";
import { useContract } from "@/hooks";
import { useToastStore } from "@/store/toastStore";
import type { Profile } from "@/types/contract";
import type { ProfileFormData } from "@/types/profile";

type TxStatus =
  | "idle"
  | "signing"
  | "submitting"
  | "confirming"
  | "success"
  | "error";

interface FormErrors {
  displayName?: string;
  bio?: string;
  imageUrl?: string;
  xHandle?: string;
}

function validate(data: ProfileFormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.displayName.trim() || data.displayName.length > 64) {
    errors.displayName =
      "Display name is required and must be 1–64 characters.";
  }

  if (data.bio && data.bio.length > 280) {
    errors.bio = "Bio must be 280 characters or fewer.";
  }

  if (data.imageUrl && !isValidUrl(data.imageUrl)) {
    errors.imageUrl = "Please enter a valid URL.";
  }

  return errors;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

interface EditProfileFormProps {
  profile: Profile;
  onDirtyChange?: (dirty: boolean) => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  profile,
  onDirtyChange,
}) => {
  const [form, setForm] = useState<ProfileFormData>({
    username: profile.username,
    displayName: profile.displayName,
    bio: profile.bio,
    imageUrl: profile.imageUrl,
    xHandle: profile.xHandle,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [txError, setTxError] = useState<string | undefined>(undefined);

  const { updateProfile } = useContract();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  // Track whether any field differs from the original profile
  useEffect(() => {
    const isDirty =
      form.displayName !== profile.displayName ||
      form.bio !== profile.bio ||
      form.imageUrl !== profile.imageUrl ||
      form.xHandle !== profile.xHandle;
    onDirtyChange?.(isDirty);
  }, [form, profile, onDirtyChange]);

  const handleChange =
    (field: keyof ProfileFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setTxStatus("signing");
      setTxError(undefined);
      setTxHash(undefined);

      // Only include fields that have changed
      const data: Partial<ProfileFormData> = {};

      if (form.displayName.trim() !== profile.displayName) {
        data.displayName = form.displayName.trim();
      }
      if (form.bio.trim() !== profile.bio) {
        data.bio = form.bio.trim();
      }
      if (form.imageUrl.trim() !== profile.imageUrl) {
        data.imageUrl = form.imageUrl.trim();
      }
      const xHandleFormatted = form.xHandle.trim().replace(/^@/, "");
      if (xHandleFormatted !== profile.xHandle) {
        data.xHandle = xHandleFormatted;
      }

      // If no fields changed, show a toast and return
      if (Object.keys(data).length === 0) {
        addToast({
          message: "No changes to save.",
          type: "info",
          duration: 3000,
        });
        setTxStatus("idle");
        return;
      }

      setTxStatus("submitting");
      const hash = await updateProfile(data);

      setTxStatus("confirming");
      setTxHash(hash);

      setTxStatus("success");
      addToast({
        message: "Profile updated successfully!",
        type: "success",
        duration: 5000,
      });

      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      setTxStatus("error");
      setTxError(
        err instanceof Error ? err.message : "Update failed. Please try again.",
      );
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  const isSubmitting = ["signing", "submitting", "confirming"].includes(
    txStatus,
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6 max-w-lg mx-auto">
      {/* Username (read-only with lock icon) */}
      <div>
        <label className="block text-sm font-bold uppercase tracking-wide mb-2">
          Username
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 dark:text-gray-300">
            <Lock size={18} />
          </div>
          <input
            value={form.username}
            disabled
            className="w-full px-4 py-3 pl-12 border-2 border-black bg-gray-100 text-black font-medium opacity-75 cursor-not-allowed focus:outline-none"
          />
        </div>
        <p className="mt-1 text-xs text-gray-800 dark:text-gray-200">
          Username cannot be changed after registration.
        </p>
      </div>

      {/* Display Name */}
      <Input
        label="Display Name"
        placeholder="Your Name"
        value={form.displayName}
        onChange={handleChange("displayName")}
        error={errors.displayName}
        disabled={isSubmitting}
        maxLength={64}
        required
      />

      {/* Bio */}
      <Textarea
        label="Bio"
        placeholder="Tell supporters about yourself…"
        value={form.bio}
        onChange={handleChange("bio")}
        error={errors.bio}
        disabled={isSubmitting}
        maxLength={280}
        rows={4}
      />

      {/* X Handle */}
      <Input
        label="X (Twitter) Handle (optional)"
        placeholder="@yourhandle"
        value={form.xHandle}
        onChange={handleChange("xHandle")}
        error={errors.xHandle}
        disabled={isSubmitting}
      />

      {/* Image URL */}
      <Input
        label="Profile Image URL (optional)"
        placeholder="https://example.com/avatar.png"
        type="url"
        value={form.imageUrl}
        onChange={handleChange("imageUrl")}
        error={errors.imageUrl}
        disabled={isSubmitting}
      />

      {/* Transaction status */}
      {txStatus !== "idle" && (
        <TransactionStatus
          status={txStatus}
          txHash={txHash}
          errorMessage={txError}
          onRetry={() => setTxStatus("idle")}
        />
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={isSubmitting}
          className="flex-1"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting || txStatus === "success"}
          className="flex-1"
        >
          {isSubmitting ? "Updating…" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default EditProfileForm;
