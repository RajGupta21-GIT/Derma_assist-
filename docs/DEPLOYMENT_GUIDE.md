# Derma Assist — Deployment Guide (Render vs. Vercel)

This guide explains how to deploy **Derma Assist** to the web so anyone, including exhibition evaluators, can access it via a live public link (`https://...`).

---

## ⚖️ Render vs. Vercel: Which is Better and Why?

| Feature | **Render (Recommended 🏆)** | **Vercel** |
| :--- | :--- | :--- |
| **Python & ML Support** | **Full native Python container runtime** (`torch`, `torchvision`, `scikit-learn`, `PIL`, `numpy`). | Serverless Python Lambdas with strict limits. |
| **Package Size Limit** | **No bundle limit** (handles large PyTorch weights and models easily). | **Strict 250MB limit** (PyTorch alone often exceeds this, causing build failures). |
| **Execution Time** | Persistent server with persistent WebSockets/HTTP connections. | 10–15s function timeout limit on free tier. |
| **Unified Architecture** | **Can serve both React frontend and FastAPI backend from 1 single URL**. | Requires deploying frontend on Vercel and backend elsewhere. |
| **Pricing** | **100% Free Tier** with custom domain & free SSL certificate. | Free tier, but limited for heavy Python ML. |

### 🎯 Verdict: **Use Render**
Because Derma Assist is powered by **PyTorch, Scikit-learn, Grad-CAM, and Gemini**, **Render is significantly better and more reliable**. We have already configured the app to compile the React frontend and serve it directly from the FastAPI backend, giving you **1 unified URL for the entire system at zero cost**.

---

## 🚀 Step-by-Step Deployment Instructions (Render)

### Step 1: Initialize Git & Push to GitHub
If you haven't pushed your project to GitHub yet, open your terminal (PowerShell) in `c:\Users\HP\OneDrive\Derma_assist` and run:

```bash
git init
git add .
git commit -m "Deploy Derma Assist: Modern Clinical Minimalism with Gemini 2.5 Flash"
```

Create a new repository on [GitHub](https://github.com/new) (e.g., `derma-assist`), then link and push:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/derma-assist.git
git push -u origin main
```

---

### Step 2: Deploy on Render (Free)

1. Go to **[https://render.com](https://render.com)** and sign in with your GitHub account.
2. Click the **"New +"** button in the top right and select **"Web Service"**.
3. Choose **"Build and deploy from a Git repository"** and connect your `derma-assist` repository.
4. Fill in these settings (or let Render auto-detect from our included `render.yaml`):
   - **Name:** `derma-assist`
   - **Environment:** `Python`
   - **Region:** Any (e.g., *Oregon* or *Frankfurt*)
   - **Branch:** `main`
   - **Build Command:**
     ```bash
     pip install -r backend/requirements.txt && cd frontend && npm install && npm run build && cd ..
     ```
   - **Start Command:**
     ```bash
     uvicorn backend.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan:** Select **Free ($0/month)**.

5. Under **Environment Variables**, ensure your Gemini key is present:
   - `GEMINI_API_KEY`: *(Paste your Gemini API key here from your local `.env` file)*
   - `PYTHON_VERSION`: `3.11.9`
   - `NODE_VERSION`: `20.11.0`

6. Click **"Deploy Web Service"**.

---

### Step 3: Access Your Live Link!

Render will build the project in 2–3 minutes. Once the build finishes, you will receive a public HTTPS URL:
👉 **`https://derma-assist-XXXX.onrender.com`**

Anyone in the world can now open that link on their phone, laptop, or tablet, experience the doctor greeting, take a skin photo, run the Bayesian clinical intake, view Grad-CAM heatmaps, and download official PDF consultation dossiers!
