import React from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

interface FileTreeProps {
  tree: { [key: string]: any };
  path?: string;
  expandedFolders: Set<string>;
  selectedFolderPath: string;
  currentFile: any;
  onToggleFolder: (path: string) => void;
  onSelectFolder: (path: string) => void;
  onLoadFile: (file: any) => void;
}

const FileTree: React.FC<FileTreeProps> = ({
  tree,
  path = "",
  expandedFolders,
  selectedFolderPath,
  currentFile,
  onToggleFolder,
  onSelectFolder,
  onLoadFile,
}) => {
  const folders = Object.keys(tree).filter((key) => key !== "_files");
  const files = tree._files || [];

  return (
    <>
      {folders.map((folder) => {
        const folderPath = path ? `${path}/${folder}` : folder;
        const isExpanded = expandedFolders.has(folderPath);
        return (
          <div key={folderPath}>
            <div
              className={`flex rounded-md items-center gap-1 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                selectedFolderPath === folderPath
                  ? "bg-violet-100 dark:bg-neutral-700"
                  : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectFolder(
                  folderPath === selectedFolderPath ? "" : folderPath
                );
                onToggleFolder(folderPath);
              }}
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              <span className="text-sm">{folder}</span>
            </div>
            {isExpanded && (
              <div className="ml-4">
                <FileTree
                  tree={tree[folder]}
                  path={folderPath}
                  expandedFolders={expandedFolders}
                  selectedFolderPath={selectedFolderPath}
                  currentFile={currentFile}
                  onToggleFolder={onToggleFolder}
                  onSelectFolder={onSelectFolder}
                  onLoadFile={onLoadFile}
                />
              </div>
            )}
          </div>
        );
      })}
      {files.map((file: any) => (
        <div
          // si es una imagen mostrar icono de imagen, si es un archivo markdown mostrar icono de markdown
          key={file.path}
          className={`flex rounded-md items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer ${
            currentFile?.path === file.path
              ? "bg-violet-100 dark:bg-neutral-700 text-violet-500 dark:text-violet-200 font-bold"
              : ""
          }`}
          onClick={() => onLoadFile(file)}
        >
          <i
            className={
              file.path.endsWith(".md")
                ? "fa-brands fa-markdown text-violet-500 dark:text-violet-600 hover:text-violet-600 dark:hover:text-violet-400 p-1 w-6 h-6 shrink-0"
                : "fa-solid fa-image text-violet-500 dark:text-violet-600 hover:text-violet-600 dark:hover:text-violet-400 p-1 w-6 h-6 shrink-0"
            }
          ></i>
          <span className="text-[0.9rem] truncate">{file.name}</span>
        </div>
      ))}
    </>
  );
};

export default FileTree;
