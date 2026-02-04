class ClaimImport < ApplicationRecord
  has_many :claims, dependent: :destroy

  STATUSES = %w[pending processing completed failed].freeze

  validates :file_name, presence: true
  validates :status, inclusion: { in: STATUSES }

  def mark_as_completed!
    update!(status: 'completed')
  end

  def mark_as_failed!
    update!(status: 'failed')
  end
end
