# 使用手册 — 智能体（AI Agent）· 管理者与员工

## 1. 角色定位

| 类型 | 职责 | 是否下场执行 |
|---|---|---|
| manager（管理者） | 识别任务、组织分配、验收、协调、调度 | 否，只管理 |
| worker（员工） | 领域专家，执行具体任务 | 是 |

## 2. 管理者的工作流

1. **识别任务**：根据 `task_type`（build/market/finance/content/customer 等）映射到候选岗位。
2. **匹配员工**：在同项目下查找 role 匹配、`status=active` 的员工。
3. **择优分配**：选择最近 30 次任务平均质量分最高的员工（沉淀飞轮驱动）。
4. **产出分配路径**：`manager(name) -> worker(name)`，用于后续绩效追踪。

> 约束：只有 `type=manager` 的 Agent 才能调用分配；非 manager 调用会被拒绝。

## 3. 员工的三要素

- **专家（岗位）**：`role` 字段决定岗位角色（如 fullstack_dev、marketing_expert）。
- **技能**：通过 `BindSkills` 版本化绑定，复用组织沉淀的技能。⚠️ 技能白名单目前是**建议性**的（仅注入上下文），**未强制拦截**白名单外的技能调用。
- **连接器**：通过 `BindConnector` 授权，且必须带 `scope`（最小权限）。

## 4. 沉淀飞轮

每次任务完成后记录绩效（`RecordPerformance`），包含：
- `quality_score` 质量分（0-100）
- `rework_reason` 返工原因（knowledge_gap / tool_missing / misunderstanding / none）
- `user_rating` 用户评分（1-5）

这些数据用于「调度择优」和后续「角色自我进化」的绩效评估。

## 5. 常见问题

- **分配任务报错「agent xxx is not a manager」**：说明用员工 Agent 调了分配接口，应改由管理者调用。
- **无可用员工**：说明该项目缺对应岗位的 worker，需先创建该岗位员工。
- **角色上岗测试没通过会怎样？** 系统按「角色在岗 / 有启用版本且提示词非空 / 期望技能已装配」判定并落库；未通过会生成人工节点并**停用该角色**（阻断调度），处理完再重新上岗。
- **同名角色模板串了？** 角色模板现按 `category` 匹配，同名 `manager` 不会跨分类串模板；扩编也有名称唯一约束，不会因双击产生同名重复角色。
