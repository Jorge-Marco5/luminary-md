import { useState, useRef, useEffect } from "react";
import type { OnMount } from "@monaco-editor/react";
import type { FileEntry, AlertMessage, ViewingImage, FileTreeData } from "../types";

type MonacoEditorInstance = Parameters<OnMount>[0];

export const useMarkdownEditor = () => {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [currentFile, setCurrentFile] = useState<FileEntry | null>(null);
  const [content, setContent] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [previewFontSize, setPreviewFontSize] = useState(16);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [directoryHandles, setDirectoryHandles] = useState<Map<string, FileSystemDirectoryHandle>>(
    new Map()
  );
  const [selectedFolderPath, setSelectedFolderPath] = useState<string>("");
  const [rootHandle, setRootHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const isScrolling = useRef(false);
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const firstRender = useRef(true);

  // Efecto para sincronizar el tema con DOM y localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Evitar sobrescribir localStorage en la primera carga (cuando el estado es false por defecto)
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Efecto inicial para cargar preferencia
  useEffect(() => {
    // Recuperar pero NO escribir (ya lo maneja el otro efecto, pero protegido por firstRender)
    const savedTheme = localStorage.getItem("theme");
    setTimeout(() => {
      if (savedTheme) {
        setDarkMode(savedTheme === "dark");
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setDarkMode(true);
      }
    }, 0);
  }, []);

  // Helper to scan and update everything
  //escanear archivos .md e imagenes en el directorio
  const scanDirectory = async (handle: FileSystemDirectoryHandle) => {
    const handles = new Map<string, FileSystemDirectoryHandle>();
    handles.set("", handle);

    const scan = async (dirHandle: FileSystemDirectoryHandle, path = ""): Promise<FileEntry[]> => {
      const fileList: FileEntry[] = [];
      for await (const entry of dirHandle.values()) {
        const entryPath = path ? `${path}/${entry.name}` : entry.name;
        if (entry.kind === "file") {
          if (
            entry.name.endsWith(".md") ||
            entry.name.endsWith(".png") ||
            entry.name.endsWith(".jpg") ||
            entry.name.endsWith(".jpeg")
          ) {
            const file = await entry.getFile();
            fileList.push({
              name: entry.name,
              path: entryPath,
              file: file,
              handle: entry as FileSystemFileHandle,
              kind: "file",
            });
          }
        } else if (entry.kind === "directory") {
          handles.set(entryPath, entry as FileSystemDirectoryHandle);
          const subFiles = await scan(entry as FileSystemDirectoryHandle, entryPath);
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

    let targetHandle: FileSystemDirectoryHandle | undefined;
    if (folderSelectionInput === null || folderSelectionInput.trim() === "") {
      // User cancelled or left empty, use the currently selected folder
      targetHandle = selectedFolderPath
        ? directoryHandles.get(selectedFolderPath)
        : rootHandle || undefined;
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
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error && err.name === "NotAllowedError") {
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
      const dirHandle = await window.showDirectoryPicker();
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
      const [fileHandle] = await window.showOpenFilePicker({
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
      if (err instanceof Error && err.name !== "AbortError") {
        setAlert({ message: "Error al abrir el archivo", type: "error" });
      }
    }
  };

  const [viewingImage, setViewingImage] = useState<ViewingImage | null>(null);

  const loadFile = async (fileObj: FileEntry) => {
    try {
      let file = fileObj.file;
      if (fileObj.handle) {
        file = await fileObj.handle.getFile();
      }

      // Check for image extensions
      if (/\.(png|jpe?g|gif|webp)$/i.test(file.name)) {
        const url = URL.createObjectURL(file);
        setViewingImage({ url, alt: file.name, path: fileObj.path });
        return;
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
    const selection = window.getSelection();
    if (selection) {
      selection.collapseToEnd();
    }

    if (monacoInstance) {
      const selection = monacoInstance.getSelection();
      const model = monacoInstance.getModel();
      if (model && selection) {
        const text = model.getValueInRange(selection);

        const textToInsert = text || placeholder;
        const newText = before + textToInsert + after;

        monacoInstance.executeEdits("toolbar", [
          {
            range: selection,
            text: newText,
            forceMoveMarkers: true,
          },
        ]);

        // Restore focus and selection
        monacoInstance.focus();
        return;
      }
    }

    // Fallback for native textarea (if any)
    let textarea = document.getElementById("editor") as HTMLTextAreaElement;
    if (!textarea || textarea.offsetParent === null) {
      const mobileTextarea = document.getElementById(
        "editor-mobile"
      ) as HTMLTextAreaElement;
      if (mobileTextarea) {
        textarea = mobileTextarea;
      }
    }

    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const scrollTop = textarea.scrollTop; // Guardar posición del scroll
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
      textarea.scrollTop = scrollTop; // Restaurar posición del scroll
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

  const [monacoInstance, setMonacoInstance] = useState<MonacoEditorInstance | null>(null);

  const handleEditorScroll = (arg: React.UIEvent<HTMLElement> | number) => {
    if (isScrolling.current) return;
    isScrolling.current = true;
    const preview = document.getElementById("preview");
    if (preview) {
      let percent = 0;
      if (typeof arg === "number") {
        // Monaco scroll
        if (monacoInstance) {
          const scrollHeight = monacoInstance.getScrollHeight();
          const clientHeight = monacoInstance.getLayoutInfo().height;
          percent = arg / (scrollHeight - clientHeight);
        }
      } else {
        // Native scroll
        percent =
          arg.currentTarget.scrollTop /
          (arg.currentTarget.scrollHeight - arg.currentTarget.clientHeight);
      }

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

    const percent =
      e.currentTarget.scrollTop /
      (e.currentTarget.scrollHeight - e.currentTarget.clientHeight);

    // Sync Monaco
    if (monacoInstance) {
      const scrollHeight = monacoInstance.getScrollHeight();
      const clientHeight = monacoInstance.getLayoutInfo().height;
      monacoInstance.setScrollTop(percent * (scrollHeight - clientHeight));
    }

    setTimeout(() => {
      isScrolling.current = false;
    }, 50);
  };

  const organizeFiles = (files: FileEntry[]) => {
    const tree: FileTreeData = {};
    files.forEach((file) => {
      const parts = file.path.split("/");
      let current = tree;
      parts.forEach((part: string, idx: number) => {
        if (idx === parts.length - 1) {
          if (!current._files) current._files = [];
          current._files!.push(file);
        } else {
          if (!current[part]) current[part] = {};
          current = current[part] as FileTreeData;
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
    setMonacoInstance,
    viewingImage,
    setViewingImage,
  };
};
