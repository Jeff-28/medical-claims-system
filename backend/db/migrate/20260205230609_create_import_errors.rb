class CreateImportErrors < ActiveRecord::Migration[7.1]
  def change
    create_table :import_errors do |t|
      t.references :claim_import, null: false, foreign_key: true
      t.integer :row_number, null: false
      t.string :error_type, null: false
      t.text :error_message
      t.jsonb :row_data

      t.timestamps
    end

    add_index :import_errors, :error_type
  end
end
