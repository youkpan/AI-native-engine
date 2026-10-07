# 开发者手册：非功能工程演进（部署 / 兼容性 / HMAC）

## 1. HMAC 签名协议（平台 ↔ 项目服务器）

- 请求头：`X-Project-ID` / `X-Timestamp`（Unix 秒）/ `X-Signature`。
- 签名公式：`hex(HMAC-SHA256(timestamp + "\n" + body, secret))`；multipart/form-data 时 body 视为空串。
- 两端实现逐字节一致：`platform/internal/middleware/hmac.go`、`project-server/internal/middleware/hmac.go`。
- 防重放：时间窗口（默认 5m）+ nonce（key=`projectID:signature`，精确重放才命中）。

## 2. 按项目动态路由

- 平台按 `project_id` 查 `instances` 表解析 IP + `ProjectServerPort`（默认 8090）+ 每实例 `HmacSecretEnc`，转发到 `http://IP:port`。
- 核心：`service/hmac_credentials.go:ResolveForwardTarget`、`service/project_client.go:ForwardTo`、`handler/project_forward.go:Forward`。
- project-server 侧读取 `PS_PLATFORM_HMAC_SECRET`（viper `SetEnvPrefix("PS")` + `.`→`_` replacer）。

## 3. 防烧钱机制落点

| 机制 | 文件:行 |
|:---|:---|
| 预算熔断 + 预警 | `autoops/engine.go:326-349`；预警线由 `warn_line_pct` 驱动（默认 80%） |
| 单轮预算熔断（金额维度） | 轮末结算超 `single_round_max_budget`（默认 100 元）→ 告警 + 暂停项目 |
| 单轮超时强杀 | `autoops/runner.go:112` + `agent/qianshou.go:90`（context.WithTimeout）+ `qianshou.go:157`（Stop powershell） |
| 日志增量读取 | `autoops/log_tailer.go:267-303`（Seek(TailOffset)） |
| 单项目 goroutine 隔离 | `autoops/engine.go:285`（defer recover） |
| SLA 升级/降级 | `autoops/human.go:870-930` |
| Kill-Switch | `handler/autoops_handler.go:2079`（scope=all 生效） |

## 4. 跨平台兼容（Windows/Cygwin）

- 检测进程：`/c/Windows/System32/tasklist.exe | /usr/bin/grep -iE xxx`。
- 停止进程：`powershell.exe -NoProfile -Command "Stop-Process -Name 'xxx' -Force"`；**禁止 bash taskkill**（WOW64 重定向）。
- .bat 脚本 CRLF + GBK(ANSI) 中文，写入后检查换行。

## 5. 已知待补（详见 08/09 code_review 报告）

- `pathguard`（工作目录越界防护）未实现。
- 连续执行错误统一计数未接入 qianshou/AgentRun 异常。
- 调度损坏 .bak 回退未落地。
- 心跳资源字段（cpu/mem/disk/goroutine）未采集。
- project-server `internal/middleware` 无单测。

## 6. 测试命令

```bash
cd platform && go test ./internal/middleware/... ./internal/handler/... -count=1
cd project-server && go test ./internal/autoops/... ./internal/agent/... ./internal/model/... -count=1
```
