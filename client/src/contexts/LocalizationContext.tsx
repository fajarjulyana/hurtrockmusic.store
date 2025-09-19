import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Translation interfaces
interface Translations {
  // Common
  loading: string;
  error: string;
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  add: string;
  search: string;
  
  // Product related
  product: string;
  products: string;
  category: string;
  categories: string;
  price: string;
  originalPrice: string;
  quantity: string;
  stock: string;
  inStock: string;
  outOfStock: string;
  addToCart: string;
  viewProduct: string;
  
  // Cart and checkout
  cart: string;
  shoppingCart: string;
  checkout: string;
  payment: string;
  total: string;
  subtotal: string;
  emptyCart: string;
  emptyCartDescription: string;
  continueShopping: string;
  tax: string;
  
  // Order management
  orders: string;
  orderManagement: string;
  
  // Categories and search
  allCategories: string;
  searchPlaceholder: string;
  orderStatus: string;
  paymentStatus: string;
  tracking: string;
  orderDate: string;
  customerInfo: string;
  
  // Shipping
  shipping: string;
  shippingAddress: string;
  expeditionOptions: string;
  estimatedDelivery: string;
  
  // Admin
  admin: string;
  adminPanel: string;
  productManagement: string;
  categoryManagement: string;
  analytics: string;
  settings: string;
  
  // Status
  new: string;
  sale: string;
  processing: string;
  shipped: string;
  delivered: string;
  cancelled: string;
  
  // Forms
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  submit: string;
  
  // Currencies
  currency: string;

  // Category management
  addCategory: string;
  editCategory: string;
  deleteCategory: string;
  categoryDeleteConfirm: string;
  categoryAdded: string;
  categoryUpdated: string;
  categoryDeleted: string;
  categorySlugExists: string;
  categoryInUse: string;
  slug: string;
  noCategoriesFound: string;
}

const englishTranslations: Translations = {
  // Common
  loading: 'Loading...',
  error: 'Error',
  save: 'Save',
  cancel: 'Cancel',
  edit: 'Edit',
  delete: 'Delete',
  add: 'Add',
  search: 'Search',
  
  // Product related
  product: 'Product',
  products: 'Products',
  category: 'Category',
  categories: 'Categories',
  price: 'Price',
  originalPrice: 'Original Price',
  quantity: 'Quantity',
  stock: 'Stock',
  inStock: 'In Stock',
  outOfStock: 'Out of Stock',
  addToCart: 'Add to Cart',
  viewProduct: 'View Product',
  
  // Cart and checkout
  cart: 'Cart',
  shoppingCart: 'Shopping Cart',
  checkout: 'Checkout',
  payment: 'Payment',
  total: 'Total',
  subtotal: 'Subtotal',
  emptyCart: 'Your cart is empty',
  emptyCartDescription: 'Add some legendary musical instruments to get started',
  continueShopping: 'Continue Shopping',
  tax: 'Tax',
  
  // Order management
  orders: 'Orders',
  orderManagement: 'Order Management',
  
  // Categories and search
  allCategories: 'All Categories',
  searchPlaceholder: 'Search musical instruments...',
  orderStatus: 'Order Status',
  paymentStatus: 'Payment Status',
  tracking: 'Tracking',
  orderDate: 'Order Date',
  customerInfo: 'Customer Information',
  
  // Shipping
  shipping: 'Shipping',
  shippingAddress: 'Shipping Address',
  expeditionOptions: 'Shipping Options',
  estimatedDelivery: 'Estimated Delivery',
  
  // Admin
  admin: 'Admin',
  adminPanel: 'Admin Panel',
  productManagement: 'Product Management',
  categoryManagement: 'Category Management',
  analytics: 'Analytics',
  settings: 'Settings',
  
  // Status
  new: 'New',
  sale: 'Sale',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  
  // Forms
  name: 'Name',
  description: 'Description',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  submit: 'Submit',
  
  // Currencies
  currency: 'USD',

  // Category management
  addCategory: 'Add Category',
  editCategory: 'Edit Category',
  deleteCategory: 'Delete Category',
  categoryDeleteConfirm: 'Are you sure you want to delete this category?',
  categoryAdded: 'Category added successfully',
  categoryUpdated: 'Category updated successfully',
  categoryDeleted: 'Category deleted successfully',
  categorySlugExists: 'A category with this slug already exists',
  categoryInUse: 'Cannot delete category: products are using this category',
  slug: 'Slug',
  noCategoriesFound: 'No categories yet. Add your first category.',
};

const indonesianTranslations: Translations = {
  // Common
  loading: 'Memuat...',
  error: 'Error',
  save: 'Simpan',
  cancel: 'Batal',
  edit: 'Edit',
  delete: 'Hapus',
  add: 'Tambah',
  search: 'Cari',
  
  // Product related
  product: 'Produk',
  products: 'Produk',
  category: 'Kategori',
  categories: 'Kategori',
  price: 'Harga',
  originalPrice: 'Harga Asli',
  quantity: 'Jumlah',
  stock: 'Stok',
  inStock: 'Tersedia',
  outOfStock: 'Habis',
  addToCart: 'Tambah ke Keranjang',
  viewProduct: 'Lihat Produk',
  
  // Cart and checkout
  cart: 'Keranjang',
  shoppingCart: 'Keranjang Belanja',
  checkout: 'Checkout',
  payment: 'Pembayaran',
  total: 'Total',
  subtotal: 'Subtotal',
  emptyCart: 'Keranjang kosong',
  emptyCartDescription: 'Tambahkan beberapa alat musik legendaris untuk memulai',
  continueShopping: 'Lanjutkan Belanja',
  tax: 'Pajak',
  
  // Order management
  orders: 'Pesanan',
  orderManagement: 'Manajemen Pesanan',
  
  // Categories and search
  allCategories: 'Semua Kategori',
  searchPlaceholder: 'Cari alat musik...',
  orderStatus: 'Status Pesanan',
  paymentStatus: 'Status Pembayaran',
  tracking: 'Tracking',
  orderDate: 'Tanggal Pesanan',
  customerInfo: 'Info Pelanggan',
  
  // Shipping
  shipping: 'Pengiriman',
  shippingAddress: 'Alamat Pengiriman',
  expeditionOptions: 'Pilihan Ekspedisi',
  estimatedDelivery: 'Estimasi Pengiriman',
  
  // Admin
  admin: 'Admin',
  adminPanel: 'Panel Admin',
  productManagement: 'Manajemen Produk',
  categoryManagement: 'Manajemen Kategori',
  analytics: 'Analitik',
  settings: 'Pengaturan',
  
  // Status
  new: 'Baru',
  sale: 'Diskon',
  processing: 'Diproses',
  shipped: 'Dikirim',
  delivered: 'Diterima',
  cancelled: 'Dibatalkan',
  
  // Forms
  name: 'Nama',
  description: 'Deskripsi',
  email: 'Email',
  phone: 'Telepon',
  address: 'Alamat',
  submit: 'Kirim',
  
  // Currencies
  currency: 'IDR',

  // Category management
  addCategory: 'Tambah Kategori',
  editCategory: 'Edit Kategori',
  deleteCategory: 'Hapus Kategori',
  categoryDeleteConfirm: 'Apakah Anda yakin ingin menghapus kategori ini?',
  categoryAdded: 'Kategori berhasil ditambahkan',
  categoryUpdated: 'Kategori berhasil diperbarui',
  categoryDeleted: 'Kategori berhasil dihapus',
  categorySlugExists: 'Kategori dengan slug ini sudah ada',
  categoryInUse: 'Tidak dapat menghapus kategori: ada produk yang menggunakan kategori ini',
  slug: 'Slug',
  noCategoriesFound: 'Belum ada kategori. Tambahkan kategori pertama Anda.',
};

// Currency formatting functions
export const formatCurrency = (amount: number, locale: string, currency: string): string => {
  if (locale === 'id-ID' && currency === 'IDR') {
    // Convert USD to IDR using exchange rate (roughly 1 USD = 15000 IDR)
    const idrAmount = amount * 15000;
    return `Rp${idrAmount.toLocaleString('id-ID')}`;
  } else {
    // Format as USD for international users
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
};

interface LocalizationContextType {
  locale: string;
  currency: string;
  translations: Translations;
  formatCurrency: (amount: number) => string;
  setLocale: (locale: string) => void;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

// Hook to detect user location
const useLocationDetection = () => {
  const [isIndonesia, setIsIndonesia] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectLocation = async () => {
      try {
        // First try to get timezone information
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timeZone === 'Asia/Jakarta' || timeZone.startsWith('Asia/Jakarta')) {
          setIsIndonesia(true);
          setLoading(false);
          return;
        }

        // Try to get location from browser navigator
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              // Indonesia rough coordinates: latitude -11 to 6, longitude 95 to 141
              if (latitude >= -11 && latitude <= 6 && longitude >= 95 && longitude <= 141) {
                setIsIndonesia(true);
              }
              setLoading(false);
            },
            () => {
              // Geolocation failed, try language detection
              const language = navigator.language || navigator.languages?.[0] || 'en';
              setIsIndonesia(language.startsWith('id'));
              setLoading(false);
            },
            { timeout: 5000 }
          );
        } else {
          // No geolocation, use language as fallback
          const language = (navigator as any).language || (navigator as any).languages?.[0] || 'en';
          setIsIndonesia(language.startsWith('id'));
          setLoading(false);
        }
      } catch (error) {
        console.error('Error detecting location:', error);
        // Default to English/USD
        setIsIndonesia(false);
        setLoading(false);
      }
    };

    detectLocation();
  }, []);

  return { isIndonesia, loading };
};

interface LocalizationProviderProps {
  children: ReactNode;
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ children }) => {
  const { isIndonesia, loading } = useLocationDetection();
  const [manualLocale, setManualLocale] = useState<string | null>(null);

  // Determine current locale based on location or manual override
  const locale = manualLocale || (isIndonesia ? 'id-ID' : 'en-US');
  const currency = locale === 'id-ID' ? 'IDR' : 'USD';
  const translations = locale === 'id-ID' ? indonesianTranslations : englishTranslations;

  const formatCurrencyLocal = (amount: number): string => {
    return formatCurrency(amount, locale, currency);
  };

  const setLocale = (newLocale: string) => {
    setManualLocale(newLocale);
    localStorage.setItem('preferred-locale', newLocale);
  };

  // Load saved locale preference on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('preferred-locale');
    if (savedLocale) {
      setManualLocale(savedLocale);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const value: LocalizationContextType = {
    locale,
    currency,
    translations,
    formatCurrency: formatCurrencyLocal,
    setLocale,
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};