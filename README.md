# 本草膳录 · 药食同源 · 共享食谱

手账 / scrapbook 风格的**公共**药食同源食谱本：宣纸感底色、青瓷绿与朱砂点缀、竹叶淡影。适合共同记录茶饮、粥膳与家常食养方。

> **传统食养参考，不构成医疗建议。** 请勿当作诊疗、用药或替代专业医疗意见。

## 公开 wiki（当前线上模式）

本站已接入 **Supabase** 作为公共共享后端：任何人打开站点链接即可浏览、新增、编辑与删除膳方（RLS 对 `anon` 开放 SELECT/INSERT/UPDATE/DELETE，属有意设计）。

- 线上地址：https://xiezhihao891-arch.github.io/recipe-journal/
- 数据表：`public.recipes`（`id` / `title` / `data` jsonb）
- 前端仅使用 **anon** 公钥；切勿把 `service_role` 写进仓库或页面

若需改回仅本机草稿，将 `config.js` 中 `type` 设为 `"local"`（或清空 `url` / `anonKey`）。

## 功能一览

- **封面**：膳方卡片墙、搜索、标签/分类筛选、多种排序
- **详情**：左右书页布局；食材勾选、步骤、评分、备忘、自由章节（功效 / 宜忌）；**烹饪模式**放大步骤
- **编辑器**：高自由度——任意增删食材/步骤/章节；点缀色、胶带色、emoji 封面；图片 URL 或本地上传；即时化标签
- **设置**：导出 / 导入 JSON、载入示例膳方、清空数据
- **存储**：`listRecipes` / `getRecipe` / `saveRecipe` / `deleteRecipe` / `exportAll` / `importMerge`；`config.js` 切换 LocalStore ↔ RemoteStore（Supabase PostgREST）

## 本地打开

```bash
cd recipe-journal
python3 -m http.server 8765
# 浏览器打开 http://localhost:8765
```

或直接打开 `index.html`。

```
recipe-journal/
  index.html    # 页面结构（先加载 config.js，再加载 app.js）
  styles.css    # 药食同源手账视觉
  app.js        # 逻辑与存储 API
  config.js     # 后端配置（Supabase url + anonKey）
  assets/       # 预留静态资源
  README.md
```

无需构建，纯静态 HTML/CSS/JS。

## 数据如何存储

- **联网模式**（默认已配置）：Supabase REST；顶栏显示「联网共享 · 任何人可编辑」
- **本地模式**：`localStorage` 键名 `bencao-shanlu-v1`；顶栏提示本地稿；清站点数据会丢失，请先导出 JSON
- 首次打开若远端（或本地）列表为空，会自动写入 3 道示例膳方（按标题去重，不会重复灌入）

## 示例膳方

1. 枸杞红枣茶  
2. 山药薏米粥  
3. 生姜红糖水  

每道含简要「功效 / 宜忌」自由章节，措辞为传统食养参考。

## 主题说明

- 字体：Ma Shan Zheng / ZCOOL XiaoWei（标题）+ Noto Sans SC（正文），经 Google Fonts CDN
- 色板：宣纸米黄、墨色、青瓷绿、Muted 朱砂、赭石胶带
- 装饰：和纸胶带、拍立得卡片、竹叶 SVG 淡纹

## 部署说明

GitHub Pages（`master`）：https://xiezhihao891-arch.github.io/recipe-journal/

—

本草膳录 · 药食同源 · 共享食谱 · 非医疗建议
