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
            background-color: white;
            color: #24292f;
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
  if (setAlert)
    setAlert({
      message: "Preparando documento para impresión...",
      type: "info",
    });

  // Give the DOM a moment to update styles before opening the print dialog
  setTimeout(() => {
    window.print();
    if (setAlert) setAlert({ message: "PDF generado", type: "success" });
  }, 100);
};
