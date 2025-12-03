import React, { useRef, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme: "light" | "dark";
  onScroll?: (scrollTop: number) => void;
  onMount?: (editor: any) => void;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  onChange,
  theme,
  onScroll,
  onMount,
}) => {
  const editorRef = useRef<any>(null);
  const onScrollRef = useRef(onScroll);

  useEffect(() => {
    onScrollRef.current = onScroll;
  }, [onScroll]);

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
        fontFamily: '"Euclid Circular A", monospace',
        fontSize: 16,
        wordWrap: "on",
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        padding: { top: 16, bottom: 16 },
        lineNumbers: "off",
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
