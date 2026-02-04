class Claim < ApplicationRecord
  belongs_to :patient
  belongs_to :claim_import

  STATUSES = %w[pending submitted denied paid].freeze

  validates :claim_number, presence: true, uniqueness: true
  validates :service_date, :amount, presence: true
  validates :status, inclusion: { in: STATUSES }
  validates :amount, numericality: { greater_than: 0 }
end
