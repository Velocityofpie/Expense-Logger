# Email Integration for Expense Logger

This guide outlines how to implement email order processing in the Expense Logger application.

## Overview

The email integration adds the ability to automatically extract invoice data from emails, allowing users to:

1. Connect email accounts via IMAP/API 
2. Automatically forward specific emails
3. Extract structured data from order confirmation emails
4. Process attached PDFs using the existing OCR system

## Architecture

The hybrid approach uses:

- **Go microservice**: High-performance email retrieval and initial processing
- **Python backend**: Email template management and data extraction
- **Integration with existing invoice storage**

## Step 1: Database Schema Changes

Create migrations for the following tables:

```sql
-- Email accounts
CREATE TABLE email_accounts (
    account_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    email_address VARCHAR(255) NOT NULL,
    provider VARCHAR(50),
    connection_type VARCHAR(20) DEFAULT 'IMAP',
    host VARCHAR(255),
    port INTEGER,
    username VARCHAR(255),
    password VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    token_expiry TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    last_checked TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email templates
CREATE TABLE email_templates (
    template_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    vendor VARCHAR(100),
    version VARCHAR(20),
    description TEXT,
    from_patterns JSONB,
    subject_patterns JSONB,
    template_data JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Processed emails
CREATE TABLE processed_emails (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES email_accounts(account_id),
    message_id VARCHAR(255) UNIQUE,
    subject VARCHAR(255),
    sender VARCHAR(255),
    received_date TIMESTAMP,
    processed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20),
    error_message TEXT,
    extracted_data JSONB,
    invoice_id INTEGER REFERENCES invoices(invoice_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email attachments
CREATE TABLE email_attachments (
    id SERIAL PRIMARY KEY,
    email_id INTEGER REFERENCES processed_emails(id),
    filename VARCHAR(255),
    content_type VARCHAR(100),
    size INTEGER,
    storage_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modify existing invoices table
ALTER TABLE invoices 
    ADD COLUMN source_type VARCHAR(20) DEFAULT 'manual',
    ADD COLUMN source_id VARCHAR(255);
```

## Step 2: Go Email Microservice

Create a new Go microservice to handle email retrieval:

1. **Directory structure**:
   ```
   go-email-service/
   ├── cmd/
   │   └── server/
   │       └── main.go
   ├── internal/
   │   ├── api/
   │   ├── email/
   │   ├── config/
   │   └── models/
   ├── Dockerfile
   └── go.mod
   ```

2. **Key components**:
   - IMAP connector for standard email servers
   - Gmail API connector for OAuth-based access
   - Email processor to detect order emails
   - REST API to trigger processing and receive results

3. **Configuration**:
   - Email server details (IMAP, SMTP)
   - Callback URL to the Python backend
   - Processing limits and batch sizes

## Step 3: Python Backend Services

Add new services to the existing FastAPI backend:

1. **Email template service**:
   - Template creation and management
   - Email data extraction rules
   - Pattern matching for different vendors

2. **Email processing service**:
   - Callback endpoint for the Go microservice
   - Process extracted data into invoice records
   - Handle email attachments (PDFs, images)

3. **API endpoints**:
   ```python
   # Add these to main.py or create a new router
   
   # Email account management
   app.include_router(
       email_accounts_router,
       prefix="/api/emails/accounts",
       tags=["email-accounts"]
   )
   
   # Email template management
   app.include_router(
       email_templates_router,
       prefix="/api/emails/templates",
       tags=["email-templates"]
   )
   
   # Email processing
   app.include_router(
       email_processing_router,
       prefix="/api/emails",
       tags=["emails"]
   )
   ```

## Step 4: Frontend Components

Add new UI components for email management:

1. **Email account setup**:
   - IMAP server configuration
   - Gmail OAuth connection
   - Forwarding instructions

2. **Email template management**:
   - Create and edit extraction templates
   - Test templates against sample emails
   - Vendor-specific configurations

3. **Email processing dashboard**:
   - View processed emails and extraction results
   - Manual trigger for processing
   - Error handling and retry options

## Step 5: Integration with Existing Features

Connect the email system with the current invoice processing:

1. **Update invoice model**:
   - Add source tracking (manual, email, PDF upload)
   - Link to original email if applicable

2. **Enhance OCR pipeline**:
   - Process PDF attachments from emails
   - Combine email data with PDF extraction

3. **Update dashboard**:
   - Include email-sourced invoices in reports
   - Filter options for invoice sources

## Configuration Guide

### IMAP Email Setup

For Gmail IMAP access:
1. Enable "Less secure app access" or use App Passwords
2. Configure with:
   - Server: imap.gmail.com
   - Port: 993
   - SSL: Yes
   - Username: full Gmail address
   - Password: App Password

### Gmail API Setup

1. Create a Google Cloud project
2. Enable Gmail API
3. Create OAuth 2.0 credentials
4. Configure redirect URIs
5. Implement OAuth flow in the application

### Email Forwarding Instructions

Instructions for users to set up forwarding:

1. In Gmail, go to Settings > Forwarding and POP/IMAP
2. Add your service's email address as forwarding address
3. Create filters for order confirmation emails:
   - From: amazon.com, bestbuy.com, etc.
   - Subject: "order confirmation", "receipt", etc.
4. Set the action to forward matching emails

## Testing and Deployment

1. **Start with a standalone test**:
   ```bash
   # Clone email processing repository
   git clone https://github.com/yourusername/email-invoice-processor.git
   
   # Run with Docker Compose
   cd email-invoice-processor
   docker-compose up -d
   ```

2. **Integrate into main project**:
   ```bash
   # Copy microservice and code components
   cp -r email-invoice-processor/go-email-service /path/to/expense-logger/
   cp -r email-invoice-processor/python-backend/app/services/email* /path/to/expense-logger/backend/services/
   
   # Run migrations
   cd /path/to/expense-logger/backend
   alembic revision --autogenerate -m "add_email_processing"
   alembic upgrade head
   ```

3. **Update docker-compose.yml**:
   ```yaml
   # Add to existing docker-compose.yml
   services:
     # ... existing services
       
     go-email-service:
       build:
         context: ./go-email-service
         dockerfile: Dockerfile
       environment:
         - PORT=8080
         - CALLBACK_URL=http://backend:8000/api/emails/callback/
       volumes:
         - ./go-email-service:/app
   ```

## Conclusion

This email integration extends your Expense Logger application with automated invoice collection directly from emails. The hybrid approach provides performance benefits while maintaining compatibility with your existing Python-based system.

Start by testing the standalone prototype, then integrate the components into your main application gradually to ensure stability.
