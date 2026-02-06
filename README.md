# Medical Claims Management System

## Overview

A full-stack application for managing medical insurance claims with CSV import/export functionality.

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

3. The application will automatically:
   - Create the database
   - Run migrations
   - Seed default users

4. Access the application:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000

### Default Credentials
- Email: admin@example.com
- Password: password123

## Usage

### Importing Claims

1. Navigate to "Import Claims" page
2. Upload a CSV file with the required format (see below)
3. View import results and any errors

### Exporting Claims

Click "Export CSV" button on Claims List page to download all claims.

## Features
- User authentication
- CSV import of claims
- Claims management
- CSV export
- Patient management
- Sortable and filterable claims table
- Protected API endpoints

## Tech Stack
- Backend: Ruby on Rails 7.1
- Frontend: React 18
- UI: Ant Design
- Database: PostgreSQL 15
- Container: Docker & Docker Compose

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

## Database Schema

### Users
- email (unique)
- password_digest
- role (admin/staff)

### Patients
- first_name
- last_name
- dob

### Claims
- patient_id (foreign key)
- claim_import_id (foreign key)
- claim_number (unique)
- service_date
- amount
- status

### ClaimImports
- file_name
- total_records
- processed_records
- status

### ImportErrors (Bonus)
- claim_import_id (foreign key)
- row_number
- error_type
- error_message
- row_data (jsonb)

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Patients
- `GET /api/v1/patients` - List all patients
- `POST /api/v1/patients` - Create patient
- `GET /api/v1/patients/:id` - Get patient
- `PUT /api/v1/patients/:id` - Update patient
- `DELETE /api/v1/patients/:id` - Delete patient

### Claims
- `GET /api/v1/claims` - List all claims
- `POST /api/v1/claims` - Create claim
- `GET /api/v1/claims/:id` - Get claim
- `PUT /api/v1/claims/:id` - Update claim
- `DELETE /api/v1/claims/:id` - Delete claim

### Claim Imports
- `GET /api/v1/claim_imports` - List imports
- `POST /api/v1/claim_imports` - Upload CSV
- `GET /api/v1/claim_imports/:id` - Get import details

### Exports
- `POST /api/v1/exports` - Export claims to CSV

## Testing

Sample CSV files for testing are provided in `sample-data/`:
- `sample_claims_small.csv` - 5 records for basic testing
- `sample_claims_medium.csv` - 20 records
- `sample_claims_large.csv` - 50 records
- `sample_claims_with_errors.csv` - For error handling validation

## Development

### Running Rails Console
```bash
docker-compose exec backend rails console
```

### Database Migrations
```bash
docker-compose exec backend rails db:migrate
```

### Viewing Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Assumptions
- CSV files are stored locally in `/claims_uploads/imports/{date}/`
- All dates use YYYY-MM-DD format
- Valid rows are imported even if some rows fail validation
- Application uses America/Puerto_Rico timezone for file organization
- Users must be authenticated to access any claims data
- JWT tokens with 24-hour expiration
- Patients are created automatically during CSV import
- Patients are matched by first_name + last_name + dob combination
- Duplicate claim numbers are rejected
- All monetary amounts are in USD
- Import errors are logged with full row data for debugging

## Security Considerations

- Passwords are hashed using bcrypt
- API endpoints protected with JWT authentication
- CORS configured for frontend-backend communication
- Strong parameters used in all controllers
- SQL injection prevention through ActiveRecord

## Bonus Features Implemented

### Import Error Tracking

The application tracks detailed error information for failed CSV rows:

- **Error Types**: Validation failures, duplicates, invalid data
- **Row-Level Details**: See which specific rows failed and why
- **Original Data**: View the original row data for debugging
- **Visual Feedback**: Color-coded error types in the UI

Successfully processed rows are saved even when some rows fail, allowing
partial imports to succeed.