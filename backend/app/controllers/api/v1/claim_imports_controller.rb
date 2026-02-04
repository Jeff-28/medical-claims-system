module Api
  module V1
    class ClaimImportsController < ApplicationController
      def index
        @claim_imports = ClaimImport.order(created_at: :desc)
        render json: @claim_imports
      end

      def show
        @claim_import = ClaimImport.find(params[:id])
        render json: @claim_import.as_json(include: { claims: { include: :patient } })
      end

      def create
        return render json: { error: 'No file provided' }, status: :unprocessable_content if params[:file].blank?

        file = params[:file]

        # Create upload directory structure
        date_folder = Time.zone.today.to_s
        upload_dir = Rails.root.join('claims_uploads', 'imports', date_folder)
        FileUtils.mkdir_p(upload_dir)

        # Save file
        timestamp = Time.now.to_i
        filename = "claims_import_#{timestamp}.csv"
        filepath = upload_dir.join(filename)

        File.binwrite(filepath, file.read)

        # Create ClaimImport record
        claim_import = ClaimImport.create!(
          file_name: filename,
          status: 'pending'
        )

        # Process CSV
        File.open(filepath, 'r') do |f|
          service = CsvImportService.new(f, claim_import)
          service.process
        end

        render json: claim_import, status: :created
      rescue StandardError => e
        render json: { error: e.message }, status: :unprocessable_content
      end
    end
  end
end
