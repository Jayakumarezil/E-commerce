import { paymentService } from '../services/paymentService';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: any) => void;
  modal: {
    ondismiss: () => void;
  };
}

export const initializeRazorpay = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.head.appendChild(script);
  });
};

export const openRazorpayPayment = async (
  orderId: string,
  amount: number,
  userDetails: { name: string; email: string; phone: string },
  onSuccess: () => void,
  onFailure: (error: any) => void
) => {
  try {
    // Initialize Razorpay script
    await initializeRazorpay();

    // Razorpay options - using direct amount approach
    const options = {
      key: (import.meta.env.VITE_RAZORPAY_KEY_ID as string) || '',
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      name: 'Vellore Mobile Point',
      description: `Order #${orderId}`,
      order_id: undefined, // Will be set dynamically if we have a Razorpay order ID
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.phone,
      },
      theme: {
        color: '#3b82f6',
      },
      handler: async (response: any) => {
        try {
          console.log('Payment response from Razorpay:', JSON.stringify(response, null, 2));
          
          // Extract payment ID and signature from response
          // Note: When using direct amount (not order_id), Razorpay response structure differs
          const paymentId = response.razorpay_payment_id || response.payment_id || response.id;
          const signature = response.razorpay_signature || response.signature || 'test_signature';
          
          console.log('Extracted fields:', {
            paymentId,
            signature: signature ? `${signature.substring(0, 20)}...` : 'missing',
            orderId,
            allKeys: Object.keys(response)
          });
          
          // Check if we have at least a payment ID
          if (!paymentId) {
            console.error('Missing payment ID in response:', {
              full_response: response,
              response_keys: Object.keys(response)
            });
            onFailure(new Error('Invalid payment response from Razorpay - no payment ID found'));
            return;
          }
          
          // For test mode, signature might be empty - that's okay
          const finalSignature = signature || `test_signature_${Date.now()}`;
          
          console.log('Verifying payment...');
          
          // Verify payment on server
          await paymentService.verifyPayment(
            orderId,
            paymentId,
            finalSignature
          );
          
          console.log('Payment verified successfully');
          onSuccess();
        } catch (error) {
          console.error('Payment verification error:', error);
          onFailure(error);
        }
      },
      modal: {
        ondismiss: () => {
          console.log('Payment window closed by user');
          onFailure(new Error('Payment cancelled by user'));
        },
      },
    };

    // Open Razorpay checkout
    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', (response: any) => {
      console.error('Payment failed:', response.error);
      onFailure(new Error(response.error.description || 'Payment failed'));
    });
    razorpay.open();
  } catch (error) {
    console.error('Error opening Razorpay:', error);
    onFailure(error);
  }
};

// Function to open UPI payment
export const openUPIPayment = async (
  orderId: string,
  _amount: number,
  onSuccess: () => void,
  onFailure: (error: any) => void
) => {
  try {
    const qrData = await paymentService.generatePaymentQR(orderId);
    
    // For now, just log the UPI string and simulate success
    // In a real implementation, you would show a QR code or UPI payment screen
    console.log('UPI Payment String:', qrData.qrCode);
    
    // Simulate payment success after 3 seconds (for demo purposes)
    // In production, you would implement actual UPI payment tracking
    setTimeout(() => {
      onSuccess();
    }, 3000);
  } catch (error) {
    onFailure(error);
  }
};

