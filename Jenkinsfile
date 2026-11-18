
pipeline {
    agent any

    environment {
        IMAGE_NAME = 'phephim-backend-vandung'
    }

    stages {
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
            echo 'PHÊ PHIM CI SUCCESS'
        }
        failure {
            echo 'PHÊ PHIM CI FAILED'
        }
    }
}
