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
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector(".board-cell");

  const boardCells = await page.locator(".board-cell").count();
  const pieceCards = await page.locator(".piece-card").count();
  const initialFilled = await page.locator(".board-cell.is-filled").count();
  const workshopHidden = await page.locator(".workshop").evaluate((element) => {
    return getComputedStyle(element).display === "none";
  });
  if (boardCells !== 64) throw new Error(`Expected 64 board cells, got ${boardCells}`);
  if (pieceCards !== 3) throw new Error(`Expected 3 piece cards, got ${pieceCards}`);
  if (initialFilled < 8) throw new Error(`Expected seeded board, got ${initialFilled} filled cells`);
  if (!workshopHidden) throw new Error("Expected Player view to hide Maker tools");

  await page.locator('[data-view-button="maker"]').click();
  await page.locator(".workshop").waitFor({ state: "visible" });
  const themeStartVisible = await page.locator("#themeStartPanel").isVisible();
  if (!themeStartVisible) throw new Error("Expected Maker entry to show the theme start panel");
  const newThemeVisible = await page.locator("#newTheme").isVisible();
  if (!newThemeVisible) throw new Error("Expected New Theme control on Maker entry");
  const toolCount = await page.locator("button[data-tool]").count();
  if (toolCount !== 5) throw new Error(`Expected 5 maker tools, got ${toolCount}`);
  const fillModeCount = await page.locator("button[data-fill-mode]").count();
  if (fillModeCount !== 2) throw new Error(`Expected 2 fill mode controls, got ${fillModeCount}`);
  const fillGridCount = await page.locator("#gridSelect option").count();
  if (fillGridCount !== 5) throw new Error(`Expected 5 fill grid options, got ${fillGridCount}`);
  const gridDisabledInSingle = await page.locator("#gridSelect").isDisabled();
  if (!gridDisabledInSingle) throw new Error("Expected Grid select to be disabled in single fill mode");
  const gridValueInSingle = await page.locator("#gridSelect").inputValue();
  if (gridValueInSingle !== "1") throw new Error(`Expected Grid to show 1x1 in single mode, got ${gridValueInSingle}`);
  if ((await page.locator("#dotGridSelect, #dotTypeSelect, #outlineWidth").count()) !== 0) {
    throw new Error("Expected expanded maker panels to use in-panel buttons instead of dropdown selects");
  }
  await assertMakerNoticeCoversSelection(page, '[data-fill-mode="pattern"]');
  const gridEnabledInPattern = await page.locator("#gridSelect").isEnabled();
  if (!gridEnabledInPattern) throw new Error("Expected Grid select to be enabled in pattern fill mode");
  await clickMakerControl(page, '[data-fill-mode="single"]');
  const simulationCards = await page.locator(".simulation-card").count();
  if (simulationCards < 5) throw new Error(`Expected swipeable simulation cards, got ${simulationCards}`);
  await assertSimulationStripAndPopup(page);
  await assertSimulationRefreshChangesSkins(page);
  const designSlots = await page.locator(".design-slot").count();
  if (designSlots < 1) throw new Error("Expected at least one theme design slot");
  await assertStableMakerRegions(page);
  await assertViewActionLayout(page);
  await assertPickerCloseButton(page);

  await clickMakerControl(page, '[data-tool="dot"]');
  await page.locator(".dot-grid-picker summary").click();
  await page.locator('[data-dot-grid="8"]').click();
  await page.locator("#dotZoom").fill("1.8");
  await page.locator(".dot-type-picker summary").click();
  await page.locator('[data-dot-type="cross"]').click();
  const dotBox = await page.locator("#dotEditorWrap").boundingBox();
  if (!dotBox || Math.abs(dotBox.width - dotBox.height) > 1) {
    throw new Error(`Expected square dot editor, got ${dotBox && dotBox.width}x${dotBox && dotBox.height}`);
  }
  await page.locator(".dot-color-picker summary").click();
  await page.locator('.dot-panel .swatch[data-color="#2ec4b6"]').click();
  await page.locator(".dot-cell").nth(9).click();
  const dotBackground = await page.locator("#cellWorkspace").evaluate((element) => {
    return getComputedStyle(element).backgroundImage;
  });
  if (!dotBackground.includes("data:image")) throw new Error("Expected painted dot texture on workspace cell");
  await page.locator("#dotZoom").fill("2.4");
  await page.locator("#dotEditorWrap").evaluate((element) => {
    element.scrollLeft = element.scrollWidth;
    element.scrollTop = element.scrollHeight;
    element.dispatchEvent(new Event("scroll"));
  });
  const focusVisible = await page.locator("#dotViewportFocus").evaluate((element) => {
    const styles = getComputedStyle(element);
    return styles.width !== "0px" && styles.height !== "0px";
  });
  if (!focusVisible) throw new Error("Expected dot viewport focus indicator");
  await assertDotOverlayUsesWorkspace(page);
  await page.locator("#dotViewportPad").click({ position: { x: 12, y: 12 } });
  await page.locator(".design-slot.is-add-slot").click();
  let designSlotsAfterAdd = await page.locator(".design-slot").count();
  if (designSlotsAfterAdd <= designSlots) throw new Error("Expected a new block slot");
  await page.locator("#deleteDesign").click();
  const designSlotsAfterDelete = await page.locator(".design-slot").count();
  if (designSlotsAfterDelete !== designSlots) throw new Error("Expected Delete to remove the active block slot");
  await page.locator(".design-slot.is-add-slot").click();
  designSlotsAfterAdd = await page.locator(".design-slot").count();

  await clickMakerControl(page, '[data-tool="draw"]');
  const drawVisible = await page.locator(".draw-panel").isVisible();
  if (!drawVisible) throw new Error("Expected drawing panel to be visible after selecting Draw");
  const drawMinZoom = await page.locator("#drawZoom").getAttribute("min");
  if (drawMinZoom !== "1") throw new Error(`Expected drawing zoom-out to stop at 1x, got ${drawMinZoom}`);
  const drawStageBeforeZoom = await page.locator(".draw-canvas-stage").boundingBox();
  await page.locator("#drawZoom").fill("1.4");
  const drawStageAfterZoom = await page.locator(".draw-canvas-stage").boundingBox();
  assertBoxStable(drawStageBeforeZoom, drawStageAfterZoom, "drawing canvas frame");
  const drawZoom = await page.locator("#drawCanvas").evaluate((element) => getComputedStyle(element).transform);
  if (drawZoom === "none") throw new Error("Expected drawing zoom to scale the canvas");
  await assertViewerFocusShrinksWithZoom(page, "draw");
  await page.locator(".draw-shape-picker summary").click();
  await page.locator('[data-draw-shape="rect"]').click();
  await page.locator(".draw-shape-picker summary").click();
  await page.locator('[data-draw-shape="free"]').click();
  const drawBox = await page.locator("#drawCanvas").boundingBox();
  if (!drawBox) throw new Error("Expected drawing canvas");
  await page.mouse.move(drawBox.x + 30, drawBox.y + 35);
  await page.mouse.down();
  await page.mouse.move(drawBox.x + 150, drawBox.y + 150);
  await page.mouse.up();
  await page.waitForFunction(() => {
    return getComputedStyle(document.querySelector("#cellWorkspace")).backgroundImage.includes("data:image");
  });
  const drawingBackground = await page.locator("#cellWorkspace").evaluate((element) => {
    return getComputedStyle(element).backgroundImage;
  });
  if (!drawingBackground.includes("data:image")) throw new Error("Expected drawing texture on workspace cell");
  await clickMakerControl(page, '[data-fill-mode="pattern"]');
  await page.locator("#gridSelect").selectOption("3");
  await page.waitForFunction(() => {
    return getComputedStyle(document.querySelector("#cellWorkspace")).backgroundRepeat.includes("repeat");
  });
  const drawingRepeat = await page.locator("#cellWorkspace").evaluate((element) => {
    return getComputedStyle(element).backgroundRepeat;
  });
  if (!drawingRepeat.includes("repeat")) throw new Error("Expected drawing pattern repeat on workspace cell");
  const drawingPatternPack = await page.evaluate(() => localStorage.getItem("mosaic-blocks-save-v1"));
  if (!drawingPatternPack || !drawingPatternPack.includes('"gridSize":3')) {
    throw new Error("Expected drawing pattern to persist the selected grid size");
  }

  await clickMakerControl(page, '[data-tool="template"]');
  await page.locator(".template-list-picker summary").click();
  await page.locator('[data-texture="stripe"]').click();
  await page.locator(".template-color-picker summary").click();
  await page.locator("#templateColor1").evaluate((element) => {
    element.value = "#2ec4b6";
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.locator(".template-tuning-picker summary").click();
  await assertTemplateTuningPanelLayout(page);
  await page.locator("#templateIntensity").fill("0.9");
  await page.locator("#templateScale").fill("1.5");
  await assertViewerFocusShrinksWithZoom(page, "template");
  const textureBackground = await page.locator("#cellWorkspace").evaluate((element) => {
    return getComputedStyle(element).backgroundImage;
  });
  if (!textureBackground.includes("gradient")) throw new Error("Expected template preset on workspace cell");

  const photoSvg = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="40" height="40" fill="#ff3158"/><rect x="40" width="40" height="40" fill="#18c8b8"/><rect y="40" width="40" height="40" fill="#ffc43d"/><rect x="40" y="40" width="40" height="40" fill="#326dff"/></svg>',
  );
  const fileChooserPromise = page.waitForEvent("filechooser");
  await clickMakerControl(page, '[data-tool="image"]');
  const fileChooser = await fileChooserPromise;
  const imageScaleLabel = await page.locator(".image-scale-control span").textContent();
  if (imageScaleLabel !== "Size") throw new Error(`Expected image scale control to be labeled Size, got ${imageScaleLabel}`);
  await fileChooser.setFiles({
    name: "texture.svg",
    mimeType: "image/svg+xml",
    buffer: photoSvg,
  });
  await assertImageRemoteAligned(page);
  await clickMakerControl(page, '[data-fill-mode="single"]');
  const photoBackground = await page.locator("#cellWorkspace").evaluate((element) => {
    return getComputedStyle(element).backgroundImage;
  });
  if (!photoBackground.includes("data:image")) throw new Error("Expected uploaded photo texture on workspace cell");
  const imageFrameBackground = await page.locator("#imageFrame").evaluate((element) => {
    return getComputedStyle(element).backgroundImage;
  });
  if (!imageFrameBackground.includes("data:image")) throw new Error("Expected uploaded photo texture on image adjustment frame");
  const beforeRemoteSize = await page.locator("#cellWorkspace").evaluate((element) => {
    return getComputedStyle(element).backgroundSize;
  });
  await page.locator("#imageScale").fill("145");
  const afterRemoteSize = await page.locator("#cellWorkspace").evaluate((element) => {
    return getComputedStyle(element).backgroundSize;
  });
  if (afterRemoteSize === beforeRemoteSize) throw new Error("Expected image zoom remote to update background size");
  await assertViewerFocusShrinksWithZoom(page, "image");
  const beforeRemotePosition = await page.locator("#cellWorkspace").evaluate((element) => {
    return getComputedStyle(element).backgroundPosition;
  });
  await page.locator("#imageMoveRight").click();
  const afterRemotePosition = await page.locator("#cellWorkspace").evaluate((element) => {
    return getComputedStyle(element).backgroundPosition;
  });
  if (afterRemotePosition === beforeRemotePosition) throw new Error("Expected image movement remote to update background position");
  const imageFrameBox = await page.locator("#imageFrame").boundingBox();
  if (!imageFrameBox) throw new Error("Expected image frame for image gesture");
  const beforePhotoPosition = await page.locator("#cellWorkspace").evaluate((element) => {
    return getComputedStyle(element).backgroundPosition;
  });
  await page.mouse.move(imageFrameBox.x + 50, imageFrameBox.y + 50);
  await page.mouse.down();
  await page.mouse.move(imageFrameBox.x + 78, imageFrameBox.y + 76);
  await page.mouse.up();
  const adjustedPhotoPosition = await page.locator("#cellWorkspace").evaluate((element) => {
    return getComputedStyle(element).backgroundPosition;
  });
  if (adjustedPhotoPosition === beforePhotoPosition) throw new Error("Expected image drag gesture to update background position");
  const storedSkinPack = await page.evaluate(() => localStorage.getItem("mosaic-blocks-save-v1"));
  if (!storedSkinPack || !storedSkinPack.includes('"designs"') || !storedSkinPack.includes('"src"')) {
    throw new Error("Expected uploaded photo to be saved in the draft block design");
  }
  await clickMakerControl(page, '[data-fill-mode="pattern"]');
  await page.locator("#gridSelect").selectOption("3");
  const imagePatternPack = await page.evaluate(() => localStorage.getItem("mosaic-blocks-save-v1"));
  if (!imagePatternPack || !imagePatternPack.includes('"gridSize":3')) {
    throw new Error("Expected uploaded image pattern to persist the selected grid size");
  }

  await page.locator("#applyTool").click();
  await page.locator(".design-slot.is-active").click();
  await clickMakerControl(page, '[data-tool="draw"]');
  await assertDrawingCanvasHasMergedBase(page);
  const mergeDrawBox = await page.locator("#drawCanvas").boundingBox();
  if (!mergeDrawBox) throw new Error("Expected drawing canvas for merged image editing");
  await page.mouse.move(mergeDrawBox.x + 24, mergeDrawBox.y + 24);
  await page.mouse.down();
  await page.mouse.move(mergeDrawBox.x + 80, mergeDrawBox.y + 76);
  await page.mouse.up();
  await page.waitForFunction(() => {
    return (localStorage.getItem("mosaic-blocks-save-v1") || "").includes('"source":"drawing"');
  });
  const mergedDrawingPack = await page.evaluate(() => localStorage.getItem("mosaic-blocks-save-v1"));
  if (!mergedDrawingPack || !mergedDrawingPack.includes('"source":"drawing"')) {
    throw new Error("Expected drawing over a saved image block to persist as a merged drawing");
  }

  await clickMakerControl(page, '[data-tool="erase"]');
  await page.locator("#eraserZoom").fill("1.6");
  await assertViewerFocusShrinksWithZoom(page, "erase");
  await page.locator("#eraserSize").fill("42");
  await page.locator(".eraser-shape-picker summary").click();
  await page.locator('[data-eraser-shape="square"]').click();
  const eraserBox = await page.locator("#eraserCanvas").boundingBox();
  if (!eraserBox) throw new Error("Expected eraser canvas");
  await page.mouse.move(eraserBox.x + eraserBox.width / 2, eraserBox.y + eraserBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(eraserBox.x + eraserBox.width / 2 + 18, eraserBox.y + eraserBox.height / 2 + 18);
  await page.mouse.up();
  const erasedPack = await page.evaluate(() => localStorage.getItem("mosaic-blocks-save-v1"));
  if (!erasedPack || !erasedPack.includes('"source":"eraser"')) throw new Error("Expected eraser to update current design");
  await page.locator("#applyTool").click();
  const committedBlockSource = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("mosaic-blocks-save-v1") || "{}");
    return saved.designs && saved.designs[saved.activeDesignIndex] && saved.designs[saved.activeDesignIndex].source;
  });
  if (committedBlockSource !== "eraser") throw new Error("Expected Save to commit the erased draft block slot");
  const draftClosed = await page.locator("#cellWorkspace").evaluate((element) => {
    return element.classList.contains("is-draft-empty") && element.disabled;
  });
  if (!draftClosed) throw new Error("Expected Block Save to close the draft workspace");
  await page.locator(".design-slot").nth(0).click();
  const draftReopened = await page.locator("#cellWorkspace").evaluate((element) => {
    return !element.classList.contains("is-draft-empty") && !element.disabled;
  });
  if (!draftReopened) throw new Error("Expected selecting a block slot to reopen editing");
  await page.locator("#savePack").click();
  await page.locator("#themeDialog").waitFor({ state: "visible" });
  await page.locator("#themeDialogActions button").nth(1).click();
  await page.locator("#themeDialogBody input").fill("Smoke Theme");
  await page.locator("#themeDialogActions button").nth(1).click();
  await page.locator("#themeDialog").waitFor({ state: "hidden" });
  const savedLibrary = await page.evaluate(() => {
    const themes = JSON.parse(localStorage.getItem("mosaic-blocks-theme-library-v1") || "[]");
    return themes.length === 1 && themes[0].name === "Smoke Theme" && themes[0].updatedAt && themes[0].payload;
  });
  if (!savedLibrary) throw new Error("Expected Save As to create a named theme in the theme library");

  await page.locator("#savePack").click();
  await page.locator("#themeDialog").waitFor({ state: "visible" });
  await page.locator("#themeDialogActions button").nth(0).click();
  await page.locator("#themeDialogActions button").nth(1).click();
  await page.locator("#themeDialog").waitFor({ state: "hidden" });

  await clickMakerControl(page, '[data-tool="draw"]');
  await page.locator("#drawZoom").fill("1.7");
  await page.locator("#loadTheme").click();
  await page.locator("#themeStartPanel").waitFor({ state: "visible" });
  const themeItem = page.locator(".theme-library-item").first();
  const themeLabel = await themeItem.locator("strong").textContent();
  const themeSavedAt = await themeItem.locator("span").textContent();
  if (themeLabel !== "Smoke Theme" || !themeSavedAt) throw new Error("Expected theme list to show name and last saved time");
  await themeItem.click();
  await page.locator("#themeDialog").waitFor({ state: "visible" });
  await page.locator("#themeDialogActions button").nth(1).click();
  await page.locator("#themeDialog").waitFor({ state: "hidden" });
  await page.locator("#themeStartPanel").waitFor({ state: "hidden" });
  const completedTheme = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("mosaic-blocks-save-v1") || "{}");
    const themes = JSON.parse(localStorage.getItem("mosaic-blocks-theme-library-v1") || "[]");
    return (
      saved.skinPack &&
      saved.skinPack.kind === "cells" &&
      Array.isArray(saved.skinPack.cells) &&
      saved.currentThemeName === "Smoke Theme" &&
      themes.length === 1
    );
  });
  if (!completedTheme) throw new Error("Expected Theme Save/Load to persist a named cell theme pack");

  await page.locator('[data-view-button="play"]').click();
  await page.locator(".play-area").waitFor({ state: "visible" });
  const beforeScore = Number(await page.locator("#score").textContent());
  let placed = false;
  for (let index = 0; index < boardCells; index += 1) {
    await page.locator(".board-cell").nth(index).click();
    await page.waitForTimeout(260);
    const nextScore = Number(await page.locator("#score").textContent());
    if (nextScore > beforeScore) {
      placed = true;
      break;
    }
  }
  if (!placed) throw new Error("Expected to find a valid placement");
  const filled = await page.locator(".board-cell.is-filled").count();
  const usedPieces = await page.locator(".piece-card.is-used").count();
  const score = Number(await page.locator("#score").textContent());
  if (filled < 1) throw new Error("Expected placed block cells on board");
  if (usedPieces !== 1) throw new Error(`Expected one used piece after one placement, got ${usedPieces}`);
  if (score <= 0) throw new Error(`Expected score > 0, got ${score}`);
  if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);

  await page.screenshot({ path: "playwright-smoke.png", fullPage: true });
  await page.close();

  return {
    boardCells,
    pieceCards,
    initialFilled,
    toolCount,
    fillModeCount,
    fillGridCount,
    simulationCards,
    designSlots: designSlotsAfterAdd,
    filled,
    usedPieces,
    score,
  };
}

async function assertStableMakerRegions(page) {
  const regionSelectors = [".selection-panel", ".block-design-panel", ".block-slot-panel", ".simulation-panel", ".theme-panel"];
  await clickMakerControl(page, '[data-tool="draw"]');
  const baseline = await measureRegions(page, regionSelectors);
  for (const tool of ["dot", "template", "image", "erase", "draw"]) {
    await clickMakerControl(page, `[data-tool="${tool}"]`);
    const next = await measureRegions(page, regionSelectors);
    regionSelectors.forEach((selector) => {
      const delta = Math.abs(next[selector].height - baseline[selector].height);
      if (delta > 1) {
        throw new Error(`${selector} height shifted by ${delta}px after selecting ${tool}`);
      }
    });
  }
}

async function assertViewActionLayout(page) {
  const workspace = await page.locator("#cellWorkspace").boundingBox();
  const undo = await page.locator("#undoTool").boundingBox();
  const redo = await page.locator("#redoTool").boundingBox();
  const reset = await page.locator("#resetTool").boundingBox();
  const apply = await page.locator("#applyTool").boundingBox();
  if (!workspace || !undo || !redo || !reset || !apply) {
    throw new Error("Expected view action layout boxes");
  }
  if (undo.x + undo.width > workspace.x || redo.x + redo.width > workspace.x) {
    throw new Error("Expected undo/redo controls to sit left of the viewer");
  }
  if (reset.x < workspace.x + workspace.width || apply.x < workspace.x + workspace.width) {
    throw new Error("Expected reset/apply controls to sit right of the viewer");
  }
  const centers = [undo, redo, reset, apply].map((box) => Math.round(box.y + box.height / 2));
  const workspaceCenter = Math.round(workspace.y + workspace.height / 2);
  if (centers.some((center) => Math.abs(center - workspaceCenter) > 8)) {
    throw new Error("Expected view actions to share one row with the viewer");
  }
}

async function assertPickerCloseButton(page) {
  await page.locator(".draw-color-picker summary").click();
  const closeButton = page.locator(".draw-color-picker .picker-close");
  await closeButton.waitFor({ state: "visible" });
  await closeButton.click();
  const stillOpen = await page.locator(".draw-color-picker").evaluate((element) => element.open);
  if (stillOpen) throw new Error("Expected panel close button to close the expanded picker");
}

async function assertTemplateTuningPanelLayout(page) {
  const metrics = await page.locator(".template-tuning-panel").evaluate((panel) => {
    const panelBox = panel.getBoundingClientRect();
    const controls = Array.from(panel.querySelectorAll(".compact-control")).map((control) => {
      const box = control.getBoundingClientRect();
      return {
        top: box.top,
        bottom: box.bottom,
        height: box.height,
      };
    });
    return {
      panelTop: panelBox.top,
      panelBottom: panelBox.bottom,
      panelHeight: panelBox.height,
      controls,
    };
  });
  if (metrics.controls.length !== 2) throw new Error("Expected two template tuning controls");
  const inside = metrics.controls.every((control) => control.top >= metrics.panelTop - 1 && control.bottom <= metrics.panelBottom + 1);
  if (!inside) throw new Error(`Expected tuning controls inside panel: ${JSON.stringify(metrics)}`);
  if (metrics.controls.some((control) => control.height < 32)) {
    throw new Error(`Expected usable tuning control heights: ${JSON.stringify(metrics.controls)}`);
  }
  if (metrics.controls[0].bottom > metrics.controls[1].top) {
    throw new Error(`Expected tuning controls not to overlap: ${JSON.stringify(metrics.controls)}`);
  }
}

async function assertSimulationStripAndPopup(page) {
  const track = await page.locator("#simulationTrack").boundingBox();
  const first = await page.locator(".simulation-card").nth(0).boundingBox();
  const fifth = await page.locator(".simulation-card").nth(4).boundingBox();
  if (!track || !first || !fifth) throw new Error("Expected simulation strip layout boxes");
  if (fifth.x + fifth.width > track.x + track.width + 3) {
    throw new Error("Expected about five simulation cards to be visible at once");
  }
  const visibleShapeSignatures = await page.locator(".simulation-card").evaluateAll((cards) => {
    return cards.slice(0, 5).map((card) => {
      return Array.from(card.querySelectorAll(".piece-cell"))
        .map((cell, index) => (cell.classList.contains("is-filled") ? String(index) : ""))
        .filter(Boolean)
        .join(",");
    });
  });
  if (new Set(visibleShapeSignatures).size < 4) {
    throw new Error(`Expected visible simulation cards to show varied shapes, got ${visibleShapeSignatures.join(" | ")}`);
  }
  const simulationCellCounts = await page.locator(".simulation-card").evaluateAll((cards) => {
    return cards.slice(0, 5).map((card) => card.querySelectorAll(".simulation-piece-grid .piece-cell").length);
  });
  if (simulationCellCounts.some((count) => count >= 25)) {
    throw new Error(`Expected simulation to render compact shape bounds, got cell counts ${simulationCellCounts.join(",")}`);
  }
  const beforeScroll = await page.locator("#simulationTrack").evaluate((element) => element.scrollLeft);
  await page.locator("#simulationTrack").evaluate((element) => {
    element.scrollLeft = element.scrollWidth;
  });
  const afterScroll = await page.locator("#simulationTrack").evaluate((element) => element.scrollLeft);
  if (afterScroll <= beforeScroll) throw new Error("Expected simulation strip to support horizontal swipe");
  await page.locator("#simulationTrack").evaluate((element) => {
    element.scrollLeft = 0;
  });

  await page.locator(".simulation-card").first().click();
  await page.locator("#simulationPreview").waitFor({ state: "visible" });
  await page.locator("#simulationPreviewCard").click();
  await page.locator("#simulationPreview").waitFor({ state: "hidden" });

  await page.locator(".simulation-card").first().click();
  await page.locator("#simulationPreview").waitFor({ state: "visible" });
  await page.locator("#simulationPreviewClose").click();
  await page.locator("#simulationPreview").waitFor({ state: "hidden" });
}

async function assertSimulationRefreshChangesSkins(page) {
  const before = await page.locator("#simulationTrack").evaluate((element) => element.innerHTML);
  let changed = false;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await page.locator("#refreshSimulation").click();
    const after = await page.locator("#simulationTrack").evaluate((element) => element.innerHTML);
    if (after !== before) {
      changed = true;
      break;
    }
  }
  if (!changed) throw new Error("Expected simulation refresh to reshuffle block skins");
}

function assertBoxStable(before, after, label) {
  if (!before || !after) throw new Error(`Expected ${label} layout boxes`);
  const delta =
    Math.abs(before.width - after.width) +
    Math.abs(before.height - after.height) +
    Math.abs(before.x - after.x) +
    Math.abs(before.y - after.y);
  if (delta > 2) throw new Error(`Expected ${label} to stay fixed after zoom, delta ${delta}`);
}

async function assertImageRemoteAligned(page) {
  const frame = await page.locator("#imageFrame").boundingBox();
  const remote = await page.locator(".image-remote").boundingBox();
  if (!frame || !remote) throw new Error("Expected image frame and remote layout boxes");
  const topDelta = Math.abs(frame.y - remote.y);
  const heightDelta = Math.abs(frame.height - remote.height);
  if (topDelta > 6 || heightDelta > 8) {
    throw new Error(`Expected image remote to align with the canvas, top ${topDelta}, height ${heightDelta}`);
  }
}

async function assertDrawingCanvasHasMergedBase(page) {
  await page.waitForFunction(() => {
    const canvas = document.getElementById("drawCanvas");
    if (!canvas) return false;
    const context = canvas.getContext("2d");
    const samplePoints = [
      [Math.round(canvas.width * 0.25), Math.round(canvas.height * 0.25)],
      [Math.round(canvas.width * 0.75), Math.round(canvas.height * 0.25)],
      [Math.round(canvas.width * 0.25), Math.round(canvas.height * 0.75)],
      [Math.round(canvas.width * 0.75), Math.round(canvas.height * 0.75)],
    ];
    return samplePoints.some(([x, y]) => {
      const [red, green, blue, alpha] = context.getImageData(x, y, 1, 1).data;
      const isBlankBase = Math.abs(red - 223) < 4 && Math.abs(green - 230) < 4 && Math.abs(blue - 220) < 4;
      return alpha > 0 && !isBlankBase;
    });
  });
}

async function assertDotOverlayUsesWorkspace(page) {
  const workspace = await page.locator("#cellWorkspace").boundingBox();
  const pad = await page.locator("#dotViewportPad").boundingBox();
  if (!workspace || !pad) throw new Error("Expected dot overlay and workspace boxes");
  const sizeDelta = Math.abs(workspace.width - pad.width) + Math.abs(workspace.height - pad.height);
  const positionDelta = Math.abs(workspace.x - pad.x) + Math.abs(workspace.y - pad.y);
  if (sizeDelta > 2 || positionDelta > 2) {
    throw new Error(`Expected dot viewport to overlay workspace, size ${sizeDelta}, position ${positionDelta}`);
  }
  const padBackground = await page.locator("#dotViewportPad").evaluate((element) => getComputedStyle(element).backgroundImage);
  if (padBackground !== "none") throw new Error(`Expected transparent dot viewport overlay, got ${padBackground}`);
}

async function assertViewerFocusShrinksWithZoom(page, label) {
  const workspace = await page.locator("#cellWorkspace").boundingBox();
  const focus = await page.locator("#dotViewportFocus").boundingBox();
  const visible = await page.locator("#dotViewportFocus").evaluate((element) => {
    const styles = getComputedStyle(element);
    return styles.display !== "none" && styles.width !== "0px" && styles.height !== "0px";
  });
  if (!workspace || !focus || !visible) throw new Error(`Expected ${label} zoom focus overlay`);
  if (focus.width >= workspace.width - 4 || focus.height >= workspace.height - 4) {
    throw new Error(`Expected ${label} zoom focus to shrink inside the viewer`);
  }
}

async function clickMakerControl(page, selector) {
  await waitForMakerNoticeHidden(page);
  await page.locator(selector).click();
  await page.locator("#makerNotice").waitFor({ state: "visible", timeout: 350 }).catch(() => {});
  await waitForMakerNoticeHidden(page);
}

async function assertMakerNoticeCoversSelection(page, selector) {
  await waitForMakerNoticeHidden(page);
  await page.locator(selector).click();
  await page.locator("#makerNotice").waitFor({ state: "visible" });
  const selectionBox = await page.locator(".selection-panel").boundingBox();
  const noticeBox = await page.locator("#makerNotice").boundingBox();
  if (!selectionBox || !noticeBox) throw new Error("Expected maker notice and selection panel boxes");
  const sizeDelta = Math.abs(selectionBox.width - noticeBox.width) + Math.abs(selectionBox.height - noticeBox.height);
  if (sizeDelta > 2) throw new Error(`Expected maker notice to cover selection panel, delta ${sizeDelta}`);
  const noticeBackground = await page.locator("#makerNotice").evaluate((element) => getComputedStyle(element).backgroundColor);
  if (!noticeBackground.includes("255, 255, 255")) throw new Error(`Expected opaque maker notice background, got ${noticeBackground}`);
  await waitForMakerNoticeHidden(page);
}

async function waitForMakerNoticeHidden(page) {
  await page.locator("#makerNotice").waitFor({ state: "hidden", timeout: 1500 }).catch(() => {});
}

async function measureRegions(page, selectors) {
  const entries = {};
  for (const selector of selectors) {
    const box = await page.locator(selector).boundingBox();
    if (!box) throw new Error(`Expected ${selector} to have a layout box`);
    entries[selector] = { width: Math.round(box.width), height: Math.round(box.height) };
  }
  return entries;
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
