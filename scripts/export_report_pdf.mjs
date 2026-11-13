import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import playwrightPkg from "../web/node_modules/@playwright/test/index.js";

const { chromium } = playwrightPkg;

const rootDir = process.cwd();
const reportMdPath = path.join(rootDir, "FINAL_REPORT.md");
const outputPdfPath = path.join(rootDir, "Voice_Roots_Final_Capstone_Report.pdf");

console.log("Reading FINAL_REPORT.md...");
const mdContent = fs.readFileSync(reportMdPath, "utf-8");

console.log("Converting Markdown to HTML with marked...");
const htmlBody = execSync("npx --yes marked", {
  input: mdContent,
  encoding: "utf-8",
});

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Voice Roots - Capstone Final Engineering Report</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.1/github-markdown.min.css">
  <style>
    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
      @bottom-right {
        content: counter(page);
      }
    }
    body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
      font-size: 13.5px;
      line-height: 1.6;
      color: #1f2328;
      background: #ffffff;
    }
    .markdown-body {
      background: #ffffff;
    }
    h1 {
      font-size: 24px;
      border-bottom: 2px solid #e1e4e8;
      padding-bottom: 8px;
      margin-top: 24px;
      color: #0f172a;
    }
    h2 {
      font-size: 18px;
      border-bottom: 1px solid #eaecef;
      padding-bottom: 6px;
      margin-top: 28px;
      break-after: avoid;
      color: #1e293b;
    }
    h3 {
      font-size: 15px;
      margin-top: 20px;
      break-after: avoid;
      color: #334155;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 12px;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #d0d7de;
      padding: 6px 10px;
    }
    th {
      background-color: #f6f8fa;
      font-weight: 600;
    }
    pre {
      background-color: #f6f8fa;
      border-radius: 6px;
      padding: 12px;
      font-size: 11px;
      line-height: 1.45;
      overflow-x: auto;
      border: 1px solid #e1e4e8;
      page-break-inside: avoid;
    }
    code {
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
      font-size: 85%;
      background-color: rgba(175, 184, 193, 0.2);
      padding: 0.2em 0.4em;
      border-radius: 6px;
    }
    pre code {
      background-color: transparent;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #f59e0b;
      padding: 0 15px;
      color: #475569;
      margin: 16px 0;
      background: #fffbeb;
      padding-top: 8px;
      padding-bottom: 8px;
      border-radius: 0 4px 4px 0;
    }
    img {
      max-width: 100%;
      height: auto;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      margin: 8px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      page-break-inside: avoid;
    }
    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body class="markdown-body">
  ${htmlBody}
</body>
</html>`;

const tempHtmlPath = path.join(rootDir, "temp_report_render.html");
fs.writeFileSync(tempHtmlPath, fullHtml, "utf-8");

console.log("Launching headless browser to generate PDF...");
const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto(`file://${tempHtmlPath}`, { waitUntil: "networkidle" });

console.log("Rendering PDF to", outputPdfPath);
await page.pdf({
  path: outputPdfPath,
  format: "A4",
  margin: {
    top: "20mm",
    right: "15mm",
    bottom: "20mm",
    left: "15mm",
  },
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<div style="font-size: 9px; width: 100%; text-align: right; padding-right: 15mm; color: #888;">Voice Roots — Academic Capstone Final Report</div>',
  footerTemplate: '<div style="font-size: 9px; width: 100%; text-align: center; color: #888;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
});

await browser.close();

if (fs.existsSync(tempHtmlPath)) {
  fs.unlinkSync(tempHtmlPath);
}

const stats = fs.statSync(outputPdfPath);
console.log(`✅ Successfully generated ${outputPdfPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
