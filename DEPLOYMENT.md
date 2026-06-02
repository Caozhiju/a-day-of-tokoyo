# 🚀 梦华一日 - 部署指南

本指南将帮助您将"梦华一日"网站部署到互联网上。

## 部署前的准备

1. 确保项目可以本地正常运行
   ```bash
   npm run dev
   ```

2. 确保生产构建成功
   ```bash
   npm run build
   npm start
   ```

## 推荐部署方案

### 1️⃣ Vercel 部署（最简单）

Vercel 是 Next.js 的创建者，提供最优化的 Next.js 部署体验。

#### 步骤：

1. **创建 GitHub 账户**（如果还没有）
2. **将项目推送到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/menghua-yiri.git
   git push -u origin main
   ```

3. **在 Vercel 上部署**
   - 访问 https://vercel.com
   - 点击 "New Project"
   - 授权并选择你的 GitHub 仓库
   - 保持默认设置，点击 "Deploy"
   - 等待部署完成

4. **配置自定义域名**（可选）
   - 在 Vercel 项目设置中添加域名
   - 按照 Vercel 的指导配置 DNS

#### 优点：
- ✅ 免费使用
- ✅ 自动部署（git push 后自动更新）
- ✅ 全球 CDN 加速
- ✅ HTTPS 自动配置
- ✅ 优化的性能

### 2️⃣ Netlify 部署

Netlify 也是一个很好的 Next.js 部署选择。

#### 步骤：

1. **在 Netlify 上注册**
   - 访问 https://netlify.com

2. **连接 GitHub**
   - 点击 "New site from Git"
   - 授权 GitHub
   - 选择你的仓库

3. **配置构建设置**
   - Build command: `npm run build`
   - Publish directory: `.next`（需要配置 standalone）

4. **部署**
   - 点击 "Deploy site"

#### 优点：
- ✅ 免费使用
- ✅ 良好的性能
- ✅ CDN 加速
- ✅ 表单功能支持

### 3️⃣ 自托管部署

如果你已有自己的服务器：

#### 方案 A：使用 PM2（Node.js）

1. **准备服务器**
   ```bash
   # 安装 Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # 安装 PM2
   npm install -g pm2
   ```

2. **克隆和部署项目**
   ```bash
   git clone https://github.com/yourusername/menghua-yiri.git
   cd menghua-yiri
   npm install
   npm run build
   ```

3. **使用 PM2 启动**
   ```bash
   pm2 start npm --name "menghua-yiri" -- start
   pm2 save
   pm2 startup
   ```

4. **配置 Nginx 反向代理**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **设置 SSL（HTTPS）**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

#### 方案 B：使用 Docker

1. **创建 Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY .next ./.next
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **构建和运行**
   ```bash
   docker build -t menghua-yiri .
   docker run -p 3000:3000 menghua-yiri
   ```

### 4️⃣ 其他平台

- **Railway**: https://railway.app
- **Render**: https://render.com
- **AWS Amplify**: https://aws.amazon.com/cn/amplify/
- **阿里云**: 支持 Node.js 应用
- **腾讯云**: 支持云函数和 COS
- **七牛云**: CDN 加速

## 部署后的配置

### 1. 更新环境变量

创建 `.env.production` 文件：
```
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

### 2. 配置 SEO

更新 `app/layout.tsx` 中的元数据：
```typescript
export const metadata: Metadata = {
  title: "梦华一日 - 在东京梦华录中过一天",
  description: "穿越北宋东京城，体验普通人的一天。沉浸式宋代文化体验平台。",
  keywords: "东京梦华录, 宋代文化, 传统文化, 梦华一日",
  openGraph: {
    title: "梦华一日",
    description: "穿越北宋东京城，体验普通人的一天",
    url: "https://yourdomain.com",
    type: "website",
  },
};
```

### 3. 添加分析工具

#### Google Analytics
```bash
npm install @react-google-analytics/core
```

在 `app/layout.tsx` 中添加：
```tsx
<script
  async
  src={`https://www.googletagmanager.com/gtag/js?id=GA_ID`}
/>
<script
  dangerouslySetInnerHTML={{
    __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_ID');
    `,
  }}
/>
```

### 4. 性能优化

#### 启用 Image Optimization
```tsx
import Image from 'next/image';

<Image 
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
/>
```

#### 启用 Code Splitting
Next.js 会自动处理

## 故障排除

### 构建失败

1. **清除缓存**
   ```bash
   rm -rf .next
   npm run build
   ```

2. **检查日志**
   - Vercel: 在项目的 Deployments 标签查看日志
   - Netlify: 在 Deploys 标签查看构建日志

### 性能问题

1. **检查 Core Web Vitals**
   - 使用 Google PageSpeed Insights
   - 优化图片大小
   - 减少 JavaScript 包大小

2. **CDN 缓存**
   - 配置缓存头
   - 使用 Image Optimization

### 域名配置

确保 DNS 设置正确：
- CNAME 记录指向部署平台
- 或 A 记录指向服务器 IP

## 持续部署

### 自动更新

大多数平台支持自动部署：
1. git push 到 main 分支
2. 自动触发构建和部署
3. 网站自动更新

### 环境变量管理

在部署平台的设置中添加环境变量，例如：
```
NEXT_PUBLIC_API_URL
DATABASE_URL
API_KEY
```

## 监控和维护

### 监控工具

- **Vercel Analytics**: 包含在 Vercel 中
- **Google Analytics**: 配置 GA4
- **Sentry**: 错误追踪

### 定期维护

1. **更新依赖**
   ```bash
   npm update
   npm audit fix
   ```

2. **检查安全问题**
   ```bash
   npm audit
   ```

3. **监控性能**
   - 定期检查 Core Web Vitals
   - 优化可能的瓶颈

## 成本预估

| 平台 | 免费额度 | 推荐用途 |
|------|---------|---------|
| Vercel | 100GB/月 | 个人项目、小型网站 |
| Netlify | 100GB/月 | 个人项目、博客 |
| Railway | $5/月 | 中小型项目 |
| AWS | 首年免费 | 企业项目 |

## 总结

- 🏆 **最佳选择**: Vercel（最简单、最优化）
- ⭐ **备选方案**: Netlify、Railway
- 🔧 **高度可定制**: 自托管（Docker、服务器）

选择最适合你的方案，开始部署吧！

---

**需要帮助？** 
查看各平台的官方文档或在社区中寻求帮助。

祝部署顺利！🎉
