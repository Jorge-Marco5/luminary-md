import React, { useEffect, useState } from "react";
import {
  Hash,
  FolderOpen,
  FolderPlus,
  FilePlusCorner,
  FileText,
  FileUp,
  Info,
  Github,
} from "lucide-react";
import FileTree from "./FileTree";

interface SidebarProps {
  sidebarOpen: boolean;
  fileTree: { [key: string]: any };
  expandedFolders: Set<string>;
  selectedFolderPath: string;
  currentFile: any;
  onOpenFolder: () => void;
  onOpenFile: () => void;
  onCreateFolder: () => void;
  onCreateFile: () => void;
  onToggleFolder: (path: string) => void;
  onSelectFolder: (path: string) => void;
  onLoadFile: (file: any) => void;
  onOpenAbout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  fileTree,
  expandedFolders,
  selectedFolderPath,
  currentFile,
  onOpenFolder,
  onOpenFile,
  onCreateFolder,
  onCreateFile,
  onToggleFolder,
  onSelectFolder,
  onLoadFile,
  onOpenAbout,
}) => {
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Verificar si el navegador soporta File System Access API
    if (!("showDirectoryPicker" in window)) {
      setIsSupported(false);
    }
  }, []);

  return (
    <div
      className={`
        fixed inset-y-0 left-0 z-40 w-64
        bg-sidebar dark:bg-sidebar border-r border-sidebar-border dark:border-sidebar-border
        flex flex-col overflow-hidden
        ${sidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"}
        md:relative md:translate-x-0 md:shadow-none
        ${sidebarOpen ? "md:w-64" : "md:w-0"}
        print:hidden
      `}
      style={{ fontSize: "14px" }}
    >
      <div
        onClick={() => window.location.reload()}
        className="flex items-center gap-2 p-4 border-t border-b border-sidebar-border dark:border-sidebar-border bg-sidebar dark:bg-sidebar"
      >
        <Hash
          size={20}
          className="text-violet-600 dark:text-violet-600 hover:text-violet-500 dark:hover:text-violet-500"
        />
        <span className="text-sm font-medium text-sidebar-foreground dark:text-sidebar-foreground">
          Luminary
        </span>
      </div>
      {/* si no es compatible mostramos mensaje en ves de botones */}
      {!isSupported ? (
        <div className="flex flex-col items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-md w-full p-6 bg-red-50 dark:bg-red-950 rounded-lg shadow-md text-red-800 dark:text-red-100">
            <div className="flex items-center gap-3 mb-3 w-full">
              <Info size={60} className="text-red-600 dark:text-red-400" />
              <h3 className="font-bold text-lg text-red-600 dark:text-red-400">
                Navegador no compatible para edición
              </h3>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Para abrir y editar archivos locales, este editor requiere la{" "}
              <strong className="font-semibold">File System Access API</strong>,
              que solo está disponible en navegadores como Chrome, Edge y Opera.
            </p>
            <div className="w-full h-px bg-red-200 dark:bg-red-800 my-4"></div>
            <strong>
              <p className="text-sm leading-relaxed">
                De momento, puedes usar el editor en línea para crear archivos
                Markdown y descargarlos en tu dispositivo.
              </p>
            </strong>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 p-4 border-b border-sidebar-border dark:border-sidebar-border">
          <button
            onClick={onOpenFolder}
            className="flex items-center justify-center w-full px-4 py-2 text-violet-500 dark:text-gray-200 rounded-md hover:bg-sidebar-accent dark:hover:bg-sidebar-accent transition-colors font-medium text-sm"
            title="Abrir carpeta"
          >
            <FolderOpen size={20} />
          </button>
          <button
            onClick={onOpenFile}
            className="flex items-center justify-center w-full px-4 py-2 text-violet-500 dark:text-gray-200 rounded-md hover:bg-sidebar-accent dark:hover:bg-sidebar-accent transition-colors font-medium text-sm"
            title="Abrir archivo"
          >
            <FileUp size={20} />
          </button>
          <button
            onClick={onCreateFolder}
            className="flex items-center justify-center w-full px-4 py-2  text-violet-500 dark:text-gray-200 rounded-md hover:bg-sidebar-accent dark:hover:bg-sidebar-accent transition-colors font-medium text-sm"
            title="Nuevo directorio"
          >
            <FolderPlus size={20} />
          </button>
          <button
            onClick={onCreateFile}
            className="flex items-center justify-center w-full px-4 py-2 text-violet-500 dark:text-gray-200 rounded-md hover:bg-sidebar-accent dark:hover:bg-sidebar-accent transition-colors font-medium text-sm"
            title="Nuevo archivo"
          >
            <FilePlusCorner size={20} />
          </button>
        </div>
      )}

      <div className="flex-1 p-2 overflow-y-auto text-sidebar-foreground dark:text-sidebar-foreground">
        <FileTree
          tree={fileTree}
          expandedFolders={expandedFolders}
          selectedFolderPath={selectedFolderPath}
          currentFile={currentFile}
          onToggleFolder={onToggleFolder}
          onSelectFolder={onSelectFolder}
          onLoadFile={onLoadFile}
        />
      </div>
      <div className="p-2 border-t border-sidebar-border dark:border-sidebar-border">
        <button
          onClick={onOpenAbout}
          className="flex items-center justify-center w-full px-4 py-2 text-violet-500 dark:text-gray-200 rounded-md hover:bg-sidebar-accent dark:hover:bg-sidebar-accent transition-colors font-medium text-sm"
          title="Acerca del Desarrollador"
        >
          <Info size={20} />
          <span className="ml-2">Acerca de</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
