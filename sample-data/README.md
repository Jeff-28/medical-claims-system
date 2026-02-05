# Sample CSV Test Data

This folder contains sample CSV files for testing the Medical Claims Management System.

## Files Included

1. `sample_claims_small.csv` - 5 records for basic testing
2. `sample_claims_medium.csv` - 20 records for realistic testing
3. `sample_claims_large.csv` - 50 records for performance testing
4. `sample_claims_with_errors.csv` - Contains intentional errors for validation testing

## CSV Format

All CSV files follow this structure:

```
patient_first_name,patient_last_name,patient_dob,claim_number,service_date,amount,status
```

### Column Descriptions

- **patient_first_name**: Patient's first name (string)
- **patient_last_name**: Patient's last name (string)
- **patient_dob**: Date of birth in YYYY-MM-DD format
- **claim_number**: Unique claim identifier (string)
- **service_date**: Date of medical service in YYYY-MM-DD format
- **amount**: Claim amount (decimal, dollars.cents)
- **status**: Claim status (pending/submitted/denied/paid)

## Usage

1. Navigate to the Import page in the application
2. Select one of the CSV files below
3. Click upload or drag and drop
4. Verify the import results

---

## Test Scenarios

### Basic Import Test
Use: `sample_claims_small.csv`
- Tests basic CSV parsing
- Verifies patient creation
- Checks claim-patient linking

### Realistic Volume Test
Use: `sample_claims_medium.csv`
- Tests with 20+ records
- Multiple patients with multiple claims
- Various statuses and dates

### Performance Test
Use: `sample_claims_large.csv`
- 50 records to test processing speed
- Verify no timeout issues
- Check database performance

### Error Handling Test
Use: `sample_claims_with_errors.csv`
- Contains duplicate claim numbers
- Invalid dates
- Missing required fields
- Tests validation and error reporting

---

## Generating Custom Test Data

If you need to generate your own test data, use this pattern:

```csv
patient_first_name,patient_last_name,patient_dob,claim_number,service_date,amount,status
FirstName,LastName,YYYY-MM-DD,CLM-XXX,YYYY-MM-DD,999.99,pending
```

### Tips for Custom Data

1. **Claim Numbers**: Must be unique across all imports
2. **Dates**: Use YYYY-MM-DD format
3. **Status**: Must be one of: pending, submitted, denied, paid
4. **Patient Matching**: Same first name + last name + DOB = same patient

---

## Expected Results

### After Successful Import

You should see:
- Import status shows "completed"
- Processed records matches total records
- All claims appear in Claims List
- Patients are created/linked correctly

### Common Issues

**Issue**: "Import failed"
- Check CSV format matches exactly
- Verify all required columns present
- Check for special characters

**Issue**: Some records not imported
- Duplicate claim numbers rejected
- Invalid date formats
- Amount less than or equal to 0

**Issue**: Patients duplicated
- Check exact matching of first name, last name, and DOB
- Extra spaces or case differences create new patients

---

## Database Cleanup

To reset between tests:

```bash
# Using Docker
docker-compose exec backend rails db:reset

# This will:
# 1. Drop the database
# 2. Create new database
# 3. Run migrations
# 4. Run seeds (create default users)
```

Or manually:

```bash
docker-compose exec backend rails console

# In console:
Claim.destroy_all
Patient.destroy_all
ClaimImport.destroy_all
```