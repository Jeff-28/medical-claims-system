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

    csv_data.each do |row|
      patient = Patient.find_or_create_from_csv(row)

      claim = Claim.new(
        patient: patient,
        claim_import: @claim_import,
        claim_number: row['claim_number'],
        service_date: row['service_date'],
        amount: row['amount'],
        status: row['status'] || 'pending'
      )

      processed += 1 if claim.save
    rescue StandardError => e
      Rails.logger.error("Error processing row: #{e.message}")
      # Continue processing other rows
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
end
