class StatusChange < ApplicationRecord
  belongs_to :claim

  validates :from_status, :to_status, :changed_by, presence: true
  validates :from_status, :to_status, inclusion: {
    in: %w[pending submitted denied paid canceled]
  }
end
