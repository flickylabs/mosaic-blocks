(function () {
  "use strict";

  const BOARD_SIZE = 8;
  const EDITOR_SIZE = 5;
  const START_FILL_MIN = 12;
  const START_FILL_VARIANCE = 5;
  const STORAGE_KEY = "mosaic-blocks-save-v1";
  const THEME_LIBRARY_KEY = "mosaic-blocks-theme-library-v1";
  const PATTERN_GRID_OPTIONS = [2, 3, 4, 5];
  const FILL_GRID_OPTIONS = [1, ...PATTERN_GRID_OPTIONS];
  const DEFAULT_FILL_GRID = 1;
  const DEFAULT_PATTERN_GRID = 3;
  const DOT_GRID_OPTIONS = [8, 10, 12, 16, 20, 24];
  const DEFAULT_DOT_GRID = 12;
  const DEFAULT_DOT_ZOOM = 1.2;
  const DOT_TYPE_OPTIONS = ["single", "cross", "square", "diamond", "checker"];
  const DEFAULT_DOT_TYPE = "single";
  const DEFAULT_PHOTO_SCALE = 100;
  const DEFAULT_PHOTO_OFFSET = 50;
  const DEFAULT_DRAW_ZOOM = 1;
  const DEFAULT_SHAPE_SIZE = 92;
  const DEFAULT_OUTLINE_WIDTH = 5;
  const DEFAULT_TEMPLATE_COLORS = ["#28d7ff", "#8b5cf6", "#ff4ecd", "#ffffff"];
  const DEFAULT_TEMPLATE_INTENSITY = 0.72;
  const DEFAULT_TEMPLATE_SCALE = 1;
  const DEFAULT_ERASER_SIZE = 30;
  const DEFAULT_ERASER_ZOOM = 1;
  const DEFAULT_ERASER_SHAPE = "circle";
  const ERASER_SHAPES = ["circle", "square", "diamond"];

  const SHAPES = [
    [[0, 0]],
    [[0, 0], [1, 0]],
    [[0, 0], [0, 1]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 0], [0, 1], [0, 2]],
    [[0, 0], [1, 0], [0, 1]],
    [[0, 0], [1, 0], [1, 1]],
    [[1, 0], [0, 1], [1, 1]],
    [[0, 0], [0, 1], [1, 1]],
    [[0, 0], [1, 0], [2, 0], [3, 0]],
    [[0, 0], [0, 1], [0, 2], [0, 3]],
    [[0, 0], [1, 0], [0, 1], [1, 1]],
    [[0, 0], [1, 0], [2, 0], [1, 1]],
    [[1, 0], [0, 1], [1, 1], [2, 1]],
    [[0, 0], [0, 1], [0, 2], [1, 2]],
    [[1, 0], [1, 1], [1, 2], [0, 2]],
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [0, 1], [1, 1]],
    [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]],
    [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2]],
    [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
    [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
    [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]],
    [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2]],
    [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [2, 0], [3, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [3, 1]],
  ];

  const DEFAULT_COLORS = [
    "#ff6b6b",
    "#2ec4b6",
    "#ffca3a",
    "#6a4c93",
    "#3a86ff",
    "#1f2933",
  ];

  const DEFAULT_DESIGNS = DEFAULT_COLORS.slice(0, 4).map((color) => ({ kind: "color", color }));

  const SIMULATION_SHAPES = [
    [[0, 0], [1, 0], [0, 1], [1, 1]],
    [[0, 0], [1, 0], [2, 0], [1, 1]],
    [[0, 0], [0, 1], [0, 2], [1, 2]],
    [[0, 0], [1, 0], [2, 0], [3, 0]],
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]],
  ].map(normalizeShape);

  const TEXTURES = {
    neon: {
      label: "네온",
      color: "#28d7ff",
      image:
        "linear-gradient(135deg, rgba(255,255,255,0.52), rgba(255,255,255,0) 34%), radial-gradient(circle at 30% 28%, #90fff4, transparent 28%), linear-gradient(135deg, #2176ff, #8b5cf6 58%, #ff4ecd)",
    },
    candy: {
      label: "캔디",
      color: "#ff5d67",
      image:
        "repeating-linear-gradient(135deg, rgba(255,255,255,0.42) 0 9px, rgba(255,255,255,0) 9px 18px), linear-gradient(135deg, #ff5d67, #ffc43d)",
    },
    stone: {
      label: "스톤",
      color: "#697586",
      image:
        "radial-gradient(circle at 22% 28%, rgba(255,255,255,0.28), transparent 20%), radial-gradient(circle at 70% 64%, rgba(0,0,0,0.24), transparent 24%), linear-gradient(135deg, #8b97a8, #4b5563)",
    },
    stripe: {
      label: "스트라이프",
      color: "#2ec4b6",
      image: "repeating-linear-gradient(135deg, #2ec4b6 0 10px, #ffffff 10px 16px, #ff6b6b 16px 26px)",
    },
    dotPop: {
      label: "도트팝",
      color: "#ff6b6b",
      image: "radial-gradient(circle, #ffffff 0 18%, transparent 20%), linear-gradient(135deg, #ff6b6b, #ffca3a)",
    },
    glass: {
      label: "글래스",
      color: "#3a86ff",
      image: "linear-gradient(135deg, rgba(255,255,255,0.66), rgba(255,255,255,0.04)), linear-gradient(135deg, #3a86ff, #2ec4b6)",
    },
    carbon: {
      label: "카본",
      color: "#1f2933",
      image: "repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0 6px, transparent 6px 12px), linear-gradient(135deg, #1f2933, #52606d)",
    },
    wave: {
      label: "웨이브",
      color: "#3a86ff",
      image: "radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.5), transparent 35%), repeating-linear-gradient(90deg, #3a86ff 0 12px, #6a4c93 12px 24px)",
    },
  };

  const els = {
    workshop: document.querySelector(".workshop"),
    appShell: document.getElementById("appShell"),
    board: document.getElementById("board"),
    boardWrap: document.querySelector(".board-wrap"),
    feedbackLayer: document.getElementById("feedbackLayer"),
    score: document.getElementById("score"),
    bestScore: document.getElementById("bestScore"),
    combo: document.getElementById("combo"),
    pieceTray: document.getElementById("pieceTray"),
    statusText: document.getElementById("statusText"),
    makerNotice: document.getElementById("makerNotice"),
    editorGrid: document.getElementById("editorGrid"),
    newGame: document.getElementById("newGame"),
    restartFromOverlay: document.getElementById("restartFromOverlay"),
    gameMessage: document.getElementById("gameMessage"),
    modeButtons: Array.from(document.querySelectorAll("button[data-tool]")),
    fillModeButtons: Array.from(document.querySelectorAll("button[data-fill-mode]")),
    gridSelect: document.getElementById("gridSelect"),
    fillGridButtons: Array.from(document.querySelectorAll("[data-fill-grid]")),
    swatches: Array.from(document.querySelectorAll(".swatch")),
    colorPicker: document.getElementById("colorPicker"),
    photoInput: document.getElementById("photoInput"),
    applyPhoto: document.getElementById("applyPhoto"),
    applyImagePattern: document.getElementById("applyImagePattern"),
    imageFrame: document.getElementById("imageFrame"),
    imageScale: document.getElementById("imageScale"),
    imageCenter: document.getElementById("imageCenter"),
    imageMoveLeft: document.getElementById("imageMoveLeft"),
    imageMoveRight: document.getElementById("imageMoveRight"),
    imageMoveUp: document.getElementById("imageMoveUp"),
    imageMoveDown: document.getElementById("imageMoveDown"),
    photoScale: document.getElementById("photoScale"),
    photoOffsetX: document.getElementById("photoOffsetX"),
    photoOffsetY: document.getElementById("photoOffsetY"),
    dotGridButtons: Array.from(document.querySelectorAll("[data-dot-grid]")),
    dotTypeButtons: Array.from(document.querySelectorAll("[data-dot-type]")),
    dotZoom: document.getElementById("dotZoom"),
    dotEditorWrap: document.getElementById("dotEditorWrap"),
    dotEditor: document.getElementById("dotEditor"),
    dotColorPicker: document.getElementById("dotColorPicker"),
    dotGridValue: document.getElementById("dotGridValue"),
    dotViewportPad: document.getElementById("dotViewportPad"),
    dotViewportFocus: document.getElementById("dotViewportFocus"),
    themeStartPanel: document.getElementById("themeStartPanel"),
    newTheme: document.getElementById("newTheme"),
    themeLibraryList: document.getElementById("themeLibraryList"),
    loadTheme: document.getElementById("loadTheme"),
    savePack: document.getElementById("savePack"),
    commitDesign: document.getElementById("commitDesign"),
    drawCanvas: document.getElementById("drawCanvas"),
    drawZoom: document.getElementById("drawZoom"),
    brushSize: document.getElementById("brushSize"),
    shapeSize: document.getElementById("shapeSize"),
    outlineButtons: Array.from(document.querySelectorAll("[data-outline-width]")),
    outlineWidthValue: document.getElementById("outlineWidthValue"),
    drawColorChip: document.getElementById("drawColorChip"),
    drawShapeValue: document.getElementById("drawShapeValue"),
    dotColorChip: document.getElementById("dotColorChip"),
    dotTypeValue: document.getElementById("dotTypeValue"),
    templateNameValue: document.getElementById("templateNameValue"),
    templateColorValue: document.getElementById("templateColorValue"),
    templateTuningValue: document.getElementById("templateTuningValue"),
    templateFrame: document.getElementById("templateFrame"),
    templateZoom: document.getElementById("templateZoom"),
    templateColorInputs: [
      document.getElementById("templateColor1"),
      document.getElementById("templateColor2"),
      document.getElementById("templateColor3"),
      document.getElementById("templateColor4"),
    ],
    templateIntensity: document.getElementById("templateIntensity"),
    templateScale: document.getElementById("templateScale"),
    eraserZoom: document.getElementById("eraserZoom"),
    eraserCanvas: document.getElementById("eraserCanvas"),
    eraserShapeButtons: Array.from(document.querySelectorAll("[data-eraser-shape]")),
    eraserShapeValue: document.getElementById("eraserShapeValue"),
    clearDrawing: document.getElementById("clearDrawing"),
    applyDrawing: document.getElementById("applyDrawing"),
    applyDrawingPattern: document.getElementById("applyDrawingPattern"),
    eraserSize: document.getElementById("eraserSize"),
    cellWorkspace: document.getElementById("cellWorkspace"),
    designSlots: document.getElementById("designSlots"),
    deleteDesign: document.getElementById("deleteDesign"),
    resetTool: document.getElementById("resetTool"),
    undoTool: document.getElementById("undoTool"),
    redoTool: document.getElementById("redoTool"),
    applyTool: document.getElementById("applyTool"),
    refreshSimulation: document.getElementById("refreshSimulation"),
    simulationTrack: document.getElementById("simulationTrack"),
    simulationPreview: document.getElementById("simulationPreview"),
    simulationPreviewClose: document.getElementById("simulationPreviewClose"),
    simulationPreviewCard: document.getElementById("simulationPreviewCard"),
    textureButtons: Array.from(document.querySelectorAll("[data-texture]")),
    shapeButtons: Array.from(document.querySelectorAll("[data-draw-shape]")),
    viewButtons: Array.from(document.querySelectorAll("[data-view-button]")),
    dragGhost: document.getElementById("dragGhost"),
    themeDialog: document.getElementById("themeDialog"),
    themeDialogTitle: document.getElementById("themeDialogTitle"),
    themeDialogBody: document.getElementById("themeDialogBody"),
    themeDialogActions: document.getElementById("themeDialogActions"),
  };

  const state = {
    board: [],
    pieces: [],
    selectedPieceId: null,
    score: 0,
    bestScore: 0,
    combo: 0,
    mode: "draw",
    fillMode: "single",
    activeColor: DEFAULT_COLORS[0],
    activePattern: "neon",
    activeDrawShape: "free",
    drawZoom: DEFAULT_DRAW_ZOOM,
    shapeSize: DEFAULT_SHAPE_SIZE,
    outlineWidth: DEFAULT_OUTLINE_WIDTH,
    templateColors: DEFAULT_TEMPLATE_COLORS.slice(),
    templateIntensity: DEFAULT_TEMPLATE_INTENSITY,
    templateScale: DEFAULT_TEMPLATE_SCALE,
    eraserZoom: DEFAULT_ERASER_ZOOM,
    eraserShape: DEFAULT_ERASER_SHAPE,
    eraserRenderToken: 0,
    photoSrc: "",
    fillGrid: DEFAULT_FILL_GRID,
    patternGrid: DEFAULT_PATTERN_GRID,
    eraserSize: 1,
    activeDesignIndex: 0,
    designs: DEFAULT_DESIGNS.map(cloneSkin),
    draftActive: true,
    draftDesign: cloneSkin(DEFAULT_DESIGNS[0]),
    photoScale: DEFAULT_PHOTO_SCALE,
    photoOffsetX: DEFAULT_PHOTO_OFFSET,
    photoOffsetY: DEFAULT_PHOTO_OFFSET,
    dotGridSize: DEFAULT_DOT_GRID,
    dotZoom: DEFAULT_DOT_ZOOM,
    dotType: DEFAULT_DOT_TYPE,
    dotPixels: makeBlankDotPixels(DEFAULT_DOT_GRID),
    dotPainting: false,
    draftHistory: [],
    draftFuture: [],
    imagePointers: new Map(),
    imageGesture: null,
    imageGestureTarget: null,
    erasing: false,
    skinPack: makeCellsPack(DEFAULT_DESIGNS),
    drag: null,
    drawing: false,
    drawingLiveFrame: 0,
    drawStart: null,
    drawSnapshot: null,
    drawContext: null,
    drawRenderToken: 0,
    drawHydratePromise: null,
    themeLibrary: [],
    currentThemeId: "",
    currentThemeName: "새 테마",
    themeDirty: false,
    themeStartOpen: false,
    hasOpenedMaker: false,
    simulationSeed: 0,
    gameOver: false,
    resolving: false,
    audioContext: null,
    makerNoticeTimer: null,
    view: "play",
  };

  function boot() {
    loadSave();
    state.themeLibrary = loadThemeLibrary();
    buildBoard();
    setupPickerCloseButtons();
    bindEvents();
    setupDrawingCanvas();
    setupDotEditor();
    setupEraserCanvas();
    syncPhotoControls();
    syncDotControls();
    syncDrawControls();
    syncTemplateControls();
    syncEraserControls();
    syncFillModeButtons();
    syncFillGridButtons();
    syncShapeButtons();
    syncWorkshopState();
    renderThemeLibrary();
    startNewGame();
  }

  function loadSave() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      state.bestScore = Number(saved.bestScore) || 0;
      state.currentThemeId = typeof saved.currentThemeId === "string" ? saved.currentThemeId : "";
      state.currentThemeName = typeof saved.currentThemeName === "string" && saved.currentThemeName.trim() ? saved.currentThemeName : "새 테마";
      state.themeDirty = Boolean(saved.themeDirty);
      const savedPack = normalizeSkinPack(saved.skinPack);
      const savedDesigns = normalizeDesigns(saved.designs);
      if (savedDesigns.length) {
        state.designs = savedDesigns;
      } else if (savedPack) {
        state.designs = designsFromPack(savedPack);
      }
      state.activeDesignIndex = clampDesignIndex(saved.activeDesignIndex);
      state.draftActive = saved.draftActive === undefined ? true : Boolean(saved.draftActive);
      state.draftDesign = state.draftActive
        ? saved.draftDesign && typeof saved.draftDesign === "object"
          ? cloneSkin(saved.draftDesign)
          : cloneSkin(state.designs[state.activeDesignIndex])
        : null;
      state.skinPack = makeCellsPack(state.designs);
      const packGrid = getSkinPackGridSize(state.skinPack);
      state.patternGrid = normalizePatternGrid(saved.patternGrid, packGrid > 1 ? packGrid : DEFAULT_PATTERN_GRID);
      state.fillMode = saved.fillMode === "pattern" || packGrid > 1 ? "pattern" : "single";
      state.fillGrid = state.fillMode === "pattern" ? normalizePatternGrid(saved.fillGrid, state.patternGrid) : DEFAULT_FILL_GRID;
      state.eraserSize = normalizeEraserSize(saved.eraserSize);
      state.photoScale = normalizePhotoScale(saved.photoScale);
      state.photoOffsetX = normalizePhotoOffset(saved.photoOffsetX);
      state.photoOffsetY = normalizePhotoOffset(saved.photoOffsetY);
      state.drawZoom = normalizeDrawZoom(saved.drawZoom);
      state.shapeSize = normalizeShapeSize(saved.shapeSize);
      state.outlineWidth = normalizeOutlineWidth(saved.outlineWidth);
      state.activePattern = TEXTURES[saved.activePattern] ? saved.activePattern : state.activePattern;
      state.templateColors = normalizeTemplateColors(saved.templateColors);
      state.templateIntensity = normalizeTemplateIntensity(saved.templateIntensity);
      state.templateScale = normalizeTemplateScale(saved.templateScale);
      state.eraserZoom = normalizeEraserZoom(saved.eraserZoom);
      state.eraserShape = normalizeEraserShape(saved.eraserShape);
      state.dotGridSize = normalizeDotGridSize(saved.dotGridSize);
      state.dotZoom = normalizeDotZoom(saved.dotZoom);
      state.dotType = normalizeDotType(saved.dotType);
      state.dotPixels = normalizeDotPixels(saved.dotPixels, state.dotGridSize);
      hydrateDraftToolState();
      els.eraserSize.value = String(state.eraserSize);
      els.gridSelect.value = String(state.patternGrid);
    } catch (error) {
      state.bestScore = 0;
    }
    els.bestScore.textContent = String(state.bestScore);
  }

  function persist(options = {}) {
    if (state.view === "maker" && options.themeDirty !== false) {
      state.themeDirty = true;
    }
    const payload = {
      bestScore: state.bestScore,
      currentThemeId: state.currentThemeId,
      currentThemeName: state.currentThemeName,
      themeDirty: state.themeDirty,
      ...makeThemePayload(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function makeThemePayload() {
    const designs = normalizeDesigns(state.designs);
    const activeDesignIndex = clampDesignIndex(state.activeDesignIndex);
    return {
      fillMode: state.fillMode,
      fillGrid: state.fillGrid,
      patternGrid: state.patternGrid,
      eraserSize: state.eraserSize,
      activeDesignIndex,
      designs,
      draftActive: state.draftActive,
      draftDesign: state.draftActive ? state.draftDesign : null,
      photoScale: state.photoScale,
      photoOffsetX: state.photoOffsetX,
      photoOffsetY: state.photoOffsetY,
      dotGridSize: state.dotGridSize,
      dotZoom: state.dotZoom,
      dotType: state.dotType,
      dotPixels: state.dotPixels,
      drawZoom: state.drawZoom,
      shapeSize: state.shapeSize,
      outlineWidth: state.outlineWidth,
      activePattern: state.activePattern,
      templateColors: state.templateColors,
      templateIntensity: state.templateIntensity,
      templateScale: state.templateScale,
      eraserZoom: state.eraserZoom,
      eraserShape: state.eraserShape,
      skinPack: makeCellsPack(designs),
    };
  }

  function startNewGame() {
    state.board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    state.score = 0;
    state.combo = 0;
    state.selectedPieceId = null;
    state.gameOver = false;
    state.resolving = false;
    els.gameMessage.hidden = true;
    seedBoard();
    makeTray();
    renderAll();
    showFeedback("READY", "neutral");
    setStatus("3개 중 하나를 고르세요");
  }

  function buildBoard() {
    els.board.innerHTML = "";
    els.board.style.setProperty("--board-size", String(BOARD_SIZE));
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "board-cell";
        cell.dataset.row = String(row);
        cell.dataset.col = String(col);
        cell.setAttribute("aria-label", `${row + 1}행 ${col + 1}열`);
        els.board.appendChild(cell);
      }
    }
  }

  function setupPickerCloseButtons() {
    document.querySelectorAll(".tool-control-stack details.inline-picker, .tool-control-stack details.template-picker").forEach((picker) => {
      if (picker.querySelector(":scope > .picker-close")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "picker-close";
      button.setAttribute("aria-label", "패널 닫기");
      button.textContent = "×";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        picker.open = false;
      });
      picker.appendChild(button);
    });
  }

  function bindEvents() {
    els.newGame.addEventListener("click", startNewGame);
    els.restartFromOverlay.addEventListener("click", startNewGame);
    els.viewButtons.forEach((button) => {
      button.addEventListener("click", () => setView(button.dataset.viewButton));
    });

    els.board.addEventListener("click", (event) => {
      const cell = event.target.closest(".board-cell");
      if (!cell || state.gameOver || state.drag || state.resolving) return;
      const piece = getSelectedPiece();
      if (!piece) {
        selectNextAvailablePiece();
        setStatus("블록 후보를 선택하세요");
        return;
      }
      const row = Number(cell.dataset.row);
      const col = Number(cell.dataset.col);
      tryPlace(piece, row, col);
    });

    els.board.addEventListener("pointermove", (event) => {
      if (!state.drag) return;
      updateDrag(event);
      previewFromPointer(event);
    });

    els.board.addEventListener("pointerleave", clearPreview);
    window.addEventListener("pointermove", (event) => {
      if (!state.drag) return;
      updateDrag(event);
      previewFromPointer(event);
    });
    window.addEventListener("pointerup", (event) => {
      if (!state.drag) return;
      const drop = getBoardCellFromPoint(event.clientX, event.clientY);
      const piece = state.drag.piece;
      if (drop) {
        tryPlace(piece, drop.row, drop.col);
      } else {
        clearPreview();
      }
      endDrag();
    });

    els.modeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const nextTool = button.dataset.tool;
        setTool(nextTool);
        if (nextTool === "image") {
          setStatus("사진을 선택하세요");
          requestPhotoPicker();
        }
      });
    });

    els.fillModeButtons.forEach((button) => {
      button.addEventListener("click", () => setFillMode(button.dataset.fillMode));
    });

    els.gridSelect.addEventListener("change", () => setFillGrid(els.gridSelect.value));

    els.fillGridButtons.forEach((button) => {
      button.addEventListener("click", () => setFillGrid(button.dataset.fillGrid));
    });

    els.swatches.forEach((swatch) => {
      swatch.addEventListener("click", () => {
        setActiveColor(swatch.dataset.color, swatch);
        closeClosestPicker(swatch);
      });
    });

    els.colorPicker.addEventListener("input", () => {
      setActiveColor(els.colorPicker.value, null);
      closeClosestPicker(els.colorPicker);
    });

    els.dotColorPicker.addEventListener("input", () => {
      setActiveColor(els.dotColorPicker.value, null);
      closeClosestPicker(els.dotColorPicker);
    });

    els.photoInput.addEventListener("change", async () => {
      const file = els.photoInput.files && els.photoInput.files[0];
      if (!file) return;
      state.photoSrc = await readImageAsDataUrl(file);
      els.applyPhoto.disabled = false;
      els.applyImagePattern.disabled = false;
      setTool("image");
      applyPhotoPack();
    });

    els.applyPhoto.addEventListener("click", () => {
      applyPhotoPack();
    });

    els.applyImagePattern.addEventListener("click", () => {
      applyImagePatternPack();
    });

    els.imageScale.addEventListener("input", () => {
      adjustImageTransform({ scale: Number(els.imageScale.value) }, "이미지 확대 조정 완료", { transient: true });
    });

    [
      [els.imageMoveLeft, () => adjustImageTransform({ xDelta: -6 }, "이미지 왼쪽 이동 완료")],
      [els.imageMoveRight, () => adjustImageTransform({ xDelta: 6 }, "이미지 오른쪽 이동 완료")],
      [els.imageMoveUp, () => adjustImageTransform({ yDelta: -6 }, "이미지 위로 이동 완료")],
      [els.imageMoveDown, () => adjustImageTransform({ yDelta: 6 }, "이미지 아래로 이동 완료")],
      [els.imageCenter, () => adjustImageTransform({ center: true }, "이미지 중앙 맞춤 완료")],
    ].forEach(([button, handler]) => {
      button.addEventListener("click", handler);
    });

    els.newTheme.addEventListener("click", requestNewTheme);
    els.loadTheme.addEventListener("click", openThemeStartPanel);
    els.savePack.addEventListener("click", openSaveThemeMenu);
    els.refreshSimulation.addEventListener("click", refreshSimulationPreview);
    els.simulationPreviewClose.addEventListener("click", closeSimulationPreview);
    els.simulationPreviewCard.addEventListener("click", closeSimulationPreview);
    els.simulationPreview.addEventListener("click", (event) => {
      if (event.target === els.simulationPreview) closeSimulationPreview();
    });

    els.commitDesign.addEventListener("click", applyCurrentTool);

    els.textureButtons.forEach((button) => {
      button.addEventListener("click", () => {
        state.activePattern = button.dataset.texture;
        setTool("template");
        syncTemplateControls();
        closeClosestPicker(button);
        applyTexturePack(button.dataset.texture);
      });
    });

    els.shapeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        state.activeDrawShape = button.dataset.drawShape || "free";
        syncShapeButtons();
        syncWorkshopState();
        closeClosestPicker(button);
      });
    });

    els.drawZoom.addEventListener("input", () => {
      state.drawZoom = normalizeDrawZoom(els.drawZoom.value);
      syncDrawControls();
      persist();
    });

    els.shapeSize.addEventListener("input", () => {
      state.shapeSize = normalizeShapeSize(els.shapeSize.value);
      persist();
    });

    els.outlineButtons.forEach((button) => {
      button.addEventListener("click", () => {
        state.outlineWidth = normalizeOutlineWidth(button.dataset.outlineWidth);
        syncDrawControls();
        closeClosestPicker(button);
        persist();
      });
    });

    els.templateColorInputs.forEach((input, index) => {
      input.addEventListener("input", () => {
        state.templateColors[index] = input.value;
        syncTemplateControls();
        closeClosestPicker(input);
        applyTexturePack(state.activePattern, { skipHistory: true });
      });
    });

    els.templateIntensity.addEventListener("input", () => {
      state.templateIntensity = normalizeTemplateIntensity(els.templateIntensity.value);
      syncTemplateControls();
      applyTexturePack(state.activePattern, { skipHistory: true });
    });

    els.templateZoom.addEventListener("input", () => {
      state.templateScale = normalizeTemplateScale(els.templateZoom.value);
      syncTemplateControls();
      applyTexturePack(state.activePattern, { skipHistory: true });
    });

    els.templateScale.addEventListener("input", () => {
      state.templateScale = normalizeTemplateScale(els.templateScale.value);
      syncTemplateControls();
      applyTexturePack(state.activePattern, { skipHistory: true });
    });

    els.eraserSize.addEventListener("input", () => {
      state.eraserSize = normalizeEraserSize(els.eraserSize.value);
      syncEraserControls();
      persist();
    });

    els.eraserZoom.addEventListener("input", () => {
      state.eraserZoom = normalizeEraserZoom(els.eraserZoom.value);
      syncEraserControls();
      persist();
    });

    els.eraserShapeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        state.eraserShape = normalizeEraserShape(button.dataset.eraserShape);
        syncEraserControls();
        closeClosestPicker(button);
        persist();
      });
    });

    els.dotGridButtons.forEach((button) => {
      button.addEventListener("click", () => {
        state.dotGridSize = normalizeDotGridSize(button.dataset.dotGrid);
        state.dotPixels = makeBlankDotPixels(state.dotGridSize);
        syncDotControls();
        renderDotEditor();
        closeClosestPicker(button);
        applyDotPack("도트 단위 변경 완료");
      });
    });

    els.dotTypeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        state.dotType = normalizeDotType(button.dataset.dotType);
        syncDotControls();
        closeClosestPicker(button);
        persist();
        setStatus("도트 종류 변경 완료");
      });
    });

    els.dotZoom.addEventListener("input", () => {
      state.dotZoom = normalizeDotZoom(els.dotZoom.value);
      syncDotControls();
      renderDotEditor();
      persist();
    });

    els.cellWorkspace.addEventListener("click", () => {
      if (state.mode === "erase") {
        setStatus("중앙 지우개 캔버스에서 지우세요");
      }
    });

    [els.imageFrame, els.cellWorkspace].forEach((target) => {
      target.addEventListener("pointerdown", handleImagePointerDown);
      target.addEventListener("pointermove", handleImagePointerMove);
      target.addEventListener("pointerup", handleImagePointerEnd);
      target.addEventListener("pointercancel", handleImagePointerEnd);
    });

    els.imageFrame.addEventListener("click", () => {
      if (state.mode === "image" && !getActivePhotoSource()) requestPhotoPicker();
    });

    els.dotViewportPad.addEventListener("pointerdown", handleDotViewportPointer);
    els.dotViewportPad.addEventListener("pointermove", handleDotViewportPointer);

    els.resetTool.addEventListener("click", resetCurrentTool);
    els.undoTool.addEventListener("click", undoDraft);
    els.redoTool.addEventListener("click", redoDraft);
    els.applyTool.addEventListener("click", () => {
      applyDraftToBlockSlot("블록 저장 완료");
    });

    els.deleteDesign.addEventListener("click", deleteActiveBlockSlot);
  }

  function setTool(tool) {
    const previousTool = state.mode;
    state.mode = tool;
    els.modeButtons.forEach((button) => {
      const isActive = button.dataset.tool === tool;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    syncWorkshopState();
    updateToolViewport();
    if (tool === "draw" && previousTool !== "draw") hydrateDrawingCanvasFromDraft();
    if (tool === "erase") renderEraserCanvas();
  }

  function setFillMode(mode, options = {}) {
    const nextMode = mode === "pattern" ? "pattern" : "single";
    const changed = nextMode !== state.fillMode;
    state.fillMode = nextMode;
    state.fillGrid = nextMode === "pattern" ? state.patternGrid : DEFAULT_FILL_GRID;
    refreshActiveDesignForFillMode();
    syncFillModeButtons();
    syncFillGridButtons();
    syncWorkshopState();
    if (options.apply === false) return;

    const applied = applyFillGridToActivePack();
    persist();
    if (applied) {
      renderAll();
      setStatus(`${formatFillGrid(state.fillGrid)} 적용 완료`);
    } else if (changed) {
      setStatus(nextMode === "pattern" ? "패턴 채우기 선택" : "단일 채우기 선택");
    }
  }

  function setFillGrid(value, options = {}) {
    const nextGrid = normalizePatternGrid(value, state.patternGrid);
    const changed = nextGrid !== state.patternGrid || state.fillMode !== "pattern";
    state.fillMode = "pattern";
    state.patternGrid = nextGrid;
    state.fillGrid = nextGrid;
    refreshActiveDesignForFillMode();
    syncFillModeButtons();
    syncFillGridButtons();
    syncWorkshopState();
    if (options.apply === false) return;

    const applied = applyFillGridToActivePack();
    persist();
    if (applied) {
      renderAll();
      setStatus(`${formatFillGrid(nextGrid)} 적용 완료`);
    } else if (changed) {
      setStatus(`${formatFillGrid(nextGrid)} 선택`);
    }
  }

  function syncFillModeButtons() {
    els.fillModeButtons.forEach((button) => {
      const isActive = button.dataset.fillMode === state.fillMode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function syncFillGridButtons() {
    els.gridSelect.value = state.fillMode === "pattern" ? String(state.patternGrid) : String(DEFAULT_FILL_GRID);
    els.gridSelect.disabled = state.fillMode !== "pattern";
    els.fillGridButtons.forEach((button) => {
      const isActive = normalizePatternGrid(button.dataset.fillGrid) === state.patternGrid;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function syncWorkshopState() {
    els.workshop.dataset.activeTool = state.mode;
    els.workshop.dataset.activeFillMode = state.fillMode;
    els.workshop.dataset.draftActive = String(state.draftActive);
    els.workshop.dataset.drawShape = state.activeDrawShape;
    els.workshop.dataset.themeStartOpen = String(state.themeStartOpen);
    if (els.themeStartPanel) els.themeStartPanel.hidden = !state.themeStartOpen;
    els.commitDesign.disabled = !state.draftActive;
    els.applyTool.disabled = !state.draftActive;
  }

  function syncShapeButtons() {
    els.shapeButtons.forEach((button) => {
      const isActive = button.dataset.drawShape === state.activeDrawShape;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    if (els.drawShapeValue) els.drawShapeValue.textContent = getDrawShapeLabel(state.activeDrawShape);
  }

  function syncDrawControls() {
    els.drawZoom.value = String(state.drawZoom);
    els.shapeSize.value = String(state.shapeSize);
    els.outlineButtons.forEach((button) => {
      const isActive = normalizeOutlineWidth(button.dataset.outlineWidth) === state.outlineWidth;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    if (els.outlineWidthValue) els.outlineWidthValue.textContent = getOutlineWidthLabel(state.outlineWidth);
    els.drawCanvas.style.setProperty("--draw-zoom", String(state.drawZoom));
    if (els.drawColorChip) els.drawColorChip.style.setProperty("--chip", state.activeColor);
    syncShapeButtons();
    updateToolViewport();
  }

  function syncTemplateControls() {
    const texture = TEXTURES[state.activePattern] || TEXTURES.neon;
    els.textureButtons.forEach((button) => {
      const isActive = button.dataset.texture === state.activePattern;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    if (els.templateNameValue) els.templateNameValue.textContent = texture.label || state.activePattern;
    state.templateColors = normalizeTemplateColors(state.templateColors);
    els.templateColorInputs.forEach((input, index) => {
      input.value = state.templateColors[index];
      if (input.parentElement) input.parentElement.style.setProperty("--chip", state.templateColors[index]);
    });
    els.templateIntensity.value = String(state.templateIntensity);
    els.templateScale.value = String(state.templateScale);
    els.templateZoom.value = String(state.templateScale);
    if (els.templateColorValue) {
      els.templateColorValue.replaceChildren(
        ...state.templateColors.map((color) => {
          const chip = document.createElement("span");
          chip.style.setProperty("--chip", color);
          return chip;
        }),
      );
    }
    if (els.templateTuningValue) {
      const intensityLabel = state.templateIntensity < 0.55 ? "약하게" : state.templateIntensity > 0.82 ? "강하게" : "중간";
      els.templateTuningValue.textContent = intensityLabel;
    }
    updateToolViewport();
  }

  function syncEraserControls() {
    els.eraserSize.value = String(state.eraserSize);
    els.eraserZoom.value = String(state.eraserZoom);
    els.eraserCanvas.style.setProperty("--eraser-zoom", String(state.eraserZoom));
    els.eraserShapeButtons.forEach((button) => {
      const isActive = button.dataset.eraserShape === state.eraserShape;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    if (els.eraserShapeValue) els.eraserShapeValue.textContent = getEraserShapeLabel(state.eraserShape);
    updateToolViewport();
  }

  function closeClosestPicker(element) {
    const picker = element && element.closest && element.closest("details");
    if (picker) picker.open = false;
  }

  function getDrawShapeLabel(shape) {
    if (shape === "rect") return "사각";
    if (shape === "circle") return "원";
    if (shape === "line") return "선";
    if (shape === "triangle") return "삼각";
    return "펜";
  }

  function getOutlineWidthLabel(width) {
    const normalized = normalizeOutlineWidth(width);
    if (normalized <= 2) return "얇게";
    if (normalized <= 5) return "보통";
    if (normalized <= 9) return "두껍게";
    return "굵게";
  }

  function getDotTypeLabel(type) {
    if (type === "cross") return "십자";
    if (type === "square") return "사각";
    if (type === "diamond") return "다이아";
    if (type === "checker") return "체커";
    return "점";
  }

  function getEraserShapeLabel(shape) {
    if (shape === "square") return "사각";
    if (shape === "diamond") return "다이아";
    return "원";
  }

  function applyFillGridToActivePack() {
    renderAll();
    return true;
  }

  function syncThemePack() {
    state.designs = normalizeDesigns(state.designs);
    state.activeDesignIndex = clampDesignIndex(state.activeDesignIndex);
    state.skinPack = makeCellsPack(state.designs);
  }

  function ensureDraftActive() {
    if (state.draftActive) return true;
    setStatus("수정할 블록 슬롯을 선택하거나 + 블록을 누르세요");
    return false;
  }

  function activateDraftFromSkin(skin) {
    state.draftActive = true;
    state.draftDesign = cloneSkin(skin);
    hydrateDraftToolState();
    syncWorkshopState();
    syncPhotoControls();
    syncDotControls();
    renderDotEditor();
    if (state.mode === "draw") hydrateDrawingCanvasFromDraft();
    if (state.mode === "erase") renderEraserCanvas();
  }

  function updateDraftDesign(skin, message, options = {}) {
    if (!ensureDraftActive()) return false;
    if (!options.skipHistory) pushDraftHistory();
    state.draftDesign = cloneSkin(skin);
    if (!options.keepFuture) state.draftFuture = [];
    persist();
    renderAll();
    if (message) setStatus(message);
    return true;
  }

  function pushDraftHistory() {
    if (!state.draftActive || !state.draftDesign) return;
    state.draftHistory.push(cloneSkin(state.draftDesign));
    if (state.draftHistory.length > 30) state.draftHistory.shift();
  }

  function restoreDraftSnapshot(snapshot, message) {
    if (!snapshot || !ensureDraftActive()) return;
    state.draftDesign = cloneSkin(snapshot);
    hydrateDraftToolState();
    syncPhotoControls();
    syncDotControls();
    renderDotEditor();
    if (state.mode === "draw") hydrateDrawingCanvasFromDraft();
    if (state.mode === "erase") renderEraserCanvas();
    persist();
    renderAll();
    if (message) setStatus(message);
  }

  function undoDraft() {
    if (!state.draftHistory.length || !state.draftDesign) {
      setStatus("이전 단계가 없습니다");
      return;
    }
    state.draftFuture.push(cloneSkin(state.draftDesign));
    restoreDraftSnapshot(state.draftHistory.pop(), "이전 단계");
  }

  function redoDraft() {
    if (!state.draftFuture.length || !state.draftDesign) {
      setStatus("이후 단계가 없습니다");
      return;
    }
    state.draftHistory.push(cloneSkin(state.draftDesign));
    restoreDraftSnapshot(state.draftFuture.pop(), "이후 단계");
  }

  function resetCurrentTool() {
    if (!ensureDraftActive()) return;
    if (state.mode === "dot") {
      pushDraftHistory();
      state.dotPixels = makeBlankDotPixels(state.dotGridSize);
      state.draftFuture = [];
      renderDotEditor();
      applyDotPack("도트 리셋 완료", { skipHistory: true });
      return;
    }
    if (state.mode === "image" && state.photoSrc) {
      pushDraftHistory();
      state.photoScale = DEFAULT_PHOTO_SCALE;
      state.photoOffsetX = DEFAULT_PHOTO_OFFSET;
      state.photoOffsetY = DEFAULT_PHOTO_OFFSET;
      state.draftFuture = [];
      applyPhotoPack("이미지 리셋 완료", { skipHistory: true });
      return;
    }
    if (state.mode === "draw") clearDrawingCanvas();
    updateDraftDesign(makeBlankSkin(), "리셋 완료");
  }

  function applyCurrentTool() {
    if (!ensureDraftActive()) return;
    if (state.mode === "draw") {
      applyDrawingPack(false);
    } else if (state.mode === "dot") {
      applyDotPack("도트 적용 완료");
    } else if (state.mode === "image") {
      applyPhotoPack("이미지 확인 완료");
    } else if (state.mode === "template") {
      applyTexturePack(state.activePattern);
    } else if (state.mode === "erase") {
      commitEraserCanvas("지우개 적용 완료", { skipHistory: true });
    }
  }

  function getActivePhotoSource() {
    return state.photoSrc || (state.draftDesign && state.draftDesign.kind === "image" ? state.draftDesign.src : "");
  }

  function requestPhotoPicker() {
    if (!els.photoInput) return;
    els.photoInput.value = "";
    els.photoInput.click();
  }

  function handleImagePointerDown(event) {
    if (state.mode !== "image") return;
    const src = getActivePhotoSource();
    if (!src || !ensureDraftActive()) return;
    event.preventDefault();
    const target = event.currentTarget || els.cellWorkspace;
    target.setPointerCapture(event.pointerId);
    state.photoSrc = src;
    state.imageGestureTarget = target;
    state.imagePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    pushDraftHistory();
    state.draftFuture = [];
    startImageGesture();
  }

  function handleImagePointerMove(event) {
    if (state.mode !== "image" || !state.imagePointers.has(event.pointerId)) return;
    event.preventDefault();
    state.imagePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    updateImageGesture();
  }

  function handleImagePointerEnd(event) {
    if (!state.imagePointers.has(event.pointerId)) return;
    state.imagePointers.delete(event.pointerId);
    state.imageGesture = null;
    if (!state.imagePointers.size) state.imageGestureTarget = null;
    if (state.mode === "image") setStatus("이미지 조정 완료");
  }

  function startImageGesture() {
    const points = Array.from(state.imagePointers.values());
    if (points.length >= 2) {
      state.imageGesture = {
        mode: "pinch",
        distance: getPointDistance(points[0], points[1]),
        scale: state.photoScale,
      };
    } else if (points.length === 1) {
      state.imageGesture = {
        mode: "pan",
        x: points[0].x,
        y: points[0].y,
        offsetX: state.photoOffsetX,
        offsetY: state.photoOffsetY,
      };
    }
  }

  function updateImageGesture() {
    const points = Array.from(state.imagePointers.values());
    if (!points.length) return;
    if (points.length >= 2) {
      if (!state.imageGesture || state.imageGesture.mode !== "pinch") startImageGesture();
      const distance = getPointDistance(points[0], points[1]);
      const baseDistance = Math.max(1, state.imageGesture.distance);
      state.photoScale = normalizePhotoScale((distance / baseDistance) * state.imageGesture.scale);
    } else {
      if (!state.imageGesture || state.imageGesture.mode !== "pan") startImageGesture();
      const rect = (state.imageGestureTarget || els.cellWorkspace).getBoundingClientRect();
      state.photoOffsetX = normalizePhotoOffset(state.imageGesture.offsetX + ((points[0].x - state.imageGesture.x) / rect.width) * 100);
      state.photoOffsetY = normalizePhotoOffset(state.imageGesture.offsetY + ((points[0].y - state.imageGesture.y) / rect.height) * 100);
    }
    syncPhotoControls();
    applyPhotoPack("", { skipHistory: true });
  }

  function getPointDistance(first, second) {
    return Math.hypot(first.x - second.x, first.y - second.y);
  }

  function adjustImageTransform(delta, message, options = {}) {
    const src = getActivePhotoSource();
    if (!src || !ensureDraftActive()) {
      if (delta.scale) {
        state.photoScale = normalizePhotoScale(delta.scale);
        syncPhotoControls();
      }
      setStatus("사진을 선택하세요");
      return;
    }
    state.photoSrc = src;
    if (!options.transient) pushDraftHistory();
    state.draftFuture = [];
    if (delta.scale) {
      state.photoScale = normalizePhotoScale(delta.scale);
    }
    if (delta.scaleDelta) {
      state.photoScale = normalizePhotoScale(state.photoScale + delta.scaleDelta);
    }
    if (delta.center) {
      state.photoOffsetX = DEFAULT_PHOTO_OFFSET;
      state.photoOffsetY = DEFAULT_PHOTO_OFFSET;
    }
    if (delta.xDelta) {
      state.photoOffsetX = normalizePhotoOffset(state.photoOffsetX + delta.xDelta);
    }
    if (delta.yDelta) {
      state.photoOffsetY = normalizePhotoOffset(state.photoOffsetY + delta.yDelta);
    }
    syncPhotoControls();
    applyPhotoPack(message, { skipHistory: true });
  }

  function applyDraftToBlockSlot(message) {
    if (!ensureDraftActive()) return;
    state.designs[state.activeDesignIndex] = cloneSkin(state.draftDesign);
    state.draftActive = false;
    state.draftDesign = null;
    syncThemePack();
    persist();
    renderAll();
    setStatus(message);
  }

  function deleteActiveBlockSlot() {
    if (state.designs.length <= 1) {
      state.designs[0] = makeBlankSkin();
      state.activeDesignIndex = 0;
      state.draftActive = false;
      state.draftDesign = null;
      syncThemePack();
      persist();
      renderAll();
      setStatus("마지막 블록 초기화 완료");
      return;
    }
    state.designs.splice(state.activeDesignIndex, 1);
    state.activeDesignIndex = clampDesignIndex(state.activeDesignIndex);
    state.draftActive = false;
    state.draftDesign = null;
    syncThemePack();
    persist();
    renderAll();
    setStatus("블록 슬롯 삭제 완료");
  }

  function addBlockSlot() {
    const blank = makeBlankSkin();
    state.designs.push(cloneSkin(blank));
    state.activeDesignIndex = state.designs.length - 1;
    activateDraftFromSkin(blank);
    syncThemePack();
    persist();
    renderAll();
    setStatus("새 블록 슬롯 편집 시작");
  }

  function openThemeStartPanel() {
    state.themeStartOpen = true;
    renderThemeLibrary();
    syncWorkshopState();
  }

  function closeThemeStartPanel() {
    state.themeStartOpen = false;
    syncWorkshopState();
  }

  function requestNewTheme() {
    const start = () => {
      createNewTheme();
      closeThemeStartPanel();
      setStatus("새 테마 생성 완료");
    };
    if (state.themeDirty) {
      confirmDiscardCurrentTheme(start);
      return;
    }
    start();
  }

  function createNewTheme() {
    state.currentThemeId = "";
    state.currentThemeName = "새 테마";
    state.themeDirty = false;
    state.fillMode = "single";
    state.fillGrid = DEFAULT_FILL_GRID;
    state.patternGrid = DEFAULT_PATTERN_GRID;
    state.activeDesignIndex = 0;
    state.designs = DEFAULT_DESIGNS.map(cloneSkin);
    state.draftActive = true;
    state.draftDesign = cloneSkin(state.designs[0]);
    state.photoSrc = "";
    state.photoScale = DEFAULT_PHOTO_SCALE;
    state.photoOffsetX = DEFAULT_PHOTO_OFFSET;
    state.photoOffsetY = DEFAULT_PHOTO_OFFSET;
    state.dotGridSize = DEFAULT_DOT_GRID;
    state.dotZoom = DEFAULT_DOT_ZOOM;
    state.dotType = DEFAULT_DOT_TYPE;
    state.dotPixels = makeBlankDotPixels(DEFAULT_DOT_GRID);
    state.drawZoom = DEFAULT_DRAW_ZOOM;
    state.shapeSize = DEFAULT_SHAPE_SIZE;
    state.outlineWidth = DEFAULT_OUTLINE_WIDTH;
    state.activePattern = "neon";
    state.templateColors = DEFAULT_TEMPLATE_COLORS.slice();
    state.templateIntensity = DEFAULT_TEMPLATE_INTENSITY;
    state.templateScale = DEFAULT_TEMPLATE_SCALE;
    state.eraserSize = DEFAULT_ERASER_SIZE;
    state.eraserZoom = DEFAULT_ERASER_ZOOM;
    state.eraserShape = DEFAULT_ERASER_SHAPE;
    state.draftHistory = [];
    state.draftFuture = [];
    syncThemePack();
    applyPackToAvailablePieces();
    syncPhotoControls();
    syncDotControls();
    syncDrawControls();
    syncTemplateControls();
    syncEraserControls();
    syncFillModeButtons();
    syncFillGridButtons();
    renderDotEditor();
    hydrateDrawingCanvasFromDraft();
    renderAll();
    persist({ themeDirty: false });
  }

  function loadThemeLibrary() {
    try {
      const parsed = JSON.parse(localStorage.getItem(THEME_LIBRARY_KEY) || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalizeThemeRecord).filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  function normalizeThemeRecord(record) {
    if (!record || typeof record !== "object" || !record.payload) return null;
    const id = typeof record.id === "string" && record.id ? record.id : createThemeId();
    const name = typeof record.name === "string" && record.name.trim() ? record.name.trim() : "이름 없는 테마";
    const updatedAt = typeof record.updatedAt === "string" ? record.updatedAt : new Date().toISOString();
    return { id, name, updatedAt, payload: record.payload };
  }

  function saveThemeLibrary() {
    localStorage.setItem(THEME_LIBRARY_KEY, JSON.stringify(state.themeLibrary));
  }

  function renderThemeLibrary() {
    if (!els.themeLibraryList) return;
    els.themeLibraryList.innerHTML = "";
    if (!state.themeLibrary.length) {
      const empty = document.createElement("div");
      empty.className = "theme-library-empty";
      empty.textContent = "저장된 테마가 없습니다";
      els.themeLibraryList.appendChild(empty);
      return;
    }
    state.themeLibrary
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .forEach((theme) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "theme-library-item";
        button.dataset.themeId = theme.id;
        const name = document.createElement("strong");
        name.textContent = theme.name;
        const savedAt = document.createElement("span");
        savedAt.textContent = formatThemeDate(theme.updatedAt);
        button.append(name, savedAt);
        button.addEventListener("click", () => requestLoadTheme(theme.id));
        els.themeLibraryList.appendChild(button);
      });
  }

  function requestLoadTheme(themeId) {
    const theme = state.themeLibrary.find((candidate) => candidate.id === themeId);
    if (!theme) return;
    const load = () => {
      loadThemeRecord(theme);
      closeThemeStartPanel();
    };
    if (state.themeDirty) {
      confirmDiscardCurrentTheme(load);
      return;
    }
    load();
  }

  function confirmDiscardCurrentTheme(onConfirm) {
    showThemeDialog("작업 유실 경고", "현재 작업 중인 테마가 저장되지 않았고 모두 유실됩니다. 계속할까요?", [
      { label: "아니요", variant: "secondary", handler: closeThemeDialog },
      {
        label: "예",
        variant: "primary",
        handler: () => {
          closeThemeDialog();
          onConfirm();
        },
      },
    ]);
  }

  function loadThemeRecord(theme) {
    applyThemePayload(theme.payload);
    state.currentThemeId = theme.id;
    state.currentThemeName = theme.name;
    state.themeDirty = false;
    syncThemePack();
    applyPackToAvailablePieces();
    persist({ themeDirty: false });
    renderAll();
    setStatus(`${theme.name} 불러오기 완료`);
  }

  function applyThemePayload(saved = {}) {
    state.designs = normalizeDesigns(saved.designs);
    state.activeDesignIndex = clampDesignIndex(saved.activeDesignIndex);
    state.draftActive = saved.draftActive === undefined ? true : Boolean(saved.draftActive);
    state.draftDesign =
      state.draftActive && saved.draftDesign && typeof saved.draftDesign === "object"
        ? cloneSkin(saved.draftDesign)
        : state.draftActive
          ? cloneSkin(state.designs[state.activeDesignIndex])
          : null;
    state.patternGrid = normalizePatternGrid(saved.patternGrid, DEFAULT_PATTERN_GRID);
    state.fillMode = saved.fillMode === "pattern" ? "pattern" : "single";
    state.fillGrid = state.fillMode === "pattern" ? normalizePatternGrid(saved.fillGrid, state.patternGrid) : DEFAULT_FILL_GRID;
    state.eraserSize = normalizeEraserSize(saved.eraserSize);
    state.photoScale = normalizePhotoScale(saved.photoScale);
    state.photoOffsetX = normalizePhotoOffset(saved.photoOffsetX);
    state.photoOffsetY = normalizePhotoOffset(saved.photoOffsetY);
    state.drawZoom = normalizeDrawZoom(saved.drawZoom);
    state.shapeSize = normalizeShapeSize(saved.shapeSize);
    state.outlineWidth = normalizeOutlineWidth(saved.outlineWidth);
    state.activePattern = TEXTURES[saved.activePattern] ? saved.activePattern : state.activePattern;
    state.templateColors = normalizeTemplateColors(saved.templateColors);
    state.templateIntensity = normalizeTemplateIntensity(saved.templateIntensity);
    state.templateScale = normalizeTemplateScale(saved.templateScale);
    state.eraserZoom = normalizeEraserZoom(saved.eraserZoom);
    state.eraserShape = normalizeEraserShape(saved.eraserShape);
    state.dotGridSize = normalizeDotGridSize(saved.dotGridSize);
    state.dotZoom = normalizeDotZoom(saved.dotZoom);
    state.dotType = normalizeDotType(saved.dotType);
    state.dotPixels = normalizeDotPixels(saved.dotPixels, state.dotGridSize);
    state.draftHistory = [];
    state.draftFuture = [];
    hydrateDraftToolState();
    syncThemePack();
    syncPhotoControls();
    syncDotControls();
    syncDrawControls();
    syncTemplateControls();
    syncEraserControls();
    syncFillModeButtons();
    syncFillGridButtons();
    syncWorkshopState();
    renderDotEditor();
    hydrateDrawingCanvasFromDraft();
    if (state.mode === "erase") renderEraserCanvas();
  }

  function openSaveThemeMenu() {
    showThemeDialog("테마 저장하기", "저장 방식을 선택하세요.", [
      { label: "덮어씌우기", variant: "primary", handler: confirmOverwriteTheme },
      { label: "새이름으로 저장", variant: "secondary", handler: openSaveAsThemeDialog },
      { label: "취소", variant: "secondary", handler: closeThemeDialog },
    ]);
  }

  function confirmOverwriteTheme() {
    const theme = state.themeLibrary.find((candidate) => candidate.id === state.currentThemeId);
    if (!theme) {
      openSaveAsThemeDialog();
      return;
    }
    showThemeDialog("덮어씌우기", `${theme.name} 테마를 덮어씌울까요?`, [
      { label: "아니요", variant: "secondary", handler: closeThemeDialog },
      {
        label: "예",
        variant: "primary",
        handler: () => {
          saveThemeRecord(theme.id, theme.name);
          closeThemeDialog();
        },
      },
    ]);
  }

  function openSaveAsThemeDialog() {
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 28;
    input.value = state.currentThemeId ? `${state.currentThemeName} 복사본` : "";
    input.placeholder = "테마명";
    showThemeDialog("새이름으로 저장", input, [
      { label: "취소", variant: "secondary", handler: closeThemeDialog },
      {
        label: "저장",
        variant: "primary",
        handler: () => {
          const name = input.value.trim();
          if (!name) {
            input.focus();
            return;
          }
          saveThemeRecord("", name);
          closeThemeDialog();
        },
      },
    ]);
    requestAnimationFrame(() => input.focus());
  }

  function saveThemeRecord(themeId, name) {
    syncThemePack();
    applyPackToAvailablePieces();
    const id = themeId || createThemeId();
    const now = new Date().toISOString();
    const payload = makeThemePayload();
    const existingIndex = state.themeLibrary.findIndex((theme) => theme.id === id);
    const record = { id, name, updatedAt: now, payload };
    if (existingIndex >= 0) {
      state.themeLibrary[existingIndex] = record;
    } else {
      state.themeLibrary.push(record);
    }
    state.currentThemeId = id;
    state.currentThemeName = name;
    state.themeDirty = false;
    saveThemeLibrary();
    persist({ themeDirty: false });
    renderThemeLibrary();
    renderAll();
    setStatus(`${name} 저장 완료`);
  }

  function showThemeDialog(title, body, actions) {
    els.themeDialogTitle.textContent = title;
    els.themeDialogBody.innerHTML = "";
    if (typeof body === "string") {
      const text = document.createElement("p");
      text.textContent = body;
      els.themeDialogBody.appendChild(text);
    } else if (body) {
      els.themeDialogBody.appendChild(body);
    }
    els.themeDialogActions.innerHTML = "";
    actions.forEach((action) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = action.variant === "primary" ? "primary-button" : "secondary-button";
      button.textContent = action.label;
      button.addEventListener("click", action.handler);
      els.themeDialogActions.appendChild(button);
    });
    els.themeDialog.hidden = false;
  }

  function closeThemeDialog() {
    els.themeDialog.hidden = true;
    els.themeDialogBody.innerHTML = "";
    els.themeDialogActions.innerHTML = "";
  }

  function createThemeId() {
    return `theme-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function formatThemeDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "저장일 없음";
    return new Intl.DateTimeFormat("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function refreshSimulationPreview() {
    state.simulationSeed += 1;
    renderSimulation();
    setStatus("시뮬레이션 새로고침");
  }

  function refreshActiveDesignForFillMode() {
    if (!state.draftActive) return;
    const skin = state.draftDesign;
    if (!skin) return;
    if (skin.kind === "image" && skin.src) {
      state.photoSrc = skin.src;
      state.draftDesign = makeImageDraftSkin(skin.src);
      return;
    }
    if (skin.kind === "texture" && skin.texture) {
      state.draftDesign = makeTextureSkin(
        skin.texture,
        0,
        state.fillMode === "pattern" ? state.fillGrid : DEFAULT_FILL_GRID,
        { shape: [[0, 0]] },
      );
    }
  }

  function setupDrawingCanvas() {
    const canvas = els.drawCanvas;
    state.drawContext = canvas.getContext("2d");
    configureDrawingContext();
    hydrateDrawingCanvasFromDraft();

    canvas.addEventListener("pointerdown", async (event) => {
      if (!ensureDraftActive()) return;
      setTool("draw");
      if (state.drawHydratePromise) await state.drawHydratePromise;
      state.drawing = true;
      canvas.setPointerCapture(event.pointerId);
      state.drawStart = getCanvasPoint(event);
      state.drawSnapshot = state.drawContext.getImageData(0, 0, canvas.width, canvas.height);
      pushDraftHistory();
      state.draftFuture = [];
      if (state.activeDrawShape === "free") {
        drawAt(event, true);
      } else {
        drawSelectedShape(state.drawStart, getCanvasPoint(event));
      }
      scheduleDrawingLivePreview();
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!state.drawing) return;
      if (state.activeDrawShape === "free") {
        drawAt(event, false);
      } else {
        drawSelectedShape(state.drawStart, getCanvasPoint(event));
      }
      scheduleDrawingLivePreview();
    });
    canvas.addEventListener("pointerup", (event) => {
      if (state.drawing && state.activeDrawShape !== "free") {
        drawSelectedShape(state.drawStart, getCanvasPoint(event));
      }
      state.drawing = false;
      canvas.releasePointerCapture(event.pointerId);
      scheduleDrawingLivePreview();
    });
    canvas.addEventListener("pointercancel", () => {
      state.drawing = false;
      scheduleDrawingLivePreview();
    });
  }

  function configureDrawingContext() {
    if (!state.drawContext) return;
    state.drawContext.lineCap = "round";
    state.drawContext.lineJoin = "round";
  }

  function hydrateDrawingCanvasFromDraft() {
    if (!state.drawContext || !els.drawCanvas) return Promise.resolve();
    const visibleCanvas = els.drawCanvas;
    const token = state.drawRenderToken + 1;
    state.drawRenderToken = token;
    state.drawHydratePromise = (async () => {
      const buffer = document.createElement("canvas");
      buffer.width = visibleCanvas.width;
      buffer.height = visibleCanvas.height;
      await drawSkinToCanvas(buffer, state.draftActive ? state.draftDesign : makeBlankSkin());
      if (token !== state.drawRenderToken) return;
      state.drawContext.clearRect(0, 0, visibleCanvas.width, visibleCanvas.height);
      state.drawContext.drawImage(buffer, 0, 0);
      configureDrawingContext();
    })();
    return state.drawHydratePromise;
  }

  function drawAt(event, startStroke) {
    const { x, y } = getCanvasPoint(event);
    const context = state.drawContext;
    context.strokeStyle = state.activeColor;
    context.lineWidth = Number(els.brushSize.value) || 9;
    if (startStroke) {
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x, y);
      context.stroke();
      return;
    }
    context.lineTo(x, y);
    context.stroke();
  }

  function getCanvasPoint(event) {
    const canvas = els.drawCanvas;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function drawSelectedShape(start, end) {
    if (!start || !end || !state.drawSnapshot) return;
    const context = state.drawContext;
    context.putImageData(state.drawSnapshot, 0, 0);
    context.strokeStyle = state.activeColor;
    context.fillStyle = state.activeColor;
    context.lineWidth = state.outlineWidth;
    const shapeSize = state.shapeSize;
    const directionX = end.x >= start.x ? 1 : -1;
    const directionY = end.y >= start.y ? 1 : -1;
    const x = directionX > 0 ? start.x : start.x - shapeSize;
    const y = directionY > 0 ? start.y : start.y - shapeSize;
    const width = shapeSize;
    const height = shapeSize;
    context.beginPath();
    if (state.activeDrawShape === "rect") {
      context.strokeRect(x, y, width, height);
    } else if (state.activeDrawShape === "circle") {
      context.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
      context.stroke();
    } else if (state.activeDrawShape === "line") {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.hypot(dx, dy) || 1;
      context.moveTo(start.x, start.y);
      context.lineTo(start.x + (dx / length) * shapeSize, start.y + (dy / length) * shapeSize);
      context.stroke();
    } else if (state.activeDrawShape === "triangle") {
      context.moveTo(x + width / 2, y);
      context.lineTo(x + width, y + height);
      context.lineTo(x, y + height);
      context.closePath();
      context.stroke();
    }
  }

  function clearDrawingCanvas() {
    if (!state.drawContext) return;
    state.drawRenderToken += 1;
    state.drawContext.clearRect(0, 0, els.drawCanvas.width, els.drawCanvas.height);
    configureDrawingContext();
    setStatus("드로잉 캔버스 초기화");
  }

  function applyDrawingPack(asPattern) {
    const src = els.drawCanvas.toDataURL("image/png");
    if (asPattern) {
      setFillMode("pattern", { apply: false });
    }
    const skin = makeDrawingSkin(src);
    updateDraftDesign(skin, `${formatFillGrid(state.fillGrid)} 그림 적용 완료`);
  }

  function scheduleDrawingLivePreview() {
    if (!state.draftActive || !state.drawContext || state.drawingLiveFrame) return;
    state.drawingLiveFrame = requestAnimationFrame(() => {
      state.drawingLiveFrame = 0;
      updateDrawingLivePreview();
    });
  }

  function updateDrawingLivePreview() {
    if (!state.draftActive || !state.drawContext) return;
    const skin = makeDrawingSkin(els.drawCanvas.toDataURL("image/png"));
    state.draftDesign = cloneSkin(skin);
    persist();
    renderWorkspace();
    renderSimulation();
  }

  function makeDrawingSkin(src) {
    const skin =
      state.fillMode === "pattern"
        ? makePatternImageSkin({ shape: [[0, 0]] }, 0, src, state.fillGrid)
        : makePhotoSkin({ shape: [[0, 0]] }, 0, src);
    skin.source = "drawing";
    return skin;
  }

  function setupDotEditor() {
    renderDotEditor();
    els.dotEditor.addEventListener("pointerdown", (event) => {
      if (!ensureDraftActive()) return;
      state.dotPainting = true;
      paintDotFromEvent(event);
    });
    els.dotEditor.addEventListener("pointerover", (event) => {
      if (!state.dotPainting) return;
      paintDotFromEvent(event);
    });
    els.dotEditorWrap.addEventListener("scroll", updateDotNavigator);
    window.addEventListener("pointerup", () => {
      state.dotPainting = false;
    });
  }

  function setupEraserCanvas() {
    const canvas = els.eraserCanvas;
    canvas.addEventListener("pointerdown", async (event) => {
      if (!ensureDraftActive()) return;
      event.preventDefault();
      setTool("erase");
      canvas.setPointerCapture(event.pointerId);
      state.erasing = true;
      await renderEraserCanvas();
      pushDraftHistory();
      state.draftFuture = [];
      eraseOnCanvas(event);
      commitEraserCanvas("", { skipHistory: true });
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!state.erasing) return;
      event.preventDefault();
      eraseOnCanvas(event);
      commitEraserCanvas("", { skipHistory: true });
    });
    canvas.addEventListener("pointerup", (event) => {
      if (!state.erasing) return;
      state.erasing = false;
      canvas.releasePointerCapture(event.pointerId);
      setStatus("지우개 적용 완료");
    });
    canvas.addEventListener("pointercancel", () => {
      state.erasing = false;
    });
  }

  async function renderEraserCanvas() {
    const canvas = els.eraserCanvas;
    if (!canvas) return;
    const token = state.eraserRenderToken + 1;
    state.eraserRenderToken = token;
    await drawSkinToCanvas(canvas, state.draftActive ? state.draftDesign : makeBlankSkin());
    if (token !== state.eraserRenderToken) return;
  }

  async function drawSkinToCanvas(canvas, skin) {
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#dfe6dc";
    context.fillRect(0, 0, canvas.width, canvas.height);
    const draft = skin || makeBlankSkin();
    if (draft.kind === "color") {
      context.fillStyle = draft.color || "#dfe6dc";
      context.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }
    if (draft.kind === "texture") {
      context.fillStyle = draft.color || "#dfe6dc";
      context.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }
    if (draft.kind === "image" && draft.src) {
      context.fillStyle = draft.color || "#dfe6dc";
      context.fillRect(0, 0, canvas.width, canvas.height);
      try {
        const image = await loadCanvasImage(draft.src);
        drawImageSkin(context, canvas, image, draft);
      } catch (error) {
        context.fillStyle = draft.color || "#dfe6dc";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }

  function loadCanvasImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  function drawImageSkin(context, canvas, image, skin) {
    if (skin.repeat === "repeat") {
      const pattern = context.createPattern(image, "repeat");
      if (pattern) {
        context.fillStyle = pattern;
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }
    const size = parseCssPercentPair(skin.size) || { x: 100, y: 100 };
    const position = parseCssPercentPair(skin.position) || { x: 50, y: 50 };
    const drawWidth = canvas.width * (size.x / 100);
    const drawHeight = canvas.height * (size.y / 100);
    const x = (canvas.width - drawWidth) * (position.x / 100);
    const y = (canvas.height - drawHeight) * (position.y / 100);
    context.drawImage(image, x, y, drawWidth, drawHeight);
  }

  function eraseOnCanvas(event) {
    const canvas = els.eraserCanvas;
    const context = canvas.getContext("2d");
    const point = getCanvasRelativePoint(canvas, event);
    const size = state.eraserSize;
    context.save();
    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    if (state.eraserShape === "square") {
      context.rect(point.x - size / 2, point.y - size / 2, size, size);
    } else if (state.eraserShape === "diamond") {
      context.moveTo(point.x, point.y - size / 2);
      context.lineTo(point.x + size / 2, point.y);
      context.lineTo(point.x, point.y + size / 2);
      context.lineTo(point.x - size / 2, point.y);
      context.closePath();
    } else {
      context.arc(point.x, point.y, size / 2, 0, Math.PI * 2);
    }
    context.fill();
    context.restore();
  }

  function getCanvasRelativePoint(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function commitEraserCanvas(message, options = {}) {
    const src = els.eraserCanvas.toDataURL("image/png");
    updateDraftDesign(
      {
        kind: "image",
        source: "eraser",
        src,
        gridSize: state.fillMode === "pattern" ? state.fillGrid : DEFAULT_FILL_GRID,
        color: "#dfe6dc",
        size: state.fillMode === "pattern" ? `${formatCssPercent(100 / state.fillGrid)} ${formatCssPercent(100 / state.fillGrid)}` : "100% 100%",
        position: "center",
        repeat: state.fillMode === "pattern" ? "repeat" : "no-repeat",
      },
      message,
      options,
    );
  }

  function renderDotEditor() {
    const cellSize = Math.round(8 + state.dotZoom * 7.5);
    els.dotEditor.innerHTML = "";
    els.dotEditor.style.setProperty("--dot-grid", String(state.dotGridSize));
    els.dotEditor.style.setProperty("--dot-cell", `${cellSize}px`);
    state.dotPixels = normalizeDotPixels(state.dotPixels, state.dotGridSize);
    state.dotPixels.forEach((color, index) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "dot-cell";
      cell.dataset.dotIndex = String(index);
      cell.setAttribute("aria-label", `${index + 1}번 도트`);
      if (color) cell.style.background = color;
      els.dotEditor.appendChild(cell);
    });
    requestAnimationFrame(updateDotNavigator);
  }

  function paintDotFromEvent(event) {
    event.preventDefault();
    const cell = event.target.closest(".dot-cell");
    if (!cell || !els.dotEditor.contains(cell)) return;
    const index = Number(cell.dataset.dotIndex);
    if (!Number.isInteger(index)) return;
    paintDotAtIndex(index);
    applyDotPack("도트 적용 완료");
  }

  function paintDotAtIndex(index) {
    const x = index % state.dotGridSize;
    const y = Math.floor(index / state.dotGridSize);
    getDotOffsets(state.dotType).forEach(([offsetX, offsetY]) => {
      const targetX = x + offsetX;
      const targetY = y + offsetY;
      if (targetX < 0 || targetX >= state.dotGridSize || targetY < 0 || targetY >= state.dotGridSize) return;
      const targetIndex = targetY * state.dotGridSize + targetX;
      state.dotPixels[targetIndex] = state.activeColor;
      const targetCell = els.dotEditor.querySelector(`[data-dot-index="${targetIndex}"]`);
      if (targetCell) targetCell.style.background = state.activeColor;
    });
  }

  function getDotOffsets(type) {
    if (type === "cross") return [[0, 0], [0, -1], [1, 0], [0, 1], [-1, 0]];
    if (type === "square") return [[0, 0], [1, 0], [0, 1], [1, 1]];
    if (type === "diamond") return [[0, -1], [1, 0], [0, 1], [-1, 0]];
    if (type === "checker") return [[0, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]];
    return [[0, 0]];
  }

  function updateDotNavigator() {
    clearSkinStyle(els.dotViewportPad);
    const wrap = els.dotEditorWrap;
    const editor = els.dotEditor;
    const widthRatio = editor.scrollWidth > 0 ? Math.min(1, wrap.clientWidth / editor.scrollWidth) : 1;
    const heightRatio = editor.scrollHeight > 0 ? Math.min(1, wrap.clientHeight / editor.scrollHeight) : 1;
    const leftRatio = editor.scrollWidth > wrap.clientWidth ? wrap.scrollLeft / (editor.scrollWidth - wrap.clientWidth) : 0;
    const topRatio = editor.scrollHeight > wrap.clientHeight ? wrap.scrollTop / (editor.scrollHeight - wrap.clientHeight) : 0;
    const focusW = widthRatio * 100;
    const focusH = heightRatio * 100;
    setViewportFocus(focusW, focusH, leftRatio, topRatio);
  }

  function updateToolViewport() {
    if (!els.dotViewportFocus) return;
    if (state.mode === "dot") {
      requestAnimationFrame(updateDotNavigator);
      return;
    }
    const zoom = Math.max(1, getActiveToolZoom());
    const focusSize = Math.min(100, Math.max(16, 100 / zoom));
    setViewportFocus(focusSize, focusSize, 0.5, 0.5);
  }

  function getActiveToolZoom() {
    if (state.mode === "draw") return state.drawZoom;
    if (state.mode === "template") return state.templateScale;
    if (state.mode === "image") return state.photoScale / DEFAULT_PHOTO_SCALE;
    if (state.mode === "erase") return state.eraserZoom;
    return 1;
  }

  function setViewportFocus(focusW, focusH, xRatio, yRatio) {
    const width = Math.min(100, Math.max(0, focusW));
    const height = Math.min(100, Math.max(0, focusH));
    const leftRatio = Math.min(1, Math.max(0, xRatio));
    const topRatio = Math.min(1, Math.max(0, yRatio));
    els.dotViewportFocus.style.setProperty("--focus-w", `${width}%`);
    els.dotViewportFocus.style.setProperty("--focus-h", `${height}%`);
    els.dotViewportFocus.style.setProperty("--focus-x", `${leftRatio * (100 - width)}%`);
    els.dotViewportFocus.style.setProperty("--focus-y", `${topRatio * (100 - height)}%`);
  }

  function handleDotViewportPointer(event) {
    if (event.buttons === 0 && event.type === "pointermove") return;
    if (state.mode !== "dot") return;
    event.preventDefault();
    els.dotViewportPad.setPointerCapture(event.pointerId);
    const rect = els.dotViewportPad.getBoundingClientRect();
    const xRatio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const yRatio = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    const wrap = els.dotEditorWrap;
    wrap.scrollLeft = (wrap.scrollWidth - wrap.clientWidth) * xRatio;
    wrap.scrollTop = (wrap.scrollHeight - wrap.clientHeight) * yRatio;
    updateDotNavigator();
  }

  function applyDotPack(message, options = {}) {
    if (!ensureDraftActive()) return;
    if (!options.skipHistory) pushDraftHistory();
    const skin = makeDotSkin();
    state.draftDesign = cloneSkin(skin);
    if (!options.keepFuture) state.draftFuture = [];
    persist();
    renderWorkspace();
    updateDotNavigator();
    if (message) setStatus(message);
  }

  function makeDotSkin() {
    const src = makeDotImageSrc();
    const repeat = state.fillMode === "pattern" ? "repeat" : "no-repeat";
    const size = state.fillMode === "pattern" ? `${formatCssPercent(100 / state.fillGrid)} ${formatCssPercent(100 / state.fillGrid)}` : "100% 100%";
    return {
      kind: "image",
      source: "dot",
      src,
      gridSize: state.fillMode === "pattern" ? state.fillGrid : DEFAULT_FILL_GRID,
      color: "#edf1eb",
      size,
      position: "center",
      repeat,
      dotGridSize: state.dotGridSize,
      dotType: state.dotType,
      dotPixels: state.dotPixels.slice(),
    };
  }

  function makeDotPreviewSkin() {
    return {
      kind: "image",
      source: "dot",
      src: makeDotImageSrc(),
      gridSize: DEFAULT_FILL_GRID,
      color: "#edf1eb",
      size: "100% 100%",
      position: "center",
      repeat: "no-repeat",
    };
  }

  function makeDotImageSrc() {
    const canvas = document.createElement("canvas");
    canvas.width = state.dotGridSize;
    canvas.height = state.dotGridSize;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    state.dotPixels.forEach((color, index) => {
      if (!color) return;
      const x = index % state.dotGridSize;
      const y = Math.floor(index / state.dotGridSize);
      context.fillStyle = color;
      context.fillRect(x, y, 1, 1);
    });
    return canvas.toDataURL("image/png");
  }

  function setView(view) {
    state.view = view;
    els.appShell.dataset.view = view;
    if (view !== "maker") hideMakerNotice();
    els.viewButtons.forEach((button) => {
      const isActive = button.dataset.viewButton === view;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    if (view === "play") {
      setStatus("3개 중 하나를 고르세요");
    } else if (view === "maker" && !state.hasOpenedMaker) {
      state.hasOpenedMaker = true;
      openThemeStartPanel();
    }
  }

  function setActiveColor(color, activeSwatch) {
    state.activeColor = color;
    els.colorPicker.value = color;
    els.dotColorPicker.value = color;
    els.swatches.forEach((swatch) => swatch.classList.toggle("is-active", swatch === activeSwatch));
    document.querySelectorAll(".color-input").forEach((input) => input.classList.toggle("is-active", !activeSwatch));
    syncDrawControls();
    syncDotControls();
    if (state.mode !== "draw" && state.mode !== "dot") {
      setTool("dot");
    }
  }

  function makeTray() {
    state.pieces = [makePiece(), makePiece(), makePiece()];
    state.selectedPieceId = state.pieces[0].id;
  }

  function seedBoard() {
    const target = START_FILL_MIN + Math.floor(Math.random() * START_FILL_VARIANCE);
    let filled = 0;
    let attempts = 0;
    while (filled < target && attempts < 240) {
      attempts += 1;
      const shape = normalizeShape(pickSeedShape());
      const bounds = getBounds(shape);
      const row = Math.floor(Math.random() * (BOARD_SIZE - bounds.rows + 1));
      const col = Math.floor(Math.random() * (BOARD_SIZE - bounds.cols + 1));
      const seedPiece = {
        shape,
        skin: makeSkinForShape(shape, state.skinPack),
      };
      if (!canPlace(seedPiece, row, col) || wouldCompleteLine(shape, row, col)) continue;
      shape.forEach(([x, y], index) => {
        state.board[row + y][col + x] = cloneSkin(seedPiece.skin[index]);
      });
      filled += shape.length;
    }
  }

  function pickSeedShape() {
    const seedShapes = SHAPES.filter((shape) => shape.length <= 3);
    return seedShapes[Math.floor(Math.random() * seedShapes.length)];
  }

  function wouldCompleteLine(shape, row, col) {
    const rowCounts = Array.from({ length: BOARD_SIZE }, (_, targetRow) =>
      state.board[targetRow].filter(Boolean).length,
    );
    const colCounts = Array.from({ length: BOARD_SIZE }, (_, targetCol) => {
      let count = 0;
      for (let targetRow = 0; targetRow < BOARD_SIZE; targetRow += 1) {
        if (state.board[targetRow][targetCol]) count += 1;
      }
      return count;
    });
    shape.forEach(([x, y]) => {
      rowCounts[row + y] += 1;
      colCounts[col + x] += 1;
    });
    return rowCounts.some((count) => count >= BOARD_SIZE) || colCounts.some((count) => count >= BOARD_SIZE);
  }

  function makePiece() {
    const shape = normalizeShape(pickShape());
    return {
      id:
        globalThis.crypto && globalThis.crypto.randomUUID
          ? globalThis.crypto.randomUUID()
          : String(Date.now() + Math.random()),
      shape,
      skin: makeSkinForShape(shape, state.skinPack),
      used: false,
    };
  }

  function pickShape() {
    const roll = Math.random();
    const maxCells = roll < 0.62 ? 4 : roll < 0.92 ? 5 : 6;
    const candidates = SHAPES.filter((shape) => shape.length <= maxCells);
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function makeColorPack(colors) {
    return {
      kind: "cells",
      cells: colors.map((color) => ({ kind: "color", color })),
    };
  }

  function makeCellsPack(cells) {
    return {
      kind: "cells",
      cells: cells.map((skin) => cloneSkin(skin)),
    };
  }

  function normalizeDesigns(designs) {
    if (!Array.isArray(designs)) return DEFAULT_DESIGNS.map(cloneSkin);
    const validDesigns = designs
      .filter((skin) => skin && typeof skin === "object")
      .map((skin) => cloneSkin(skin));
    return validDesigns.length ? validDesigns : DEFAULT_DESIGNS.map(cloneSkin);
  }

  function designsFromPack(pack) {
    const normalized = normalizeSkinPack(pack);
    if (!normalized) return DEFAULT_DESIGNS.map(cloneSkin);
    if (normalized.kind === "cells") return normalizeDesigns(normalized.cells);
    if (normalized.kind === "photo") {
      return [makePhotoSkin({ shape: [[0, 0]] }, 0, normalized.src)];
    }
    if (normalized.kind === "patternImage") {
      return [makePatternImageSkin({ shape: [[0, 0]] }, 0, normalized.src, normalized.gridSize)];
    }
    if (normalized.kind === "texture") {
      return [makeTextureSkin(normalized.texture, 0, normalized.gridSize, { shape: [[0, 0]] })];
    }
    return DEFAULT_DESIGNS.map(cloneSkin);
  }

  function clampDesignIndex(index) {
    const parsed = Number(index);
    if (!Number.isFinite(parsed)) return 0;
    return Math.min(Math.max(0, Math.round(parsed)), Math.max(0, state.designs.length - 1));
  }

  function makePhotoPack(src) {
    return { kind: "photo", src, gridSize: DEFAULT_FILL_GRID };
  }

  function makeTexturePack(textureName, gridSize = state.fillGrid) {
    return { kind: "texture", texture: textureName, gridSize: normalizeFillGrid(gridSize) };
  }

  function makePatternImagePack(src, gridSize = state.fillGrid) {
    return { kind: "patternImage", src, gridSize: normalizeFillGrid(gridSize) };
  }

  function makeImagePackForGrid(src, gridSize = state.fillGrid) {
    const fillGrid = normalizeFillGrid(gridSize);
    return fillGrid <= 1 ? makePhotoPack(src) : makePatternImagePack(src, fillGrid);
  }

  function normalizeFillGrid(value, fallback = DEFAULT_FILL_GRID) {
    const parsed = Number(value);
    return FILL_GRID_OPTIONS.includes(parsed) ? parsed : fallback;
  }

  function normalizePatternGrid(value, fallback = DEFAULT_PATTERN_GRID) {
    const parsed = Number(value);
    return PATTERN_GRID_OPTIONS.includes(parsed) ? parsed : fallback;
  }

  function normalizeEraserSize(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return DEFAULT_ERASER_SIZE;
    return Math.min(72, Math.max(12, Math.round(parsed)));
  }

  function normalizePhotoScale(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return DEFAULT_PHOTO_SCALE;
    return Math.min(520, Math.max(45, Math.round(parsed)));
  }

  function normalizePhotoOffset(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return DEFAULT_PHOTO_OFFSET;
    return Math.min(100, Math.max(0, Math.round(parsed)));
  }

  function normalizeDrawZoom(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return DEFAULT_DRAW_ZOOM;
    return Math.min(3.6, Math.max(1, Math.round(parsed * 10) / 10));
  }

  function normalizeShapeSize(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return DEFAULT_SHAPE_SIZE;
    return Math.min(180, Math.max(24, Math.round(parsed)));
  }

  function normalizeOutlineWidth(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return DEFAULT_OUTLINE_WIDTH;
    return Math.min(14, Math.max(2, Math.round(parsed)));
  }

  function normalizeTemplateColors(colors) {
    const source = Array.isArray(colors) ? colors : [];
    return DEFAULT_TEMPLATE_COLORS.map((fallback, index) => {
      const value = source[index];
      return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
    });
  }

  function normalizeTemplateIntensity(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return DEFAULT_TEMPLATE_INTENSITY;
    return Math.min(1, Math.max(0.35, Math.round(parsed * 100) / 100));
  }

  function normalizeTemplateScale(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return DEFAULT_TEMPLATE_SCALE;
    return Math.min(3.2, Math.max(0.7, Math.round(parsed * 10) / 10));
  }

  function normalizeEraserZoom(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return DEFAULT_ERASER_ZOOM;
    return Math.min(3.6, Math.max(0.8, Math.round(parsed * 10) / 10));
  }

  function normalizeEraserShape(value) {
    return ERASER_SHAPES.includes(value) ? value : DEFAULT_ERASER_SHAPE;
  }

  function normalizeDotGridSize(value, fallback = DEFAULT_DOT_GRID) {
    const parsed = Number(value);
    return DOT_GRID_OPTIONS.includes(parsed) ? parsed : fallback;
  }

  function normalizeDotZoom(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return DEFAULT_DOT_ZOOM;
    return Math.min(4.8, Math.max(0.8, Math.round(parsed * 10) / 10));
  }

  function normalizeDotType(value) {
    return DOT_TYPE_OPTIONS.includes(value) ? value : DEFAULT_DOT_TYPE;
  }

  function makeBlankDotPixels(size) {
    return Array.from({ length: size * size }, () => null);
  }

  function normalizeDotPixels(pixels, size) {
    const total = size * size;
    const normalized = Array.isArray(pixels) ? pixels.slice(0, total) : [];
    while (normalized.length < total) normalized.push(null);
    return normalized.map((value) => (typeof value === "string" && value ? value : null));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getSkinPackGridSize(pack) {
    if (!pack || typeof pack !== "object") return DEFAULT_FILL_GRID;
    return normalizeFillGrid(pack.gridSize, DEFAULT_FILL_GRID);
  }

  function formatFillGrid(gridSize) {
    const fillGrid = normalizeFillGrid(gridSize);
    return fillGrid <= 1 ? "Single 1x1" : `${fillGrid}x${fillGrid} 패턴`;
  }

  function normalizeSkinPack(pack) {
    if (Array.isArray(pack) && pack.length) return makeCellsPack(pack);
    if (!pack || typeof pack !== "object") return null;
    if (pack.kind === "photo" && pack.src) return makePhotoPack(pack.src);
    if (pack.kind === "patternImage" && pack.src) return makePatternImagePack(pack.src, pack.gridSize);
    if (pack.kind === "texture" && TEXTURES[pack.texture]) return makeTexturePack(pack.texture, pack.gridSize);
    if (pack.kind === "cells" && Array.isArray(pack.cells) && pack.cells.length) return makeCellsPack(pack.cells);
    return null;
  }

  function makeSkinForShape(shape, sourcePack) {
    const pack = normalizeSkinPack(sourcePack) || makeColorPack(DEFAULT_COLORS);
    if (pack.kind === "photo") {
      return shape.map((_, index) => makePhotoSkin({ shape }, index, pack.src));
    }
    if (pack.kind === "texture") {
      return shape.map((_, index) => makeTextureSkin(pack.texture, index, pack.gridSize, { shape }));
    }
    if (pack.kind === "patternImage") {
      if (getSkinPackGridSize(pack) <= 1) {
        return shape.map((_, index) => makePhotoSkin({ shape }, index, pack.src));
      }
      return shape.map((_, index) => makePatternImageSkin({ shape }, index, pack.src, pack.gridSize));
    }
    return shape.map(() => cloneSkin(pack.cells[Math.floor(Math.random() * pack.cells.length)]));
  }

  function cloneSkin(skin) {
    if (!skin || typeof skin !== "object") return makeBlankSkin();
    return {
      ...skin,
      dotPixels: Array.isArray(skin.dotPixels) ? skin.dotPixels.slice() : skin.dotPixels,
    };
  }

  function normalizeShape(shape) {
    const minX = Math.min(...shape.map(([x]) => x));
    const minY = Math.min(...shape.map(([, y]) => y));
    return shape
      .map(([x, y]) => [x - minX, y - minY])
      .sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  }

  function getBounds(shape) {
    const maxX = Math.max(...shape.map(([x]) => x));
    const maxY = Math.max(...shape.map(([, y]) => y));
    return { cols: maxX + 1, rows: maxY + 1 };
  }

  function renderAll() {
    syncWorkshopState();
    renderScores();
    renderBoard();
    renderTray();
    renderEditor();
    renderWorkspace();
    renderDesignSlots();
    renderSimulation();
    renderThemeLibrary();
  }

  function renderScores() {
    els.score.textContent = String(state.score);
    els.bestScore.textContent = String(state.bestScore);
    els.combo.textContent = String(state.combo);
  }

  function renderBoard() {
    Array.from(els.board.children).forEach((cell) => {
      const row = Number(cell.dataset.row);
      const col = Number(cell.dataset.col);
      const skin = state.board[row][col];
      cell.className = "board-cell";
      clearSkinStyle(cell);
      if (skin) {
        cell.classList.add("is-filled");
        applySkinStyle(cell, skin);
      }
    });
  }

  function renderTray() {
    els.pieceTray.innerHTML = "";
    state.pieces.forEach((piece) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "piece-card";
      card.dataset.pieceId = piece.id;
      card.setAttribute("aria-label", "블록 선택");
      card.classList.toggle("is-selected", piece.id === state.selectedPieceId);
      card.classList.toggle("is-used", piece.used);
      card.appendChild(createPieceGrid(piece));
      card.addEventListener("click", () => {
        if (piece.used || state.gameOver) return;
        state.selectedPieceId = piece.id;
        renderTray();
        renderEditor();
        setStatus("선택한 블록을 놓으세요");
      });
      card.addEventListener("pointerdown", (event) => {
        if (piece.used || state.gameOver) return;
        event.preventDefault();
        state.selectedPieceId = piece.id;
        startDrag(piece, event);
      });
      els.pieceTray.appendChild(card);
    });
  }

  function createPieceGrid(piece) {
    const grid = document.createElement("div");
    grid.className = "piece-grid";
    grid.style.setProperty("--cols", String(EDITOR_SIZE));
    grid.style.setProperty("--rows", String(EDITOR_SIZE));
    const offset = centerOffset(piece.shape);
    for (let y = 0; y < EDITOR_SIZE; y += 1) {
      for (let x = 0; x < EDITOR_SIZE; x += 1) {
        const shapeX = x - offset.x;
        const shapeY = y - offset.y;
        const index = piece.shape.findIndex(([cellX, cellY]) => cellX === shapeX && cellY === shapeY);
        const cell = document.createElement("div");
        cell.className = index >= 0 ? "piece-cell is-filled" : "piece-cell is-empty";
        if (index >= 0) applySkinStyle(cell, piece.skin[index]);
        grid.appendChild(cell);
      }
    }
    return grid;
  }

  function renderEditor() {
    els.editorGrid.innerHTML = "";
    const piece = getSelectedPiece();
    els.editorGrid.style.setProperty("--cols", String(EDITOR_SIZE));
    els.editorGrid.style.setProperty("--rows", String(EDITOR_SIZE));
    if (!piece) {
      fillEmptyEditor();
      return;
    }

    const offset = centerOffset(piece.shape);
    for (let y = 0; y < EDITOR_SIZE; y += 1) {
      for (let x = 0; x < EDITOR_SIZE; x += 1) {
        const shapeX = x - offset.x;
        const shapeY = y - offset.y;
        const index = piece.shape.findIndex(([cellX, cellY]) => cellX === shapeX && cellY === shapeY);
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = index >= 0 ? "editor-cell is-filled" : "editor-cell is-empty";
        if (index >= 0) {
          applySkinStyle(cell, piece.skin[index]);
          cell.addEventListener("click", () => editPieceCell(piece, index));
        }
        els.editorGrid.appendChild(cell);
      }
    }
  }

  function fillEmptyEditor() {
    for (let index = 0; index < EDITOR_SIZE * EDITOR_SIZE; index += 1) {
      const cell = document.createElement("div");
      cell.className = "editor-cell is-empty";
      els.editorGrid.appendChild(cell);
    }
  }

  function renderWorkspace() {
    clearSkinStyle(els.cellWorkspace);
    clearSkinStyle(els.imageFrame);
    clearSkinStyle(els.templateFrame);
    els.cellWorkspace.classList.toggle("is-draft-empty", !state.draftActive);
    els.imageFrame.classList.toggle("is-draft-empty", !state.draftActive);
    els.templateFrame.classList.toggle("is-draft-empty", !state.draftActive);
    els.cellWorkspace.disabled = !state.draftActive;
    els.imageFrame.disabled = !state.draftActive;
    els.templateFrame.disabled = !state.draftActive;
    if (!state.draftActive) return;
    const skin = state.draftDesign || makeBlankSkin();
    applySkinStyle(els.cellWorkspace, skin);
    applySkinStyle(els.imageFrame, skin);
    applySkinStyle(els.templateFrame, skin);
    if (state.mode === "erase" && !state.erasing) renderEraserCanvas();
  }

  function renderDesignSlots() {
    els.designSlots.innerHTML = "";
    state.designs.forEach((skin, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "design-slot";
      button.classList.toggle("is-active", index === state.activeDesignIndex);
      button.setAttribute("aria-label", `${index + 1}번 저장 블록`);
      applySkinStyle(button, skin);
      button.addEventListener("click", () => {
        state.activeDesignIndex = index;
        activateDraftFromSkin(state.designs[index]);
        renderAll();
        persist();
        setStatus("블록 슬롯 편집 시작");
      });
      els.designSlots.appendChild(button);
    });
    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "design-slot is-add-slot";
    addButton.setAttribute("aria-label", "새 블록 추가");
    addButton.textContent = "+";
    addButton.addEventListener("click", addBlockSlot);
    els.designSlots.appendChild(addButton);
  }

  function renderSimulation() {
    els.simulationTrack.innerHTML = "";
    getSimulationItems().forEach((piece, index) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "simulation-card";
      card.setAttribute("aria-label", `${index + 1}번 블록 디자인 확대`);
      card.appendChild(createSimulationPieceGrid(piece));
      card.addEventListener("click", () => openSimulationPreview(piece));
      els.simulationTrack.appendChild(card);
    });
  }

  function getSimulationItems() {
    const designs = getSimulationDesigns();
    const shapeOffset = SIMULATION_SHAPES.length ? state.simulationSeed % SIMULATION_SHAPES.length : 0;
    const designOffset = designs.length ? state.simulationSeed % designs.length : 0;
    const orderedDesigns = rotateArray(designs, designOffset);
    const orderedShapes = rotateArray(SIMULATION_SHAPES, shapeOffset);
    const items = [];
    const total = Math.max(orderedShapes.length * Math.max(1, orderedDesigns.length), orderedShapes.length);
    for (let index = 0; index < total; index += 1) {
      const shape = orderedShapes[index % orderedShapes.length];
      const skin = orderedDesigns[index % orderedDesigns.length];
      items.push({
        shape,
        skin: shape.map(() => cloneSkin(skin)),
      });
    }
    return items;
  }

  function getSimulationDesigns() {
    const designs = normalizeDesigns(state.designs).map(cloneSkin);
    if (state.draftActive && state.draftDesign) {
      const index = clampDesignIndex(state.activeDesignIndex);
      designs[index] = cloneSkin(state.draftDesign);
    }
    return designs.length ? designs : DEFAULT_DESIGNS.map(cloneSkin);
  }

  function rotateArray(items, offset) {
    if (!items.length) return [];
    const start = ((offset % items.length) + items.length) % items.length;
    return items.slice(start).concat(items.slice(0, start));
  }

  function openSimulationPreview(piece) {
    els.simulationPreviewCard.innerHTML = "";
    const previewPiece = {
      shape: piece.shape.map(([x, y]) => [x, y]),
      skin: piece.skin.map(cloneSkin),
    };
    els.simulationPreviewCard.appendChild(createSimulationPieceGrid(previewPiece));
    els.simulationPreview.hidden = false;
  }

  function createSimulationPieceGrid(piece) {
    const grid = document.createElement("div");
    const bounds = getBounds(piece.shape);
    grid.className = "piece-grid simulation-piece-grid";
    grid.style.setProperty("--cols", String(bounds.cols));
    grid.style.setProperty("--rows", String(bounds.rows));
    for (let y = 0; y < bounds.rows; y += 1) {
      for (let x = 0; x < bounds.cols; x += 1) {
        const index = piece.shape.findIndex(([cellX, cellY]) => cellX === x && cellY === y);
        const cell = document.createElement("div");
        cell.className = index >= 0 ? "piece-cell is-filled" : "piece-cell is-empty";
        if (index >= 0) applySkinStyle(cell, piece.skin[index]);
        grid.appendChild(cell);
      }
    }
    return grid;
  }

  function closeSimulationPreview() {
    els.simulationPreview.hidden = true;
    els.simulationPreviewCard.innerHTML = "";
  }

  function centerOffset(shape) {
    const bounds = getBounds(shape);
    return {
      x: Math.floor((EDITOR_SIZE - bounds.cols) / 2),
      y: Math.floor((EDITOR_SIZE - bounds.rows) / 2),
    };
  }

  function editPieceCell(piece, index) {
    if (state.mode === "erase") {
      erasePieceCells(piece, index);
    } else if (state.mode === "image") {
      if (!state.photoSrc) {
        setStatus("사진을 선택하세요");
        return;
      }
      piece.skin[index] =
        state.fillMode === "pattern"
          ? makePatternImageSkin(piece, index, state.photoSrc, state.fillGrid)
          : makePhotoSkin(piece, index, state.photoSrc);
    } else {
      piece.skin[index] = { kind: "color", color: state.activeColor };
    }
    state.skinPack = makeCellsPack(piece.skin);
    persist();
    renderAll();
  }

  function erasePieceCells(piece, index) {
    const [centerX, centerY] = piece.shape[index];
    const radius = Math.max(0, state.eraserSize - 1);
    piece.shape.forEach(([x, y], targetIndex) => {
      const distance = Math.max(Math.abs(x - centerX), Math.abs(y - centerY));
      if (distance <= radius) {
        piece.skin[targetIndex] = makeBlankSkin();
      }
    });
  }

  function makeBlankSkin() {
    return { kind: "color", color: "#dfe6dc" };
  }

  function applyPhotoToPiece(piece) {
    piece.skin = piece.shape.map((_, index) => makePhotoSkin(piece, index, state.photoSrc));
  }

  function applyPhotoPack(message = `${formatFillGrid(state.fillGrid)} 이미지 적용 완료`, options = {}) {
    const src = state.photoSrc || (state.draftDesign && state.draftDesign.kind === "image" ? state.draftDesign.src : "");
    if (!src) {
      setStatus("사진을 선택하세요");
      return;
    }
    state.photoSrc = src;
    updateDraftDesign(makeImageDraftSkin(src), message, options);
  }

  function applyImagePatternPack() {
    const src = state.photoSrc || (state.draftDesign && state.draftDesign.kind === "image" ? state.draftDesign.src : "");
    if (!src) {
      setStatus("사진을 선택하세요");
      return;
    }
    state.photoSrc = src;
    setFillMode("pattern", { apply: false });
    updateDraftDesign(makeImageDraftSkin(src), `${formatFillGrid(state.fillGrid)} 이미지 적용 완료`);
  }

  function makeImageDraftSkin(src) {
    const gridSize = state.fillMode === "pattern" ? state.fillGrid : DEFAULT_FILL_GRID;
    const repeat = gridSize > 1 ? "repeat" : "no-repeat";
    const visibleScale = gridSize > 1 ? state.photoScale / gridSize : state.photoScale;
    return {
      kind: "image",
      src,
      gridSize,
      color: "#edf1eb",
      size: `${formatCssPercent(visibleScale)} ${formatCssPercent(visibleScale)}`,
      position: `${formatCssPercent(state.photoOffsetX)} ${formatCssPercent(state.photoOffsetY)}`,
      repeat,
    };
  }

  function hydrateDraftToolState() {
    const skin = state.draftDesign;
    if (!skin || typeof skin !== "object") return;
    if (skin.kind === "image" && skin.src) {
      state.photoSrc = skin.src;
      hydratePhotoControlsFromSkin(skin);
    }
    if (skin.source === "dot") {
      state.dotGridSize = normalizeDotGridSize(skin.dotGridSize, state.dotGridSize);
      state.dotType = normalizeDotType(skin.dotType || state.dotType);
      state.dotPixels = normalizeDotPixels(skin.dotPixels, state.dotGridSize);
    }
    if (skin.kind === "texture" && skin.texture) {
      state.activePattern = TEXTURES[skin.texture] ? skin.texture : state.activePattern;
      state.templateColors = normalizeTemplateColors(skin.templateColors);
      state.templateIntensity = normalizeTemplateIntensity(skin.templateIntensity);
      state.templateScale = normalizeTemplateScale(skin.templateScale);
    }
  }

  function hydratePhotoControlsFromSkin(skin) {
    const size = parseCssPercentPair(skin.size);
    const position = parseCssPercentPair(skin.position);
    const gridSize = normalizeFillGrid(skin.gridSize, DEFAULT_FILL_GRID);
    if (size) {
      state.photoScale = normalizePhotoScale((skin.repeat === "repeat" ? gridSize : 1) * size.x);
    }
    if (position) {
      state.photoOffsetX = normalizePhotoOffset(position.x);
      state.photoOffsetY = normalizePhotoOffset(position.y);
    }
  }

  function parseCssPercentPair(value) {
    if (typeof value !== "string") return null;
    const matches = value.match(/-?\d+(\.\d+)?%/g);
    if (!matches || !matches.length) return null;
    const first = Number(matches[0].replace("%", ""));
    const second = Number((matches[1] || matches[0]).replace("%", ""));
    if (!Number.isFinite(first) || !Number.isFinite(second)) return null;
    return { x: first, y: second };
  }

  function syncPhotoControls() {
    els.imageScale.value = String(state.photoScale);
    updateToolViewport();
    return true;
  }

  function syncDotControls() {
    els.dotZoom.value = String(state.dotZoom);
    els.dotGridButtons.forEach((button) => {
      const isActive = normalizeDotGridSize(button.dataset.dotGrid) === state.dotGridSize;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    els.dotTypeButtons.forEach((button) => {
      const isActive = normalizeDotType(button.dataset.dotType) === state.dotType;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    if (els.dotGridValue) els.dotGridValue.textContent = `${state.dotGridSize}x${state.dotGridSize}`;
    if (els.dotColorChip) els.dotColorChip.style.setProperty("--chip", state.activeColor);
    if (els.dotTypeValue) els.dotTypeValue.textContent = getDotTypeLabel(state.dotType);
    updateToolViewport();
  }

  function applyFillPack() {
    setFillMode("single", { apply: false });
    updateDraftDesign({ kind: "color", color: state.activeColor }, "도트 적용 완료");
  }

  function applyTexturePack(textureName, options = {}) {
    if (!TEXTURES[textureName]) return;
    updateDraftDesign(
      makeTextureSkin(textureName, 0, state.fillMode === "pattern" ? state.fillGrid : DEFAULT_FILL_GRID, {
        shape: [[0, 0]],
      }),
      `${formatFillGrid(state.fillGrid)} 템플릿 적용 완료`,
      options,
    );
  }

  function applyPackToAvailablePieces() {
    state.pieces.forEach((piece) => {
      if (!piece.used) {
        piece.skin = makeSkinForShape(piece.shape, state.skinPack);
      }
    });
  }

  function makePhotoSkin(piece, index, src) {
    const [x, y] = piece.shape[index];
    const bounds = getBounds(piece.shape);
    const posX = bounds.cols <= 1 ? 50 : (x / (bounds.cols - 1)) * 100;
    const posY = bounds.rows <= 1 ? 50 : (y / (bounds.rows - 1)) * 100;
    return {
      kind: "image",
      src,
      gridSize: DEFAULT_FILL_GRID,
      color: "#edf1eb",
      size: `${bounds.cols * 100}% ${bounds.rows * 100}%`,
      position: `${posX}% ${posY}%`,
    };
  }

  function makeTextureSkin(textureName, index, gridSize = DEFAULT_FILL_GRID, piece = { shape: [[0, 0]] }) {
    const texture = TEXTURES[textureName] || TEXTURES.neon;
    const tileStyle = makePatternTileStyle(piece, index, gridSize);
    const templateColors = normalizeTemplateColors(state.templateColors);
    return {
      kind: "texture",
      texture: textureName,
      gridSize: normalizeFillGrid(gridSize),
      color: templateColors[0] || texture.color,
      image: buildTextureImage(textureName, templateColors, state.templateIntensity, state.templateScale),
      size: tileStyle.size,
      position: tileStyle.position,
      repeat: tileStyle.repeat,
      templateColors,
      templateIntensity: state.templateIntensity,
      templateScale: state.templateScale,
    };
  }

  function buildTextureImage(textureName, colors, intensity = DEFAULT_TEMPLATE_INTENSITY, scale = DEFAULT_TEMPLATE_SCALE) {
    const [a, b, c, d] = normalizeTemplateColors(colors);
    const bright = rgbaFromHex(d, 0.28 + intensity * 0.42);
    const shade = rgbaFromHex("#000000", 0.08 + intensity * 0.18);
    const step = Math.max(5, Math.round(12 / scale));
    const wide = Math.max(9, Math.round(22 / scale));
    if (textureName === "candy") {
      return `repeating-linear-gradient(135deg, ${bright} 0 ${step}px, transparent ${step}px ${wide}px), linear-gradient(135deg, ${a}, ${b} 52%, ${c})`;
    }
    if (textureName === "stone") {
      return `radial-gradient(circle at 24% 28%, ${bright}, transparent ${Math.round(22 * scale)}%), radial-gradient(circle at 72% 68%, ${shade}, transparent ${Math.round(30 * scale)}%), linear-gradient(135deg, ${a}, ${b})`;
    }
    if (textureName === "stripe") {
      return `repeating-linear-gradient(135deg, ${a} 0 ${step}px, ${d} ${step}px ${step + 5}px, ${b} ${step + 5}px ${wide}px, ${c} ${wide}px ${wide + step}px)`;
    }
    if (textureName === "dotPop") {
      return `radial-gradient(circle, ${d} 0 ${Math.round(16 * intensity)}%, transparent ${Math.round(18 * intensity + 8)}%), linear-gradient(135deg, ${a}, ${b} 58%, ${c})`;
    }
    if (textureName === "glass") {
      return `linear-gradient(135deg, ${rgbaFromHex(d, 0.48 + intensity * 0.28)}, transparent 46%), radial-gradient(circle at 72% 70%, ${rgbaFromHex(c, 0.35)}, transparent 30%), linear-gradient(135deg, ${a}, ${b})`;
    }
    if (textureName === "carbon") {
      return `repeating-linear-gradient(45deg, ${rgbaFromHex(d, 0.1 + intensity * 0.22)} 0 ${step}px, transparent ${step}px ${wide}px), repeating-linear-gradient(-45deg, ${shade} 0 ${step}px, transparent ${step}px ${wide}px), linear-gradient(135deg, ${a}, ${b})`;
    }
    if (textureName === "wave") {
      return `radial-gradient(ellipse at 28% 40%, ${bright}, transparent ${Math.round(34 * scale)}%), repeating-linear-gradient(90deg, ${a} 0 ${wide}px, ${b} ${wide}px ${wide * 2}px, ${c} ${wide * 2}px ${wide * 3}px)`;
    }
    return `linear-gradient(135deg, ${bright}, transparent 34%), radial-gradient(circle at 30% 28%, ${rgbaFromHex(d, 0.3 + intensity * 0.38)}, transparent ${Math.round(24 * scale)}%), linear-gradient(135deg, ${a}, ${b} 58%, ${c})`;
  }

  function rgbaFromHex(hex, alpha) {
    const normalized = typeof hex === "string" && /^#[0-9a-f]{6}$/i.test(hex) ? hex.slice(1) : "ffffff";
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${Math.min(1, Math.max(0, Number(alpha) || 0))})`;
  }

  function makePatternImageSkin(piece, index, src, gridSize = DEFAULT_FILL_GRID) {
    const tileStyle = makePatternTileStyle(piece, index, gridSize);
    return {
      kind: "image",
      src,
      gridSize: normalizeFillGrid(gridSize),
      color: "#edf1eb",
      size: tileStyle.size,
      position: tileStyle.position,
      repeat: tileStyle.repeat,
    };
  }

  function makePatternTileStyle(piece, index, gridSize) {
    const fillGrid = normalizeFillGrid(gridSize);
    const shape = piece && Array.isArray(piece.shape) && piece.shape.length ? piece.shape : [[0, 0]];
    const [x, y] = shape[index] || [0, 0];
    const bounds = getBounds(shape);
    if (fillGrid <= 1) {
      const posX = bounds.cols <= 1 ? 50 : (x / (bounds.cols - 1)) * 100;
      const posY = bounds.rows <= 1 ? 50 : (y / (bounds.rows - 1)) * 100;
      return {
        size: `${bounds.cols * 130}% ${bounds.rows * 130}%`,
        position: `${formatCssPercent(posX)} ${formatCssPercent(posY)}`,
        repeat: "no-repeat",
      };
    }
    const tileCols = Math.max(0.18, bounds.cols / fillGrid);
    const tileRows = Math.max(0.18, bounds.rows / fillGrid);
    return {
      size: `${formatCssPercent(tileCols * 100)} ${formatCssPercent(tileRows * 100)}`,
      position: `${formatCssPercent(-x * 100)} ${formatCssPercent(-y * 100)}`,
      repeat: "repeat",
    };
  }

  function formatCssPercent(value) {
    return `${Number(value.toFixed(2))}%`;
  }

  function tryPlace(piece, row, col) {
    if (state.resolving) return false;
    if (piece.used || !canPlace(piece, row, col)) {
      setStatus("놓을 수 없는 위치입니다");
      showFeedback("NO SPACE", "bad");
      shakeBoard();
      playTone(130, 0.07, "sawtooth", 0.025);
      clearPreview();
      return false;
    }

    state.resolving = true;
    const placedCells = [];
    piece.shape.forEach(([x, y], index) => {
      state.board[row + y][col + x] = cloneSkin(piece.skin[index]);
      placedCells.push({ row: row + y, col: col + x });
    });
    piece.used = true;
    const placeScore = piece.shape.length * 10;
    state.score += placeScore;
    const clearInfo = getCompletedLines();
    if (clearInfo.count > 0) {
      state.combo += 1;
      const clearScore = clearInfo.count * clearInfo.count * 100 + state.combo * 30;
      state.score += clearScore;
      setStatus(`${clearInfo.count}줄 제거`);
    } else {
      state.combo = 0;
      setStatus("남은 후보를 고르세요");
    }

    clearPreview();
    renderAll();
    markBoardCells(placedCells, "is-new");
    pulseElement(els.score);
    playTone(380 + piece.shape.length * 28, 0.06, "triangle", 0.035);

    if (clearInfo.count > 0) {
      markBoardCells(clearInfo.cells, "is-clearing");
      showFeedback(state.combo > 1 ? `COMBO x${state.combo}` : `CLEAR +${clearInfo.count}`, "good");
      playTone(620 + clearInfo.count * 120, 0.12, "square", 0.03);
      setTimeout(() => {
        clearBoardCells(clearInfo.cells);
        finishPlacement(clearInfo.count);
      }, 210);
    } else {
      showFeedback(`+${placeScore}`, "neutral");
      setTimeout(() => finishPlacement(0), 180);
    }
    return true;
  }

  function finishPlacement(cleared) {
    if (state.score > state.bestScore) {
      state.bestScore = state.score;
      persist();
    }

    if (state.pieces.every((candidate) => candidate.used)) {
      makeTray();
      setStatus(cleared > 0 ? `${cleared}줄 제거! 새 후보 3개` : "새 후보 3개");
    } else {
      selectNextAvailablePiece();
      setStatus(cleared > 0 ? `${cleared}줄 제거! 남은 후보를 고르세요` : "남은 후보를 고르세요");
    }

    state.resolving = false;
    renderAll();
    checkGameOver();
  }

  function canPlace(piece, row, col) {
    return piece.shape.every(([x, y]) => {
      const targetRow = row + y;
      const targetCol = col + x;
      return (
        targetRow >= 0 &&
        targetRow < BOARD_SIZE &&
        targetCol >= 0 &&
        targetCol < BOARD_SIZE &&
        !state.board[targetRow][targetCol]
      );
    });
  }

  function getCompletedLines() {
    const rows = [];
    const cols = [];
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      if (state.board[row].every(Boolean)) rows.push(row);
    }
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      let full = true;
      for (let row = 0; row < BOARD_SIZE; row += 1) {
        if (!state.board[row][col]) {
          full = false;
          break;
        }
      }
      if (full) cols.push(col);
    }

    const cellsByKey = new Map();
    rows.forEach((row) => {
      for (let col = 0; col < BOARD_SIZE; col += 1) cellsByKey.set(`${row}:${col}`, { row, col });
    });
    cols.forEach((col) => {
      for (let row = 0; row < BOARD_SIZE; row += 1) cellsByKey.set(`${row}:${col}`, { row, col });
    });
    return {
      count: rows.length + cols.length,
      cells: Array.from(cellsByKey.values()),
      rows,
      cols,
    };
  }

  function clearBoardCells(cells) {
    cells.forEach(({ row, col }) => {
      state.board[row][col] = null;
    });
  }

  function checkGameOver() {
    const alive = state.pieces.some((piece) => !piece.used && canFitAnywhere(piece));
    if (alive) return;
    state.gameOver = true;
    els.gameMessage.hidden = false;
    setStatus("게임 종료");
  }

  function canFitAnywhere(piece) {
    const bounds = getBounds(piece.shape);
    for (let row = 0; row <= BOARD_SIZE - bounds.rows; row += 1) {
      for (let col = 0; col <= BOARD_SIZE - bounds.cols; col += 1) {
        if (canPlace(piece, row, col)) return true;
      }
    }
    return false;
  }

  function startDrag(piece, event) {
    state.drag = { piece };
    renderTray();
    els.dragGhost.hidden = false;
    els.dragGhost.innerHTML = "";
    els.dragGhost.appendChild(createPieceGrid(piece));
    updateDrag(event);
  }

  function updateDrag(event) {
    els.dragGhost.style.left = `${event.clientX - 65}px`;
    els.dragGhost.style.top = `${event.clientY - 65}px`;
  }

  function endDrag() {
    state.drag = null;
    els.dragGhost.hidden = true;
    els.dragGhost.innerHTML = "";
  }

  function previewFromPointer(event) {
    const drop = getBoardCellFromPoint(event.clientX, event.clientY);
    clearPreview();
    if (!drop || !state.drag) return;
    const valid = canPlace(state.drag.piece, drop.row, drop.col);
    state.drag.piece.shape.forEach(([x, y]) => {
      const row = drop.row + y;
      const col = drop.col + x;
      if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return;
      const cell = getBoardCell(row, col);
      cell.classList.add(valid ? "is-preview-valid" : "is-preview-invalid");
    });
  }

  function getBoardCellFromPoint(clientX, clientY) {
    const element = document.elementFromPoint(clientX, clientY);
    const cell = element && element.closest ? element.closest(".board-cell") : null;
    if (!cell || !els.board.contains(cell)) return null;
    return {
      row: Number(cell.dataset.row),
      col: Number(cell.dataset.col),
    };
  }

  function clearPreview() {
    Array.from(els.board.children).forEach((cell) => {
      cell.classList.remove("is-preview-valid", "is-preview-invalid");
    });
  }

  function getBoardCell(row, col) {
    return els.board.children[row * BOARD_SIZE + col];
  }

  function markBoardCells(cells, className) {
    cells.forEach(({ row, col }) => {
      const cell = getBoardCell(row, col);
      if (!cell) return;
      cell.classList.add(className);
      setTimeout(() => cell.classList.remove(className), 260);
    });
  }

  function getSelectedPiece() {
    return state.pieces.find((piece) => piece.id === state.selectedPieceId && !piece.used) || null;
  }

  function selectNextAvailablePiece() {
    const nextPiece = state.pieces.find((piece) => !piece.used);
    state.selectedPieceId = nextPiece ? nextPiece.id : null;
  }

  function applySkinStyle(element, skin) {
    element.style.setProperty("--fill", skin.color || "#2ec4b6");
    if (skin.kind === "image" && skin.src) {
      element.style.setProperty("--image", `url("${skin.src}")`);
      element.style.setProperty("--bg-size", skin.size || "cover");
      element.style.setProperty("--bg-position", skin.position || "center");
      element.style.setProperty("--bg-repeat", skin.repeat || "no-repeat");
    } else if (skin.kind === "texture" && skin.image) {
      element.style.setProperty("--image", skin.image);
      element.style.setProperty("--bg-size", skin.size || "cover");
      element.style.setProperty("--bg-position", skin.position || "center");
      element.style.setProperty("--bg-repeat", skin.repeat || "no-repeat");
    } else {
      element.style.setProperty(
        "--image",
        "linear-gradient(145deg, rgba(255,255,255,0.38), rgba(0,0,0,0.12))",
      );
      element.style.setProperty("--bg-size", "cover");
      element.style.setProperty("--bg-position", "center");
      element.style.setProperty("--bg-repeat", "no-repeat");
    }
  }

  function clearSkinStyle(element) {
    element.style.removeProperty("--fill");
    element.style.removeProperty("--image");
    element.style.removeProperty("--bg-size");
    element.style.removeProperty("--bg-position");
    element.style.removeProperty("--bg-repeat");
  }

  function setStatus(message) {
    els.statusText.textContent = message;
    if (state.view === "maker") showMakerNotice(message);
  }

  function showMakerNotice(message) {
    if (!els.makerNotice) return;
    window.clearTimeout(state.makerNoticeTimer);
    els.makerNotice.textContent = message;
    els.makerNotice.hidden = false;
    requestAnimationFrame(() => {
      els.makerNotice.classList.add("is-visible");
    });
    state.makerNoticeTimer = window.setTimeout(hideMakerNotice, 900);
  }

  function hideMakerNotice() {
    if (!els.makerNotice) return;
    window.clearTimeout(state.makerNoticeTimer);
    els.makerNotice.classList.remove("is-visible");
    state.makerNoticeTimer = window.setTimeout(() => {
      els.makerNotice.hidden = true;
    }, 130);
  }

  function showFeedback(message, tone) {
    if (!els.feedbackLayer) return;
    const item = document.createElement("div");
    item.className = `feedback-pop is-${tone}`;
    item.textContent = message;
    els.feedbackLayer.appendChild(item);
    setTimeout(() => item.remove(), 760);
  }

  function shakeBoard() {
    els.boardWrap.classList.remove("is-shaking");
    void els.boardWrap.offsetWidth;
    els.boardWrap.classList.add("is-shaking");
    setTimeout(() => els.boardWrap.classList.remove("is-shaking"), 260);
  }

  function pulseElement(element) {
    element.classList.remove("is-pulsing");
    void element.offsetWidth;
    element.classList.add("is-pulsing");
    setTimeout(() => element.classList.remove("is-pulsing"), 220);
  }

  function playTone(frequency, duration, type, gainValue) {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      state.audioContext = state.audioContext || new AudioContextClass();
      const oscillator = state.audioContext.createOscillator();
      const gain = state.audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.value = gainValue;
      oscillator.connect(gain);
      gain.connect(state.audioContext.destination);
      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, state.audioContext.currentTime + duration);
      oscillator.stop(state.audioContext.currentTime + duration);
    } catch (error) {
      // Audio feedback is optional; browsers can block it until interaction.
    }
  }

  async function readImageAsDataUrl(file) {
    const raw = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    return downscaleImage(raw, 520);
  }

  function downscaleImage(src, maxSize) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.onerror = () => resolve(src);
      image.src = src;
    });
  }

  function randomColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 62 + Math.floor(Math.random() * 22);
    const lightness = 48 + Math.floor(Math.random() * 14);
    return `hsl(${hue} ${saturation}% ${lightness}%)`;
  }

  boot();
})();
