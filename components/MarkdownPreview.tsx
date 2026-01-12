import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";

interface MarkdownPreviewProps {
  content: string;
  previewFontSize: number;
  darkMode: boolean;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  files: any[];
  onLoadFile: (file: any) => void;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  previewFontSize,
  darkMode,
  onScroll,
  files,
  onLoadFile,
}) => {
  return (
    <div className={`flex-1 flex flex-col min-w-0 overflow-hidden`}>
      <div className="p-2 bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700 print:hidden">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Vista previa
        </span>
      </div>
      <div
        id="preview"
        onScroll={onScroll}
        className={`flex-1 overflow-y-auto overflow-x-hidden p-4`}
      >
        <div
          className={`markdown-body max-w-full cursor-pointer ${
            darkMode
              ? "bg-neutral-950 text-neutral-100 border-neutral-700"
              : "bg-neutral-50 text-neutral-900 border-neutral-200"
          }`}
          style={{
            fontSize: `${previewFontSize}px`,
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
                          f.name === props.href || f.path.endsWith(props.href)
                      );
                      if (linkedFile) {
                        onLoadFile(linkedFile);
                      }
                    }
                  }}
                  target={props.href?.startsWith("http") ? "_blank" : undefined}
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
  );
};

export default MarkdownPreview;
