module Api
  module V1
    class ClaimsController < ApplicationController
      before_action :set_claim, only: %i[show update destroy transition]

      def index
        @claims = Claim.includes(:patient, :claim_import).order(created_at: :desc)
        render json: @claims.as_json(
          include: {
            patient: { methods: :full_name },
            claim_import: { only: %i[id file_name] }
          },
          methods: %i[available_actions final_state]
        )
      end

      def show
        render json: @claim.as_json(
          include: {
            patient: { methods: :full_name },
            claim_import: { only: %i[id file_name created_at] },
            status_changes: {
              only: %i[id from_status to_status changed_by notes created_at]
            }
          },
          methods: %i[available_actions final_state]
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

      def transition
        new_status = params[:status]
        notes = params[:notes]

        begin
          @claim.transition_to!(new_status, user: @current_user, notes: notes)

          render json: {
            message: "Status updated to #{new_status}",
            claim: @claim.as_json(
              include: {
                patient: { methods: [:full_name] },
                status_changes: {
                  only: %i[id from_status to_status changed_by notes created_at]
                },
                claim_import: { only: %i[id file_name created_at] }
              },
              methods: %i[available_actions final_state]
            )
          }
        rescue Claim::InvalidTransitionError => e
          render json: { error: e.message }, status: :unprocessable_content
        end
      end

      private

      def set_claim
        @claim = Claim.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Claim not found' }, status: :not_found
      end

      def claim_params
        params.require(:claim).permit(:patient_id, :claim_import_id, :claim_number, :service_date, :amount, :status)
      end
    end
  end
end
