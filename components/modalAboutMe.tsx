import React from "react";

interface ModalAboutMeProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalAboutMe: React.FC<ModalAboutMeProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
      onClick={onClose} // Close modal when clicking on the backdrop
    >
      <div
        className="relative max-h-screen w-full max-w-lg p-8 bg-neutral-900 rounded-xl shadow-2xl border border-gray-200 transform transition-all duration-300 ease-out scale-100 opacity-100 animate-modal-open"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-700 transition-colors duration-200"
          aria-label="Cerrar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
        <div className="flex justify-center space-x-4 items-center">
          <img src="hash.svg" alt="logo de Luminary" className="w-15 h-15" />
          <p className="text-neutral-50 text-center text-4xl font-bold">
            Luminary
          </p>
        </div>
        <div className="max-h-[calc(100vh-20rem)] overflow-y-auto">
          <p className="text-neutral-50 mb-4">
            Luminary es un editor de documentos Markdown en línea donde puedes
            crear y editar documentos markdown, Puedes editar documentos
            existentes desde tus carpetas locales, así como crear nuevos. Ofrece
            soporte para la visualización de imágenes dentro de tu proyecto.
          </p>
          <p className="text-neutral-50 mb-4">
            Todos los archivos son editables de forma local en tu navegador, lo
            que significa que no se recopila tu información personal ni de los
            archivos que editas.
          </p>
        </div>
        <h3 className="mb-4 text-xl font-bold text-neutral-50 text-center">
          Desarrollado por:
        </h3>
        <p className="text-neutral-50 text-center mb-4">Jorge Marcos</p>
        <div className="flex justify-center space-x-4">
          <a
            href="https://github.com/Jorge-Marco5"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-800 text-white font-semibold rounded-lg shadow-md hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-700 focus:ring-opacity-75 transition-all duration-200"
          >
            <svg className="w-6 h-6" viewBox="0 0 16 16" fill="currentColor">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
              />
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
};

export default ModalAboutMe;
