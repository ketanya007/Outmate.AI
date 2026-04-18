# Outmate.AI Demo Walkthrough

This document summarizes the steps taken to prepare, launch, and record a demo for the **Outmate.AI** Multi-Agent GTM Intelligence Engine.

## 🚀 Project Overview
Outmate.AI is a sophisticated system that orchestrates multiple AI agents to transform natural language queries into enriched prospect lists and personalized outreach strategies.

## 🛠️ Setup & Preparation
To ensure a smooth demo, the following steps were performed:
1.  **Dependency Installation**: Installed all necessary packages for both the `backend` and `frontend`.
2.  **Environment Configuration**: Created a `.env` file in the `backend` directory. Since a real OpenAI API key was not provided, the system was configured to use a dummy key, triggering the built-in **Graceful Fallback** to mock responses—perfect for demonstrating the UI and workflow without incurring costs or hitting quotas.
3.  **Local Servers**: 
    *   **Backend**: Launched on [http://localhost:5000](http://localhost:5000)
    *   **Frontend**: Launched on [http://localhost:3000](http://localhost:3000)

## 🎥 Demo Execution
The demo follows a standard user journey:
1.  **Search**: The user enters a query like *"Fintech companies in USA"*.
2.  **Orchestration**: The UI displays a real-time 'Execution Timeline', showing the status of each agent:
    *   **Planner**: Decomposing the query.
    *   **Retrieval**: Extracting filters and querying data.
    *   **Enrichment**: Scaling signals and ICP scoring.
    *   **Validation**: QA and relevance check.
    *   **Strategy**: Generating personalized outreach.
3.  **Results**: The dashboard populates with high-confidence prospects (e.g., **FinTech Flow**, **DataMeld**) along with their tech stacks, growth signals, and tailored messaging hooks.

## 🎞️ Demo Video
The recording captures the sleek glassmorphism design and the dynamic nature of the multi-agent system.

![Outmate.AI Demo](./outmate_ai_demo.webp)

> [!TIP]
> To run this demo yourself, ensure you have Node.js installed and follow the instructions in the [README.md](file:///c:/Users/ketanya/Downloads/OUTmate.AI2/README.md).
