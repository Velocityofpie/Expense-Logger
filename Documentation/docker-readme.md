# Expense Logger - Docker Setup

This document provides instructions for setting up the Expense Logger application using Docker.

## Prerequisites

- Docker and Docker Compose installed on your system
- Git (for cloning the repository)

## Project Structure

```
expense-logger/
├── backend/
│   ├── migrations/
│   │   ├── Dockerfile
│   │   ├── init_db.sh
│   │   └── wait-for-postgres.sh
│   ├── uploads/
│   ├── Dockerfile
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── .env
├── docker-compose.yml
└── README.md
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd expense-logger
   ```

2. Create the required directories and files:
   ```
   # Create migrations directory
   mkdir -p backend/migrations
   mkdir -p backend/uploads
   ```

3. Copy the provided Dockerfiles, scripts, and configuration files to their respective locations:
   - `backend/Dockerfile`
   - `backend/requirements.txt`
   - `backend/migrations/Dockerfile`
   - `backend/migrations/init_db.sh`
   - `backend/migrations/wait-for-postgres.sh`
   - `frontend/Dockerfile`
   - `frontend/.env`
   - `docker-compose.yml`

4. Make sure the script files are executable:
   ```
   chmod +x backend/migrations/*.sh
   ```

5. Start the Docker containers:
   ```
   docker-compose up -d
   ```

6. Monitor the initialization process:
   ```
   docker-compose logs -f db_init
   ```

7. Check that all services are running:
   ```
   docker-compose ps
   ```

8. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## Troubleshooting

If you encounter any issues:

1. Check the logs for specific services:
   ```
   docker-compose logs -f backend
   docker-compose logs -f frontend
   docker-compose logs -f postgres_db
   ```

2. Restart services:
   ```
   docker-compose restart backend
   docker-compose restart frontend
   ```

3. If database issues persist, you may need to reset the database:
   ```
   docker-compose down -v
   docker-compose up -d
   ```

## Maintenance

- To update the application after code changes:
  ```
  docker-compose build
  docker-compose up -d
  ```

- To stop all services:
  ```
  docker-compose down
  ```

- To view running containers:
  ```
  docker-compose ps
  ```

- To enter a specific container for debugging:
  ```
  docker-compose exec backend bash
  docker-compose exec frontend sh
  docker-compose exec postgres_db bash
  ```

## Backup and Restore

- To backup the database:
  ```
  docker-compose exec postgres_db pg_dump -U postgres expense_logger > backup.sql
  ```

- To restore from a backup:
  ```
  docker-compose exec -T postgres_db psql -U postgres expense_logger < backup.sql
  ```
