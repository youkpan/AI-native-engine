# ZY 企业智能引擎（AI Native Engine）

**中文** | [English](README_EN.md)

> 面向全领域的 AI 原生企业级智能服务平台：深度融合协同管理与 AI 原生自动化执行，实现从项目规划、构建、营销获客到财务核算的**全链路自动化运营**。用户创建 AI 原生公司，在公司内创建项目，AI 自动组建智能体组织、拆解任务、循环执行、迭代交付，并像一家真实公司一样持续经营、逐步"长大"。

- 当前版本：v3.x（活跃开发中，以 [git log](https://github.com/youkpan/AI-native-engine) 与代码为准）
- 技术栈：Go 1.26 · Vue 3 · PostgreSQL · SQLite · GLM / DeepSeek · [qianshou](https://zyinfo.pro/qianshou/) CLI

---

## 目录

- [项目简介](#项目简介)
- [核心特性](#核心特性)
- [三端架构](#三端架构)
- [技术栈](#技术栈)
- [仓库结构](#仓库结构)
- [快速开始](#快速开始)
- [配置与端口速查](#配置与端口速查)
- [文档索引](#文档索引)
- [联系](#联系)

## 项目简介

ZY 企业智能引擎是一个"AI 原生公司"运营平台：用户在平台上创建公司、创建项目，平台为每个项目开通一台物理隔离的项目服务器，AI 管理者智能体按项目定义自动组建智能体组织（管理者 + 员工 Agent），在预算与治理约束下自动拆解任务、调度执行、验收交付，并产出营销内容、经营报表与财务核算。

它既可以支持从 0 开始的创业项目（OPC 一人公司），也能适配成熟的多部门传统企业；支持全自动 / 半自动 / 人工审核三种运行模式，关键节点通过飞书 / Telegram 通知等待人工决策。

**三端一体**：

1. **大服务平台（SaaS 控制台）** — 账号体系、公司 / 项目管理、项目服务器实例生命周期、平台真实账本、超管后台。
2. **项目服务器（AI 执行引擎）** — 单实例单项目物理隔离，承载 AI Agent 循环执行、模型路由调用、自动运营（auto-ops）调度、项目账本、分层知识库与智能看板。
3. **本地边缘客户端** — 本地文档扫描上传、会议资料导入，接收服务器指令运行边缘 Agent。

## 核心特性

### 自动运营（auto-ops）
- **三种运行模式**：全自动 / 半自动 / 人工审核，项目创建时选择。
- **AI 全循环推进**：自动拆解任务 → 时间片调度轮次推进 → review 重排 → 接力推进 → free 维护；失败时降级 → 升级 → 退出兜底。
- **引导建项 / 现有项目导入**：对话式收集项目信息生成执行策略，策略确认后方可启动自动运营；也支持导入已有项目的资料与上下文。

### 双执行引擎
- **loop 引擎**：调用 [qianshou](https://zyinfo.pro/qianshou/)（类 Claude Code CLI）子进程，适合复杂 / 编码 / 长时任务（默认）。
- **Agent 引擎**：进程内 LLM + ToolCall，适合信息整合 / 接口调用。
- 引擎选择优先级：任务级 > 角色级 > 项目默认。

### 模型与计费
- **混合模型路由网关**：所有 LLM 调用统一经网关，按任务复杂度自动路由模型（GLM / DeepSeek 等），支持权重配置、成本控制、熔断与故障切换。
- **Token 计费**：从会话日志统计 usage，按牌价核算，计入平台真实账本与项目 AI 运行预算；预算触及预警线通知、超限熔断暂停。

### 治理与信任（V2.2）
- **三权分立验收**：执行、验收、批准三方分离，独立验收 Agent 对照 `done_when` 产出通过 / 返工 / 驳回结论，验收强度按风险分级。
- **人在回路**：RACI + 绿 / 黄 / 红三通道决策，人工节点带 SLA、升级链、超时降级；支持权限租赁与渐进式信任（自主级别 L1–L5）。
- **目标管理与审计**：目标树（愿景 → 目标 → KR → 任务）、独立内审 Agent、红队演练、风险登记册、管理转录审计、紧急停止（KillSwitch）。
- **权限与合规**：MCP 连接器最小权限，写操作必须人工审核；移动端审批页支持随时随地处理待办。

### 智能体组织与进化
- **智能体组织**：负责人制，管理者 Agent 只协调不下场，员工 Agent 专业执行；专家 / 技能 / 连接器三要素。
- **角色自我进化**：岗位档案 + 角色级 RunConfig（提示词 / 技能白名单 / 引擎等），经验沉淀、版本化快照、灰度 A/B 择优生效。
- **组织进化（V2.5）**：四阶段组织模型（起步 / 成长 / 规模化 / 成熟），AI 感知业务增长信号，主动产出带成本与证据的增员建议，支持"建议 → 确认 → 一键建角色 → 上岗"扩编流程与阶段切换（快照备份 / 回退）、八维定量调控（预算 / 自主权限 / 优化频率 / 模型等级等）。

### 数据与知识
- **分层知识库**：公司级 → 项目级 RAG，共享下级检索，待确认知识清单人工把关；支持本地文档上传与会议内容导入梳理（行动项可一键转为自动运营任务）。
- **数据飞轮**：全量 Prompt / 输出 / 反馈结构化入库，优秀案例 → RAG 检索注入 → 动态 Few-Shot 反哺。
- **双线账本**：平台真实账本（充值 / 算力费，余额不足熔断）+ 项目虚拟核算（预算耗尽暂停）+ 岗位级阿米巴核算。
- **经营可视化**：经营日报 / 分析 / 内审 / 红队报告、经营驾驶舱、监控指标、结项报告（目标达成率、ROI、知识沉淀清单）。

### 生态能力
- **媒体生成中心**：视频 / 图像 / 歌曲生成，按档位单价折算计入项目账本。
- **对外客户页面**：公开 AI 问答页（`/s/{token}`），仅检索白名单知识库，限流与有效期可控。
- **通知与协同**：飞书 / Telegram 通知、人工处理节点、审批配额与批处理窗口（注意力管理）。

## 三端架构

```
┌────────────────────────────────────────────────────────┐
│           用户 / 团队成员 / 超管（浏览器 · 移动端）        │
└─────────────┬──────────────────────────────────────────┘
              │ HTTPS
┌─────────────▼────────────────┐   ┌────────────────────┐
│  大服务平台 platform  :18000  │◄──┤  platform-web 前端  │
│  账号 / 公司 / 项目 / 实例 /   │   │  Vue3 (dev :5176)  │
│  平台账本 / 超管后台           │   └────────────────────┘
└─────────────┬────────────────┘
              │ HMAC 互信 / 实例开通
┌─────────────▼────────────────┐   ┌────────────────────┐
│ 项目服务器 project-server     │◄──┤  qianshou CLI 子进程 │
│ :8090  单实例单项目物理隔离    │   │  （loop 引擎）      │
│ auto-ops 调度 / 验收 / 账本 / │   └────────────────────┘
│ 知识库 RAG / 报告             │
└─────────────┬────────────────┘
              │ 指令下发 / 数据回传
┌─────────────▼────────────────┐
│  本地边缘客户端 edge-client    │
│  文档扫描上传 / 边缘 Agent     │
│  （SQLite 本地存储）          │
└──────────────────────────────┘
```

## 技术栈

| 层 | 技术 |
| --- | --- |
| 后端 | Go 1.26（Gin + GORM，三端均为独立 Go 模块） |
| 前端 | Vue 3（组合式 API）+ Vite + TypeScript + Element Plus + Pinia + ECharts |
| 数据库 | PostgreSQL 17（大平台库 `ai_native_engine`、项目服务器库 `project_server`） |
| 边缘存储 | SQLite 3（边缘客户端本地） |
| LLM | GLM + DeepSeek（经混合模型路由网关统一调度） |
| 执行引擎 | qianshou CLI 子进程（loop 引擎）+ 进程内 LLM ToolCall（Agent 引擎） |
| 测试 | Go test + Playwright E2E（platform-web） |

## 仓库结构

```
AI-native-engine/
├── platform/          # 大服务平台（SaaS 控制台后端，:18000）
├── project-server/    # 项目服务器（AI 执行引擎，:8090）
├── edge-client/       # 本地边缘客户端（SQLite）
├── platform-web/      # 统一前端（Vue3 + Vite，dev :5176）
├── release/           # 发布打包产物与《使用说明》
├── deploy/            # 部署脚本
├── scripts/           # 常用脚本
├── test/              # 常规测试
└── wiki/              # 文档中心（PRD / TAD / 手册 / 变更日志 / 开发记忆）
```

## 快速开始

### 1. 环境要求

- Go 1.26+
- Node.js 18+（前端构建与 qianshou CLI）
- PostgreSQL（建议 17），本机默认端口 `5432`
- （可选，loop 引擎需要）[qianshou CLI](https://zyinfo.pro/qianshou/)

### 2. 准备数据库

大平台与项目服务器**强制依赖 PostgreSQL**（无 SQLite 回退）；边缘客户端使用本地 SQLite，无需部署。

```sql
CREATE DATABASE ai_native_engine;    -- 大平台库
CREATE DATABASE project_server;      -- 项目服务器库
```

首次启动服务会自动建表与迁移。

### 3. 配置

两份配置文件：`platform/configs/config.yaml` 与 `project-server/configs/config.yaml`（可从同目录 `config.example.yaml` 复制修改），主要填写数据库连接。生产环境推荐用环境变量覆盖（前缀 `AE_` / `PS_`），例如：

```bash
AE_DATABASE_PASSWORD=...   # 大平台数据库密码
AE_JWT_SECRET=...          # 大平台 JWT 密钥
PS_DATABASE_PASSWORD=...   # 项目服务器数据库密码
PS_LLM_DEEPSEEK_API_KEY=sk-...   # DeepSeek API Key
PS_LLM_GLM_API_KEY=...           # GLM API Key
```

### 4. 编译与启动

```bash
# 大平台（默认 :18000）
cd platform && go build -o server.exe ./cmd/server && ./server.exe

# 项目服务器（默认 :8090）
cd project-server && go build -o server.exe ./cmd/server && ./server.exe

# 前端（开发模式 :5176）
cd platform-web && npm install && npm run dev
```

生产打包可用 `npm run build` 生成前端静态资源，并配置大平台 `web_port` 以静态代理方式同端口发布（参见 `release/v1.0/使用说明.md`）。

### 5. 关联项目服务器实例

1. 登录平台，创建公司，然后在「项目管理」新建项目，实例地址填 `127.0.0.1`、端口 `8090`。
2. 在平台生成该实例的 HMAC Secret，配置到 `project-server/configs/config.yaml` 完成互信。

### 6. 安装 qianshou（loop 引擎需要）

PowerShell 执行：

```powershell
winget install --exact --source winget --id Git.Git
winget install --exact --source winget --id OpenJS.NodeJS
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
npm install -g qianshou --registry=https://registry.npmmirror.com
```

将 LLM Key 配置为环境变量 `QS_AUTH_TOKEN`（或写入启动脚本）。

### 7. 授权激活

大平台启动时会自动联网激活；未激活仅可试运行 20–30 分钟。通过环境变量 `AE_LICENSE_AUTH_KEY` 注入授权密钥，或在「设置 → 授权管理」页查看机器码并手动激活。

## 配置与端口速查

| 端口 / 变量 | 说明 |
| --- | --- |
| `18000` | 大平台 API（`platform`） |
| `8090` | 项目服务器 API（`project-server`） |
| `5176` | 前端 Vite 开发服务（`platform-web`） |
| `5432` | PostgreSQL |
| `AE_*` | 大平台环境变量前缀（数据库 / JWT / 授权等） |
| `PS_*` | 项目服务器环境变量前缀（数据库 / LLM Key 等） |
| `QS_AUTH_TOKEN` | qianshou CLI 鉴权 Token |
| `AE_LICENSE_AUTH_KEY` | 大平台授权激活密钥 |

## 文档索引

| 文档 | 说明 |
| --- | --- |
| [wiki/PRD-v2.md](wiki/PRD-v2.md) | V2.2 产品需求文档（三端架构、核心业务流程、功能需求） |
| [wiki/PRD-v2.5-final-feat.md](wiki/PRD-v2.5-final-feat.md) | 组织进化引擎 PRD（四阶段模型、增员建议、一键扩编、定量调控） |
| [wiki/TAD-v2/](wiki/TAD-v2/) | 技术架构设计 |
| [wiki/manuals/新手入门到精通/](wiki/manuals/新手入门到精通/) | 20 章用户手册（创建公司 / 项目、自动运营、任务链路、经营指标、案例、FAQ） |
| [wiki/manuals/zy-engine/](wiki/manuals/zy-engine/) | OPC 一人公司起步手册等 |
| [release/v1.0/使用说明.md](release/v1.0/使用说明.md) | 发布版部署与授权说明 |
| [wiki/changelog/](wiki/changelog/) | 迭代变更日志 |
| [wiki/dev-memory.md](wiki/dev-memory.md) | 开发记忆（环境 / 决策 / 进度） |

> 注：文档与代码可能存在滞后，属性能以最新代码与 git log 为准。

## 联系

- 微信：`youkpan`
- 深圳展映科技
