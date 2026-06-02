# Shopify Custom App Helper

用于获取 Shopify 自建 app 安装到目标商店后的 offline access token。

服务端 OAuth 流程使用 Shopify 官方 Node SDK：`@shopify/shopify-api`。

## 使用方式

1. 在 Shopify Partner Dashboard 打开你的 app。
2. 将当前部署地址填入 `App URL`。
3. 将 `https://你的域名/api/auth/callback` 加入 `Allowed redirection URL(s)`。
4. 打开本工具首页，填写：
   - `Client ID`
   - `Client Secret`
   - `Shop Domain`
   - `Scopes`
5. 点击开始授权，完成 Shopify 安装与授权。
6. 回到首页后复制 access token。

## 会话隔离

- 每次授权上下文只保存在当前浏览器会话的 `httpOnly cookie` 里
- 不同访问者之间不会共享状态
- 服务端不依赖进程内内存保存授权结果

## 环境变量

必须设置：

```bash
NUXT_SESSION_SECRET=replace-with-a-long-random-secret
```

要求：

- 至少使用一段高强度随机字符串
- 生产环境必须稳定，不能频繁更换，否则进行中的授权回调会失效

## 本地开发

```bash
pnpm install
NUXT_SESSION_SECRET=dev-secret pnpm dev
```

默认地址：

```text
http://localhost:3000
```

回调地址：

```text
http://localhost:3000/api/auth/callback
```

## HTTPS 要求

- Shopify 官方 SDK 的 OAuth 状态 cookie 使用 `Secure`
- 真正走安装授权时，建议使用公开 HTTPS 域名或 tunnel 地址
- 纯 `http://localhost` 适合看页面，不适合完整验证安装回调

## 注意

- `Scopes` 需要与 app 已申请权限一致
- 这个工具返回的是对应商店的 offline token
- 如果修改部署域名，需要同步更新 Shopify 后台里的 App URL 和 redirect URL
