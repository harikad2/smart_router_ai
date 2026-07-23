# 🚀 SmartRouterAI

> An Intelligent Multi-LLM Routing and Response Optimization Platform

SmartRouterAI is an AI-powered routing framework that intelligently analyzes user prompts and dynamically selects the most suitable Large Language Models (LLMs) for execution. Instead of relying on a single model, SmartRouterAI performs prompt analysis, parallel multi-model inference, response aggregation, and adaptive parameter tuning to deliver high-quality, cost-efficient, and low-latency AI responses.

---

## 📌 Features

- 🧠 Intelligent prompt analysis
- 📊 Complexity detection
- 📝 Prompt segment splitting
- 🎯 Task type classification
- 🤖 Dynamic LLM selection
- ⚙️ Automatic parameter tuning
- ⚡ Parallel execution across multiple LLMs
- 🔀 Response aggregation
- 📈 Performance metrics tracking
- 🏆 Reward system with credits & badges
- 💾 Self-learning memory for smarter routing

---

## 🏗️ System Architecture

The workflow of SmartRouterAI is shown below.

<p align="center">
  <img src="images/architecture.png" width="800"/>
</p>

---

## 🔄 Workflow

### 1. User Prompt
The user submits a natural language query.


### 2. LLM Prompt Analyzer
The prompt is analyzed using **Llama-3.3-70B**.

It performs:
- Complexity Detection
- Segment Splitting
- Task Type Detection


### 3. Decision Engine

Based on the analysis, the Decision Engine determines:

- Which LLM(s) should be used
- Whether multiple models are required
- Execution strategy

The engine also consults the self-learning memory to improve future routing decisions.


### 4. Parameter Tuner

Inference parameters are dynamically optimized.

Examples include:

- Temperature
- Top-p
- Maximum Tokens


### 5. Parallel Multi-Model Execution

Selected models execute simultaneously using a ThreadPool Executor.

Supported Models:

- Llama-8B
- Llama-70B
- GPT-OSS-120B
- Qwen-3-32B


### 6. Response Combiner

Responses from different models are intelligently merged into a single optimized response.


### 7. Metrics & Reward System

The platform tracks:

- Response latency
- Token usage
- Model performance
- Accuracy

Users can earn:

- Credits
- Badges
- Performance rewards


### 8. Final Response

The optimized answer is returned to the user.

---

## 🛠️ Tech Stack

### Frontend

- React.js
- HTML
- CSS
- JavaScript

### Backend

- FastAPI
- Python

### AI Models

- Llama-3.3-70B
- Llama-70B
- Llama-8B
- GPT-OSS-120B
- Qwen-3-32B

### APIs

- OpenRouter API

### Database

- MongoDB / Firebase

### Parallel Processing

- ThreadPoolExecutor
- AsyncIO

---

## 📂 Project Structure

```
SmartRouterAI/
│
├── frontend/
│
├── backend/
│
├── models/
│
├── routing/
│
├── analyzer/
│
├── combiner/
│
├── metrics/
│
├── reward_system/
│
├── memory/
│
├── images/
│   └── architecture.png
│
├── requirements.txt
│
└── README.md
```

---

## 🎯 Objectives

- Improve AI response quality
- Reduce inference cost
- Reduce latency
- Enable intelligent model orchestration
- Support scalable multi-model AI systems

---

## 🚀 Future Enhancements

- Reinforcement learning-based routing
- User personalization
- Model performance benchmarking
- Prompt caching
- Cost prediction engine
- Agentic workflow support
- Support for multimodal models
- RAG integration
- Distributed inference

---

## 👨‍💻 Team

Developed as part of an AI project demonstrating intelligent routing and orchestration across multiple Large Language Models.

---

## 📜 License

This project is intended for educational and research purposes.

---

⭐ If you found this project interesting, consider giving it a star!
