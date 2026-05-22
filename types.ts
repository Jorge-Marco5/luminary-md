export interface FileEntry {
  name: string;
  path: string;
  file: File;
  handle: FileSystemFileHandle;
  kind: "file";
}

export interface AlertMessage {
  message: string;
  type: string; // "success" | "error" | "info" | "warning" o string genérico usado en la UI
}

export interface FileTreeData {
  _files?: FileEntry[];
  [folderName: string]: FileTreeData | FileEntry[] | undefined;
}

export interface ViewingImage {
  url: string;
  alt: string;
  path: string;
}
