import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { marked } from "marked";

export async function POST(req: NextRequest) {
  try {
    const { markdown } = await req.json();

    if (typeof markdown !== "string" || markdown.trim() === "") {
      return NextResponse.json({ error: "Markdown inválido" }, { status: 400 });
    }

    // Convertir Markdown a HTML
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
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

    // Set content and wait for network idle to ensure resources load
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Generar PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0.8in",
        right: "0.8in",
        bottom: "0.8in",
        left: "0.8in",
      },
    });

    await browser.close();

    // Enviar PDF response
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="export.pdf"',
      },
    });
  } catch (error) {
    console.error("Error generando PDF:", error);
    return NextResponse.json(
      {
        error: `Error generando PDF: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 500 }
    );
  }
}
