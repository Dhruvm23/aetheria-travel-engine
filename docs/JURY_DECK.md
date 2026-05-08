---
marp: true
theme: default
paginate: true
backgroundColor: #0d0f12
color: #f5f0eb
style: |
  section {
    background-color: #0d0f12;
    color: #f5f0eb;
  }
  h1 { color: #d4a853; }
  h2 { color: #4ecdc4; }
  strong { color: #d4a853; }
  a { color: #4ecdc4; }
---

<!-- _class: lead -->

# Aetheria
## AI-Powered Travel Planning & Experience Engine

**One screen. A full trip. Real-world readiness.**

---

# The gap we address

**Trip planning today is often:**

- **Generic** — one-size itineraries that ignore budget, mobility, and taste  
- **Fragile** — one storm or a closed venue ruins the whole plan  
- **Shallow** — little help with *how* to move between places or what to expect on the ground  

**We built an engine that plans deeply, adapts fast, and speaks to travelers as humans.**

---

# What Aetheria is

A **single-dashboard product** that turns preferences and constraints into:

- A **multi-day, time-blocked itinerary** with realistic pacing  
- A **living map** of every stop and how they connect  
- **Tools to stress-test** the plan when reality hits  
- **Cultural context** at each venue — not just “go here”  

**Built for demonstration as a premium, accessible travel copilot.**

---

# Pillar 1 — Intelligent planning

**From natural language + structured inputs**

- Destination, dates, budget band, interests, group size  
- Optional **accessibility profile** (mobility, wheelchair, age-related needs)  
- Free-text vision of the trip — the system **extracts** budget, group size, and interests as you type  

**Output:** a coherent itinerary — days, activities, timing, cost bands, and transit between stops.

---

# Pillar 2 — The plan stays editable

**Refine without restarting**

- Ask for changes in **plain language** — swap an activity, drop something, shift priorities  
- The engine returns a **full updated itinerary** so nothing feels “patched together”  
- Celebrations and clear loading states keep the experience feeling **responsive and premium**

---

# Pillar 3 — When things go wrong

**Disruption simulation**

- Choose scenarios: weather, delays, closures, transit issues, road blocks, health urgency  
- Pick **which day** and **how severe** the event is  
- Receive a **revised itinerary** plus a **clear changelog** — what moved, what replaced, why  

**Shows decision-making under constraint — not just pretty generation.**

---

# Pillar 4 — Accessibility on the route

**Terrain awareness between two stops**

- For walking segments, analyze the **path between activities**  
- Surface **slope and difficulty** with a simple visual profile  
- **Stricter thresholds** when the traveler needs wheelchair access, limited mobility, or elderly-friendly routing  
- Suggest **safer alternatives** when the path is too steep or risky  

**Makes “accessible travel” operational, not a checkbox.**

---

# Pillar 5 — Cultural pocket guide

**Per venue, on demand**

- Local **context and etiquette**  
- **Phrases** with listen-along pronunciation (when the browser supports it)  
- Optional **photo and dress-code** hints where it matters  

**Turns a line item into a moment the traveler understands.**

---

# Reliability you can mention

- **Validation** of inputs and of generated structure — bad outputs don’t silently break the UI  
- **Graceful degradation** — if generation fails, a **fallback itinerary** still demonstrates the product  
- **Caching** of identical requests — repeat demos feel instant  
- **Mock sign-in** to show how **premium flows** (save, advanced disruption) would gate in a real product  

---

# What to demo live (2–3 minutes)

1. **Plan** — short trip + one line of natural language in the prompt  
2. **Map** — zoom / selection shows stops and route feel  
3. **Pocket guide** — tap one activity; show culture + pronunciation  
4. **Terrain** — one walking leg → elevation / risk panel  
5. **Disrupt** — one preset + simulate → show **diff + reasoning**  
6. **Tweak** — one sentence change to the plan  

---

# Why this works as a jury story

| Judge question | Your answer |
|----------------|-------------|
| *Is it real?* | End-to-end flows: plan → map → guide → terrain → disruption → tweak |
| *Is it thoughtful?* | Accessibility, disruption, and transparency of changes |
| *Is it shippable-minded?* | Validation, fallbacks, caching, gated “pro” UX |
| *Is it differentiated?* | Not chat-only — **map + terrain + diff + cultural layer** |

---

# Vision (30 seconds)

**Short term:** richer saved trips, real auth, and live travel data feeds.  
**Medium term:** team itineraries, budget guardrails, and collaboration.  
**North star:** the plan that **updates with the world** — weather, hours, strikes — and still **fits the traveler**.

---

<!-- _class: lead -->

# Thank you

## **Aetheria** — *Plan deeper. Adapt faster. Travel smarter.*

**Questions?**

---

## Appendix — One-line cheat sheet for Q&A

- **NLP:** Parses free text into budget, group size, interests (additive).  
- **No database in the demo** — itineraries are session-style; “save” uses browser storage as a prototype.  
- **Large screens:** split layout with map; **small screens:** timeline-first (map panel may be limited).  
- **Pitch line:** *“We don’t only generate a trip — we help you survive the trip when reality disagrees with the PDF.”*
