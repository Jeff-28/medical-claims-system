module Api
  module V1
    class ExportsController < ApplicationController
      def create
        claims = Claim.includes(:patient).all

        csv_data = ExportService.to_csv(claims)

        send_data csv_data,
                  filename: "claims_export_#{Time.zone.today}.csv",
                  type: 'text/csv',
                  disposition: 'attachment'
      end
    end
  end
end
