"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Image,
  Code,
  Table,
  Quote,
  Save,
  Sun,
  Moon,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  FolderPlus,
  FolderOpen,
  Hash,
  Edit3,
  FilePlusCorner,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "github-markdown-css/github-markdown.css";
import { Drawer } from "vaul";

const MarkdownEditor = () => {
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

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

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
      const blob = new Blob([content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentFile.name;
      a.click();
      URL.revokeObjectURL(url);
      alert("Error al guardar el archivo. Se ha descargado como alternativa.");
    }
  };

  const CodeBlock = ({ children, ...props }: any) => {
    const [copied, setCopied] = useState(false);
    const preRef = useRef<HTMLPreElement>(null);

    const handleCopy = () => {
      if (preRef.current) {
        const code = preRef.current.innerText;
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    return (
      <div className="relative group my-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 w-full max-w-full">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
          </div>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            title="Copiar código"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
        <div className="overflow-x-auto p-4">
          <pre
            ref={preRef}
            {...props}
            className="my-0 p-0 bg-transparent border-0 font-mono text-sm"
          >
            {children}
          </pre>
        </div>
      </div>
    );
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

    return (
      <>
        {folders.map((folder) => {
          const folderPath = path ? `${path}/${folder}` : folder;
          const isExpanded = expandedFolders.has(folderPath);
          return (
            <div key={folderPath}>
              <div
                className={`flex items-center gap-1 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                  selectedFolderPath === folderPath
                    ? "bg-violet-100 dark:bg-violet-900"
                    : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFolderPath(
                    folderPath === selectedFolderPath ? "" : folderPath
                  );
                  toggleFolder(folderPath);
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
                  {renderFileTree(tree[folder], folderPath)}
                </div>
              )}
            </div>
          );
        })}
        {files.map((file: any) => (
          <div
            key={file.path}
            className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-violet-700 cursor-pointer ${
              currentFile?.path === file.path
                ? "bg-violet-100 dark:bg-violet-900"
                : ""
            }`}
            onClick={() => loadFile(file)}
          >
            <FileText
              size={20}
              className="text-violet-500 dark:text-violet-200 hover:text-violet-600 dark:hover:text-violet-400 p-1 bg-violet-100 dark:bg-gray-900 rounded-md w-6 h-6 shrink-0"
            />
            <span className="text-sm truncate">{file.name}</span>
          </div>
        ))}
      </>
    );
  };

  const fileTree = organizeFiles(files);

  return (
    <div className="flex h-dvh w-screen overflow-hidden">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64
          bg-gray-50 dark:bg-neutral-950 border-r border-gray-200 dark:border-gray-700
          flex flex-col transition-transform duration-300 ease-in-out overflow-hidden
          ${sidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"}
          md:relative md:translate-x-0 md:shadow-none md:transition-all md:duration-300
          ${sidebarOpen ? "md:w-64" : "md:w-0"}
        `}
        style={{ fontSize: "14px" }}
      >
        <div className="flex items-center gap-2 p-4 border-t border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-neutral-950">
          <Hash size={20} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            MarkLantern
          </span>
        </div>
        <div className="flex gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={handleOpenFolder}
            className="flex items-center justify-center w-full px-4 py-2 bg-gray-100 text-violet-500 dark:bg-violet-900 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-violet-600 transition-colors font-medium text-sm"
            title="Abrir carpeta"
          >
            <FolderOpen size={20} />
          </button>
          <button
            onClick={createNewFolder}
            className="flex items-center justify-center w-full px-4 py-2 bg-gray-100 text-violet-500 dark:bg-violet-900 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-violet-600 transition-colors font-medium text-sm"
            title="Nuevo directorio"
          >
            <FolderPlus size={20} />
          </button>
          <button
            onClick={createNewFile}
            className="flex items-center justify-center w-full px-4 py-2 bg-gray-100 text-violet-500 dark:bg-violet-900 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-violet-600 transition-colors font-medium text-sm"
            title="Nuevo archivo"
          >
            <FilePlusCorner size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto text-gray-700 dark:text-gray-200">
          {renderFileTree(fileTree)}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-neutral-950 bg-white dark:bg-neutral-950">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:bg-gray-900 dark:hover:bg-gray-700 rounded"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setPreviewFontSize((prev) => Math.max(10, prev - 1))
              }
              className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded"
              title="Disminuir tamaño de fuente"
            >
              <ZoomOut size={20} />
            </button>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-8 text-center">
              {previewFontSize}
            </span>
            <button
              onClick={() =>
                setPreviewFontSize((prev) => Math.min(32, prev + 1))
              }
              className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded"
              title="Aumentar tamaño de fuente"
            >
              <ZoomIn size={20} />
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded"
              title={darkMode ? "Modo claro" : "Modo oscuro"}
            >
              {darkMode ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={saveFile}
              disabled={!currentFile}
              className="flex items-center gap-2 p-2 md:px-4 md:py-2 bg-violet-700 text-white rounded hover:bg-violet-800 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Guardar"
            >
              <Save size={18} />
              <span className="hidden md:inline">Guardar</span>
            </button>
          </div>
        </div>

        {/* Editor and Preview */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-w-0 w-full">
          {/* Mobile Edit Button (Floating) */}
          <div className="md:hidden absolute bottom-6 left-6 z-50">
            <Drawer.Root>
              <Drawer.Trigger asChild>
                <button className="bg-violet-600 text-white p-4 rounded-full shadow-lg hover:bg-violet-700 transition-colors">
                  <Edit3 size={24} />
                </button>
              </Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40" />
                <Drawer.Content className="bg-white dark:bg-gray-900 flex flex-col rounded-t-[10px] h-[96%] mt-24 fixed bottom-0 left-0 right-0 outline-none z-50">
                  <div className="p-4 bg-white dark:bg-gray-900 rounded-t-[10px] flex-1 flex flex-col">
                    <div className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-gray-300 dark:bg-gray-700 mb-8" />
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="flex items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto mb-2">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              insertMarkdown(e.target.value, "", "Encabezado");
                              e.target.value = "";
                            }
                          }}
                          className="bg-gray-50 dark:text-gray-200 dark:bg-gray-900 border-none focus:ring-0 focus:border-none"
                          title="Insertar encabezado"
                          defaultValue=""
                        >
                          <option
                            className="text-gray-600 dark:text-gray-200"
                            value=""
                            disabled
                          >
                            Encabezado
                          </option>
                          <option
                            className="text-gray-600 dark:text-gray-200"
                            value="# "
                          >
                            H1
                          </option>
                          <option
                            className="text-gray-600 dark:text-gray-200"
                            value="## "
                          >
                            H2
                          </option>
                          <option
                            className="text-gray-600 dark:text-gray-200"
                            value="### "
                          >
                            H3
                          </option>
                          <option
                            className="text-gray-600 dark:text-gray-200"
                            value="#### "
                          >
                            H4
                          </option>
                          <option
                            className="text-gray-600 dark:text-gray-200"
                            value="##### "
                          >
                            H5
                          </option>
                          <option
                            className="text-gray-600 dark:text-gray-200"
                            value="###### "
                          >
                            H6
                          </option>
                        </select>
                        <button
                          onClick={() => insertMarkdown("**", "**", "negrita")}
                          className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:text-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          <Bold size={20} />
                        </button>
                        <button
                          onClick={() => insertMarkdown("*", "*", "cursiva")}
                          className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:text-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          <Italic size={20} />
                        </button>
                        <button
                          onClick={() =>
                            insertMarkdown("- ", "", "Item de lista")
                          }
                          className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:text-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          <List size={20} />
                        </button>
                        <button
                          onClick={() => insertMarkdown("```", "```", "código")}
                          className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:text-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          <Code size={20} />
                        </button>
                      </div>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-md"
                        placeholder="Escribe tu markdown aquí..."
                      />
                    </div>
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          </div>

          {/* Desktop Editor */}
          <div className="hidden md:flex flex-1 flex-col border-r border-gray-200 dark:border-gray-700 min-w-0 overflow-hidden">
            <div className="p-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Hash size={20} className="text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {currentFile?.name || "Sin archivo seleccionado"}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <div className="flex items-center gap-1 p-2 min-w-max">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        insertMarkdown(e.target.value, "", "Encabezado");
                        e.target.value = "";
                      }
                    }}
                    className="bg-gray-50 dark:text-gray-200 dark:bg-gray-900 border-none focus:ring-0 focus:border-none"
                    title="Insertar encabezado"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Encabezado
                    </option>
                    <option
                      className="dark:text-gray-200"
                      title="Encabezado 1"
                      value="# "
                    >
                      H1
                    </option>
                    <option
                      className="dark:text-gray-200"
                      title="Encabezado 2"
                      value="## "
                    >
                      H2
                    </option>
                    <option
                      className="dark:text-gray-200"
                      title="Encabezado 3"
                      value="### "
                    >
                      H3
                    </option>
                    <option
                      className="dark:text-gray-200"
                      title="Encabezado 4"
                      value="#### "
                    >
                      H4
                    </option>
                    <option
                      className="dark:text-gray-200"
                      title="Encabezado 5"
                      value="##### "
                    >
                      H5
                    </option>
                    <option
                      className="dark:text-gray-200"
                      title="Encabezado 6"
                      value="###### "
                    >
                      H6
                    </option>
                  </select>
                  <div className="w-px h-6 dark:text-gray-200 bg-gray-300 dark:bg-gray-600 mx-1 shrink-0" />
                  <button
                    onClick={() => insertMarkdown("**", "**", "negrita")}
                    className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded shrink-0"
                    title="Negrita"
                  >
                    <Bold size={20} />
                  </button>
                  <button
                    onClick={() => insertMarkdown("*", "*", "cursiva")}
                    className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded shrink-0 cursor-pointer"
                    title="Cursiva"
                  >
                    <Italic size={20} />
                  </button>
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 shrink-0" />
                  <button
                    onClick={() => insertMarkdown("- ", "", "Item de lista")}
                    className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded shrink-0"
                    title="Lista"
                  >
                    <List size={20} />
                  </button>
                  <button
                    onClick={() => insertMarkdown("1. ", "", "Item numerado")}
                    className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded shrink-0"
                    title="Lista numerada"
                  >
                    <ListOrdered size={20} />
                  </button>
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 shrink-0" />
                  <button
                    onClick={() =>
                      insertMarkdown("[", "](url)", "texto del enlace")
                    }
                    className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded shrink-0"
                    title="Enlace"
                  >
                    <Link2 size={20} />
                  </button>
                  <button
                    onClick={() => insertMarkdown("![", "](url)", "alt text")}
                    className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded shrink-0"
                    title="Imagen"
                  >
                    <Image size={20} />
                  </button>
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 shrink-0" />
                  <button
                    onClick={() => insertMarkdown("```", "```", "código")}
                    className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded shrink-0"
                    title="Código"
                  >
                    <Code size={20} />
                  </button>
                  <button
                    onClick={() => insertMarkdown("> ", "", "cita")}
                    className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded shrink-0"
                    title="Cita"
                  >
                    <Quote size={20} />
                  </button>
                  <button
                    onClick={() =>
                      insertMarkdown(
                        "| Col1 | Col2 |\n|------|------|\n| ",
                        " | |",
                        "dato"
                      )
                    }
                    className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded shrink-0"
                    title="Tabla"
                  >
                    <Table size={20} />
                  </button>
                </div>
              </div>
            </div>
            <textarea
              id="editor"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-auto"
              placeholder="Selecciona un archivo o carga una carpeta..."
              style={{
                fontSize: `${previewFontSize}px`,
                backgroundColor: "transparent",
              }}
            />
          </div>

          {/* Preview */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="p-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Vista previa
              </span>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-white dark:bg-gray-950">
              <div
                className="markdown-body max-w-full cursor-pointer"
                style={{
                  fontSize: `${previewFontSize}px`,
                  backgroundColor: "transparent",
                }}
                onClick={(e) => {
                  if (e.target instanceof HTMLElement) {
                    e.target.click();
                  }
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        onClick={(e) => {
                          if (props.href?.endsWith(".md")) {
                            e.preventDefault();
                            const linkedFile = files.find(
                              (f) =>
                                f.name === props.href ||
                                f.path.endsWith(props.href)
                            );
                            if (linkedFile) {
                              loadFile(linkedFile);
                            }
                          }
                        }}
                        target={
                          props.href?.startsWith("http") ? "_blank" : undefined
                        }
                        rel={
                          props.href?.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                      >
                        {props.children}
                      </a>
                    ),
                    pre: CodeBlock,
                  }}
                >
                  {content || "*Aquí aparecerá la vista previa del markdown*"}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;
