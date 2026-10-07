# 使用手册 — 开发者（Developer）· 智能体组织 API

## 1. 代码位置

| 层 | 文件 | 职责 |
|---|---|---|
| 业务层 | `project-server/internal/agent/org.go` | `OrgManager`：Agent 创建/调度/技能/绩效/连接器授权 |
| 模型层 | `project-server/internal/model/agent_org.go` | Agent/Skill/AgentSkill/Connector/AgentConnector/ConnectorAuditLog/AgentPerformance |
| 处理器 | `project-server/internal/handler/agent_org.go` | `AgentOrgHandler`：REST 端点 |
| 岗位图谱 | `project-server/internal/agent/role_templates.go` | `RoleLibrary` / `RecommendRoles` / `TaskTypeToRoles` |

## 2. 端点一览（挂载于 `/api/v1/agent-org`）

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/agents` | 创建 Agent（owner_id 必填） |
| GET | `/agents` | 列出项目 Agent（`type` 过滤） |
| GET | `/agents/:agent_id` | Agent 详情 |
| GET | `/tree` | 组织树 |
| POST/GET | `/agents/:agent_id/skills` | 绑定/回读技能 |
| POST/GET/DELETE | `/agents/:agent_id/connectors[/:connector_id]` | 授权/回读/撤销连接器（本次新增） |
| GET | `/connectors` | 列出连接器（`type` 过滤，取最新版本） |
| POST | `/agents/:agent_id/transfer` | 转移负责人 |
| PUT | `/agents/:agent_id/status` | 更新状态 |
| POST | `/assign` | 管理者分配任务 |
| GET | `/roles` | 岗位模板库 |
| POST/GET | `/skills` | 创建/列出技能 |
| POST | `/performance` | 记录绩效 |
| GET | `/performance/:agent_id` | 绩效汇总 |

## 3. 本次新增（连接器授权闭环）

`OrgManager` 新增 4 个方法：

- `BindConnector(agentID, BindConnectorInput{ConnectorID, Scope})`：最小权限，`scope` 必填；已授权则更新 scope，否则新增（依赖唯一索引 `idx_agent_connector`）。
- `GetAgentConnectors(agentID)`：查询 Agent 全部授权。
- `RevokeConnector(agentID, connectorID)`：撤销授权。
- `ListConnectors(connectorType)`：每 connector_id 取最新版本；敏感 `Config` 因 `json:"-"` 不输出。

## 4. 待办（白名单外，需主对话处理）

- 在 `project-server/internal/router.go` 挂载新增的连接器授权路由（handler 已就绪）。
- `internal/llm/router.go` 增加 opus provider，并将 Agent 类任务路由到 opus（当前 `defaultRouteRules` 为 deepseek/glm）。
- 建 `role_profiles` / `role_run_configs` 表并补 migrate，再实现完整 `RoleEvolutionManager`。
