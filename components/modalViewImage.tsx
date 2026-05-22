import React from "react";
import type { FileEntry } from "../types";

interface ModalImageProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText?: string;
  filePath: string;
  currentFile: FileEntry | null;
}

const ModalImage: React.FC<ModalImageProps> = ({
  isOpen,
  onClose,
  imageUrl,
  altText = "Imagen",
  filePath,
  currentFile,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    // Helper to calculate relative path
    const getRelativePath = (fromPath: string, toPath: string): string => {
      if (!fromPath) return toPath;
      const fromSegments = fromPath.split("/");
      const toSegments = toPath.split("/");
      fromSegments.pop(); // remove filename

      let commonIndex = 0;
      while (
        commonIndex < fromSegments.length &&
        commonIndex < toSegments.length &&
        fromSegments[commonIndex] === toSegments[commonIndex]
      ) {
        commonIndex++;
      }

      const upLevels = fromSegments.length - commonIndex;
      const relSegments = [];
      for (let i = 0; i < upLevels; i++) {
        relSegments.push("..");
      }
      for (let i = commonIndex; i < toSegments.length; i++) {
        relSegments.push(toSegments[i]);
      }

      const relPath = relSegments.join("/");
      if (!relPath.startsWith("../")) {
        return "./" + relPath;
      }
      return relPath;
    };

    const relativePath = getRelativePath(currentFile?.path || "", filePath);
    const syntax = `![${altText}](${relativePath})`;

    navigator.clipboard.writeText(syntax).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl max-h-[90vh] bg-background rounded-lg shadow-lg overflow-hidden border border-border flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
      >
        <div className="flex justify-between items-center px-4 py-2 bg-gray-50 dark:bg-neutral-900 border-b border-border gap-4">
          <div className="flex gap-1.5 items-center min-w-0">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
            <span className="text-xs text-muted-foreground ml-2 font-medium truncate max-w-[200px]" title={altText}>
              {altText}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded transition-all border ${
                copied
                  ? "bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400"
                  : "bg-violet-500/10 text-violet-600 border-violet-500/20 hover:bg-violet-500/20 dark:text-violet-400"
              }`}
            >
              <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i>
              {copied ? "¡Copiado!" : "Copiar Markdown"}
            </button>
            <button
              className="text-muted-foreground hover:text-foreground text-xl font-bold leading-none pb-0.5"
              onClick={onClose}
            >
              &times;
            </button>
          </div>
        </div>
        <div className="overflow-auto p-4 flex items-center justify-center bg-neutral-100 dark:bg-neutral-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={altText}
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default ModalImage;
