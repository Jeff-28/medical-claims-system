class CreatePatients < ActiveRecord::Migration[7.1]
  def change
    create_table :patients do |t|
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.date :dob, null: false

      t.timestamps
    end

    add_index :patients, [:first_name, :last_name, :dob]
  end
end
