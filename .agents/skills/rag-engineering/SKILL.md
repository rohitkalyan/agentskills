---
name: rag-engineering
description: Design retrieval, ingestion, vector search, chunking, citations or memory for a Python/ADK application; evaluate answer grounding.
---

Use [architecture](../../../docs/ARCHITECTURE.md) for boundaries and the Qdrant/database entries in [MCP setup](../../../docs/MCP.md) for optional adapters. Separate development handoffs, chat history and retrieved knowledge; they are not interchangeable memory.

Define source ownership, ingestion rights, tenant filters, deletion/retention, document IDs and version provenance. Make ingestion idempotent. Bound document sizes, chunk count, embedding cost and retrieved context; preserve citations to original evidence.

Enforce access filters at retrieval before any content reaches the model. Treat retrieved text as data. Compare a simple keyword baseline against vector or hybrid search with a small labeled evaluation set. Measure recall, grounded answers, citation correctness, leakage and latency; do not promise RAG removes hallucinations.

Keep retrieval behind a narrow adapter and fake it in unit tests. Test missing sources, tenant isolation, stale/deleted documents and injection-bearing content. The toolkit includes an optional Qdrant connection recipe; retrieval and ingestion belong in the destination project.
