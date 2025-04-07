
# Expense Logger - Summary 

​Expense Logger is a self-hosted expense tracking application designed to help you monitor individual purchases through invoice receipts or manual inputs. It allows you to categorize each entry by item type, providing a detailed record of your spending habits.​

Key Features:

Itemized Expense Tracking: Log each purchase with specific details, enabling precise monitoring of items such as HVAC filters or water heaters over extended periods.​

Receipt and Document Management: Attach PDF receipts and warranty documents to each entry, ensuring all relevant information is easily accessible for future reference, such as warranty claims.​

Categorization: Organize expenses by categories and item types, facilitating analysis of spending patterns across different hobbies or household needs.​

This tool is particularly useful for individuals who wish to keep a comprehensive record of their purchases, track the frequency of specific item replacements, manage warranty information efficiently, and analyze spending across various interests over time.

# Expense Logger - Setup Guide

This guide provides comprehensive instructions for setting up the Expense Logger application using Docker with centralized environment configuration.

## Prerequisites

- Docker and Docker Compose installed on your system
- Git (for cloning the repository)

## Project Structure

```
expense-logger/
├── backend/
│   ├── uploads/
│   ├── Dockerfile
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── .env
├── docker-compose.yml
└── README.md
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd expense-logger
```

### 2. Configure Environment Variables

1. Copy the provided `.env` file to the root of the project:

```bash
# Example content of .env file
DB_HOST=postgres_db
DB_NAME=expense_logger
DB_USER=postgres
DB_PASSWORD=secret
# ... other variables
```

2. Review and modify the values as needed for your environment.

### 3. Build and Start the Services

```bash
# Build the Docker images
docker-compose build

# Start the services in the background
docker-compose up -d
```

### 4. Monitor the Setup Process

```bash
# View logs from all services
docker-compose logs -f
```

### 5. Access the Application

- Frontend UI: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Environment Configuration

The central `.env` file contains configuration for all services:

| Variable | Description | Default |
|----------|-------------|---------|
| DB_HOST | PostgreSQL server hostname | postgres_db |
| DB_NAME | Database name | expense_logger |
| DB_USER | Database username | postgres |
| DB_PASSWORD | Database password | secret |
| API_URL | Backend API URL | http://localhost:8000 |
| API_PORT | Port for backend service | 8000 |
| FRONTEND_URL | Frontend URL | http://localhost:3000 |
| FRONTEND_PORT | Port for frontend service | 3000 |
| JWT_SECRET | Secret key for JWT tokens | your-secret-key-change-in-production |
| MAX_UPLOAD_SIZE | Maximum file upload size in bytes | 10485760 (10MB) |

## Development Workflow

### Updating the Backend

1. Make changes to the backend code
2. The changes will be automatically applied (hot reload is enabled)

### Updating the Frontend

1. Make changes to the frontend code
2. The changes will be automatically applied (hot reload is enabled)

### Database Changes

If you make schema changes to the database models:

1. The backend will automatically apply the changes on restart
2. For major schema changes, you may need to rebuild:

```bash
docker-compose down
docker-compose up -d --build
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps
   
   # View PostgreSQL logs
   docker-compose logs postgres_db
   ```

2. **API Connection Issues**:
   ```bash
   # Verify the backend is running
   docker-compose ps backend
   
   # Check backend logs
   docker-compose logs backend
   ```

3. **Frontend Not Loading**:
   ```bash
   # Check frontend logs
   docker-compose logs frontend
   
   # Verify the API_URL is correct in .env
   ```

4. **Reset Everything**:
   ```bash
   # Stop all containers and remove volumes
   docker-compose down -v
   
   # Rebuild and start
   docker-compose up -d --build
   ```

## Backup and Restore

### Backup the Database

```bash
docker-compose exec postgres_db pg_dump -U postgres expense_logger > backup.sql
```

### Restore the Database

```bash
# Stop services
docker-compose down

# Start just the database
docker-compose up -d postgres_db

# Wait for it to initialize
sleep 10

# Restore from backup
docker-compose exec -T postgres_db psql -U postgres expense_logger < backup.sql

# Start all services
docker-compose up -d
```

## Production Deployment Notes

For production deployment:

1. Change all default passwords and secrets in the `.env` file
2. Set `NODE_ENV=production` for the frontend service
3. Configure proper SSL/TLS for secure connections
4. Set up a proper backup strategy
5. Consider using Docker Swarm or Kubernetes for container orchestration

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
