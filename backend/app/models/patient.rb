class Patient < ApplicationRecord
  has_many :claims, dependent: :destroy

  validates :first_name, :last_name, :dob, presence: true

  def full_name
    "#{first_name} #{last_name}"
  end

  def self.find_or_create_from_csv(row)
    find_or_create_by!(
      first_name: row['patient_first_name'],
      last_name: row['patient_last_name'],
      dob: row['patient_dob']
    )
  end
end
