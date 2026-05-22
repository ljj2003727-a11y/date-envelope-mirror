# 给林夏的约会邀请页：国内可访问部署说明

本目录是从 Vercel 页面导出的纯静态版本：

- `index.html`
- `styles.css`
- `script.js`

已验证：本地 `python3 -m http.server` 可正常打开，不依赖 Vercel 构建环境。

## 推荐部署路线

### 方案 A：腾讯云 COS 静态网站 + CDN（国内最稳）

适合：长期国内访问、微信转发、稳定展示。

步骤：
1. 开通腾讯云 COS。
2. 新建存储桶，地域选中国大陆近用户区域，例如广州/上海/北京。
3. 上传本目录内的 `index.html`、`styles.css`、`script.js`。
4. 开启“静态网站”功能，默认首页设为 `index.html`。
5. 绑定已备案域名。
6. 接入 CDN 或 EdgeOne。
7. 用最终域名访问。

注意：大陆 CDN/对象存储绑定自定义域名通常需要备案。

### 方案 B：香港轻量服务器 + Nginx（不用备案，较稳）

适合：没有备案域名，但想让国内大多数网络能直接打开。

步骤：
1. 买腾讯云/阿里云香港轻量服务器。
2. 安装 Nginx。
3. 把本目录文件上传到 `/var/www/date-envelope/`。
4. 配置 Nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/date-envelope;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

5. 域名 A 记录指向香港服务器 IP。
6. 可用 acme.sh / certbot 配 HTTPS。

### 方案 C：Cloudflare Pages / Workers Pages（免服务器，但国内稳定性一般）

适合：临时分享或无需极致稳定。

直接上传这个静态目录即可。

## 不推荐

- 继续直接发 Vercel 域名：国内经常打不开。
- 只给 Vercel 绑定域名：底层仍是 Vercel，国内不一定解决。
- GitHub Pages：国内也不稳定。

## 本地预览

```bash
cd /Users/lixuan/Desktop/Agent/date-envelope-mirror
python3 -m http.server 8123
```

打开：

```text
http://127.0.0.1:8123/?v=linxia
```
