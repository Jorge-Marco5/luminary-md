import React, { useRef, useEffect } from "react";
import Editor, { OnMount, Monaco } from "@monaco-editor/react";


type MonacoEditorInstance = Parameters<OnMount>[0];

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme: "light" | "dark";
  onScroll?: (scrollTop: number) => void;
  onMount?: (editor: MonacoEditorInstance) => void;
  onUnmount?: () => void;
}

const mrpurpleLightTheme = {
  base: "vs" as const,
  inherit: true,
  rules: [
    { token: "comment", foreground: "#8A8296", fontStyle: "italic" },
    { token: "keyword", foreground: "#7f22fe", fontStyle: "bold" },
    { token: "keyword.control", foreground: "#7f22fe", fontStyle: "bold" },
    { token: "string", foreground: "#107B59" },
    { token: "number", foreground: "#D97706" },
    { token: "regexp", foreground: "#B45309" },
    { token: "type", foreground: "#0D9488" },
    { token: "class", foreground: "#0284C7" },
    { token: "function", foreground: "#6D28D9" },
    { token: "variable", foreground: "#374151" },
    { token: "variable.predefined", foreground: "#4F46E5" },
    { token: "tag", foreground: "#7f22fe" },
    { token: "attribute.name", foreground: "#9333EA" },
    { token: "attribute.value", foreground: "#107B59" },
    { token: "markup.heading", foreground: "#7f22fe", fontStyle: "bold" },
    { token: "markup.bold", fontStyle: "bold" },
    { token: "markup.italic", fontStyle: "italic" },
    { token: "markup.quote", foreground: "#5B21B6", fontStyle: "italic" },
    { token: "markup.list", foreground: "#7f22fe" },
    { token: "markup.raw", foreground: "#4B5563" },
    { token: "markup.underline.link", foreground: "#2563EB", fontStyle: "underline" },
  ],
  colors: {
    "editor.background": "#FAF9FD",
    "editor.foreground": "#241E2F",
    "editorLineNumber.foreground": "#B4AEC0",
    "editorLineNumber.activeForeground": "#7f22fe",
    "editorCursor.foreground": "#7f22fe",
    "editor.selectionBackground": "#7f22fe2b",
    "editor.inactiveSelectionBackground": "#7f22fe18",
    "editor.lineHighlightBackground": "#7f22fe09",
    "editor.lineHighlightBorder": "#00000000",
    "editorBracketMatch.background": "#7f22fe20",
    "editorBracketMatch.border": "#7f22fe50",
  },
};

const mrpurpleDarkTheme = {
  base: "vs-dark" as const,
  inherit: true,
  rules: [
    { token: "comment", foreground: "#797285", fontStyle: "italic" },
    { token: "keyword", foreground: "#b479ff", fontStyle: "bold" },
    { token: "keyword.control", foreground: "#c084fc", fontStyle: "bold" },
    { token: "string", foreground: "#34D399" },
    { token: "number", foreground: "#F59E0B" },
    { token: "regexp", foreground: "#FBBF24" },
    { token: "type", foreground: "#2DD4BF" },
    { token: "class", foreground: "#38BDF8" },
    { token: "function", foreground: "#a855f7" },
    { token: "variable", foreground: "#E5E1EC" },
    { token: "variable.predefined", foreground: "#818CF8" },
    { token: "tag", foreground: "#b479ff" },
    { token: "attribute.name", foreground: "#c084fc" },
    { token: "attribute.value", foreground: "#34D399" },
    { token: "markup.heading", foreground: "#b479ff", fontStyle: "bold" },
    { token: "markup.bold", fontStyle: "bold" },
    { token: "markup.italic", fontStyle: "italic" },
    { token: "markup.quote", foreground: "#c084fc", fontStyle: "italic" },
    { token: "markup.list", foreground: "#b479ff" },
    { token: "markup.raw", foreground: "#9CA3AF" },
    { token: "markup.underline.link", foreground: "#60A5FA", fontStyle: "underline" },
  ],
  colors: {
    "editor.background": "#121016",
    "editor.foreground": "#E5E1EC",
    "editorLineNumber.foreground": "#5C5568",
    "editorLineNumber.activeForeground": "#a855f7",
    "editorCursor.foreground": "#a855f7",
    "editor.selectionBackground": "#a855f73d",
    "editor.inactiveSelectionBackground": "#a855f71a",
    "editor.lineHighlightBackground": "#a855f712",
    "editor.lineHighlightBorder": "#00000000",
    "editorBracketMatch.background": "#a855f730",
    "editorBracketMatch.border": "#a855f760",
  },
};

const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  onChange,
  theme,
  onScroll,
  onMount,
  onUnmount,
}) => {
  const editorRef = useRef<MonacoEditorInstance | null>(null);
  const onScrollRef = useRef(onScroll);
  const onUnmountRef = useRef(onUnmount);

  useEffect(() => {
    onScrollRef.current = onScroll;
  }, [onScroll]);

  useEffect(() => {
    onUnmountRef.current = onUnmount;
  }, [onUnmount]);

  useEffect(() => {
    return () => {
      if (onUnmountRef.current) {
        onUnmountRef.current();
      }
    };
  }, []);

  const handleEditorBeforeMount = (monaco: Monaco) => {

    monaco.editor.defineTheme(
      "mrpink-dark",
      mrpurpleDarkTheme as Parameters<typeof monaco.editor.defineTheme>[1]
    );

    // Define cohesive light theme
    monaco.editor.defineTheme(
      "mrpink-light",
      mrpurpleLightTheme as Parameters<typeof monaco.editor.defineTheme>[1]
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Listen to scroll events
    editor.onDidScrollChange((e) => {
      if (onScrollRef.current) {
        onScrollRef.current(e.scrollTop);
      }
    });

    if (onMount) {
      onMount(editor);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || "");
  };

  return (
    <Editor
      height="100%"
      language="markdown"
      value={value}
      theme={theme === "dark" ? "mrpink-dark" : "mrpink-light"}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      beforeMount={handleEditorBeforeMount}
      options={{
        fontSize: 16,
        wordWrap: "on",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        padding: { top: 16, bottom: 16 },
        lineNumbers: "on",
        glyphMargin: false,
        folding: false,
        // Undocumented but useful for "clean" look
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        scrollbar: {
          vertical: "visible",
          horizontal: "hidden",
          useShadows: false,
        },
      }}
    />
  );
};

export default MonacoEditor;
