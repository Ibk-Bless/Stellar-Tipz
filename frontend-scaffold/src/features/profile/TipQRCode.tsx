import React, { useMemo, useRef, useState } from "react";
import { Copy, Download, ImageDown, Share2 } from "lucide-react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const TIP_DOMAIN = import.meta.env.VITE_APP_URL || window.location.origin;

type QRSize = "small" | "large";
type QRFormat = "png" | "svg";

interface TipQRCodeProps {
  username: string;
  className?: string;
}

const sizeOptions: Record<QRSize, { label: string; pixels: number }> = {
  small: { label: "Social", pixels: 220 },
  large: { label: "Print", pixels: 420 },
};

const buildTipUrl = (username: string) =>
  `${TIP_DOMAIN}/@${username.replace(/^@/, "")}`;

const TipQRCode: React.FC<TipQRCodeProps> = ({ username, className = "" }) => {
  const [size, setSize] = useState<QRSize>("small");
  const [format, setFormat] = useState<QRFormat>("png");
  const [copied, setCopied] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tipUrl = useMemo(() => buildTipUrl(username), [username]);
  const pixels = sizeOptions[size].pixels;

  const filename = `tipz-${username.replace(/^@/, "")}-qr.${format}`;

  const downloadSvg = () => {
    if (!svgRef.current) return;

    const svg = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = () => {
    const canvas = document.getElementById(
      "tipz-qr-canvas",
    ) as HTMLCanvasElement | null;
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = filename;
    link.click();
  };

  const handleDownload = () => {
    if (format === "svg") {
      downloadSvg();
    } else {
      downloadPng();
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(tipUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const shareQr = async () => {
    const canvas = document.getElementById(
      "tipz-qr-canvas",
    ) as HTMLCanvasElement | null;

    if (
      canvas &&
      "ClipboardItem" in window &&
      typeof canvas.toBlob === "function"
    ) {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          await copyLink();
          return;
        }
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
            "text/plain": new Blob([tipUrl], { type: "text/plain" }),
          }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
      return;
    }

    await copyLink();
  };

  return (
    <Card className={`space-y-5 ${className}`} padding="lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-gray-800 dark:text-gray-200">
            Tip page QR
          </p>
          <h2 className="mt-2 text-xl font-black uppercase">
            Share @{username}
          </h2>
        </div>
        <div className="flex gap-2">
          {(Object.keys(sizeOptions) as QRSize[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSize(option)}
              className={`border-2 border-black px-3 py-2 text-xs font-black uppercase ${
                size === option ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              {sizeOptions[option].label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative border-3 border-black bg-white p-4">
          <QRCodeCanvas
            id="tipz-qr-canvas"
            value={tipUrl}
            size={pixels}
            marginSize={2}
            role="img"
            aria-label={`QR code for ${tipUrl}`}
            imageSettings={{
              src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='10' fill='black'/%3E%3Ctext x='32' y='40' text-anchor='middle' font-size='26' font-family='Arial' font-weight='900' fill='white'%3ET%3C/text%3E%3C/svg%3E",
              height: Math.max(36, Math.round(pixels * 0.18)),
              width: Math.max(36, Math.round(pixels * 0.18)),
              excavate: true,
            }}
          />
          <div className="hidden">
            <QRCodeSVG
              ref={svgRef}
              value={tipUrl}
              size={pixels}
              marginSize={2}
              imageSettings={{
                src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='10' fill='black'/%3E%3Ctext x='32' y='40' text-anchor='middle' font-size='26' font-family='Arial' font-weight='900' fill='white'%3ET%3C/text%3E%3C/svg%3E",
                height: Math.max(36, Math.round(pixels * 0.18)),
                width: Math.max(36, Math.round(pixels * 0.18)),
                excavate: true,
              }}
            />
          </div>
        </div>
        <p className="max-w-full break-all border-2 border-black bg-yellow-100 px-3 py-2 text-center font-mono text-sm font-bold">
          {tipUrl}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex border-2 border-black">
          {(["png", "svg"] as QRFormat[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFormat(option)}
              className={`px-3 py-2 text-xs font-black uppercase ${
                format === option
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          icon={<Download size={16} />}
          onClick={handleDownload}
        >
          Download {format.toUpperCase()}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={<Copy size={16} />}
          onClick={() => void copyLink()}
        >
          {copied ? "Copied!" : "Copy link"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={<Share2 size={16} />}
          iconRight={<ImageDown size={16} />}
          onClick={() => void shareQr()}
        >
          Share
        </Button>
      </div>
    </Card>
  );
};

export default TipQRCode;
