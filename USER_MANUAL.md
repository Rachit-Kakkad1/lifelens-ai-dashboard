# 📘 The LifeLens Intelligence Manual
> *Operational Guide for Personal & Planetary Synchronization*

---

## 🌟 **1. The Core Loop: How to Use LifeLens**

LifeLens is designed to be low-friction but high-impact. Follow this daily rhythm to sync your biometrics with the planet.

### **Phase 1: The Check-In (Morning)**
- **Navigate**: Click `Check In` on the Navbar.
- **Action**: Use the cinematic sliders to input your:
    - **Sleep Quality** (0-100)
    - **Mood** (Energy Level)
    - **Transport Mode** (Car, Bike, Walk, Bus)
- **AI Reflection**: Upon submission, watch for the **Immediate Neural Feedback** toast. The AI analyzes your input in <200ms and gives you a personalized reinforcement message.

### **Phase 2: The Dashboard (Daytime)**
- **Navigate**: Click `Dashboard`.
- **Visualize**: See your **"Live Biometric & Climate Sync"**.
    - **Left Chamber**: Your Internal Health Score (Sleep + Mood).
    - **Right Chamber**: Your External Planet Score (CO2 Impact).
- **The Graph**: Watch the **gradient area chart** evolve. It overlays your wellness peaks with your carbon dips, visually proving that *feeling good = doing good*.

### **Phase 3: The Simulator (Evening)**
- **Navigate**: Click `Simulator`.
- **Experiment**: "What if I cycled to work tomorrow?"
- **Predict**: The AI predicts the future impact:
    - *"Energy will rise by 15%"*
    - *"CO2 will drop by 2.5kg"*

---

## 🛠️ **2. Developer Mode: Local AI Configuration**

For hackathon judges and developers who want to run the **LifeLens Neural Engine** locally or connect custom biometric devices.

### **A. Environment Setup**
LifeLens uses a "Hybrid Intelligence" model. It defaults to the Cloud (Gemini), but can be configured for Local AI processing (e.g., using Ollama or a local Python backend).

1.  **Locate Configuration**:
    Open the `.env` file in the root directory.

2.  **Activate Developer Mode**:
    Add the following flag to enable local device streaming:
    ```env
    VITE_DEV_MODE=true
    VITE_AI_ENDPOINT="http://localhost:11434/api/generate" # Default for local Ollama
    ```

### **B. Device Integration (IoT)**
LifeLens supports a standardized JSON protocol for ingesting data from wearables (Apple Watch, Fitbit) or Smart Home sensors.

**Incoming Data Body Structure:**
To push data to the local instance, send a `POST` request to `/api/local-ingest`:

```json
{
  "device_id": "watch_ultra_2",
  "timestamp": "2023-10-27T08:00:00Z",
  "biometrics": {
    "heart_rate_avg": 72,
    "sleep_score": 88
  },
  "context": {
    "transport_detected": "cycling",
    "kwh_saved": 0.4
  }
}
```

*Note: In the current Vercel deployment, this endpoint simulates data ingestion for demonstration purposes.*

---

## 🔒 **3. Privacy & Intelligence Architecture**

- **Local-First Processing**: Your sensitive biometric data is processed in the browser before being encrypted.
- **Gemini Context Window**: We only send "behavioral vectors" (trends), not raw raw health data, to the cloud AI for analysis.

---

> **"The future of health is not just about you. It's about where you live."**
> — *The LifeLens Team*
