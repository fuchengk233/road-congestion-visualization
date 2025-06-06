# 道路拥堵可视化系统

这是一个基于 React 和 AMap 的道路拥堵可视化系统，用于展示和分析道路拥堵状况。

## 功能特点

- 实时显示道路拥堵状态
- 支持时间选择查看历史拥堵数据
- 交互式地图操作
- 详细的路段信息展示
- 拥堵指数可视化

## 技术栈

- React 18
- TypeScript
- Ant Design
- AMap (高德地图)
- Day.js

## 本地开发

1. 克隆项目
```bash
git clone [项目地址]
cd road-congestion-visualization
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm start
```

4. 构建生产版本
```bash
npm run build
```

## 部署说明

本项目可以部署到以下平台：

1. Vercel（推荐）
   - 注册 Vercel 账号
   - 连接 GitHub 仓库
   - 自动部署

2. GitHub Pages
   - 运行 `npm run build`
   - 将 `build` 目录推送到 GitHub Pages 分支

3. 传统服务器
   - 运行 `npm run build`
   - 将 `build` 目录部署到 Web 服务器

## 注意事项

- 需要配置高德地图 API Key
- 确保服务器支持 HTTPS
- 建议使用现代浏览器访问

## 许可证

MIT 