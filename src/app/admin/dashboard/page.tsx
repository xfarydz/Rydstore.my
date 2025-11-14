'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Package, Users, ShoppingCart, Settings, LogOut, Edit, Trash2, Upload, Globe, Check, Truck } from 'lucide-react';
import { useSiteSettings, SiteSettings } from '../../../hooks/useSiteSettings';
import { useAllProducts } from '../../../hooks/useProducts';
import CustomModal from '../../../components/CustomModal';
import OrderTrackingModal from '../../../components/OrderTrackingModal';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[]; // Additional images for product
  category: string;
  size: string[];
  color: string;
  inStock: boolean;
  isNew?: boolean;
  isSoldOut?: boolean;
  isFeatured?: boolean;
  description?: string;
  createdAt?: string;
  offers?: Offer[];
}

interface Offer {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  offeredPrice: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'expired';
  createdAt: string;
  acceptedAt?: string;
  paidAt?: string;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [salesRecords, setSalesRecords] = useState<any[]>([]);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showUserOrdersModal, setShowUserOrdersModal] = useState(false);
  const [productFilter, setProductFilter] = useState('all'); // 'all', 'available', 'soldout'
  const [selectedUserOrders, setSelectedUserOrders] = useState<any>(null);
  const [userOrdersHistory, setUserOrdersHistory] = useState<any[]>([]);
  const [userOrdersFilter, setUserOrdersFilter] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<any>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  // Manual newsletter state
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  
  // Custom modal state
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info' as 'success' | 'error' | 'warning' | 'info' | 'confirm',
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'OK',
    cancelText: 'Cancel'
  });
  
  // Helper function to compress images
  const compressImage = (file: File, maxWidth = 800, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Helper functions for managing multiple images
  const addImageToForm = (formType: 'add' | 'edit', imageUrl: string) => {
    if (formType === 'add') {
      setAddForm(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }));
    }
  };
  
  const removeImageFromForm = (formType: 'add' | 'edit', index: number) => {
    if (formType === 'add') {
      setAddForm(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };
  const [editForm, setEditForm] = useState({
    name: '',
    brand: '',
    price: 0,
    image: '',
    images: [] as string[],
    category: '',
    color: '',
    size: [] as string[],
    description: '',
    isFeatured: false
  });
  const [addForm, setAddForm] = useState({
    name: '',
    brand: 'Nike',
    price: 0,
    image: '',
    images: [] as string[],
    category: '',
    color: '',
    size: [] as string[],
    description: '',
    isFeatured: false
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const { settings, updateSettings } = useSiteSettings();
  const router = useRouter();

  // Get all products (including sold ones) for admin view
  const allProducts = useAllProducts();

  useEffect(() => {
    // Check if admin is authenticated
    if (!localStorage.getItem('adminAuth')) {
      router.push('/admin');
      return;
    }

    // Set products from hook
    setProducts(allProducts);
    
    // Load registered users from localStorage
    loadRegisteredUsers();
    
    // Load sales records from localStorage
    loadSalesRecords();
  }, [router, allProducts]);

  const loadRegisteredUsers = () => {
    // Get all users from localStorage by checking all possible sources
    const users: any[] = [];
    
    // 1. Check main registeredUsers array (primary source)
    try {
      const registeredUsersData = localStorage.getItem('registeredUsers');
      if (registeredUsersData) {
        const registeredUsers = JSON.parse(registeredUsersData);
        if (Array.isArray(registeredUsers)) {
          registeredUsers.forEach(userData => {
            if (userData.id && userData.email) {
              users.push({
                ...userData,
                storageKey: 'registeredUsers',
                registrationDate: userData.joinedDate || 'Unknown'
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('Error parsing registeredUsers data:', error);
    }
    
    // 2. Check for individual user data (currentUser pattern) - fallback/legacy
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('user_') || key === 'currentUser')) {
        try {
          const userData = JSON.parse(localStorage.getItem(key) || '{}');
          if (userData.id && userData.email) {
            // Only add if not already in users array (avoid duplicates)
            const alreadyExists = users.some(u => u.email === userData.email);
            if (!alreadyExists) {
              users.push({
                ...userData,
                storageKey: key,
                registrationDate: userData.joinedDate || 'Unknown'
              });
            }
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
    
    // Remove duplicates by email (final safety check)
    const uniqueUsers = users.filter((user, index, self) => 
      index === self.findIndex(u => u.email === user.email)
    );
    
    setRegisteredUsers(uniqueUsers);
  };

  const loadSalesRecords = () => {
    try {
      const sales = JSON.parse(localStorage.getItem('salesRecords') || '[]');
      // Sort by timestamp, newest first
      const sortedSales = sales.sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setSalesRecords(sortedSales);
    } catch (error) {
      console.error('Error loading sales records:', error);
      setSalesRecords([]);
    }
  };

  // Show delete confirmation
  const showDeleteConfirmation = (sale: any) => {
    setSaleToDelete(sale);
    setShowDeleteConfirm(true);
  };

  // Delete sales record function
  const deleteSalesRecord = (saleId: string, userEmail: string) => {
    try {
      // 1. Delete from main salesRecords
      const sales = JSON.parse(localStorage.getItem('salesRecords') || '[]');
      const updatedSales = sales.filter((sale: any) => sale.id !== saleId);
      localStorage.setItem('salesRecords', JSON.stringify(updatedSales));
      setSalesRecords(updatedSales);

      // 2. Delete from user's purchase history
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const user = users.find((u: any) => u.email === userEmail);
      
      if (user) {
        const userSalesKey = `userSales_${user.id}`;
        const userSales = JSON.parse(localStorage.getItem(userSalesKey) || '[]');
        const updatedUserSales = userSales.filter((sale: any) => sale.id !== saleId);
        localStorage.setItem(userSalesKey, JSON.stringify(updatedUserSales));
      }

      // 3. Reset product availability if needed
      const saleRecord = sales.find((sale: any) => sale.id === saleId);
      if (saleRecord && saleRecord.productId) {
        const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
        const updatedProducts = adminProducts.map((product: any) => {
          if (product.id === saleRecord.productId) {
            return {
              ...product,
              isSoldOut: false,
              inStock: true
            };
          }
          return product;
        });
        localStorage.setItem('adminProducts', JSON.stringify(updatedProducts));
        setProducts(updatedProducts);
      }

      console.log('✅ Sales record deleted successfully:', saleId);
      alert('✅ Sales record berjaya deleted!');
      
    } catch (error) {
      console.error('❌ Error deleting sales record:', error);
      alert('❌ Error deleting sales record!');
    }
  };

  const updateOrderStatus = (saleId: string, newStatus: string, trackingNumber?: string) => {
    try {
      const sales = JSON.parse(localStorage.getItem('salesRecords') || '[]');
      const updatedSales = sales.map((sale: any) => {
        if (sale.id === saleId) {
          const updatedSale = {
            ...sale,
            status: newStatus,
            updatedAt: new Date().toISOString()
          };
          
          // Add tracking number if provided
          if (trackingNumber) {
            updatedSale.trackingNumber = trackingNumber;
            updatedSale.trackingUpdatedAt = new Date().toISOString();
          }
          
          return updatedSale;
        }
        return sale;
      });
      
      localStorage.setItem('salesRecords', JSON.stringify(updatedSales));
      setSalesRecords(updatedSales);
      
      console.log('✅ Order status updated:', { saleId, newStatus, trackingNumber });
      
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    router.push('/admin');
  };

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    
    try {
      // Check localStorage size before saving
      const dataString = JSON.stringify(newProducts);
      const dataSize = new Blob([dataString]).size;
      console.log('Data size:', (dataSize / 1024 / 1024).toFixed(2), 'MB');
      
      localStorage.setItem('adminProducts', dataString);
      
      // Trigger product update event for other components
      window.dispatchEvent(new Event('productUpdated'));
      window.dispatchEvent(new Event('storage'));
      
      console.log('Products saved to localStorage:', newProducts.length, 'total products');
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        // QuotaExceededError
        alert('Storage quota exceeded! Please use smaller images or contact support. Try using images under 500KB.');
        console.error('LocalStorage quota exceeded. Current data size too large.');
        
        // Optional: Clear some space by keeping only essential data
        const essentialProducts = newProducts.map(p => ({
          ...p,
          image: p.image.length > 50000 ? '' : p.image, // Remove large images
          images: [] // Remove additional images to save space
        }));
        
        try {
          localStorage.setItem('adminProducts', JSON.stringify(essentialProducts));
          alert('Saved with compressed data. Please re-upload smaller images.');
        } catch (secondError) {
          alert('Critical storage error. Please clear browser data and try again.');
        }
      } else {
        console.error('Error saving products:', error);
        alert('Error saving product. Please try again.');
      }
    }
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setProductToDelete(null);
    setShowDeleteModal(false);
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      const newProducts = products.filter(p => p.id !== productToDelete.id);
      saveProducts(newProducts);
      closeDeleteModal();
    }
  };

  // Newsletter notification system
  const sendNewsletterNotification = (product: Product) => {
    try {
      const newsletterEmails = JSON.parse(localStorage.getItem('newsletterEmails') || '[]');
      const notifications = JSON.parse(localStorage.getItem('newsletterNotifications') || '[]');
      
      if (newsletterEmails.length > 0) {
        const newNotification = {
          id: Date.now(),
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          productPrice: product.price,
          productBrand: product.brand,
          sentAt: new Date().toISOString(),
          recipientCount: newsletterEmails.length,
          recipients: newsletterEmails.map((sub: any) => sub.email)
        };
        
        notifications.push(newNotification);
        localStorage.setItem('newsletterNotifications', JSON.stringify(notifications));
        
        // In real app, this would call email service like SendGrid/Mailgun
        console.log(`Newsletter notification sent to ${newsletterEmails.length} subscribers for product: ${product.name}`);
      }
    } catch (error) {
      console.error('Error sending newsletter notification:', error);
    }
  };

  const getNewsletterSubscribers = () => {
    try {
      return JSON.parse(localStorage.getItem('newsletterEmails') || '[]');
    } catch (error) {
      console.error('Error getting newsletter subscribers:', error);
      return [];
    }
  };

  // User management functions
  const handleDeleteUser = (userToDelete: any) => {
    if (window.confirm(`Are you sure you want to delete user "${userToDelete.fullName || userToDelete.name || userToDelete.email}"?`)) {
      try {
        const updatedUsers = registeredUsers.filter(user => user.id !== userToDelete.id);
        setRegisteredUsers(updatedUsers);
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
        
        // Also remove from any other user-related storage
        const userStorageKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes(userToDelete.id)) {
            userStorageKeys.push(key);
          }
        }
        
        userStorageKeys.forEach(key => localStorage.removeItem(key));
        
        showSuccessModal('User Deleted', 'User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        showErrorModal('Delete Failed', 'Failed to delete user');
      }
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const getNewsletterNotifications = () => {
    try {
      return JSON.parse(localStorage.getItem('newsletterNotifications') || '[]');
    } catch (error) {
      console.error('Error getting newsletter notifications:', error);
      return [];
    }
  };

  const refreshNewsletterData = () => {
    // Force re-render to show latest data
    setActiveTab('newsletter');
    showInfoModal('Data Refreshed', 'Newsletter data has been refreshed successfully!');
  };

  const deleteNewsletterSubscriber = (emailToDelete: string) => {
    showConfirmModal(
      'Remove Subscriber',
      `Are you sure you want to remove "${emailToDelete}" from newsletter subscribers?\n\nThis action cannot be undone.`,
      () => {
        try {
          const existingEmails = JSON.parse(localStorage.getItem('newsletterEmails') || '[]');
          const updatedEmails = existingEmails.filter((sub: any) => sub.email !== emailToDelete);
          localStorage.setItem('newsletterEmails', JSON.stringify(updatedEmails));
          
          // Force refresh
          setActiveTab('newsletter');
          showSuccessModal('Subscriber Removed', `"${emailToDelete}" has been successfully removed from newsletter subscribers.`);
        } catch (error) {
          console.error('Error deleting subscriber:', error);
          showErrorModal('Error', 'Failed to remove subscriber. Please try again.');
        }
      }
    );
  };

  const clearAllNotifications = () => {
    showConfirmModal(
      'Clear All Notifications',
      'Are you sure you want to clear all newsletter notification history? This cannot be undone.',
      () => {
        try {
          localStorage.setItem('newsletterNotifications', '[]');
          refreshNewsletterData();
          showSuccessModal('Success', 'All notification history cleared successfully.');
        } catch (error) {
          console.error('Error clearing notifications:', error);
          showErrorModal('Error', 'Error clearing notifications. Please try again.');
        }
      }
    );
  };

  // Custom modal helper functions
  const showSuccessModal = (title: string, message: string) => {
    setModal({
      isOpen: true,
      type: 'success',
      title,
      message,
      onConfirm: () => {},
      confirmText: 'Great!',
      cancelText: 'Cancel'
    });
  };

  const showErrorModal = (title: string, message: string) => {
    setModal({
      isOpen: true,
      type: 'error',
      title,
      message,
      onConfirm: () => {},
      confirmText: 'OK',
      cancelText: 'Cancel'
    });
  };

  const showWarningModal = (title: string, message: string) => {
    setModal({
      isOpen: true,
      type: 'warning',
      title,
      message,
      onConfirm: () => {},
      confirmText: 'Understood',
      cancelText: 'Cancel'
    });
  };

  const showInfoModal = (title: string, message: string) => {
    setModal({
      isOpen: true,
      type: 'info',
      title,
      message,
      onConfirm: () => {},
      confirmText: 'OK',
      cancelText: 'Cancel'
    });
  };

  const showConfirmModal = (title: string, message: string, onConfirm: () => void) => {
    setModal({
      isOpen: true,
      type: 'confirm',
      title,
      message,
      onConfirm,
      confirmText: 'Yes, Confirm',
      cancelText: 'Cancel'
    });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const sendManualNewsletter = () => {
    if (!newsletterSubject.trim() || !newsletterMessage.trim()) {
      showWarningModal('Missing Information', 'Please fill in both subject and message fields before sending the newsletter.');
      return;
    }

    try {
      const newsletterEmails = JSON.parse(localStorage.getItem('newsletterEmails') || '[]');
      
      if (newsletterEmails.length === 0) {
        showWarningModal('No Subscribers', 'No newsletter subscribers found. Add subscribers first before sending newsletters.');
        return;
      }

      const notifications = JSON.parse(localStorage.getItem('newsletterNotifications') || '[]');
      
      const manualNotification = {
        id: Date.now(),
        productId: 'manual-newsletter',
        productName: newsletterSubject,
        productImage: settings.logoUrl || '/placeholder-logo.png',
        productPrice: 0,
        productBrand: settings.storeName || 'Store',
        sentAt: new Date().toISOString(),
        recipientCount: newsletterEmails.length,
        recipients: newsletterEmails.map((sub: any) => sub.email),
        isManual: true,
        message: newsletterMessage
      };
      
      notifications.push(manualNotification);
      localStorage.setItem('newsletterNotifications', JSON.stringify(notifications));
      
      // Reset form
      setNewsletterSubject('');
      setNewsletterMessage('');
      
      showSuccessModal(
        'Newsletter Sent Successfully!', 
        `📧 Newsletter "${newsletterSubject}" has been sent to ${newsletterEmails.length} subscribers.\n\n✅ Notification stored and will appear in user notifications.\n\n💡 Note: This is demo mode using localStorage. For real email delivery, integrate with email services like SendGrid or Mailgun.`
      );
      
      // In real app, this would call email service like:
      // await sendEmail({ to: newsletterEmails, subject: newsletterSubject, message: newsletterMessage })
      console.log(`Manual newsletter sent to ${newsletterEmails.length} subscribers:`, manualNotification);
      
    } catch (error) {
      console.error('Error sending manual newsletter:', error);
      showErrorModal('Send Failed', 'Failed to send newsletter. Please check your inputs and try again.');
    }
  };

  const closeAddModal = () => {
    setShowAddProduct(false);
    setAddForm({
      name: '',
      brand: 'Nike',
      price: 0,
      image: '',
      images: [] as string[],
      category: '',
      color: '',
      size: [] as string[],
      description: '',
      isFeatured: false
    });
  };

  const saveAddProduct = () => {
    console.log('SaveAddProduct called with form data:', addForm);
    
    if (!addForm.name || !addForm.brand || !addForm.price || !addForm.image) {
      console.log('Validation failed:', {
        name: !!addForm.name,
        brand: !!addForm.brand,
        price: !!addForm.price,
        image: !!addForm.image
      });
      showWarningModal('Missing Required Fields', 'Please fill in all required fields:\n\n• Product Name\n• Brand\n• Price\n• Main Image\n\nThese fields are necessary to create a product.');
      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: addForm.name,
      brand: addForm.brand,
      price: Number(addForm.price),
      image: addForm.image,
      images: addForm.images,
      category: addForm.category || 'General',
      color: addForm.color || 'Default',
      size: addForm.size.length > 0 ? addForm.size : ['One Size'],
      inStock: true,
      isNew: true,
      isFeatured: addForm.isFeatured,
      description: addForm.description,
      offers: [],
      createdAt: new Date().toISOString()
    };

    console.log('Creating new product:', newProduct);

    const newProducts = [...products, newProduct];
    console.log('Saving products to localStorage. Total products:', newProducts.length);
    
    saveProducts(newProducts);
    
    // Trigger product update event
    window.dispatchEvent(new Event('productUpdated'));
    
    // Send newsletter notification for new product
    sendNewsletterNotification(newProduct);
    
    showSuccessModal('Product Added Successfully!', `✅ "${newProduct.name}" has been added to your store.\n\n📧 Newsletter notifications sent to all subscribers.\n\n🎉 Your product is now live and available for customers!`);
    closeAddModal();
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      images: product.images || [],
      category: product.category,
      color: product.color,
      size: product.size,
      description: product.description || '',
      isFeatured: product.isFeatured || false
    });
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setEditForm({
      name: '',
      brand: '',
      price: 0,
      image: '',
      images: [],
      category: '',
      color: '',
      size: [],
      description: '',
      isFeatured: false
    });
  };

  const saveEditProduct = () => {
    if (!editingProduct) return;
    
    const updatedProducts = products.map(p => 
      p.id === editingProduct.id 
        ? { 
            ...p, 
            ...editForm,
            price: Number(editForm.price)
          }
        : p
    );
    
    saveProducts(updatedProducts);
    closeEditModal();
  };

  const toggleProductStatus = (product: Product) => {
    const updatedProducts = products.map(p => 
      p.id === product.id 
        ? { 
            ...p, 
            isSoldOut: !p.isSoldOut,
            inStock: p.isSoldOut ? true : false // If was sold out, now back in stock
          }
        : p
    );
    
    saveProducts(updatedProducts);
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'products', label: 'Products', icon: ShoppingCart },
    { id: 'users', label: 'Registered Users', icon: Users },
    { id: 'sales', label: 'Sales Records', icon: Globe },
    { id: 'user-orders', label: 'User Orders', icon: Users },
    { id: 'offers', label: 'Offers', icon: ShoppingCart },
    { id: 'newsletter', label: 'Newsletter', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: Globe },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Updated stats for single-unit items (no quantities)
  const totalSold = products.filter(p => p.isSoldOut).length;
  const totalRevenue = products.filter(p => p.isSoldOut).reduce((sum, p) => sum + p.price, 0);
  
  const stats = [
    { label: 'Total Products', value: products.length, color: 'bg-blue-500' },
    { label: 'In Stock', value: products.filter(p => p.inStock && !p.isSoldOut).length, color: 'bg-green-500' },
    { label: 'Sold Out', value: products.filter(p => p.isSoldOut || !p.inStock).length, color: 'bg-red-500' },
    { label: 'Total Sold', value: totalSold, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white">
        <div className="p-6">
          <h1 className="text-xl font-bold">RYDSTORE.MY</h1>
          <p className="text-sm text-gray-300">Admin Panel</p>
        </div>
        
        <nav className="mt-8 flex-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-800 transition-colors ${
                activeTab === item.id ? 'bg-gray-800 border-r-2 border-white' : ''
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </button>
          ))}
          
          {/* Logout Button in Menu */}
          <div className="mt-8 border-t border-gray-700 pt-4">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center px-6 py-3 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-black capitalize">{activeTab}</h2>
              <p className="text-gray-600">Manage your store and view analytics</p>
            </div>
            {activeTab === 'products' && (
              <button 
                onClick={() => setShowAddProduct(true)}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Product
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${stat.color} mr-4`}>
                    {index === 0 && <Package className="h-6 w-6 text-white" />}
                    {index === 1 && <Check className="h-6 w-6 text-white" />}
                    {index === 2 && <ShoppingCart className="h-6 w-6 text-white" />}
                    {index === 3 && <Globe className="h-6 w-6 text-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-black">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-black mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{products.length}</p>
                    <p className="text-blue-600 text-sm font-medium">Total Products</p>
                    <p className="text-blue-100 text-xs mt-1">{products.filter(p => p.inStock).length} in stock</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{settings.currency}{totalRevenue.toLocaleString()}</p>
                    <p className="text-green-600 text-sm font-medium">Revenue</p>
                    <p className="text-green-100 text-xs mt-1">From {totalSold} sold items</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{totalSold}</p>
                    <p className="text-purple-600 text-sm font-medium">Items Sold</p>
                    <p className="text-purple-100 text-xs mt-1">{products.filter(p => p.isSoldOut).length} items sold</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Upload className="h-5 w-5 text-orange-600 mr-1" />
                    </div>
                    <p className="text-orange-600 text-sm font-medium">Available</p>
                    <p className="text-2xl font-bold text-orange-600">{products.filter(p => p.inStock && !p.isSoldOut).length}</p>
                    <p className="text-orange-100 text-xs mt-1">Ready for sale</p>
                  </div>
                </div>
              </div>

              {/* Top Selling Products (Recently Sold) */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-black mb-4">Recently Sold Items</h3>
                <div className="space-y-4">
                  {products
                    .filter(p => p.isSoldOut)
                    .slice(0, 6)
                    .map((product) => (
                      <div key={product.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{product.name}</span>
                          <span className="text-sm text-gray-500">SOLD</span>
                        </div>
                        <div className={`w-full h-3 rounded-full bg-gradient-to-r from-green-400 to-green-500`}></div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-black mb-4">Revenue Breakdown</h3>
                <div className="space-y-4">
                  {['Nike', 'Adidas', 'Supreme', 'Off-White', 'Jordan'].map((brand) => {
                    const brandProducts = products.filter(p => p.brand === brand);
                    const brandRevenue = brandProducts.filter(p => p.isSoldOut).reduce((sum, p) => sum + p.price, 0);
                    return (
                      <div key={brand} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{brand}</span>
                        <span className="text-green-600 font-bold">{settings.currency}{brandRevenue.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-black mb-4">Store Health</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-green-600 text-sm font-medium">Available</p>
                    <p className="text-2xl font-bold text-green-600">{products.filter(p => p.inStock && !p.isSoldOut).length}</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Package className="h-5 w-5 text-yellow-600" />
                    </div>
                    <p className="text-yellow-600 text-sm font-medium">Pending Offers</p>
                    <p className="text-2xl font-bold text-yellow-600">{products.reduce((sum, p) => sum + (p.offers?.filter(o => o.status === 'pending').length || 0), 0)}</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <ShoppingCart className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-red-600 text-sm font-medium">Sold Out</p>
                    <p className="text-2xl font-bold text-red-600">{products.filter(p => p.isSoldOut || !p.inStock).length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-black">Product Management</h3>
                    <p className="text-gray-600">Each product is a unique item (1 unit only)</p>
                  </div>
                  
                  {/* Product Filter Tabs */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setProductFilter('all')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        productFilter === 'all' 
                          ? 'bg-white text-black shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      All ({products.length})
                    </button>
                    <button
                      onClick={() => setProductFilter('available')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        productFilter === 'available' 
                          ? 'bg-white text-green-700 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Available ({products.filter(p => !p.isSoldOut && p.inStock).length})
                    </button>
                    <button
                      onClick={() => setProductFilter('soldout')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        productFilter === 'soldout' 
                          ? 'bg-white text-red-700 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Sold Out ({products.filter(p => p.isSoldOut || !p.inStock).length})
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.filter(product => {
                    if (productFilter === 'available') {
                      return !product.isSoldOut && product.inStock;
                    } else if (productFilter === 'soldout') {
                      return product.isSoldOut || !product.inStock;
                    }
                    return true; // 'all'
                  }).map((product) => (
                    <div key={product.id} className={`border rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${
                      product.isSoldOut || !product.inStock 
                        ? 'border-red-200 bg-red-50/30' 
                        : 'border-gray-200'
                    }`}>
                      <div className="relative">
                        <img src={product.image} alt={product.name} className={`w-full h-48 object-cover ${
                          product.isSoldOut || !product.inStock ? 'opacity-75' : ''
                        }`} />
                        {(product.isSoldOut || !product.inStock) && (
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                              SOLD OUT
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-black mb-2 truncate">{product.name}</h4>
                        <p className="text-gray-600 mb-2 text-sm">{product.brand}</p>
                        <p className="text-lg font-bold text-black mb-3">{settings.currency}{product.price.toLocaleString()}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.isSoldOut 
                              ? 'bg-red-100 text-red-800' 
                              : product.inStock 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.isSoldOut ? 'SOLD' : product.inStock ? 'AVAILABLE' : 'UNAVAILABLE'}
                          </span>
                          
                          {(product.offers?.filter(o => o.status === 'pending').length || 0) > 0 && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                              {product.offers?.filter(o => o.status === 'pending').length || 0} Offers
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <button 
                            onClick={() => toggleProductStatus(product)}
                            className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              product.isSoldOut 
                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl' 
                                : 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl'
                            }`}
                          >
                            {product.isSoldOut ? '✅ Mark Available' : '🔴 Mark Sold'}
                          </button>
                          
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => openEditModal(product)}
                              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </button>
                            
                            <button 
                              onClick={() => openDeleteModal(product)}
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Empty State */}
                {(() => {
                  const filteredProducts = products.filter(product => {
                    if (productFilter === 'available') {
                      return !product.isSoldOut && product.inStock;
                    } else if (productFilter === 'soldout') {
                      return product.isSoldOut || !product.inStock;
                    }
                    return true; // 'all'
                  });
                  
                  if (products.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                        <p className="text-gray-600 mb-4">Start by adding your first product</p>
                        <button 
                          onClick={() => setShowAddProduct(true)}
                          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          Add Product
                        </button>
                      </div>
                    );
                  }
                  
                  if (filteredProducts.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {productFilter === 'available' ? 'No available products' :
                           productFilter === 'soldout' ? 'No sold out products' : 'No products found'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {productFilter === 'available' ? 'All products are currently sold out' :
                           productFilter === 'soldout' ? 'All products are still available' : 'Try a different filter'}
                        </p>
                        <button 
                          onClick={() => setProductFilter('all')}
                          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          View All Products
                        </button>
                      </div>
                    );
                  }
                  
                  return null;
                })()}
              </div>
            </div>
          )}

          {/* Registered Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-black">Registered Users</h3>
                  <p className="text-gray-600">Monitor and manage user registrations</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{registeredUsers.length}</p>
                    <p className="text-sm text-gray-600">Total Users</p>
                  </div>
                  <button
                    onClick={() => {
                      console.log('=== LOCALSTORAGE DEBUG ===');
                      console.log('registeredUsers:', localStorage.getItem('registeredUsers'));
                      console.log('currentUser:', localStorage.getItem('currentUser'));
                      
                      // Parse and check profile completeness
                      try {
                        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                        console.log('=== PROFILE COMPLETENESS CHECK ===');
                        users.forEach((user: any, index: number) => {
                          const isComplete = (user.fullName || user.name) && user.phone && user.address?.street && user.address?.city && user.address?.state && user.address?.postcode;
                          console.log(`User ${index + 1}:`, {
                            email: user.email,
                            name: user.fullName || user.name,
                            phone: user.phone,
                            address: user.address,
                            isComplete: isComplete
                          });
                        });
                      } catch (e) {
                        console.log('Error parsing users:', e);
                      }
                      
                      // Log all user-related keys
                      for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && (key.includes('user') || key.includes('User'))) {
                          console.log(`${key}:`, localStorage.getItem(key));
                        }
                      }
                      
                      alert('Debug info logged to console. Check browser developer tools.');
                      loadRegisteredUsers();
                    }}
                    className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Debug
                  </button>
                  <button
                    onClick={loadRegisteredUsers}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {registeredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No registered users found</p>
                    <p className="text-sm text-gray-500 mt-2">Users will appear here when they register on the site</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Registration Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Profile Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registeredUsers.map((user, index) => {
                          // Check profile completeness with detailed validation
                          const hasName = !!(user.fullName || user.name);
                          const hasPhone = !!(user.phone && user.phone.trim());
                          const hasAddress = !!(user.address && 
                            user.address.street && user.address.street.trim() &&
                            user.address.city && user.address.city.trim() &&
                            user.address.state && user.address.state.trim() &&
                            user.address.postcode && user.address.postcode.trim()
                          );
                          
                          const isComplete = hasName && hasPhone && hasAddress;
                          
                          // Debug logging (can be removed in production)
                          if (!isComplete) {
                            console.log(`User ${user.email} incomplete:`, {
                              hasName: hasName,
                              hasPhone: hasPhone,
                              hasAddress: hasAddress,
                              address: user.address
                            });
                          }
                          
                          return (
                            <tr key={user.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                                    {(user.fullName || user.name || 'U').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{user.fullName || user.name || 'N/A'}</p>
                                    <p className="text-xs text-gray-500">ID: {user.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-700">{user.email}</td>
                              <td className="py-3 px-4 text-gray-700">{user.phone || 'Not provided'}</td>
                              <td className="py-3 px-4 text-gray-700">
                                {user.registrationDate !== 'Unknown' 
                                  ? new Date(user.registrationDate).toLocaleDateString('en-MY', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })
                                  : 'Unknown'
                                }
                              </td>
                              <td className="py-3 px-4">
                                <div className="space-y-1">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    isComplete 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {isComplete ? '✅ Complete' : '⚠️ Incomplete'}
                                  </span>
                                  {/* Show what's missing */}
                                  {!isComplete && (
                                    <div className="text-xs text-red-600">
                                      Missing: {[
                                        !hasName && 'Name',
                                        !hasPhone && 'Phone',
                                        !hasAddress && 'Complete Address'
                                      ].filter(Boolean).join(', ')}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleEditUser(user)}
                                    className="flex items-center px-3 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(user)}
                                    className="flex items-center px-3 py-1.5 bg-white text-black border border-black rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sales Records Tab */}
          {activeTab === 'sales' && (
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-black">Sales Records</h3>
                  <p className="text-gray-600">Complete purchase history with buyer details</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{salesRecords.length}</p>
                    <p className="text-sm text-gray-600">Total Sales</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      RM{salesRecords.reduce((total, sale) => {
                        // Handle both single and bulk orders
                        const amount = sale.totalAmount || sale.amount || 0;
                        return total + (typeof amount === 'number' ? amount : 0);
                      }, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                  </div>
                  <button
                    onClick={loadSalesRecords}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {salesRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No sales records found</p>
                    <p className="text-sm text-gray-500 mt-2">Sales will appear here when customers complete purchases</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Buyer</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment Method</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Purchase Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesRecords.map((sale, index) => (
                          <tr key={sale.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                {sale.type === 'bulk' ? (
                                  // Bulk order display
                                  <div className="w-12 h-12 bg-gradient-to-r from-gray-900 to-black rounded-lg flex items-center justify-center">
                                    <Package className="w-6 h-6 text-white" />
                                  </div>
                                ) : (
                                  // Single item display
                                  <img 
                                    src={sale.productImage} 
                                    alt={sale.productName}
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                )}
                                <div>
                                  {sale.items && sale.items.length > 0 ? (
                                    // Cart orders (both single and bulk) with items array
                                    <>
                                      <p className="font-medium text-gray-900">
                                        {sale.type === 'bulk' ? 'Bulk Order' : 'Cart Order'} ({sale.items.length} {sale.items.length === 1 ? 'item' : 'items'})
                                      </p>
                                      <p className="text-xs text-gray-500">ID: {sale.orderId}</p>
                                      <p className="text-xs text-blue-600">
                                        {sale.items.map((item: any) => `${item.productName || item.name} (x${item.quantity || 1})`).join(', ').substring(0, 80)}
                                        {sale.items.map((item: any) => item.productName || item.name).join(', ').length > 80 && '...'}
                                      </p>
                                    </>
                                  ) : (
                                    // Direct single purchase (no items array)
                                    <>
                                      <p className="font-medium text-gray-900">{sale.productName}</p>
                                      <p className="text-xs text-gray-500">ID: {sale.orderId}</p>
                                      <p className="text-xs text-green-600">Direct Purchase</p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-gray-900">{sale.buyer?.name || 'N/A'}</p>
                                <p className="text-sm text-gray-600">{sale.buyer?.email}</p>
                                <p className="text-xs text-gray-500">{sale.buyer?.phone}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-lg font-bold text-green-600">
                                {sale.currency}
                                {typeof sale.totalAmount === 'number' ? sale.totalAmount.toLocaleString() : 
                                 typeof sale.amount === 'number' ? sale.amount.toLocaleString() : sale.amount}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {sale.paymentMethod?.toUpperCase() || 'CARD'}
                                </span>
                                {sale.type === 'bulk' && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    BULK
                                  </span>
                                )}
                                {sale.type === 'cart-single' && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    CART
                                  </span>
                                )}
                                {sale.type === 'single' && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    DIRECT
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              <div>
                                <p>{sale.purchaseDate}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(sale.timestamp).toLocaleTimeString('en-MY', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  sale.status === 'paid' ? 'bg-green-100 text-green-800' :
                                  sale.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                                  sale.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                                  sale.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {sale.status === 'paid' ? '💰 PAYMENT DONE' :
                                   sale.status === 'preparing' ? '📦 PREPARING' :
                                   sale.status === 'in_transit' ? '🚛 IN TRANSIT' :
                                   sale.status === 'delivered' ? '✅ COMPLETED' :
                                   '💰 PAYMENT DONE'}
                                </span>
                                {sale.trackingNumber && (
                                  <p className="text-xs text-blue-600 font-mono">
                                    Track: {sale.trackingNumber}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedSale(sale);
                                    setShowTrackingModal(true);
                                  }}
                                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md hover:bg-blue-200 transition-colors"
                                >
                                  <Truck className="w-3 h-3 mr-1" />
                                  Track Order
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedSale(sale);
                                    setShowSaleModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-700 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                >
                                  Details
                                </button>
                                <button
                                  onClick={() => showDeleteConfirmation(sale)}
                                  className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-md hover:bg-red-200 transition-colors"
                                  title="Delete sales record"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User Orders Tab */}
          {activeTab === 'user-orders' && (
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-black">User Orders Tracking</h3>
                <p className="text-gray-600 mt-1">Track all orders by specific users - both bulk and individual purchases</p>
              </div>
              <div className="p-6">
                {/* Search and Filter Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search by customer name or email..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <select
                      value={userOrdersFilter}
                      onChange={(e) => setUserOrdersFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Customers</option>
                      <option value="bulk-only">Bulk Orders Only</option>
                      <option value="high-spenders">High Spenders (&gt;RM500)</option>
                      <option value="recent">Recent Orders (7 days)</option>
                    </select>
                  </div>
                </div>

                {/* User Orders Summary */}
                {(() => {
                  const filteredUsers = Array.from(new Set(salesRecords.map(sale => sale.buyer?.email).filter(Boolean)))
                    .map(email => {
                      const userOrders = salesRecords.filter(sale => sale.buyer?.email === email);
                      const bulkOrders = userOrders.filter(order => order.type === 'bulk');
                      const totalSpent = userOrders.reduce((sum, order) => {
                        const amount = order.type === 'bulk' ? order.totalAmount : order.amount;
                        return sum + (typeof amount === 'number' ? amount : parseFloat(amount) || 0);
                      }, 0);
                      const lastOrder = userOrders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                      const userName = userOrders[0]?.buyer?.name || 'Unknown User';
                      
                      return { email, userName, userOrders, bulkOrders, totalSpent, lastOrder };
                    })
                    .filter(user => {
                      const matchesSearch = userSearchTerm === '' || 
                        user.userName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(userSearchTerm.toLowerCase());
                      
                      let matchesFilter = true;
                      if (userOrdersFilter === 'bulk-only') {
                        matchesFilter = user.bulkOrders.length > 0;
                      } else if (userOrdersFilter === 'high-spenders') {
                        matchesFilter = user.totalSpent > 500;
                      } else if (userOrdersFilter === 'recent') {
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        matchesFilter = new Date(user.lastOrder?.timestamp) > weekAgo;
                      }
                      
                      return matchesSearch && matchesFilter;
                    });

                  const filteredBulkOrders = filteredUsers.reduce((sum, user) => sum + user.bulkOrders.length, 0);
                  const filteredSingleOrders = filteredUsers.reduce((sum, user) => sum + user.userOrders.filter(order => order.type !== 'bulk').length, 0);

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-100">
                              {userOrdersFilter === 'all' ? 'Total Customers' : 'Filtered Customers'}
                            </p>
                            <p className="text-2xl font-bold">{filteredUsers.length}</p>
                          </div>
                          <Users className="w-8 h-8 text-blue-200" />
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-100">Bulk Orders</p>
                            <p className="text-2xl font-bold">{filteredBulkOrders}</p>
                          </div>
                          <Package className="w-8 h-8 text-purple-200" />
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-100">Single Orders</p>
                            <p className="text-2xl font-bold">{filteredSingleOrders}</p>
                          </div>
                          <ShoppingCart className="w-8 h-8 text-green-200" />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Users with Orders Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-4 px-4 font-bold text-gray-900">Customer</th>
                        <th className="text-left py-4 px-4 font-bold text-gray-900">Total Orders</th>
                        <th className="text-left py-4 px-4 font-bold text-gray-900">Bulk Orders</th>
                        <th className="text-left py-4 px-4 font-bold text-gray-900">Total Spent</th>
                        <th className="text-left py-4 px-4 font-bold text-gray-900">Last Order</th>
                        <th className="text-left py-4 px-4 font-bold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(new Set(salesRecords.map(sale => sale.buyer?.email).filter(Boolean)))
                        .map(email => {
                          const userOrders = salesRecords.filter(sale => sale.buyer?.email === email);
                          const bulkOrders = userOrders.filter(order => order.type === 'bulk');
                          const totalSpent = userOrders.reduce((sum, order) => {
                            const amount = order.type === 'bulk' ? order.totalAmount : order.amount;
                            return sum + (typeof amount === 'number' ? amount : parseFloat(amount) || 0);
                          }, 0);
                          const lastOrder = userOrders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                          const userName = userOrders[0]?.buyer?.name || 'Unknown User';
                          
                          return {
                            email,
                            userName,
                            userOrders,
                            bulkOrders,
                            totalSpent,
                            lastOrder
                          };
                        })
                        .filter(user => {
                          // Search filter
                          const matchesSearch = userSearchTerm === '' || 
                            user.userName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(userSearchTerm.toLowerCase());
                          
                          // Category filter
                          let matchesFilter = true;
                          if (userOrdersFilter === 'bulk-only') {
                            matchesFilter = user.bulkOrders.length > 0;
                          } else if (userOrdersFilter === 'high-spenders') {
                            matchesFilter = user.totalSpent > 500;
                          } else if (userOrdersFilter === 'recent') {
                            const weekAgo = new Date();
                            weekAgo.setDate(weekAgo.getDate() - 7);
                            matchesFilter = new Date(user.lastOrder?.timestamp) > weekAgo;
                          }
                          
                          return matchesSearch && matchesFilter;
                        })
                        .map(user => (
                          <tr key={user.email} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-semibold text-gray-900">{user.userName}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {user.userOrders.length} orders
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              {user.bulkOrders.length > 0 ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                  <Package className="w-3 h-3 mr-1" />
                                  {user.bulkOrders.length} bulk
                                </span>
                              ) : (
                                <span className="text-gray-400 text-sm">No bulk orders</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-semibold text-green-600">
                                RM{user.totalSpent.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <p className="text-sm text-gray-900">{user.lastOrder?.purchaseDate}</p>
                                <p className="text-xs text-gray-500">
                                  {user.lastOrder?.type === 'bulk' ? 'Bulk Order' : 'Single Item'}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <button
                                onClick={() => {
                                  setSelectedUserOrders({
                                    email: user.email,
                                    name: user.userName,
                                    orders: user.userOrders,
                                    totalOrders: user.userOrders.length,
                                    bulkOrders: user.bulkOrders.length,
                                    totalSpent: user.totalSpent
                                  });
                                  setShowUserOrdersModal(true);
                                }}
                                className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                              >
                                View Orders
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {salesRecords.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No customer orders found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Offers Tab */}
          {activeTab === 'offers' && (
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-black">Customer Offers</h3>
                <p className="text-gray-600">Manage price offers from customers</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {products
                    .filter(p => p.offers && p.offers.length > 0)
                    .map((product) => 
                      product.offers?.map((offer) => (
                        <div key={offer.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex space-x-4">
                              <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                              <div>
                                <h4 className="font-bold text-black">{product.name}</h4>
                                <p className="text-gray-600">{product.brand}</p>
                                <p className="text-sm text-gray-500">Original: {settings.currency}{product.price.toLocaleString()}</p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">{settings.currency}{offer.offeredPrice.toLocaleString()}</p>
                              <p className="text-sm text-gray-600">{offer.customerName}</p>
                              <p className="text-xs text-gray-500">{offer.customerEmail}</p>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                                offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                offer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {offer.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          
                          {offer.message && (
                            <div className="mt-3 p-3 bg-gray-50 rounded">
                              <p className="text-sm text-gray-700">{offer.message}</p>
                            </div>
                          )}
                          
                          {offer.status === 'pending' && (
                            <div className="mt-4 flex space-x-2">
                              <button 
                                onClick={() => {
                                  // Accept offer logic
                                  const updatedProducts = products.map(p => {
                                    if (p.id === product.id) {
                                      const updatedOffers = p.offers?.map(o => 
                                        o.id === offer.id ? { ...o, status: 'accepted' as const, acceptedAt: new Date().toISOString() } : o
                                      );
                                      return { ...p, offers: updatedOffers };
                                    }
                                    return p;
                                  });
                                  saveProducts(updatedProducts);
                                  
                                  // Create notification for user when offer is accepted
                                  const userNotifications = JSON.parse(localStorage.getItem(`notifications_${offer.userId}`) || '[]');
                                  const newNotification = {
                                    id: 'notification_' + Date.now(),
                                    userId: offer.userId,
                                    type: 'offer_accepted',
                                    title: 'Offer Accepted! 🎉',
                                    message: `Great news! Your offer of RM${offer.offeredPrice.toLocaleString()} for "${product.name}" has been accepted. Please complete payment to secure your item.`,
                                    productId: product.id,
                                    productName: product.name,
                                    offerId: offer.id,
                                    offeredPrice: offer.offeredPrice,
                                    isRead: false,
                                    createdAt: new Date().toISOString()
                                  };
                                  
                                  const updatedNotifications = [newNotification, ...userNotifications];
                                  localStorage.setItem(`notifications_${offer.userId}`, JSON.stringify(updatedNotifications));
                                  
                                  // Trigger notification update event
                                  window.dispatchEvent(new Event('notificationUpdated'));
                                  
                                  console.log('✅ Offer accepted and notification created for user:', offer.userId);
                                }}
                                className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                              >
                                Accept Offer
                              </button>
                              <button 
                                onClick={() => {
                                  // Reject offer logic
                                  const updatedProducts = products.map(p => {
                                    if (p.id === product.id) {
                                      const updatedOffers = p.offers?.map(o => 
                                        o.id === offer.id ? { ...o, status: 'rejected' as const } : o
                                      );
                                      return { ...p, offers: updatedOffers };
                                    }
                                    return p;
                                  });
                                  saveProducts(updatedProducts);
                                  
                                  // Create notification for user when offer is rejected
                                  const userNotifications = JSON.parse(localStorage.getItem(`notifications_${offer.userId}`) || '[]');
                                  const newNotification = {
                                    id: 'notification_' + Date.now(),
                                    userId: offer.userId,
                                    type: 'offer_rejected',
                                    title: 'Offer Update',
                                    message: `Your offer of RM${offer.offeredPrice.toLocaleString()} for "${product.name}" was not accepted. Feel free to browse other items or make a new offer.`,
                                    productId: product.id,
                                    productName: product.name,
                                    offerId: offer.id,
                                    isRead: false,
                                    createdAt: new Date().toISOString()
                                  };
                                  
                                  const updatedNotifications = [newNotification, ...userNotifications];
                                  localStorage.setItem(`notifications_${offer.userId}`, JSON.stringify(updatedNotifications));
                                  
                                  // Trigger notification update event
                                  window.dispatchEvent(new Event('notificationUpdated'));
                                  
                                  console.log('❌ Offer rejected and notification created for user:', offer.userId);
                                }}
                                className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                              >
                                Reject Offer
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                </div>
                
                {products.every(p => !p.offers || p.offers.length === 0) && (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No offers yet</h3>
                    <p className="text-gray-600">Customer offers will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Sales Analytics */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-black mb-4">Sales Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg">
                    <h4 className="text-lg font-semibold mb-2">Total Revenue</h4>
                    <p className="text-3xl font-bold">{settings.currency}{totalRevenue.toLocaleString()}</p>
                    <p className="text-blue-100 text-sm mt-2">From {totalSold} sold items</p>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg">
                    <h4 className="text-lg font-semibold mb-2">Conversion Rate</h4>
                    <p className="text-3xl font-bold">{products.length > 0 ? ((totalSold / products.length) * 100).toFixed(1) : 0}%</p>
                    <p className="text-green-100 text-sm mt-2">{totalSold} of {products.length} items sold</p>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg">
                    <h4 className="text-lg font-semibold mb-2">Average Price</h4>
                    <p className="text-3xl font-bold">{settings.currency}{products.length > 0 ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length).toLocaleString() : 0}</p>
                    <p className="text-purple-100 text-sm mt-2">Per item average</p>
                  </div>
                </div>
              </div>

              {/* Brand Performance */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-black mb-4">Brand Performance</h3>
                <div className="space-y-4">
                  {['Nike', 'Adidas', 'Supreme', 'Off-White', 'Jordan', 'Yeezy'].map((brand) => {
                    const brandProducts = products.filter(p => p.brand === brand);
                    const brandSold = brandProducts.filter(p => p.isSoldOut).length;
                    const brandRevenue = brandProducts.filter(p => p.isSoldOut).reduce((sum, p) => sum + p.price, 0);
                    const conversionRate = brandProducts.length > 0 ? (brandSold / brandProducts.length) * 100 : 0;
                    
                    return (
                      <div key={brand} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center font-bold mr-4">
                            {brand.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-black">{brand}</h4>
                            <p className="text-sm text-gray-600">{brandProducts.length} items • {brandSold} sold</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{settings.currency}{brandRevenue.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{conversionRate.toFixed(1)}% conversion</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-black mb-4">Recent Sales Activity</h3>
                <div className="space-y-3">
                  {products
                    .filter(p => p.isSoldOut)
                    .slice(0, 10)
                    .map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover mr-3" />
                          <div>
                            <p className="font-medium text-black">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.brand}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{settings.currency}{product.price.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">SOLD</p>
                        </div>
                      </div>
                    ))}
                </div>
                
                {products.filter(p => p.isSoldOut).length === 0 && (
                  <div className="text-center py-8">
                    <Globe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No sales activity yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Newsletter Tab */}
          {activeTab === 'newsletter' && (
            <div className="space-y-6">
              {/* Newsletter Subscribers */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-black">Newsletter Subscribers</h3>
                  <button
                    onClick={refreshNewsletterData}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    🔄 Refresh
                  </button>
                </div>
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-gray-600">Total Subscribers: <span className="font-bold text-black">{getNewsletterSubscribers().length}</span></p>
                  {getNewsletterSubscribers().length > 0 && (
                    <div className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded px-3 py-1">
                      ⚠️ Email notifications are stored locally. For real emails, integrate with email service.
                    </div>
                  )}
                </div>
                
                {getNewsletterSubscribers().length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium text-gray-700">Email</th>
                          <th className="text-left p-3 font-medium text-gray-700">Subscribed Date</th>
                          <th className="text-left p-3 font-medium text-gray-700">Status</th>
                          <th className="text-left p-3 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getNewsletterSubscribers().map((subscriber: any, index: number) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3">{subscriber.email}</td>
                            <td className="p-3">{new Date(subscriber.subscribedAt).toLocaleDateString()}</td>
                            <td className="p-3">
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => deleteNewsletterSubscriber(subscriber.email)}
                                className="text-red-600 hover:text-red-800 text-xs bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                              >
                                🗑️ Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p>No newsletter subscribers yet</p>
                  </div>
                )}
              </div>

              {/* Newsletter Notifications History */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-black">Notification History</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={refreshNewsletterData}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      🔄 Refresh
                    </button>
                    {getNewsletterNotifications().length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                      >
                        🗑️ Clear All
                      </button>
                    )}
                  </div>
                </div>
                
                {getNewsletterNotifications().length > 0 ? (
                  <div className="space-y-4">
                    {getNewsletterNotifications().reverse().map((notification: any) => (
                      <div key={notification.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{notification.productName}</h4>
                          <span className="text-sm text-gray-500">{new Date(notification.sentAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <img 
                            src={notification.productImage} 
                            alt={notification.productName}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">{notification.productBrand}</p>
                            <p className="text-sm font-medium">RM{notification.productPrice}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Sent to</p>
                            <p className="font-medium text-black">{notification.recipientCount} subscribers</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Globe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p>No notifications sent yet</p>
                  </div>
                )}
              </div>

              {/* Manual Newsletter */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">Send Manual Newsletter</h3>
                    <p className="text-gray-600">Send custom notifications to all newsletter subscribers</p>
                  </div>
                  <button
                    onClick={refreshNewsletterData}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    🔄 Refresh
                  </button>
                </div>
                
                {/* Email Integration Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-800 mb-2">📧 Email System Status</h4>
                  <p className="text-blue-700 text-sm mb-2">
                    <strong>Current:</strong> Demo mode - notifications stored locally and shown in user&apos;s bell icon.
                  </p>
                  <p className="text-blue-700 text-sm">
                    <strong>For Real Emails:</strong> Integrate with email services (SendGrid, Mailgun, Resend) to send actual emails to subscribers.
                  </p>
                </div>
                
                {/* Quick Templates */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quick Templates</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setNewsletterSubject('🔥 Flash Sale Alert - Limited Time Only!');
                        setNewsletterMessage(`Hey fashion lovers!\n\nDon't miss out on our exclusive flash sale! Get amazing discounts on your favorite items.\n\n💥 Limited time offer - Shop now before it's gone!\n\nVisit our store: ${window.location.origin}\n\nHappy Shopping!\n${settings.storeName} Team`);
                      }}
                      className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200"
                    >
                      Flash Sale
                    </button>
                    <button
                      onClick={() => {
                        setNewsletterSubject('✨ New Collection Just Dropped!');
                        setNewsletterMessage(`Hi there!\n\nWe're excited to announce our latest collection is now available! Fresh styles, premium quality, and unbeatable prices.\n\n🎉 Be the first to shop the newest arrivals\n\nCheck them out: ${window.location.origin}/new-arrivals\n\nStay stylish!\n${settings.storeName} Team`);
                      }}
                      className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200"
                    >
                      New Collection
                    </button>
                    <button
                      onClick={() => {
                        setNewsletterSubject('🎁 Exclusive Offer Just For You!');
                        setNewsletterMessage(`Dear valued customer,\n\nAs one of our newsletter subscribers, you get exclusive early access to special deals!\n\n💎 VIP discount code: SUBSCRIBER10\n🛍️ Valid for your next purchase\n\nShop now: ${window.location.origin}\n\nThanks for being awesome!\n${settings.storeName} Team`);
                      }}
                      className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full hover:bg-purple-200"
                    >
                      Exclusive Offer
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input
                      type="text"
                      value={newsletterSubject}
                      onChange={(e) => setNewsletterSubject(e.target.value)}
                      placeholder="e.g., Flash Sale - 50% Off All Items!"
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      value={newsletterMessage}
                      onChange={(e) => setNewsletterMessage(e.target.value)}
                      placeholder="Write your newsletter message here..."
                      rows={6}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => {
                        setNewsletterSubject('');
                        setNewsletterMessage('');
                      }}
                      className="text-gray-600 hover:text-gray-800 text-sm"
                    >
                      Clear Form
                    </button>
                    <button 
                      onClick={sendManualNewsletter}
                      className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                      disabled={getNewsletterSubscribers().length === 0}
                    >
                      Send Newsletter ({getNewsletterSubscribers().length} recipients)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Logo & Branding */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-black mb-4">Logo & Branding</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo</label>
                    <div 
                      className="w-full h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file && file.type.startsWith('image/')) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            updateSettings({ logoUrl: e.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => document.getElementById('logoInput')?.click()}
                    >
                      {settings.logoUrl ? (
                        <div className="text-center">
                          <img src={settings.logoUrl} alt="Logo" className="max-h-20 max-w-full object-contain mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Click or drag to change</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 font-medium">Drop logo here</p>
                          <p className="text-xs text-gray-500">or click to select</p>
                        </div>
                      )}
                    </div>
                    <input
                      id="logoInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            updateSettings({ logoUrl: e.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo Preview</label>
                    <div className="w-full h-32 border border-gray-200 rounded-md flex items-center justify-center bg-white">
                      {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo Preview" className="max-h-28 max-w-full object-contain" />
                      ) : (
                        <span className="text-gray-400 text-sm">Logo preview will appear here</span>
                      )}
                    </div>
                    {settings.logoUrl && (
                      <button
                        onClick={() => updateSettings({ logoUrl: '' })}
                        className="mt-2 text-xs text-red-600 hover:text-red-800"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => updateSettings({ storeName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="RYDSTORE.MY"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Slogan</label>
                    <input
                      type="text"
                      value={settings.storeSlogan}
                      onChange={(e) => updateSettings({ storeSlogan: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="ITEM SELECTED"
                    />
                  </div>
                </div>
              </div>

              {/* Hero Section Settings */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-black mb-4">Homepage Hero Section</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hero Background Image</label>
                    <div 
                      className="w-full h-40 border-2 border-dashed border-gray-300 rounded-md overflow-hidden bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file && file.type.startsWith('image/')) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            updateSettings({ heroBackgroundImage: e.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => document.getElementById('heroInput')?.click()}
                    >
                      {settings.heroBackgroundImage ? (
                        <div className="relative w-full h-full">
                          <img src={settings.heroBackgroundImage} alt="Hero Background" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <div className="text-center text-white">
                              <Upload className="h-6 w-6 mx-auto mb-1" />
                              <p className="text-xs">Click or drag to change</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          <Upload className="h-12 w-12 text-gray-400 mb-3" />
                          <p className="text-sm text-gray-600 font-medium">Drop hero background here</p>
                          <p className="text-xs text-gray-500">or click to select (1920x1080px recommended)</p>
                        </div>
                      )}
                    </div>
                    <input
                      id="heroInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            updateSettings({ heroBackgroundImage: e.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <div className="mt-3 flex gap-2">
                      {settings.heroBackgroundImage && (
                        <button
                          onClick={() => updateSettings({ heroBackgroundImage: '' })}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          Remove Background
                        </button>
                      )}
                      <button
                        onClick={() => updateSettings({ heroBackgroundImage: settings.heroBackgroundImage ? '' : 'https://via.placeholder.com/1920x800/1f2937/ffffff?text=Hero+Background' })}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          settings.heroBackgroundImage 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {settings.heroBackgroundImage ? 'Background ON' : 'Background OFF'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
                      <input
                        type="text"
                        value={settings.heroTitle}
                        onChange={(e) => updateSettings({ heroTitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="RYDSTORE.MY"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
                      <input
                        type="text"
                        value={settings.heroSubtitle}
                        onChange={(e) => updateSettings({ heroSubtitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="ITEM SELECTED"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hero Description</label>
                    <textarea
                      value={settings.heroDescription}
                      onChange={(e) => updateSettings({ heroDescription: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Discover exclusive fashion pieces from top international brands..."
                    />
                    <p className="text-xs text-gray-500 mt-1">This description appears on your homepage</p>
                  </div>
                </div>
              </div>

              {/* Contact & Business Settings */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-black mb-4">Contact & Business Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => updateSettings({ contactEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="contact@rydstore.my"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="text"
                      value={settings.phoneNumber || '+60123456789'}
                      onChange={(e) => updateSettings({ phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="+60123456789"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => updateSettings({ currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="RM">RM (Malaysian Ringgit)</option>
                      <option value="$">$ (US Dollar)</option>
                      <option value="€">€ (Euro)</option>
                      <option value="£">£ (British Pound)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Quick Actions & Preview */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-black mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => window.open('/', '_blank')}
                    className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Globe className="h-5 w-5 mr-2" />
                    Preview Website
                  </button>
                  
                  <button 
                    onClick={() => {
                      // Save all settings
                      alert('Settings saved successfully!');
                    }}
                    className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Save All Changes
                  </button>
                </div>
              </div>

              {/* Site Status & Maintenance */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-black mb-4">Site Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-black">Maintenance Mode</h4>
                      <p className="text-sm text-gray-600">Turn on to show maintenance page to customers</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode || false}
                        onChange={(e) => updateSettings({ maintenanceMode: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-green-800">Website Status</h4>
                      <p className="text-sm text-green-600">
                        {settings.maintenanceMode ? 'Under Maintenance' : 'Live & Running'}
                      </p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${settings.maintenanceMode ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  </div>
                </div>
              </div>

              {/* Payment Settings */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-black mb-4">Payment Methods</h3>
                <div className="space-y-4">
                  {['Bank Transfer', 'Touch n Go', 'GrabPay', 'Cash on Delivery'].map((method) => (
                    <div key={method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-black">{method}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload Instructions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-black mb-4">📁 Image Upload Guide</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Easy Drag & Drop Upload:</h4>
                  <ol className="list-decimal list-inside text-sm text-green-700 space-y-1">
                    <li><strong>Drag & Drop:</strong> Simply drag your image file into the upload area</li>
                    <li><strong>Click to Select:</strong> Or click on the upload area to browse files</li>
                    <li><strong>Instant Preview:</strong> Your image will appear immediately after upload</li>
                    <li><strong>Remove Image:</strong> Click &quot;Remove&quot; button to delete uploaded image</li>
                    <li><strong>Supported Formats:</strong> JPG, PNG, GIF, WebP</li>
                  </ol>
                  
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-green-700 font-semibold">� Logo Recommendations:</p>
                        <ul className="text-xs text-green-600 mt-1 space-y-0.5">
                          <li>• PNG format with transparent background</li>
                          <li>• Square or rectangular shape</li>
                          <li>• High resolution (300x300px+)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs text-green-700 font-semibold">🖼️ Hero Background Tips:</p>
                        <ul className="text-xs text-green-600 mt-1 space-y-0.5">
                          <li>• Landscape orientation (1920x1080px)</li>
                          <li>• High quality, not pixelated</li>
                          <li>• Good contrast for text overlay</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Account */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-black mb-4">Admin Account</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Username</label>
                    <input
                      type="text"
                      defaultValue="admin"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Login</label>
                    <input
                      type="text"
                      value={new Date().toLocaleDateString()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      readOnly
                    />
                  </div>
                </div>
                
                <button className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
                  Change Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-black to-gray-900 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Edit Product</h2>
                  <p className="text-gray-300 text-sm mt-1">Update product information</p>
                </div>
                <button 
                  onClick={closeEditModal}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Product Image Upload */}
              <div className="text-center">
                <div 
                  className="w-full h-48 mx-auto mb-4 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                  onDrop={async (e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                      try {
                        // Check file size (limit 25MB)
                        if (file.size > 25 * 1024 * 1024) {
                          alert('Image too large! Please use images under 25MB.');
                          return;
                        }
                        
                        const compressedImage = await compressImage(file);
                        setEditForm({...editForm, image: compressedImage});
                      } catch (error) {
                        console.error('Error compressing image:', error);
                        alert('Error processing image. Please try a different image.');
                      }
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => document.getElementById('editProductImageInput')?.click()}
                >
                  {(editForm.image || editingProduct.image) ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={editForm.image || editingProduct.image} 
                        alt="Product" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="text-center text-white">
                          <Upload className="h-6 w-6 mx-auto mb-1" />
                          <p className="text-xs">Click or drag to change</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Upload className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600 font-medium">Drop product image here</p>
                      <p className="text-xs text-gray-500">or click to select (JPG, PNG, GIF)</p>
                    </div>
                  )}
                </div>
                <input
                  id="editProductImageInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        // Check file size (limit 25MB)
                        if (file.size > 25 * 1024 * 1024) {
                          alert('Image too large! Please use images under 25MB.');
                          return;
                        }
                        
                        const compressedImage = await compressImage(file);
                        setEditForm({...editForm, image: compressedImage});
                      } catch (error) {
                        console.error('Error compressing image:', error);
                        alert('Error processing image. Please try a different image.');
                      }
                    }
                  }}
                />
              </div>

              {/* Additional Images Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Images (Optional)
                </label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {editForm.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img src={img} alt={`Additional ${index + 1}`} className="w-full h-20 object-cover rounded border" />
                      <button
                        type="button"
                        onClick={() => removeImageFromForm('edit', index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {editForm.images.length < 5 && (
                    <div 
                      className="w-full h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-gray-400"
                      onClick={() => document.getElementById('editAdditionalImagesInput')?.click()}
                    >
                      <Plus className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <input
                  id="editAdditionalImagesInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        // Check file size (limit 25MB for additional images)
                        if (file.size > 25 * 1024 * 1024) {
                          alert('Additional image too large! Please use images under 25MB.');
                          return;
                        }
                        
                        const compressedImage = await compressImage(file, 600, 0.7);
                        addImageToForm('edit', compressedImage);
                      } catch (error) {
                        console.error('Error compressing additional image:', error);
                        alert('Error processing image. Please try a different image.');
                      }
                    }
                  }}
                />
                <p className="text-xs text-gray-500">Add up to 5 additional images for the product gallery</p>
              </div>

              {/* Product Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Brand</label>
                  <select
                    value={editForm.brand}
                    onChange={(e) => setEditForm({...editForm, brand: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  >
                    <option value="Nike">Nike</option>
                    <option value="Adidas">Adidas</option>
                    <option value="Supreme">Supreme</option>
                    <option value="Off-White">Off-White</option>
                    <option value="Jordan">Jordan</option>
                    <option value="Yeezy">Yeezy</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price ({settings.currency})</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: Number(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  >
                    <option value="shirts">SHIRTS - T-Shirts & Casual Wear</option>
                    <option value="pants">PANTS - Jeans & Trousers</option>
                    <option value="jackets">JACKETS - Hoodies & Outerwear</option>
                    <option value="accessories">ACCESSORIES - Caps, Bags & Watches</option>
                    <option value="collection">COLLECTION - Special Collections & Limited Items</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                  <input
                    type="text"
                    value={editForm.color}
                    onChange={(e) => setEditForm({...editForm, color: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="e.g. Black, White, Red"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Available Sizes</label>
                  <input
                    type="text"
                    value={editForm.size.join(', ')}
                    onChange={(e) => setEditForm({...editForm, size: e.target.value.split(', ').filter(s => s.trim())})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="S, M, L, XL or 40, 41, 42"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="Product description..."
                />
              </div>

              {/* Featured Product Toggle */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1 flex items-center">
                      ⭐ Featured Product
                    </h3>
                    <p className="text-sm text-gray-600">Featured products will be displayed prominently on the homepage</p>
                  </div>
                  <button
                    onClick={() => setEditForm({...editForm, isFeatured: !editForm.isFeatured})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                      editForm.isFeatured ? 'bg-yellow-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        editForm.isFeatured ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Product Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Product Status</h3>
                <div className="flex items-center space-x-4">
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                    editingProduct.isSoldOut 
                      ? 'bg-red-100 text-red-800' 
                      : editingProduct.inStock 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {editingProduct.isSoldOut ? '🔴 SOLD OUT' : editingProduct.inStock ? '✅ AVAILABLE' : '⚪ UNAVAILABLE'}
                  </div>
                  
                  <button
                    onClick={() => toggleProductStatus(editingProduct)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      editingProduct.isSoldOut 
                        ? 'bg-black hover:bg-gray-800 text-white' 
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {editingProduct.isSoldOut ? 'Mark Available' : 'Mark as Sold'}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button 
                onClick={closeEditModal}
                className="px-6 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              >
                Cancel
              </button>
              <button 
                onClick={saveEditProduct}
                className="px-6 py-3 bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform animate-pulse">
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-red-500 via-red-600 to-pink-600 text-white p-6 rounded-t-3xl">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                  <Trash2 className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Delete Product</h2>
                <p className="text-red-100 text-sm mt-1">This action cannot be undone</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Product Preview */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src={productToDelete.image} 
                    alt={productToDelete.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{productToDelete.name}</h3>
                <p className="text-gray-600">{productToDelete.brand}</p>
                <p className="text-xl font-bold text-red-600 mt-2">{settings.currency}{productToDelete.price.toLocaleString()}</p>
              </div>

              {/* Warning Message */}
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-red-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-red-800 font-semibold text-sm">Are you absolutely sure?</h4>
                    <p className="text-red-700 text-sm mt-1">
                      This will permanently delete <strong>&quot;{productToDelete.name}&quot;</strong> from your store. 
                      All associated data including offers will be lost.
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Status</p>
                  <p className={`font-semibold text-sm ${
                    productToDelete.isSoldOut ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {productToDelete.isSoldOut ? 'SOLD OUT' : 'AVAILABLE'}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Offers</p>
                  <p className="font-semibold text-sm text-gray-800">
                    {productToDelete.offers?.length || 0} offers
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-3xl flex justify-between space-x-3">
              <button 
                onClick={closeDeleteModal}
                className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteProduct}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Add New Product</h2>
                  <p className="text-green-100 text-sm mt-1">Add a new product to your store</p>
                </div>
                <button 
                  onClick={closeAddModal}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Product Image Upload */}
              <div className="text-center">
                <div 
                  className="w-full h-48 mx-auto mb-4 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                  onDrop={async (e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                      try {
                        // Check file size (limit 25MB)
                        if (file.size > 25 * 1024 * 1024) {
                          showWarningModal('File Too Large', 'The selected image is too large. Please choose an image under 25MB.\n\n💡 Tip: Use image compression tools to reduce file size while maintaining quality.');
                          return;
                        }
                        
                        const compressedImage = await compressImage(file);
                        setAddForm({...addForm, image: compressedImage});
                      } catch (error) {
                        console.error('Error compressing image:', error);
                        alert('Error processing image. Please try a different image.');
                      }
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => document.getElementById('addProductImageInput')?.click()}
                >
                  {addForm.image ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={addForm.image} 
                        alt="Product Preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="text-center text-white">
                          <Upload className="h-6 w-6 mx-auto mb-1" />
                          <p className="text-xs">Click or drag to change</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Upload className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600 font-medium">Drop product image here</p>
                      <p className="text-xs text-gray-500">or click to select (JPG, PNG, GIF)</p>
                    </div>
                  )}
                </div>
                <input
                  id="addProductImageInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        // Check file size (limit 25MB)
                        if (file.size > 25 * 1024 * 1024) {
                          alert('Image too large! Please use images under 25MB.');
                          return;
                        }
                        
                        const compressedImage = await compressImage(file);
                        setAddForm({...addForm, image: compressedImage});
                      } catch (error) {
                        console.error('Error compressing image:', error);
                        alert('Error processing image. Please try a different image.');
                      }
                    }
                  }}
                />
              </div>

              {/* Additional Images Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Images (Optional)
                </label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {addForm.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img src={img} alt={`Additional ${index + 1}`} className="w-full h-20 object-cover rounded border" />
                      <button
                        type="button"
                        onClick={() => removeImageFromForm('add', index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {addForm.images.length < 5 && (
                    <div 
                      className="w-full h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-gray-400"
                      onClick={() => document.getElementById('addAdditionalImagesInput')?.click()}
                    >
                      <Plus className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <input
                  id="addAdditionalImagesInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        // Check file size (limit 25MB for additional images)
                        if (file.size > 25 * 1024 * 1024) {
                          alert('Additional image too large! Please use images under 25MB.');
                          return;
                        }
                        
                        const compressedImage = await compressImage(file, 600, 0.7); // Smaller for additional images
                        addImageToForm('add', compressedImage);
                      } catch (error) {
                        console.error('Error compressing additional image:', error);
                        alert('Error processing image. Please try a different image.');
                      }
                    }
                  }}
                />
                <p className="text-xs text-gray-500">Add up to 5 additional images for the product gallery</p>
              </div>

              {/* Product Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Brand *</label>
                  <select
                    value={addForm.brand}
                    onChange={(e) => setAddForm({...addForm, brand: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="Nike">Nike</option>
                    <option value="Adidas">Adidas</option>
                    <option value="Supreme">Supreme</option>
                    <option value="Off-White">Off-White</option>
                    <option value="Jordan">Jordan</option>
                    <option value="Yeezy">Yeezy</option>
                    <option value="Uniqlo">Uniqlo</option>
                    <option value="H&M">H&M</option>
                    <option value="Zara">Zara</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price ({settings.currency}) *</label>
                  <input
                    type="number"
                    value={addForm.price}
                    onChange={(e) => setAddForm({...addForm, price: Number(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm({...addForm, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select Category *</option>
                    <option value="shirts">SHIRTS - T-Shirts & Casual Wear</option>
                    <option value="pants">PANTS - Jeans & Trousers</option>
                    <option value="jackets">JACKETS - Hoodies & Outerwear</option>
                    <option value="accessories">ACCESSORIES - Caps, Bags & Watches</option>
                    <option value="collection">COLLECTION - Special Collections & Limited Items</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                  <input
                    type="text"
                    value={addForm.color}
                    onChange={(e) => setAddForm({...addForm, color: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="e.g. Black, White, Red"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Available Sizes</label>
                  <input
                    type="text"
                    value={addForm.size.join(', ')}
                    onChange={(e) => setAddForm({...addForm, size: e.target.value.split(', ').filter(s => s.trim())})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="S, M, L, XL or 40, 41, 42"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={addForm.description}
                  onChange={(e) => setAddForm({...addForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Product description..."
                />
              </div>

              {/* Featured Product Toggle */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1 flex items-center">
                      ⭐ Featured Product
                    </h3>
                    <p className="text-sm text-gray-600">Featured products will be displayed prominently on the homepage</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddForm({...addForm, isFeatured: !addForm.isFeatured})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                      addForm.isFeatured ? 'bg-yellow-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        addForm.isFeatured ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Product Preview */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Product Preview</h3>
                <div className="text-sm text-gray-600">
                  <p><span className="font-medium">Name:</span> {addForm.name || 'Enter product name'}</p>
                  <p><span className="font-medium">Brand:</span> {addForm.brand}</p>
                  <p><span className="font-medium">Category:</span> {addForm.category}</p>
                  <p><span className="font-medium">Price:</span> {settings.currency}{addForm.price.toLocaleString()}</p>
                  {addForm.color && <p><span className="font-medium">Color:</span> {addForm.color}</p>}
                  {addForm.size.length > 0 && <p><span className="font-medium">Sizes:</span> {addForm.size.join(', ')}</p>}
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      addForm.isFeatured 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {addForm.isFeatured ? '⭐ FEATURED' : '📦 REGULAR'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button 
                onClick={closeAddModal}
                className="px-6 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              >
                Cancel
              </button>
              <button 
                onClick={saveAddProduct}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">User Details</h2>
                    <p className="text-blue-200 text-sm">{selectedUser.fullName || selectedUser.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {/* Personal Information */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="h-px bg-gradient-to-r from-gray-300 to-transparent flex-1"></div>
                  <h3 className="text-lg font-semibold text-gray-900 px-4 bg-white">Personal Information</h3>
                  <div className="h-px bg-gradient-to-l from-gray-300 to-transparent flex-1"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                    <p className="text-gray-900">{selectedUser.fullName || selectedUser.name || 'Not provided'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                    <p className="text-gray-900">{selectedUser.phone || 'Not provided'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">User ID</label>
                    <p className="text-gray-900 font-mono text-sm">{selectedUser.id}</p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              {selectedUser.address && (
                <div>
                  <div className="flex items-center mb-4">
                    <div className="h-px bg-gradient-to-r from-gray-300 to-transparent flex-1"></div>
                    <h3 className="text-lg font-semibold text-gray-900 px-4 bg-white">Address Information</h3>
                    <div className="h-px bg-gradient-to-l from-gray-300 to-transparent flex-1"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Street Address</label>
                      <p className="text-gray-900">{selectedUser.address.street || 'Not provided'}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                        <p className="text-gray-900">{selectedUser.address.city || 'Not provided'}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                        <p className="text-gray-900">{selectedUser.address.state || 'Not provided'}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Postcode</label>
                        <p className="text-gray-900">{selectedUser.address.postcode || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
                      <p className="text-gray-900">{selectedUser.address.country || 'Malaysia'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Registration Information */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="h-px bg-gradient-to-r from-gray-300 to-transparent flex-1"></div>
                  <h3 className="text-lg font-semibold text-gray-900 px-4 bg-white">Registration Details</h3>
                  <div className="h-px bg-gradient-to-l from-gray-300 to-transparent flex-1"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Registration Date</label>
                    <p className="text-gray-900">
                      {selectedUser.registrationDate !== 'Unknown' 
                        ? new Date(selectedUser.registrationDate).toLocaleDateString('en-MY', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Unknown'
                      }
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Profile Completeness</label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${
                            (selectedUser.fullName && selectedUser.phone && selectedUser.address?.street && selectedUser.address?.city && selectedUser.address?.state && selectedUser.address?.postcode) 
                              ? 'bg-green-500 w-full' 
                              : 'bg-yellow-500 w-3/4'
                          }`}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {(selectedUser.fullName && selectedUser.phone && selectedUser.address?.street && selectedUser.address?.city && selectedUser.address?.state && selectedUser.address?.postcode) 
                          ? '100%' 
                          : '75%'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sales Details Modal */}
      {showSaleModal && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Sale Details</h2>
                    <p className="text-green-200 text-sm">Order ID: {selectedSale.orderId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSaleModal(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {/* Product Information */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="h-px bg-gradient-to-r from-gray-300 to-transparent flex-1"></div>
                  <h3 className="text-lg font-semibold text-gray-900 px-4 bg-white">
                    {selectedSale.items && selectedSale.items.length > 0 ? 
                      (selectedSale.type === 'bulk' ? 'Bulk Order Information' : 'Cart Order Information') : 
                      'Product Information'
                    }
                  </h3>
                  <div className="h-px bg-gradient-to-l from-gray-300 to-transparent flex-1"></div>
                </div>
                
                {selectedSale.items && selectedSale.items.length > 0 ? (
                  <div className="space-y-4">
                    {/* Bulk Order Summary */}
                    <div className="bg-purple-50 border-2 border-purple-200 p-6 rounded-xl">
                      <div className="flex items-center space-x-3 mb-4">
                        <Package className="w-6 h-6 text-purple-600" />
                        <h4 className="text-xl font-bold text-purple-900">
                          Bulk Order ({selectedSale.items?.length || 0} items)
                        </h4>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                          BULK
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-600">Total Amount:</span>
                          <p className="text-2xl font-bold text-green-600">
                            {selectedSale.currency}{typeof selectedSale.totalAmount === 'number' ? selectedSale.totalAmount.toLocaleString() : selectedSale.totalAmount}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Payment Method:</span>
                          <p className="font-semibold text-gray-900">{selectedSale.paymentMethod?.toUpperCase() || 'CARD'}</p>
                        </div>
                      </div>
                      {selectedSale.shipping && (
                        <div className="text-sm text-gray-600">
                          <span>Shipping: {selectedSale.currency}{selectedSale.shipping.cost} ({selectedSale.shipping.type})</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Items List */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h5 className="font-semibold text-gray-900 mb-3">Items in this order:</h5>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {selectedSale.items?.map((item: any, index: number) => (
                          <div key={index} className="bg-white p-3 rounded-lg flex items-center space-x-3 border">
                            <img 
                              src={item.productImage || item.image} 
                              alt={item.productName || item.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">{item.productName || item.name}</p>
                              <p className="text-xs text-gray-600">Qty: {item.quantity} • {selectedSale.currency}{item.price.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 text-sm">
                                {selectedSale.currency}{(item.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )) || []}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-6 bg-gray-50 p-6 rounded-xl">
                    <img 
                      src={selectedSale.productImage} 
                      alt={selectedSale.productName}
                      className="w-24 h-24 object-cover rounded-xl shadow-lg"
                    />
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedSale.productName}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Sale Price:</span>
                          <p className="text-2xl font-bold text-green-600">
                            {selectedSale.currency}{typeof selectedSale.amount === 'number' ? selectedSale.amount.toLocaleString() : selectedSale.amount}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Payment Method:</span>
                          <p className="font-semibold text-gray-900">{selectedSale.paymentMethod?.toUpperCase() || 'CARD'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Buyer Information */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="h-px bg-gradient-to-r from-gray-300 to-transparent flex-1"></div>
                  <h3 className="text-lg font-semibold text-gray-900 px-4 bg-white">Buyer Information</h3>
                  <div className="h-px bg-gradient-to-l from-gray-300 to-transparent flex-1"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                    <p className="text-gray-900 font-medium">{selectedSale.buyer?.name || 'N/A'}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                    <p className="text-gray-900">{selectedSale.buyer?.email || 'N/A'}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                    <p className="text-gray-900 font-mono">{selectedSale.buyer?.phone || 'N/A'}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Customer ID</label>
                    <p className="text-gray-900 font-mono text-sm">{selectedSale.buyer?.id || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              {selectedSale.buyer?.address && (
                <div>
                  <div className="flex items-center mb-4">
                    <div className="h-px bg-gradient-to-r from-gray-300 to-transparent flex-1"></div>
                    <h3 className="text-lg font-semibold text-gray-900 px-4 bg-white">Delivery Address</h3>
                    <div className="h-px bg-gradient-to-l from-gray-300 to-transparent flex-1"></div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Street Address</label>
                        <p className="text-gray-900">{selectedSale.buyer.address.street || 'Not provided'}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                          <p className="text-gray-900">{selectedSale.buyer.address.city || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                          <p className="text-gray-900">{selectedSale.buyer.address.state || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Postcode</label>
                          <p className="text-gray-900 font-mono">{selectedSale.buyer.address.postcode || 'Not provided'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
                        <p className="text-gray-900">{selectedSale.buyer.address.country || 'Malaysia'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Details */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="h-px bg-gradient-to-r from-gray-300 to-transparent flex-1"></div>
                  <h3 className="text-lg font-semibold text-gray-900 px-4 bg-white">Transaction Details</h3>
                  <div className="h-px bg-gradient-to-l from-gray-300 to-transparent flex-1"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Purchase Date</label>
                    <p className="text-gray-900 font-medium">{selectedSale.purchaseDate}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedSale.timestamp).toLocaleString('en-MY', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Transaction Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedSale.status === 'paid' ? 'bg-green-100 text-green-800' :
                      selectedSale.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                      selectedSale.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                      selectedSale.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedSale.status === 'paid' ? '💰 PAYMENT DONE' :
                       selectedSale.status === 'preparing' ? '📦 PREPARING' :
                       selectedSale.status === 'in_transit' ? '🚛 IN TRANSIT' :
                       selectedSale.status === 'delivered' ? '✅ COMPLETED' :
                       '💰 PAYMENT DONE'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  let printData = `
SALE DETAILS - ${selectedSale.orderId}
==================================`;
                  
                  if (selectedSale.items && selectedSale.items.length > 0) {
                    printData += `
${selectedSale.type === 'bulk' ? 'BULK' : 'CART'} ORDER (${selectedSale.items.length} items)
Total Amount: ${selectedSale.currency}${selectedSale.totalAmount || selectedSale.amount}
Payment: ${selectedSale.paymentMethod?.toUpperCase()}
${selectedSale.shipping ? `Shipping: ${selectedSale.currency}${selectedSale.shipping.cost} (${selectedSale.shipping.type})` : ''}

ITEMS ORDERED:`;
                    selectedSale.items.forEach((item: any, index: number) => {
                      printData += `
${index + 1}. ${item.productName || item.name} - Qty: ${item.quantity || 1} - ${selectedSale.currency}${((item.price || 0) * (item.quantity || 1)).toLocaleString()}`;
                    });
                  } else {
                    printData += `
Product: ${selectedSale.productName}
Amount: ${selectedSale.currency}${selectedSale.amount}
Payment: ${selectedSale.paymentMethod?.toUpperCase()}`;
                  }
                  
                  printData += `

BUYER DETAILS:
Name: ${selectedSale.buyer?.name}
Email: ${selectedSale.buyer?.email}
Phone: ${selectedSale.buyer?.phone}

DELIVERY ADDRESS:
${selectedSale.buyer?.address?.street}
${selectedSale.buyer?.address?.city}, ${selectedSale.buyer?.address?.state} ${selectedSale.buyer?.address?.postcode}
${selectedSale.buyer?.address?.country}

Date: ${selectedSale.purchaseDate}
Time: ${new Date(selectedSale.timestamp).toLocaleString()}
                  `;
                  navigator.clipboard.writeText(printData.trim());
                  alert('Sale details copied to clipboard!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Copy Details
              </button>
              <button
                onClick={() => setShowSaleModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Orders Modal */}
      {showUserOrdersModal && selectedUserOrders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">User Order History</h2>
                    <p className="text-blue-200 text-sm">
                      {selectedUserOrders.name} • {selectedUserOrders.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const bulkOrders = selectedUserOrders.orders.filter((order: any) => order.type === 'bulk');
                      if (bulkOrders.length === 0) {
                        alert('No bulk orders found for shipping export');
                        return;
                      }
                      
                      const shippingExport = `
BULK ORDERS SHIPPING MANIFEST
============================
Customer: ${selectedUserOrders.name}
Email: ${selectedUserOrders.email}
Total Bulk Orders: ${bulkOrders.length}

${bulkOrders.map((order: any, idx: number) => `
ORDER ${idx + 1} - ${order.orderId}
Date: ${order.purchaseDate}
Items: ${order.items?.length || 0} items
${order.items?.map((item: any) => `  • ${item.productName || item.name} (Qty: ${item.quantity})`).join('\n') || ''}
Shipping: ${order.shipping?.type || 'Standard'} - RM${order.shipping?.cost || '0'}
Address: ${order.buyer?.address?.street || 'N/A'}, ${order.buyer?.address?.city || ''} ${order.buyer?.address?.postcode || ''}, ${order.buyer?.address?.state || ''}
Phone: ${order.buyer?.phone || 'N/A'}
Total: RM${order.totalAmount}
`).join('\n')}
                      `;
                      navigator.clipboard.writeText(shippingExport.trim());
                      alert('Bulk orders shipping manifest copied!');
                    }}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-lg text-sm transition-colors"
                    title="Export all bulk orders for shipping"
                  >
                    🚚 Export Shipping
                  </button>
                  <button
                    onClick={() => setShowUserOrdersModal(false)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {/* Customer Summary */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedUserOrders.totalOrders}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600">Bulk Orders</p>
                  <p className="text-2xl font-bold text-purple-600">{selectedUserOrders.bulkOrders}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600">Single Orders</p>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedUserOrders.totalOrders - selectedUserOrders.bulkOrders}
                  </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    RM{selectedUserOrders.totalSpent.toLocaleString()}
                  </p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600">Need Shipping</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {selectedUserOrders.orders.filter((order: any) => order.type === 'bulk').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">📦 Bulk orders</p>
                </div>
              </div>

              {/* Orders List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order History</h3>
                <div className="space-y-4">
                  {selectedUserOrders.orders
                    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((order: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {order.type === 'bulk' ? (
                            <div className="flex items-center space-x-2">
                              <Package className="w-5 h-5 text-purple-600" />
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
                                BULK ORDER
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <ShoppingCart className="w-5 h-5 text-green-600" />
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                                SINGLE ITEM
                              </span>
                            </div>
                          )}
                          <span className="text-sm text-gray-600">
                            Order ID: {order.orderId}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            RM{((order.type === 'bulk' ? order.totalAmount : order.amount) || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">{order.purchaseDate}</p>
                        </div>
                      </div>

                      {/* Order Content */}
                      {order.type === 'bulk' ? (
                        <div className="bg-purple-50 rounded-lg p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-purple-900">
                              Bulk Order ({order.items?.length || 0} items)
                            </h4>
                            {order.shipping && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
                                {order.shipping.type}
                              </span>
                            )}
                          </div>
                          
                          {/* Items Preview */}
                          <div className="bg-white p-3 rounded-lg border border-purple-200">
                            <p className="text-sm font-medium text-gray-700 mb-2">📦 Items:</p>
                            <div className="text-sm text-gray-600">
                              {order.items?.slice(0, 3).map((item: any, idx: number) => (
                                <span key={idx}>
                                  {item.productName || item.name} (x{item.quantity})
                                  {idx < Math.min(2, (order.items?.length || 0) - 1) ? ', ' : ''}
                                </span>
                              ))}
                              {(order.items?.length || 0) > 3 && (
                                <span className="text-purple-600 font-medium">
                                  ... +{(order.items?.length || 0) - 3} more items
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Shipping Details */}
                          <div className="bg-white p-3 rounded-lg border border-purple-200">
                            <p className="text-sm font-medium text-gray-700 mb-2">🚚 Shipping Info:</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-500">Cost:</span>
                                <span className="font-semibold ml-1">
                                  RM{order.shipping?.cost || '0'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Method:</span>
                                <span className="font-semibold ml-1">
                                  {order.shipping?.type || 'Standard'}
                                </span>
                              </div>
                            </div>
                            {order.buyer?.address && (
                              <div className="mt-2 text-xs">
                                <span className="text-gray-500">Address:</span>
                                <p className="font-medium text-gray-700 mt-1">
                                  {order.buyer.address.street}, {order.buyer.address.city} {order.buyer.address.postcode}, {order.buyer.address.state}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Quick Actions for Shipping */}
                          <div className="flex space-x-2 pt-1">
                            <button 
                              onClick={() => {
                                const itemsList = order.items?.map((item: any) => `${item.productName || item.name || 'Unknown Item'} (Qty: ${item.quantity || 1})`).join('\n') || 'No items found';
                                const shippingInfo = `
SHIPPING DETAILS - Order ${order.orderId || 'N/A'}
==========================================
Customer: ${order.buyer?.name || 'N/A'}
Phone: ${order.buyer?.phone || 'N/A'}
Email: ${order.buyer?.email || 'N/A'}

DELIVERY ADDRESS:
${order.buyer?.address?.street || 'N/A'}
${order.buyer?.address?.city || 'N/A'} ${order.buyer?.address?.postcode || 'N/A'}
${order.buyer?.address?.state || 'N/A'}, Malaysia

ITEMS TO SHIP:
${itemsList}

SHIPPING METHOD: ${order.shipping?.type || 'Standard'}
SHIPPING COST: RM${order.shipping?.cost || '0'}
ORDER TOTAL: RM${order.totalAmount || order.amount || '0'}

PAYMENT METHOD: ${order.paymentMethod?.toUpperCase() || 'CARD'}
ORDER DATE: ${order.purchaseDate || 'N/A'}
                                `.trim();
                                navigator.clipboard.writeText(shippingInfo);
                                alert('Shipping details copied for fulfillment!');
                              }}
                              className="text-xs bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition-colors"
                            >
                              📋 Copy Shipping Details
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-green-50 rounded-lg p-3 flex items-center space-x-3">
                          <img 
                            src={order.productImage} 
                            alt={order.productName}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-green-900">{order.productName}</h4>
                            <p className="text-sm text-gray-600">
                              Payment: {order.paymentMethod?.toUpperCase() || 'CARD'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  const printData = `
USER ORDER HISTORY
==================
Customer: ${selectedUserOrders.name}
Email: ${selectedUserOrders.email}
Total Orders: ${selectedUserOrders.totalOrders}
Bulk Orders: ${selectedUserOrders.bulkOrders}
Total Spent: RM${selectedUserOrders.totalSpent.toLocaleString()}

ORDER DETAILS:
${selectedUserOrders.orders.map((order: any, idx: number) => {
  let orderText = `
${idx + 1}. ${order.type === 'bulk' ? 'BULK ORDER' : 'SINGLE ITEM'} - ${order.orderId}
Date: ${order.purchaseDate}
Amount: RM${(order.type === 'bulk' ? order.totalAmount : order.amount).toLocaleString()}`;

  if (order.type === 'bulk') {
    orderText += `
Items: ${order.items?.map((item: any) => `${item.productName || item.name} (Qty: ${item.quantity})`).join(', ') || 'N/A'}`;
  } else {
    orderText += `
Product: ${order.productName}`;
  }
  
  return orderText;
}).join('\n')}
                  `;
                  navigator.clipboard.writeText(printData.trim());
                  alert('User order history copied to clipboard!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Copy History
              </button>
              <button
                onClick={() => setShowUserOrdersModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Tracking Modal */}
      {showTrackingModal && selectedSale && (
        <OrderTrackingModal
          isOpen={showTrackingModal}
          onClose={() => setShowTrackingModal(false)}
          order={selectedSale}
          onUpdateOrder={updateOrderStatus}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && saleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Sales Record</h3>
                <p className="text-gray-600">Action ni tak boleh undo. Confirm untuk delete?</p>
              </div>

              {/* Sale Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  {saleToDelete.productImage ? (
                    <img 
                      src={saleToDelete.productImage} 
                      alt={saleToDelete.productName}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {saleToDelete.items && saleToDelete.items.length > 0 
                        ? `${saleToDelete.type === 'bulk' ? 'Bulk Order' : 'Cart Order'} (${saleToDelete.items.length} items)`
                        : saleToDelete.productName
                      }
                    </p>
                    <p className="text-sm text-gray-600">ID: {saleToDelete.orderId}</p>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Customer:</span> {saleToDelete.buyer?.name} ({saleToDelete.buyer?.email})</p>
                  <p><span className="font-medium">Amount:</span> {saleToDelete.currency}{(saleToDelete.totalAmount || saleToDelete.amount)?.toLocaleString()}</p>
                  <p><span className="font-medium">Date:</span> {saleToDelete.purchaseDate}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSaleToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteSalesRecord(saleToDelete.id, saleToDelete.buyer?.email);
                    setShowDeleteConfirm(false);
                    setSaleToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  🗑️ Delete Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Modal */}
      <CustomModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
      />
    </div>
  );
}