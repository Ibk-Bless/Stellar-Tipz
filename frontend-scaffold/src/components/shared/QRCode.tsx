import React, { useRef, useState } from "react";
import { Copy, Download } from "lucide-react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";

import Button from "@/components/ui/Button";

interface QRCodeProps {
  /** The URL or text to encode in the QR code */
  url: string;
  /** Display size in pixels (default: 200) */
  size?: number;
  /** Show download button */
  downloadable?: boolean;
  /** Custom filename for download (without extension) */
  filename?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Shared QR code component used across profile and tip pages.
 * Supports PNG and SVG download, copy link, and branded Tipz logo center.
 */
const QRCode: React.FC<QRCodeProps> = ({
  url,
  size = 200,
  downloadable = false,
  filename = "tipz-qr",
  className = "",
}) => {
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<"png" | "svg">("png");
  const svgRef = useRef<SVGSVGElement | null>(null);

  const canvasId = `tipz-qr-canvas-${filename.replace(/[^a-z0-9]/gi, "-")}`;

  const logoSettings = {
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='10' fill='black'/%3E%3Ctext x='32' y='40' text-anchor='middle' font-size='26' font-family='Arial' font-weight='900' fill='white'%3ET%3C/text%3E%3C/svg%3E",
    height: Math.max(28, Math.round(size * 0.18)),
    width: Math.max(28, Math.round(size * 0.18)),
    excavate: true,
  };

  const downloadPng = () => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${filename}.png`;
    link.click();
  };

  const downloadSvg = () => {
    if (!svgRef.current) return;
    const svg = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `${filename}.svg`;
    link.click();
    URL.revokeObjectURL(objectUrl);
  };

  const handleDownload = () => {
    if (format === "svg") {
      downloadSvg();
    } else {
      downloadPng();
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* QR canvas (visible) */}
      <div className="border-4 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <QRCodeCanvas
          id={canvasId}
          value={url}
          size={size}
          level="H"
          marginSize={2}
          role="img"
          aria-label={`QR code for ${url}`}
          imageSettings={logoSettings}
        />
      </div>

      {/* Hidden SVG for SVG download */}
      <div className="hidden" aria-hidden="true">
        <QRCodeSVG
          ref={svgRef}
          value={url}
          size={size}
          level="H"
          marginSize={2}
          imageSettings={logoSettings}
        />
      </div>

      {/* URL display */}
      <p className="max-w-full break-all border-2 border-black bg-yellow-100 px-3 py-2 text-center font-mono text-xs font-bold">
        {url}
      </p>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {downloadable && (
          <>
            {/* Format toggle */}
            <div className="flex border-2 border-black">
              {(["png", "svg"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`px-3 py-1.5 text-xs font-black uppercase ${
                    format === f ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
            <Button
              type="button"
              size="sm"
              icon={<Download size={14} />}
              onClick={handleDownload}
            >
              Download
            </Button>
          </>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={<Copy size={14} />}
          onClick={() => void copyLink()}
        >
          {copied ? "Copied!" : "Copy link"}
        </Button>
      </div>
    </div>
  );
};

export default QRCode;
