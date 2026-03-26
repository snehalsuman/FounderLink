pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = 'snehal2919'
        DOCKERHUB_CREDENTIALS = credentials('906b948e-3560-4d76-a431-336869d41d4d')
        GIT_REPO = 'https://github.com/snehalsuman/FounderLink.git'
        MVN = '/opt/homebrew/bin/mvn'
        DOCKER = '/usr/local/bin/docker'
        NPM = '/opt/homebrew/bin/npm'
        PATH = "/opt/homebrew/bin:/usr/local/bin:${env.PATH}"
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
                            sh '${MVN} clean package -DskipTests -q'
                        }
                    }
                }
                stage('User Service') {
                    steps {
                        dir('user-service') {
                            sh '${MVN} clean package -DskipTests -q'
                        }
                    }
                }
                stage('Startup Service') {
                    steps {
                        dir('startup-service') {
                            sh '${MVN} clean package -DskipTests -q'
                        }
                    }
                }
                stage('Investment Service') {
                    steps {
                        dir('InvestmentService') {
                            sh '${MVN} clean package -DskipTests -q'
                        }
                    }
                }
                stage('Team Service') {
                    steps {
                        dir('TeamService') {
                            sh '${MVN} clean package -DskipTests -q'
                        }
                    }
                }
                stage('Messaging Service') {
                    steps {
                        dir('MessagingService') {
                            sh '${MVN} clean package -DskipTests -q'
                        }
                    }
                }
                stage('Notification Service') {
                    steps {
                        dir('NotificationService') {
                            sh '${MVN} clean package -DskipTests -q'
                        }
                    }
                }
                stage('Config Server') {
                    steps {
                        dir('Config-Server') {
                            sh '${MVN} clean package -DskipTests -q'
                        }
                    }
                }
                stage('Eureka Server') {
                    steps {
                        dir('EurekaServer') {
                            sh '${MVN} clean package -DskipTests -q'
                        }
                    }
                }
                stage('API Gateway') {
                    steps {
                        dir('api-gateway') {
                            sh '${MVN} clean package -DskipTests -q'
                        }
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo '========== Building React Frontend =========='
                dir('founderlink-frontend') {
                    sh '${NPM} install --legacy-peer-deps'
                    sh '${NPM} run build'
                }
            }
        }

        stage('Docker Login') {
            steps {
                echo '========== Logging into Docker Hub =========='
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | ${DOCKER} login -u $DOCKERHUB_USERNAME --password-stdin'
            }
        }

        stage('Build & Push Docker Images') {
            parallel {
                stage('auth-service') {
                    steps {
                        dir('AuthService') {
                            sh "${DOCKER} build -t ${DOCKERHUB_USERNAME}/founderlink-auth:latest ."
                            sh "${DOCKER} push ${DOCKERHUB_USERNAME}/founderlink-auth:latest"
                        }
                    }
                }
                stage('user-service') {
                    steps {
                        dir('user-service') {
                            sh "${DOCKER} build -t ${DOCKERHUB_USERNAME}/founderlink-user:latest ."
                            sh "${DOCKER} push ${DOCKERHUB_USERNAME}/founderlink-user:latest"
                        }
                    }
                }
                stage('startup-service') {
                    steps {
                        dir('startup-service') {
                            sh "${DOCKER} build -t ${DOCKERHUB_USERNAME}/founderlink-startup:latest ."
                            sh "${DOCKER} push ${DOCKERHUB_USERNAME}/founderlink-startup:latest"
                        }
                    }
                }
                stage('investment-service') {
                    steps {
                        dir('InvestmentService') {
                            sh "${DOCKER} build -t ${DOCKERHUB_USERNAME}/founderlink-investment:latest ."
                            sh "${DOCKER} push ${DOCKERHUB_USERNAME}/founderlink-investment:latest"
                        }
                    }
                }
                stage('team-service') {
                    steps {
                        dir('TeamService') {
                            sh "${DOCKER} build -t ${DOCKERHUB_USERNAME}/founderlink-team:latest ."
                            sh "${DOCKER} push ${DOCKERHUB_USERNAME}/founderlink-team:latest"
                        }
                    }
                }
                stage('messaging-service') {
                    steps {
                        dir('MessagingService') {
                            sh "${DOCKER} build -t ${DOCKERHUB_USERNAME}/founderlink-messaging:latest ."
                            sh "${DOCKER} push ${DOCKERHUB_USERNAME}/founderlink-messaging:latest"
                        }
                    }
                }
                stage('notification-service') {
                    steps {
                        dir('NotificationService') {
                            sh "${DOCKER} build -t ${DOCKERHUB_USERNAME}/founderlink-notification:latest ."
                            sh "${DOCKER} push ${DOCKERHUB_USERNAME}/founderlink-notification:latest"
                        }
                    }
                }
                stage('config-server') {
                    steps {
                        dir('Config-Server') {
                            sh "${DOCKER} build -t ${DOCKERHUB_USERNAME}/founderlink-config:latest ."
                            sh "${DOCKER} push ${DOCKERHUB_USERNAME}/founderlink-config:latest"
                        }
                    }
                }
                stage('eureka-server') {
                    steps {
                        dir('EurekaServer') {
                            sh "${DOCKER} build -t ${DOCKERHUB_USERNAME}/founderlink-eureka:latest ."
                            sh "${DOCKER} push ${DOCKERHUB_USERNAME}/founderlink-eureka:latest"
                        }
                    }
                }
                stage('api-gateway') {
                    steps {
                        dir('api-gateway') {
                            sh "${DOCKER} build -t ${DOCKERHUB_USERNAME}/founderlink-gateway:latest ."
                            sh "${DOCKER} push ${DOCKERHUB_USERNAME}/founderlink-gateway:latest"
                        }
                    }
                }
                stage('frontend') {
                    steps {
                        dir('founderlink-frontend') {
                            sh "${DOCKER} build -t ${DOCKERHUB_USERNAME}/founderlink-frontend:latest ."
                            sh "${DOCKER} push ${DOCKERHUB_USERNAME}/founderlink-frontend:latest"
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
            sh '${DOCKER} logout'
        }
    }
}
