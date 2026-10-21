# NeonStudio: All-In-One AI Multimedia & Collaboration Engine

An all-in-one dark mode multimedia studio and real-time collaboration workspace powered by Google Gemini models, featuring an interactive Three.js cyber-mesh background, AI-powered predictive task scheduling, live multi-user editing canvas, and a full suite of ready-to-use creative and bioscience templates.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following key decisions have been aligned based on your interactive input:
> - **Workflow Focus**: Full-suite AI multimedia studio supporting generative text, image, audio transcription, voice speech (TTS), video generation, and interactive bioscience templates.
> - **Ambient Background**: Interactive Three.js procedural neon cyber-mesh with reactive particles, subtle audio-reactive motion, and integrated video ambient backdrop.
> - **Collaboration & Project Tracking**: Dual-mode workflow with a collaborative live canvas (real-time presence, cursor tracking, shape/media nodes) and a predictive Kanban task board with automated AI scheduling suggestions.
> - **AI Engine Hierarchy**: 
>   - Complex reasoning & deep analysis: `gemini-4-argon` (with `thinkingLevel: ThinkingLevel.HIGH`)
>   - Fast workflow routing & general generation: `gemini-3.8-flash`
>   - Low-latency real-time completions: `gemini-3.1-flash-lite`
>   - Image synthesis & editing: `gemini-nano-banana-2.1` / `gemini-3-pro-image-preview` (1K, 2K, 4K resolution; custom aspect ratios 1:1, 16:9, 9:16, 4:3, 21:9)
>   - Text-to-video & image-to-video animation: `gemini-omni-1.1-flash` via the Interactions API
>   - Speech & Audio: `gemini-3.8-flash-tts` for high-fidelity speech synthesis and `gemini-3.5-transcribe` for microphone input transcription
>   - Search & Maps grounding: Built-in tools enabled on `gemini-3.8-flash`
>   - Bioscience modules: Specialized templates for molecular modeling, genetic sequence parsing, and biomedical literature synthesis

---

## 1. Overview & Core Concept

**NeonStudio** combines the capabilities of modern multimodal AI into a single cohesive creative suite and team productivity hub:
- **Multimedia Generation Studio**: Seamless creation and editing of text, images, speech audio, and cinematic videos from text or seed imagery.
- **Collaborative Infinite Canvas**: Visual node-based workspace where teammates place AI media blocks, connect workflows, annotate assets, and collaborate with live cursor presence.
- **Predictive Project & Schedule Dashboard**: Kanban task board enriched with Gemini-powered schedule optimization, automated workload balancing, and Google Tasks sync hooks.
- **Template Library**: Curated, ready-to-use prompts and workflows spanning Creative Direction, Marketing Campaigns, Video Storyboards, and Bioscience/Genomic research.
- **Three.js Cybernetic Background**: High-performance WebGL procedural 3D cyber-mesh canvas running in a damped 60 FPS animation loop with customizable visual density and ambient video blending.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Dashboard & Project Tracker**:
   - The user lands on the Neon Command Dashboard displaying ongoing team tasks, sprint velocity, and AI-predicted schedule suggestions.
   - Users can accept AI suggestions (e.g. "Auto-schedule high-priority video renders", "Balance team load for launch") to instantly adjust tasks.
2. **Multimedia AI Studio & Node Canvas**:
   - Users switch to the Studio Canvas: an infinite draggable workspace to arrange text prompts, image generators, audio recorders, and video render cards.
   - Live simulated team presence shows active collaborators, cursors, and editing locks.
3. **Dedicated Tool Bays**:
   - **Image Lab**: Aspect ratio selector (1:1, 16:9, 9:16, etc.), size selector (1K, 2K, 4K), prompt-to-image generator, and image-to-image editor.
   - **Video Forge**: Text-to-video and photo animator powered by `gemini-omni-1.1-flash`.
   - **Voice & Transcribe**: One-click microphone recording with `gemini-3.5-transcribe`, plus multi-voice screenplay and voice synthesis with `gemini-3.8-flash-tts`.
   - **Deep Think & Bio Research**: Complex multi-step reasoning with `gemini-4-argon` and bioscience research tools.
4. **AI Template Hub**:
   - Filterable library of production templates (e.g., "YouTube Cinematic Teaser", "Product Launch Campaign", "Protein Structure Analysis", "Executive Briefing") that load directly into the canvas or task board.

### Visual Identity & Theme

- **Aesthetic Direction**: High-contrast Cyber-Industrial Dark Mode with refined neon luminescence and disciplined typography.
- **Color Palette**:
  - Deep Canvas: `#070A11` (neutral midnight slate)
  - Surface Containers: `#0F172A` with hairline borders (`rgba(255, 255, 255, 0.08)`)
  - Primary Neon Accent: Electric Cyan (`#00F2FE`) and Hyper Violet (`#7928CA`)
  - Status Indicators: Mint Emerald (`#10B981`) for completed/active, Radiant Amber (`#F59E0B`) for pending, Crimson (`#EF4444`) for critical
- **Typography & Scale**:
  - Display & Headlines: `Plus Jakarta Sans` / `Outfit`
  - Body Prose: `Plus Jakarta Sans` (14px–16px, 1.6 line height)
  - Data & Telemetry: `JetBrains Mono` / tabular numerals (`font-mono tabular-nums`)
- **Layout Restraint**:
  - Adheres strictly to zero-pill discipline (unboxed text metadata with `·` separators).
  - Single-elevation depth: crisp 1px borders, no card-within-card stacking.
  - Strict Top Bar Contract: Brand mark on left, single-line navigation links in center, primary action on right.

---

## 3. Key Product Decisions & Trade-Offs

- **Server-Side API Proxy Architecture**:
  - *Chosen Approach*: Express server (`server.ts`) hosting all `@google/genai` calls with user-agent headers and proper secret management.
  - *Why*: Guarantees zero browser API key leakage while enabling streaming, large base64 media uploads, and Interactions API polling.
- **WebGL Background Isolation**:
  - *Chosen Approach*: Three.js canvas rendered in a fixed background layer with pointer events decoupled from interactive DOM elements.
  - *Why*: Retains silky 60fps frame rates with ACESFilmic tone mapping and procedural math without triggering React DOM re-renders.
- **Real-Time Collaboration State**:
  - *Chosen Approach*: Fast client-side state store synchronized with optimistic multi-user presence, simulated collaborator movement, and persistent local storage backups.
  - *Why*: Immediate UI responsiveness with zero network latency, resilient to offline state and iframe restrictions.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          NeonStudio Client                             │
├────────────────────────────────────────────────────────────────────────┤
│  Top Navigation (Brand · Navigation Tabs · New Project CTA)           │
├────────────────────────────────────┬───────────────────────────────────┤
│  View Switcher & Contextual Dock   │  Three.js WebGL Procedural Scene  │
│  ├─ Dashboard & Predictive Planner │  ├─ 3D Cyber-Mesh Geometry        │
│  ├─ Infinite Collaboration Canvas  │  ├─ Ambient Light & Atmosphere    │
│  ├─ Multi-Tool AI Lab              │  └─ Reactive Glow Particles       │
│  └─ Ready-to-Use Template Library  │                                   │
├────────────────────────────────────┴───────────────────────────────────┤
│  Client State & Engine (Canvas Nodes · Tasks · Collaborators · History) │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ HTTP POST / REST APIs
┌──────────────────────────────────▼─────────────────────────────────────┐
│                       Express Backend (server.ts)                      │
├────────────────────────────────────────────────────────────────────────┤
│  /api/ai/text         → gemini-4-argon / gemini-3.8-flash / flash-lite │
│  /api/ai/image        → gemini-nano-banana-2.1 / gemini-3-pro-image    │
│  /api/ai/video        → gemini-omni-1.1-flash (Interactions API)       │
│  /api/ai/audio        → gemini-3.5-transcribe / gemini-3.8-flash-tts   │
│  /api/ai/predict-task → Predictive Task Scheduling & Auto-Optimization │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State Entities

- **TaskItem**: `id`, `title`, `description`, `status` (`todo` | `in_progress` | `review` | `done`), `priority` (`low` | `medium` | `high` | `urgent`), `assignee` (name, avatar, color), `dueDate`, `predictedDuration`, `aiSuggestedSlot`, `tags`.
- **CanvasNode**: `id`, `type` (`text` | `image` | `video` | `audio` | `note` | `bio_structure`), `x`, `y`, `width`, `height`, `title`, `data` (mediaUrl, prompt, outputText, metadata), `connectedTo`.
- **Collaborator**: `id`, `name`, `avatar`, `cursorPos` (`{x, y}`), `activeNodeId`, `color`, `lastActive`.
- **AITemplate**: `id`, `category` (`creative` | `marketing` | `video` | `bioscience`), `title`, `description`, `icon`, `presetNodes`, `suggestedTasks`.
