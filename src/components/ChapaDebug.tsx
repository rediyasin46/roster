import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function ChapaDebug() {
  const [status, setStatus] = useState({
    apiKey: '',
    baseUrl: '',
    appUrl: '',
    isConfigured: false,
    loading: true,
  });

  useEffect(() => {
    // Check environment variables
    const apiKey = import.meta.env.VITE_CHAPA_API_KEY;
    const baseUrl = import.meta.env.VITE_CHAPA_BASE_URL || 'https://api.chapa.co/v1';
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;

    console.log('Debug Info:', {
      apiKey: apiKey ? `${apiKey.substring(0, 20)}...` : 'NOT SET',
      baseUrl,
      appUrl,
    });

    setStatus({
      apiKey: apiKey ? `${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 10)}` : 'NOT SET',
      baseUrl,
      appUrl,
      isConfigured: !!apiKey,
      loading: false,
    });
  }, []);

  const testPaymentInitialize = async () => {
    try {
      const response = await fetch('https://api.chapa.co/v1/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_CHAPA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 100,
          currency: 'ETB',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          phone_number: '+251912345678',
          tx_ref: `tx_${Date.now()}`,
          return_url: 'http://localhost:5173/payment-success',
        }),
      });

      const data = await response.json();
      console.log('Test Payment Response:', data);
      alert(`Response: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('Test error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (status.loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-6 m-4 space-y-4">
      <h2 className="text-xl font-bold">Chapa Configuration Debug</h2>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {status.isConfigured ? (
            <CheckCircle2 className="w-5 h-5 text-success" />
          ) : (
            <AlertCircle className="w-5 h-5 text-destructive" />
          )}
          <div>
            <p className="font-semibold">API Key Status</p>
            <p className="text-sm text-muted-foreground">{status.apiKey}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <div>
            <p className="font-semibold">Base URL</p>
            <p className="text-sm text-muted-foreground">{status.baseUrl}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <div>
            <p className="font-semibold">App URL</p>
            <p className="text-sm text-muted-foreground">{status.appUrl}</p>
          </div>
        </div>

        {status.isConfigured ? (
          <Badge className="bg-success text-success-foreground">✓ Configured</Badge>
        ) : (
          <Badge className="bg-destructive text-destructive-foreground">✗ Not Configured</Badge>
        )}
      </div>

      <div className="pt-4 border-t">
        <Button onClick={testPaymentInitialize} className="w-full" disabled={!status.isConfigured}>
          Test Payment API
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Check browser console (F12) for detailed logs. Make sure your .env file has VITE_CHAPA_API_KEY set.
      </p>
    </Card>
  );
}
