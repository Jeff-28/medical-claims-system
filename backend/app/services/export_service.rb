require 'csv'

class ExportService
  def self.to_csv(claims)
    CSV.generate(headers: true) do |csv|
      csv << %w[claim_number patient_name service_date amount status]

      claims.each do |claim|
        csv << [
          claim.claim_number,
          claim.patient.full_name,
          claim.service_date.to_s,
          claim.amount.to_f,
          claim.status
        ]
      end
    end
  end
end
