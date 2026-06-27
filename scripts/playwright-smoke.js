const { chromium } = require("playwright");
const path = require("path");

const fileUrl = "file:///" + path.resolve("index.html").replace(/\\/g, "/");

async function runDesktopSmoke(browser) {
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(fileUrl);
  await page.waitForSelector(".board-cell");

  const boardCells = await page.locator(".board-cell").count();
  const pieceCards = await page.locator(".piece-card").count();
  const workshopHidden = await page.locator(".workshop").evaluate((element) => {
    return getComputedStyle(element).display === "none";
  });
  if (boardCells !== 64) throw new Error(`Expected 64 board cells, got ${boardCells}`);
  if (pieceCards !== 3) throw new Error(`Expected 3 piece cards, got ${pieceCards}`);
  if (!workshopHidden) throw new Error("Expected Player view to hide Maker tools");

  await page.locator('[data-view-button="maker"]').click();
  await page.locator(".workshop").waitFor({ state: "visible" });
  const editorCells = await page.locator(".editor-cell.is-filled").count();
  if (editorCells < 1) throw new Error("Expected editable cells for selected piece");

  await page.locator('.swatch[data-color="#2ec4b6"]').click();
  await page.locator(".editor-cell.is-filled").first().click();
  await page.locator("#randomizeSkin").click();
  await page.locator('[data-texture="neon"]').click();
  const textureBackground = await page.locator(".editor-cell.is-filled").first().evaluate((element) => {
    return getComputedStyle(element).backgroundImage;
  });
  if (!textureBackground.includes("gradient")) throw new Error("Expected texture preset on editor cell");

  const photoSvg = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="40" height="40" fill="#ff3158"/><rect x="40" width="40" height="40" fill="#18c8b8"/><rect y="40" width="40" height="40" fill="#ffc43d"/><rect x="40" y="40" width="40" height="40" fill="#326dff"/></svg>',
  );
  await page.setInputFiles("#photoInput", {
    name: "texture.svg",
    mimeType: "image/svg+xml",
    buffer: photoSvg,
  });
  await page.locator("#applyPhoto").click();
  const photoBackground = await page.locator(".editor-cell.is-filled").first().evaluate((element) => {
    return getComputedStyle(element).backgroundImage;
  });
  if (!photoBackground.includes("data:image")) throw new Error("Expected uploaded photo texture on editor cell");
  const storedSkinPack = await page.evaluate(() => localStorage.getItem("mosaic-blocks-save-v1"));
  if (!storedSkinPack || !storedSkinPack.includes('"kind":"photo"')) {
    throw new Error("Expected uploaded photo to be saved as the active skin pack");
  }

  await page.locator('[data-view-button="play"]').click();
  await page.locator(".play-area").waitFor({ state: "visible" });
  await page.locator(".board-cell").first().click();
  const filled = await page.locator(".board-cell.is-filled").count();
  const usedPieces = await page.locator(".piece-card.is-used").count();
  const score = Number(await page.locator("#score").textContent());
  if (filled < 1) throw new Error("Expected placed block cells on board");
  if (usedPieces !== 1) throw new Error(`Expected one used piece after one placement, got ${usedPieces}`);
  if (score <= 0) throw new Error(`Expected score > 0, got ${score}`);
  if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);

  await page.screenshot({ path: "playwright-smoke.png", fullPage: true });
  await page.close();

  return { boardCells, pieceCards, editorCells, filled, usedPieces, score };
}

async function runMobileSmoke(browser) {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });

  await page.goto(fileUrl);
  await page.waitForSelector(".board-cell");

  const boardBox = await page.locator("#board").boundingBox();
  const bodyWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  if (bodyWidth > 430) throw new Error(`Unexpected horizontal overflow: ${bodyWidth}`);
  if (!boardBox || boardBox.width < 300) {
    throw new Error(`Board too small: ${boardBox && boardBox.width}`);
  }

  await page.screenshot({ path: "playwright-mobile.png", fullPage: true });
  await page.close();

  return { bodyWidth, boardWidth: Math.round(boardBox.width) };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const desktop = await runDesktopSmoke(browser);
    const mobile = await runMobileSmoke(browser);
    console.log(JSON.stringify({ fileUrl, desktop, mobile }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
