import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { chapaService } from '@/services/chapaService';
import { CheckCircle2, AlertCircle, Loader2, Home } from 'lucide-react';

interface PaymentStatus {
  success: boolean;
  message: string;
  reference?: string;
  status?: string;
  loading: boolean;
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    success: false,
    message: 'Verifying payment...',
    loading: true,
  });

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Try to get reference from URL params
        let txRef = searchParams.get('tx_ref');
        let reference = searchParams.get('reference');

        // If not in URL, try to get from localStorage (Chapa may not always pass it back)
        if (!txRef && !reference) {
          const storedTxRef = localStorage.getItem('pending_tx_ref');
          if (storedTxRef) {
            txRef = storedTxRef;
          }
        }

        if (!txRef && !reference) {
          setPaymentStatus({
            success: false,
            message: 'No transaction reference found. Please try again.',
            loading: false,
          });
          return;
        }

        const ref = reference || txRef;
        console.log('Verifying payment with reference:', ref);
        const response = await chapaService.verifyPayment(ref!);

        if (response.status === 'success' && response.data?.status === 'completed') {
          setPaymentStatus({
            success: true,
            message: 'Payment completed successfully!',
            reference: ref,
            status: response.data.status,
            loading: false,
          });

          // Store subscription info and clean up pending transaction
          localStorage.setItem('last_payment', JSON.stringify({
            reference: ref,
            date: new Date().toISOString(),
            status: response.data.status,
          }));
          localStorage.removeItem('pending_tx_ref');
          localStorage.removeItem('pending_payment');

          // Redirect to home after 3 seconds
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else if (response.status === 'success' && response.data?.status === 'pending') {
          setPaymentStatus({
            success: false,
            message: 'Payment is pending. Please try again in a moment.',
            reference: ref,
            loading: false,
          });
        } else {
          setPaymentStatus({
            success: false,
            message: response.message || 'Payment verification failed',
            reference: ref,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setPaymentStatus({
          success: false,
          message: 'Failed to verify payment. Please contact support.',
          loading: false,
        });
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <div className="flex items-center justify-center min-h-[calc(100vh-60px)] p-4">
        <Card className="max-w-md w-full p-8">
          {paymentStatus.loading ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
              <h2 className="text-xl font-bold">{paymentStatus.message}</h2>
              <p className="text-muted-foreground text-sm">Please wait while we verify your payment...</p>
            </div>
          ) : paymentStatus.success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-success">{paymentStatus.message}</h2>
              <div className="bg-success/10 rounded-lg p-3 my-4">
                <p className="text-sm text-muted-foreground">Reference:</p>
                <p className="text-sm font-mono font-bold break-all">{paymentStatus.reference}</p>
              </div>
              <p className="text-muted-foreground text-sm">
                Your subscription is now active. Redirecting to home page...
              </p>
              <Button asChild className="w-full mt-4" size="lg">
                <a href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Home
                </a>
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <AlertCircle className="w-16 h-16 text-destructive" />
              </div>
              <h2 className="text-xl font-bold text-destructive">{paymentStatus.message}</h2>
              {paymentStatus.reference && (
                <div className="bg-destructive/10 rounded-lg p-3 my-4">
                  <p className="text-sm text-muted-foreground">Reference:</p>
                  <p className="text-sm font-mono font-bold break-all">{paymentStatus.reference}</p>
                </div>
              )}
              <p className="text-muted-foreground text-sm">
                If you believe this is an error, please contact our support team.
              </p>
              <div className="space-y-2 mt-4">
                <Button asChild className="w-full" size="lg">
                  <a href="/pricing">Try Again</a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href="/">Go to Home</a>
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
