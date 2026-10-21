# 手账食谱 · 志豪的厨房日记

纸质手账 / scrapbook 风格的私人食谱本：暖色牛皮纸底、和纸胶带、拍立得相框、手写标题字体。数据全部存在浏览器本地，可离线使用。

## 功能一览

- **封面**：食谱卡片墙、搜索、标签/分类筛选、多种排序；空白时引导写第一道菜
- **详情**：左右书页布局；食材勾选划线、步骤、评分、个人备忘、自由章节；**烹饪模式**放大步骤
- **编辑器**：高自由度——任意增删食材/步骤/章节；点缀色、胶带色、emoji 封面；图片 URL 或本地上传；即时创建标签
- **设置**：导出 / 导入 JSON 备份、载入示例菜（番茄炒蛋、红烧肉、简易意面）、清空数据

## 本地打开

任选其一：

```bash
# 进入目录后起一个静态服务（推荐，避免 file:// 限制）
cd recipe-journal
python3 -m http.server 8765
# 浏览器打开 http://localhost:8765
```

或直接用浏览器打开 `index.html`（多数功能可用；部分浏览器对本地文件限制更严）。

文件结构：

```
recipe-journal/
  index.html    # 页面结构
  styles.css    # 手账视觉
  app.js        # 逻辑与 localStorage
  assets/       # 预留静态资源
  README.md
```

无需构建步骤，纯静态 HTML/CSS/JS。

## 数据如何存储

- 键名：`recipe-journal-v1`（localStorage）
- 含 `schemaVersion`（当前为 `1`），便于以后迁移
- 每道菜有随机 id、标题、封面（emoji / 图片）、点缀色、胶带、时间/份量/难度、标签、食材、步骤、备忘、自由章节、评分、上次烹饪日等
- **换浏览器 / 清站点数据会丢失**，请先在「设置」里导出 JSON

## 部署到 GitHub Pages（稍后）

仓库建议放在账号 `xiezhihao891-arch` 下，例如仓库名 `recipe-journal`：

1. 将本目录内容推到仓库的 `main`（或 `gh-pages`）分支根目录，或 `/docs`
2. GitHub → Settings → Pages → Source 选对应分支与文件夹
3. 访问：`https://xiezhihao891-arch.github.io/recipe-journal/`

注意：Pages 上每个访客的数据仍在**各自浏览器**的 localStorage，不会共享云端。

## 给志豪的小提示

- 标签输入框里打字后按 **回车** 添加贴纸
- 详情页勾选食材会划掉，适合边做边勾
- 图片上传请尽量小于约 500KB，以免撑爆 localStorage；大图建议用外链 URL

—
Made as a warm paper journal for 志豪 ✿
