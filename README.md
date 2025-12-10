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
