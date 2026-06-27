(function () {
  "use strict";

  const BOARD_SIZE = 8;
  const EDITOR_SIZE = 5;
  const STORAGE_KEY = "mosaic-blocks-save-v1";

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

  const TEXTURES = {
    neon: {
      color: "#28d7ff",
      image:
        "linear-gradient(135deg, rgba(255,255,255,0.52), rgba(255,255,255,0) 34%), radial-gradient(circle at 30% 28%, #90fff4, transparent 28%), linear-gradient(135deg, #2176ff, #8b5cf6 58%, #ff4ecd)",
    },
    candy: {
      color: "#ff5d67",
      image:
        "repeating-linear-gradient(135deg, rgba(255,255,255,0.42) 0 9px, rgba(255,255,255,0) 9px 18px), linear-gradient(135deg, #ff5d67, #ffc43d)",
    },
    stone: {
      color: "#697586",
      image:
        "radial-gradient(circle at 22% 28%, rgba(255,255,255,0.28), transparent 20%), radial-gradient(circle at 70% 64%, rgba(0,0,0,0.24), transparent 24%), linear-gradient(135deg, #8b97a8, #4b5563)",
    },
  };

  const els = {
    appShell: document.getElementById("appShell"),
    board: document.getElementById("board"),
    score: document.getElementById("score"),
    bestScore: document.getElementById("bestScore"),
    combo: document.getElementById("combo"),
    pieceTray: document.getElementById("pieceTray"),
    statusText: document.getElementById("statusText"),
    editorGrid: document.getElementById("editorGrid"),
    newGame: document.getElementById("newGame"),
    restartFromOverlay: document.getElementById("restartFromOverlay"),
    gameMessage: document.getElementById("gameMessage"),
    modeButtons: Array.from(document.querySelectorAll(".mode-button")),
    swatches: Array.from(document.querySelectorAll(".swatch")),
    colorPicker: document.getElementById("colorPicker"),
    photoInput: document.getElementById("photoInput"),
    applyPhoto: document.getElementById("applyPhoto"),
    applyToAll: document.getElementById("applyToAll"),
    savePack: document.getElementById("savePack"),
    randomizeSkin: document.getElementById("randomizeSkin"),
    textureButtons: Array.from(document.querySelectorAll("[data-texture]")),
    viewButtons: Array.from(document.querySelectorAll("[data-view-button]")),
    dragGhost: document.getElementById("dragGhost"),
  };

  const state = {
    board: [],
    pieces: [],
    selectedPieceId: null,
    score: 0,
    bestScore: 0,
    combo: 0,
    mode: "paint",
    activeColor: DEFAULT_COLORS[0],
    photoSrc: "",
    skinPack: makeColorPack(DEFAULT_COLORS),
    drag: null,
    gameOver: false,
    view: "play",
  };

  function boot() {
    loadSave();
    buildBoard();
    bindEvents();
    startNewGame();
  }

  function loadSave() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      state.bestScore = Number(saved.bestScore) || 0;
      const savedPack = normalizeSkinPack(saved.skinPack);
      if (savedPack) {
        state.skinPack = savedPack;
      }
    } catch (error) {
      state.bestScore = 0;
    }
    els.bestScore.textContent = String(state.bestScore);
  }

  function persist() {
    const payload = {
      bestScore: state.bestScore,
      skinPack: state.skinPack,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function startNewGame() {
    state.board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    state.score = 0;
    state.combo = 0;
    state.selectedPieceId = null;
    state.gameOver = false;
    els.gameMessage.hidden = true;
    makeTray();
    renderAll();
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

  function bindEvents() {
    els.newGame.addEventListener("click", startNewGame);
    els.restartFromOverlay.addEventListener("click", startNewGame);
    els.viewButtons.forEach((button) => {
      button.addEventListener("click", () => setView(button.dataset.viewButton));
    });

    els.board.addEventListener("click", (event) => {
      const cell = event.target.closest(".board-cell");
      if (!cell || state.gameOver || state.drag) return;
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
        state.mode = button.dataset.mode;
        els.modeButtons.forEach((candidate) => candidate.classList.toggle("is-active", candidate === button));
        if (state.mode === "photo" && !state.photoSrc) {
          setStatus("사진을 선택하세요");
        }
      });
    });

    els.swatches.forEach((swatch) => {
      swatch.addEventListener("click", () => {
        setActiveColor(swatch.dataset.color, swatch);
      });
    });

    els.colorPicker.addEventListener("input", () => {
      setActiveColor(els.colorPicker.value, null);
    });

    els.photoInput.addEventListener("change", async () => {
      const file = els.photoInput.files && els.photoInput.files[0];
      if (!file) return;
      state.photoSrc = await readImageAsDataUrl(file);
      els.applyPhoto.disabled = false;
      state.mode = "photo";
      els.modeButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.mode === "photo"));
      applyPhotoPack();
    });

    els.applyPhoto.addEventListener("click", () => {
      applyPhotoPack();
    });

    els.applyToAll.addEventListener("click", () => {
      applyPackToAvailablePieces();
      renderAll();
      setStatus("저장된 팩 적용 완료");
    });

    els.savePack.addEventListener("click", () => {
      const piece = getSelectedPiece();
      if (!piece) return;
      if (state.skinPack.kind !== "photo" && state.skinPack.kind !== "texture") {
        state.skinPack = makeCellsPack(piece.skin);
      }
      persist();
      setStatus("팩 저장 완료");
    });

    els.randomizeSkin.addEventListener("click", () => {
      const piece = getSelectedPiece();
      if (!piece) return;
      piece.skin = piece.shape.map(() => ({ kind: "color", color: randomColor() }));
      renderAll();
      setStatus("랜덤 적용 완료");
    });

    els.textureButtons.forEach((button) => {
      button.addEventListener("click", () => {
        applyTexturePack(button.dataset.texture);
      });
    });
  }

  function setView(view) {
    state.view = view;
    els.appShell.dataset.view = view;
    els.viewButtons.forEach((button) => {
      const isActive = button.dataset.viewButton === view;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    if (view === "play") {
      setStatus("3개 중 하나를 고르세요");
    }
  }

  function setActiveColor(color, activeSwatch) {
    state.activeColor = color;
    state.mode = "paint";
    els.colorPicker.value = color;
    els.swatches.forEach((swatch) => swatch.classList.toggle("is-active", swatch === activeSwatch));
    document.querySelector(".color-input").classList.toggle("is-active", !activeSwatch);
    els.modeButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.mode === "paint"));
  }

  function makeTray() {
    state.pieces = [makePiece(), makePiece(), makePiece()];
    state.selectedPieceId = state.pieces[0].id;
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

  function makePhotoPack(src) {
    return { kind: "photo", src };
  }

  function makeTexturePack(textureName) {
    return { kind: "texture", texture: textureName };
  }

  function normalizeSkinPack(pack) {
    if (Array.isArray(pack) && pack.length) return makeCellsPack(pack);
    if (!pack || typeof pack !== "object") return null;
    if (pack.kind === "photo" && pack.src) return { kind: "photo", src: pack.src };
    if (pack.kind === "texture" && TEXTURES[pack.texture]) return { kind: "texture", texture: pack.texture };
    if (pack.kind === "cells" && Array.isArray(pack.cells) && pack.cells.length) return makeCellsPack(pack.cells);
    return null;
  }

  function makeSkinForShape(shape, sourcePack) {
    const pack = normalizeSkinPack(sourcePack) || makeColorPack(DEFAULT_COLORS);
    if (pack.kind === "photo") {
      return shape.map((_, index) => makePhotoSkin({ shape }, index, pack.src));
    }
    if (pack.kind === "texture") {
      return shape.map((_, index) => makeTextureSkin(pack.texture, index));
    }
    return shape.map((_, index) => cloneSkin(pack.cells[index % pack.cells.length]));
  }

  function cloneSkin(skin) {
    return { ...skin };
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
    renderScores();
    renderBoard();
    renderTray();
    renderEditor();
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
    const bounds = getBounds(piece.shape);
    const grid = document.createElement("div");
    grid.className = "piece-grid";
    grid.style.setProperty("--cols", String(bounds.cols));
    grid.style.setProperty("--rows", String(bounds.rows));
    grid.style.width = `${bounds.cols * 30 + Math.max(0, bounds.cols - 1) * 6}px`;
    grid.style.height = `${bounds.rows * 30 + Math.max(0, bounds.rows - 1) * 6}px`;
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

  function centerOffset(shape) {
    const bounds = getBounds(shape);
    return {
      x: Math.floor((EDITOR_SIZE - bounds.cols) / 2),
      y: Math.floor((EDITOR_SIZE - bounds.rows) / 2),
    };
  }

  function editPieceCell(piece, index) {
    if (state.mode === "erase") {
      piece.skin[index] = { kind: "color", color: "#dfe6dc" };
    } else if (state.mode === "photo") {
      if (!state.photoSrc) {
        setStatus("사진을 선택하세요");
        return;
      }
      piece.skin[index] = makePhotoSkin(piece, index, state.photoSrc);
    } else {
      piece.skin[index] = { kind: "color", color: state.activeColor };
    }
    renderAll();
  }

  function applyPhotoToPiece(piece) {
    piece.skin = piece.shape.map((_, index) => makePhotoSkin(piece, index, state.photoSrc));
  }

  function applyPhotoPack() {
    if (!state.photoSrc) {
      setStatus("사진을 선택하세요");
      return;
    }
    state.skinPack = makePhotoPack(state.photoSrc);
    applyPackToAvailablePieces();
    persist();
    renderAll();
    setStatus("사진 스킨팩 적용 완료");
  }

  function applyTexturePack(textureName) {
    if (!TEXTURES[textureName]) return;
    state.skinPack = makeTexturePack(textureName);
    applyPackToAvailablePieces();
    persist();
    renderAll();
    setStatus("텍스처 스킨팩 적용 완료");
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
      color: "#edf1eb",
      size: `${bounds.cols * 100}% ${bounds.rows * 100}%`,
      position: `${posX}% ${posY}%`,
    };
  }

  function makeTextureSkin(textureName, index) {
    const texture = TEXTURES[textureName] || TEXTURES.neon;
    return {
      kind: "texture",
      color: texture.color,
      image: texture.image,
      size: index % 2 === 0 ? "140% 140%" : "120% 120%",
      position: `${(index * 37) % 100}% ${(index * 53) % 100}%`,
    };
  }

  function tryPlace(piece, row, col) {
    if (piece.used || !canPlace(piece, row, col)) {
      setStatus("놓을 수 없는 위치입니다");
      clearPreview();
      return false;
    }

    piece.shape.forEach(([x, y], index) => {
      state.board[row + y][col + x] = cloneSkin(piece.skin[index]);
    });
    piece.used = true;
    state.score += piece.shape.length * 10;
    const cleared = clearCompletedLines();
    if (cleared > 0) {
      state.combo += 1;
      state.score += cleared * cleared * 100 + state.combo * 30;
      setStatus(`${cleared}줄 제거`);
    } else {
      state.combo = 0;
      setStatus("남은 후보를 고르세요");
    }

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

    clearPreview();
    renderAll();
    checkGameOver();
    return true;
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

  function clearCompletedLines() {
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

    rows.forEach((row) => {
      for (let col = 0; col < BOARD_SIZE; col += 1) state.board[row][col] = null;
    });
    cols.forEach((col) => {
      for (let row = 0; row < BOARD_SIZE; row += 1) state.board[row][col] = null;
    });
    return rows.length + cols.length;
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
    } else if (skin.kind === "texture" && skin.image) {
      element.style.setProperty("--image", skin.image);
      element.style.setProperty("--bg-size", skin.size || "cover");
      element.style.setProperty("--bg-position", skin.position || "center");
    } else {
      element.style.setProperty(
        "--image",
        "linear-gradient(145deg, rgba(255,255,255,0.38), rgba(0,0,0,0.12))",
      );
      element.style.setProperty("--bg-size", "cover");
      element.style.setProperty("--bg-position", "center");
    }
  }

  function clearSkinStyle(element) {
    element.style.removeProperty("--fill");
    element.style.removeProperty("--image");
    element.style.removeProperty("--bg-size");
    element.style.removeProperty("--bg-position");
  }

  function setStatus(message) {
    els.statusText.textContent = message;
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
