# Aetheria Travel Engine 🌌

**Luxury AI Travel Concierge — Final Submission**

Aetheria is a premium, conversational travel planning engine that transforms natural language prompts into high-end, spatially-aware itineraries. Designed with a luxury dark aesthetic, it combines advanced reasoning with production-grade resilience.

---

## 🏛️ Triple-Engine Architecture

Aetheria is built on three core logic pillars:

1.  **Reasoning Engine (LLM-Driven)**: Powered by **Gemini 2.5 Flash**, our engine performs zero-shot conversational parsing to extract complex constraints (budget, duration, interests, accessibility) without rigid forms. It also features a "Tweak Engine" for dynamic, inline itinerary adjustments.
2.  **Spatial Engine (GIS-Aware)**: Integrates **Google Maps Platform** for real-time location validation, custom 'Night Mode' visualizations, and a **Terrain Risk Profiler** that assesses ground-level accessibility.
3.  **Resilience Engine (Edge Optimization)**: Implements a deterministic **SHA-256 Memory Cache** for instant repeat requests and a **Procedural Fallback Generator** that ensures a functional itinerary is served even during 503/429 API outages.

---

## 🛠️ Tech Stack & Implementation

-   **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion.
-   **Backend**: Node.js Standalone server optimized for containerization.
-   **Intelligence**: Google GenAI SDK (Gemini API).
-   **Infrastructure**: Docker, Google Artifact Registry, Google Cloud Run.
-   **Caching**: Deterministic in-memory cache with SHA-256 key hashing.
-   **Testing**: Playwright E2E suite covering all 5 core pillars.

---

## 🧩 Key Features

-   **Text-to-Itinerary Parsing**: Just type "Budget 3-day trip to Tokyo for 4 people with food focus" and watch the dashboard calibrate instantly.
-   **The Travel Vault (Mocked SaaS)**: Secure itinerary persistence for authenticated users.
-   **Disruption Simulator**: Real-time stress testing of itineraries against simulated travel disruptions.
-   **Pocket Guide**: Offline-ready cultural tips and phonetic pronunciation assistance.

---

## ⚠️ Assumptions & Handling Non-Determinism

-   **LLM Latency**: Implemented a 45-second `Promise.race` timeout on all Gemini calls to ensure UI responsiveness.
-   **Non-Determinism**: Used strict JSON schema validation for all AI responses. If the AI returns malformed data, the Resilience Engine automatically triggers the fallback generator.
-   **Rate Limits**: The deterministic cache ensures that identical travel requests are served instantly from memory, significantly reducing API credit consumption and latency.

---

## 🚀 Deployment

The engine is containerized and deployed to **Google Cloud Run** on port `8080` with a non-root `nextjs` user for production security.

**Live URL**: [https://aetheria-travel-engine-691477480654.us-central1.run.app](https://aetheria-travel-engine-691477480654.us-central1.run.app)
