"use client";
import React, { useEffect, useState } from "react";
import {
  Menu,
  X,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
  Edit3,
  Hash,
  SquareArrowOutUpRight,
  FileText,
  HelpCircle,
} from "lucide-react";
import "github-markdown-css/github-markdown.css";
import { Drawer } from "vaul";
import Alert from "../components/alert";
import { useMarkdownEditor } from "../hooks/useMarkdownEditor";
import Sidebar from "../components/Sidebar";
import EditorToolbar from "../components/EditorToolbar";
import MarkdownPreview from "../components/MarkdownPreview";
import { alertReloadPage } from "../hooks/alertReloadPage";
import dynamic from "next/dynamic";
import ModalViewImage from "../components/modalViewImage";
import ModalCommands from "../components/modalCommands";
import ModalAboutMe from "../components/modalAboutMe";
import { exportData } from "@/hooks/exportData";

const MonacoEditor = dynamic(() => import("../components/MonacoEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted dark:bg-muted animate-pulse" />
  ),
});

const MarkdownEditor = () => {
  const {
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
    setSelectedFolderPath,
    setMonacoInstance,
    viewingImage,
    setViewingImage,
  } = useMarkdownEditor();

  const fileTree = organizeFiles(files);

  alertReloadPage();

  // ctr + s para guardar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "s" && event.ctrlKey) {
        event.preventDefault();
        saveFile();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [saveFile]);

  const [modalCommandsOpen, setModalCommandsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const isMobileViewport = mediaQuery.matches;

    const timer = setTimeout(() => {
      setMounted(true);
      setIsMobile(isMobileViewport);
    }, 0);

    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => {
      clearTimeout(timer);
      mediaQuery.removeEventListener("change", handler);
    };
  }, []);

  // ctr + ? para abrir el modal de comandos
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "?" && event.ctrlKey) {
        event.preventDefault();
        setModalCommandsOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalCommandsOpen]);

  // ctr + o para abrir un archivo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "o" && event.ctrlKey && !event.shiftKey) {
        event.preventDefault();
        handleOpenFile();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleOpenFile]);

  // ctr + shift + o para abrir una carpeta
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "O" && event.ctrlKey && event.shiftKey) {
        event.preventDefault();
        handleOpenFolder();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleOpenFolder]);

  // ctr + n para crear un nuevo archivo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "n" && event.ctrlKey && !event.shiftKey) {
        event.preventDefault();
        createNewFile();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [createNewFile]);

  // ctr + shift + n para crear una nueva carpeta
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "N" && event.ctrlKey && event.shiftKey) {
        event.preventDefault();
        createNewFolder();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [createNewFolder]);

  // esc para cerrar el modal de vista previa de imagen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setViewingImage(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setViewingImage]);



  const [modalAboutMeOpen, setModalAboutMeOpen] = useState(false);

  const onOpenAbout = () => {
    setModalAboutMeOpen(true);
  };
  return (
    <div className="flex h-dvh w-screen overflow-hidden">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <ModalViewImage
        isOpen={!!viewingImage}
        onClose={() => setViewingImage(null)}
        imageUrl={viewingImage?.url || ""}
        altText={viewingImage?.alt}
        filePath={viewingImage?.path || ""}
        currentFile={currentFile}
      />

      <ModalAboutMe
        isOpen={modalAboutMeOpen}
        onClose={() => setModalAboutMeOpen(false)}
      />

      <ModalCommands
        isOpen={modalCommandsOpen}
        onClose={() => setModalCommandsOpen(false)}
      />

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        fileTree={fileTree}
        expandedFolders={expandedFolders}
        selectedFolderPath={selectedFolderPath}
        currentFile={currentFile}
        onOpenFolder={handleOpenFolder}
        onOpenFile={handleOpenFile}
        onCreateFolder={createNewFolder}
        onCreateFile={createNewFile}
        onToggleFolder={toggleFolder}
        onSelectFolder={setSelectedFolderPath}
        onLoadFile={loadFile}
        onOpenAbout={() => setModalAboutMeOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-background dark:bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-border dark:border-border print:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-accent dark:text-foreground dark:bg-muted dark:hover:bg-accent rounded"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <nav className="pl-2 flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1">
            {/* File Actions Group */}
            <div className="relative shrink-0">
              <select
                value={""}
                onChange={(e) => {
                  if (e.target.value === "save") {
                    saveFile();
                  } else if (e.target.value === "open-file") {
                    handleOpenFile();
                  } else if (e.target.value === "open-folder") {
                    handleOpenFolder();
                  } else if (e.target.value === "new-file") {
                    createNewFile();
                  } else if (e.target.value === "new-folder") {
                    createNewFolder();
                  }
                  e.target.value = "";
                }}
                name="file-actions"
                id="file-actions-select"
                className="max-w-[150px] appearance-none p-2 bg-muted dark:bg-muted hover:bg-accent dark:hover:bg-accent dark:text-foreground rounded pr-6 cursor-pointer text-sm border border-border dark:border-border"
              >
                <option className="text-[13px]" value="" disabled hidden>
                  Archivo
                </option>
                <option className="text-[13px]" value="save">
                  Guardar (Ctrl+S)
                </option>
                <option className="text-[13px]" value="open-file">
                  Abrir archivo (Ctrl+O)
                </option>
                <option className="text-[13px]" value="open-folder">
                  Abrir carpeta (Ctrl+Shift+O)
                </option>
                <option className="text-[13px]" value="new-file">
                  Nuevo archivo (Ctrl+N)
                </option>
                <option className="text-[13px]" value="new-folder">
                  Nueva carpeta (Ctrl+Shift+N)
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground dark:text-muted-foreground">
                <FileText size={20} />
              </div>
            </div>

            {/* Export Dropdown */}
            <div className="relative shrink-0 ">
              <select
                onChange={(e) => {
                  exportData(content, e.target.value, setAlert);
                  e.target.value = "";
                }}
                name="export"
                id="export-select"
                className="max-w-[150px] appearance-none p-2 bg-muted dark:bg-muted hover:bg-accent dark:hover:bg-accent dark:text-foreground rounded pr-6 cursor-pointer text-sm border border-border dark:border-border"
              >
                <option className=" text-[13px]" value="" hidden>
                  Exportar
                </option>
                <option className="text-[13px]" value="markdown">
                  Markdown
                </option>
                <option className="text-[13px]" value="html">
                  HTML
                </option>
                <option className="text-[13px]" value="pdf">
                  PDF
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground dark:text-muted-foreground">
                <SquareArrowOutUpRight size={20} />
              </div>
            </div>

            <div className="w-px h-6 bg-border dark:bg-border mx-1 shrink-0" />

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-accent dark:text-foreground dark:hover:bg-accent rounded shrink-0"
              title={darkMode ? "Modo claro" : "Modo oscuro"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Font Size Controls Group (kept as buttons for quick access) */}
            <div className="flex items-center rounded border border-border dark:border-border shrink-0">
              <button
                onClick={() =>
                  setPreviewFontSize((prev) => Math.max(10, prev - 1))
                }
                className="p-2 hover:bg-accent dark:text-foreground dark:hover:bg-accent rounded-l"
                title="Disminuir tamaño de fuente"
              >
                <ZoomOut size={20} />
              </button>
              <span className="text-[12px] font-medium text-muted-foreground dark:text-muted-foreground w-8 text-center px-1">
                {previewFontSize}
              </span>
              <button
                onClick={() =>
                  setPreviewFontSize((prev) => Math.min(32, prev + 1))
                }
                className="p-2 hover:bg-accent dark:text-foreground dark:hover:bg-accent rounded-r"
                title="Aumentar tamaño de fuente"
              >
                <ZoomIn size={20} />
              </button>
            </div>

            <div className="w-px h-6 bg-border dark:bg-border mx-1 shrink-0" />

            {/* Help/About Group */}
            <div className="relative shrink-0">
              <select
                value={""}
                onChange={(e) => {
                  if (e.target.value === "commands") {
                    setModalCommandsOpen(true);
                  } else if (e.target.value === "about") {
                    onOpenAbout();
                  }
                  e.target.value = "";
                }}
                name="help-about"
                id="help-about-select"
                className="appearance-none p-2 bg-muted dark:bg-muted hover:bg-accent dark:hover:bg-accent dark:text-foreground rounded pr-6 cursor-pointer text-sm border border-border dark:border-border"
              >
                <option className="text-[13px]" value="" disabled hidden>
                  Ayuda
                </option>
                <option className="text-[13px]" value="commands">
                  Comandos (Ctrl+?)
                </option>
                <option className="text-[13px]" value="about">
                  Acerca de
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground dark:text-muted-foreground">
                <HelpCircle size={20} />
              </div>
            </div>
          </nav>
        </div>

        {/* Editor and Preview */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-w-0 w-full">
          {/* Mobile Edit Button (Floating) */}
          <div className="md:hidden absolute bottom-6 right-6 z-10 print:hidden">
            <Drawer.Root>
              <Drawer.Trigger asChild>
                <button className="bg-violet-600 text-white p-4 rounded-full shadow-lg hover:bg-violet-700 ">
                  <Edit3 size={24} />
                </button>
              </Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black" />
                <Drawer.Content className="bg-background dark:bg-background flex flex-col rounded-t-[10px] h-[96%] mt-24 fixed bottom-0 left-0 right-0 outline-none z-50">
                  <Drawer.Title className="hidden">Editar</Drawer.Title>
                  <div className="p-4 bg-background dark:bg-background rounded-t-[10px] flex-1 flex flex-col">
                    <div className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-border dark:bg-border mb-8" />
                    <div
                      className="flex-1 flex flex-col min-h-0"
                      data-vaul-no-drag
                    >
                      <div className="flex items-center gap-2 p-2 border-b border-border dark:border-border overflow-x-auto mb-2">
                        <EditorToolbar onInsertMarkdown={insertMarkdown} />
                      </div>
                      {mounted && isMobile && (
                        <div className="flex-1 min-h-0 bg-background dark:bg-background mt-4">
                          <MonacoEditor
                            value={content}
                            onChange={setContent}
                            theme={darkMode ? "dark" : "light"}
                            onScroll={handleEditorScroll}
                            onMount={(editor) => {
                              setMonacoInstance(editor);
                              // Optimize mobile keyboard settings to prevent cursor jumps
                              const textarea = editor.getDomNode()?.querySelector("textarea");
                              if (textarea) {
                                textarea.setAttribute("autocorrect", "off");
                                textarea.setAttribute("autocapitalize", "off");
                                textarea.setAttribute("autocomplete", "off");
                                textarea.setAttribute("spellcheck", "false");
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          </div>

          <div className="hidden md:flex flex-1 flex-col border-r border-border dark:border-border min-w-0 overflow-hidden print:hidden">
            <div className="bg-muted dark:bg-muted border-b border-border dark:border-border">
              <div className="flex items-center p-2 bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700">
                <Hash size={20} className="text-gray-700 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {currentFile?.name || "Sin archivo seleccionado"}
                </span>
              </div>
            </div>
            <div className="bg-muted dark:bg-muted border-b border-border dark:border-border">
              <div className="overflow-x-auto">
                <EditorToolbar onInsertMarkdown={insertMarkdown} />
              </div>
            </div>
            <div className="flex-1 overflow-hidden bg-background dark:bg-background">
              {!mounted ? (
                <div className="h-full w-full bg-muted dark:bg-muted animate-pulse" />
              ) : !isMobile ? (
                <MonacoEditor
                  value={content}
                  onChange={setContent}
                  theme={darkMode ? "dark" : "light"}
                  onScroll={handleEditorScroll}
                  onMount={setMonacoInstance}
                />
              ) : null}
            </div>
          </div>

          {/* Preview */}
          <MarkdownPreview
            content={content}
            previewFontSize={previewFontSize}
            darkMode={darkMode}
            onScroll={handlePreviewScroll}
            files={files}
            onLoadFile={loadFile}
            currentFile={currentFile}
          />
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;
