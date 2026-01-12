import React from "react";

interface ModalImageProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText?: string;
}

const ModalImage: React.FC<ModalImageProps> = ({
  isOpen,
  onClose,
  imageUrl,
  altText = "Imagen",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl max-h-[90vh] bg-background rounded-lg shadow-lg overflow-hidden border border-border"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
      >
        <div className="flex justify-between pr-2 pl-2 items-center">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
          </div>
          <button
            className="text-muted-foreground hover:text-foreground text-2xl font-bold"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <img
          src={imageUrl}
          alt={altText}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
};

export default ModalImage;
