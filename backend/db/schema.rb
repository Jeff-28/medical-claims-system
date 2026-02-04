# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2026_02_03_171656) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "claim_imports", force: :cascade do |t|
    t.string "file_name", null: false
    t.integer "total_records", default: 0
    t.integer "processed_records", default: 0
    t.string "status", default: "pending"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "claims", force: :cascade do |t|
    t.bigint "patient_id", null: false
    t.bigint "claim_import_id", null: false
    t.string "claim_number", null: false
    t.date "service_date", null: false
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.string "status", default: "pending"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["claim_import_id"], name: "index_claims_on_claim_import_id"
    t.index ["claim_number"], name: "index_claims_on_claim_number", unique: true
    t.index ["patient_id"], name: "index_claims_on_patient_id"
    t.index ["status"], name: "index_claims_on_status"
  end

  create_table "patients", force: :cascade do |t|
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.date "dob", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["first_name", "last_name", "dob"], name: "index_patients_on_first_name_and_last_name_and_dob"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.string "role", default: "staff", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "claims", "claim_imports"
  add_foreign_key "claims", "patients"
end
