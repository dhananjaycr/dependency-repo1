pipeline {
    agent any
    
    environment {
        DT_SERVER_URL = "${env.DT_SERVER_URL ?: 'http://localhost:8081'}"
        DT_API_KEY = credentials('dependency-track-api-key')
        PROJECT_NAME = "${env.PROJECT_NAME ?: 'jenkins-todo-application'}"
        PROJECT_DESCRIPTION = "${env.PROJECT_DESCRIPTION ?: 'Todo Application - Flask Backend and React Frontend'}"
        VERSION = sh(script: 'date +%Y.%m.%d', returnStdout: true).trim()
        REPO_URL = "${env.REPO_URL ?: 'https://github.com/dhananjaycr/dependency-repo1'}"
        REPO_BRANCH = "${env.REPO_BRANCH ?: 'main'}"
        WORKSPACE_DIR = "${WORKSPACE}/cloned-repo"
        SBOM_FILE = "${WORKSPACE_DIR}/sbom.json"
    }
    
    stages {
        stage('Clean Workspace') {
            steps {
                script {
                    echo "🧹 Cleaning workspace..."
                    sh '''
                        if [ -d "${WORKSPACE_DIR}" ]; then
                            rm -rf "${WORKSPACE_DIR}"
                            echo "✅ Workspace cleaned"
                        else
                            echo "ℹ️  Workspace already clean"
                        fi
                    '''
                }
            }
        }
        
        stage('Checkout Repository') {
            steps {
                script {
                    echo "📥 Cloning repository: ${REPO_URL} (branch: ${REPO_BRANCH})"
                    sh """
                        git clone --depth 1 --branch ${REPO_BRANCH} ${REPO_URL} ${WORKSPACE_DIR}
                        echo "✅ Repository cloned successfully"
                    """
                }
            }
        }
        
        stage('Generate SBOM') {
            steps {
                script {
                    echo "🔍 Scanning filesystem and generating CycloneDX SBOM..."
                    sh """
                        cd ${WORKSPACE_DIR}
                        trivy fs --format cyclonedx --output ${SBOM_FILE} --scanners vuln,license,misconfig,secret .
                        
                        if [ ! -f "${SBOM_FILE}" ]; then
                            echo "❌ ERROR: SBOM file was not created"
                            exit 1
                        fi
                        
                        COMPONENT_COUNT=\$(jq '.components | length' ${SBOM_FILE} 2>/dev/null || echo "0")
                        FILE_SIZE=\$(du -h ${SBOM_FILE} | cut -f1)
                        echo "✅ SBOM generated successfully"
                        echo "   Components: \$COMPONENT_COUNT"
                        echo "   File size: \$FILE_SIZE"
                    """
                }
            }
        }
        
        stage('Check/Create Project in Dependency-Track') {
            steps {
                script {
                    echo "🔎 Checking if project exists in Dependency-Track..."
                    sh """
                        PROJECT_RESPONSE=\$(curl -s -G "${DT_SERVER_URL}/api/v1/project" \\
                          --data-urlencode "name=${PROJECT_NAME}" \\
                          --data-urlencode "version=${VERSION}" \\
                          -H "X-Api-Key: ${DT_API_KEY}" || echo "[]")
                        
                        PROJECT_COUNT=\$(echo "\$PROJECT_RESPONSE" | jq 'length' 2>/dev/null || echo "0")
                        
                        if [ "\$PROJECT_COUNT" -gt 0 ]; then
                            PROJECT_UUID=\$(echo "\$PROJECT_RESPONSE" | jq -r '.[0].uuid')
                            echo "✅ Project already exists"
                            echo "   Project UUID: \$PROJECT_UUID"
                        else
                            echo "📝 Creating new project in Dependency-Track..."
                            CREATE_RESPONSE=\$(curl -s -X PUT "${DT_SERVER_URL}/api/v1/project" \\
                              -H "X-Api-Key: ${DT_API_KEY}" \\
                              -H "Content-Type: application/json" \\
                              -d '{"name": "${PROJECT_NAME}", "version": "${VERSION}", "description": "${PROJECT_DESCRIPTION}"}')
                            
                            sleep 2
                            PROJECT_UUID=\$(curl -s -G "${DT_SERVER_URL}/api/v1/project" \\
                              --data-urlencode "name=${PROJECT_NAME}" \\
                              --data-urlencode "version=${VERSION}" \\
                              -H "X-Api-Key: ${DT_API_KEY}" | jq -r '.[0].uuid')
                            
                            if [ "\$PROJECT_UUID" = "null" ] || [ -z "\$PROJECT_UUID" ]; then
                                echo "❌ ERROR: Failed to create project"
                                exit 1
                            fi
                            echo "✅ Project created successfully"
                            echo "   Project UUID: \$PROJECT_UUID"
                        fi
                        
                        echo "\$PROJECT_UUID" > ${WORKSPACE}/project_uuid.txt
                    """
                }
            }
        }
        
        stage('Upload SBOM to Dependency-Track') {
            steps {
                script {
                    echo "📤 Uploading SBOM to Dependency-Track..."
                    sh """
                        PROJECT_UUID=\$(cat ${WORKSPACE}/project_uuid.txt)
                        
                        UPLOAD_RESPONSE=\$(curl -s -w "\\nHTTP_STATUS:%{http_code}" -X POST "${DT_SERVER_URL}/api/v1/bom" \\
                          -H "X-Api-Key: ${DT_API_KEY}" \\
                          -F "project=\$PROJECT_UUID" \\
                          -F "bom=@${SBOM_FILE}")
                        
                        HTTP_STATUS=\$(echo "\$UPLOAD_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
                        
                        if [ "\$HTTP_STATUS" != "200" ] && [ "\$HTTP_STATUS" != "201" ] && [ "\$HTTP_STATUS" != "202" ]; then
                            echo "❌ ERROR: SBOM upload failed with status \$HTTP_STATUS"
                            exit 1
                        fi
                        
                        echo "✅ SBOM uploaded successfully"
                        echo "   Waiting for Dependency-Track to process..."
                        sleep 20
                    """
                }
            }
        }
        
        stage('Get Vulnerability Report') {
            steps {
                script {
                    echo "📊 Retrieving vulnerability report..."
                    sh """
                        PROJECT_UUID=\$(cat ${WORKSPACE}/project_uuid.txt)
                        sleep 10
                        
                        METRICS=\$(curl -s -X GET "${DT_SERVER_URL}/api/v1/metrics/project/\$PROJECT_UUID/current" \\
                          -H "X-Api-Key: ${DT_API_KEY}")
                        
                        echo "\$METRICS" | jq '.' > ${WORKSPACE}/vulnerability_metrics.json
                        
                        CRITICAL=\$(echo "\$METRICS" | jq -r '.critical // 0')
                        HIGH=\$(echo "\$METRICS" | jq -r '.high // 0')
                        MEDIUM=\$(echo "\$METRICS" | jq -r '.medium // 0')
                        LOW=\$(echo "\$METRICS" | jq -r '.low // 0')
                        TOTAL=\$(echo "\$METRICS" | jq -r '.vulnerabilities // 0')
                        
                        echo ""
                        echo "=========================================="
                        echo "📋 VULNERABILITY REPORT"
                        echo "=========================================="
                        echo "Project Name: ${PROJECT_NAME}"
                        echo "Version: ${VERSION}"
                        echo "Project UUID: \$PROJECT_UUID"
                        echo ""
                        echo "Vulnerability Summary:"
                        echo "  🔴 Critical: \$CRITICAL"
                        echo "  🟠 High:     \$HIGH"
                        echo "  🟡 Medium:   \$MEDIUM"
                        echo "  🔵 Low:      \$LOW"
                        echo "  ─────────────────────"
                        echo "  📊 Total:    \$TOTAL"
                        echo ""
                        echo "View in Dependency-Track:"
                        echo "  ${DT_SERVER_URL}/projects/\$PROJECT_UUID"
                        echo "=========================================="
                        
                        FINDINGS=\$(curl -s -X GET "${DT_SERVER_URL}/api/v1/finding/project/\$PROJECT_UUID?suppressed=false" \\
                          -H "X-Api-Key: ${DT_API_KEY}")
                        
                        echo "\$FINDINGS" | jq '[.[] | .vulnerability.severity] | group_by(.) | map({severity: .[0], count: length})' > ${WORKSPACE}/findings_summary.json
                        
                        # Generate simple HTML report
                        cat > ${WORKSPACE}/dependency-track-report.html <<EOF
<!DOCTYPE html>
<html>
<head>
    <title>Dependency-Track Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        h1 { color: #333; border-bottom: 3px solid #4CAF50; }
        .info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
        .metric { text-align: center; padding: 20px; border-radius: 8px; }
        .critical { background: #ffebee; border-left: 5px solid #f44336; }
        .high { background: #fff3e0; border-left: 5px solid #ff9800; }
        .medium { background: #fffde7; border-left: 5px solid #ffc107; }
        .low { background: #e3f2fd; border-left: 5px solid #2196F3; }
        .value { font-size: 32px; font-weight: bold; }
        .link { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #2196F3; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔒 Dependency-Track Vulnerability Report</h1>
        <div class="info">
            <strong>Project:</strong> ${PROJECT_NAME}<br>
            <strong>Version:</strong> ${VERSION}<br>
            <strong>UUID:</strong> \$PROJECT_UUID
        </div>
        <div class="metrics">
            <div class="metric critical"><div class="value" style="color: #f44336;">\$CRITICAL</div><div>Critical</div></div>
            <div class="metric high"><div class="value" style="color: #ff9800;">\$HIGH</div><div>High</div></div>
            <div class="metric medium"><div class="value" style="color: #ffc107;">\$MEDIUM</div><div>Medium</div></div>
            <div class="metric low"><div class="value" style="color: #2196F3;">\$LOW</div><div>Low</div></div>
        </div>
        <div style="text-align: center; margin-top: 20px;"><strong>Total: \$TOTAL</strong></div>
        <a href="${DT_SERVER_URL}/projects/\$PROJECT_UUID" target="_blank" class="link">View in Dependency-Track →</a>
    </div>
</body>
</html>
EOF
                    """
                }
            }
        }
        
        stage('Cleanup') {
            steps {
                script {
                    echo "🧹 Cleaning up cloned repository..."
                    sh """
                        if [ -d "${WORKSPACE_DIR}" ]; then
                            rm -rf "${WORKSPACE_DIR}"
                            echo "✅ Cleanup completed"
                        else
                            echo "ℹ️  Nothing to clean"
                        fi
                    """
                }
            }
        }
    }
    
    post {
        always {
            script {
                archiveArtifacts artifacts: 'vulnerability_metrics.json, findings_summary.json, dependency-track-report.html', allowEmptyArchive: true
                
                // Publish HTML report to Jenkins UI
                publishHTML([
                    reportName: 'Dependency-Track Report',
                    reportDir: '.',
                    reportFiles: 'dependency-track-report.html',
                    keepAll: true,
                    alwaysLinkToLastBuild: true
                ])
                
                // Final cleanup
                sh '''
                    if [ -d "${WORKSPACE_DIR}" ]; then
                        rm -rf "${WORKSPACE_DIR}"
                    fi
                '''
            }
        }
        success {
            script {
                try {
                    def metrics = readJSON file: "${WORKSPACE}/vulnerability_metrics.json"
                    def projectUuid = sh(script: "cat ${WORKSPACE}/project_uuid.txt 2>/dev/null || echo ''", returnStdout: true).trim()
                    
                    echo ""
                    echo "=========================================="
                    echo "✅ PIPELINE COMPLETED SUCCESSFULLY"
                    echo "=========================================="
                    echo "Project: ${PROJECT_NAME} v${VERSION}"
                    echo "Critical: ${metrics.critical ?: 0} | High: ${metrics.high ?: 0} | Total: ${metrics.vulnerabilities ?: 0}"
                    if (projectUuid) {
                        echo "View Report: ${DT_SERVER_URL}/projects/${projectUuid}"
                    }
                    echo "=========================================="
                } catch (Exception e) {
                    echo "✅ Pipeline completed successfully!"
                }
            }
        }
        failure {
            echo "❌ Pipeline failed. Check logs for details."
        }
    }
}
