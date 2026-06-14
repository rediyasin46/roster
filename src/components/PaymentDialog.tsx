import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { chapaService } from '@/services/chapaService';
import { Loader2 } from 'lucide-react';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: {
    name: string;
    price: number;
  };
}

export function PaymentDialog({ open, onOpenChange, plan }: PaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 Starting payment process...');
      
      const paymentPayload = chapaService.createPlanPaymentPayload(
        plan,
        formData.email,
        formData.fullName,
        formData.phone
      );

      console.log('📝 Payment payload:', paymentPayload);

      // Store transaction reference BEFORE redirecting to Chapa
      localStorage.setItem('pending_tx_ref', paymentPayload.tx_ref);
      localStorage.setItem('pending_payment', JSON.stringify({
        tx_ref: paymentPayload.tx_ref,
        plan: plan,
        email: formData.email,
        date: new Date().toISOString(),
      }));

      const response = await chapaService.initializePayment(paymentPayload);

      console.log('📊 Chapa response:', response);

      if (response.status === 'success' && response.data?.checkout_url) {
        console.log('✅ Redirecting to Chapa checkout...');
        // Redirect to Chapa checkout
        window.location.href = response.data.checkout_url;
      } else {
        const errorMsg = response.message || 'Failed to initialize payment';
        console.error('❌ Payment initialization failed:', errorMsg);
        toast({
          title: 'Payment Error',
          description: errorMsg,
          variant: 'destructive',
        });
      }
    } catch (error) {
      let errorMessage = 'Failed to process payment. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const errorObj = error as any;
        if (errorObj.message) {
          if (typeof errorObj.message === 'object') {
            // Convert validation errors to readable format
            errorMessage = Object.entries(errorObj.message)
              .map(([key, msgs]: [string, any]) => {
                if (Array.isArray(msgs)) {
                  return `${key}: ${msgs.join(', ')}`;
                }
                return `${key}: ${msgs}`;
              })
              .join('\n');
          } else {
            errorMessage = errorObj.message;
          }
        }
      }
      
      console.error('❌ Payment error:', error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-primary/10 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium">
              {plan.name} Plan - <span className="text-primary font-bold">{plan.price} ETB/month</span>
            </p>
          </div>

          <form onSubmit={handlePayment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Your full name"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="+251 9 XX XXX XXXX"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${plan.price} ETB via Chapa`
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            Secure payment powered by Chapa. Your payment information is encrypted.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
