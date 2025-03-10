# Invoice Extractor / Expense Logger

The **Invoice Extractor** is a full-stack web application designed to help you manage invoices and track expenses efficiently. With functionality to upload invoices, add manual bank entries, and view detailed reports with interactive charts, this project offers a complete solution for expense logging and management.



## Features

- **Invoice Upload**: Easily upload PDF or image invoices. The system stores file metadata and invoice details.
- **Bank Entry Logging**: Add manual bank entries without the need for a PDF.
- **Invoice Detail Management**: View, edit, and delete invoices using an intuitive interface.
- **Dashboard Visualization**: Analyze spending trends over time and by category with interactive bar and pie charts.
- **Category Filtering**: Use the dedicated Categories page to filter and review invoices by category in a spreadsheet-like layout.
- **User Authentication**: Basic login functionality with room for future enhancements.
- **Containerized Deployment**: Run the backend, frontend, and PostgreSQL database seamlessly using Docker Compose.



## Technology Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React with React-Bootstrap and Recharts for data visualization
- **Database**: SQLite (development), PostgreSQL (production via Docker Compose)
- **Containerization**: Docker & Docker Compose


## Project Structure

```
invoice-extractor/
├── backend/                 # FastAPI backend service
│   ├── uploads/             # Directory for uploaded invoice files
│   ├── main.py              # FastAPI application with API endpoints
│   ├── requirements.txt     # Python dependencies
│   └── .gitignore           # Git ignore file for backend
├── frontend/                # React frontend service
│   ├── public/              # Public assets including index.html
│   ├── src/
│   │   ├── components/      # Reusable React components (e.g., NavigationBar)
│   │   ├── pages/           # Page components (Dashboard, InvoiceExtractor, InvoiceDetail, CategoryPage)
│   │   ├── App.js           # Main React App component (includes routing)
│   │   ├── api.js           # API helper functions for HTTP requests
│   │   └── index.js         # React entry point
│   ├── package.json         # Frontend dependencies and scripts
│   ├── package-lock.json    # NPM lock file
│   └── .gitignore           # Git ignore file for frontend
├── docker-compose.yml       # Docker Compose configuration for backend, frontend, and PostgreSQL
└── README.md                # Project documentation (this file)
```



## Getting Started

### Prerequisites

- Docker and Docker Compose (for containerized deployment)

Alternatively, run the backend and frontend locally:

- Python 3.7+
- Node.js 14+

### Running with Docker Compose

Clone the repository:

```bash
git clone https://github.com/Velocityofpie/invoice-extractor.git
cd invoice-extractor
```

Build and start the services:

```bash
docker-compose up --build
```

This builds the Docker images for the backend and frontend and starts them along with a PostgreSQL container.

Access the application:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000](http://localhost:8000)

### Running Locally without Docker

#### Backend

Navigate to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the FastAPI server:

```bash
uvicorn main:app --reload
```

The backend will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).

#### Frontend

Navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React application:

```bash
npm start
```

The frontend will be accessible at [http://localhost:3000](http://localhost:3000).



## Usage

- **Invoice Management**: Upload invoices or add manual bank entries on the Invoice Extractor page.
- **Dashboard**: View interactive charts that display spending trends over time and by category.
- **Categories Page**: Filter invoices by category with a spreadsheet-like layout.
- **Authentication**: Use the Login button on the navigation bar to authenticate (expandable as needed).



## Contributing

Contributions are welcome! If you have suggestions, bug fixes, or enhancements, please open an issue or submit a pull request.


## License




## Acknowledgments

- Built with **FastAPI** and **React**.
- Interactive charts powered by **Recharts**.
- Styling provided by **React Bootstrap**.

