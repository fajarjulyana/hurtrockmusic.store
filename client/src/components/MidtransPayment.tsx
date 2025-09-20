import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, User, MapPin, Phone, Mail } from 'lucide-react';

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: any) => void;
    };
  }
}

interface MidtransPaymentProps {
  onPaymentSuccess?: (result: any) => void;
  onPaymentPending?: (result: any) => void;
  onPaymentError?: (result: any) => void;
  onClose?: () => void;
}

export default function MidtransPayment({
  onPaymentSuccess,
  onPaymentPending,
  onPaymentError,
  onClose
}: MidtransPaymentProps) {
  const [customerData, setCustomerData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [snapLoaded, setSnapLoaded] = useState(false);

  // Load Midtrans Snap script dynamically
  useEffect(() => {
    const loadSnapScript = async () => {
      try {
        // Get Midtrans configuration from public endpoint
        const response = await fetch('/api/payment/config');
        
        if (response.ok) {
          const config = await response.json();
          if (config && config.clientKey) {
            // Remove existing script if any
            const existingScript = document.querySelector('script[src*="snap.js"]');
            if (existingScript) {
              existingScript.remove();
            }

            // Load appropriate Snap script based on environment
            const script = document.createElement('script');
            script.src = config.environment === 'production' 
              ? 'https://app.midtrans.com/snap/snap.js'
              : 'https://app.sandbox.midtrans.com/snap/snap.js';
            
            script.setAttribute('data-client-key', config.clientKey);
            script.onload = () => setSnapLoaded(true);
            script.onerror = () => {
              console.error('Failed to load Midtrans Snap script');
              setSnapLoaded(false);
            };
            
            document.head.appendChild(script);
          }
        }
      } catch (error) {
        console.error('Error loading Midtrans configuration:', error);
      }
    };

    loadSnapScript();

    // Cleanup function
    return () => {
      const script = document.querySelector('script[src*="snap.js"]');
      if (script) {
        script.remove();
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = async () => {
    if (!customerData.first_name || !customerData.email || !customerData.phone) {
      alert('Mohon lengkapi data yang diperlukan');
      return;
    }

    if (!snapLoaded || !window.snap) {
      alert('Sistem pembayaran belum siap. Mohon tunggu sebentar atau refresh halaman.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal membuat pembayaran');
      }

      const data = await response.json();
      
      if (data.token && window.snap) {
        window.snap.pay(data.token, {
          onSuccess: (result: any) => {
            console.log('Pembayaran berhasil:', result);
            onPaymentSuccess?.(result);
            onClose?.();
          },
          onPending: (result: any) => {
            console.log('Pembayaran tertunda:', result);
            onPaymentPending?.(result);
            onClose?.();
          },
          onError: (result: any) => {
            console.log('Pembayaran gagal:', result);
            onPaymentError?.(result);
          },
          onClose: () => {
            console.log('Popup pembayaran ditutup');
            // Don't call onClose here, let user decide
          }
        });
      } else {
        throw new Error('Token pembayaran tidak tersedia atau sistem Snap belum siap');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert(`Terjadi kesalahan: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Detail Pembayaran
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Customer Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nama Depan *
            </Label>
            <Input
              id="first_name"
              name="first_name"
              value={customerData.first_name}
              onChange={handleInputChange}
              placeholder="Masukkan nama depan"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="last_name">Nama Belakang</Label>
            <Input
              id="last_name"
              name="last_name"
              value={customerData.last_name}
              onChange={handleInputChange}
              placeholder="Masukkan nama belakang"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email *
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={customerData.email}
            onChange={handleInputChange}
            placeholder="masukkan@email.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Nomor Telepon *
          </Label>
          <Input
            id="phone"
            name="phone"
            value={customerData.phone}
            onChange={handleInputChange}
            placeholder="+62812345678"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Alamat Pengiriman
          </Label>
          <Textarea
            id="address"
            name="address"
            value={customerData.address}
            onChange={handleInputChange}
            placeholder="Masukkan alamat lengkap untuk pengiriman"
            rows={3}
          />
        </div>

        {/* Payment Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            onClick={handlePayment}
            disabled={loading || !snapLoaded}
            className="flex-1"
          >
            {loading ? 'Memproses...' : !snapLoaded ? 'Memuat sistem pembayaran...' : 'Bayar Sekarang'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          * Wajib diisi. Pembayaran akan diproses melalui Midtrans.
        </p>
      </CardContent>
    </Card>
  );
}