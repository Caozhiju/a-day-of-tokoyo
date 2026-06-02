# 梦华一日 - 在东京梦华录中过一天

## 项目介绍

《梦华一日》是一个融合宋代美学与现代技术的沉浸式文化体验平台。通过穿越北宋东京城，体验普通人的一天，感受传统文化的魅力。

## ✨ 特色

- 🏯 **宋代美学设计** - 采用宋代视觉元素和水墨风格
- 📜 **卷轴式布局** - 传统卷轴效果，营造古籍阅读体验
- 🎨 **米黄色主题** - 温暖的米黄色背景，配合古籍纹理
- ✍️ **水墨效果** - 细致的墨迹和晕染效果
- 🌟 **金色点缀** - 传统金色装饰元素
- 📱 **响应式设计** - 完美适配各种屏幕尺寸

## 🛠️ 技术栈

- **框架**: [Next.js 14](https://nextjs.org/)
- **样式**: [TailwindCSS](https://tailwindcss.com/)
- **字体**: [Noto Serif SC](https://fonts.google.com/) - Google 开源中文字体
- **语言**: TypeScript + React

## 📦 快速开始

### 前置条件

- Node.js 18+ 版本
- npm、yarn 或 pnpm

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 开发模式

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

然后在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看网站。

### 生产构建

```bash
npm run build
npm run start
```

## 📁 项目结构

```
梦华一日/
├── app/                    # Next.js 应用目录
│   ├── layout.tsx         # 根布局组件
│   ├── page.tsx           # 首页
│   └── globals.css        # 全局样式
├── public/                # 静态资源目录
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── tailwind.config.js     # TailwindCSS 配置
├── postcss.config.js      # PostCSS 配置
├── next.config.js         # Next.js 配置
└── README.md              # 项目说明
```

## 🎨 设计元素

### 色彩方案

- **背景色**: `#F5EFE0` (米黄色/米纸色)
- **次背景**: `#E8DCCB` (陈旧米黄)
- **文字色**: `#3A3A3A` (深灰/墨色)
- **强调色**: `#D4AF37` (金色)
- **辅助色**: `#7A7A7A` (浅灰色)

### 排版

- 主字体: Noto Serif SC (思源宋体)
- 正文字重: 400
- 标题字重: 700, 900

## 🚀 部署

### Vercel 部署

本项目可轻松部署到 Vercel：

1. 将项目推送到 GitHub
2. 在 [Vercel](https://vercel.com) 上创建新项目
3. 关联 GitHub 仓库
4. 部署完成！

### 其他平台

支持任何支持 Node.js 的平台：
- AWS Amplify
- Netlify
- Railway
- Render
- 等等...

## 📝 可自定义部分

- **导航链接**: 修改 `app/page.tsx` 中的导航菜单
- **文案内容**: 编辑各个文本段落
- **颜色主题**: 调整 `tailwind.config.js` 中的色彩值
- **字体**: 修改 `app/layout.tsx` 中的字体导入
- **动画效果**: 增强 `app/globals.css` 中的过渡和动画

## 🔧 开发建议

1. **响应式测试**: 使用浏览器开发者工具测试各种屏幕尺寸
2. **性能优化**: 使用 Next.js 内置的图片优化和代码分割
3. **可访问性**: 确保链接和按钮有适当的 ARIA 标签
4. **SEO**: 更新 `app/layout.tsx` 中的元数据

## 📄 许可证

此项目开源，详见 LICENSE 文件。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有疑问或建议，请通过以下方式联系：
- 邮件: contact@example.com
- 网站: https://example.com

---

**梦华一日** - 在东京梦华录中过一天 ✨
