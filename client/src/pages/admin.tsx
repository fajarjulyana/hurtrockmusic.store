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
  Loader2,
  LinkIcon,
  Users,
  Shield,
  DollarSign,
  Calendar,
  BarChart3,
  Download,
  TrendingDown
} from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

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
  totalAmount: number;
  trackingNumber?: string;
  shippingService?: string; // Added to store shipping service
  shippingCost?: string; // Added for shipping cost in PDF
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
  productPrice?: number; // Added for potential fallback
}

interface MidtransConfig {
  id: string;
  environment: 'sandbox' | 'production';
  serverKey: string;
  clientKey: string;
  merchantId?: string;
  finishRedirectUrl?: string;
  unfinishRedirectUrl?: string;
  errorRedirectUrl?: string;
  notificationUrl?: string;
  recurringNotificationUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions?: Record<string, any>;
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Role Management Component
function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: '{}',
    isActive: true
  });

  // Fetch roles
  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const adminKey = getAdminKey();
      const response = await fetch('/api/admin/roles', {
        headers: { 'Authorization': `Bearer ${adminKey}` }
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      } else {
        console.error('Failed to fetch roles');
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const adminKey = getAdminKey();

      // Parse permissions JSON
      let permissions;
      try {
        permissions = JSON.parse(formData.permissions);
        if (typeof permissions !== 'object' || Array.isArray(permissions)) {
          throw new Error('Permissions must be an object');
        }
      } catch (error) {
        alert('Invalid JSON format in permissions field. Please check the syntax.');
        return;
      }

      const roleData = {
        name: formData.name,
        displayName: formData.displayName,
        description: formData.description,
        permissions,
        isActive: formData.isActive
      };

      const url = editingRole ? `/api/admin/roles/${editingRole.id}` : '/api/admin/roles';
      const method = editingRole ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify(roleData)
      });

      if (response.ok) {
        await fetchRoles();
        resetForm();
        setIsDialogOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save role');
      }
    } catch (error) {
      console.error('Error saving role:', error);
      alert('Error saving role');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      permissions: '{}',
      isActive: true
    });
    setEditingRole(null);
  };

  // Handle edit
  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description || '',
      permissions: JSON.stringify(role.permissions || {}, null, 2),
      isActive: role.isActive
    });
    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (roleId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus role ini?')) {
      return;
    }

    try {
      const adminKey = getAdminKey();
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminKey}` }
      });

      if (response.ok) {
        await fetchRoles();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete role');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      alert('Error deleting role');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Role Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingRole ? 'Edit Role' : 'Add New Role'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., manager, editor"
                  disabled={editingRole?.isSystemRole}
                  required
                />
                {editingRole?.isSystemRole && (
                  <p className="text-xs text-muted-foreground mt-1">
                    System role names cannot be changed
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g., Manager, Content Editor"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the role responsibilities"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="permissions">Permissions (JSON)</Label>
                <Textarea
                  id="permissions"
                  value={formData.permissions}
                  onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
                  placeholder={'{"manage_products": true, "view_analytics": false}'}
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingRole ? 'Update Role' : 'Create Role'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>System Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-mono">{role.name}</TableCell>
                  <TableCell className="font-medium">{role.displayName}</TableCell>
                  <TableCell className="max-w-xs truncate" title={role.description}>
                    {role.description || '-'}
                  </TableCell>
                  <TableCell>
                    {role.isSystemRole ? (
                      <Badge variant="secondary">
                        <Shield className="h-3 w-3 mr-1" />
                        System
                      </Badge>
                    ) : (
                      <Badge variant="outline">Custom</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.isActive ? "default" : "secondary"}>
                      {role.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(role.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(role)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {!role.isSystemRole && (
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(role.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Admin auth helper function
const getAdminKey = (): string => {
  let adminKey = localStorage.getItem('adminKey');
  if (!adminKey) {
    adminKey = prompt('Enter admin key for accessing orders (default: fajar):') || '';
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
  const [adminKeySettings, setAdminKeySettings] = useState({
    newAdminKey: '',
    confirmAdminKey: '',
    currentKey: 'fajar (default)',
    isCustom: false
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
        if (settingsData.adminKey) {
          setAdminKeySettings(prev => ({
            ...prev,
            currentKey: settingsData.adminKey.current || 'fajar (default)',
            isCustom: settingsData.adminKey.isCustom || false
          }));
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

  // Save admin key settings
  const saveAdminKey = async () => {
    if (!adminKeySettings.newAdminKey || adminKeySettings.newAdminKey.length < 6) {
      alert('Admin key harus minimal 6 karakter!');
      return;
    }

    if (adminKeySettings.newAdminKey !== adminKeySettings.confirmAdminKey) {
      alert('Konfirmasi admin key tidak cocok!');
      return;
    }

    setIsSaving(true);
    try {
      const adminKey = getAdminKey();
      const response = await fetch('/api/admin/settings/admin-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify(adminKeySettings)
      });

      if (response.ok) {
        // Update localStorage with new admin key
        localStorage.setItem('adminKey', adminKeySettings.newAdminKey);

        // Reset form
        setAdminKeySettings(prev => ({
          ...prev,
          newAdminKey: '',
          confirmAdminKey: ''
        }));

        alert('Admin key berhasil diperbarui! Gunakan key baru untuk akses selanjutnya.');
        fetchSettings();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update admin key');
      }
    } catch (error) {
      console.error('Error updating admin key:', error);
      alert('Gagal memperbarui admin key: ' + (error as Error).message);
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
      {/* Admin Key Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Konfigurasi Admin Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4" />
              <span className="font-medium">Current Admin Key:</span>
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              {adminKeySettings.currentKey}
              {adminKeySettings.isCustom ? (
                <Badge variant="default" className="ml-2">Custom</Badge>
              ) : (
                <Badge variant="secondary" className="ml-2">Default</Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newAdminKey">New Admin Key</Label>
                <Input
                  id="newAdminKey"
                  type="password"
                  value={adminKeySettings.newAdminKey}
                  onChange={(e) => setAdminKeySettings(prev => ({
                    ...prev,
                    newAdminKey: e.target.value
                  }))}
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div>
                <Label htmlFor="confirmAdminKey">Konfirmasi Admin Key</Label>
                <Input
                  id="confirmAdminKey"
                  type="password"
                  value={adminKeySettings.confirmAdminKey}
                  onChange={(e) => setAdminKeySettings(prev => ({
                    ...prev,
                    confirmAdminKey: e.target.value
                  }))}
                  placeholder="Ulangi admin key baru"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button onClick={saveAdminKey} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Update Admin Key
                  </>
                )}
              </Button>
            </div>

            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>Penting:</strong> Admin key digunakan untuk mengakses semua fitur administratif.
                  Simpan key baru dengan aman dan jangan bagikan ke orang lain.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
    finishRedirectUrl: '',
    unfinishRedirectUrl: '',
    errorRedirectUrl: '',
    notificationUrl: '',
    recurringNotificationUrl: '',
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
            finishRedirectUrl: data.finishRedirectUrl || '',
            unfinishRedirectUrl: data.unfinishRedirectUrl || '',
            errorRedirectUrl: data.errorRedirectUrl || '',
            notificationUrl: data.notificationUrl || '',
            recurringNotificationUrl: data.recurringNotificationUrl || '',
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

          {/* Callback URLs Section */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              URL Callback Midtrans
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Konfigurasikan URL callback untuk menangani respons pembayaran dari Midtrans.
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="finishRedirectUrl">Finish Redirect URL</Label>
                <Input
                  id="finishRedirectUrl"
                  value={formData.finishRedirectUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, finishRedirectUrl: e.target.value }))}
                  placeholder="https://yoursite.com/payment/success"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL yang akan dituju ketika pembayaran berhasil
                </p>
              </div>

              <div>
                <Label htmlFor="unfinishRedirectUrl">Unfinish Redirect URL</Label>
                <Input
                  id="unfinishRedirectUrl"
                  value={formData.unfinishRedirectUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, unfinishRedirectUrl: e.target.value }))}
                  placeholder="https://yoursite.com/payment/pending"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL yang akan dituju ketika pembayaran belum selesai
                </p>
              </div>

              <div>
                <Label htmlFor="errorRedirectUrl">Error Redirect URL</Label>
                <Input
                  id="errorRedirectUrl"
                  value={formData.errorRedirectUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, errorRedirectUrl: e.target.value }))}
                  placeholder="https://yoursite.com/payment/error"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL yang akan dituju ketika terjadi error dalam pembayaran
                </p>
              </div>

              <div>
                <Label htmlFor="notificationUrl">Notification URL</Label>
                <Input
                  id="notificationUrl"
                  value={formData.notificationUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, notificationUrl: e.target.value }))}
                  placeholder="https://yoursite.com/api/payment/notification"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL untuk menerima notifikasi status pembayaran dari Midtrans
                </p>
              </div>

              <div>
                <Label htmlFor="recurringNotificationUrl">Recurring Notification URL</Label>
                <Input
                  id="recurringNotificationUrl"
                  value={formData.recurringNotificationUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, recurringNotificationUrl: e.target.value }))}
                  placeholder="https://yoursite.com/api/payment/recurring-notification"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL untuk notifikasi pembayaran berulang (subscription/recurring)
                </p>
              </div>
            </div>
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

// Analytics Dashboard Component
function AnalyticsDashboard() {
  const { formatCurrency } = useLocalization();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const response = await fetch(`/api/admin/analytics/overview?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const handleExport = async (exportType: string) => {
    try {
      const params = new URLSearchParams({ type: exportType });
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const response = await fetch(`/api/admin/analytics/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Set appropriate filename based on export type
        let filename;
        switch (exportType) {
          case 'daily-transactions':
            filename = `laporan-transaksi-harian-${new Date().toISOString().split('T')[0]}.csv`;
            break;
          case 'item-details':
            filename = `laporan-detail-item-${new Date().toISOString().split('T')[0]}.csv`;
            break;
          default:
            filename = `laporan-pesanan-${new Date().toISOString().split('T')[0]}.csv`;
        }

        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Gagal mengekspor data');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Gagal memuat data analitik</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analitik Toko</h2>
          <p className="text-muted-foreground">Dashboard lengkap performa bisnis</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-2">
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-auto"
            />
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-auto"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleExport('orders')} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Pesanan
            </Button>
            <Button onClick={() => handleExport('daily-transactions')} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Harian
            </Button>
            <Button onClick={() => handleExport('item-details')} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Detail Item
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Total Pendapatan</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(analyticsData.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Rata-rata: {formatCurrency(analyticsData.averageOrderValue)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Keuntungan</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(analyticsData.profit)}
              </div>
              <p className="text-xs text-muted-foreground">
                Margin: {analyticsData.profitMargin.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Pesanan Berhasil</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-green-600">
                {analyticsData.totalPaidOrders}
              </div>
              <p className="text-xs text-muted-foreground">
                Total: {analyticsData.totalOrders} pesanan
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Pesanan Gagal</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-red-600">
                {analyticsData.totalFailedOrders}
              </div>
              <p className="text-xs text-muted-foreground">
                Rate: {analyticsData.totalOrders > 0 ? ((analyticsData.totalFailedOrders / analyticsData.totalOrders) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Tren Pendapatan Bulanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <div className="grid grid-cols-6 gap-2 h-full">
              {analyticsData.monthlyRevenue.map((month: any, index: number) => (
                <div key={index} className="flex flex-col items-center justify-end">
                  <div className="text-xs mb-2 font-medium">
                    {formatCurrency(month.revenue)}
                  </div>
                  <div
                    className="bg-blue-500 w-full rounded-t"
                    style={{
                      height: `${Math.max((month.revenue / Math.max(...analyticsData.monthlyRevenue.map((m: any) => m.revenue))) * 200, 5)}px`
                    }}
                  />
                  <div className="text-xs mt-1 text-center">
                    <div>{month.month}</div>
                    <div className="text-muted-foreground">{month.orders} orders</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Selling Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Produk Terlaris
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead>Terjual</TableHead>
                <TableHead>Pendapatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyticsData.topSellingProducts.map((product: any, index: number) => (
                <TableRow key={product.productId}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="font-medium">{product.productName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {product.totalQuantity} unit
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(product.totalRevenue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Profit Loss Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ringkasan Keuntungan & Kerugian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Total Pendapatan</Label>
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(analyticsData.totalRevenue)}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Estimasi Biaya</Label>
              <div className="text-lg font-bold text-orange-600">
                {formatCurrency(analyticsData.estimatedCosts)}
              </div>
              <p className="text-xs text-muted-foreground">70% dari pendapatan</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Keuntungan Bersih</Label>
              <div className={`text-lg font-bold ${analyticsData.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(analyticsData.profit)}
              </div>
              <p className="text-xs text-muted-foreground">
                Margin: {analyticsData.profitMargin.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// PDF generation function for order labels with Indonesian formatting
const generateOrderLabel = (order: Order, orderItems: OrderItem[], formatCurrency: (amount: number) => string, locale: string = 'id-ID') => {
  const pdf = new jsPDF();
  let yPosition = 20;
  const pageHeight = pdf.internal.pageSize.height;
  const marginBottom = 20;
  const leftMargin = 15;

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - marginBottom) {
      pdf.addPage();
      yPosition = 20;
    }
  };

  // Header dengan logo toko dan informasi
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(1);
  pdf.rect(10, 10, 190, 60);

  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('HURTROCK MUSIC STORE', 105, 25, { align: 'center' });

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Spesialis Alat Musik Profesional dan Vintage', 105, 35, { align: 'center' });
  pdf.text('Jl. Gegerkalong Girang Complex Darut Tauhid Kav 22', 105, 42, { align: 'center' });
  pdf.text('Gegerkalong, Setiabudhi, Bandung Utara', 105, 49, { align: 'center' });
  pdf.text('Kota Bandung, Jawa Barat 40153 | Telp: 0821-1555-8035', 105, 56, { align: 'center' });

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SURAT JALAN PESANAN', 105, 65, { align: 'center' });

  yPosition = 80;

  // Informasi Pesanan dan Pelanggan dalam dua kolom
  checkPageBreak(60);

  // Kolom kiri - Informasi Pesanan
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.5);
  pdf.rect(leftMargin, yPosition, 85, 55);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INFORMASI PESANAN', leftMargin + 2, yPosition + 10);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`No. Pesanan:`, leftMargin + 2, yPosition + 20);
  pdf.text(`${order.id.substring(0, 16)}...`, leftMargin + 2, yPosition + 26);

  pdf.text(`Tanggal Pesanan:`, leftMargin + 2, yPosition + 35);
  pdf.text(`${new Date(order.createdAt).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })}`, leftMargin + 2, yPosition + 41);

  pdf.text(`Status Pesanan: ${order.orderStatus === 'pending' ? 'Menunggu' :
    order.orderStatus === 'processing' ? 'Diproses' :
    order.orderStatus === 'shipped' ? 'Dikirim' :
    order.orderStatus === 'delivered' ? 'Diterima' : 'Dibatalkan'}`, leftMargin + 2, yPosition + 50);

  // Kolom kanan - Informasi Pelanggan
  const rightColumnX = leftMargin + 90;
  pdf.rect(rightColumnX, yPosition, 95, 55);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INFORMASI PELANGGAN', rightColumnX + 2, yPosition + 10);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Nama: ${order.customerName}`, rightColumnX + 2, yPosition + 20);
  pdf.text(`Email: ${order.customerEmail}`, rightColumnX + 2, yPosition + 26);

  if (order.customerPhone) {
    pdf.text(`Telepon: ${order.customerPhone}`, rightColumnX + 2, yPosition + 32);
  }

  if (order.paymentStatus) {
    pdf.text(`Status Bayar: ${order.paymentStatus === 'paid' ? 'LUNAS' :
      order.paymentStatus === 'pending' ? 'MENUNGGU' : 'GAGAL'}`, rightColumnX + 2, yPosition + 38);
  }

  if (order.trackingNumber) {
    pdf.text(`No. Resi: ${order.trackingNumber}`, rightColumnX + 2, yPosition + 44);
  }

  yPosition += 65;

  // Alamat Pengiriman
  checkPageBreak(50);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ALAMAT PENGIRIMAN', leftMargin, yPosition);
  yPosition += 8;

  const addressBoxHeight = 40;
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.3);
  pdf.rect(leftMargin, yPosition, 180, addressBoxHeight);

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');

  const addressText = order.shippingAddress || 'Alamat tidak tersedia';
  const addressLines = pdf.splitTextToSize(addressText, 175);

  let addressY = yPosition + 8;
  addressLines.forEach((line: string) => {
    pdf.text(line, leftMargin + 3, addressY);
    addressY += 6;
  });

  if (order.shippingService) {
    addressY += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Jasa Pengiriman: ${order.shippingService}`, leftMargin + 3, addressY);
  }

  yPosition += addressBoxHeight + 15;

  // Daftar Produk
  checkPageBreak(60);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`DAFTAR PRODUK PESANAN (${orderItems.length} item)`, leftMargin, yPosition);
  yPosition += 10;

  // Header tabel
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.5);
  pdf.rect(leftMargin, yPosition, 180, 15);
  pdf.setFillColor(240, 240, 240);
  pdf.rect(leftMargin, yPosition, 180, 15, 'F');

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('No', leftMargin + 3, yPosition + 10);
  pdf.text('Nama Produk', leftMargin + 18, yPosition + 10);
  pdf.text('Qty', leftMargin + 110, yPosition + 10);
  pdf.text('Harga Satuan', leftMargin + 125, yPosition + 10);
  pdf.text('Total', leftMargin + 165, yPosition + 10);
  yPosition += 15;

  pdf.setFont('helvetica', 'normal');
  let subtotal = 0;

  if (orderItems.length === 0) {
    // Jika tidak ada item, tampilkan pesan
    const rowHeight = 25;
    pdf.rect(leftMargin, yPosition, 180, rowHeight);
    pdf.setFontSize(10);
    pdf.text('Tidak ada produk dalam pesanan ini', leftMargin + 80, yPosition + 15, { align: 'center' });
    yPosition += rowHeight;
  } else {
    orderItems.forEach((item, index) => {
      checkPageBreak(20);
      const itemPrice = item.price || item.productPrice || 0;
      const itemTotal = item.total || (itemPrice * item.quantity);
      subtotal += itemTotal;

      const rowHeight = 18;
      pdf.rect(leftMargin, yPosition, 180, rowHeight);

      pdf.setFontSize(9);
      pdf.text(`${index + 1}`, leftMargin + 3, yPosition + 12);

      // Nama produk dengan word wrap
      const productNameLines = pdf.splitTextToSize(item.productName, 85);
      pdf.text(productNameLines[0], leftMargin + 18, yPosition + 8);
      if (productNameLines.length > 1) {
        pdf.text(productNameLines[1], leftMargin + 18, yPosition + 14);
      }

      pdf.text(`${item.quantity}`, leftMargin + 112, yPosition + 12);

      // Format harga dalam Rupiah
      const priceText = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(itemPrice);
      pdf.text(priceText, leftMargin + 125, yPosition + 12);

      const totalText = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(itemTotal);
      pdf.text(totalText, leftMargin + 165, yPosition + 12);

      yPosition += rowHeight;
    });
  }

  // Total pembayaran
  checkPageBreak(50);
  yPosition += 10;
  const summaryStartX = leftMargin + 110;

  // Garis pembatas
  pdf.setLineWidth(0.3);
  pdf.line(summaryStartX, yPosition, summaryStartX + 80, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Subtotal Produk:', summaryStartX, yPosition);
  const subtotalText = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(subtotal);
  pdf.text(subtotalText, summaryStartX + 45, yPosition);
  yPosition += 8;

  // Tampilkan ongkir jika ada
  if (order.shippingCost && parseFloat(order.shippingCost) > 0) {
    pdf.text('Ongkos Kirim:', summaryStartX, yPosition);
    const shippingText = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(parseFloat(order.shippingCost));
    pdf.text(shippingText, summaryStartX + 45, yPosition);
    yPosition += 8;
  }

  // PPN jika ada
  const ppn = subtotal * 0.11; // PPN 11% Indonesia
  if (ppn > 0) {
    pdf.text('PPN (11%):', summaryStartX, yPosition);
    const ppnText = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(ppn);
    pdf.text(ppnText, summaryStartX + 45, yPosition);
    yPosition += 8;
  }

  // Garis pembatas sebelum total
  pdf.setLineWidth(0.5);
  pdf.line(summaryStartX, yPosition, summaryStartX + 80, yPosition);
  yPosition += 8;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TOTAL PEMBAYARAN:', summaryStartX, yPosition);
  const totalText = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(parseFloat(order.totalAmount));
  pdf.text(totalText, summaryStartX + 45, yPosition);
  yPosition += 25;

  // Area tanda tangan
  checkPageBreak(60);

  const signatureY = yPosition;

  // Kolom kiri - Pengirim
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PENGIRIM', leftMargin, signatureY);
  pdf.setLineWidth(0.3);
  pdf.rect(leftMargin, signatureY + 5, 80, 35);

  pdf.setFont('helvetica', 'normal');
  pdf.text('HURTROCK MUSIC STORE', leftMargin + 3, signatureY + 15);
  pdf.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, leftMargin + 3, signatureY + 25);
  pdf.text('', leftMargin + 3, signatureY + 32);
  pdf.text('( _________________ )', leftMargin + 3, signatureY + 37);
  pdf.text('Tanda Tangan & Stempel', leftMargin + 3, signatureY + 42);

  // Kolom kanan - Penerima
  pdf.setFont('helvetica', 'bold');
  pdf.text('PENERIMA', leftMargin + 100, signatureY);
  pdf.rect(leftMargin + 100, signatureY + 5, 80, 35);

  pdf.setFont('helvetica', 'normal');
  pdf.text(`Nama: ${order.customerName}`, leftMargin + 103, signatureY + 15);
  pdf.text(`Tanggal: ___/___/______`, leftMargin + 103, signatureY + 25);
  pdf.text('', leftMargin + 103, signatureY + 32);
  pdf.text('( _________________ )', leftMargin + 103, signatureY + 37);
  pdf.text('Tanda Tangan Penerima', leftMargin + 103, signatureY + 42);

  yPosition = signatureY + 50;

  // Footer informasi
  checkPageBreak(25);
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.2);
  pdf.line(leftMargin, yPosition, 195, yPosition);
  yPosition += 8;

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Terima kasih telah berbelanja di Hurtrock Music Store!', 105, yPosition, { align: 'center' });
  yPosition += 4;
  pdf.text('Untuk keperluan garansi dan layanan purna jual, mohon simpan surat jalan ini dengan baik.', 105, yPosition, { align: 'center' });
  yPosition += 4;
  pdf.text('Hotline Customer Service: 0821-1555-8035', 105, yPosition, { align: 'center' });
  yPosition += 6;
  pdf.text(`Dokumen dicetak pada: ${new Date().toLocaleDateString('id-ID')} pukul ${new Date().toLocaleTimeString('id-ID')}`, 105, yPosition, { align: 'center' });

  // Download PDF dengan nama file yang lebih deskriptif
  const orderDate = new Date(order.createdAt).toLocaleDateString('id-ID').replace(/\//g, '');
  const fileName = `SuratJalan-${order.customerName.replace(/\s+/g, '')}-${order.id.substring(0, 8)}-${orderDate}.pdf`;
  pdf.save(fileName);
};

// OrderManagement component
function OrderManagement() {
  const { translations, formatCurrency, language } = useLocalization();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPrintingPdf, setIsPrintingPdf] = useState(false);
  const [printingOrderId, setPrintingOrderId] = useState<string | null>(null);

  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printOrder, setPrintOrder] = useState<any>(null);
  const [printOrderItems, setPrintOrderItems] = useState<any[]>([]);

  // State for tracking modal
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [trackingFormData, setTrackingFormData] = useState({
    trackingNumber: '',
    shippingService: '',
  });

  // Helper to get shipping service based on order data
  const getShippingServiceFromOrder = (order: Order): string => {
    if (order.shippingService) {
      return order.shippingService;
    }
    // Fallback or default logic if shippingService is not available
    return 'JNE'; // Default to JNE or another common service
  };

  // Helper to generate tracking URL
  const generateTrackingUrl = (trackingNumber: string, shippingService: string): string => {
    const service = shippingService.toLowerCase();
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

  // Function to open the tracking edit modal
  const openTrackingModal = (order: Order) => {
    setTrackingOrder(order);
    setTrackingFormData({
      trackingNumber: order.trackingNumber || '',
      shippingService: order.shippingService || getShippingServiceFromOrder(order),
    });
    setIsTrackingModalOpen(true);
  };

  // Function to handle update of tracking info
  const handleUpdateTrackingInfo = async () => {
    if (!trackingOrder) {
      alert('Pesanan tidak ditemukan.');
      return;
    }

    if (!trackingFormData.trackingNumber.trim()) {
      alert('Nomor resi wajib diisi.');
      return;
    }

    if (!trackingFormData.shippingService) {
      alert('Jasa pengiriman wajib dipilih.');
      return;
    }

    try {
      const adminKey = getAdminKey();
      const response = await fetch(`/api/admin/orders/${trackingOrder.id}/tracking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify({
          trackingNumber: trackingFormData.trackingNumber.trim(),
          shippingService: trackingFormData.shippingService,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert('Informasi tracking berhasil diperbarui dan status pesanan diubah menjadi "Shipped"!');
        
        // Refetch orders to reflect the changes
        refetchOrders();
        
        // Close the modal
        setIsTrackingModalOpen(false);
        
        // Update selectedOrder state if it's open
        if (selectedOrder && selectedOrder.id === trackingOrder.id) {
          setSelectedOrder({
            ...selectedOrder,
            trackingNumber: trackingFormData.trackingNumber.trim(),
            shippingService: trackingFormData.shippingService,
            orderStatus: 'shipped'
          });
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal memperbarui informasi tracking.');
      }
    } catch (error) {
      console.error('Error updating tracking info:', error);
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat memperbarui informasi tracking.');
    }
  };


  const handlePrintLabel = (order: any, orderItems: any[]) => {
    setPrintOrder(order);
    setPrintOrderItems(orderItems);
    setShowPrintPreview(true);
  };

  const generatePDF = (order: any, orderItems: any[]) => {
    try {
      const pdf = new jsPDF();
      let yPosition = 20;

      // Helper function to check if we need a new page
      const checkPageBreak = (neededHeight: number) => {
        if (yPosition + neededHeight > 280) {
          pdf.addPage();
          yPosition = 20;
        }
      };

      // Header with logo placeholder
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text('HURTROCK MUSIC STORE', 20, yPosition);
      yPosition += 8;
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text('Your Music, Our Passion - Professional Music Instruments Store', 20, yPosition);
      yPosition += 6;
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('ORDER SHIPPING LABEL', 20, yPosition);
      yPosition += 20;

      // Order Info Section
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('ORDER INFORMATION', 20, yPosition);
      yPosition += 12;
      pdf.setFont(undefined, 'normal');
      pdf.text(`Order ID: ${order.id}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('id-ID')}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Order Status: ${order.orderStatus.toUpperCase()}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, 20, yPosition);
      if (order.trackingNumber) {
        yPosition += 8;
        pdf.text(`Tracking Number: ${order.trackingNumber}`, 20, yPosition);
      }
      yPosition += 20;

      // Customer Info
      checkPageBreak(50);
      pdf.setFont(undefined, 'bold');
      pdf.text('CUSTOMER INFORMATION', 20, yPosition);
      yPosition += 12;
      pdf.setFont(undefined, 'normal');
      pdf.text(`Name: ${order.customerName}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Email: ${order.customerEmail}`, 20, yPosition);
      yPosition += 8;
      if (order.customerPhone) {
        pdf.text(`Phone: ${order.customerPhone}`, 20, yPosition);
        yPosition += 8;
      }
      yPosition += 12;

      // Shipping Address
      checkPageBreak(50);
      pdf.setFont(undefined, 'bold');
      pdf.text('SHIPPING ADDRESS', 20, yPosition);
      yPosition += 12;
      pdf.setFont(undefined, 'normal');
      const addressLines = pdf.splitTextToSize(order.shippingAddress || 'No shipping address provided', 170);
      pdf.text(addressLines, 20, yPosition);
      yPosition += addressLines.length * 5 + 15;

      // Order Items
      checkPageBreak(40);
      pdf.setFont(undefined, 'bold');
      pdf.text(`ORDER ITEMS (${orderItems.length} items)`, 20, yPosition);
      yPosition += 12;

      // Table header
      pdf.setFont(undefined, 'bold');
      pdf.setFontSize(10);
      pdf.text('No.', 20, yPosition);
      pdf.text('Product Name', 35, yPosition);
      pdf.text('Qty', 120, yPosition);
      pdf.text('Price', 140, yPosition);
      pdf.text('Total', 170, yPosition);
      yPosition += 8;

      // Draw line under header
      pdf.line(20, yPosition, 190, yPosition);
      yPosition += 8;

      // Table rows
      pdf.setFont(undefined, 'normal');
      orderItems.forEach((item, index) => {
        checkPageBreak(25);
        pdf.text(`${index + 1}.`, 20, yPosition);
        const productName = pdf.splitTextToSize(item.productName, 80);
        pdf.text(productName, 35, yPosition);
        pdf.text(`${item.quantity}`, 120, yPosition);
        pdf.text(formatCurrency(item.price || item.productPrice || 0), 140, yPosition);
        pdf.text(formatCurrency(item.total || (item.price || item.productPrice || 0) * item.quantity), 170, yPosition);
        yPosition += Math.max(8, productName.length * 5);
      });

      // Draw line before total
      yPosition += 5;
      pdf.line(20, yPosition, 190, yPosition);
      yPosition += 10;

      // Total calculations
      const subtotal = orderItems.reduce((sum, item) => sum + (item.total || (item.price || item.productPrice || 0) * item.quantity), 0);
      const tax = subtotal * 0.08;

      pdf.setFont(undefined, 'normal');
      pdf.text('Subtotal:', 140, yPosition);
      pdf.text(formatCurrency(subtotal), 170, yPosition);
      yPosition += 8;
      pdf.text('Tax (8%):', 140, yPosition);
      pdf.text(formatCurrency(tax), 170, yPosition);
      yPosition += 8;
      pdf.setFont(undefined, 'bold');
      pdf.text('TOTAL:', 140, yPosition);
      pdf.text(formatCurrency(order.totalAmount), 170, yPosition);
      yPosition += 20;

      // Footer
      checkPageBreak(30);
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'normal');
      pdf.text('Thank you for shopping with Hurtrock Music Store!', 20, yPosition);
      yPosition += 5;
      pdf.text(`Document generated on: ${new Date().toLocaleString('id-ID')}`, 20, yPosition);

      // Download the PDF
      pdf.save(`hurtrock-order-${order.id}.pdf`);
      setShowPrintPreview(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + (error as Error).message);
    }
  };

  // Fetch orders with authentication
  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders, error: ordersError } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
    queryFn: async () => {
      try {
        let adminKey = getAdminKey();
        let response = await fetch('/api/admin/orders', {
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

          response = await fetch('/api/admin/orders', {
            headers: {
              'Authorization': `Bearer ${adminKey}`
            }
          });
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status}`);
        }

        const data = await response.json();
        console.log('Orders fetched successfully:', data.length);
        return data;
      } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  });

  // Fetch order items for selected order
  const { data: orderItems = [], isLoading: itemsLoading, error: itemsError } = useQuery<OrderItem[]>({
    queryKey: ['/api/admin/orders', selectedOrder?.id, 'items'],
    queryFn: async () => {
      if (!selectedOrder) return [];
      try {
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
      } catch (error) {
        console.error('Error fetching order items:', error);
        return [];
      }
    },
    enabled: !!selectedOrder,
    retry: 1
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
  const filteredOrders = Array.isArray(orders) ? orders.filter(order =>
    statusFilter === 'all' || order.orderStatus === statusFilter
  ) : [];

  const handlePrintLabelAction = async (order: Order) => {
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

  // Error handling
  if (ordersError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading orders: {(ordersError as Error).message}</p>
            <Button onClick={() => refetchOrders()} className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (ordersLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            Loading orders...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Order Management</CardTitle>
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
          {!Array.isArray(orders) ? (
            <div className="text-center py-8 text-muted-foreground">
              Invalid orders data format
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {orders.length === 0 ? 'No orders found' : 'No orders match the selected filter'}
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
                        {order.trackingNumber && (
                          <div className="text-xs text-blue-600 font-mono">
                            Resi: {order.trackingNumber}
                          </div>
                        )}
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
                      {formatCurrency(order.totalAmount)}
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
                          onClick={() => handlePrintLabel(order, orderItems)}
                          disabled={printingOrderId === order.id || itemsLoading}
                        >
                          <Printer className="h-4 w-4" />
                          {printingOrderId === order.id ? 'Printing...' : ''}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openTrackingModal(order)}
                          className="bg-blue-50 hover:bg-blue-100"
                        >
                          <LinkIcon className="h-4 w-4" />
                          Resi
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
      </Card>

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
                {selectedOrder.trackingNumber ? (
                  <div>
                    <Label>Informasi Pengiriman</Label>
                    <div className="space-y-3 mt-2">
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-800">Jasa Pengiriman</span>
                          <Badge variant="outline" className="text-green-700 border-green-300">
                            {selectedOrder.shippingService || 'Kurir'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-800">Nomor Resi</span>
                          <code className="font-mono text-sm bg-white px-2 py-1 rounded border">
                            {selectedOrder.trackingNumber}
                          </code>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={generateTrackingUrl(selectedOrder.trackingNumber, getShippingServiceFromOrder(selectedOrder))}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button variant="outline" size="sm" className="w-full">
                            <LinkIcon className="h-3 w-3 mr-2" />
                            Lacak via {getShippingServiceFromOrder(selectedOrder)}
                          </Button>
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openTrackingModal(selectedOrder)}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit Resi
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label>Informasi Pengiriman</Label>
                    <div className="mt-2">
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm font-medium text-yellow-800">Belum ada resi</span>
                        </div>
                        <p className="text-xs text-yellow-700 mb-3">
                          Pesanan ini belum memiliki nomor resi pengiriman
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openTrackingModal(selectedOrder)}
                          className="w-full"
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Input Resi Pengiriman
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label>Shipping Address</Label>
                <div className="mt-1 p-2 bg-muted rounded">{selectedOrder.shippingAddress}</div>
              </div>
              <div>
                <Label>Order Items</Label>
                {orderItems.length > 0 ? (
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
                        <TableRow key={item.id || item.productId}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.price || item.productPrice || 0)}</TableCell>
                          <TableCell>{formatCurrency(item.total || (item.price || item.productPrice || 0) * item.quantity)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-sm text-muted-foreground">No items found</div>
                )}
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-lg font-semibold">
                  Total: {formatCurrency(selectedOrder.totalAmount)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePrintLabel(selectedOrder, orderItems)}
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

      {/* Order Tracking Update Modal */}
      <Dialog open={isTrackingModalOpen} onOpenChange={setIsTrackingModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Input Resi Pengiriman
            </DialogTitle>
          </DialogHeader>
          {trackingOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm font-medium">Pesanan #{trackingOrder.orderId?.substring(0, 8)}...</div>
                <div className="text-sm text-muted-foreground">{trackingOrder.customerName}</div>
                <div className="text-xs text-muted-foreground">{trackingOrder.customerEmail}</div>
              </div>

              {/* Tracking Number Input */}
              <div className="space-y-2">
                <Label htmlFor="trackingNumber" className="text-sm font-medium">
                  Nomor Resi *
                </Label>
                <Input
                  id="trackingNumber"
                  value={trackingFormData.trackingNumber}
                  onChange={(e) => setTrackingFormData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                  placeholder="Contoh: JNE12345678901234"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Masukkan nomor resi yang diberikan oleh jasa pengiriman
                </p>
              </div>

              {/* Shipping Service Select */}
              <div className="space-y-2">
                <Label htmlFor="shippingService" className="text-sm font-medium">
                  Jasa Pengiriman *
                </Label>
                <Select
                  value={trackingFormData.shippingService}
                  onValueChange={(value) => setTrackingFormData(prev => ({ ...prev, shippingService: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jasa pengiriman" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JNE">JNE - Jalur Nugraha Ekakurir</SelectItem>
                    <SelectItem value="POS Indonesia">POS Indonesia</SelectItem>
                    <SelectItem value="TIKI">TIKI - Titipan Kilat</SelectItem>
                    <SelectItem value="SiCepat">SiCepat Express</SelectItem>
                    <SelectItem value="Anteraja">Anteraja</SelectItem>
                    <SelectItem value="J&T">J&T Express</SelectItem>
                    <SelectItem value="Ninja Xpress">Ninja Xpress</SelectItem>
                    <SelectItem value="Lion Parcel">Lion Parcel</SelectItem>
                    <SelectItem value="SAP Express">SAP Express</SelectItem>
                    <SelectItem value="RPX">RPX (Repex Cargo)</SelectItem>
                    <SelectItem value="ID Express">ID Express</SelectItem>
                    <SelectItem value="Wahana">Wahana Prestasi Logistik</SelectItem>
                    <SelectItem value="Kurir Toko">Kurir Toko Sendiri</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Pilih sesuai dengan jasa pengiriman yang digunakan
                </p>
              </div>

              {/* Current Status Info */}
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium">Status saat ini: {trackingOrder.orderStatus}</span>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  Setelah input resi, status akan otomatis berubah menjadi "Shipped"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsTrackingModalOpen(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button 
                  onClick={handleUpdateTrackingInfo}
                  className="flex-1"
                  disabled={!trackingFormData.trackingNumber.trim() || !trackingFormData.shippingService}
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Simpan Resi
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Preview Dialog */}
      <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Print Preview - Order Label</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            {printOrder && (
              <div className="space-y-6 p-4 bg-white text-black">
                {/* Header */}
                <div className="text-center border-b pb-4">
                  <h1 className="text-2xl font-bold">HURTROCK MUSIC STORE</h1>
                  <p className="text-sm text-gray-600">Your Music, Our Passion - Professional Music Instruments Store</p>
                  <h2 className="text-lg font-semibold mt-2">ORDER SHIPPING LABEL</h2>
                </div>

                {/* Order Information */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">ORDER INFORMATION</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Order ID:</strong> {printOrder.id}</p>
                      <p><strong>Order Date:</strong> {new Date(printOrder.createdAt).toLocaleDateString('id-ID')}</p>
                      <p><strong>Order Status:</strong> {printOrder.orderStatus.toUpperCase()}</p>
                      <p><strong>Payment Status:</strong> {printOrder.paymentStatus.toUpperCase()}</p>
                      {printOrder.trackingNumber && (
                        <p><strong>Tracking Number:</strong> {printOrder.trackingNumber}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">CUSTOMER INFORMATION</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {printOrder.customerName}</p>
                      <p><strong>Email:</strong> {printOrder.customerEmail}</p>
                      {printOrder.customerPhone && (
                        <p><strong>Phone:</strong> {printOrder.customerPhone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold mb-2">SHIPPING ADDRESS</h3>
                  <div className="p-3 bg-gray-50 rounded border text-sm">
                    {printOrder.shippingAddress || 'No shipping address provided'}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-2">ORDER ITEMS ({printOrderItems.length} items)</h3>
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left">No.</th>
                        <th className="border border-gray-300 p-2 text-left">Product Name</th>
                        <th className="border border-gray-300 p-2 text-center">Qty</th>
                        <th className="border border-gray-300 p-2 text-right">Price</th>
                        <th className="border border-gray-300 p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {printOrderItems.map((item, index) => (
                        <tr key={item.id || index}>
                          <td className="border border-gray-300 p-2">{index + 1}</td>
                          <td className="border border-gray-300 p-2">{item.productName}</td>
                          <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                          <td className="border border-gray-300 p-2 text-right">{formatCurrency(item.price || item.productPrice || 0)}</td>
                          <td className="border border-gray-300 p-2 text-right font-semibold">{formatCurrency(item.total || (item.price || item.productPrice || 0) * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals */}
                  <div className="mt-4 border-t pt-4">
                    <div className="flex justify-end space-y-1">
                      <div className="w-64">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(printOrderItems.reduce((sum, item) => sum + (item.total || (item.price || item.productPrice || 0) * item.quantity), 0))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax (8%):</span>
                          <span>{formatCurrency(printOrderItems.reduce((sum, item) => sum + (item.total || (item.price || item.productPrice || 0) * item.quantity), 0) * 0.08)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>TOTAL:</span>
                          <span>{formatCurrency(printOrder.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-gray-500 border-t pt-4">
                  <p>Thank you for shopping with Hurtrock Music Store!</p>
                  <p>Document generated on: {new Date().toLocaleString('id-ID')}</p>
                </div>
              </div>
            )}
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowPrintPreview(false)}>
              Cancel
            </Button>
            <Button onClick={() => generatePDF(printOrder, printOrderItems)}>
              <Printer className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
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
        alert(editingProduct ? translations.categoryUpdated : translations.categoryAdded);
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
          <TabsList className="grid w-full grid-cols-8">
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
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Roles
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
            <AnalyticsDashboard />
          </TabsContent>

          {/* Payment Configuration Tab */}
          <TabsContent value="payment" className="space-y-6">
            <PaymentConfigurationManager />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <StoreSettingsManager />
          </TabsContent>

          {/* Role Management Tab */}
          <TabsContent value="roles" className="space-y-6">
            <RoleManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}