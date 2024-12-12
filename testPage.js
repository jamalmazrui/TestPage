// let { execSync } = require('child_process');
let puppeteer = require("puppeteer-core");
let fs = require("fs");
let path = require("path");
let process = require("process");

let sOutputDir = "./results";
sOutputDir = path.resolve(sOutputDir);

function sleep(iSeconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, iSeconds * 1000);
  });
}

function generateUniqueDirName(sRootName) {
  let sDirPath = path.join(process.cwd(), `${sRootName}`);
  let iCount = 1;
  while (fs.existsSync(sDirPath)) {
    sDirPath = path.join(
      process.cwd(),
      `${sRootName}-${String(iCount).padStart(2, "0")}`,
    );
    iCount++;
  }
  return sDirPath;
}

function generateUniqueFileName(sRootName, sExtension) {
  let sFilePath = path.join(sOutputDir, `${sRootName}.${sExtension}`);
  let iCount = 1;
  while (fs.existsSync(sFilePath)) {
    sFilePath = path.join(
      sOutputDir,
      `${sRootName}-${String(iCount).padStart(2, "0")}.${sExtension}`,
    );
    iCount++;
  }
  return sFilePath;
}

function renameIfExists(sOldPath, sNewPath) {
  if (fs.existsSync(sOldPath)) fs.renameSync(sOldPath, sNewPath);
}

// main

(async () => {
  let sUrl = process.argv[2];
  if (!sUrl) {
    console.error("Please provide a URL as a command-line argument.");
    process.exit(1);
  }

  let aLines = await [sUrl];
  if (await !sUrl.includes("://")) {
    let sLines = await fs.readFileSync(sUrl, "utf-8");
    aLines = await sLines.split("\n");
  } // else

  let sStartDir = await __dirname;
  let sCurDir = await process.cwd();
  let sBaseYml = await ".achecker.yml";
  let sSourceYml = await path.join(sStartDir, sBaseYml);
  let sTargetYml = await path.join(sCurDir, sBaseYml);

  let browser = await puppeteer.launch({
    executablePath:
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", // Adjust this path if needed
    headless: true,
  });
  let checker = null;
  while (aLines.length > 0) {
    sUrl = await aLines.shift();
    sUrl = await sUrl.trim();
    if (await !sUrl) continue;

    let page = await browser.newPage();
    await page.goto(sUrl);
    let sPageTitle = await page.title();
    sPageTitle = await sPageTitle.replace(/[^a-zA-Z0-9_,#\.\-]/gi, " ");
    sPageTitle = await sPageTitle.replace(/\s+/gi, " ").trim();

    //         if (!fs.existsSync(sOutputDir)) fs.mkdirSync(sOutputDir);
    // await page.addScriptTag({ url: "https://unpkg.com/accessibility-checker-engine@latest/ace.js"});
    sOutputDir = await generateUniqueDirName(sPageTitle);
    console.log(path.basename(sOutputDir));
    console.log();
    let sOldYml = await fs.readFileSync(sSourceYml, "utf-8");
    let sNewYml = await sOldYml.replace(
      /outputFolder.+/,
      `outputFolder: ${sOutputDir}`,
    );
    await fs.writeFileSync(sTargetYml, sNewYml);

    checker = require("accessibility-checker");
    let dResults = await checker.getCompliance(page, "results");
    let dReport = await dResults.report;
    await checker.close();
    if (sTargetYml != sSourceYml) await fs.unlinkSync(sTargetYml);
    await fs.writeFileSync(sSourceYml, sOldYml);

    /*
        let sCsvPath = await generateUniqueFileName(sPageTitle, 'csv');
//         let sJsonPath = await generateUniqueFileName(sPageTitle, 'json');
        let sHtmlPath = await generateUniqueFileName(sPageTitle, 'html');
        let sXlsxPath = await generateUniqueFileName(sPageTitle, 'xlsx');

        await renameIfExists(path.join(sOutputDir, 'results.csv'), sCsvPath);
 await          renameIfExists(path.join(sOutputDir, 'results.json'), sJsonPath);
 await         renameIfExists(path.join(sOutputDir, 'results.html'), sHtmlPath);
 await         renameIfExists(path.join(sOutputDir, 'results.xlsx'), sXlsxPath);

// if (fs.existsSync(sCsvPath)) {
if (false) {
 let sCsvData = await fs.readFileSync(sCsvPath, 'utf8');
 let sFormattedCsv = await prettier.format(sCsvData, { parser: 'csv' });
 await         fs.writeFileSync(sCsvPath, sFormattedCsv, 'utf8');
} 

   if (fs.existsSync(sJsonPath)) {
 let sJsonData = await fs.readFileSync(sJsonPath, 'utf8');
 let sFormattedJson = await prettier.format(sJsonData, { parser: 'json' });
 await         fs.writeFileSync(sJsonPath, sFormattedJson, 'utf8');
}

if (fs.existsSync(sHtmlPath)) {
 let sHtmlData = await fs.readFileSync(sHtmlPath, 'utf8');
         let sFormattedHtml = await prettier.format(sHtmlData, { parser: 'html' });
 await         fs.writeFileSync(sHtmlPath, sFormattedHtml, 'utf8');
}
*/

    await page.close();
  } // while
  await browser.close();
  // console.log("Done");
  // await fs.openSync(sOutputDir);
})();