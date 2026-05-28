import React from "react";
import { sanitizePlainText } from "@/helpers/sanitize";

interface TipMessageProps {
  message: string;
  className?: string;
}

const TipMessage: React.FC<TipMessageProps> = ({ message, className }) => {
  const safe = sanitizePlainText(message);
  if (!safe) return null;
  return (
    <p className={className ?? "text-sm text-gray-700 break-words"}>{safe}</p>
  );
};

export default TipMessage;
