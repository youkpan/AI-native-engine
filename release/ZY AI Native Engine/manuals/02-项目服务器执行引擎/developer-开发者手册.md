# 使用手册 — 开发者（Developer）· 项目服务器执行引擎

## 1. 面向对象

本文面向在 `project-server` 上二次开发或接入的工程师，说明执行引擎的代码结构、白名单边界与已验证能力。

## 2. 代码结构与边界

```
project-server/internal/
├── handler/        # HTTP 处理器（chat/knowledge/ledger/flow/agent/agent_run）—— 本次评审白名单
├── ledger/         # 账本 / 阿米巴 / CRM / 驾驶舱 —— 本次评审白名单
├── knowledge/      # chunker / prompt / RAG 上下文构建 —— 本次评审白名单
├── service/        # guided_chat / knowledge_pipeline / markitdown —— 白名单外（只读）
├── repository/     # knowledge.go 分层检索 —— 白名单外（只读）
├── autoops/        # acceptance / runner / analyzer —— 白名单外（只读）
├── model/          # 数据模型 —— 白名单外（只读）
├── migrate.go      # AutoMigrate 注册 —— 禁止修改
└── router.go       # 路由注册 —— 禁止修改
```

## 3. 已验证的核心算法（可复用）

### 3.1 阿米巴核算（`internal/ledger/amoeba.go`）

| 函数 | 职责 | 状态 |
|---|---|---|
| `AggregateDailyStats` | 日度原始数据聚合为 `AmoebaDailyStat`，产出价值 = 收入 + 线索×100 | 本次统一归一化口径 |
| `CalcUnitTokenValue` | 单位 token 附加值 = value/token × 1e6（百万 token 归一） | 既有单测锁定 |
| `CalcDeptRevenueDistribution` | 内部转移价双向记账（总收=总支） | 已有全量单测 |
| `CalcDrillDown` | 三层钻取（项目→岗位→任务） | 本次修复岗位/项目级死代码 |

### 3.2 CRM 漏斗（`internal/ledger/crm.go`）

- `AdvanceStage`：阶段推进（stage_log 自动追加、won/lost 特殊处理）。
- `ValidateStageTransition`：合法转换校验（5×5 全矩阵已测）。
- `CalcForecastRevenue` / `CalcFunnelStats`：预测收入与漏斗/角色转化率。

### 3.3 经营驾驶舱（`internal/ledger/cockpit.go`）

- `EvaluateAllAlertRules`：7 条预警规则（收入下滑/成本超预算/漏斗停滞/预算快速消耗/任务积压/token 异常/岗位 SLA）。
- 本次修复：`checkBudgetRate` 从「重复静态阈值」改为「近 7 天 <50% 冲高至 >80%」的快速消耗检测，与 `checkCostOverBudget` 职责分离。
- `CreateAlerts`：24h 内同 project+metric+severity 去重落库。

### 3.4 知识库 / RAG（`internal/knowledge/` + `internal/repository/knowledge.go`）

- `SplitIntoChunks`（ChunkSize=1024 / Overlap=100）、`CleanText`、`EstimateTokens`。
- `BuildRAGContext` / `BuildFewShotContext` / `ProjectSummaryTemplate`。
- `SearchProjectFirst(projectRatio=0.7)`：项目级 70% + 公司级 30% 分层检索。

## 4. 当前缺口（本次未改，白名单外）

| 缺口 | 位置 | 影响 |
|---|---|---|
| `GuidedSession` / `FeedbackRecord` / `AcceptanceRecord` / `TestRunRecord` 表缺失 | `model/` + `migrate.go` | 引导会话状态化、验收/测试落库不可用 |
| `TaskQueue` V2 字段缺失（engine_type/risk_level/test_status 等） | `model/task_queue.go` | 引擎选择/风险分级/测试机制无法落到任务 |
| V2.2 API 路由缺失 | `router.go` | amoeba/crm/cockpit Service 已就绪但无对外端点 |
| markitdown 未接线 | `service/knowledge_pipeline.go` | docx/xlsx/pdf 未走 markitdown 解析 |

> 更新（本批）：知识库上传现为扩展名白名单 `pdf / txt / md / markdown / docx / xlsx`，`docx`/`xlsx` 由 OOXML 直解（需魔数校验），解析降级产物标 `needs_review`；`markitdown` 仍未接线，`pptx` 仍不支持。文档归属以 `kb_id` 查出的知识库为权威（自报不一致 403），并新增文档级删除入口。

## 5. 常见问题

- **amoeba 单位口径**：统一用 `CalcUnitTokenValue`（×1e6 归一），不要在别处再写裸 `value/token` 或 `value/cost`。
- **驾驶舱预算告警**：静态阈值归 `checkCostOverBudget`（80% warn / 95% critical），快速消耗归 `checkBudgetRate`（7 天 <50%→>80% critical），二者不重复。
- **新增表**：必须同步 `migrate.go` AutoMigrate（白名单外，需主对话处理）。
- **新增 API**：handler 写好后在 `router.go` 挂载（白名单外，需主对话处理）。
