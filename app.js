/**
 * 本草膳录 · 药食同源共享食谱手账
 * Vanilla SPA — storage behind async API (LocalStore / RemoteStore)
 */
(function () {
  "use strict";

  const SCHEMA_VERSION = 1;
  const STORAGE_KEY = "bencao-shanlu-v1";
  const MAX_IMAGE_BYTES = 600 * 1024;

  const ACCENTS = [
    { id: "cinnabar", hex: "#b85a4a", label: "朱砂" },
    { id: "sage", hex: "#7d9b8a", label: "青瓷" },
    { id: "sky", hex: "#7a8f9e", label: "黛青" },
    { id: "lavender", hex: "#8a8494", label: "烟紫" },
    { id: "ochre", hex: "#c4a574", label: "赭石" },
    { id: "rose", hex: "#a86b72", label: "胭脂" },
    { id: "ink", hex: "#2a2a28", label: "墨色" },
    // legacy ids from older saves
    { id: "coral", hex: "#b85a4a", label: "朱砂" },
    { id: "mustard", hex: "#c4a574", label: "赭石" },
  ];

  const TAPES = [
    { id: "sage", css: "rgba(125,155,138,0.45)", label: "青瓷" },
    { id: "cinnabar", css: "rgba(184,90,74,0.28)", label: "朱砂" },
    { id: "ochre", css: "rgba(196,165,116,0.45)", label: "赭石" },
    { id: "celadon", css: "rgba(125,155,138,0.35)", label: "汝窑" },
    // legacy
    { id: "yellow", css: "rgba(196,165,116,0.45)", label: "赭石" },
    { id: "pink", css: "rgba(184,90,74,0.28)", label: "朱砂" },
    { id: "mint", css: "rgba(125,155,138,0.40)", label: "青瓷" },
    { id: "blue", css: "rgba(122,143,158,0.40)", label: "黛青" },
  ];

  const EMOJIS = [
    "🌿", "🍵", "🥣", "🫖", "🌰", "🫚", "🫘", "🌾",
    "🥢", "🍶", "🍃", "🥀", "🪵", "🪨", "✨", "📜",
    "🧧", "🪷", "🪴", "🧄", "🧅", "🍋", "🍄", "🪻",
  ];

  const TAG_COLORS = ["#b85a4a", "#7d9b8a", "#7a8f9e", "#8a8494", "#c4a574", "#a86b72"];

  // ---------- Seed recipes (药食同源) ----------
  const SEED_RECIPES = [
    {
      title: "枸杞红枣茶",
      emoji: "🍵",
      accent: "cinnabar",
      tape: "cinnabar",
      cookTime: 15,
      servings: "2–3 杯",
      difficulty: "简单",
      category: "茶饮",
      rating: 5,
      tags: ["茶饮", "补气", "日常"],
      ingredients: [
        { name: "枸杞", amount: "一小撮（约 8–10 粒）" },
        { name: "红枣", amount: "3–5 枚（去核更佳）" },
        { name: "热水", amount: "约 400ml" },
        { name: "桂圆（可选）", amount: "2–3 粒" },
        { name: "冰糖（可选）", amount: "少许" },
      ],
      steps: [
        "红枣洗净，建议剖开或去核；枸杞略冲洗。",
        "杯中放入红枣、枸杞（及可选桂圆），倒入刚煮沸的热水。",
        "加盖焖 8–12 分钟，至枣香析出；可按口味加少许冰糖。",
        "温热饮用。枸杞泡软后亦可一并嚼食。",
      ],
      notes: "日常可当温水杯饮。甜度宜轻，突出枣香与枸杞本味。",
      sections: [
        {
          title: "功效（传统食养参考）",
          body: "民间常以枸杞、红枣同用，作平日温养茶饮，取其甘润、养颜助色之意。仅为传统食养说法，因人而异。",
        },
        {
          title: "宜忌（传统食养参考）",
          body: "体质偏热、易上火或正在外感发热时宜少饮、少加糖。孕妇、慢性病患者及服药期间请先咨询专业人士。非医疗建议。",
        },
      ],
      lastCooked: "",
      image: "",
    },
    {
      title: "山药薏米粥",
      emoji: "🥣",
      accent: "sage",
      tape: "sage",
      cookTime: 50,
      servings: "3–4 碗",
      difficulty: "简单",
      category: "粥膳",
      rating: 5,
      tags: ["粥膳", "健脾", "清淡"],
      ingredients: [
        { name: "新鲜山药（或干山药片）", amount: "150–200g" },
        { name: "薏米（薏苡仁）", amount: "50g" },
        { name: "大米（或小米）", amount: "80g" },
        { name: "清水", amount: "约 1.2–1.5L" },
        { name: "红枣（可选）", amount: "2–3 枚" },
        { name: "盐或冰糖", amount: "按口味" },
      ],
      steps: [
        "薏米提前浸泡 1–2 小时；大米淘净。鲜山药去皮切小块（戴手套防手痒）。",
        "锅中加水，放入薏米与大米，大火煮开后转小火。",
        "约 20 分钟后下山药块（及可选红枣），继续慢煮至黏稠、山药软糯。",
        "出锅前按口味加少许盐或冰糖。趁热食用。",
      ],
      notes: "粥宜稀软好消化。鲜山药易氧化发黑，切后可略泡清水。",
      sections: [
        {
          title: "功效（传统食养参考）",
          body: "山药、薏米常入日常粥膳，民间多用于清淡调养、健脾祛湿一类说法。本记录仅作传统食养参考。",
        },
        {
          title: "宜忌（传统食养参考）",
          body: "胃寒、大便偏溏者薏米用量可酌减；便秘明显时不宜过量。过敏或特殊体质者请遵医嘱。非医疗建议。",
        },
      ],
      lastCooked: "",
      image: "",
    },
    {
      title: "生姜红糖水",
      emoji: "🫚",
      accent: "ochre",
      tape: "ochre",
      cookTime: 10,
      servings: "1–2 杯",
      difficulty: "简单",
      category: "膳饮",
      rating: 4,
      tags: ["膳饮", "暖身", "快手"],
      ingredients: [
        { name: "新鲜生姜", amount: "4–6 片（约拇指大一块）" },
        { name: "红糖（或黑糖）", amount: "1–2 勺" },
        { name: "清水", amount: "约 300–400ml" },
        { name: "红枣（可选）", amount: "1–2 枚" },
      ],
      steps: [
        "生姜洗净切片（可带皮）；红糖备用。",
        "小锅加水，放入姜片（及可选红枣），大火煮开后小火再煮 5–8 分钟。",
        "关火，加入红糖搅拌至融化。",
        "滤渣或连带姜片趁温热饮用。",
      ],
      notes: "姜味轻重可按片数调节。晚上饮用宜适量，以免过于辛散。",
      sections: [
        {
          title: "功效（传统食养参考）",
          body: "姜与红糖是常见的家常暖饮搭配，民间多在感受风寒、手足不温时选用。仅为传统食养参考，不能替代诊疗。",
        },
        {
          title: "宜忌（传统食养参考）",
          body: "阴虚火旺、口腔溃疡、出血倾向或发热明显时不宜。孕妇慎用大量生姜。高血压、糖尿病等请控制红糖量并遵医嘱。非医疗建议。",
        },
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
    editorEmoji: "🌿",
    editorAccent: "sage",
    editorTape: "sage",
    editorImage: "",
    editorRating: 0,
  };

  let store = null; // set in init

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
    return (ACCENTS.find((a) => a.id === id) || ACCENTS[1]).hex;
  }

  const TAPE_CSS = Object.fromEntries(TAPES.map((t) => [t.id, t.css]));

  function tapeCss(id) {
    return TAPE_CSS[id] || TAPE_CSS.sage;
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

  function normalizeRecipe(r) {
    let accent = r.accent || "sage";
    if (accent === "coral") accent = "cinnabar";
    if (accent === "mustard") accent = "ochre";
    let tape = r.tape || "sage";
    if (tape === "yellow") tape = "ochre";
    if (tape === "pink") tape = "cinnabar";
    if (tape === "mint") tape = "sage";
    if (tape === "blue") tape = "celadon";

    return {
      id: r.id || uid(),
      title: String(r.title || "未命名").slice(0, 80),
      emoji: r.emoji || "🌿",
      image: r.image || "",
      accent,
      tape,
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

  // ============================================================
  // Storage abstraction
  // ============================================================

  function readLocalPayload() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { schemaVersion: SCHEMA_VERSION, recipes: [] };
      const data = JSON.parse(raw);
      return {
        schemaVersion: data.schemaVersion || SCHEMA_VERSION,
        recipes: Array.isArray(data.recipes) ? data.recipes.map(normalizeRecipe) : [],
        updatedAt: data.updatedAt || null,
      };
    } catch (e) {
      console.error("LocalStore read failed", e);
      return { schemaVersion: SCHEMA_VERSION, recipes: [] };
    }
  }

  function writeLocalPayload(recipes) {
    const payload = {
      schemaVersion: SCHEMA_VERSION,
      updatedAt: nowISO(),
      recipes,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return payload;
  }

  /** LocalStore — current localStorage implementation */
  const LocalStore = {
    name: "local",
    label: "浏览器本地",
    async listRecipes() {
      return readLocalPayload().recipes;
    },
    async getRecipe(id) {
      return readLocalPayload().recipes.find((r) => r.id === id) || null;
    },
    async saveRecipe(recipe) {
      const normalized = normalizeRecipe({
        ...recipe,
        updatedAt: nowISO(),
        createdAt: recipe.createdAt || nowISO(),
      });
      const data = readLocalPayload();
      const idx = data.recipes.findIndex((r) => r.id === normalized.id);
      if (idx >= 0) data.recipes[idx] = normalized;
      else data.recipes.unshift(normalized);
      writeLocalPayload(data.recipes);
      return normalized;
    },
    async deleteRecipe(id) {
      const data = readLocalPayload();
      const next = data.recipes.filter((r) => r.id !== id);
      writeLocalPayload(next);
      return true;
    },
    async exportAll() {
      const data = readLocalPayload();
      return {
        schemaVersion: SCHEMA_VERSION,
        exportedAt: nowISO(),
        app: "本草膳录",
        recipes: data.recipes,
      };
    },
    async importMerge(incoming) {
      const list = Array.isArray(incoming)
        ? incoming
        : Array.isArray(incoming && incoming.recipes)
          ? incoming.recipes
          : null;
      if (!list) throw new Error("invalid_import");
      const data = readLocalPayload();
      const map = new Map(data.recipes.map((r) => [r.id, r]));
      list.forEach((r) => {
        if (!r || !r.title) return;
        const id = r.id || uid();
        map.set(id, normalizeRecipe({ ...r, id }));
      });
      const recipes = Array.from(map.values());
      writeLocalPayload(recipes);
      return recipes;
    },
    async clearAll() {
      writeLocalPayload([]);
      return true;
    },
  };

  /**
   * RemoteStore — Supabase PostgREST via fetch (no SDK).
   * Table: public.recipes (id, title, data jsonb, created_at, updated_at)
   * Activated when RECIPE_BACKEND has type:'supabase' + url + anonKey.
   */
  function createRemoteStore(cfg) {
    const base = String(cfg.url || "").replace(/\/$/, "");
    const anonKey = String(cfg.anonKey || "");
    const rest = base + "/rest/v1/recipes";

    function headers(extra) {
      return Object.assign(
        {
          apikey: anonKey,
          Authorization: "Bearer " + anonKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        extra || {}
      );
    }

    function rowToRecipe(row) {
      if (!row) return null;
      const data = row.data && typeof row.data === "object" ? row.data : {};
      return normalizeRecipe({
        ...data,
        id: row.id || data.id,
        title: row.title || data.title,
        createdAt: data.createdAt || row.created_at || nowISO(),
        updatedAt: data.updatedAt || row.updated_at || nowISO(),
      });
    }

    async function request(url, options) {
      const res = await fetch(url, options);
      if (!res.ok) {
        let detail = "";
        try {
          detail = await res.text();
        } catch (_) {}
        throw new Error("supabase_" + res.status + (detail ? ": " + detail.slice(0, 240) : ""));
      }
      if (res.status === 204) return null;
      const text = await res.text();
      if (!text) return null;
      return JSON.parse(text);
    }

    return {
      name: "supabase",
      label: "联网共享（Supabase）",
      _cfg: { url: base, anonKey },

      async listRecipes() {
        const rows = await request(
          rest + "?select=*&order=updated_at.desc",
          { method: "GET", headers: headers() }
        );
        return Array.isArray(rows) ? rows.map(rowToRecipe) : [];
      },

      async getRecipe(id) {
        const rows = await request(
          rest + "?select=*&id=eq." + encodeURIComponent(id),
          { method: "GET", headers: headers() }
        );
        if (!Array.isArray(rows) || !rows.length) return null;
        return rowToRecipe(rows[0]);
      },

      async saveRecipe(recipe) {
        const normalized = normalizeRecipe({
          ...recipe,
          updatedAt: nowISO(),
          createdAt: recipe.createdAt || nowISO(),
        });
        const row = {
          id: normalized.id,
          title: normalized.title,
          data: normalized,
          updated_at: normalized.updatedAt,
        };
        const rows = await request(rest + "?on_conflict=id", {
          method: "POST",
          headers: headers({
            Prefer: "resolution=merge-duplicates,return=representation",
          }),
          body: JSON.stringify(row),
        });
        if (Array.isArray(rows) && rows[0]) return rowToRecipe(rows[0]);
        return normalized;
      },

      async deleteRecipe(id) {
        await request(rest + "?id=eq." + encodeURIComponent(id), {
          method: "DELETE",
          headers: headers({ Prefer: "return=minimal" }),
        });
        return true;
      },

      async exportAll() {
        const recipes = await this.listRecipes();
        return {
          schemaVersion: SCHEMA_VERSION,
          exportedAt: nowISO(),
          app: "本草膳录",
          recipes,
        };
      },

      async importMerge(incoming) {
        const list = Array.isArray(incoming)
          ? incoming
          : Array.isArray(incoming && incoming.recipes)
            ? incoming.recipes
            : null;
        if (!list) throw new Error("invalid_import");
        for (const r of list) {
          if (!r || !r.title) continue;
          await this.saveRecipe(normalizeRecipe({ ...r, id: r.id || uid() }));
        }
        return this.listRecipes();
      },

      async clearAll() {
        const recipes = await this.listRecipes();
        for (const r of recipes) await this.deleteRecipe(r.id);
        return true;
      },
    };
  }

  function backendConfigured() {
    const cfg = window.RECIPE_BACKEND;
    if (!cfg || cfg.type === "local") return false;
    if (cfg.type === "supabase") {
      return Boolean(cfg.url && String(cfg.url).trim() && cfg.anonKey && String(cfg.anonKey).trim());
    }
    return false;
  }

  function createStore() {
    const cfg = window.RECIPE_BACKEND || { type: "local" };
    if (cfg.type === "supabase" && backendConfigured()) {
      return createRemoteStore(cfg);
    }
    return LocalStore;
  }

  // Public-facing async API used by the UI
  async function listRecipes() {
    return store.listRecipes();
  }
  async function getRecipe(id) {
    return store.getRecipe(id);
  }
  async function saveRecipe(recipe) {
    return store.saveRecipe(recipe);
  }
  async function deleteRecipe(id) {
    return store.deleteRecipe(id);
  }
  async function exportAll() {
    return store.exportAll();
  }
  async function importMerge(data) {
    return store.importMerge(data);
  }

  function showLocalBanner(isLocal) {
    const banner = document.getElementById("local-banner");
    if (!banner) return;
    const msg = banner.querySelector(".local-banner-msg");
    banner.hidden = false;
    if (isLocal) {
      banner.classList.remove("is-remote");
      if (msg) msg.textContent = "当前为浏览器本地稿；联网共享开启后所有人可共同编辑";
    } else {
      banner.classList.add("is-remote");
      if (msg) msg.textContent = "联网共享 · 任何人可编辑";
    }
  }

  async function refreshStateFromStore() {
    state.recipes = await listRecipes();
  }

  // ---------- Seed ----------
  async function seedRecipes(silent) {
    await refreshStateFromStore();
    let added = 0;
    const titles = new Set(state.recipes.map((r) => r.title));
    const ids = new Set(state.recipes.map((r) => r.id));
    for (const seed of SEED_RECIPES) {
      if (titles.has(seed.title)) continue;
      if (seed.id && ids.has(seed.id)) continue;
      await saveRecipe(
        normalizeRecipe({
          ...seed,
          id: seed.id || uid(),
          createdAt: nowISO(),
          updatedAt: nowISO(),
        })
      );
      added++;
    }
    await refreshStateFromStore();
    if (added) {
      if (!silent) toast(`已载入 ${added} 道示例膳方`);
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
          ...(r.sections || []).map((s) => s.title + " " + s.body),
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
      n === 0 ? 0 : state.recipes.reduce((s, r) => s + (r.rating || 0), 0) / n;
    stats.innerHTML = `
      <span class="stat-chip">📜 ${n} 道膳方</span>
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
      grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--ink-mute);padding:2rem">没有匹配的膳方，试试清空筛选～</p>`;
      return;
    }

    grid.innerHTML = list
      .map((r, idx) => {
        const coverBg = accentHex(r.accent) + "22";
        const media = r.image
          ? `<img src="${escapeHtml(r.image)}" alt="${escapeHtml(r.title)}" loading="lazy" />`
          : `<span class="card-emoji" aria-hidden="true">${escapeHtml(r.emoji || "🌿")}</span>`;
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
  async function renderDetail(id) {
    let r = state.recipes.find((x) => x.id === id);
    if (!r) r = await getRecipe(id);
    const root = document.getElementById("view-detail");
    if (!r) {
      root.innerHTML = `<div class="empty-state"><h2>找不到这道膳方</h2><button type="button" class="btn btn-ghost" data-back>回封面</button></div>`;
      root.querySelector("[data-back]").onclick = () => navigate("home");
      return;
    }

    const coverBg = accentHex(r.accent) + "33";
    const media = r.image
      ? `<img src="${escapeHtml(r.image)}" alt="${escapeHtml(r.title)}" />`
      : `<span class="cover-emoji" aria-hidden="true">${escapeHtml(r.emoji || "🌿")}</span>`;

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

    const steps = (r.steps || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("");

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
              ? `<h2 class="section-label">🌿 食材</h2><ul class="ingredient-list" id="detail-ings">${ings}</ul>`
              : ""
          }
        </div>
        <div class="page-panel right-page" style="--accent:${accentHex(r.accent)}">
          <div class="washi-corner washi-tl" style="--tape-c:var(--tape-sage)"></div>
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
    root.querySelector("#btn-mark-cooked").onclick = async () => {
      r.lastCooked = new Date().toISOString().slice(0, 10);
      r.updatedAt = nowISO();
      await saveRecipe(r);
      await refreshStateFromStore();
      toast("已记下今天做过啦");
      renderDetail(r.id);
    };
    root.querySelector("#btn-delete-recipe").onclick = async () => {
      const ok = await confirmModal("删除这道膳方？", `「${r.title}」将从膳录中移除，无法恢复。`);
      if (!ok) return;
      await deleteRecipe(r.id);
      await refreshStateFromStore();
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
      document.getElementById("editor-heading").textContent = "编辑膳方";
    } else {
      document.getElementById("editor-heading").textContent = "录一道新膳";
    }

    state.editorTags = r ? [...(r.tags || [])] : [];
    state.editorEmoji = r ? r.emoji || "🌿" : "🌿";
    state.editorAccent = r ? r.accent || "sage" : "sage";
    state.editorTape = r ? r.tape || "sage" : "sage";
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
    renderSectionRows(
      r && r.sections && r.sections.length
        ? r.sections
        : [
            { title: "功效（传统食养参考）", body: "" },
            { title: "宜忌（传统食养参考）", body: "" },
          ]
    );
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
    const unique = ACCENTS.filter(
      (a, i, arr) => !["coral", "mustard"].includes(a.id) && arr.findIndex((x) => x.id === a.id) === i
    );
    const el = document.getElementById("color-swatches");
    el.innerHTML = unique
      .map(
        (a) =>
          `<button type="button" class="swatch ${
            state.editorAccent === a.id ? "selected" : ""
          }" data-accent="${a.id}" style="background:${a.hex}" title="${a.label}" aria-label="${a.label}" aria-pressed="${
            state.editorAccent === a.id
          }"></button>`
      )
      .join("");
    el.querySelectorAll(".swatch").forEach((btn) => {
      btn.onclick = () => {
        state.editorAccent = btn.dataset.accent;
        renderColorSwatches();
      };
    });
  }

  function renderTapeSwatches() {
    const unique = TAPES.filter((t) => ["sage", "cinnabar", "ochre", "celadon"].includes(t.id));
    const el = document.getElementById("tape-swatches");
    el.innerHTML = unique
      .map(
        (t) =>
          `<button type="button" class="swatch ${
            state.editorTape === t.id ? "selected" : ""
          }" data-tape="${t.id}" style="background:${t.css};border-radius:3px;width:2.2rem;height:1.4rem" title="${t.label}" aria-label="${t.label}"></button>`
      )
      .join("");
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
        <input type="text" class="ing-name" placeholder="食材 / 药材名" value="${escapeHtml(ing.name || "")}" aria-label="食材名" />
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
          <input type="text" class="sec-title" placeholder="章节标题（如：功效 / 宜忌）" value="${escapeHtml(s.title || "")}" aria-label="章节标题" />
          <button type="button" class="btn-remove" aria-label="删除章节">×</button>
        </div>
        <textarea class="sec-body" rows="2" placeholder="章节内容…（请标注为传统食养参考）" style="margin-top:0.35rem;width:100%;padding:0.55rem 0.7rem;border:1.5px solid var(--paper-deep);border-radius:8px;background:var(--cream)" aria-label="章节内容">${escapeHtml(s.body || "")}</textarea>
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

  async function saveEditor(e) {
    e.preventDefault();
    const title = document.getElementById("ed-title").value.trim();
    if (!title) {
      toast("请先写上膳名");
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

    await saveRecipe(recipe);
    await refreshStateFromStore();
    toast("已保存到膳录 ✿");
    navigate("detail", id);
  }

  // ---------- Settings / export-import ----------
  function renderSettings() {
    document.getElementById("schema-version-label").textContent = SCHEMA_VERSION;
    document.getElementById("settings-count").textContent = state.recipes.length;
    const modeEl = document.getElementById("store-mode-label");
    if (modeEl) modeEl.textContent = store ? store.label : "本地";
  }

  async function doExport() {
    const payload = await exportAll();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `本草膳录-备份-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast("已导出备份文件");
  }

  function doImport(file) {
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
        state.recipes = await importMerge(data);
        toast(`已导入，当前共 ${state.recipes.length} 道`);
        navigate("home");
      } catch (e) {
        toast("无法解析 JSON 文件");
      }
    };
    reader.readAsText(file);
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
      const live = Array.from(document.querySelectorAll("#section-list .dyn-row")).map((row) => ({
        title: row.querySelector(".sec-title").value,
        body: row.querySelector(".sec-body").value,
      }));
      live.push({ title: "", body: "" });
      renderSectionRows(live);
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
      const ok = await confirmModal("删除这道膳方？", `「${r ? r.title : ""}」将永久删除。`);
      if (!ok) return;
      await deleteRecipe(id);
      await refreshStateFromStore();
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

    document.getElementById("btn-export").onclick = () => doExport();
    document.getElementById("import-file").addEventListener("change", (e) => {
      const f = e.target.files && e.target.files[0];
      if (f) doImport(f);
      e.target.value = "";
    });
    document.getElementById("btn-seed").onclick = () => seedRecipes(false);
    document.getElementById("btn-clear").onclick = async () => {
      const ok = await confirmModal(
        "清空全部数据？",
        "所有食谱将删除。请确认你已导出备份。"
      );
      if (!ok) return;
      if (store.clearAll) await store.clearAll();
      else {
        for (const r of [...state.recipes]) await deleteRecipe(r.id);
      }
      await refreshStateFromStore();
      toast("已清空");
      navigate("home");
    };

    window.addEventListener("hashchange", parseHash);
  }

  // ---------- Boot ----------
  async function init() {
    store = createStore();
    const isLocal = store.name === "local";
    showLocalBanner(isLocal);

    bind();
    await refreshStateFromStore();

    // Seed demo recipes when the active store is empty (local or remote).
    if (state.recipes.length === 0) {
      await seedRecipes(true);
    }

    parseHash();
  }

  // Expose API for debugging / future modules
  window.RecipeAPI = {
    listRecipes,
    getRecipe,
    saveRecipe,
    deleteRecipe,
    exportAll,
    importMerge,
    getStore: () => store,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
