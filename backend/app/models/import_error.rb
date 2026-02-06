class ImportError < ApplicationRecord
  belongs_to :claim_import

  ERROR_TYPES = %w[
    validation_failed
    duplicate_claim_number
    invalid_date
    missing_required_field
    invalid_amount
    invalid_status
    patient_creation_failed
  ].freeze

  validates :row_number, :error_type, :error_message, presence: true
  validates :error_type, inclusion: { in: ERROR_TYPES }
end
