// pages/api/export-pdf.js
import puppeteer from "puppeteer";
import { marked } from "marked";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { markdown } = req.body;

    if (typeof markdown !== "string" || markdown.trim() === "") {
      return res.status(400).json({ error: "Markdown inválido" });
    }

    // Convertir Markdown a HTML
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; }
            h1, h2, h3 { color: #333; }
            pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
            code { font-family: monospace; }
          </style>
        </head>
        <body>
          ${marked(markdown)}
        </body>
      </html>
    `;

    // Lanzar Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Generar PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "2in",
        right: "1in",
        bottom: "2in",
        left: "1in",
      },
    });

    await browser.close();

    // Enviar PDF como descarga
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=export.pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generando PDF:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
