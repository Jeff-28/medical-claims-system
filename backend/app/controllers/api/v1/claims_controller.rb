module Api
  module V1
    class ClaimsController < ApplicationController
      before_action :set_claim, only: %i[show update destroy]

      def index
        @claims = Claim.includes(:patient, :claim_import).order(created_at: :desc)
        render json: @claims.as_json(
          include: {
            patient: { methods: :full_name },
            claim_import: { only: %i[id file_name] }
          }
        )
      end

      def show
        render json: @claim.as_json(
          include: {
            patient: { methods: :full_name },
            claim_import: { only: %i[id file_name] }
          }
        )
      end

      def create
        @claim = Claim.new(claim_params)

        if @claim.save
          render json: @claim, status: :created
        else
          render json: { errors: @claim.errors.full_messages }, status: :unprocessable_content
        end
      end

      def update
        if @claim.update(claim_params)
          render json: @claim
        else
          render json: { errors: @claim.errors.full_messages }, status: :unprocessable_content
        end
      end

      def destroy
        @claim.destroy
        head :no_content
      end

      private

      def set_claim
        @claim = Claim.find(params[:id])
      end

      def claim_params
        params.require(:claim).permit(:patient_id, :claim_import_id, :claim_number, :service_date, :amount, :status)
      end
    end
  end
end
