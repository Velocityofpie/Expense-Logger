# Expense-Analyzer
Expense Analyzer

START
docker-compose up -d

LOGS
docker ps


CONTAINER ID   IMAGE                           STATUS            PORTS
xxxxxxxxxxxx   expense-analyzer-backend        Up 1 minute       0.0.0.0:8000->8000/tcp
xxxxxxxxxxxx   expense-analyzer-frontend       Up 1 minute       0.0.0.0:3000->3000/tcp
xxxxxxxxxxxx   mongo:6.0                       Up 1 minute       0.0.0.0:27017->27017/tcp

STOP
docker-compose down


RESART
docker-compose down
docker-compose up -d --build