class CreateStatusChanges < ActiveRecord::Migration[7.1]
  def change
    create_table :status_changes do |t|
      t.references :claim, null: false, foreign_key: true
      t.string :from_status, null: false
      t.string :to_status, null: false
      t.string :changed_by, null: false
      t.text :notes

      t.timestamps
    end

    add_index :status_changes, [:claim_id, :created_at]
  end
end
