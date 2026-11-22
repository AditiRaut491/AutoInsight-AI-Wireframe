# AutoInsight AI – Interactive Wireframe

**Days to Sell Anomaly Explainer** · Tek-Qubit: Women of Impact 2026 · Theme 2 – Data Analytics: Insights from Customer Data

AutoInsight AI explains why a used vehicle is taking longer to sell than similar cars. It points to possible contributing factors such as listing completeness, photo quality and price position. It does not set prices.

This repository holds the **clickable wireframe** that the team built for the idea-submission stage. It is a React + Vite front end that runs entirely in the browser.

> **Important:** every number in this app is **mock data**, not real dealership data. No machine-learning model, database or language model is connected. The **Ask AutoInsight** chatbot is a **proposed feature** shown as an interactive UI concept: in this prototype, simple keyword rules answer questions using the same mock data as the dashboard.

---

## What you can explore

| Screen | What it shows |
|---|---|
| Dashboard | Stock count, cars past their expected range, each car's expected range vs today, priority alerts, inventory ageing, possible factors |
| Inventory | All cars with status filters (Critical, Alert, Watch, On track) |
| Alerts | Cars past their range, market shifts, acknowledge buttons |
| Vehicle analysis | One car: days on market vs expected range, status, possible contributing factors, next steps, selling curve, buyer funnel |
| Explainable insights | Factor attributions with evidence and confidence |
| Actions | Action board: Recommended → In progress → Done |
| Holding cost | Editable cost assumptions; gross left per car |
| What-if | How the estimate could change if photos, listing, lead replies or price gap change |
| Reports | Monthly trends; model-health checks to be filled after training |
| Ask AutoInsight (proposed) | Chatbot UI concept that answers inventory, vehicle, analytics and recommendation questions |

Try these in the chatbot:

- How many cars are currently available in the showroom?
- Why is the Honda CR-V taking longer than expected to sell?
- Which cars should I focus on today?
- Show me the inventory ageing distribution.
- Assign the photo reshoot for U2417 to the lot porter *(shows the confirmation step)*

---

## Run it on your laptop (VS Code)

### 1. Install the tools (one time)

- **Node.js 20 or newer.** The LTS version (22.x) from <https://nodejs.org> is recommended. Check your version with `node -v`.
- **Visual Studio Code:** <https://code.visualstudio.com>
- **Git** (needed only to publish to GitHub): <https://git-scm.com>

### 2. Open the project

1. Unzip the folder, for example to `Documents/AutoInsight-AI-Wireframe`.
2. In VS Code choose **File → Open Folder…** and select `AutoInsight-AI-Wireframe`.
3. Open a terminal with **Terminal → New Terminal**.

### 3. Install and start

```bash
npm install
npm run dev
```

Open the address the terminal prints, usually <http://localhost:5173>. The page reloads automatically when you save a file. Press `Ctrl + C` in the terminal to stop it.

### 4. Test the production build (optional)

```bash
npm run build
npm run preview
```

The preview runs at <http://localhost:4173/AutoInsight-AI-Wireframe/>. That path matches GitHub Pages.

---

## Publish on GitHub Pages

The repository already includes a workflow (`.github/workflows/deploy.yml`). It builds the site and publishes it every time you push to the `main` branch.

### 1. Create the repository

1. Sign in to GitHub and open <https://github.com/new>.
2. Set the repository name to **`AutoInsight-AI-Wireframe`**. Keep this exact name, because `vite.config.js` uses it as the site path.
3. Choose **Public**.
4. Leave "Add a README" unticked, because this folder already has one.
5. Click **Create repository**.

### 2. Push the code (VS Code terminal, inside the project folder)

```bash
git init
git add .
git commit -m "AutoInsight AI interactive wireframe"
git branch -M main
git remote add origin https://github.com/AditiRaut491/AutoInsight-AI-Wireframe.git
git push -u origin main
```

When Git asks you to sign in, use the browser sign-in window or GitHub Desktop. Never paste your password or a token into a chat or a file.

### 3. Turn on GitHub Pages

1. Open the repository's **Settings**, then **Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Open the **Actions** tab and wait for **Deploy to GitHub Pages** to show a green tick (about 1–2 minutes).

If the first run started before you changed the source and failed, click **Re-run all jobs**.

### 4. Open and test the live site

The workflow run shows the site address. For this repository it is normally:

`https://aditiraut491.github.io/AutoInsight-AI-Wireframe/`

Open it in a private or incognito window and check:

- the dashboard and vehicle pages;
- the chatbot;
- the **Inventory** filters;
- the **Actions** buttons.

### Updating the site later

Edit the code, then run:

```bash
git add .
git commit -m "Describe your change"
git push
```

The workflow publishes the new version automatically.

### Troubleshooting

- **Blank page on GitHub Pages:**
  - The repository name must match `REPO_BASE` in `vite.config.js`. If you rename the repository, update that line.
  - Pages **Source** must be set to **GitHub Actions**.
- **`npm install` fails:** run `node -v` and make sure it is 20 or newer.
- **A page shows "We couldn't find that page":** the app uses `#/` addresses (for example `…/#/dashboard`), so open the main URL and use the menu.

---

## Project structure

```
AutoInsight-AI-Wireframe/
├── index.html                  # page title, fonts, favicon
├── package.json                # scripts and dependencies
├── vite.config.js              # React plugin + GitHub Pages base path
├── public/favicon.svg
├── .github/workflows/deploy.yml
└── src/
    ├── main.jsx                # app entry (HashRouter + shared state)
    ├── App.jsx                 # routes
    ├── data/mockData.js        # ALL mock data (vehicles, actions, sales)
    ├── api/mockApi.js          # stand-in for the planned REST API; every screen and the chatbot read through it
    ├── lib/model.js            # mock selling-time curve, status rules, formatting
    ├── lib/assistant.js        # chatbot rules: question → API data → answer
    ├── lib/useVehicle.js
    ├── context/AppState.jsx    # holding cost, actions board, chat history
    ├── components/             # layout, charts, range plot, chat message, UI pieces
    ├── pages/                  # one file per screen
    └── styles/app.css          # light theme
```

## How the numbers fit together

| Item | How it is worked out |
|---|---|
| Expected range | 80% range for similar cars, from a simple mock curve that stands in for the planned survival model. For example, the 2021 Honda CR-V (U2417) is expected to sell in 31 days, with a range of 13–54 days. |
| Past range (Critical / Alert) | Less than a 5% / 10% chance of still being unsold. This is the same as being past the range's upper limit. |
| Watch | Still inside the range, but close to its upper limit. |
| Days on market | Counted from when the car was ready for sale. |
| Days in stock | Days on market plus reconditioning. |
| Days to sell | Known only for sold cars (see "sales this month"). |
| Holding cost | Days in stock × cost per day. The $37/day default is a US estimate (NCM Associates, cited by Wards); a dealer should use its own figure. |

## Proposed full system (not built here)

- **Frontend:** React + Vite, JavaScript, HTML/CSS, Recharts.
- **Backend:** Python with FastAPI, serving REST APIs.
- **ML:** Pandas, NumPy and scikit-learn for data preparation.
  - **Prediction:** XGBoost survival model if the dealer data has listing and sale or observation dates. Unsold cars are treated as right-censored. If those dates are missing, the fallback is regression on sold cars plus cohort percentiles.
  - **Explanations:** SHAP explains predictions; it does not prove cause.
- **Database:** PostgreSQL.
- **Chatbot (proposed):** a language model that can call only approved, read-only AutoInsight APIs. It answers from the data they return, and says when information is missing. Any change, such as assigning an action, needs sign-in and confirmation.

---

Team: [Team Name] · [Member 1], [Member 2], [Member 3], [Member 4] · [College Name]
