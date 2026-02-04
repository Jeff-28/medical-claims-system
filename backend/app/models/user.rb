class User < ApplicationRecord
  has_secure_password

  ROLES = %w[admin staff].freeze

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role, presence: true, inclusion: { in: ROLES }
  validates :password, length: { minimum: 6 }, if: :password_digest_changed?
end
