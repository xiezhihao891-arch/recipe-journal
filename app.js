/**
 * 手账食谱 · Scrapbook Recipe Journal
 * Vanilla SPA — all data in localStorage
 */
(function () {
  "use strict";

  const SCHEMA_VERSION = 1;
  const STORAGE_KEY = "recipe-journal-v1";
  const MAX_IMAGE_BYTES = 600 * 1024; // ~600KB dataURL budget

  const ACCENTS = [
    { id: "coral", hex: "#e07a5f", label: "珊瑚" },
    { id: "sage", hex: "#81b29a", label: "鼠尾草" },
    { id: "sky", hex: "#7a9eb5", label: "天空" },
    { id: "lavender", hex: "#9b8aa5", label: "薰衣草" },
    { id: "mustard", hex: "#d4a574", label: "芥末" },
    { id: "rose", hex: "#c97b84", label: "玫瑰" },
    { id: "ink", hex: "#3d3429", label: "墨色" },
  ];

  const TAPES = [
    { id: "yellow", css: "rgba(255,220,120,0.55)", label: "黄油" },
    { id: "pink", css: "rgba(255,180,190,0.5)", label: "樱花粉" },
    { id: "mint", css: "rgba(160,220,190,0.5)", label: "薄荷" },
    { id: "blue", css: "rgba(160,200,230,0.5)", label: "浅蓝" },
  ];

  const EMOJIS = [
    "🍳", "🍜", "🍲", "🥗", "🍛", "🍝", "🥟", "🍱",
    "🥘", "🍚", "🥩", "🍗", "🐟", "🦐", "🥦", "🍅",
    "🧀", "🍰", "🧁", "☕", "🥛", "🫖", "🥐", "🌮",
  ];

  const TAG_COLORS = ["#e07a5f", "#81b29a", "#7a9eb5", "#9b8aa5", "#d4a574", "#c97b84"];

  // ---------- Seed recipes ----------
  const SEED_RECIPES = [
    {
      title: "番茄炒蛋",
      emoji: "🍅",
      accent: "coral",
      tape: "pink",
      cookTime: 15,
      servings: "2 人份",
      difficulty: "简单",
      category: "家常菜",
      rating: 5,
      tags: ["快手菜", "家常", "下饭"],
      ingredients: [
        { name: "鸡蛋", amount: "3 个" },
        { name: "番茄", amount: "2 个" },
        { name: "葱花", amount: "少许" },
        { name: "盐", amount: "适量" },
        { name: "糖", amount: "小半勺" },
        { name: "食用油", amount: "适量" },
      ],
      steps: [
        "鸡蛋打散，加少许盐搅匀。番茄切块（保留番茄汁）。",
        "热锅凉油，倒入蛋液，炒至凝固成形后盛出。",
        "锅中再少许油，下番茄块翻炒出汁，可加一小勺糖提鲜。",
        "倒回鸡蛋，快速翻匀，撒葱花即可出锅。",
      ],
      notes: "火候要快！番茄多炒一会儿汁水更浓。家里小朋友爱加一点番茄酱 ✿",
      sections: [
        { title: "小贴士", body: "鸡蛋先炒再回锅，口感更嫩、不糊锅。" },
      ],
      lastCooked: "",
      image: "",
    },
    {
      title: "红烧肉",
      emoji: "🥩",
      accent: "mustard",
      tape: "yellow",
      cookTime: 90,
      servings: "4 人份",
      difficulty: "中等",
      category: "家常菜",
      rating: 5,
      tags: ["硬菜", "周末", "下饭"],
      ingredients: [
        { name: "五花肉", amount: "500g" },
        { name: "冰糖", amount: "30g" },
        { name: "生抽", amount: "2 勺" },
        { name: "老抽", amount: "1 勺" },
        { name: "料酒", amount: "2 勺" },
        { name: "姜片", amount: "数片" },
        { name: "八角", amount: "1 个" },
        { name: "香叶", amount: "2 片" },
      ],
      steps: [
        "五花肉切约 3cm 方块，冷水下锅焯去血沫，捞出沥干。",
        "干锅小火炒冰糖至琥珀色，下肉块翻炒上色（糖色要盯紧）。",
        "烹入料酒，加生抽老抽、姜片八角香叶，倒热水没过肉。",
        "大火烧开转小火焖 60–80 分钟，至筷子能轻松插入。",
        "开大火收汁，汁浓亮即可。别收太干，留一点汤拌饭神器。",
      ],
      notes: "第一次做时糖色糊过一次，后来改小火慢炒就稳了。配白米饭绝配。",
      sections: [],
      lastCooked: "",
      image: "",
    },
    {
      title: "简易意面",
      emoji: "🍝",
      accent: "sage",
      tape: "mint",
      cookTime: 25,
      servings: "1–2 人份",
      difficulty: "简单",
      category: "西式",
      rating: 4,
      tags: ["快手菜", "一人食", "意面"],
      ingredients: [
        { name: "意面", amount: "100–120g" },
        { name: "大蒜", amount: "2 瓣" },
        { name: "小番茄", amount: "8–10 颗" },
        { name: "橄榄油", amount: "2 勺" },
        { name: "盐 / 黑胡椒", amount: "适量" },
        { name: "帕玛森芝士（可选）", amount: "适量" },
        { name: "罗勒叶（可选）", amount: "几片" },
      ],
      steps: [
        "大锅烧开水，加盐，按包装时间煮面（可略 al dente）。留一杯面汤。",
        "另锅小火煸香蒜片，下小番茄（可划十字）煸至微瘪出汁。",
        "捞面入锅，加少许面汤乳化，撒黑胡椒拌匀。",
        "装盘，撒芝士和罗勒。完成！",
      ],
      notes: "没小番茄时用罐头番茄丁也很好。想丰盛可以加煎蛋或火腿片。",
      sections: [
        { title: "变奏", body: "奶油蘑菇版：蒜香炒蘑菇 + 淡奶油 + 面汤。" },
      ],
      lastCooked: "",
      image: "",
    },
  ];

  // ---------- State ----------
  let state = {
    recipes: [],
    search: "",
    filterTag: "",
    sort: "updated",
    editingId: null,
    editorTags: [],
    editorEmoji: "🍳",
    editorAccent: "coral",
    editorTape: "yellow",
    editorImage: "",
    editorRating: 0,
  };

  // ---------- Utils ----------
  function uid() {
    return "r_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function accentHex(id) {
    return (ACCENTS.find((a) => a.id === id) || ACCENTS[0]).hex;
  }

  const TAPE_CSS = {
    yellow: "rgba(255,220,120,0.55)",
    pink: "rgba(255,180,190,0.5)",
    mint: "rgba(160,220,190,0.5)",
    blue: "rgba(160,200,230,0.5)",
  };

  function tapeCss(id) {
    return TAPE_CSS[id] || TAPE_CSS.yellow;
  }

  function stars(n) {
    const r = Math.max(0, Math.min(5, Number(n) || 0));
    return "★".repeat(r) + "☆".repeat(5 - r);
  }

  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2400);
  }

  function confirmModal(title, body) {
    return new Promise((resolve) => {
      const backdrop = document.getElementById("modal");
      document.getElementById("modal-title").textContent = title;
      document.getElementById("modal-body").textContent = body;
      backdrop.hidden = false;
      backdrop.classList.add("open");

      const cleanup = (ok) => {
        backdrop.classList.remove("open");
        backdrop.hidden = true;
        document.getElementById("modal-confirm").onclick = null;
        document.getElementById("modal-cancel").onclick = null;
        resolve(ok);
      };
      document.getElementById("modal-confirm").onclick = () => cleanup(true);
      document.getElementById("modal-cancel").onclick = () => cleanup(false);
      backdrop.onclick = (e) => {
        if (e.target === backdrop) cleanup(false);
      };
    });
  }

  // ---------- Storage ----------
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        state.recipes = [];
        save();
        // First visit: auto-seed
        seedRecipes(true);
        return;
      }
      const data = JSON.parse(raw);
      if (data.schemaVersion !== SCHEMA_VERSION) {
        // Future: migrate. For now keep recipes if present.
      }
      state.recipes = Array.isArray(data.recipes) ? data.recipes : [];
    } catch (e) {
      console.error("load failed", e);
      state.recipes = [];
    }
  }

  function save() {
    const payload = {
      schemaVersion: SCHEMA_VERSION,
      updatedAt: nowISO(),
      recipes: state.recipes,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function exportJSON() {
    const payload = {
      schemaVersion: SCHEMA_VERSION,
      exportedAt: nowISO(),
      app: "手账食谱",
      recipes: state.recipes,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `手账食谱-备份-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast("已导出备份文件");
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result);
        const incoming = Array.isArray(data.recipes)
          ? data.recipes
          : Array.isArray(data)
            ? data
            : null;
        if (!incoming) {
          toast("文件格式不对，需要含 recipes 数组");
          return;
        }
        const ok = await confirmModal(
          "导入备份？",
          `将导入 ${incoming.length} 道食谱，并与现有数据合并（同 ID 会覆盖）。继续吗？`
        );
        if (!ok) return;
        const map = new Map(state.recipes.map((r) => [r.id, r]));
        incoming.forEach((r) => {
          if (!r || !r.title) return;
          const id = r.id || uid();
          map.set(id, normalizeRecipe({ ...r, id }));
        });
        state.recipes = Array.from(map.values());
        save();
        toast(`已导入，当前共 ${state.recipes.length} 道`);
        navigate("home");
      } catch (e) {
        toast("无法解析 JSON 文件");
      }
    };
    reader.readAsText(file);
  }

  function normalizeRecipe(r) {
    return {
      id: r.id || uid(),
      title: String(r.title || "未命名").slice(0, 80),
      emoji: r.emoji || "🍳",
      image: r.image || "",
      accent: r.accent || "coral",
      tape: r.tape || "yellow",
      cookTime: r.cookTime != null && r.cookTime !== "" ? Number(r.cookTime) : null,
      servings: r.servings || "",
      difficulty: r.difficulty || "",
      category: r.category || "",
      rating: Math.max(0, Math.min(5, Number(r.rating) || 0)),
      tags: Array.isArray(r.tags) ? r.tags.map(String).slice(0, 20) : [],
      ingredients: Array.isArray(r.ingredients)
        ? r.ingredients.map((i) => ({
            name: String(i.name || i || ""),
            amount: String(i.amount || ""),
          }))
        : [],
      steps: Array.isArray(r.steps) ? r.steps.map(String) : [],
      notes: r.notes || "",
      sections: Array.isArray(r.sections)
        ? r.sections.map((s) => ({
            title: String(s.title || ""),
            body: String(s.body || ""),
          }))
        : [],
      lastCooked: r.lastCooked || "",
      createdAt: r.createdAt || nowISO(),
      updatedAt: r.updatedAt || nowISO(),
    };
  }

  function seedRecipes(silent) {
    let added = 0;
    const titles = new Set(state.recipes.map((r) => r.title));
    SEED_RECIPES.forEach((seed) => {
      if (titles.has(seed.title)) return;
      const recipe = normalizeRecipe({
        ...seed,
        id: uid(),
        createdAt: nowISO(),
        updatedAt: nowISO(),
      });
      state.recipes.push(recipe);
      added++;
    });
    if (added) {
      save();
      if (!silent) toast(`已载入 ${added} 道示例食谱`);
    } else if (!silent) {
      toast("示例已存在，未重复添加");
    }
    renderHome();
  }

  // ---------- Routing ----------
  function navigate(view, id) {
    document.body.classList.remove("cooking-mode");
    const views = ["home", "detail", "editor", "settings"];
    views.forEach((v) => {
      const el = document.getElementById("view-" + v);
      if (el) el.classList.toggle("active", v === view);
    });

    document.querySelectorAll(".nav-btn").forEach((btn) => {
      const n = btn.dataset.nav;
      btn.classList.toggle(
        "active",
        (view === "home" && n === "home") ||
          (view === "settings" && n === "settings") ||
          (view === "editor" && n === "new")
      );
    });

    if (view === "home") {
      history.replaceState(null, "", "#/");
      renderHome();
    } else if (view === "detail") {
      history.replaceState(null, "", "#/recipe/" + id);
      renderDetail(id);
    } else if (view === "editor") {
      history.replaceState(null, "", id ? "#/edit/" + id : "#/new");
      openEditor(id || null);
    } else if (view === "settings") {
      history.replaceState(null, "", "#/settings");
      renderSettings();
    }

    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  function parseHash() {
    const h = location.hash.slice(1) || "/";
    if (h === "/" || h === "") return navigate("home");
    if (h === "/settings") return navigate("settings");
    if (h === "/new") return navigate("editor");
    const edit = h.match(/^\/edit\/(.+)$/);
    if (edit) return navigate("editor", edit[1]);
    const recipe = h.match(/^\/recipe\/(.+)$/);
    if (recipe) return navigate("detail", recipe[1]);
    navigate("home");
  }

  // ---------- Home ----------
  function getFiltered() {
    let list = state.recipes.slice();
    const q = state.search.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        const hay = [
          r.title,
          r.category,
          r.notes,
          ...(r.tags || []),
          ...(r.ingredients || []).map((i) => i.name),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    if (state.filterTag) {
      list = list.filter(
        (r) =>
          (r.tags || []).includes(state.filterTag) || r.category === state.filterTag
      );
    }
    const sort = state.sort;
    list.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title, "zh");
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sort === "cookTime") return (a.cookTime || 9999) - (b.cookTime || 9999);
      if (sort === "created") return (b.createdAt || "").localeCompare(a.createdAt || "");
      return (b.updatedAt || "").localeCompare(a.updatedAt || "");
    });
    return list;
  }

  function allTags() {
    const set = new Map();
    state.recipes.forEach((r) => {
      if (r.category) set.set(r.category, true);
      (r.tags || []).forEach((t) => set.set(t, true));
    });
    return Array.from(set.keys()).sort((a, b) => a.localeCompare(b, "zh"));
  }

  function renderHome() {
    const stats = document.getElementById("cover-stats");
    const n = state.recipes.length;
    const avg =
      n === 0
        ? 0
        : state.recipes.reduce((s, r) => s + (r.rating || 0), 0) / n;
    stats.innerHTML = `
      <span class="stat-chip">📖 ${n} 道菜</span>
      <span class="stat-chip">⭐ 均分 ${n ? avg.toFixed(1) : "—"}</span>
      <span class="stat-chip">🏷️ ${allTags().length} 个标签</span>
    `;

    const chips = document.getElementById("filter-chips");
    const tags = allTags();
    chips.innerHTML =
      `<button type="button" class="chip tag-chip ${!state.filterTag ? "active" : ""}" data-tag="">全部</button>` +
      tags
        .map((t, i) => {
          const c = TAG_COLORS[i % TAG_COLORS.length];
          return `<button type="button" class="chip tag-chip ${
            state.filterTag === t ? "active" : ""
          }" data-tag="${escapeHtml(t)}" style="--accent:${c}">${escapeHtml(t)}</button>`;
        })
        .join("");

    chips.querySelectorAll("[data-tag]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.filterTag = btn.dataset.tag;
        renderHome();
      });
    });

    const list = getFiltered();
    const grid = document.getElementById("recipe-grid");
    const empty = document.getElementById("empty-state");

    if (state.recipes.length === 0) {
      grid.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    if (list.length === 0) {
      grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--ink-mute);padding:2rem">没有匹配的食谱，试试清空筛选～</p>`;
      return;
    }

    grid.innerHTML = list
      .map((r, idx) => {
        const coverBg = accentHex(r.accent) + "22";
        const media = r.image
          ? `<img src="${escapeHtml(r.image)}" alt="${escapeHtml(r.title)}" loading="lazy" />`
          : `<span class="card-emoji" aria-hidden="true">${escapeHtml(r.emoji || "🍳")}</span>`;
        const metaBits = [];
        if (r.cookTime) metaBits.push(`⏱ ${r.cookTime} 分钟`);
        if (r.difficulty) metaBits.push(r.difficulty);
        if (r.servings) metaBits.push(r.servings);
        const tagHtml = (r.tags || [])
          .slice(0, 3)
          .map(
            (t, i) =>
              `<span class="mini-tag" style="--tag-c:${TAG_COLORS[i % TAG_COLORS.length]}">${escapeHtml(t)}</span>`
          )
          .join("");
        return `
        <article class="recipe-card" role="listitem" tabindex="0" data-id="${escapeHtml(r.id)}" aria-label="${escapeHtml(r.title)}">
          <span class="card-tape" style="--tape-color:${tapeCss(r.tape)};--tape-rot:${idx % 2 ? 3 : -2}deg"></span>
          <div class="card-polaroid" style="--cover-bg:${coverBg}">${media}</div>
          <h2 class="card-title">${escapeHtml(r.title)}</h2>
          <div class="card-meta">${metaBits.map(escapeHtml).join(" · ")}</div>
          ${r.rating ? `<div class="card-stars" aria-label="评分 ${r.rating}">${stars(r.rating)}</div>` : ""}
          <div class="card-tags">${tagHtml}</div>
        </article>`;
      })
      .join("");

    grid.querySelectorAll(".recipe-card").forEach((card) => {
      const go = () => navigate("detail", card.dataset.id);
      card.addEventListener("click", go);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          go();
        }
      });
    });
  }

  // ---------- Detail ----------
  function renderDetail(id) {
    const r = state.recipes.find((x) => x.id === id);
    const root = document.getElementById("view-detail");
    if (!r) {
      root.innerHTML = `<div class="empty-state"><h2>找不到这道菜</h2><button type="button" class="btn btn-ghost" data-back>回封面</button></div>`;
      root.querySelector("[data-back]").onclick = () => navigate("home");
      return;
    }

    const coverBg = accentHex(r.accent) + "33";
    const media = r.image
      ? `<img src="${escapeHtml(r.image)}" alt="${escapeHtml(r.title)}" />`
      : `<span class="cover-emoji" aria-hidden="true">${escapeHtml(r.emoji || "🍳")}</span>`;

    const meta = [];
    if (r.cookTime) meta.push(`⏱ ${r.cookTime} 分钟`);
    if (r.servings) meta.push(`🍽 ${r.servings}`);
    if (r.difficulty) meta.push(`💪 ${r.difficulty}`);
    if (r.category) meta.push(`📁 ${r.category}`);
    if (r.lastCooked) meta.push(`📅 上次：${r.lastCooked}`);

    const tags = (r.tags || [])
      .map(
        (t, i) =>
          `<span class="mini-tag" style="--tag-c:${TAG_COLORS[i % TAG_COLORS.length]};font-size:0.8rem;padding:0.25rem 0.55rem">${escapeHtml(t)}</span>`
      )
      .join("");

    const ings = (r.ingredients || [])
      .map(
        (ing, i) => `
      <li>
        <label class="ing-label">
          <input type="checkbox" data-ing="${i}" />
          <span class="ing-text">${escapeHtml(ing.name)}</span>
          ${ing.amount ? `<span class="ing-amount">${escapeHtml(ing.amount)}</span>` : ""}
        </label>
      </li>`
      )
      .join("");

    const steps = (r.steps || [])
      .map((s) => `<li>${escapeHtml(s)}</li>`)
      .join("");

    const sections = (r.sections || [])
      .filter((s) => s.title || s.body)
      .map(
        (s) => `
      <h3 class="section-label">📎 ${escapeHtml(s.title || "备注")}</h3>
      <div class="memo-box" style="min-height:auto;margin-bottom:0.75rem">${escapeHtml(s.body)}</div>`
      )
      .join("");

    root.innerHTML = `
      <div style="margin-bottom:0.75rem">
        <button type="button" class="btn btn-ghost btn-sm" id="btn-back-home">← 回封面</button>
      </div>
      <div class="detail-spread">
        <div class="page-panel left-page" style="--accent:${accentHex(r.accent)}">
          <div class="washi-corner washi-tl" style="--tape-c:${tapeCss(r.tape)}"></div>
          <div class="washi-corner washi-tr"></div>
          <div class="detail-cover" style="--cover-bg:${coverBg}">${media}</div>
          <h1 class="detail-title">${escapeHtml(r.title)}</h1>
          ${r.rating ? `<div class="stars-display" aria-label="评分 ${r.rating} 星">${stars(r.rating)}</div>` : ""}
          <div class="meta-chips">${meta.map((m) => `<span class="meta-chip">${escapeHtml(m)}</span>`).join("")}</div>
          <div style="display:flex;flex-wrap:wrap;gap:0.35rem;margin-top:0.5rem">${tags}</div>
          ${
            r.ingredients && r.ingredients.length
              ? `<h2 class="section-label">🥬 食材</h2><ul class="ingredient-list" id="detail-ings">${ings}</ul>`
              : ""
          }
        </div>
        <div class="page-panel right-page" style="--accent:${accentHex(r.accent)}">
          <div class="washi-corner washi-tl" style="--tape-c:var(--tape-mint)"></div>
          ${
            r.steps && r.steps.length
              ? `<h2 class="section-label">📝 步骤</h2><ol class="steps-list">${steps}</ol>`
              : "<p style='color:var(--ink-mute)'>还没有步骤，去编辑页补充吧～</p>"
          }
          ${
            r.notes
              ? `<h2 class="section-label">✍️ 手账备忘</h2><div class="memo-box">${escapeHtml(r.notes)}</div>`
              : ""
          }
          ${sections}
          <div class="detail-actions">
            <button type="button" class="btn btn-sage" id="btn-cook-mode">🔥 烹饪模式</button>
            <button type="button" class="btn btn-primary" id="btn-edit-recipe">✏️ 编辑</button>
            <button type="button" class="btn btn-ghost" id="btn-mark-cooked">📅 标记今天做过</button>
            <button type="button" class="btn btn-danger btn-sm" id="btn-delete-recipe">删除</button>
          </div>
        </div>
      </div>
    `;

    root.querySelector("#btn-back-home").onclick = () => navigate("home");
    root.querySelector("#btn-edit-recipe").onclick = () => navigate("editor", r.id);
    root.querySelector("#btn-cook-mode").onclick = () => {
      document.body.classList.add("cooking-mode");
      toast("烹饪模式已开启 — 专注步骤");
    };
    root.querySelector("#btn-mark-cooked").onclick = () => {
      r.lastCooked = new Date().toISOString().slice(0, 10);
      r.updatedAt = nowISO();
      save();
      toast("已记下今天做过啦");
      renderDetail(r.id);
    };
    root.querySelector("#btn-delete-recipe").onclick = async () => {
      const ok = await confirmModal("删除这道菜？", `「${r.title}」将从手账中移除，无法恢复。`);
      if (!ok) return;
      state.recipes = state.recipes.filter((x) => x.id !== r.id);
      save();
      toast("已删除");
      navigate("home");
    };

    root.querySelectorAll("#detail-ings input[type=checkbox]").forEach((cb) => {
      cb.addEventListener("change", () => {
        const li = cb.closest("li");
        li.classList.toggle("checked", cb.checked);
      });
    });
  }

  // ---------- Editor ----------
  function openEditor(id) {
    state.editingId = id;
    const form = document.getElementById("editor-form");
    form.reset();
    document.getElementById("ed-image-preview").hidden = true;
    document.getElementById("btn-editor-delete").hidden = !id;

    let r = null;
    if (id) {
      r = state.recipes.find((x) => x.id === id);
      document.getElementById("editor-heading").textContent = "编辑食谱";
    } else {
      document.getElementById("editor-heading").textContent = "写一道新菜";
    }

    state.editorTags = r ? [...(r.tags || [])] : [];
    state.editorEmoji = r ? r.emoji || "🍳" : "🍳";
    state.editorAccent = r ? r.accent || "coral" : "coral";
    state.editorTape = r ? r.tape || "yellow" : "yellow";
    state.editorImage = r ? r.image || "" : "";
    state.editorRating = r ? r.rating || 0 : 0;

    document.getElementById("ed-id").value = id || "";
    document.getElementById("ed-title").value = r ? r.title : "";
    document.getElementById("ed-image-url").value = "";
    document.getElementById("ed-cook-time").value = r && r.cookTime != null ? r.cookTime : "";
    document.getElementById("ed-servings").value = r ? r.servings : "";
    document.getElementById("ed-difficulty").value = r ? r.difficulty : "";
    document.getElementById("ed-category").value = r ? r.category : "";
    document.getElementById("ed-last-cooked").value = r ? r.lastCooked || "" : "";
    document.getElementById("ed-notes").value = r ? r.notes || "" : "";
    document.getElementById("ed-rating").value = state.editorRating;

    if (state.editorImage) {
      const prev = document.getElementById("ed-image-preview");
      prev.src = state.editorImage;
      prev.hidden = false;
      prev.alt = "封面预览";
    }

    renderEmojiGrid();
    renderColorSwatches();
    renderTapeSwatches();
    renderStarPicker();
    renderTagChipsEdit();
    renderIngRows(r ? r.ingredients : [{ name: "", amount: "" }, { name: "", amount: "" }]);
    renderStepRows(r ? r.steps : ["", ""]);
    renderSectionRows(r ? r.sections : []);
  }

  function renderEmojiGrid() {
    const grid = document.getElementById("emoji-grid");
    grid.innerHTML = EMOJIS.map(
      (e) =>
        `<button type="button" class="emoji-btn ${
          state.editorEmoji === e ? "selected" : ""
        }" data-emoji="${e}" aria-label="封面 ${e}" aria-pressed="${state.editorEmoji === e}">${e}</button>`
    ).join("");
    grid.querySelectorAll(".emoji-btn").forEach((btn) => {
      btn.onclick = () => {
        state.editorEmoji = btn.dataset.emoji;
        renderEmojiGrid();
      };
    });
  }

  function renderColorSwatches() {
    const el = document.getElementById("color-swatches");
    el.innerHTML = ACCENTS.map(
      (a) =>
        `<button type="button" class="swatch ${
          state.editorAccent === a.id ? "selected" : ""
        }" data-accent="${a.id}" style="background:${a.hex}" title="${a.label}" aria-label="${a.label}" aria-pressed="${
          state.editorAccent === a.id
        }"></button>`
    ).join("");
    el.querySelectorAll(".swatch").forEach((btn) => {
      btn.onclick = () => {
        state.editorAccent = btn.dataset.accent;
        renderColorSwatches();
      };
    });
  }

  function renderTapeSwatches() {
    const el = document.getElementById("tape-swatches");
    el.innerHTML = TAPES.map(
      (t) =>
        `<button type="button" class="swatch ${
          state.editorTape === t.id ? "selected" : ""
        }" data-tape="${t.id}" style="background:${t.css};border-radius:3px;width:2.2rem;height:1.4rem" title="${t.label}" aria-label="${t.label}"></button>`
    ).join("");
    el.querySelectorAll(".swatch").forEach((btn) => {
      btn.onclick = () => {
        state.editorTape = btn.dataset.tape;
        renderTapeSwatches();
      };
    });
  }

  function renderStarPicker() {
    const el = document.getElementById("star-picker");
    el.innerHTML = [1, 2, 3, 4, 5]
      .map(
        (n) =>
          `<button type="button" class="${n <= state.editorRating ? "on" : ""}" data-star="${n}" aria-label="${n} 星">★</button>`
      )
      .join("");
    el.querySelectorAll("button").forEach((btn) => {
      btn.onclick = () => {
        const n = Number(btn.dataset.star);
        state.editorRating = state.editorRating === n ? 0 : n;
        document.getElementById("ed-rating").value = state.editorRating;
        renderStarPicker();
      };
    });
  }

  function renderTagChipsEdit() {
    const el = document.getElementById("tag-chips-edit");
    el.innerHTML = state.editorTags
      .map((t, i) => {
        const c = TAG_COLORS[i % TAG_COLORS.length];
        return `<span class="editable-tag" style="--tc:${c}">${escapeHtml(t)}<button type="button" data-i="${i}" aria-label="移除 ${escapeHtml(t)}">×</button></span>`;
      })
      .join("");
    el.querySelectorAll("button").forEach((btn) => {
      btn.onclick = () => {
        state.editorTags.splice(Number(btn.dataset.i), 1);
        renderTagChipsEdit();
      };
    });
  }

  function renderIngRows(items) {
    const list = document.getElementById("ing-list");
    const rows = items && items.length ? items : [{ name: "", amount: "" }];
    list.innerHTML = rows
      .map(
        (ing, i) => `
      <div class="dyn-row" data-i="${i}">
        <input type="text" class="ing-name" placeholder="食材名" value="${escapeHtml(ing.name || "")}" aria-label="食材名" />
        <input type="text" class="ing-amount" placeholder="用量" value="${escapeHtml(ing.amount || "")}" style="flex:0.55" aria-label="用量" />
        <button type="button" class="btn-remove" aria-label="删除此行">×</button>
      </div>`
      )
      .join("");
    list.querySelectorAll(".btn-remove").forEach((btn) => {
      btn.onclick = () => {
        const row = btn.closest(".dyn-row");
        row.remove();
        if (!list.children.length) renderIngRows([{ name: "", amount: "" }]);
      };
    });
  }

  function collectIngs() {
    return Array.from(document.querySelectorAll("#ing-list .dyn-row"))
      .map((row) => ({
        name: row.querySelector(".ing-name").value.trim(),
        amount: row.querySelector(".ing-amount").value.trim(),
      }))
      .filter((i) => i.name);
  }

  function renderStepRows(items) {
    const list = document.getElementById("step-list");
    const rows = items && items.length ? items : [""];
    list.innerHTML = rows
      .map(
        (s, i) => `
      <div class="dyn-row" data-i="${i}">
        <textarea class="step-text" rows="2" placeholder="第 ${i + 1} 步…" aria-label="步骤 ${i + 1}">${escapeHtml(s || "")}</textarea>
        <button type="button" class="btn-remove" aria-label="删除此步">×</button>
      </div>`
      )
      .join("");
    list.querySelectorAll(".btn-remove").forEach((btn) => {
      btn.onclick = () => {
        btn.closest(".dyn-row").remove();
        if (!list.children.length) renderStepRows([""]);
        // renumber placeholders
        list.querySelectorAll(".step-text").forEach((ta, idx) => {
          ta.placeholder = `第 ${idx + 1} 步…`;
          ta.setAttribute("aria-label", `步骤 ${idx + 1}`);
        });
      };
    });
  }

  function collectSteps() {
    return Array.from(document.querySelectorAll("#step-list .step-text"))
      .map((ta) => ta.value.trim())
      .filter(Boolean);
  }

  function renderSectionRows(items) {
    const list = document.getElementById("section-list");
    const rows = items || [];
    list.innerHTML = rows
      .map(
        (s, i) => `
      <div class="dyn-row" style="flex-direction:column;align-items:stretch;background:var(--paper);padding:0.6rem;border-radius:8px" data-i="${i}">
        <div style="display:flex;gap:0.4rem">
          <input type="text" class="sec-title" placeholder="章节标题" value="${escapeHtml(s.title || "")}" aria-label="章节标题" />
          <button type="button" class="btn-remove" aria-label="删除章节">×</button>
        </div>
        <textarea class="sec-body" rows="2" placeholder="章节内容…" style="margin-top:0.35rem;width:100%;padding:0.55rem 0.7rem;border:1.5px solid var(--paper-deep);border-radius:8px;background:var(--cream)" aria-label="章节内容">${escapeHtml(s.body || "")}</textarea>
      </div>`
      )
      .join("");
    list.querySelectorAll(".btn-remove").forEach((btn) => {
      btn.onclick = () => btn.closest(".dyn-row").remove();
    });
  }

  function collectSections() {
    return Array.from(document.querySelectorAll("#section-list .dyn-row"))
      .map((row) => ({
        title: row.querySelector(".sec-title").value.trim(),
        body: row.querySelector(".sec-body").value.trim(),
      }))
      .filter((s) => s.title || s.body);
  }

  function saveEditor(e) {
    e.preventDefault();
    const title = document.getElementById("ed-title").value.trim();
    if (!title) {
      toast("请先写上菜名");
      document.getElementById("ed-title").focus();
      return;
    }

    const urlField = document.getElementById("ed-image-url").value.trim();
    let image = state.editorImage;
    if (urlField) image = urlField;

    const id = document.getElementById("ed-id").value || uid();
    const existing = state.recipes.find((x) => x.id === id);
    const recipe = normalizeRecipe({
      id,
      title,
      emoji: state.editorEmoji,
      image,
      accent: state.editorAccent,
      tape: state.editorTape,
      cookTime: document.getElementById("ed-cook-time").value,
      servings: document.getElementById("ed-servings").value.trim(),
      difficulty: document.getElementById("ed-difficulty").value,
      category: document.getElementById("ed-category").value.trim(),
      rating: state.editorRating,
      tags: state.editorTags,
      ingredients: collectIngs(),
      steps: collectSteps(),
      notes: document.getElementById("ed-notes").value.trim(),
      sections: collectSections(),
      lastCooked: document.getElementById("ed-last-cooked").value,
      createdAt: existing ? existing.createdAt : nowISO(),
      updatedAt: nowISO(),
    });

    if (existing) {
      state.recipes = state.recipes.map((x) => (x.id === id ? recipe : x));
    } else {
      state.recipes.unshift(recipe);
    }
    save();
    toast("已保存到手账 ✿");
    navigate("detail", id);
  }

  // ---------- Settings ----------
  function renderSettings() {
    document.getElementById("schema-version-label").textContent = SCHEMA_VERSION;
    document.getElementById("settings-count").textContent = state.recipes.length;
  }

  // ---------- Wire events ----------
  function bind() {
    document.getElementById("btn-new-recipe").onclick = () => navigate("editor");
    document.getElementById("btn-settings").onclick = () => navigate("settings");
    document.getElementById("btn-empty-new").onclick = () => navigate("editor");
    document.getElementById("btn-exit-cook").onclick = () => {
      document.body.classList.remove("cooking-mode");
    };

    document.querySelectorAll("[data-nav]").forEach((el) => {
      el.addEventListener("click", (e) => {
        if (el.tagName === "A") e.preventDefault();
        const n = el.dataset.nav;
        if (n === "home") navigate("home");
        else if (n === "settings") navigate("settings");
        else if (n === "new") navigate("editor");
      });
    });

    document.getElementById("search-input").addEventListener("input", (e) => {
      state.search = e.target.value;
      renderHome();
    });
    document.getElementById("sort-select").addEventListener("change", (e) => {
      state.sort = e.target.value;
      renderHome();
    });

    document.getElementById("btn-add-ing").onclick = () => {
      const cur = collectIngs();
      cur.push({ name: "", amount: "" });
      // keep empty rows visible: re-read DOM values including empties
      const all = Array.from(document.querySelectorAll("#ing-list .dyn-row")).map((row) => ({
        name: row.querySelector(".ing-name").value,
        amount: row.querySelector(".ing-amount").value,
      }));
      all.push({ name: "", amount: "" });
      renderIngRows(all);
      const inputs = document.querySelectorAll("#ing-list .ing-name");
      inputs[inputs.length - 1].focus();
    };

    document.getElementById("btn-add-step").onclick = () => {
      const all = Array.from(document.querySelectorAll("#step-list .step-text")).map(
        (ta) => ta.value
      );
      all.push("");
      renderStepRows(all);
      const tas = document.querySelectorAll("#step-list .step-text");
      tas[tas.length - 1].focus();
    };

    document.getElementById("btn-add-section").onclick = () => {
      const all = collectSections();
      // also keep partially filled
      const live = Array.from(document.querySelectorAll("#section-list .dyn-row")).map((row) => ({
        title: row.querySelector(".sec-title").value,
        body: row.querySelector(".sec-body").value,
      }));
      live.push({ title: "", body: "" });
      renderSectionRows(live.length ? live : all.concat([{ title: "", body: "" }]));
    };

    document.getElementById("ed-tag-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const v = e.target.value.trim();
        if (!v) return;
        if (!state.editorTags.includes(v) && state.editorTags.length < 12) {
          state.editorTags.push(v);
          renderTagChipsEdit();
        }
        e.target.value = "";
      }
    });

    document.getElementById("editor-form").addEventListener("submit", saveEditor);
    document.getElementById("btn-editor-cancel").onclick = () => {
      if (state.editingId) navigate("detail", state.editingId);
      else navigate("home");
    };
    document.getElementById("btn-editor-delete").onclick = async () => {
      const id = state.editingId;
      if (!id) return;
      const r = state.recipes.find((x) => x.id === id);
      const ok = await confirmModal("删除这道菜？", `「${r ? r.title : ""}」将永久删除。`);
      if (!ok) return;
      state.recipes = state.recipes.filter((x) => x.id !== id);
      save();
      toast("已删除");
      navigate("home");
    };

    document.getElementById("ed-image-file").addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (file.size > MAX_IMAGE_BYTES) {
        toast("图片稍大，请选 500KB 以内的图，或改用 URL");
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        state.editorImage = reader.result;
        const prev = document.getElementById("ed-image-preview");
        prev.src = state.editorImage;
        prev.hidden = false;
        prev.alt = "封面预览";
        document.getElementById("ed-image-url").value = "";
        toast("图片已就绪");
      };
      reader.readAsDataURL(file);
    });

    document.getElementById("ed-image-url").addEventListener("change", () => {
      const url = document.getElementById("ed-image-url").value.trim();
      if (!url) return;
      state.editorImage = url;
      const prev = document.getElementById("ed-image-preview");
      prev.src = url;
      prev.hidden = false;
      prev.alt = "封面预览";
    });

    document.getElementById("btn-export").onclick = exportJSON;
    document.getElementById("import-file").addEventListener("change", (e) => {
      const f = e.target.files && e.target.files[0];
      if (f) importJSON(f);
      e.target.value = "";
    });
    document.getElementById("btn-seed").onclick = () => seedRecipes(false);
    document.getElementById("btn-clear").onclick = async () => {
      const ok = await confirmModal(
        "清空全部数据？",
        "所有食谱将从本机删除。请确认你已导出备份。"
      );
      if (!ok) return;
      state.recipes = [];
      save();
      toast("已清空");
      navigate("home");
    };

    window.addEventListener("hashchange", parseHash);
  }

  // ---------- Boot ----------
  function init() {
    bind();
    load();
    parseHash();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
