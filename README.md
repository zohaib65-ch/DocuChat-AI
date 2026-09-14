# DocuChat AI — Document Q&A with LangChain & Google Gemini

**DocuChat AI** is a full-stack, production-grade **Retrieval-Augmented Generation (RAG)** application built with Next.js (App Router), TypeScript, LangChain, Google Gemini, and Tailwind CSS with shadcn/ui.

It allows users to upload documents (such as PDFs, TXT, or Markdown) and ask questions in an interactive chat interface with real-time response streaming and source citations.

---

## 📖 Complete Documentation & Architecture Guide

For a detailed explanation of the architecture, tech stack, internal mechanics, and LangChain concepts, see:
👉 **[docs/DOCUCHAT_AI_EXPLANATION.md](file:///Users/muhammadzohaib/projects/docuchat-ai/docs/DOCUCHAT_AI_EXPLANATION.md)**

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env.local` with your free Google Gemini API key:
```bash
GOOGLE_API_KEY=your_gemini_api_key_here
```
*(Get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey))*

### 3. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Automated Verification Tests

Run any of the automated test suites:

* **Test Gemini Chat & Embeddings**:
  ```bash
  npm run test:ai
  ```
* **Test Vector Store & Cosine Similarity**:
  ```bash
  npm run test:vector
  ```
* **Test Full End-to-End Ingestion & Streaming RAG**:
  ```bash
  npm run test:e2e
  ```

---

## 🛠️ Tech Stack

* **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
* **AI Orchestration**: LangChain (`@langchain/core`, `@langchain/google-genai`, `@langchain/textsplitters`)
* **LLM & Embeddings**: Google Gemini (`gemini-3.6-flash` + `gemini-embedding-2`)
* **Vector Store**: In-Memory Vector Database with Cosine Similarity (`DocuChatVectorStore`)
* **PDF Parsing**: `pdf-parse` (v2 `PDFParse` engine)
* **Styling & UI**: Tailwind CSS v4 + shadcn/ui design primitives + Lucide React icons
