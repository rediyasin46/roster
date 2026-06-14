// Chapa Payment Gateway Integration
// Documentation: https://chapa.co/docs

// Debug: Log environment variables on load
console.log('Chapa Service Loading...');
console.log('Using backend payment service');

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

interface ChapaInitializePaymentParams {
  amount: number;
  currency?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  tx_ref: string; // Unique transaction reference
  return_url: string;
  customization?: {
    title?: string;
    description?: string;
  };
}

interface ChapaPaymentResponse {
  status: string;
  message: string;
  data?: {
    checkout_url: string;
  };
}

interface ChapaVerifyPaymentResponse {
  status: string;
  message: string;
  data?: {
    status: string;
    reference: string;
  };
}

export const chapaService = {
  /**
   * Initialize a payment transaction
   */
  async initializePayment(
    params: ChapaInitializePaymentParams
  ): Promise<ChapaPaymentResponse> {
    try {
      console.log('📤 Initializing Chapa payment with backend:', {
        amount: params.amount,
        email: params.email,
        tx_ref: params.tx_ref,
      });

      const response = await fetch(`${BACKEND_URL}/api/chapa/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: params.amount,
          currency: params.currency || 'ETB',
          email: params.email,
          first_name: params.first_name,
          last_name: params.last_name,
          phone_number: params.phone_number,
          tx_ref: params.tx_ref,
          return_url: params.return_url,
          customization: {
            title: params.customization?.title || 'ScoreBook Payment',
            description:
              params.customization?.description || 'ScoreBook Subscription Payment',
          },
        }),
      });

      // Get response text first for debugging
      const responseText = await response.text();
      console.log('📥 Backend Response Status:', response.status);
      console.log('📥 Backend Response Body:', responseText);

      // Try to parse as JSON
      let responseData: any;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('❌ Failed to parse response as JSON:', responseText);
        throw new Error(`Server error: ${response.status} - ${responseText}`);
      }

      if (!response.ok) {
        const errorMessage = responseData?.message || responseData?.error || 'Payment initialization failed';
        console.error('❌ Backend Error:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('✅ Payment initialized successfully');
      return responseData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment';
      console.error('❌ Chapa initialization error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Verify a payment transaction
   */
  async verifyPayment(reference: string): Promise<ChapaVerifyPaymentResponse> {
    try {
      console.log('📤 Verifying payment with backend:', reference);

      const response = await fetch(
        `${BACKEND_URL}/api/chapa/verify/${reference}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const responseText = await response.text();
      console.log('📥 Verification Response Status:', response.status);
      console.log('📥 Verification Response Body:', responseText);

      let responseData: any;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('❌ Failed to parse verification response:', responseText);
        throw new Error(`Server error: ${response.status}`);
      }

      if (!response.ok) {
        console.error('❌ Verification Error:', responseData?.message);
        throw new Error(responseData?.message || 'Failed to verify payment');
      }

      console.log('✅ Payment verified successfully');
      return responseData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify payment';
      console.error('❌ Verification error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Generate unique transaction reference
   */
  generateTxRef(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Create payment payload for a pricing plan
   */
  createPlanPaymentPayload(
    plan: {
      name: string;
      price: number;
    },
    userEmail: string,
    userName: string,
    userPhone: string
  ) {
    const [firstName, ...lastNameParts] = userName.split(' ');
    const lastName = lastNameParts.join(' ') || 'User';

    return {
      amount: plan.price,
      currency: 'ETB',
      email: userEmail.trim().toLowerCase(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone_number: userPhone.trim(),
      tx_ref: this.generateTxRef(),
      return_url: `${APP_URL}/payment-success`,
      customization: {
        title: 'ScoreBook',
        description: `${plan.name} Plan ${plan.price} ETB`,
      },
    };
  },
};

export type { ChapaInitializePaymentParams, ChapaPaymentResponse, ChapaVerifyPaymentResponse };
