
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const [location, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    const statusCode = urlParams.get('status_code');
    const transactionStatus = urlParams.get('transaction_status');

    if (orderId && statusCode === '200' && transactionStatus === 'settlement') {
      // Payment successful, complete order creation manually
      completeOrder(orderId);
    } else {
      setStatus('error');
    }
  }, []);

  const completeOrder = async (orderId: string) => {
    try {
      // First, check if order already exists
      const checkResponse = await fetch(`/api/orders/${orderId}`);
      
      if (checkResponse.ok) {
        // Order already exists, payment was processed successfully
        const existingOrder = await checkResponse.json();
        console.log('Order already exists:', existingOrder);
        
        setStatus('success');
        setOrderDetails({
          orderId,
          transactionStatus: 'settlement',
          amount: existingOrder.totalAmount
        });
        
        // Clear cart just in case
        await clearCart();
        return;
      }
      
      // If order doesn't exist, try to create it manually
      const sessionId = orderId.split('-')[1];
      
      // Wait a bit for webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check again if order was created by webhook
      const secondCheckResponse = await fetch(`/api/orders/${orderId}`);
      if (secondCheckResponse.ok) {
        const existingOrder = await secondCheckResponse.json();
        console.log('Order found after waiting:', existingOrder);
        
        setStatus('success');
        setOrderDetails({
          orderId,
          transactionStatus: 'settlement',
          amount: existingOrder.totalAmount
        });
        
        await clearCart();
        return;
      }
      
      const response = await fetch('/api/payment/complete-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          sessionId
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Order completed:', result);
        
        // Clear cart
        await clearCart();
        
        setStatus('success');
        setOrderDetails({
          orderId,
          transactionStatus: 'settlement',
          amount: result.order?.totalAmount
        });
      } else {
        const errorData = await response.json();
        console.error('Failed to complete order:', errorData);
        
        // If payment was successful but we can't complete the order,
        // show success anyway since money was charged
        if (statusCode === '200' && transactionStatus === 'settlement') {
          console.log('Payment was successful, showing success despite order creation issues');
          setStatus('success');
          setOrderDetails({
            orderId,
            transactionStatus: 'settlement'
          });
          await clearCart();
        } else {
          throw new Error(errorData.error || 'Failed to complete order');
        }
      }
    } catch (error) {
      console.error('Error completing order:', error);
      setStatus('error');
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE'
      });
      if (response.ok) {
        console.log('Cart cleared successfully');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const goToHome = () => {
    setLocation('/');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Memproses pembayaran...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Pembayaran Gagal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Terjadi kesalahan dalam proses pembayaran. Silakan coba lagi.
            </p>
            <Button onClick={goToHome} className="w-full">
              Kembali ke Beranda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Pembayaran Berhasil!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">
              Terima kasih! Pembayaran Anda telah berhasil diproses.
            </p>
            {orderDetails && (
              <div className="bg-muted p-3 rounded-md text-sm">
                <p><strong>ID Pesanan:</strong> {orderDetails.orderId}</p>
                <p><strong>Status:</strong> Berhasil</p>
              </div>
            )}
          </div>
          <Button onClick={goToHome} className="w-full">
            Kembali ke Beranda
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
