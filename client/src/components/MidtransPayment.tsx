import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CreditCard, User, MapPin, Mail, Phone, ShoppingBag, Package, Truck } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { useLocalization } from '@/contexts/LocalizationContext';

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

interface ShippingOption {
  id: string;
  name: string;
  service: string;
  cost: number;
  estimatedDays: string;
  description: string;
}

export default function MidtransPayment({
  onPaymentSuccess,
  onPaymentPending,
  onPaymentError,
  onClose
}: MidtransPaymentProps) {
  const { formatCurrency } = useLocalization();
  const [isLoading, setIsLoading] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [customerData, setCustomerData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    province: ''
  });
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

  // Get cart items
  const { data: cartItems = [] } = useQuery({
    queryKey: ['/api/cart']
  });

  // Get payment config
  const { data: paymentConfig } = useQuery({
    queryKey: ['/api/payment/config']
  });

  // Calculate shipping when city and postal code are available
  useEffect(() => {
    if (customerData.city && customerData.postal_code && cartItems.length > 0) {
      calculateShippingCost();
    }
  }, [customerData.city, customerData.postal_code, cartItems]);

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum: number, item: any) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return sum + (price * item.quantity);
  }, 0);

  // Calculate total weight (estimate 1kg per item for shipping calculation)
  const totalWeight = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

  const tax = subtotal * 0.08;
  const shippingCost = selectedShipping?.cost || 0;
  const total = subtotal + tax + shippingCost;

  const calculateShippingCost = async () => {
    if (!customerData.city || !customerData.postal_code) return;

    setIsCalculatingShipping(true);
    try {
      // Simulate shipping cost calculation based on city and weight
      const baseShippingCosts = {
        'jakarta': 15000,
        'bandung': 20000,
        'surabaya': 25000,
        'medan': 30000,
        'makassar': 35000,
        'yogyakarta': 18000,
        'semarang': 22000,
        'palembang': 28000,
        'tangerang': 16000,
        'depok': 17000,
        'bekasi': 16000,
        'bogor': 18000
      };

      const cityKey = customerData.city.toLowerCase();
      const baseCost = baseShippingCosts[cityKey] || 25000; // Default cost if city not found

      const weightMultiplier = Math.ceil(totalWeight / 5) * 0.5; // Additional cost per 5kg
      const finalBaseCost = baseCost * (1 + weightMultiplier);

      const options: ShippingOption[] = [
        {
          id: 'jne-reg',
          name: 'JNE',
          service: 'Regular',
          cost: finalBaseCost,
          estimatedDays: '2-3 hari',
          description: 'Layanan reguler JNE dengan asuransi'
        },
        {
          id: 'jne-yes',
          name: 'JNE',
          service: 'YES',
          cost: finalBaseCost * 1.5,
          estimatedDays: '1-2 hari',
          description: 'Layanan express JNE dengan prioritas tinggi'
        },
        {
          id: 'pos-reg',
          name: 'Pos Indonesia',
          service: 'Regular',
          cost: finalBaseCost * 0.8,
          estimatedDays: '3-5 hari',
          description: 'Layanan pos reguler dengan tracking'
        },
        {
          id: 'tiki-reg',
          name: 'TIKI',
          service: 'Regular',
          cost: finalBaseCost * 0.9,
          estimatedDays: '2-4 hari',
          description: 'Layanan TIKI reguler'
        },
        {
          id: 'sicepat',
          name: 'SiCepat',
          service: 'Regular',
          cost: finalBaseCost * 1.1,
          estimatedDays: '2-3 hari',
          description: 'Layanan SiCepat dengan jaminan tepat waktu'
        }
      ];

      setShippingOptions(options);
      if (!selectedShipping && options.length > 0) {
        setSelectedShipping(options[0]); // Auto select first option
      }
    } catch (error) {
      console.error('Error calculating shipping cost:', error);
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleShippingSelect = (optionId: string) => {
    const option = shippingOptions.find(opt => opt.id === optionId);
    setSelectedShipping(option || null);
  };

  const handlePayment = async () => {
    if (!customerData.first_name || !customerData.email || !customerData.phone || 
        !customerData.address || !customerData.city || !customerData.postal_code) {
      alert('Mohon lengkapi semua data yang diperlukan (nama, email, telepon, alamat lengkap, kota, kode pos)');
      return;
    }

    if (!selectedShipping) {
      alert('Mohon pilih metode pengiriman terlebih dahulu');
      return;
    }

    if (!snapLoaded || !window.snap) {
      alert('Sistem pembayaran belum siap. Mohon tunggu sebentar atau refresh halaman.');
      return;
    }

    setIsLoading(true);

    try {
      const paymentData = {
        ...customerData,
        shipping_method: selectedShipping?.id || '',
        shipping_service: selectedShipping?.name || '', // Tambah nama ekspedisi
        shipping_cost: selectedShipping?.cost || 0,
        total_amount: total
      };

      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal membuat pembayaran');
      }

      const data = await response.json();

      // Use Midtrans Snap
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
          }
        });
      } else {
        throw new Error('Token pembayaran tidak tersedia atau sistem Snap belum siap');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert(`Terjadi kesalahan: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!paymentConfig) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Memuat konfigurasi pembayaran...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col max-h-[100vh]">
      {/* Scrollable Content */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-4 pb-24">
          {/* Order Summary with Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Ringkasan Pesanan ({cartItems.length} item)
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOrderDetails(!showOrderDetails)}
                >
                  {showOrderDetails ? 'Sembunyikan' : 'Lihat Detail'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {showOrderDetails && (
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Package className="h-4 w-4" />
                    Detail Item Pesanan:
                  </div>
                  {cartItems.map((item: any) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                      <img
                        src={item.image || '/placeholder-image.jpg'}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm">
                            {formatCurrency(item.price)} x {item.quantity}
                          </span>
                          <span className="font-semibold text-sm">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Separator />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} item):</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pajak (8%):</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                {selectedShipping && (
                  <div className="flex justify-between">
                    <span>Ongkos Kirim ({selectedShipping.name} {selectedShipping.service}):</span>
                    <span>{formatCurrency(shippingCost)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Pembayaran:</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Pelanggan
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Lengkapi data di bawah ini untuk proses pembayaran
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Nama Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-primary border-b pb-1">Data Diri</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="first_name" className="flex items-center gap-1 mb-2">
                      <User className="h-3 w-3" />
                      Nama Depan *
                    </Label>
                    <Input
                      id="first_name"
                      value={customerData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      placeholder="Masukkan nama depan"
                      required
                      className="h-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name" className="flex items-center gap-1 mb-2">
                      <User className="h-3 w-3" />
                      Nama Belakang
                    </Label>
                    <Input
                      id="last_name"
                      value={customerData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      placeholder="Masukkan nama belakang"
                      className="h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Kontak Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-primary border-b pb-1">Informasi Kontak</h4>
                <div>
                  <Label htmlFor="email" className="flex items-center gap-1 mb-2">
                    <Mail className="h-3 w-3" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="masukkan@email.com"
                    required
                    className="h-10"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="flex items-center gap-1 mb-2">
                    <Phone className="h-3 w-3" />
                    Nomor Telepon *
                  </Label>
                  <Input
                    id="phone"
                    value={customerData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+62812345678"
                    required
                    className="h-10"
                  />
                </div>
              </div>

              {/* Alamat Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-primary border-b pb-1">Alamat Pengiriman</h4>
                <div>
                  <Label htmlFor="address" className="flex items-center gap-1 mb-2">
                    <MapPin className="h-3 w-3" />
                    Alamat Lengkap *
                  </Label>
                  <Textarea
                    id="address"
                    value={customerData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Jalan, nama jalan, nomor rumah, RT/RW, kelurahan/desa, kecamatan"
                    rows={4}
                    required
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="city" className="mb-2 block">Kota *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={customerData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Masukkan kota"
                      required
                      className="h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="postal_code" className="mb-2 block">Kode Pos *</Label>
                    <Input
                      id="postal_code"
                      name="postal_code"
                      value={customerData.postal_code}
                      onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      placeholder="12345"
                      required
                      className="h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="province" className="mb-2 block">Provinsi</Label>
                    <Input
                      id="province"
                      name="province"
                      value={customerData.province}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                      placeholder="Masukkan provinsi"
                      className="h-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Options */}
          {customerData.city && customerData.postal_code && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Pilih Ekspedisi Pengiriman
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Pilih metode pengiriman yang diinginkan (Berat total: {totalWeight} kg)
                </p>
              </CardHeader>
              <CardContent>
                {isCalculatingShipping ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Menghitung ongkos kirim...</span>
                  </div>
                ) : shippingOptions.length > 0 ? (
                  <div className="space-y-3">
                    {shippingOptions.map((option) => (
                      <div
                        key={option.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedShipping?.id === option.id
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        }`}
                        onClick={() => handleShippingSelect(option.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{option.name}</span>
                              <Badge variant="outline">{option.service}</Badge>
                              {selectedShipping?.id === option.id && (
                                <Badge variant="default">Terpilih</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {option.description}
                            </p>
                            <p className="text-sm font-medium text-primary">
                              Estimasi: {option.estimatedDays}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{formatCurrency(option.cost)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Masukkan kota dan kode pos untuk melihat opsi pengiriman
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Method Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Metode Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                    <CreditCard className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Midtrans Payment Gateway</p>
                    <p className="text-xs text-muted-foreground">
                      Credit Card, Bank Transfer, E-Wallet, dll
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {paymentConfig.environment === 'production' ? 'Live' : 'Sandbox'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Fixed Payment Button */}
      <div className="sticky bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-sm p-4 shadow-lg">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span>Total yang harus dibayar:</span>
            <span className="font-bold text-lg text-primary">{formatCurrency(total)}</span>
          </div>
          <Button
            onClick={handlePayment}
            disabled={isLoading || !customerData.first_name || !customerData.email || !snapLoaded || !selectedShipping}
            className="w-full h-12"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses Pembayaran...
              </>
            ) : !snapLoaded ? 'Memuat sistem pembayaran...' : !selectedShipping ? 'Pilih metode pengiriman' : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Bayar Sekarang {formatCurrency(total)}
              </>
            )}
          </Button>
          {(!customerData.first_name || !customerData.email || !customerData.phone || 
           !customerData.address || !customerData.city || !customerData.postal_code) && (
            <p className="text-xs text-center text-muted-foreground">
              * Mohon lengkapi semua field yang wajib diisi.
            </p>
          )}
          {!selectedShipping && customerData.city && customerData.postal_code && (
            <p className="text-xs text-center text-muted-foreground text-orange-600">
              * Mohon pilih metode pengiriman terlebih dahulu.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}