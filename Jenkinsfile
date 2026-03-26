pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = 'snehal2919'
        DOCKERHUB_CREDENTIALS = credentials('906b948e-3560-4d76-a431-336869d41d4d')
        GIT_REPO = 'https://github.com/snehalsuman/FounderLink.git'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '========== Checking out source code =========='
                checkout scm
            }
        }

        stage('Build Backend Services') {
            parallel {
                stage('Auth Service') {
                    steps {
                        dir('AuthService') {
                            sh 'mvn clean package -DskipTests -q'
                        }
                    }
                }
                stage('User Service') {
                    steps {
                        dir('user-service') {
                            sh 'mvn clean package -DskipTests -q'
                        }
                    }
                }
                stage('Startup Service') {
                    steps {
                        dir('startup-service') {
                            sh 'mvn clean package -DskipTests -q'
                        }
                    }
                }
                stage('Investment Service') {
                    steps {
                        dir('InvestmentService') {
                            sh 'mvn clean package -DskipTests -q'
                        }
                    }
                }
                stage('Team Service') {
                    steps {
                        dir('TeamService') {
                            sh 'mvn clean package -DskipTests -q'
                        }
                    }
                }
                stage('Messaging Service') {
                    steps {
                        dir('MessagingService') {
                            sh 'mvn clean package -DskipTests -q'
                        }
                    }
                }
                stage('Notification Service') {
                    steps {
                        dir('NotificationService') {
                            sh 'mvn clean package -DskipTests -q'
                        }
                    }
                }
                stage('Config Server') {
                    steps {
                        dir('Config-Server') {
                            sh 'mvn clean package -DskipTests -q'
                        }
                    }
                }
                stage('Eureka Server') {
                    steps {
                        dir('EurekaServer') {
                            sh 'mvn clean package -DskipTests -q'
                        }
                    }
                }
                stage('API Gateway') {
                    steps {
                        dir('api-gateway') {
                            sh 'mvn clean package -DskipTests -q'
                        }
                    }
                }
            }
        }

        stage('Run Backend Tests') {
            parallel {
                stage('Test Auth Service') {
                    steps {
                        dir('AuthService') {
                            sh 'mvn test -q'
                        }
                    }
                }
                stage('Test Startup Service') {
                    steps {
                        dir('startup-service') {
                            sh 'mvn test -q'
                        }
                    }
                }
                stage('Test Investment Service') {
                    steps {
                        dir('InvestmentService') {
                            sh 'mvn test -q'
                        }
                    }
                }
                stage('Test Team Service') {
                    steps {
                        dir('TeamService') {
                            sh 'mvn test -q'
                        }
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo '========== Building React Frontend =========='
                dir('founderlink-frontend') {
                    sh 'npm install --legacy-peer-deps'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Login') {
            steps {
                echo '========== Logging into Docker Hub =========='
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
            }
        }

        stage('Build & Push Docker Images') {
            parallel {
                stage('auth-service') {
                    steps {
                        dir('AuthService') {
                            sh "docker build -t ${DOCKERHUB_USERNAME}/founderlink-auth:latest ."
                            sh "docker push ${DOCKERHUB_USERNAME}/founderlink-auth:latest"
                        }
                    }
                }
                stage('user-service') {
                    steps {
                        dir('user-service') {
                            sh "docker build -t ${DOCKERHUB_USERNAME}/founderlink-user:latest ."
                            sh "docker push ${DOCKERHUB_USERNAME}/founderlink-user:latest"
                        }
                    }
                }
                stage('startup-service') {
                    steps {
                        dir('startup-service') {
                            sh "docker build -t ${DOCKERHUB_USERNAME}/founderlink-startup:latest ."
                            sh "docker push ${DOCKERHUB_USERNAME}/founderlink-startup:latest"
                        }
                    }
                }
                stage('investment-service') {
                    steps {
                        dir('InvestmentService') {
                            sh "docker build -t ${DOCKERHUB_USERNAME}/founderlink-investment:latest ."
                            sh "docker push ${DOCKERHUB_USERNAME}/founderlink-investment:latest"
                        }
                    }
                }
                stage('team-service') {
                    steps {
                        dir('TeamService') {
                            sh "docker build -t ${DOCKERHUB_USERNAME}/founderlink-team:latest ."
                            sh "docker push ${DOCKERHUB_USERNAME}/founderlink-team:latest"
                        }
                    }
                }
                stage('messaging-service') {
                    steps {
                        dir('MessagingService') {
                            sh "docker build -t ${DOCKERHUB_USERNAME}/founderlink-messaging:latest ."
                            sh "docker push ${DOCKERHUB_USERNAME}/founderlink-messaging:latest"
                        }
                    }
                }
                stage('notification-service') {
                    steps {
                        dir('NotificationService') {
                            sh "docker build -t ${DOCKERHUB_USERNAME}/founderlink-notification:latest ."
                            sh "docker push ${DOCKERHUB_USERNAME}/founderlink-notification:latest"
                        }
                    }
                }
                stage('config-server') {
                    steps {
                        dir('Config-Server') {
                            sh "docker build -t ${DOCKERHUB_USERNAME}/founderlink-config:latest ."
                            sh "docker push ${DOCKERHUB_USERNAME}/founderlink-config:latest"
                        }
                    }
                }
                stage('eureka-server') {
                    steps {
                        dir('EurekaServer') {
                            sh "docker build -t ${DOCKERHUB_USERNAME}/founderlink-eureka:latest ."
                            sh "docker push ${DOCKERHUB_USERNAME}/founderlink-eureka:latest"
                        }
                    }
                }
                stage('api-gateway') {
                    steps {
                        dir('api-gateway') {
                            sh "docker build -t ${DOCKERHUB_USERNAME}/founderlink-gateway:latest ."
                            sh "docker push ${DOCKERHUB_USERNAME}/founderlink-gateway:latest"
                        }
                    }
                }
                stage('frontend') {
                    steps {
                        dir('founderlink-frontend') {
                            sh "docker build -t ${DOCKERHUB_USERNAME}/founderlink-frontend:latest ."
                            sh "docker push ${DOCKERHUB_USERNAME}/founderlink-frontend:latest"
                        }
                    }
                }
            }
        }

    }

    post {
        success {
            echo '=========================================='
            echo ' BUILD SUCCESSFUL - All images pushed!'
            echo '=========================================='
        }
        failure {
            echo '=========================================='
            echo ' BUILD FAILED - Check logs above'
            echo '=========================================='
        }
        always {
            sh 'docker logout'
        }
    }
}
