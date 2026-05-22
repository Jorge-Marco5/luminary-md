import React, { useState, useEffect } from "react";
import type { MermaidConfig } from "mermaid";

// Sequential promise queue to prevent concurrent Mermaid renders,
// which can cause diagram corruption or rendering conflicts.
let mermaidQueue: Promise<{ svg: string; bindFunctions?: (el: Element) => void }> = Promise.resolve({ svg: "" });

const queueMermaidRender = (
  id: string,
  code: string,
  config: MermaidConfig
): Promise<{ svg: string; bindFunctions?: (el: Element) => void }> => {
  mermaidQueue = mermaidQueue.then(async () => {
    try {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize(config);
      return await mermaid.render(id, code);
    } catch (err) {
      // Forward the error down the promise chain to be handled by the component
      throw err;
    }
  });
  return mermaidQueue;
};

interface MermaidRendererProps {
  code: string;
  darkMode: boolean;
}

const MermaidRenderer: React.FC<MermaidRendererProps> = ({ code, darkMode }) => {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [renderedCode, setRenderedCode] = useState<string>("");
  const [renderedDarkMode, setRenderedDarkMode] = useState<boolean>(darkMode);

  // Compute isRendering based on whether the props match the rendered state.
  // This avoids calling setState inside useEffect synchronously.
  const isRendering = code !== renderedCode || darkMode !== renderedDarkMode;

  useEffect(() => {
    let active = true;

    const timer = setTimeout(() => {
      // Generate a new unique ID for every render attempt to avoid DOM ID collisions
      const renderId = `mermaid-svg-${Math.random().toString(36).substring(2, 11)}`;
      const config: MermaidConfig = {
        startOnLoad: false,
        theme: darkMode ? "dark" : "default",
        securityLevel: "loose",
        themeVariables: darkMode
          ? {
              background: "#09090b",
              primaryColor: "#3b82f6",
            }
          : {},
      };

      queueMermaidRender(renderId, code, config)
        .then(({ svg }) => {
          if (active) {
            setSvg(svg);
            setRenderedCode(code);
            setRenderedDarkMode(darkMode);
            setError(null);
          }
        })
        .catch((err) => {
          if (active) {
            console.error("Mermaid rendering error:", err);
            const errMsg =
              err instanceof Error
                ? err.message
                : typeof err === "string"
                ? err
                : err && typeof err === "object" && "message" in err
                ? String((err as { message: unknown }).message)
                : "Error de sintaxis desconocido";
            setError(errMsg);
            setRenderedCode(code);
            setRenderedDarkMode(darkMode);
          }
        });
    }, 200); // 200ms debounce to avoid rendering on every keystroke

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [code, darkMode]);

  if (error) {
    return (
      <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm font-mono my-4">
        <p className="font-semibold mb-2">Error de sintaxis en el gráfico Mermaid:</p>
        <pre className="whitespace-pre-wrap overflow-x-auto text-xs bg-red-100/50 dark:bg-red-950/40 p-2 rounded">
          {error}
        </pre>
      </div>
    );
  }

  if (isRendering && !svg) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-300 dark:border-neutral-700 rounded-lg my-4 animate-pulse">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Renderizando gráfico Mermaid...
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex justify-center items-center my-4 p-4 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg shadow-sm overflow-x-auto max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default MermaidRenderer;
