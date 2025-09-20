import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLocalization } from '@/contexts/LocalizationContext';
import jsPDF from 'jspdf';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Upload,
  X,
  ImageIcon,
  Printer,
  Eye,
  Filter,
  MessageCircle,
  Send,
  User,
  Bot,
  Clock,
  Settings,
  CreditCard,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  categoryId: string;
  imageUrl?: string;
  rating?: string;
  reviewCount?: number;
  isNew?: boolean;
  isSale?: boolean;
  inStock?: boolean;
  stockQuantity?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  total: number;
  trackingNumber?: string;
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

interface MidtransConfig {
  id: string;
  environment: 'sandbox' | 'production';
  serverKey: string;
  clientKey: string;
  merchantId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Admin auth helper function
const getAdminKey = (): string => {
  let adminKey = localStorage.getItem('adminKey');
  if (!adminKey) {
    adminKey = prompt('Enter admin key for accessing orders:') || '';
    if (adminKey) {
      localStorage.setItem('adminKey', adminKey);
    }
  }
  return adminKey;
};

// Store Settings Manager Component
function StoreSettingsManager() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'operator'
  });
  const [sessionSettings, setSessionSettings] = useState({
    sessionSecret: '',
    sessionMaxAge: 24,
    autoGenerateSecret: true
  });

  // Fetch current settings
  const fetchSettings = async () => {
    try {
      const adminKey = getAdminKey();
      const [settingsResponse, usersResponse] = await Promise.all([
        fetch('/api/admin/settings', {
          headers: { 'Authorization': `Bearer ${adminKey}` }
        }),
        fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${adminKey}` }
        })
      ]);

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSettings(settingsData);
        if (settingsData.session) {
          setSessionSettings({
            sessionSecret: settingsData.session.secret || '',
            sessionMaxAge: settingsData.session.maxAge || 24,
            autoGenerateSecret: settingsData.session.autoGenerate || true
          });
        }
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save session settings
  const saveSessionSettings = async () => {
    setIsSaving(true);
    try {
      const adminKey = getAdminKey();
      const response = await fetch('/api/admin/settings/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify(sessionSettings)
      });

      if (response.ok) {
        alert('Pengaturan session berhasil disimpan!');
        fetchSettings();
      } else {
        throw new Error('Failed to save session settings');
      }
    } catch (error) {
      console.error('Error saving session settings:', error);
      alert('Gagal menyimpan pengaturan session!');
    } finally {
      setIsSaving(false);
    }
  };

  // Create new user/operator
  const createUser = async () => {
    if (!newUser.email || !newUser.username || !newUser.password) {
      alert('Email, username, dan password harus diisi!');
      return;
    }

    try {
      const adminKey = getAdminKey();
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        alert('User baru berhasil dibuat!');
        setNewUser({
          email: '',
          username: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'operator'
        });
        fetchSettings();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Gagal membuat user: ' + (error as Error).message);
    }
  };

  // Update user role
  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const adminKey = getAdminKey();
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        alert('Role user berhasil diperbarui!');
        fetchSettings();
      } else {
        throw new Error('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Gagal memperbarui role user!');
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      return;
    }

    try {
      const adminKey = getAdminKey();
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminKey}`
        }
      });

      if (response.ok) {
        alert('User berhasil dihapus!');
        fetchSettings();
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Gagal menghapus user!');
    }
  };

  // Generate new session secret
  const generateNewSecret = () => {
    const newSecret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setSessionSettings(prev => ({ ...prev, sessionSecret: newSecret }));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Memuat pengaturan...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Konfigurasi Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sessionMaxAge">Session Max Age (Jam)</Label>
              <Input
                id="sessionMaxAge"
                type="number"
                value={sessionSettings.sessionMaxAge}
                onChange={(e) => setSessionSettings(prev => ({ 
                  ...prev, 
                  sessionMaxAge: parseInt(e.target.value) || 24 
                }))}
                placeholder="24"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Durasi session dalam jam sebelum user harus login ulang
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoGenerateSecret"
                checked={sessionSettings.autoGenerateSecret}
                onChange={(e) => setSessionSettings(prev => ({ 
                  ...prev, 
                  autoGenerateSecret: e.target.checked 
                }))}
              />
              <Label htmlFor="autoGenerateSecret">Auto-generate Session Secret</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="sessionSecret">Session Secret</Label>
            <div className="flex gap-2">
              <Input
                id="sessionSecret"
                type="password"
                value={sessionSettings.sessionSecret}
                onChange={(e) => setSessionSettings(prev => ({ 
                  ...prev, 
                  sessionSecret: e.target.value 
                }))}
                placeholder="Auto-generated atau masukkan manual"
                disabled={sessionSettings.autoGenerateSecret}
              />
              <Button 
                variant="outline" 
                onClick={generateNewSecret}
                disabled={sessionSettings.autoGenerateSecret}
              >
                Generate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Secret key untuk enkripsi session cookies. Jangan bagikan ke siapapun!
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={saveSessionSettings} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Pengaturan Session'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Management Role Petugas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create New User */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Tambah Petugas Baru</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newEmail">Email *</Label>
                <Input
                  id="newEmail"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="petugas@hurtrock.com"
                />
              </div>
              <div>
                <Label htmlFor="newUsername">Username *</Label>
                <Input
                  id="newUsername"
                  value={newUser.username}
                  onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="petugas01"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">Password *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Password minimal 8 karakter"
                />
              </div>
              <div>
                <Label htmlFor="newRole">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="operator">Operator</SelectItem>
                    <SelectItem value="buyer">Buyer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="newFirstName">Nama Depan</Label>
                <Input
                  id="newFirstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="newLastName">Nama Belakang</Label>
                <Input
                  id="newLastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={createUser}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Petugas
              </Button>
            </div>
          </div>

          {/* User List */}
          <div>
            <h3 className="font-semibold mb-4">Daftar Petugas</h3>
            {users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada petugas ditemukan
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value) => updateUserRole(user.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="operator">Operator</SelectItem>
                            <SelectItem value="buyer">Buyer</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "destructive"}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Informasi Sistem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Environment</Label>
              <div className="p-2 bg-muted rounded">
                {process.env.NODE_ENV || 'development'}
              </div>
            </div>
            <div>
              <Label>Server Status</Label>
              <div className="p-2 bg-muted rounded flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Online
              </div>
            </div>
            <div>
              <Label>Database</Label>
              <div className="p-2 bg-muted rounded">
                PostgreSQL (Connected)
              </div>
            </div>
            <div>
              <Label>Session Store</Label>
              <div className="p-2 bg-muted rounded">
                Memory Store (Active)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Payment Configuration Manager Component
function PaymentConfigurationManager() {
  const [config, setConfig] = useState<MidtransConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [formData, setFormData] = useState({
    environment: 'sandbox' as 'sandbox' | 'production',
    serverKey: '',
    clientKey: '',
    merchantId: '',
  });

  // Fetch current configuration
  const fetchConfig = async () => {
    try {
      const adminKey = getAdminKey();
      const response = await fetch('/api/admin/payment/config', {
        headers: {
          'Authorization': `Bearer ${adminKey}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setConfig(data);
          setFormData({
            environment: data.environment,
            serverKey: data.serverKey,
            clientKey: data.clientKey,
            merchantId: data.merchantId || '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching payment config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save configuration
  const saveConfig = async () => {
    if (!formData.serverKey || !formData.clientKey) {
      alert('Server Key dan Client Key harus diisi!');
      return;
    }

    setIsSaving(true);
    try {
      const adminKey = getAdminKey();
      const response = await fetch('/api/admin/payment/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const savedConfig = await response.json();
        setConfig(savedConfig);
        alert('Konfigurasi pembayaran berhasil disimpan!');
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Gagal menyimpan konfigurasi pembayaran!');
    } finally {
      setIsSaving(false);
    }
  };

  // Test connection
  const testConnection = async () => {
    if (!formData.serverKey || !formData.clientKey) {
      alert('Silakan simpan konfigurasi terlebih dahulu!');
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const adminKey = getAdminKey();
      const response = await fetch('/api/admin/payment/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminKey}`
        }
      });

      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestResult({
        success: false,
        message: 'Gagal menguji koneksi: ' + (error as Error).message
      });
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Memuat konfigurasi...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Konfigurasi Midtrans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="environment">Environment</Label>
              <Select 
                value={formData.environment} 
                onValueChange={(value: 'sandbox' | 'production') => 
                  setFormData(prev => ({ ...prev, environment: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                  <SelectItem value="production">Production (Live)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="merchantId">Merchant ID (Opsional)</Label>
              <Input
                id="merchantId"
                value={formData.merchantId}
                onChange={(e) => setFormData(prev => ({ ...prev, merchantId: e.target.value }))}
                placeholder="M123456"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="serverKey">Server Key</Label>
            <Input
              id="serverKey"
              type="password"
              value={formData.serverKey}
              onChange={(e) => setFormData(prev => ({ ...prev, serverKey: e.target.value }))}
              placeholder="SB-Mid-server-xxxxxx"
            />
          </div>

          <div>
            <Label htmlFor="clientKey">Client Key</Label>
            <Input
              id="clientKey"
              value={formData.clientKey}
              onChange={(e) => setFormData(prev => ({ ...prev, clientKey: e.target.value }))}
              placeholder="SB-Mid-client-xxxxxx"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={saveConfig} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Konfigurasi'
              )}
            </Button>

            <Button 
              variant="outline" 
              onClick={testConnection} 
              disabled={isTesting || !config}
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Menguji...
                </>
              ) : (
                'Test Koneksi'
              )}
            </Button>
          </div>

          {testResult && (
            <div className={`flex items-center gap-2 p-3 rounded-md ${
              testResult.success 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span className="text-sm">{testResult.message}</span>
            </div>
          )}

          {config && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                <strong>Status:</strong> {config.isActive ? 'Aktif' : 'Tidak Aktif'} | 
                <strong> Environment:</strong> {config.environment} | 
                <strong> Terakhir diperbarui:</strong> {new Date(config.updatedAt).toLocaleString('id-ID')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// PDF generation function for order labels with pagination
const generateOrderLabel = (order: Order, orderItems: OrderItem[], formatCurrency: (amount: number) => string, locale: string = 'en-US') => {
  const pdf = new jsPDF();
  let yPosition = 20;
  const pageHeight = pdf.internal.pageSize.height;
  const marginBottom = 20;

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - marginBottom) {
      pdf.addPage();
      yPosition = 20;
    }
  };

  // Header
  pdf.setFontSize(20);
  pdf.text('HURTROCK MUSIC STORE', 105, yPosition, { align: 'center' });
  yPosition += 10;
  pdf.setFontSize(16);
  pdf.text('ORDER LABEL', 105, yPosition, { align: 'center' });
  yPosition += 20;

  // Order Info
  checkPageBreak(30);
  pdf.setFontSize(12);
  pdf.text(`Order ID: ${order.id}`, 20, yPosition);
  yPosition += 10;
  pdf.text(`Date: ${new Date(order.createdAt).toLocaleDateString(locale)}`, 20, yPosition);
  yPosition += 10;
  pdf.text(`Status: ${order.orderStatus.toUpperCase()}`, 20, yPosition);
  yPosition += 20;

  // Customer Info
  checkPageBreak(50);
  pdf.setFontSize(14);
  pdf.text('CUSTOMER INFORMATION', 20, yPosition);
  yPosition += 15;
  pdf.setFontSize(12);
  pdf.text(`Name: ${order.customerName}`, 20, yPosition);
  yPosition += 10;
  pdf.text(`Email: ${order.customerEmail}`, 20, yPosition);
  yPosition += 10;
  if (order.customerPhone) {
    pdf.text(`Phone: ${order.customerPhone}`, 20, yPosition);
    yPosition += 10;
  }
  yPosition += 10;

  // Shipping Address
  checkPageBreak(40);
  pdf.setFontSize(14);
  pdf.text('SHIPPING ADDRESS', 20, yPosition);
  yPosition += 15;
  pdf.setFontSize(12);
  const addressLines = pdf.splitTextToSize(order.shippingAddress, 170);
  pdf.text(addressLines, 20, yPosition);
  yPosition += addressLines.length * 5 + 15;

  // Order Items
  checkPageBreak(30);
  pdf.setFontSize(14);
  pdf.text('ORDER ITEMS', 20, yPosition);
  yPosition += 15;
  pdf.setFontSize(10);

  orderItems.forEach((item, index) => {
    checkPageBreak(25);
    pdf.text(`${index + 1}. ${item.productName}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Qty: ${item.quantity}`, 20, yPosition);
    pdf.text(`Price: ${formatCurrency(item.price)}`, 100, yPosition);
    pdf.text(`Total: ${formatCurrency(item.total)}`, 150, yPosition);
    yPosition += 15;
  });

  // Total
  checkPageBreak(30);
  pdf.setFontSize(14);
  pdf.text(`TOTAL: ${formatCurrency(order.total)}`, 20, yPosition);
  yPosition += 15;

  // Tracking number if available
  if (order.trackingNumber) {
    checkPageBreak(15);
    pdf.text(`Tracking: ${order.trackingNumber}`, 20, yPosition);
  }

  // Download the PDF
  pdf.save(`order-label-${order.id}.pdf`);
};

// OrderManagement component
function OrderManagement() {
  const { translations, formatCurrency, language } = useLocalization();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPrintingPdf, setIsPrintingPdf] = useState(false);
  const [printingOrderId, setPrintingOrderId] = useState<string | null>(null);

  // Fetch orders with authentication
  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
    queryFn: async () => {
      const adminKey = getAdminKey();
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${adminKey}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    }
  });

  // Fetch order items for selected order
  const { data: orderItems = [], isLoading: itemsLoading, error: itemsError } = useQuery<OrderItem[]>({
    queryKey: ['/api/admin/orders', selectedOrder?.id, 'items'],
    queryFn: async () => {
      if (!selectedOrder) return [];
      const adminKey = getAdminKey();
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        headers: {
          'Authorization': `Bearer ${adminKey}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch order items');
      }
      const data = await response.json();
      return data.items || [];
    },
    enabled: !!selectedOrder
  });

  // Direct fetch function for PDF generation (state-independent)
  const fetchOrderItemsById = async (orderId: string): Promise<OrderItem[]> => {
    try {
      let adminKey = getAdminKey();
      let response = await fetch(`/api/admin/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${adminKey}`
        }
      });

      // Handle 401/403 - clear admin key and retry once
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('adminKey');
        adminKey = getAdminKey();
        if (!adminKey) {
          throw new Error('Admin authentication required');
        }

        response = await fetch(`/api/admin/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${adminKey}`
          }
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch order items: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching order items:', error);
      throw error;
    }
  };

  // Filter orders based on status
  const filteredOrders = orders.filter(order => 
    statusFilter === 'all' || order.orderStatus === statusFilter
  );

  const handlePrintLabel = async (order: Order) => {
    setIsPrintingPdf(true);
    setPrintingOrderId(order.id);

    try {
      // Fetch order items directly by order ID (state-independent)
      const orderItems = await fetchOrderItemsById(order.id);

      if (!orderItems || orderItems.length === 0) {
        alert('No items found for this order. Cannot generate PDF.');
        return;
      }

      const locale = language === 'id' ? 'id-ID' : 'en-US';
      generateOrderLabel(order, orderItems, formatCurrency, locale);

    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to generate PDF: ${errorMessage}`);
    } finally {
      setIsPrintingPdf(false);
      setPrintingOrderId(null);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const adminKey = getAdminKey();
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });

      if (response.ok) {
        refetchOrders();
        alert('Order status updated successfully');
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'processing': return 'secondary';
      case 'shipped': return 'outline';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  if (ordersLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading orders...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{translations.orderManagement}</CardTitle>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No orders found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {order.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                    </div>
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
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsDetailsOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrintLabel(order)}
                        disabled={printingOrderId === order.id}
                      >
                        <Printer className="h-4 w-4" />
                        {printingOrderId === order.id ? 'Printing...' : ''}
                      </Button>
                      <Select
                        value={order.orderStatus}
                        onValueChange={(value) => handleStatusUpdate(order.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Order ID</Label>
                  <div className="font-mono text-sm">{selectedOrder.id}</div>
                </div>
                <div>
                  <Label>Date</Label>
                  <div>{new Date(selectedOrder.createdAt).toLocaleString('id-ID')}</div>
                </div>
                <div>
                  <Label>Customer</Label>
                  <div>{selectedOrder.customerName}</div>
                </div>
                <div>
                  <Label>Email</Label>
                  <div>{selectedOrder.customerEmail}</div>
                </div>
                <div>
                  <Label>Phone</Label>
                  <div>{selectedOrder.customerPhone || 'N/A'}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={getStatusBadgeVariant(selectedOrder.orderStatus)}>
                    {selectedOrder.orderStatus}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Shipping Address</Label>
                <div className="mt-1 p-2 bg-muted rounded">{selectedOrder.shippingAddress}</div>
              </div>
              <div>
                <Label>Order Items</Label>
                {orderItems.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
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
                )}
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-lg font-semibold">
                  Total: {formatCurrency(selectedOrder.total)}
                </div>
                <Button 
                  onClick={() => handlePrintLabel(selectedOrder)}
                  disabled={isPrintingPdf || itemsLoading}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  {isPrintingPdf ? 'Generating PDF...' : itemsLoading ? 'Loading...' : 'Print Label'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ChatRoomManagement component  
function ChatRoomManagement() {
  const { translations } = useLocalization();
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch chat rooms
  const { data: chatRooms = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/chat/rooms'],
    queryFn: async () => {
      const response = await fetch('/api/chat/rooms');
      if (!response.ok) {
        throw new Error('Failed to fetch chat rooms');
      }
      return response.json();
    }
  });

  // Connect to WebSocket when a room is selected
  const connectToRoom = (roomId: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      ws.send(JSON.stringify({
        type: 'join_room',
        payload: {
          roomId,
          sessionId: 'admin-session',
          userType: 'admin'
        }
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message') {
        setMessages(prev => [...prev, data.payload]);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    wsRef.current = ws;
  };

  // Load messages for selected room
  const loadMessages = async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`);
      if (response.ok) {
        const msgs = await response.json();
        setMessages(msgs);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim() || !wsRef.current || !selectedRoom) return;

    wsRef.current.send(JSON.stringify({
      type: 'send_message',
      payload: {
        senderName: 'Admin',
        message: newMessage.trim()
      }
    }));

    setNewMessage('');
  };

  // Handle room selection
  const handleRoomSelect = (room: any) => {
    setSelectedRoom(room);
    setMessages([]);
    loadMessages(room.id);
    connectToRoom(room.id);
    setIsDetailsOpen(true);
  };

  // Close chat room
  const closeRoom = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setSelectedRoom(null);
    setMessages([]);
    setIsDetailsOpen(false);
    setIsConnected(false);
  };

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'closed': return 'secondary';
      case 'archived': return 'outline';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading chat rooms...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat Room Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chatRooms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No chat rooms yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Message</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chatRooms.map((room: any) => (
                  <TableRow key={room.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{room.customerName}</div>
                        {room.customerEmail && (
                          <div className="text-sm text-muted-foreground">
                            {room.customerEmail}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {room.subject}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(room.status)}>
                        {room.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(room.lastMessageAt || room.createdAt).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRoomSelect(room)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Open Chat
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Chat Room Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {selectedRoom?.subject}
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            </DialogTitle>
            <div className="text-sm text-muted-foreground">
              Chat with {selectedRoom?.customerName}
            </div>
          </DialogHeader>

          {selectedRoom && (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Messages Area */}
              <div className="flex-1 border rounded-lg p-4 mb-4 overflow-y-auto bg-muted/30 min-h-[300px] max-h-[400px]">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No messages yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message: any) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.senderType === 'customer' && (
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4" />
                            </div>
                          </div>
                        )}

                        <div className={`max-w-[70%] rounded-lg p-3 ${
                          message.senderType === 'admin' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-background border'
                        }`}>
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 opacity-70 ${
                            message.senderType === 'admin' 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>

                        {message.senderType === 'admin' && (
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <Bot className="h-4 w-4 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type your response..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !isConnected}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Status: {selectedRoom.status} | 
                  Created: {new Date(selectedRoom.createdAt).toLocaleDateString()}
                </div>
                <Button variant="outline" onClick={closeRoom}>
                  Close Chat
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// CategoryManagement component
function CategoryManagement({ 
  categories: propCategories, 
  onCategoriesUpdate 
}: { 
  categories: Category[], 
  onCategoriesUpdate: () => void 
}) {
  const { translations } = useLocalization();
  const [categories, setCategories] = useState<Category[]>(propCategories);
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state for category
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    slug: ''
  });

  useEffect(() => {
    setCategories(propCategories);
  }, [propCategories]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
      onCategoriesUpdate(); // Notify parent to update its categories
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from name if editing name field
      ...(name === 'name' && {
        slug: value.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim()
      })
    }));
  };

  const resetForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      slug: ''
    });
    setEditingCategory(null);
  };

  const getAdminKey = (): string => {
    let adminKey = localStorage.getItem('adminKey');
    if (!adminKey) {
      adminKey = prompt('Enter admin key for category management:') || '';
      if (adminKey) {
        localStorage.setItem('adminKey', adminKey);
      }
    }
    return adminKey;
  };

  const handleApiError = (response: any, errorData: any) => {
    // Handle specific error cases with localized messages
    if (response?.status === 409) {
      if (errorData.error?.includes('slug already exists')) {
        return translations.categorySlugExists;
      }
      if (errorData.error?.includes('Cannot delete category')) {
        return translations.categoryInUse;
      }
    }
    // Fallback to the error message from server or generic error
    return errorData.error || translations.error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    try {
      const adminKey = getAdminKey();
      if (!adminKey) {
        alert('Admin key required for category management.');
        setLoading(false);
        return;
      }

      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify(categoryForm),
      });

      if (response.ok) {
        // Update categories without full page refresh
        await fetchCategories();
        // Also refresh categories for product form
        await fetchCategories();
        setIsDialogOpen(false);
        resetForm();
        alert(editingCategory ? translations.categoryUpdated : translations.categoryAdded);
      } else {
        // Handle 401/403 by clearing admin key and retrying once
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('adminKey');
          throw new Error('Admin authentication required. Please try again.');
        }
        const errorData = await response.json();
        const localizedError = handleApiError(response, errorData);
        throw new Error(localizedError);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert(`${translations.error}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      slug: category.slug
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(translations.categoryDeleteConfirm)) {
      return;
    }

    try {
      const adminKey = getAdminKey();
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminKey}`
        }
      });

      if (response.ok) {
        await fetchCategories();
        alert(translations.categoryDeleted);
      } else {
        // Handle 401/403 by clearing admin key and retrying once
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('adminKey');
          throw new Error('Admin authentication required. Please try again.');
        }
        const errorData = await response.json();
        const localizedError = handleApiError(response, errorData);
        throw new Error(localizedError);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(`${translations.error}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{translations.categoryManagement}</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} key={editingCategory?.id || 'new'}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                {translations.addCategory}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? translations.editCategory : translations.addCategory}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <Label htmlFor="name">{translations.name}</Label>
                  <Input
                    id="name"
                    name="name"
                    value={categoryForm.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">{translations.description}</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={categoryForm.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">{translations.slug} (URL)</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={categoryForm.slug}
                    onChange={handleInputChange}
                    required
                    placeholder="category-url-slug"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? translations.loading : translations.save}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    {translations.cancel}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {translations.noCategoriesFound}
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      {category.description && (
                        <p className="text-muted-foreground">{category.description}</p>
                      )}
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>{translations.slug}: <code className="bg-muted px-1 rounded">{category.slug}</code></span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state for product
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    categoryId: '',
    stockQuantity: 0,
    isNew: false,
    isSale: false,
    inStock: true,
    images: [] as string[]
  });

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      // Ensure products have date information for sorting
      const productsWithDates = data.map((product: Product) => ({
        ...product,
        createdAt: product.createdAt || new Date().toISOString(),
        updatedAt: product.updatedAt || product.createdAt || new Date().toISOString()
      }));
      setProducts(productsWithDates);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + uploadedImages.length > 5) {
      alert('Maksimal 5 gambar per produk');
      return;
    }

    files.forEach(file => {
      // Validate file size (max 2MB for better compression)
      if (file.size > 2 * 1024 * 1024) {
        alert(`File ${file.name} terlalu besar. Maksimal 2MB per gambar.`);
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} bukan gambar yang valid.`);
        return;
      }

      // Compress and resize image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 800x600)
        let { width, height } = img;
        const maxWidth = 800;
        const maxHeight = 600;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression (0.8 quality)
        const compressedImageUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        // Check compressed size (should be under 1MB as base64)
        if (compressedImageUrl.length > 1.5 * 1024 * 1024) {
          alert(`Gambar ${file.name} masih terlalu besar setelah kompresi. Gunakan gambar yang lebih kecil.`);
          return;
        }

        setUploadedImages(prev => [...prev, compressedImageUrl]);
      };

      // Load image for processing
      const reader = new FileReader();
      reader.onload = (event) => {
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

    // Clear the input to allow re-uploading the same file
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      categoryId: '',
      stockQuantity: 0,
      isNew: false,
      isSale: false,
      inStock: true,
      images: []
    });
    setUploadedImages([]);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!productForm.name.trim()) {
        alert('Nama produk wajib diisi');
        setLoading(false);
        return;
      }

      if (!productForm.categoryId) {
        alert('Kategori produk wajib dipilih');
        setLoading(false);
        return;
      }

      if (!productForm.price || parseFloat(productForm.price) <= 0) {
        alert('Harga produk harus lebih dari 0 IDR');
        setLoading(false);
        return;
      }

      // Validate reasonable IDR price range (minimum 1000 IDR)
      if (parseFloat(productForm.price) < 1000) {
        alert('Harga minimum adalah Rp 1.000');
        setLoading(false);
        return;
      }

      const productData = {
        ...productForm,
        price: productForm.price.toString(),
        originalPrice: productForm.originalPrice || null,
        stockQuantity: Number(productForm.stockQuantity) || 0,
        imageUrl: uploadedImages.length > 0 ? uploadedImages[0] : null, // Use first image as primary
        images: uploadedImages.length > 0 ? uploadedImages : []
      };

      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        await fetchProducts();
        setIsDialogOpen(false);
        resetForm();
        alert(editingProduct ? 'Produk berhasil diperbarui' : 'Produk berhasil ditambahkan');
      } else {
        const errorData = await response.json();
        console.error('Product save error:', errorData);
        
        if (response.status === 413) {
          throw new Error('Ukuran gambar terlalu besar. Gunakan gambar yang lebih kecil atau kurangi jumlah gambar.');
        } else if (response.status === 400) {
          throw new Error(errorData.error || 'Data produk tidak valid. Periksa kembali semua field yang diisi.');
        } else {
          throw new Error(errorData.error || 'Gagal menyimpan produk. Coba lagi beberapa saat.');
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan produk');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      originalPrice: product.originalPrice || '',
      categoryId: product.categoryId,
      stockQuantity: product.stockQuantity || 0,
      isNew: product.isNew || false,
      isSale: product.isSale || false,
      inStock: product.inStock || true,
      images: []
    });
    // Load existing images properly
    const existingImages = [];
    if (product.imageUrl && product.imageUrl.trim()) {
      existingImages.push(product.imageUrl);
    }
    setUploadedImages(existingImages);
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchProducts();
        alert('Produk berhasil dihapus');
      } else {
        throw new Error('Gagal menghapus produk');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Terjadi kesalahan saat menghapus produk');
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Tidak diketahui';
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Search functionality is handled by filtering in real-time
      console.log('Search query:', searchQuery);
    }
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getCategoryName(product.categoryId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-bebas text-4xl text-primary mb-2">
            PANEL ADMIN HURTROCK
          </h1>
          <p className="text-muted-foreground">
            Kelola produk, pesanan, dan pengaturan toko
          </p>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produk
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Kategori
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Pesanan
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analitik
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              💳
              Payment
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold">Manajemen Produk</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="search"
                    placeholder="Cari produk..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyPress={handleSearchKeyPress}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Produk
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nama Produk *</Label>
                          <Input
                            id="name"
                            name="name"
                            value={productForm.name}
                            onChange={handleInputChange}
                            placeholder="Masukkan nama produk"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="categoryId">Kategori *</Label>
                          <Select
                            value={productForm.categoryId}
                            onValueChange={(value) => 
                              setProductForm(prev => ({ ...prev, categoryId: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Deskripsi</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={productForm.description}
                          onChange={handleInputChange}
                          placeholder="Masukkan deskripsi produk"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">Harga (IDR) *</Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            value={productForm.price}
                            onChange={handleInputChange}
                            placeholder="15000000"
                            required
                          />
                          <p className="text-xs text-muted-foreground">Masukkan harga dalam Rupiah (IDR)</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="originalPrice">Harga Asli (IDR)</Label>
                          <Input
                            id="originalPrice"
                            name="originalPrice"
                            type="number"
                            value={productForm.originalPrice}
                            onChange={handleInputChange}
                            placeholder="20000000 (opsional)"
                          />
                          <p className="text-xs text-muted-foreground">Harga sebelum diskon dalam Rupiah</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stockQuantity">Stok</Label>
                          <Input
                            id="stockQuantity"
                            name="stockQuantity"
                            type="number"
                            value={productForm.stockQuantity}
                            onChange={handleInputChange}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* Image Upload */}
                      <div className="space-y-2">
                        <Label>Gambar Produk (Maksimal 5)</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <div className="text-center">
                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-4">
                              <Label htmlFor="images" className="cursor-pointer">
                                <span className="mt-2 block text-sm font-medium text-gray-900">
                                  Klik untuk upload gambar
                                </span>
                                <Input
                                  id="images"
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                />
                              </Label>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                              PNG, JPG hingga 2MB per gambar (akan dikompres otomatis)
                            </p>
                          </div>
                        </div>

                        {/* Preview uploaded images */}
                        {uploadedImages.length > 0 && (
                          <div className="mt-4">
                            <Label className="text-sm font-medium">Preview Gambar ({uploadedImages.length}/5)</Label>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                              {uploadedImages.map((image, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={image}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-20 object-cover rounded-md border border-gray-200"
                                    onError={(e) => {
                                      console.error('Error loading image:', image);
                                      e.currentTarget.src = '/placeholder-image.jpg';
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeImage(index)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                  {index === 0 && (
                                    <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-1 rounded">
                                      Utama
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Status toggles */}
                      <div className="flex gap-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={productForm.isNew}
                            onChange={(e) => 
                              setProductForm(prev => ({ ...prev, isNew: e.target.checked }))
                            }
                          />
                          <span className="text-sm">Produk Baru</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={productForm.isSale}
                            onChange={(e) => 
                              setProductForm(prev => ({ ...prev, isSale: e.target.checked }))
                            }
                          />
                          <span className="text-sm">Sedang Diskon</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={productForm.inStock}
                            onChange={(e) => 
                              setProductForm(prev => ({ ...prev, inStock: e.target.checked }))
                            }
                          />
                          <span className="text-sm">Tersedia</span>
                        </label>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button type="submit" disabled={loading} className="flex-1">
                          {loading ? 'Menyimpan...' : (editingProduct ? 'Update' : 'Simpan')}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Batal
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Products List */}
            <div className="grid gap-4">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? `Tidak ada produk yang ditemukan untuk "${searchQuery}"` : 'Belum ada produk'}
                </div>
              ) : (
                filteredProducts
                  .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
                  .map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <img
                          src={product.imageUrl || '/placeholder-image.jpg'}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-md border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.jpg';
                          }}
                        />
                        <div className="space-y-1">
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {getCategoryName(product.categoryId)}
                          </p>
                          <div className="flex gap-2">
                            <Badge variant="secondary">
                              Rp{parseFloat(product.price).toLocaleString('id-ID')}
                            </Badge>
                            <Badge variant={product.inStock ? "default" : "destructive"}>
                              {product.inStock ? `Stok: ${product.stockQuantity}` : 'Habis'}
                            </Badge>
                            {product.isNew && <Badge variant="outline">Baru</Badge>}
                            {product.isSale && <Badge variant="destructive">Diskon</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <CategoryManagement 
              categories={categories} 
              onCategoriesUpdate={fetchCategories}
            />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <ChatRoomManagement />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analitik Toko</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fitur analitik akan segera hadir...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Configuration Tab */}
          <TabsContent value="payment" className="space-y-6">
            <PaymentConfigurationManager />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <StoreSettingsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}