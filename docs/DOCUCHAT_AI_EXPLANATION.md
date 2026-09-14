# 📚 DocuChat AI — Mukammal Project Guide & Architecture Documentation

Yeh document **DocuChat AI** project ki mukammal tafseel (overview, tech stack, components, working mechanism, aur internal flow) ko asan aur detail mein explain karta hai.

---

## 📑 Table of Contents (Fehrist)

1. [Ye Project Kya Hai? (Project Overview)](#1-ye-project-kya-hai-project-overview)
2. [Tech Stack — Kya Kya Use Hua Hai?](#2-tech-stack--kya-kya-use-hua-hai)
3. [RAG Architecture — Ye Kese Kaam Karta Hai? (Working Mechanism)](#3-rag-architecture--ye-kese-kaam-karta-hai-working-mechanism)
   * [A. Document Ingestion Pipeline (File Upload se Vector DB tak)](#a-document-ingestion-pipeline-file-upload-se-vector-db-tak)
   * [B. RAG & Chat Retrieval Pipeline (Sawaal se Jawab tak)](#b-rag--chat-retrieval-pipeline-sawaal-se-jawab-tak)
4. [Har Component Ki Tafseel (Deep Dive into Components)](#4-har-component-ki-tafseel-deep-dive-into-components)
   * [1. Document Loader (`lib/documents/loader.ts`)](#1-document-loader-libdocumentsloaderts)
   * [2. Text Splitter / Chunking (`lib/documents/splitter.ts`)](#2-text-splitter--chunking-libdocumentssplitterts)
   * [3. Embedding Model (`lib/ai/embeddings.ts`)](#3-embedding-model-libaiembeddingsts)
   * [4. Vector Database (`lib/vector-store/index.ts`)](#4-vector-database-libvector-storeindexts)
   * [5. LangChain Retriever](#5-langchain-retriever)
   * [6. Prompt Engineering (`lib/ai/prompts.ts`)](#6-prompt-engineering-libaipromptsts)
   * [7. Chat Model LLM (`lib/ai/model.ts`)](#7-chat-model-llm-libaimodelts)
   * [8. Streaming Chat API (`app/api/chat/route.ts`)](#8-streaming-chat-api-appapichatroutets)
   * [9. Frontend UI (`components/` & `app/page.tsx`)](#9-frontend-ui-components--apppagetsx)
5. [Folder Structure (Folder aur Files ka Map)](#5-folder-structure-folder-aur-files-ka-map)
6. [Project Run aur Test Karne ka Tareeqa](#6-project-run-aur-test-karne-ka-tareeqa)

---

## 1. Ye Project Kya Hai? (Project Overview)

**DocuChat AI** ek full-stack **Document Q&A application** hai jo **RAG (Retrieval-Augmented Generation)** pattern par bani hai.

### Masla (The Problem):
Agar aap kisi aam AI (jaise ChatGPT ya Gemini) se apni personal PDF ya company policy ke bare mein sawaal puchein, toh uske paas aapke document ka data nahi hota kyunki uski training mein aapka private file shamil nahi tha. Agar aap poora 50-page ka PDF prompt mein copy-paste karein toh:
1. Token limit cross ho sakti hai.
2. Cost bohot zyada lagti hai.
3. Model confuse ho jata hai ya galat batein banata hai (hallucination).

### Hal (The Solution — RAG):
DocuChat AI aapke document ko chhote chhote hisson (chunks) mein torta hai, unka mathematical vector banata hai, aur jab aap sawaal puchte hain toh **sirf wahi 2-4 paragraphs dhoond kar lata hai** jo aapke sawaal se relevant hon. Phir Gemini LLM un paragraphs ko parh kar bilkul authentic jawab deta hai aur sath **citations/sources (page number aur text)** bhi batata hai.

---

## 2. Tech Stack — Kya Kya Use Hua Hai?

| Category | Technology / Library | Purpose (Kyun Use Ki Gai?) |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16 (App Router)** | Full-stack framework jo Frontend UI aur Backend API routes (`/api/...`) dono ko sambhalta hai. |
| **Language** | **TypeScript** | Type safety, clean contracts, autocompletion aur zero runtime type errors ke liye. |
| **AI Framework** | **LangChain (`@langchain/core`)** | Industry standard framework for AI chains, documents, prompt templates, runnables aur streaming. |
| **AI Provider** | **Google Gemini (`@langchain/google-genai`)** | Google ke latest models: `gemini-3.6-flash` (Chat) aur `gemini-embedding-2` (Embeddings). |
| **Chunking** | **`@langchain/textsplitters`** | `RecursiveCharacterTextSplitter` jo text ko meaningful paragraphs mein divide karta hai. |
| **PDF Extraction** | **`unpdf`** | Universal, worker-free, cross-runtime PDF text extraction (eliminates Next.js worker issues). |
| **Vector Store** | **In-Memory Vector Database** | LangChain ke `VectorStore` ko extend karke Cosine Similarity search aur metadata filtering provide karta hai. |
| **Styling** | **Tailwind CSS v4** | Modern responsive design, sleek glassmorphism aur dynamic dark/light themes. |
| **Notifications** | **shadcn/ui Sonner (`sonner`)** | Modern, sleek toast notifications (no browser alerts). |
| **UI Components**| **shadcn/ui Pattern** | Custom accessible primitives: Button, Card, Badge, Input, ScrollArea, Progress, Modal. |
| **Icons** | **Lucide React** | Clean vector icons: Bot, FileText, Upload, Sparkles, Trash, Check, Chevron. |

---

## 3. RAG Architecture — Ye Kese Kaam Karta Hai? (Working Mechanism)

DocuChat AI ke **2 main pipelines** hain:

### A. Document Ingestion Pipeline (File Upload se Vector DB tak)

Jab aap koi PDF ya text document upload karte hain, toh background mein ye 5 steps hote hain:

```text
[User selects PDF (e.g. Resume.pdf)]
               │
               ▼
[Step 1: Next.js API (POST /api/documents)]
               │
               ▼
[Step 2: Document Loader (pdf-parse)]
Extracts raw text + keeps page numbers (Page 1, Page 2...)
               │
               ▼
[Step 3: Text Splitter (RecursiveCharacterTextSplitter)]
Divides text into overlapping chunks (~1,000 characters each)
               │
               ▼
[Step 4: Embedding Model (Google gemini-embedding-2)]
Converts each chunk into a 3,072-dimensional vector [0.0042, -0.012, ...]
               │
               ▼
[Step 5: Vector Database (DocuChatVectorStore)]
Saves vector + chunk text + metadata (file name, page number, documentId)
```

---

### B. RAG & Chat Retrieval Pipeline (Sawaal se Jawab tak)

Jab user chat box mein koi sawaal puchta hai:

```text
[User types: "What are the candidate's skills?"]
               │
               ▼
[Step 1: Next.js API (POST /api/chat)]
               │
               ▼
[Step 2: Embed the Question]
User ke sawaal ko bhi 3,072-dimensional vector mein convert kiya jata hai
               │
               ▼
[Step 3: Cosine Similarity Search in Vector DB]
Vector DB tamam chunks ke sath Cosine Similarity calculate karta hai:
   Formula: Cosine = (A · B) / (||A|| * ||B||)
Top 4 closest matching chunks retrieve hotay hain!
               │
               ▼
[Step 4: Grounded Prompt Template (LangChain ChatPromptTemplate)]
Context + Sawaal ko combine kiya jata hai:
"Answer using ONLY the provided context. If not found, say so.
 Context: [Source 1: Resume.pdf (Page 1)] ..."
               │
               ▼
[Step 5: Google Gemini 3.6 Flash]
Model context ko parhta hai aur answer tokens generate karta hai
               │
               ▼
[Step 6: Server-Sent Events (SSE) Streaming]
Progressive tokens browser ko live stream hotay hain ("Candidate", "has", "skills", "in"...)
               │
               ▼
[Step 7: UI Update + Source Citations]
Frontend live text display karta hai aur sath exact Source Cards dikhata hai!
```

---

## 4. Har Component Ki Tafseel (Deep Dive into Components)

### 1. Document Loader (`lib/documents/loader.ts`)
* **Kya karta hai?** Binary PDF file buffer ko parse karke plain text banata hai.
* **LangChain Class:** `Document` (`@langchain/core/documents`).
* **Kyun zaroori hai?** PDF binary format mein hota hai jisme fonts, streams aur layouts hotay hain. AI binary ko direct nahi parh sakta. Loader har page ka text extract karke LangChain ke standard `Document({ pageContent, metadata })` format mein convert karta hai.

### 2. Text Splitter / Chunking (`lib/documents/splitter.ts`)
* **Kya karta hai?** Lambe text ko 1000 characters ke tukron mein torta hai aur 200 characters ka overlap rakhta hai.
* **LangChain Class:** `RecursiveCharacterTextSplitter` (`@langchain/textsplitters`).
* **Chunk Overlap ka Faida:** Agar koi sentence chunk ke end par cut jaye, toh overlap ki wajah se agla chunk us sentence ke aakhri hisse ko preserve rakhta hai taake context lose na ho.

### 3. Embedding Model (`lib/ai/embeddings.ts`)
* **Kya karta hai?** Kisi bhi text paragraph ko numbers ke ek array (vector) mein convert karta hai.
* **LangChain Class:** `GoogleGenerativeAIEmbeddings` (`@langchain/google-genai`).
* **Model:** `gemini-embedding-2` (3,072 dimensions).
* **Concept:** Sawaal *"Company kitna kamati hai?"* aur text *"Revenue was $10M"* ke words alag hain, lekin dono ke vectors mathematical space mein ek dusre ke bohot qareeb hotay hain.

### 4. Vector Database (`lib/vector-store/index.ts`)
* **Kya karta hai?** Chunks aur unke vectors ko memory mein store karta hai aur Cosine Similarity search perform karta hai.
* **LangChain Class:** Extends `VectorStore` (`@langchain/core/vectorstores`).
* **Features:**
  * Real Cosine Similarity calculation.
  * Metadata filtering (sirf ek specific document mein search karna ho ya all documents mein).
  * Document registry aur deletion support.

### 5. LangChain Retriever
* **Kya karta hai?** Vector Database ko ek callable search interface banata hai (`vectorStore.asRetriever({ k: 4 })`).
* **Farq:**
  * **Vector Store** = Storage aur Indexing engine.
  * **Retriever** = Retrieval function jo query leta hai aur relevant `Document[]` return karta hai.

### 6. Prompt Engineering (`lib/ai/prompts.ts`)
* **Kya karta hai?** Gemini LLM ko strictly instruct karta hai ke woh sirf diye gaye document context se jawab de aur koi bhi baat khud se invent na kare (prevent hallucinations).
* **LangChain Class:** `ChatPromptTemplate` (`@langchain/core/prompts`).

### 7. Chat Model LLM (`lib/ai/model.ts`)
* **Kya karta hai?** Retrieved document chunks ko parh kar natural language mein human-like jawab generate karta hai.
* **LangChain Class:** `ChatGoogleGenerativeAI` (`@langchain/google-genai`).
* **Model:** `gemini-3.6-flash`, `temperature: 0.2` (low temperature = accurate, factual answers).

### 8. Streaming Chat API (`app/api/chat/route.ts`)
* **Kya karta hai?** Next.js App Router route jo Server-Sent Events (SSE) use karta hai.
* **Kyun zaroori hai?** User ko poora jawab aane ka intezar nahi karna parta; jaise jaise Gemini ek ek word bolta hai, screen par live type hota jata hai.

### 9. Frontend UI (`components/` & `app/page.tsx`)
* **`components/documents/document-sidebar.tsx`**: Left sidebar jisme logo, "New Chat" button, upload dropzone, aur document list shamil hai.
* **`components/chat/chat-container.tsx`**: Welcome screen, starter questions, aur auto-scrolling message stream.
* **`components/chat/chat-message.tsx`**: User aur AI ke message bubbles, copy button, aur citations drawer.
* **`components/chat/source-card.tsx`**: Exact source cards jo document ka naam, page number, match percentage aur text snippet show karte hain.

---

## 5. Folder Structure (Folder aur Files ka Map)

```text
docuchat-ai/
│
├── app/
│   ├── api/
│   │   ├── documents/
│   │   │   └── route.ts          # File Upload, Ingestion, List, Delete API
│   │   └── chat/
│   │       └── route.ts          # Streaming RAG Chat API (SSE)
│   ├── layout.tsx                # Page title, fonts, meta tags
│   ├── globals.css               # Theme styling, CSS variables, scrollbars
│   └── page.tsx                  # Main DocuChat AI application page
│
├── components/
│   ├── chat/
│   │   ├── chat-container.tsx    # Welcome screen, auto-scroll, message list
│   │   ├── chat-input.tsx        # Multi-line input bar with Enter-to-send
│   │   ├── chat-message.tsx      # User/AI messages with avatar & copy button
│   │   └── source-card.tsx       # Document citation card with page number
│   │
│   ├── documents/
│   │   ├── document-sidebar.tsx  # Left sidebar with logo, new chat, models
│   │   ├── document-upload.tsx   # Drag-and-drop file uploader with progress
│   │   └── document-list.tsx     # Uploaded files list with chunk stats & delete
│   │
│   └── ui/                       # shadcn/ui components:
│       ├── button.tsx            # Button with variants (default, outline, etc.)
│       ├── card.tsx              # Card structure
│       ├── badge.tsx             # Badges for status & sources
│       ├── input.tsx             # Form input
│       ├── progress.tsx          # Upload progress bar
│       ├── scroll-area.tsx       # Smooth message scrolling
│       ├── separator.tsx         # Dividers
│       └── alert.tsx             # Error & info banners
│
├── lib/
│   ├── ai/
│   │   ├── model.ts              # Gemini Chat Model (ChatGoogleGenerativeAI)
│   │   ├── embeddings.ts         # Gemini Embeddings (GoogleGenerativeAIEmbeddings)
│   │   ├── prompts.ts            # LangChain ChatPromptTemplate
│   │   └── rag.ts                # End-to-end RAG execution pipeline
│   │
│   ├── documents/
│   │   ├── loader.ts             # PDF & text parser (pdf-parse)
│   │   ├── splitter.ts           # RecursiveCharacterTextSplitter (1000/200)
│   │   └── processor.ts          # Pipeline: Buffer -> Chunks -> Vectors -> Store
│   │
│   ├── vector-store/
│   │   └── index.ts              # DocuChatVectorStore with Cosine Similarity
│   │
│   └── utils.ts                  # cn() class utility (clsx + tailwind-merge)
│
├── types/
│   └── index.ts                  # TypeScript interfaces (Doc, Message, Chunk)
│
├── scripts/
│   ├── test-phase2.mjs           # Chat & Embedding verification test
│   ├── test-phase3.mjs           # Vector DB & Similarity search test
│   └── test-end-to-end.mjs       # Full Upload + Query + Streaming RAG test
│
├── docs/
│   └── DOCUCHAT_AI_EXPLANATION.md # Yeh document!
│
├── .env.local                    # Secret API Key (GOOGLE_API_KEY)
├── .env.example                  # Template file for environment variables
├── package.json                  # Dependencies & npm scripts
└── tsconfig.json                 # TypeScript compiler configuration
```

---

## 6. Project Run aur Test Karne ka Tareeqa

### A. Development Server Chalana:
```bash
npm run dev
```
Browser mein open karein:
👉 **[http://localhost:3000](http://localhost:3000)**

---

### B. Automated Verification Tests:

Aap terminal mein ye automated tests run karke har component ko independently test kar sakte hain:

1. **Test Gemini AI Models (Chat & Embeddings)**:
   ```bash
   npm run test:ai
   ```
   *Verifies that Gemini 3.6 Flash responds and Gemini Embedding generates 3,072-dimensional vectors.*

2. **Test Vector Database & Cosine Similarity**:
   ```bash
   npm run test:vector
   ```
   *Inserts sample docs into the vector database, performs semantic search, and verifies LangChain retriever.*

3. **Test Full End-to-End RAG Ingestion & Streaming**:
   ```bash
   npm run test:e2e
   ```
   *Uploads a document to `/api/documents`, queries `/api/chat`, streams tokens live, and verifies citations.*

---

## 7. Khulasa (Summary)

**DocuChat AI** LangChain ke zariye AI development ke tamam core concepts ko practical tareeqe se demonstrate karta hai:
1. **Standardized Documents**: File kisi bhi format ki ho, LangChain `Document` sab ko ek jaisa bana deta hai.
2. **Chunking**: `RecursiveCharacterTextSplitter` se text ko semantic pieces mein divide kiya jata hai.
3. **Embeddings**: Text ko numerical vectors mein convert kiya jata hai taake similarity search ho sake.
4. **Vector Database**: Chunks ko fast cosine search ke liye index karta hai.
5. **Prompt Grounding**: Hallucinations ko khatam karta hai aur model ko sirf document context par focus rakhta hai.
6. **Token Streaming**: Real-time interactive user experience provide karta hai.
