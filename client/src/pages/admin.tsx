import { useState, useEffect } from 'react';
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
  Filter
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

// CategoryManagement component
function CategoryManagement() {
  const { translations } = useLocalization();
  const [categories, setCategories] = useState<Category[]>([]);
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
    fetchCategories();
  }, []);

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
    setLoading(true);

    try {
      const adminKey = getAdminKey();
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    onClick={() => setIsDialogOpen(false)}
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
      setProducts(data);
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
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setUploadedImages(prev => [...prev, imageUrl]);
      };
      reader.readAsDataURL(file);
    });
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
      const productData = {
        ...productForm,
        price: productForm.price.toString(),
        originalPrice: productForm.originalPrice || null,
        stockQuantity: Number(productForm.stockQuantity),
        imageUrl: uploadedImages[0] || '', // Use first image as primary
        images: uploadedImages
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
        throw new Error('Gagal menyimpan produk');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Terjadi kesalahan saat menyimpan produk');
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
    setUploadedImages(product.imageUrl ? [product.imageUrl] : []);
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
          <TabsList className="grid w-full grid-cols-5">
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
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analitik
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manajemen Produk</h2>
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
                        <Label htmlFor="price">Harga *</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          value={productForm.price}
                          onChange={handleInputChange}
                          placeholder="0"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="originalPrice">Harga Asli</Label>
                        <Input
                          id="originalPrice"
                          name="originalPrice"
                          type="number"
                          value={productForm.originalPrice}
                          onChange={handleInputChange}
                          placeholder="0 (opsional)"
                        />
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
                            PNG, JPG, GIF hingga 10MB per gambar
                          </p>
                        </div>
                      </div>

                      {/* Preview uploaded images */}
                      {uploadedImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-4">
                          {uploadedImages.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={image}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-20 object-cover rounded-md"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={() => removeImage(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
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

            {/* Products List */}
            <div className="grid gap-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <img
                          src={product.imageUrl || '/placeholder-image.jpg'}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div className="space-y-1">
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {getCategoryName(product.categoryId)}
                          </p>
                          <div className="flex gap-2">
                            <Badge variant="secondary">
                              Rp{(parseFloat(product.price) * 15000).toLocaleString('id-ID')}
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
              ))}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <CategoryManagement />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <OrderManagement />
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

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Toko</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fitur pengaturan akan segera hadir...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}