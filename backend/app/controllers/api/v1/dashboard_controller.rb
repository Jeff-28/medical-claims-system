module Api
  module V1
    class DashboardController < ApplicationController
      def stats
        render json: {
          summary: summary_stats,
          claims_by_status: claims_by_status,
          claims_by_month: claims_by_month,
          amounts_by_status: amounts_by_status,
          recent_imports: recent_imports
        }
      end

      private

      def summary_stats
        {
          total_claims: Claim.count,
          total_patients: Patient.count,
          total_amount: Claim.sum(:amount).to_f,
          total_imports: ClaimImport.count,
          pending_claims: Claim.where(status: 'pending').count,
          paid_claims: Claim.where(status: 'paid').count
        }
      end

      def claims_by_status
        Claim.group(:status).count
      end

      def claims_by_month
        # Get last 6 months of data
        Claim.where('service_date >= ?', 6.months.ago)
             .group_by_month(:service_date)
             .count
             .transform_keys { |date| date.strftime('%b %Y') }
      end

      def amounts_by_status
        Claim.group(:status)
             .sum(:amount)
             .transform_values(&:to_f)
      end

      def recent_imports
        ClaimImport.order(created_at: :desc)
                   .limit(5)
                   .as_json(
                     only: %i[id file_name total_records processed_records status created_at],
                     methods: [:error_count]
                   )
      end
    end
  end
end
