class Claim < ApplicationRecord
  belongs_to :patient
  belongs_to :claim_import
  has_many :status_changes, dependent: :destroy

  STATUSES = %w[pending submitted denied paid canceled].freeze

  validates :claim_number, presence: true, uniqueness: true
  validates :service_date, :amount, presence: true
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :amount, numericality: { greater_than: 0 }

  # State machine configuration
  VALID_TRANSITIONS = {
    'pending' => %w[submitted canceled],
    'submitted' => %w[paid denied canceled],
    'paid' => [],
    'denied' => [],
    'canceled' => []
  }.freeze

  FINAL_STATES = %w[paid denied canceled].freeze

  # Check if status transition is valid
  def can_transition_to?(new_status)
    VALID_TRANSITIONS[status]&.include?(new_status) || false
  end

  # Get available actions for current status
  def available_actions
    VALID_TRANSITIONS[status] || []
  end

  # Check if claim is in final state
  def final_state?
    FINAL_STATES.include?(status)
  end

  def final_state
    final_state?
  end

  # Update status with validation and history tracking
  def transition_to!(new_status, user:, notes: nil)
    unless can_transition_to?(new_status)
      raise InvalidTransitionError,
            "Cannot transition from #{status} to #{new_status}"
    end

    old_status = status

    transaction do
      update!(status: new_status)

      # Record the status change
      status_changes.create!(
        from_status: old_status,
        to_status: new_status,
        changed_by: user.email,
        notes: notes
      )
    end

    true
  rescue ActiveRecord::RecordInvalid => e
    raise InvalidTransitionError, e.message
  end

  # Custom error class
  class InvalidTransitionError < StandardError; end
end
