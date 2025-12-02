import { useState } from "react";

export const useLogic = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [currentFile, setCurrentFile] = useState<any | null>(null);
  const [content, setContent] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [previewFontSize, setPreviewFontSize] = useState(16);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [directoryHandles, setDirectoryHandles] = useState<Map<string, any>>(
    new Map()
  );
  const [selectedFolderPath, setSelectedFolderPath] = useState<string>("");
  const [rootHandle, setRootHandle] = useState<any>(null);
  // Removed activeMobileTab state

  const processDirectory = async (
    dirHandle: any,
    path = ""
  ): Promise<any[]> => {
    const files: any[] = [];
    const newHandles = new Map(directoryHandles);

    for await (const entry of dirHandle.values()) {
      const entryPath = path ? `${path}/${entry.name}` : entry.name;
      if (entry.kind === "file") {
        if (entry.name.endsWith(".md")) {
          const file = await entry.getFile();
          files.push({
            name: entry.name,
            path: entryPath,
            file: file,
            handle: entry,
            kind: "file",
          });
        }
      } else if (entry.kind === "directory") {
        newHandles.set(entryPath, entry);
        // We don't update state here to avoid infinite loops, we'll collect them
        // This logic needs to be slightly different to accumulate handles correctly
        // For now, let's just push the directory to files list for rendering
        // and we will handle the map update in the main function
        const subFiles = await processDirectory(entry, entryPath);
        files.push({
          name: entry.name,
          path: entryPath,
          kind: "directory",
          handle: entry,
          _files: subFiles, // This structure might need to match organizeFiles expectations or we change organizeFiles
        });
        // Flattening for the current simple list approach, but organizeFiles rebuilds the tree.
        // Actually, processDirectory returns a flat list of files currently.
        // Let's keep returning flat list of files but also store directory handles.
        files.push(...subFiles);
      }
    }
    return files;
  };

  // Helper to scan and update everything
  const scanDirectory = async (handle: any) => {
    const handles = new Map<string, any>();
    handles.set("", handle); // Root

    const scan = async (dirHandle: any, path = ""): Promise<any[]> => {
      const fileList: any[] = [];
      for await (const entry of dirHandle.values()) {
        const entryPath = path ? `${path}/${entry.name}` : entry.name;
        if (entry.kind === "file") {
          if (entry.name.endsWith(".md")) {
            const file = await entry.getFile();
            fileList.push({
              name: entry.name,
              path: entryPath,
              file: file,
              handle: entry,
              kind: "file",
            });
          }
        } else if (entry.kind === "directory") {
          handles.set(entryPath, entry);
          const subFiles = await scan(entry, entryPath);
          fileList.push(...subFiles);
        }
      }
      return fileList;
    };

    const files = await scan(handle);
    setDirectoryHandles(handles);
    setFiles(files);
  };

  const createNewFile = async () => {
    if (!rootHandle) return alert("Primero abre una carpeta");

    const name = prompt("Nombre del archivo (ej: nota.md):");
    if (!name) return;

    const targetHandle = selectedFolderPath
      ? directoryHandles.get(selectedFolderPath)
      : rootHandle;

    if (!targetHandle) return alert("Error: No se encontró la carpeta destino");

    try {
      await targetHandle.getFileHandle(name, { create: true });
      await scanDirectory(rootHandle);
    } catch (err) {
      console.error(err);
      alert("Error al crear el archivo");
    }
  };

  const createNewFolder = async () => {
    if (!rootHandle) return alert("Primero abre una carpeta");

    const name = prompt("Nombre del directorio:");
    if (!name) return;

    const targetHandle = selectedFolderPath
      ? directoryHandles.get(selectedFolderPath)
      : rootHandle;

    if (!targetHandle) return alert("Error: No se encontró la carpeta destino");

    try {
      await targetHandle.getDirectoryHandle(name, { create: true });
      await scanDirectory(rootHandle);
    } catch (err) {
      console.error(err);
      alert("Error al crear el directorio");
    }
  };

  const handleOpenFolder = async () => {
    try {
      const dirHandle = await (window as any).showDirectoryPicker();
      setRootHandle(dirHandle);
      await scanDirectory(dirHandle);
    } catch (err) {
      console.error("Error accessing folder:", err);
    }
  };

  const loadFile = async (fileObj: any) => {
    try {
      let file = fileObj.file;
      if (fileObj.handle) {
        // Get fresh file from handle to avoid permission errors after save
        file = await fileObj.handle.getFile();
      }
      const text = await file.text();
      setContent(text);
      setCurrentFile({ ...fileObj, file });
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    } catch (err) {
      console.error("Error loading file:", err);
      alert(
        "Error al cargar el archivo. Puede que necesites volver a abrir la carpeta."
      );
    }
  };

  const insertMarkdown = (before: string, after = "", placeholder = "") => {
    const textarea = document.getElementById("editor") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;
    const newText =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);
    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const saveFile = async () => {
    if (!currentFile) return;

    try {
      if (currentFile.handle) {
        const writable = await currentFile.handle.createWritable();
        await writable.write(content);
        await writable.close();
      } else {
        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = currentFile.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Error saving file:", err);
      alert("Error al guardar el archivo");
    }
  };

  const organizeFiles = (files: any[]) => {
    const tree: { [key: string]: any } = {};
    files.forEach((file) => {
      const parts = file.path.split("/");
      let current = tree;
      parts.forEach((part: string, idx: number) => {
        if (idx === parts.length - 1) {
          if (!current._files) current._files = [];
          current._files.push(file);
        } else {
          if (!current[part]) current[part] = {};
          current = current[part];
        }
      });
    });
    return tree;
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (tree: { [key: string]: any }, path = "") => {
    const folders = Object.keys(tree).filter((key) => key !== "_files");
    const files = tree._files || [];
  };
};
