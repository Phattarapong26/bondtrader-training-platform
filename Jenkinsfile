pipeline {
    agent any

    environment {
        GIT_REPO = 'https://github.com/Phattarapong26/UknowmeFinal2025.git'
        GIT_BRANCH = 'main'
        PATH = "/usr/local/bin:${env.PATH}"
        APP_PORT = '5173'
        ROBOT_REPORTS_DIR = 'robot-reports'
        VENV_PATH = 'robot-venv'
        MONGODB_URI = 'mongodb://127.0.0.1:27017/Uknowmedatabase'
    }

    stages {
        stage('Git Clone') {
            steps {
                cleanWs()
                git branch: "${GIT_BRANCH}",
                    url: "${GIT_REPO}"
            }
        }

        stage('Check Node') {
            steps {
                sh '''
                    node -v
                    npm -v
                '''
            }
        }

        stage('Prepare Test Environment') {
            steps {
                sh '''
                    python3 -m venv $VENV_PATH
                    source $VENV_PATH/bin/activate
                    pip install --upgrade pip
                    pip install robotframework robotframework-seleniumlibrary pyotp
                '''
            }
        }

        stage('Check Docker') {
            steps {
                sh 'docker info'
            }
        }

        stage('Clean Up Containers') {
            steps {
                sh 'docker-compose down'
            }
        }

        stage('Create .env File') {
            steps {
                writeFile file: 'server/.env', text: '''
MONGODB_URI=${MONGODB_URI}
PORT=3000
JWT_SECRET=uknowme
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=UknowmeService@gmail.com
SMTP_PASS=ldgukmgxnmsrbkkw
OTP_SECRET=uknowme
FRONTEND_URL=http://localhost:5173
'''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker-compose build'
            }
        }

        stage('Deploy Containers') {
            steps {
                sh 'docker-compose up -d'
            }
        }

        stage('Wait for Application') {
            steps {
                sh '''
                    echo "Waiting for application to be ready..."
                    sleep 30
                    curl -f http://localhost:5173 || exit 1
                    echo "Checking MongoDB connection..."
                    mongosh --eval "db.runCommand({ping: 1})" || exit 1
                '''
            }
        }

        stage('Run Robot Tests') {
            steps {
                sh '''
                    source $VENV_PATH/bin/activate
                    robot -d $ROBOT_REPORTS_DIR \
                        tests/robot/present.robot
                '''
            }
        }

        stage('Docker Compose Logs') {
            steps {
                sh 'docker-compose logs --tail=50'
            }
        }
    }

    post {
        success {
            echo "Pipeline สำเร็จ! แอปพลิเคชันกำลังทำงานที่ http://localhost:${APP_PORT}"
            echo "รายงานการทดสอบ Robot Framework อยู่ในโฟลเดอร์ ${ROBOT_REPORTS_DIR}"
        }
        failure {
            echo 'Pipeline ล้มเหลว! กรุณาตรวจสอบบันทึกเพื่อดูรายละเอียด'
        }
        always {
            cleanWs()
        }
    }
}
