# Medical Claims Management System

## Setup Instructions

### Prerequisites
- Docker Desktop
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Jeff-28/medical-claims-system.git
cd medical-claims-system
```

2. Start the application:
```bash
docker compose up --build
```

3. Access the application:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000

### Default Credentials
- Email: admin@example.com
- Password: password123

## Features
- User authentication
- CSV import of claims
- Claims management
- CSV export
- Patient management

## Tech Stack
- Backend: Ruby on Rails 7.1
- Frontend: React 18
- UI: Ant Design
- Database: PostgreSQL
- Container: Docker

## CSV Format
Required columns:
- patient_first_name
- patient_last_name
- patient_dob (YYYY-MM-DD)
- claim_number
- service_date (YYYY-MM-DD)
- amount
- status (pending/submitted/denied/paid)

## Project Structure
```
medical-claims-system/
├── backend/          # Rails API
├── frontend/         # React app
├── sample-data/      # sample csv files
└── docker-compose.yml
```

## Assumptions
- Users must be authenticated to access any claims data
- Patients are created automatically during CSV import
- Duplicate claim numbers are rejected
- All monetary amounts are in USD