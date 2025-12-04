"use client";
import React, { useEffect, useState } from "react";
import {
  Menu,
  X,
  Save,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
  Edit3,
  Hash,
  Command,
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

const MonacoEditor = dynamic(() => import("../components/MonacoEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-50 dark:bg-neutral-950 animate-pulse" />
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

  const [modalAboutMeOpen, setModalAboutMeOpen] = useState(false);

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
      />

      <ModalAboutMe
        isOpen={modalAboutMeOpen}
        onClose={() => setModalAboutMeOpen(false)}
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
      <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white dark:bg-neutral-800">
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-neutral-950">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalCommandsOpen(true)}
              className="p-2 bg-neutral-700 hover:bg-neutral-600 dark:text-neutral-200 rounded"
              title="Ayuda"
            >
              <Command size={20} />
            </button>
            <ModalCommands
              isOpen={modalCommandsOpen}
              onClose={() => setModalCommandsOpen(false)}
            />
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
            <button
              onClick={() =>
                setPreviewFontSize((prev) => Math.max(10, prev - 1))
              }
              className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded"
              title="Disminuir tamaño de fuente"
            >
              <ZoomOut size={20} />
            </button>
            <span className="text-sm font-medium text-gray-600 dark:text-neutral-200 w-8 text-center">
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
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={saveFile}
              className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 bg-violet-600 text-white rounded flex items-center gap-2"
              title="Guardar"
            >
              <Save size={20} />
              Guardar
            </button>
          </div>
        </div>

        {/* Editor and Preview */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-w-0 w-full">
          {/* Mobile Edit Button (Floating) */}
          <div className="md:hidden absolute bottom-6 right-6 z-10">
            <Drawer.Root>
              <Drawer.Trigger asChild>
                <button className="bg-violet-600 text-white p-4 rounded-full shadow-lg hover:bg-violet-700 transition-colors">
                  <Edit3 size={24} />
                </button>
              </Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black" />
                <Drawer.Content className="bg-white dark:bg-neutral-950 flex flex-col rounded-t-[10px] h-[96%] mt-24 fixed bottom-0 left-0 right-0 outline-none z-50">
                  <Drawer.Title className="hidden">Editar</Drawer.Title>
                  <div className="p-4 bg-white dark:bg-neutral-900 rounded-t-[10px] flex-1 flex flex-col">
                    <div className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-gray-300 dark:bg-neutral-700 mb-8" />
                    <div
                      className="flex-1 flex flex-col min-h-0"
                      data-vaul-no-drag
                    >
                      <div className="flex items-center gap-2 p-2 border-b border-gray-200 dark:border-neutral-700 overflow-x-auto mb-2">
                        <EditorToolbar onInsertMarkdown={insertMarkdown} />
                      </div>
                      <textarea
                        id="editor-mobile"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onScroll={handleEditorScroll}
                        className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100 overflow-auto"
                        placeholder="Selecciona un archivo o carga una carpeta..."
                        style={{
                          fontSize: `${previewFontSize}px`,
                        }}
                      />
                    </div>
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          </div>

          {/* Desktop Editor */}
          <div className="hidden md:flex flex-1 flex-col border-r border-gray-200 dark:border-neutral-700 min-w-0 overflow-hidden">
            <div className="p-2 bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700">
              <div className="flex items-center gap-2">
                <Hash size={20} className="text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {currentFile?.name || "Sin archivo seleccionado"}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700">
              <div className="overflow-x-auto">
                <EditorToolbar onInsertMarkdown={insertMarkdown} />
              </div>
            </div>
            <div className="flex-1 overflow-hidden bg-white dark:bg-neutral-950">
              <MonacoEditor
                value={content}
                onChange={setContent}
                theme={darkMode ? "dark" : "light"}
                onScroll={handleEditorScroll}
                onMount={setMonacoInstance}
              />
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
          />
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;
