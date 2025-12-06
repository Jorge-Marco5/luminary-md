import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteerCore from "puppeteer-core";

// Allow 60 seconds for PDF generation
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

  try {
    const { html } = await req.json();
    if (!html)
      return NextResponse.json({ error: "Missing HTML" }, { status: 400 });

    let browser;
    if (isProduction) {
      browser = await puppeteerCore.launch({
        args: (chromium as any).args,
        defaultViewport: (chromium as any).defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: (chromium as any).headless,
      });
    } else {
      const puppeteer = (await import("puppeteer")).default;
      const path = await import("path");

      // Explicitly check for the local chrome binary we installed
      // This solves the issue where Puppeteer doesn't find it in the custom .cache location automatically
      const localChromePath = path.join(
        process.cwd(),
        ".cache",
        "puppeteer",
        "chrome",
        "win64-143.0.7499.40",
        "chrome-win64",
        "chrome.exe"
      );

      // You might want to verify existence, but let's try strict first
      browser = await puppeteer.launch({
        executablePath: localChromePath,
        args: ["--no-sandbox"], // often helps in windows/containers
      });
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
    });

    await browser.close();

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="document.pdf"',
      },
    });
  } catch (error: any) {
    console.error("PDF API Error:", error);
    return NextResponse.json(
      {
        error: "PDF Generation Failed",
        details: error.message,
        stack: error.stack,
        env: {
          isProduction,
          nodeEnv: process.env.NODE_ENV,
          vercel: process.env.VERCEL,
        },
      },
      { status: 500 }
    );
  }
}
