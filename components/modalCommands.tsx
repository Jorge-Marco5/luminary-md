import React from "react";
import KBD from "./KBD";

interface ModalInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalCommands: React.FC<ModalInfoProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-background p-6 rounded-lg shadow-xl max-w-md w-full border border-border">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
          <h2 className="text-2xl font-semibold text-foreground">
            Comandos de la Aplicación
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-3xl leading-none"
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>
        <div className="space-y-4 mb-6">
          {/* comandos similares a vscode */}
          <div className="flex items-center">
            <KBD keys={["?", "'?'"]} />
            <span className="ml-4 text-muted-foreground text-base">
              Abrir los comandos de la aplicación.
            </span>
          </div>
          <div className="flex items-center">
            <KBD keys={["?", "O"]} />
            <span className="ml-4 text-muted-foreground text-base">
              Abrir un archivo.
            </span>
          </div>
          <div className="flex items-center">
            <KBD keys={["?", "Shift", "O"]} />
            <span className="ml-4 text-muted-foreground text-base">
              Abrir una carpeta.
            </span>
          </div>
          <div className="flex items-center">
            <KBD keys={["?", "S"]} />
            <span className="ml-4 text-muted-foreground text-base">
              Guardar el archivo actual.
            </span>
          </div>
          <div className="flex items-center">
            <KBD keys={["?", "N"]} />
            <span className="ml-4 text-muted-foreground text-base">
              Crear un nuevo archivo.
            </span>
          </div>
          <div className="flex items-center">
            <KBD keys={["?", "Shift", "N"]} />
            <span className="ml-4 text-muted-foreground text-base">
              Crear una nueva carpeta.
            </span>
          </div>
        </div>
        <div className="text-right pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-opacity-50 transition-colors duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCommands;
