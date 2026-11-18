
pipeline {
    agent any

    environment {
        IMAGE_NAME = 'phephim-backend-vandung'
    }

    stages {
        stage('Notify Started') {
            steps {
                withCredentials([
                    string(credentialsId: 'telegram-bot-token-vandung', variable: 'TELEGRAM_BOT_TOKEN'),
                    string(credentialsId: 'telegram-chat-id-vandung', variable: 'TELEGRAM_CHAT_ID')
                ]) {
                    sh '''
                        set +x
                        MESSAGE="🚀 PHE PHIM - BUILD STARTED
Project: ${JOB_NAME}
Build: #${BUILD_NUMBER}
URL: ${BUILD_URL}"

                        curl -sS --fail \
                          -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
                          --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
                          --data-urlencode "text=${MESSAGE}"
                    '''
                }
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
                echo 'Checkout source code thanh cong'
            }
        }

        stage('Docker Build & Test') {
            steps {
                sh '''
                    docker build \
                      -f backend/Dockerfile.vandung \
                      -t ${IMAGE_NAME}:${BUILD_NUMBER} \
                      ./backend
                '''
            }
        }

        stage('Verify Image') {
            steps {
                sh '''
                    docker image inspect \
                      ${IMAGE_NAME}:${BUILD_NUMBER} \
                      --format '{{.Os}}/{{.Architecture}}'
                '''
            }
        }
    }

    post {
        success {
            withCredentials([
                string(credentialsId: 'telegram-bot-token-vandung', variable: 'TELEGRAM_BOT_TOKEN'),
                string(credentialsId: 'telegram-chat-id-vandung', variable: 'TELEGRAM_CHAT_ID')
            ]) {
                sh '''
                    set +x
                    MESSAGE="✅ PHE PHIM - BUILD SUCCESS
Project: ${JOB_NAME}
Build: #${BUILD_NUMBER}
Branch: ${BRANCH_NAME}
Commit: ${GIT_COMMIT}
URL: ${BUILD_URL}"

                    curl -sS --fail \
                      -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
                      --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
                      --data-urlencode "text=${MESSAGE}"
                '''
            }
        }

        failure {
            withCredentials([
                string(credentialsId: 'telegram-bot-token', variable: 'TELEGRAM_BOT_TOKEN'),
                string(credentialsId: 'telegram-chat-id', variable: 'TELEGRAM_CHAT_ID')
            ]) {
                sh '''
                    set +x
                    MESSAGE="❌ PHE PHIM - BUILD FAILURE
Project: ${JOB_NAME}
Build: #${BUILD_NUMBER}
Branch: ${BRANCH_NAME}
Commit: ${GIT_COMMIT}
URL: ${BUILD_URL}"

                    curl -sS --fail \
                      -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
                      --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
                      --data-urlencode "text=${MESSAGE}"
                '''
            }
        }
    }
}
