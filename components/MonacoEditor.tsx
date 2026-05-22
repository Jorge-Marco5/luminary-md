import React, { useRef, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";

type MonacoEditorInstance = Parameters<OnMount>[0];

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme: "light" | "dark";
  onScroll?: (scrollTop: number) => void;
  onMount?: (editor: MonacoEditorInstance) => void;
  onUnmount?: () => void;
}

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
      theme={theme === "dark" ? "vs-dark" : "light"}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
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
