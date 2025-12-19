# SBOM & Vulnerability Scan Pipeline

This Jenkins pipeline automates **software bill of materials (SBOM) generation**, **vulnerability scanning**, and **reporting** for multiple GitHub repositories. It integrates with **Trivy** for scanning and **Dependency-Track** for vulnerability management, and sends notifications to **Slack**.

---

## **Key Features**

- **Parallel scanning**: Scans multiple repositories at the same time to save time.
- **SBOM generation**: Creates CycloneDX SBOMs for Dependency-Track.
- **Vulnerability detection**: Uses Trivy to detect critical, high, medium, and low vulnerabilities.
- **Automated reporting**: Generates a clean HTML dashboard summarizing scan results.
- **Slack notifications**: Alerts when scans start, succeed, or fail.
- **Dependency-Track integration**: Uploads SBOMs and tracks vulnerabilities centrally.

---

## **How It Works**

1. **Start**: Jenkins triggers the pipeline and sends a Slack notification.
2. **Clone & Scan**: Each repository is cloned and scanned with Trivy:
   - Generates `trivy.json` (vulnerability data)
   - Generates `sbom.json` (SBOM in CycloneDX format)
3. **Upload SBOM**: SBOM is uploaded to Dependency-Track. UUIDs are recorded.
4. **Metrics Extraction**: Counts vulnerabilities by severity and saves to `metrics.json`.
5. **Generate Dashboard**: HTML dashboard summarizes all repositories.
6. **Finish**: Slack is notified with results, artifacts archived, and workspace cleaned.

---

## **Setup & Configuration**

1. **Repositories**: Update `GITHUB_ORG` and `REPO_LIST` in the Jenkinsfile.
2. **Dependency-Track**: Set `DT_SERVER` URL and API key credentials in Jenkins.
3. **GitHub Access**: Set GitHub token credential for cloning private repos.
4. **Slack Notifications**: Configure Slack webhook URL in Jenkins credentials.
5. **Pipeline Options**: Keep default settings (timestamps, concurrent build prevention, log rotation).

---

## **Example HTML Dashboard**

The dashboard shows:

| Repository | Critical | High | Medium | Low | Total | Dependency-Track Link |
|------------|---------|------|--------|-----|-------|----------------------|
| repo1      | 2       | 5    | 10     | 3   | 20    | [View](#)           |

---

## **Workflow Diagram**

```mermaid
flowchart TD
    A[Jenkins Job] --> B[Slack Notify: Pipeline Started]
    B --> C[Clone Repositories]
    C --> D[Trivy Scan]
    D --> E[Generate SBOM & trivy.json]
    E --> F[Upload SBOM to Dependency-Track]
    F --> G[Extract Vulnerability Metrics]
    G --> H[Generate HTML Dashboard]
    H --> I[Slack Notify: Success/Failure]
    I --> J[Archive Artifacts & Clean Workspace]

# Todo Application

A simple todo application built with a Flask backend and React frontend. Keep track of your tasks, set goals, and manage your time effectively.

## What This App Does

This is a straightforward todo app where you can:
- Create todos with a task description, optional goal, and break hours
- View all your todos in a clean list
- Mark tasks as complete or incomplete
- Delete todos you no longer need

The app uses a two-tier architecture - a Python Flask API handles the backend logic, while a React frontend provides the user interface.

## Prerequisites

Before you start, make sure you have these installed on your machine:
- **Python 3.7+** (check with `python3 --version`)
- **Node.js 14+** and npm (check with `node --version` and `npm --version`)

If you don't have them, download Python from [python.org](https://www.python.org/downloads/) and Node.js from [nodejs.org](https://nodejs.org/).

## Getting Started

You'll need to run both the backend and frontend servers. I recommend opening two terminal windows - one for the backend and one for the frontend.

### Setting Up the Backend

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd todo-application/backend
   ```

2. Create a virtual environment (this keeps your project dependencies separate):
   ```bash
   python3 -m venv env1
   ```

3. Activate the virtual environment:
   - **On macOS/Linux:**
     ```bash
     source env1/bin/activate
     ```
   - **On Windows:**
     ```bash
     venv\Scripts\activate
     ```
   
   You should see `(venv)` appear at the start of your terminal prompt.

4. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

5. Start the backend server:
   ```bash
   python app.py
   ```

   You should see something like "Running on http://0.0.0.0:5001". The backend is now running on port 5001.

### Setting Up the Frontend

1. Open a **new terminal window** (keep the backend running in the first one) and navigate to the frontend folder:
   ```bash
   cd todo-application/frontend
   ```

2. Install the Node.js dependencies:
   ```bash
   npm install
   ```
   
   This might take a minute or two the first time. It's downloading all the React packages and dependencies.

3. Start the frontend development server:
   ```bash
   npm start
   ```

   The React app will start and your browser should automatically open to `http://localhost:3000`. If it doesn't, just open that URL manually.

## Using the App

Once both servers are running:
1. You'll see a form on the left side of the page
2. Enter your task in the "Task" field (this is required)
3. Optionally add a goal or break hours
4. Click "Add Todo" to add it to your list
5. Your todos appear on the right side
6. Click the checkbox to mark a todo as complete
7. Click the delete button to remove a todo

## Project Structure

Here's what's in this project:

```
todo-application/
├── backend/
│   ├── app.py              # Flask API server
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html      # HTML template
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── App.css         # Component styles
│   │   ├── index.js        # React entry point
│   │   └── index.css       # Global styles
│   └── package.json        # Node.js dependencies
└── README.md
```

## API Endpoints

The backend provides these endpoints:

- `GET /api/todos` - Fetch all todos
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/<id>` - Update an existing todo
- `DELETE /api/todos/<id>` - Delete a todo
- `GET /api/health` - Check if the server is running

## Important Notes

- **Data Storage**: The backend currently stores todos in memory. This means when you restart the server, all your todos will be gone. If you want to persist data, you'd need to add a database (like SQLite or PostgreSQL).

- **Ports**: 
  - Backend runs on port **5001**
  - Frontend runs on port **3000**
  
  Make sure these ports aren't being used by other applications.

- **CORS**: Cross-Origin Resource Sharing is enabled on the backend, so the frontend can communicate with the API.

## Troubleshooting

**Backend won't start?**
- Make sure port 5001 is available
- Check that you activated the virtual environment
- Verify all dependencies installed correctly with `pip list`

**Frontend won't start?**
- Make sure port 3000 is available
- Try deleting `node_modules` and running `npm install` again
- Check that the backend is running first

**Can't connect frontend to backend?**
- Make sure both servers are running
- Check the backend is on port 5001 (not 5000)
- Look at the browser console for any error messages

## Next Steps

If you want to extend this project, here are some ideas:
- Add a database to persist todos
- Add user authentication
- Add due dates and reminders
- Add categories or tags for todos
- Deploy it to a cloud platform

