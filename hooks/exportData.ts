"use client";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

type AlertSetter = (alert: { message: string; type: string } | null) => void;

export const exportData = async (
  content: string,
  format: string,
  setAlert?: AlertSetter
) => {
  switch (format) {
    case "markdown":
      return exportMarkdown(content, setAlert);
    case "html":
      return await exportHtml(content, setAlert);
    case "pdf":
      return await exportToPdf(content, setAlert);
    default:
      return exportMarkdown(content, setAlert);
  }
};

const exportMarkdown = (content: string, setAlert?: AlertSetter) => {
  try {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (setAlert)
      setAlert({ message: "Markdown exportado exitosamente", type: "success" });
  } catch (error) {
    if (setAlert)
      setAlert({ message: "Error exportando Markdown", type: "error" });
  }
};

// Generates the HTML string with GitHub styles
const generateHtmlContent = async (content: string) => {
  try {
    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkHtml)
      .process(content);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Document</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.0/github-markdown.min.css">
    <style>
        body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
        }
        @media (max-width: 767px) {
            body {
                padding: 15px;
            }
        }
        .markdown-body {
            background-color: var(--background);
            color: var(--foreground);
        }
    </style>
</head>
<body class="markdown-body">
    ${String(file)}
</body>
</html>`;
  } catch (error) {
    console.error("Error generating HTML:", error);
    throw error;
  }
};

const exportHtml = async (content: string, setAlert?: AlertSetter) => {
  try {
    const htmlContent = await generateHtmlContent(content);
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (setAlert)
      setAlert({ message: "HTML exportado exitosamente", type: "success" });
  } catch (error) {
    if (setAlert)
      setAlert({ message: "Error al generar el HTML", type: "error" });
  }
};

export const exportToPdf = async (markdown: string, setAlert?: AlertSetter) => {
  try {
    if (setAlert)
      setAlert({
        message: "Preparando documento para impresión...",
        type: "info",
      });

    // 1. Extract the rendered HTML content of the markdown preview
    const previewElement = document.querySelector(".markdown-body");
    if (!previewElement) {
      throw new Error("No se encontró el contenedor de la vista previa.");
    }
    const htmlContent = previewElement.innerHTML;

    // 2. Create a temporary hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.style.visibility = "hidden";

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      throw new Error("No se pudo acceder al documento del iframe.");
    }

    // 3. Write a standalone styled document to the iframe
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Exported Document</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.0/github-markdown.min.css">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
          <style>
              body {
                  box-sizing: border-box;
                  min-width: 200px;
                  max-width: 100%;
                  margin: 0;
                  padding: 2cm;
                  background-color: white;
                  color: #24292f;
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
              }
              @media print {
                  body {
                      padding: 0;
                  }
                  @page {
                      margin: 1.5cm;
                  }
              }
              /* Support text wrapping for code blocks and equations */
              pre, code {
                  white-space: pre-wrap !important;
                  word-break: break-word !important;
              }
              /* Overwrite github dark colors for print if dark mode is active */
              .markdown-body {
                  background-color: white !important;
                  color: #24292f !important;
              }
          </style>
      </head>
      <body class="markdown-body">
          ${htmlContent}
      </body>
      </html>
    `);
    doc.close();

    // 4. Give stylesheets time to load, then trigger print dialog
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      // Clean up the iframe after a short delay
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);

      if (setAlert) setAlert({ message: "PDF generado", type: "success" });
    }, 500);

  } catch (error) {
    console.error("Error al exportar a PDF:", error);
    if (setAlert) {
      setAlert({
        message: "Error al generar el PDF de exportación",
        type: "error",
      });
    }
  }
};
