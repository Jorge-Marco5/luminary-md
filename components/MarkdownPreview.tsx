import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import CodeBlock from "./CodeBlock";
import type { FileEntry } from "../types";

interface MarkdownImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | Blob;
  files: FileEntry[];
  currentFile: FileEntry | null;
}

const MarkdownImage: React.FC<MarkdownImageProps> = ({
  src,
  alt,
  files,
  currentFile,
  ...props
}) => {
  const [objectUrl, setObjectUrl] = React.useState<string>("");

  React.useEffect(() => {
    if (!src) return;

    if (src instanceof Blob) {
      const url = URL.createObjectURL(src);
      const timer = setTimeout(() => {
        setObjectUrl(url);
      }, 0);
      return () => {
        clearTimeout(timer);
        URL.revokeObjectURL(url);
      };
    }

    if (typeof src !== "string") return;

    // If it is already an absolute/external or data URL, use it directly
    if (/^(https?:|data:|blob:)/i.test(src)) {
      const timer = setTimeout(() => {
        setObjectUrl(src);
      }, 0);
      return () => clearTimeout(timer);
    }

    // Resolve path relative to currentFile
    const parentDir =
      currentFile && currentFile.path.includes("/")
        ? currentFile.path.substring(0, currentFile.path.lastIndexOf("/"))
        : "";

    // Resolve relative path
    let targetPath = src;
    if (targetPath.startsWith("./")) {
      targetPath = targetPath.substring(2);
    }

    if (parentDir) {
      const baseSegments = parentDir.split("/");
      const relSegments = targetPath.split("/");
      for (const segment of relSegments) {
        if (segment === "..") {
          baseSegments.pop();
        } else if (segment !== "" && segment !== ".") {
          baseSegments.push(segment);
        }
      }
      targetPath = baseSegments.join("/");
    } else {
      while (targetPath.startsWith("../")) {
        targetPath = targetPath.substring(3);
      }
    }

    const decodedPath = decodeURIComponent(targetPath);
    let imageFile = files.find((f) => f.path === decodedPath);

    // Fallback search by filename only if not found by exact path
    if (!imageFile) {
      const filename = decodedPath.substring(decodedPath.lastIndexOf("/") + 1);
      imageFile = files.find((f) => f.name === filename);
    }

    if (imageFile) {
      const url = URL.createObjectURL(imageFile.file);
      const timer = setTimeout(() => {
        setObjectUrl(url);
      }, 0);

      return () => {
        clearTimeout(timer);
        URL.revokeObjectURL(url);
      };
    } else {
      const timer = setTimeout(() => {
        setObjectUrl(src);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [src, files, currentFile]);

  if (!objectUrl) {
    return <span className="inline-block w-16 h-16 bg-gray-200 dark:bg-neutral-800 animate-pulse rounded" />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={objectUrl} alt={alt || ""} {...props} />;
};

interface MarkdownPreviewProps {
  content: string;
  previewFontSize: number;
  darkMode: boolean;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  files: FileEntry[];
  onLoadFile: (file: FileEntry) => void;
  currentFile: FileEntry | null;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  previewFontSize,
  darkMode,
  onScroll,
  files,
  onLoadFile,
  currentFile,
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
          className={`markdown-body max-w-full cursor-pointer ${darkMode
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
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  onClick={(e) => {
                    if (props.href?.endsWith(".md")) {
                      e.preventDefault();
                      const linkedFile = files.find(
                        (f) =>
                          f.name === props.href || f.path.endsWith(props.href || "")
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
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              img: ({ node, src, alt, ...props }) => (
                <MarkdownImage
                  src={src}
                  alt={alt}
                  files={files}
                  currentFile={currentFile}
                  className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-neutral-800 my-4 shadow-sm"
                  {...props}
                />
              ),
              pre: ({ children, ...props }) => (
                <CodeBlock {...props} darkMode={darkMode}>
                  {children}
                </CodeBlock>
              ),
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
