class CreateClaims < ActiveRecord::Migration[7.1]
  def change
    create_table :claims do |t|
      t.references :patient, null: false, foreign_key: true
      t.references :claim_import, null: false, foreign_key: true
      t.string :claim_number, null: false
      t.date :service_date, null: false
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.string :status, default: "pending"

      t.timestamps
    end

    add_index :claims, :claim_number, unique: true
    add_index :claims, :status
  end
end
