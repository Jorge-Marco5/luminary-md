import React from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import type { FileEntry, FileTreeData } from "../types";

interface FileRowProps {
  file: FileEntry;
  currentFile: FileEntry | null;
  onLoadFile: (file: FileEntry) => void;
}

const FileRow: React.FC<FileRowProps> = ({ file, currentFile, onLoadFile }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();

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

    const isMarkdown = file.path.endsWith(".md");
    const relativePath = getRelativePath(currentFile?.path || "", file.path);
    const syntax = isMarkdown
      ? `[${file.name.replace(/\.md$/i, "")}](${relativePath})`
      : `![${file.name}](${relativePath})`;

    navigator.clipboard.writeText(syntax).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const isSelected = currentFile?.path === file.path;
  const isImage = !file.path.endsWith(".md");

  return (
    <div
      className={`group relative flex rounded-md items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer ${
        isSelected
          ? "bg-violet-100 dark:bg-neutral-700 text-violet-500 dark:text-violet-200 font-bold"
          : ""
      }`}
      title={file.name}
      onClick={() => onLoadFile(file)}
    >
      <div className="flex items-center gap-2 min-w-0 pr-6">
        <i
          className={
            !isImage
              ? "fa-brands fa-markdown text-violet-500 dark:text-violet-600 hover:text-violet-600 dark:hover:text-violet-400 p-1 w-6 h-6 shrink-0"
              : "fa-solid fa-image text-violet-500 dark:text-violet-600 hover:text-violet-600 dark:hover:text-violet-400 p-1 w-6 h-6 shrink-0"
          }
        ></i>
        <span className="text-[0.9rem] truncate">{file.name}</span>
      </div>
      <button
        onClick={handleCopy}
        className={`absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded text-muted-foreground hover:text-foreground shrink-0 transition-all ${
          copied ? "opacity-100 text-green-500 dark:text-green-400" : ""
        }`}
        title={isImage ? "Copiar sintaxis de Imagen" : "Copiar enlace Markdown"}
      >
        <i className={copied ? "fa-solid fa-check text-xs" : "fa-solid fa-copy text-xs"}></i>
      </button>
    </div>
  );
};

interface FileTreeProps {
  tree: FileTreeData;
  path?: string;
  expandedFolders: Set<string>;
  selectedFolderPath: string;
  currentFile: FileEntry | null;
  onToggleFolder: (path: string) => void;
  onSelectFolder: (path: string) => void;
  onLoadFile: (file: FileEntry) => void;
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
                  tree={tree[folder] as FileTreeData}
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
      {files.map((file: FileEntry) => (
        <FileRow
          key={file.path}
          file={file}
          currentFile={currentFile}
          onLoadFile={onLoadFile}
        />
      ))}
    </>
  );
};

export default FileTree;
