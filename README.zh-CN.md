# JGC Flight Planner

[English](README.md) | [日本語](README.ja.md)| **简体中文**

面向日航 JGC「修行僧」的飞行规划工具。

把当前积分、目标进度、计划行程与每点成本放在同一个画面，让下一次出发更有方向。

本仓库为项目的 **前端应用**，采用 Next.js 构建。界面默认日语，支持英语与简体中文。

## 项目背景

这个项目为以 JAL Global Club（JGC）为目标、喜欢研究航线与积分效率的「修行僧」而设计。这里的「修行」，指的是围绕常旅客目标规划飞行行程：除了想去哪里，也会关心这次飞行距离目标还有多远，以及需要投入多少预算。

JAL 的 [Life Status プログラム](https://www.jal.co.jp/jp/ja/jmb/lsp/) 是根据搭乘航班和使用相关生活服务累积 Life Status Points（LSP）的终身实绩计划。本项目聚焦其中的**飞行规划场景**，希望帮助使用者回答几个具体问题：

- 我目前有多少 LSP，距离自己设定的目标还差多少？
- 计划中的单程或往返行程，预计可以获得多少 LSP？
- 这张机票的每点成本是多少，是否适合自己的预算？
- 估算采用了哪个版本的规则，哪些区间仍需要确认资格？

项目从手动输入和可追溯的试算开始，逐步建立适合「JGC 修行」的规划体验。它也是一个使用 AI 辅助开发的全栈工程实践项目。

> 当前版本为原型，所有航班积分计算均为**未经验证的演示估算**，不代表 JAL 官方积分权益。阅读官方资料不意味着项目中的计算规则已经完成核实。LSP 与年度 FLY ON Points 是不同概念，不能混用。本项目为独立开发，与日本航空无隶属关系。

官方背景资料：[JAL Life Status プログラム](https://www.jal.co.jp/jp/ja/jmb/lsp/) · [Star 等级说明](https://www.jal.co.jp/jp/ja/jmb/lsp/jgc/)。实际积分、资格和权益请以 JAL 最新公布的条件为准。

## 当前功能

| 功能 | 说明 |
| --- | --- |
| LSP Dashboard | 手动设置当前 LSP 和个人目标，查看剩余积分与完成进度 |
| 航班模拟器 | 支持单程、往返，输入机场、日期、机票总价和营销承运人 |
| 逐航段资格 | 手动指定符合资格、不符合资格或未知，不根据机场推断资格 |
| 积分与成本预览 | 展示后端返回的预计 LSP、日元／LSP 和逐航段明细 |
| 政策透明度 | 展示政策标识、版本、验证状态及演示警告 |
| 多语言 | 日语、英语、简体中文；通过侧边栏菜单切换并记住语言选择 |
| 响应式界面 | 适配桌面和手机，提供加载、空结果、校验和错误重试状态 |

当前积分和目标使用演示值，可在画面中修改；刷新后会重置。语言偏好保存在当前浏览器中，切换语言不会清空已输入的行程或估算结果。

目前未接入 JAL 账户、数据库、真实票价查询或自动资格验证，也不支持保存历史行程或自动搜索最优航线。

### 演示行程

点击「羽田〜那覇のデモを試す」，再点击「デモLSPを試算する」，即可请求以下示例：

| 项目 | 演示值 |
| --- | --- |
| 行程 | HND → OKA → HND（羽田—那霸往返） |
| 日期 | 2026-11-01 至 2026-11-03 |
| 营销承运人 | JL |
| 机票总价 | ¥35,000 |
| 资格 | 两个航段均手动标记为符合资格 |
| 预计积分 | 10 demo LSP |
| 每点成本 | ¥3,500／LSP |

以上结果来自后端当前的**未验证演示政策**，不是官方计算示例。默认余额、个人目标和示例行程集中配置在 [`src/config/demo.ts`](src/config/demo.ts)。界面中的目标值不构成已核实的 JGC 资格判断。

资格未知或航线超出政策范围时，总计保持待确认，同时展示已知的航段结果；积分为 0 时，每点成本显示为不可用。

## 技术栈

| 层面 | 技术 |
| --- | --- |
| 前端框架 | Next.js 16 · App Router |
| UI | React 19 · TypeScript |
| 样式 | Tailwind CSS 4 · CSS · 海军蓝、白色与暗红色强调色 |
| 多语言 | React Context · JSON 语言包 · 浏览器语言偏好存储 |
| API 通信 | Fetch API · 响应格式校验 · 超时与取消处理 |
| 代码检查 | ESLint 9 · TypeScript |
| 前端测试 | Node.js 内置测试运行器 · TypeScript 编译器 |
| 独立后端 | Express 5 · TypeScript · Zod |

前后端分别维护在两个仓库中：

- 前端：[jal-jgc-flight-planner-fe](https://github.com/FrancineHuang/jal-jgc-flight-planner-fe)
- 后端：[jal-jgc-flight-planner-be](https://github.com/FrancineHuang/jal-jgc-flight-planner-be)

前端负责输入、校验、交互和结果展示，调用后端 `POST /api/v1/lsp/estimates`。所有航班 LSP 计算逻辑由后端负责，前端不维护计算公式。

## 本地环境搭建

### 1. 准备环境与代码

以下步骤以 **Node.js 24、npm 和 Git** 为开发环境。使用前请确认命令可用：

```sh
node --version
npm --version
git --version
```

首次搭建时，将两个仓库克隆到同一个工作目录：

```sh
mkdir jal-jgc-flight-planner
cd jal-jgc-flight-planner

git clone https://github.com/FrancineHuang/jal-jgc-flight-planner-fe.git
git clone https://github.com/FrancineHuang/jal-jgc-flight-planner-be.git
```

已有代码时，可直接使用现有目录，跳过克隆步骤。下面的两个终端都从这个工作目录开始。

### 2. 启动后端

在第一个终端中运行：

```sh
cd jal-jgc-flight-planner-be
npm ci
npm run dev
```

后端默认运行在 `http://localhost:4000`，默认允许 `http://localhost:3000` 的前端请求。使用默认地址时，无需额外配置后端环境变量。

可以在另一个终端检查服务是否正常：

```sh
curl http://localhost:4000/api/health
```

预期响应：

```json
{ "status": "ok", "service": "JGC Flight Planner API" }
```

### 3. 配置并启动前端

在第二个终端中运行。`cp` 用于首次创建配置文件；如果已有 `.env.local`，跳过该命令并保留原配置：

```sh
cd jal-jgc-flight-planner-fe
npm ci
cp .env.example .env.local
```

核对 `.env.local` 中的 API 地址。默认配置为：

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

然后启动前端：

```sh
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)，即可看到默认日语 Dashboard。侧边栏的「表示言語」菜单可切换为 English 或简体中文。

仅启动前端也可以查看页面；提交航班估算需要后端同时运行。

### 环境变量

| 应用 | 变量 | 默认值／示例 | 用途 |
| --- | --- | --- | --- |
| 前端 | `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4000` | 后端服务地址，不包含 `/api/v1` |
| 后端 | `PORT` | `4000` | 后端监听端口 |
| 后端 | `FRONTEND_ORIGIN` | `http://localhost:3000` | CORS 允许的前端来源 |

`NEXT_PUBLIC_API_BASE_URL` 会进入浏览器代码，不应存放密钥。修改后，需要重启前端开发服务；生产环境需要重新构建。提交环境配置时使用 `.env.example`，`.env` 和 `.env.local` 已被 Git 忽略。

如果前端使用其他端口，需要让后端的 `FRONTEND_ORIGIN` 与实际访问地址一致。例如，前端运行在 `http://localhost:3001` 时，重新启动后端：

```sh
FRONTEND_ORIGIN=http://localhost:3001 npm run dev
```

上面的命令在后端目录中运行，适用于 macOS、Linux 或 Git Bash。`localhost` 和 `127.0.0.1` 也属于不同来源，配置时应保持一致。

项目通过 `next/font/google` 加载 Geist 字体，首次构建需要能够访问 Google Fonts。

## 开发检查与构建

在前端目录运行：

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

前端测试覆盖请求格式、输入边界、未知值与零值、API 错误、多语言文案完整性、日期格式和语言偏好存储。

后端运行时，还可以执行真实 API 联调：

```sh
npm run test:integration
```

联调脚本默认连接 `http://localhost:4000`；如需其他地址，通过进程环境变量指定：

```sh
NEXT_PUBLIC_API_BASE_URL=http://localhost:4001 npm run test:integration
```

生产模式下，在构建成功后运行：

```sh
npm start
```

后端仍需单独运行，并允许生产前端的来源。

## 目录结构

```text
src/
├── app/                       页面入口、元数据与全局样式
├── components/
│   ├── dashboard/             Dashboard、积分设置与语言菜单
│   ├── simulator/             航班表单、请求状态与估算结果
│   └── ui/                    共用图标
├── config/demo.ts             演示余额、目标和行程
├── i18n/
│   ├── messages/              ja.json、en.json、zh.json
│   ├── dictionaries.ts        文案类型与变量替换
│   ├── locale-provider.tsx    语言上下文和页面语言同步
│   └── locale-store.ts        浏览器语言偏好
└── lib/
    ├── lsp/                   API 类型、请求与输入校验
    └── format.ts              数字、日元与日期格式
tests/                         单元测试和 API 联调脚本
```

开发前请阅读 [`AGENTS.md`](AGENTS.md)，并保留其中由 Next.js 生成的说明。后端 API 的详细契约与政策配置请参考[后端 README](https://github.com/FrancineHuang/jal-jgc-flight-planner-be#readme)。
