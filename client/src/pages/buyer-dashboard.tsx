
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@/hooks/useAuth';
import { useLocalization } from '@/contexts/LocalizationContext';
import { queryClient, apiRequest } from '@/lib/queryClient';
import {
  Package,
  Truck,
  MapPin,
  User,
  Settings,
  Eye,
  ExternalLink,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  Home,
  Edit,
  Save,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Order {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  totalAmount: number;
  trackingNumber?: string;
  shippingService?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  province?: string;
}

function OrderTracking({ order }: { order: Order }) {
  const { formatCurrency } = useLocalization();

  const getTrackingUrl = (trackingNumber: string, shippingService: string): string => {
    const service = shippingService?.toLowerCase() || '';
    switch (service) {
      case 'jne':
        return `https://www.jne.co.id/id/tracking/trace?keyword=${trackingNumber}`;
      case 'pos indonesia':
        return `https://www.posindonesia.co.id/app/trace?barcode=${trackingNumber}`;
      case 'tiki':
        return `https://www.tiki.id/id/tracking?keyword=${trackingNumber}`;
      case 'sicepat':
        return `https://www.sicepat.com/?action=track&keyword=${trackingNumber}`;
      case 'anteraja':
        return `https://www.anteraja.com/cek-resi/${trackingNumber}`;
      case 'j&t':
        return `https://jet.co.id/track/${trackingNumber}`;
      default:
        return `https://www.google.com/search?q=${trackingNumber}+${shippingService}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu Konfirmasi';
      case 'processing': return 'Sedang Diproses';
      case 'shipped': return 'Dalam Pengiriman';
      case 'delivered': return 'Pesanan Diterima';
      case 'cancelled': return 'Pesanan Dibatalkan';
      default: return status;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${getStatusColor(order.orderStatus)}`}>
          {getStatusIcon(order.orderStatus)}
        </div>
        <div>
          <h3 className="font-semibold">{getStatusText(order.orderStatus)}</h3>
          <p className="text-sm text-muted-foreground">
            Pesanan #{order.orderId.substring(0, 12)}...
          </p>
        </div>
      </div>

      {order.trackingNumber && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Label className="font-medium">Nomor Resi</Label>
            <Badge variant="outline">{order.shippingService || 'Kurir'}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-background px-2 py-1 rounded text-sm font-mono">
              {order.trackingNumber}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(getTrackingUrl(order.trackingNumber!, order.shippingService || ''), '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Lacak
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <Label className="text-muted-foreground">Total Pembayaran</Label>
          <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Status Pembayaran</Label>
          <Badge 
            variant={order.paymentStatus === 'paid' ? 'default' : 'destructive'}
            className="ml-2"
          >
            {order.paymentStatus === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
          </Badge>
        </div>
        <div>
          <Label className="text-muted-foreground">Tanggal Pesan</Label>
          <p>{new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Alamat Pengiriman</Label>
          <p className="text-xs">{order.shippingAddress}</p>
        </div>
      </div>
    </div>
  );
}

function OrderDetails({ order, orderItems }: { order: Order, orderItems: OrderItem[] }) {
  const { formatCurrency } = useLocalization();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>ID Pesanan</Label>
          <div className="font-mono text-sm">{order.orderId}</div>
        </div>
        <div>
          <Label>Tanggal</Label>
          <div>{new Date(order.createdAt).toLocaleString('id-ID')}</div>
        </div>
      </div>

      <div>
        <Label>Detail Item Pesanan</Label>
        {orderItems.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.price)}</TableCell>
                  <TableCell>{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-sm text-muted-foreground">Tidak ada detail item</div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-lg font-semibold">
          Total: {formatCurrency(order.totalAmount)}
        </div>
      </div>
    </div>
  );
}

export default function BuyerDashboard() {
  const { user } = useAuth();
  const { formatCurrency } = useLocalization();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<UserProfile>>({});

  // Fetch user's orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['/api/buyer/orders'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/buyer/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    },
    enabled: !!user
  });

  // Fetch order items for selected order
  const { data: orderItems = [] } = useQuery<OrderItem[]>({
    queryKey: ['/api/buyer/orders', selectedOrder?.id, 'items'],
    queryFn: async () => {
      if (!selectedOrder) return [];
      const response = await apiRequest('GET', `/api/buyer/orders/${selectedOrder.id}/items`);
      if (!response.ok) {
        throw new Error('Failed to fetch order items');
      }
      return response.json();
    },
    enabled: !!selectedOrder
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<UserProfile>) => {
      const response = await apiRequest('PUT', '/api/user/profile', profileData);
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setIsEditingProfile(false);
      alert('Profil berhasil diperbarui!');
    },
    onError: (error) => {
      alert('Gagal memperbarui profil: ' + (error as Error).message);
    }
  });

  useEffect(() => {
    if (user && isEditingProfile) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        province: user.province || ''
      });
    }
  }, [user, isEditingProfile]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileForm);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'shipped': return 'secondary';
      case 'processing': return 'outline';
      case 'pending': return 'destructive';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p>Silakan login untuk mengakses dashboard.</p>
              <Button className="mt-4" onClick={() => window.location.href = '/auth'}>
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-bebas text-4xl text-primary mb-2">
            DASHBOARD BUYER
          </h1>
          <p className="text-muted-foreground">
            Kelola pesanan dan pengaturan akun Anda
          </p>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Pesanan Saya
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Lacak Pesanan
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Pengaturan
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Belum ada pesanan
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Pesanan</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">
                            {order.orderId.substring(0, 12)}...
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString('id-ID')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(order.orderStatus)}>
                              {order.orderStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(order.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewOrder(order)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            {orders.filter(order => order.orderStatus === 'shipped' || order.orderStatus === 'delivered').length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    Tidak ada pesanan yang sedang dalam pengiriman
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {orders
                  .filter(order => order.orderStatus === 'shipped' || order.orderStatus === 'delivered')
                  .map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-6">
                        <OrderTracking order={order} />
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Informasi Profil
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    {isEditingProfile ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    {isEditingProfile ? 'Batal' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Nama Depan</Label>
                        <Input
                          id="firstName"
                          value={profileForm.firstName || ''}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Nama Belakang</Label>
                        <Input
                          id="lastName"
                          value={profileForm.lastName || ''}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input
                        id="phone"
                        value={profileForm.phone || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+62812345678"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Alamat Lengkap</Label>
                      <Textarea
                        id="address"
                        value={profileForm.address || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Jl. Contoh No. 123, RT 01 RW 02"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">Kota</Label>
                        <Input
                          id="city"
                          value={profileForm.city || ''}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Bandung"
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Kode Pos</Label>
                        <Input
                          id="postalCode"
                          value={profileForm.postalCode || ''}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, postalCode: e.target.value }))}
                          placeholder="40391"
                        />
                      </div>
                      <div>
                        <Label htmlFor="province">Provinsi</Label>
                        <Input
                          id="province"
                          value={profileForm.province || ''}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, province: e.target.value }))}
                          placeholder="Jawa Barat"
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isPending}
                      className="w-full"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Simpan Perubahan
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label className="text-muted-foreground">Nama</Label>
                          <p>{`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label className="text-muted-foreground">Email</Label>
                          <p>{user.email}</p>
                        </div>
                      </div>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label className="text-muted-foreground">Telepon</Label>
                          <p>{user.phone}</p>
                        </div>
                      </div>
                    )}
                    {user.address && (
                      <div className="flex items-start gap-2">
                        <Home className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <Label className="text-muted-foreground">Alamat</Label>
                          <p>{user.address}</p>
                          {(user.city || user.postalCode || user.province) && (
                            <p className="text-sm text-muted-foreground">
                              {[user.city, user.postalCode, user.province].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Order Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail Pesanan</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <ScrollArea className="max-h-[70vh]">
                <OrderDetails order={selectedOrder} orderItems={orderItems} />
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
