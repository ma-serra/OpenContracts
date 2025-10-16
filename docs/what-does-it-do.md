# What Does OpenContracts Do? - Quick Reference

## The Platform in One Sentence
OpenContracts is a **free, open-source document analytics platform** that helps organizations analyze, annotate, and extract structured data from their document collections using modern AI techniques.

## Core Capabilities

### 📄 Document Management
- Upload and organize PDFs and text documents
- Group documents into collections (Corpuses)
- Fine-grained permission management

### 🔍 Smart Analysis
- Automatic layout parsing and text extraction
- AI-powered document analysis and annotation
- Vector embeddings for semantic search
- Custom analyzers via pluggable microservices

### 🖊️ Manual Annotation
- Visual annotation interface over original documents
- Multi-page annotations with collaborative features
- Structured labeling with custom label sets

### 📊 Data Extraction
- Bulk data extraction across hundreds of documents
- Natural language queries using LLM agents
- Export structured data (CSV, JSON)
- Custom extraction pipelines

### 🛠️ Customization
- Custom metadata schemas with validation
- Pluggable parsing pipelines (Docling, NLM-Ingest)
- Extensible analyzer framework
- GraphQL API for integrations

## Key Differentiators

- **Open Source**: GPL-3.0 licensed, no vendor lock-in
- **Portable Data**: Standardized format for maximum interoperability
- **AI-Ready**: Built for modern LLM workflows and agentic systems
- **Enterprise-Grade**: Scalable architecture with robust permissions
- **Document-Centric**: Preserves original document layout and structure

## Perfect For

- 📋 **Contract Analysis**: Legal document review and clause extraction
- 🏢 **Due Diligence**: Financial and legal document processing
- 🔍 **Document Research**: Semantic search across large archives
- 📊 **Compliance**: Regulatory document monitoring and reporting

## Technology Stack

- **Backend**: Django, PostgreSQL, Celery, pgvector
- **Frontend**: React, TypeScript, Semantic UI
- **AI/ML**: PydanticAI, vector embeddings, LLM integrations
- **Architecture**: Microservices, containerized deployment

---

**Get Started**: Visit our [Quick Start Guide](quick_start.md) or try the [live demo](https://contracts.opensource.legal)