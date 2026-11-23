---
name: agent-evaluation
description: Design and run evaluations for agent task success, tool use, safety boundaries, session isolation and model budgets.
---

Define the expected observable outcome and allowed tools before judging responses. Include representative success, invalid input, tool failure, prompt-injection attempts, cross-user/session access, and call-budget exhaustion when relevant.

Separate deterministic unit tests, mocked runner integration tests, and live model evaluations. A mocked runner cannot prove tool selection quality. For live runs, record model ID, dependency versions, prompt/instruction revision, test data, tool calls, latency and token/cost evidence available from the runtime. Use synthetic data and a bounded case count; do not invent unavailable usage numbers.

Prefer assertions about results and prohibited side effects over exact wording. Repeat nondeterministic cases enough to expose variability within the authorized budget. Explain sample size and failure cases. Do not report an unrun live suite as passed. Change prompts/tools only in response to observed failures and rerun affected cases.
