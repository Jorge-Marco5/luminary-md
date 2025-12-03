import { useState, useRef, useEffect } from "react";

export const useMarkdownEditor = () => {
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
  const isScrolling = useRef(false);
  const [alert, setAlert] = useState<{
    message: string;
    type: string;
  } | null>(null);

  // Ensure global dark mode is off (cleanup stale state)
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  // Helper to scan and update everything
  const scanDirectory = async (handle: any) => {
    const handles = new Map<string, any>();
    handles.set("", handle);

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
    if (!rootHandle) {
      setAlert({ message: "Primero abre una carpeta", type: "error" });
      return;
    }

    const name = prompt("Nombre del archivo (ej: nota.md):");
    if (!name) return;

    // Get all available folder paths from directoryHandles, including root
    const availableFolders = Array.from(directoryHandles.keys()).sort();
    const folderChoices = availableFolders
      .map((path, index) => `${index}. ${path === "" ? "(root)" : path}`)
      .join("\n");

    const folderSelectionInput = prompt(
      `Selecciona una carpeta (número o ruta):\n${folderChoices}\n\n(Dejar vacío para usar la carpeta actual: ${
        selectedFolderPath || "(root)"
      })`
    );

    let targetHandle: any;
    if (folderSelectionInput === null || folderSelectionInput.trim() === "") {
      // User cancelled or left empty, use the currently selected folder
      targetHandle = selectedFolderPath
        ? directoryHandles.get(selectedFolderPath)
        : rootHandle;
    } else {
      // Try to find by index
      const index = parseInt(folderSelectionInput, 10);
      if (!isNaN(index) && index >= 0 && index < availableFolders.length) {
        const chosenPath = availableFolders[index];
        targetHandle = directoryHandles.get(chosenPath);
      } else {
        // Try to find by path string
        const chosenPath = folderSelectionInput.trim();
        targetHandle = directoryHandles.get(chosenPath);
      }

      if (!targetHandle) {
        setAlert({
          message: `Error: La carpeta '${folderSelectionInput}' no es válida o no existe.`,
          type: "error",
        });
        return;
      }
    }

    // Fallback if targetHandle somehow becomes null (shouldn't happen with logic above)
    if (!targetHandle) {
      setAlert({
        message: "Error: No se pudo determinar la carpeta destino.",
        type: "error",
      });
      return;
    }

    try {
      await targetHandle.getFileHandle(name, { create: true });
      await scanDirectory(rootHandle);
    } catch (err) {
      console.error(err);
      setAlert({ message: "Error al crear el archivo", type: "error" });
    }
  };

  const createNewFolder = async () => {
    if (!rootHandle) {
      setAlert({ message: "Primero abre una carpeta", type: "error" });
      return;
    }

    // seleccionamos manualmente la carpeta destino
    const targetHandle = selectedFolderPath
      ? directoryHandles.get(selectedFolderPath)
      : rootHandle;

    if (!targetHandle) {
      setAlert({
        message: "Error: No se encontró la carpeta destino",
        type: "error",
      });
      return;
    }

    // Request write permission for the target handle if not already granted.
    // This ensures user activation is present for the permission request.
    const permissionStatus = await targetHandle.queryPermission({
      mode: "readwrite",
    });
    if (permissionStatus === "denied") {
      setAlert({
        message: "Permiso de escritura denegado para la carpeta seleccionada.",
        type: "error",
      });
      return;
    }
    if (permissionStatus !== "granted") {
      const requestResult = await targetHandle.requestPermission({
        mode: "readwrite",
      });
      if (requestResult !== "granted") {
        setAlert({
          message:
            "Permiso de escritura no concedido para la carpeta seleccionada.",
          type: "error",
        });
        return;
      }
    }

    const name = prompt("Nombre del directorio:");
    if (!name) return;

    try {
      await targetHandle.getDirectoryHandle(name, { create: true });
      await scanDirectory(rootHandle);
      setAlert({
        message: `Directorio '${name}' creado exitosamente.`,
        type: "success",
      });
    } catch (err: any) {
      console.error(err);
      if (err.name === "NotAllowedError") {
        setAlert({
          message:
            "Error: Permiso de escritura denegado. Asegúrate de haber concedido los permisos necesarios.",
          type: "error",
        });
      } else {
        setAlert({ message: "Error al crear el directorio", type: "error" });
      }
    }
  };

  const handleOpenFolder = async () => {
    try {
      const dirHandle = await (window as any).showDirectoryPicker();
      setRootHandle(dirHandle);
      await scanDirectory(dirHandle);
      setAlert({ message: "Carpeta abierta exitosamente", type: "success" });
    } catch (err) {
      console.error("Error accessing folder:", err);
      setAlert({ message: "Error al acceder a la carpeta", type: "error" });
    }
  };

  const handleOpenFile = async () => {
    try {
      const [fileHandle] = await (window as any).showOpenFilePicker({
        types: [
          {
            description: "Markdown Files",
            accept: {
              "text/markdown": [".md"],
            },
          },
        ],
        multiple: false,
      });
      const file = await fileHandle.getFile();
      const text = await file.text();
      setContent(text);
      setCurrentFile({
        name: file.name,
        path: file.name,
        file: file,
        handle: fileHandle,
        kind: "file",
      });
      setAlert({ message: "Archivo abierto exitosamente", type: "success" });
    } catch (err) {
      console.error("Error opening file:", err);
      // Ignore abort error
      if ((err as any).name !== "AbortError") {
        setAlert({ message: "Error al abrir el archivo", type: "error" });
      }
    }
  };

  const loadFile = async (fileObj: any) => {
    try {
      let file = fileObj.file;
      if (fileObj.handle) {
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
      setAlert({
        message:
          "Error al cargar el archivo. Puede que necesites volver a abrir la carpeta.",
        type: "error",
      });
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
    try {
      if (currentFile?.handle) {
        const writable = await currentFile.handle.createWritable();
        await writable.write(content);
        await writable.close();
        setAlert({ message: "Archivo guardado exitosamente", type: "success" });
      } else {
        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = currentFile?.name || "untitled.md";
        a.click();
        URL.revokeObjectURL(url);
        setAlert({ message: "Archivo guardado exitosamente", type: "success" });
      }
    } catch (err) {
      console.error("Error saving file:", err);
      const blob = new Blob([content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentFile?.name || "untitled.md";
      a.click();
      URL.revokeObjectURL(url);
      setAlert({
        message:
          "Error al guardar el archivo. Se ha descargado como alternativa.",
        type: "error",
      });
    }
  };

  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (isScrolling.current) return;
    isScrolling.current = true;
    const preview = document.getElementById("preview");
    if (preview) {
      const percent =
        e.currentTarget.scrollTop /
        (e.currentTarget.scrollHeight - e.currentTarget.clientHeight);
      preview.scrollTop =
        percent * (preview.scrollHeight - preview.clientHeight);
    }
    setTimeout(() => {
      isScrolling.current = false;
    }, 50);
  };

  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isScrolling.current) return;
    isScrolling.current = true;
    const editor = document.getElementById("editor");
    if (editor) {
      const percent =
        e.currentTarget.scrollTop /
        (e.currentTarget.scrollHeight - e.currentTarget.clientHeight);
      editor.scrollTop = percent * (editor.scrollHeight - editor.clientHeight);
    }
    setTimeout(() => {
      isScrolling.current = false;
    }, 50);
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

  return {
    files,
    currentFile,
    content,
    sidebarOpen,
    darkMode,
    previewFontSize,
    expandedFolders,
    selectedFolderPath,
    alert,
    setAlert,
    setSidebarOpen,
    setDarkMode,
    setPreviewFontSize,
    setSelectedFolderPath,
    setContent,
    createNewFile,
    createNewFolder,
    handleOpenFolder,
    handleOpenFile,
    loadFile,
    insertMarkdown,
    saveFile,
    handleEditorScroll,
    handlePreviewScroll,
    organizeFiles,
    toggleFolder,
  };
};
