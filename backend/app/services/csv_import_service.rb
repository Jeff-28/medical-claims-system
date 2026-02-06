require 'csv'

class CsvImportService
  def initialize(file, claim_import)
    @file = file
    @claim_import = claim_import
  end

  def process
    @claim_import.update(status: 'processing')

    csv_data = CSV.parse(@file.read, headers: true)
    @claim_import.update(total_records: csv_data.count)

    processed = 0

    csv_data.each_with_index do |row, index|
      row_number = index + 2 # +2 because CSV is 1-indexed and has header row

      begin
        # Validate required fields
        validate_required_fields!(row)

        # Validate dates
        validate_date_format!(row)

        # Validate amount
        validate_amount!(row)

        # Validate status
        validate_status!(row)

        # Create or find patient
        patient = create_patient(row, row_number)
        next unless patient

        # Create claim
        claim = Claim.new(
          patient: patient,
          claim_import: @claim_import,
          claim_number: row['claim_number'],
          service_date: row['service_date'],
          amount: row['amount'],
          status: row['status'] || 'pending'
        )

        if claim.save
          processed += 1
        else
          log_error(
            row_number: row_number,
            error_type: 'validation_failed',
            error_message: claim.errors.full_messages.join(', '),
            row_data: row.to_h
          )
        end
      rescue DuplicateClaimError => e
        log_error(
          row_number: row_number,
          error_type: 'duplicate_claim_number',
          error_message: e.message,
          row_data: row.to_h
        )
      rescue InvalidDateError => e
        log_error(
          row_number: row_number,
          error_type: 'invalid_date',
          error_message: e.message,
          row_data: row.to_h
        )
      rescue MissingFieldError => e
        log_error(
          row_number: row_number,
          error_type: 'missing_required_field',
          error_message: e.message,
          row_data: row.to_h
        )
      rescue InvalidAmountError => e
        log_error(
          row_number: row_number,
          error_type: 'invalid_amount',
          error_message: e.message,
          row_data: row.to_h
        )
      rescue InvalidStatusError => e
        log_error(
          row_number: row_number,
          error_type: 'invalid_status',
          error_message: e.message,
          row_data: row.to_h
        )
      rescue StandardError => e
        log_error(
          row_number: row_number,
          error_type: 'validation_failed',
          error_message: e.message,
          row_data: row.to_h
        )
      end
    end

    @claim_import.update(
      processed_records: processed,
      status: 'completed'
    )

    @claim_import
  rescue StandardError => e
    @claim_import.update(status: 'failed')
    raise e
  end

  private

  def validate_required_fields!(row)
    required_fields = %w[patient_first_name patient_last_name patient_dob claim_number service_date amount]

    required_fields.each do |field|
      raise MissingFieldError, "Missing required field: #{field}" if row[field].nil? || row[field].strip.empty?
    end
  end

  def validate_date_format!(row)
    %w[patient_dob service_date].each do |date_field|
      Date.parse(row[date_field]) if row[date_field].present?
    rescue ArgumentError
      raise InvalidDateError, "Invalid date format for #{date_field}: #{row[date_field]}"
    end
  end

  def validate_amount!(row)
    amount = row['amount'].to_f
    return unless amount <= 0

    raise InvalidAmountError, "Amount must be greater than 0, got: #{row['amount']}"
  end

  def validate_status!(row)
    valid_statuses = %w[pending submitted denied paid]
    status = row['status']&.downcase

    return unless status.present? && valid_statuses.exclude?(status)

    raise InvalidStatusError, "Invalid status: #{row['status']}. Must be one of: #{valid_statuses.join(', ')}"
  end

  def create_patient(row, row_number)
    Patient.find_or_create_by!(
      first_name: row['patient_first_name'],
      last_name: row['patient_last_name'],
      dob: row['patient_dob']
    )
  rescue StandardError => e
    log_error(
      row_number: row_number,
      error_type: 'patient_creation_failed',
      error_message: e.message,
      row_data: row.to_h
    )
    nil
  end

  def log_error(row_number:, error_type:, error_message:, row_data:)
    ImportError.create!(
      claim_import: @claim_import,
      row_number: row_number,
      error_type: error_type,
      error_message: error_message,
      row_data: row_data
    )

    Rails.logger.error("Import error on row #{row_number}: #{error_message}")
  end

  # Custom error classes
  class DuplicateClaimError < StandardError; end
  class InvalidDateError < StandardError; end
  class MissingFieldError < StandardError; end
  class InvalidAmountError < StandardError; end
  class InvalidStatusError < StandardError; end
end
