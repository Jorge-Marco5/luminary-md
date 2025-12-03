import React from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-markdown";
import "./editor.css";

interface EditorProps {
  value: string;
  onValueChange: (code: string) => void;
  textareaId?: string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
}

const MarkdownEditor: React.FC<EditorProps> = ({
  value,
  onValueChange,
  textareaId,
  className,
  style,
  placeholder,
}) => {
  return (
    <Editor
      value={value}
      onValueChange={onValueChange}
      highlight={(code) =>
        highlight(code, languages.markdown || languages.markup, "markdown")
      }
      padding={16}
      textareaId={textareaId}
      className={`prism-editor ${className || ""}`}
      style={{
        fontFamily: '"Euclid Circular A", monospace',
        ...style,
      }}
      placeholder={placeholder}
    />
  );
};

export default MarkdownEditor;
