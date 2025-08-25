import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  BarChart3,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Upload,
  Download,
} from 'lucide-react';
import { useFeedback } from '@/components/ui/status-popup';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  brand: string;
  model?: string;
  category: string;
  subcategory?: string;
  type: 'physical' | 'service_item' | 'consumable';
  sku: string;
  barcode?: string;
  description: string;
  
  // Stock Information
  currentStock: number;
  minStock: number;
  maxStock: number;
  reservedStock: number;
  availableStock: number;
  
  // Pricing
  costPrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  margin: number;
  taxRate: number;
  
  // Location & Supplier
  location: string;
  warehouse: string;
  supplier: string;
  supplierSku?: string;
  
  // Tracking
  lastRestock: string;
  lastSale: string;
  soldThisMonth: number;
  soldTotal: number;
  turnoverRate: number;
  
  // Status
  status: 'active' | 'inactive' | 'discontinued' | 'out_of_stock' | 'low_stock';
  isActive: boolean;
  
  // Dates
  createdAt: string;
  updatedAt: string;
  
  // Additional Info
  weight?: number;
  dimensions?: string;
  notes?: string;
  tags: string[];
}

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER' | 'RETURN';
  quantity: number;
  remainingStock: number;
  reason: string;
  reference?: string;
  cost?: number;
  totalValue?: number;
  location: string;
  warehouse: string;
  date: string;
  user: string;
  notes?: string;
}

interface ProductFormData {
  name: string;
  brand: string;
  model: string;
  category: string;
  subcategory: string;
  type: 'physical' | 'service_item' | 'consumable';
  sku: string;
  barcode: string;
  description: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice: number;
  taxRate: number;
  location: string;
  warehouse: string;
  supplier: string;
  supplierSku: string;
  weight: number;
  dimensions: string;
  notes: string;
  tags: string[];
  isActive: boolean;
}

// Mock data
const productCategories = [
  'Tires', 'Engine Parts', 'Brake Components', 'Electrical', 'Filters', 
  'Fluids & Lubricants', 'Tools & Equipment', 'Accessories', 'Body Parts', 
  'Transmission', 'Suspension', 'Exhaust', 'Cooling System', 'Fuel System'
];

const warehouses = ['Main Warehouse', 'Shop Floor', 'Service Bay', 'Parts Counter', 'Storage Room'];

const mockProducts: Product[] = [
  {
    id: 'PROD-001',
    name: 'Michelin Energy XM2',
    brand: 'Michelin',
    model: 'Energy XM2',
    category: 'Tires',
    subcategory: 'Passenger Tires',
    type: 'physical',
    sku: 'MICH-XM2-185-65R15',
    barcode: '123456789012',
    description: '185/65R15 All-Season Passenger Tire',
    currentStock: 24,
    minStock: 10,
    maxStock: 100,
    reservedStock: 2,
    availableStock: 22,
    costPrice: 180000,
    sellingPrice: 220000,
    wholesalePrice: 200000,
    margin: 22.22,
    taxRate: 18,
    location: 'A1-B2',
    warehouse: 'Main Warehouse',
    supplier: 'Michelin Uganda',
    supplierSku: 'MICH-XM2-185',
    lastRestock: '2024-01-15',
    lastSale: '2024-01-20',
    soldThisMonth: 12,
    soldTotal: 156,
    turnoverRate: 8.5,
    status: 'active',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-20',
    weight: 8.5,
    dimensions: '185x65x15',
    notes: 'Popular all-season tire',
    tags: ['best-seller', 'all-season', 'passenger']
  },
  {
    id: 'PROD-002',
    name: 'Engine Oil 5W-30',
    brand: 'Castrol',
    model: 'GTX 5W-30',
    category: 'Fluids & Lubricants',
    subcategory: 'Engine Oil',
    type: 'consumable',
    sku: 'CAST-GTX-5W30-5L',
    barcode: '123456789013',
    description: '5L Castrol GTX 5W-30 Synthetic Engine Oil',
    currentStock: 48,
    minStock: 20,
    maxStock: 200,
    reservedStock: 5,
    availableStock: 43,
    costPrice: 65000,
    sellingPrice: 85000,
    wholesalePrice: 75000,
    margin: 30.77,
    taxRate: 18,
    location: 'C1-D3',
    warehouse: 'Main Warehouse',
    supplier: 'Castrol Distributor',
    supplierSku: 'GTX-5W30-5L',
    lastRestock: '2024-01-18',
    lastSale: '2024-01-21',
    soldThisMonth: 32,
    soldTotal: 245,
    turnoverRate: 12.3,
    status: 'active',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-21',
    weight: 5.2,
    dimensions: '25x15x30',
    notes: 'High demand item',
    tags: ['fast-moving', 'synthetic', 'popular']
  },
  {
    id: 'PROD-003',
    name: 'Brake Pads Front Set',
    brand: 'Brembo',
    model: 'P56 047',
    category: 'Brake Components',
    subcategory: 'Brake Pads',
    type: 'physical',
    sku: 'BREM-P56047-FRONT',
    barcode: '123456789014',
    description: 'Front brake pads set for Toyota Corolla',
    currentStock: 8,
    minStock: 15,
    maxStock: 60,
    reservedStock: 2,
    availableStock: 6,
    costPrice: 120000,
    sellingPrice: 160000,
    wholesalePrice: 140000,
    margin: 33.33,
    taxRate: 18,
    location: 'B2-C1',
    warehouse: 'Shop Floor',
    supplier: 'Brembo Parts',
    supplierSku: 'P56047',
    lastRestock: '2024-01-10',
    lastSale: '2024-01-19',
    soldThisMonth: 6,
    soldTotal: 89,
    turnoverRate: 6.2,
    status: 'low_stock',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-19',
    weight: 2.8,
    dimensions: '15x10x5',
    notes: 'Low stock - reorder soon',
    tags: ['low-stock', 'toyota', 'brake-system']
  },
];

const mockStockMovements: StockMovement[] = [
  {
    id: 'MOV-001',
    productId: 'PROD-001',
    productName: 'Michelin Energy XM2',
    type: 'OUT',
    quantity: 4,
    remainingStock: 24,
    reason: 'Sale to customer',
    reference: 'INV-2024-001',
    cost: 180000,
    totalValue: 720000,
    location: 'A1-B2',
    warehouse: 'Main Warehouse',
    date: '2024-01-20',
    user: 'Sarah Manager',
    notes: 'Sold to John Doe - Cash payment'
  },
  {
    id: 'MOV-002',
    productId: 'PROD-002',
    productName: 'Engine Oil 5W-30',
    type: 'IN',
    quantity: 20,
    remainingStock: 48,
    reason: 'Purchase/Restock',
    reference: 'PO-2024-005',
    cost: 65000,
    totalValue: 1300000,
    location: 'C1-D3',
    warehouse: 'Main Warehouse',
    date: '2024-01-18',
    user: 'Admin User',
    notes: 'Restock from Castrol Distributor'
  },
  {
    id: 'MOV-003',
    productId: 'PROD-003',
    productName: 'Brake Pads Front Set',
    type: 'OUT',
    quantity: 2,
    remainingStock: 8,
    reason: 'Service installation',
    reference: 'JOB-2024-012',
    cost: 120000,
    totalValue: 240000,
    location: 'B2-C1',
    warehouse: 'Shop Floor',
    date: '2024-01-19',
    user: 'Mike Technician',
    notes: 'Used in brake service job'
  },
];

export default function InventoryManagement() {
  const { success, error } = useFeedback();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(mockStockMovements);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState("inventory");

  const [productForm, setProductForm] = useState<ProductFormData>({
    name: '', brand: '', model: '', category: '', subcategory: '', type: 'physical',
    sku: '', barcode: '', description: '', currentStock: 0, minStock: 0, maxStock: 0,
    costPrice: 0, sellingPrice: 0, wholesalePrice: 0, taxRate: 18, location: '',
    warehouse: '', supplier: '', supplierSku: '', weight: 0, dimensions: '',
    notes: '', tags: [], isActive: true,
  });

  const [stockForm, setStockForm] = useState({
    type: 'IN' as 'IN' | 'OUT' | 'ADJUSTMENT',
    quantity: 0,
    reason: '',
    reference: '',
    cost: 0,
    location: '',
    warehouse: '',
    notes: '',
  });

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  // Calculate inventory statistics
  const inventoryStats = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0);
    const lowStockCount = products.filter(p => p.currentStock <= p.minStock).length;
    const outOfStockCount = products.filter(p => p.currentStock === 0).length;
    const inactiveCount = products.filter(p => !p.isActive).length;
    const avgTurnover = products.reduce((sum, p) => sum + p.turnoverRate, 0) / totalProducts;

    return {
      totalProducts,
      totalValue,
      lowStockCount,
      outOfStockCount,
      inactiveCount,
      avgTurnover: avgTurnover.toFixed(1),
    };
  }, [products]);

  // Reset forms
  const resetProductForm = useCallback(() => {
    setProductForm({
      name: '', brand: '', model: '', category: '', subcategory: '', type: 'physical',
      sku: '', barcode: '', description: '', currentStock: 0, minStock: 0, maxStock: 0,
      costPrice: 0, sellingPrice: 0, wholesalePrice: 0, taxRate: 18, location: '',
      warehouse: '', supplier: '', supplierSku: '', weight: 0, dimensions: '',
      notes: '', tags: [], isActive: true,
    });
  }, []);

  const resetStockForm = useCallback(() => {
    setStockForm({
      type: 'IN',
      quantity: 0,
      reason: '',
      reference: '',
      cost: 0,
      location: '',
      warehouse: '',
      notes: '',
    });
  }, []);

  // Handle add product
  const handleAddProduct = useCallback(async () => {
    try {
      if (!productForm.name || !productForm.brand || !productForm.category || !productForm.sku) {
        error('Please fill in all required fields');
        return;
      }

      if (products.some(p => p.sku === productForm.sku)) {
        error('A product with this SKU already exists');
        return;
      }

      const margin = productForm.costPrice > 0 
        ? ((productForm.sellingPrice - productForm.costPrice) / productForm.sellingPrice * 100)
        : 0;

      const newProduct: Product = {
        id: `PROD-${Date.now()}`,
        ...productForm,
        availableStock: productForm.currentStock,
        reservedStock: 0,
        margin: margin,
        soldThisMonth: 0,
        soldTotal: 0,
        turnoverRate: 0,
        status: productForm.currentStock === 0 ? 'out_of_stock' : 
                productForm.currentStock <= productForm.minStock ? 'low_stock' : 'active',
        lastRestock: new Date().toISOString().split('T')[0],
        lastSale: '',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      setProducts(prev => [...prev, newProduct]);
      success(`Product ${newProduct.name} added successfully!`);
      resetProductForm();
      setShowAddDialog(false);
    } catch (err) {
      console.error('Error adding product:', err);
      error('Failed to add product. Please try again.');
    }
  }, [productForm, products, success, error, resetProductForm]);

  // Handle edit product
  const handleEditProduct = useCallback(async () => {
    try {
      if (!selectedProduct || !productForm.name || !productForm.brand || !productForm.category) {
        error('Please fill in all required fields');
        return;
      }

      const margin = productForm.costPrice > 0 
        ? ((productForm.sellingPrice - productForm.costPrice) / productForm.sellingPrice * 100)
        : 0;

      const updatedProduct: Product = {
        ...selectedProduct,
        ...productForm,
        margin: margin,
        availableStock: productForm.currentStock - selectedProduct.reservedStock,
        status: productForm.currentStock === 0 ? 'out_of_stock' : 
                productForm.currentStock <= productForm.minStock ? 'low_stock' : 'active',
        updatedAt: new Date().toISOString().split('T')[0],
      };

      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updatedProduct : p));
      success(`Product ${updatedProduct.name} updated successfully!`);
      resetProductForm();
      setShowEditDialog(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error('Error updating product:', err);
      error('Failed to update product. Please try again.');
    }
  }, [selectedProduct, productForm, success, error, resetProductForm]);

  // Handle stock adjustment
  const handleStockAdjustment = useCallback(async () => {
    try {
      if (!selectedProduct || !stockForm.quantity || !stockForm.reason) {
        error('Please fill in all required fields');
        return;
      }

      const currentStock = selectedProduct.currentStock;
      const newStock = stockForm.type === 'IN' ? 
        currentStock + stockForm.quantity : 
        stockForm.type === 'OUT' ? 
        currentStock - stockForm.quantity : 
        stockForm.quantity; // For ADJUSTMENT, quantity is the new total

      if (newStock < 0) {
        error('Insufficient stock for this operation');
        return;
      }

      // Update product stock
      const updatedProduct: Product = {
        ...selectedProduct,
        currentStock: newStock,
        availableStock: newStock - selectedProduct.reservedStock,
        status: newStock === 0 ? 'out_of_stock' : 
                newStock <= selectedProduct.minStock ? 'low_stock' : 'active',
        lastRestock: stockForm.type === 'IN' ? new Date().toISOString().split('T')[0] : selectedProduct.lastRestock,
        lastSale: stockForm.type === 'OUT' ? new Date().toISOString().split('T')[0] : selectedProduct.lastSale,
        updatedAt: new Date().toISOString().split('T')[0],
      };

      // Create stock movement record
      const newMovement: StockMovement = {
        id: `MOV-${Date.now()}`,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        type: stockForm.type,
        quantity: stockForm.quantity,
        remainingStock: newStock,
        reason: stockForm.reason,
        reference: stockForm.reference,
        cost: stockForm.cost || selectedProduct.costPrice,
        totalValue: (stockForm.cost || selectedProduct.costPrice) * stockForm.quantity,
        location: stockForm.location || selectedProduct.location,
        warehouse: stockForm.warehouse || selectedProduct.warehouse,
        date: new Date().toISOString().split('T')[0],
        user: 'Admin User', // In real app, get from auth context
        notes: stockForm.notes,
      };

      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updatedProduct : p));
      setStockMovements(prev => [newMovement, ...prev]);
      success(`Stock ${stockForm.type.toLowerCase()} completed for ${selectedProduct.name}`);
      resetStockForm();
      setShowStockDialog(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error('Error adjusting stock:', err);
      error('Failed to adjust stock. Please try again.');
    }
  }, [selectedProduct, stockForm, success, error, resetStockForm]);

  // Open edit dialog
  const openEditDialog = useCallback((product: Product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      brand: product.brand,
      model: product.model || '',
      category: product.category,
      subcategory: product.subcategory || '',
      type: product.type,
      sku: product.sku,
      barcode: product.barcode || '',
      description: product.description,
      currentStock: product.currentStock,
      minStock: product.minStock,
      maxStock: product.maxStock,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      wholesalePrice: product.wholesalePrice || 0,
      taxRate: product.taxRate,
      location: product.location,
      warehouse: product.warehouse,
      supplier: product.supplier,
      supplierSku: product.supplierSku || '',
      weight: product.weight || 0,
      dimensions: product.dimensions || '',
      notes: product.notes || '',
      tags: product.tags,
      isActive: product.isActive,
    });
    setShowEditDialog(true);
  }, []);

  // Open stock dialog
  const openStockDialog = useCallback((product: Product) => {
    setSelectedProduct(product);
    setStockForm(prev => ({
      ...prev,
      location: product.location,
      warehouse: product.warehouse,
      cost: product.costPrice,
    }));
    setShowStockDialog(true);
  }, []);

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'discontinued':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
          <p className="text-muted-foreground">
            Manage all products, stock levels, and pricing across the entire inventory
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {inventoryStats.totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{inventoryStats.lowStockCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inventoryStats.outOfStockCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{inventoryStats.inactiveCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Turnover</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{inventoryStats.avgTurnover}x</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">Products ({filteredProducts.length})</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Reports</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="inventory" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, brand, SKU, or barcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {productCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Products ({filteredProducts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Details</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Pricing</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.brand} {product.model && `• ${product.model}`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              SKU: {product.sku}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline">{product.category}</Badge>
                            {product.subcategory && (
                              <div className="text-xs text-muted-foreground">{product.subcategory}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{product.currentStock} units</div>
                            <div className="text-xs text-muted-foreground">
                              Min: {product.minStock} • Max: {product.maxStock}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Available: {product.availableStock}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">UGX {product.sellingPrice.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">
                              Cost: UGX {product.costPrice.toLocaleString()}
                            </div>
                            <div className="text-xs text-green-600">
                              Margin: {product.margin.toFixed(1)}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadgeColor(product.status)}>
                            {product.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">Sold: {product.soldThisMonth}/mo</div>
                            <div className="text-xs text-muted-foreground">
                              Turnover: {product.turnoverRate}x
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openEditDialog(product)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Product
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openStockDialog(product)}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Adjust Stock
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Product
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Movements Tab */}
        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Movements</CardTitle>
              <CardDescription>Track all inventory changes and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockMovements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{movement.productName}</div>
                            <div className="text-xs text-muted-foreground">
                              Stock after: {movement.remainingStock} units
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              movement.type === 'IN' ? 'bg-green-100 text-green-800' :
                              movement.type === 'OUT' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }
                          >
                            {movement.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className={cn(
                            "font-medium",
                            movement.type === 'IN' ? 'text-green-600' : 
                            movement.type === 'OUT' ? 'text-red-600' : 'text-blue-600'
                          )}>
                            {movement.type === 'IN' ? '+' : movement.type === 'OUT' ? '-' : ''}
                            {movement.quantity}
                          </div>
                        </TableCell>
                        <TableCell>{movement.reason}</TableCell>
                        <TableCell>
                          {movement.totalValue && (
                            <div className="text-sm">
                              UGX {movement.totalValue.toLocaleString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{new Date(movement.date).toLocaleDateString()}</TableCell>
                        <TableCell>{movement.user}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Low Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {products.filter(p => p.currentStock <= p.minStock).map(product => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Current: {product.currentStock} • Min: {product.minStock}
                        </div>
                      </div>
                      <Button size="sm" onClick={() => openStockDialog(product)}>
                        Restock
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {products
                    .sort((a, b) => b.soldThisMonth - a.soldThisMonth)
                    .slice(0, 5)
                    .map(product => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.soldThisMonth} sold this month
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          {product.turnoverRate}x turnover
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add a new product to the inventory with pricing and stock information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  value={productForm.brand}
                  onChange={(e) => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="Enter brand name"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={productForm.category} 
                  onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select 
                  value={productForm.type} 
                  onValueChange={(value) => setProductForm(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physical">Physical Product</SelectItem>
                    <SelectItem value="service_item">Service Item</SelectItem>
                    <SelectItem value="consumable">Consumable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={productForm.sku}
                  onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder="Product SKU"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="currentStock">Current Stock *</Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={productForm.currentStock}
                  onChange={(e) => setProductForm(prev => ({ ...prev, currentStock: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minStock">Min Stock *</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={productForm.minStock}
                  onChange={(e) => setProductForm(prev => ({ ...prev, minStock: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxStock">Max Stock *</Label>
                <Input
                  id="maxStock"
                  type="number"
                  value={productForm.maxStock}
                  onChange={(e) => setProductForm(prev => ({ ...prev, maxStock: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price *</Label>
                <Input
                  id="costPrice"
                  type="number"
                  value={productForm.costPrice}
                  onChange={(e) => setProductForm(prev => ({ ...prev, costPrice: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price *</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  value={productForm.sellingPrice}
                  onChange={(e) => setProductForm(prev => ({ ...prev, sellingPrice: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  value={productForm.taxRate}
                  onChange={(e) => setProductForm(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                  placeholder="18"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse</Label>
                <Select 
                  value={productForm.warehouse} 
                  onValueChange={(value) => setProductForm(prev => ({ ...prev, warehouse: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(warehouse => (
                      <SelectItem key={warehouse} value={warehouse}>{warehouse}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={productForm.supplier}
                  onChange={(e) => setProductForm(prev => ({ ...prev, supplier: e.target.value }))}
                  placeholder="Supplier name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Product description..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              resetProductForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information, pricing, and stock details.
            </DialogDescription>
          </DialogHeader>
          
          {/* Same form content as Add Dialog but for editing */}
          <div className="space-y-4 py-4">
            {/* Similar form fields as Add dialog... */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input
                  id="edit-name"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-brand">Brand *</Label>
                <Input
                  id="edit-brand"
                  value={productForm.brand}
                  onChange={(e) => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="Enter brand name"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="edit-costPrice">Cost Price *</Label>
                <Input
                  id="edit-costPrice"
                  type="number"
                  value={productForm.costPrice}
                  onChange={(e) => setProductForm(prev => ({ ...prev, costPrice: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-sellingPrice">Selling Price *</Label>
                <Input
                  id="edit-sellingPrice"
                  type="number"
                  value={productForm.sellingPrice}
                  onChange={(e) => setProductForm(prev => ({ ...prev, sellingPrice: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-currentStock">Current Stock *</Label>
                <Input
                  id="edit-currentStock"
                  type="number"
                  value={productForm.currentStock}
                  onChange={(e) => setProductForm(prev => ({ ...prev, currentStock: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setSelectedProduct(null);
              resetProductForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditProduct}>
              <Edit className="h-4 w-4 mr-2" />
              Update Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              {selectedProduct && `Adjust stock for ${selectedProduct.name}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stock-type">Movement Type *</Label>
              <Select 
                value={stockForm.type} 
                onValueChange={(value) => setStockForm(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN">Stock In (Add Stock)</SelectItem>
                  <SelectItem value="OUT">Stock Out (Remove Stock)</SelectItem>
                  <SelectItem value="ADJUSTMENT">Stock Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-quantity">Quantity *</Label>
              <Input
                id="stock-quantity"
                type="number"
                value={stockForm.quantity}
                onChange={(e) => setStockForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-reason">Reason *</Label>
              <Input
                id="stock-reason"
                value={stockForm.reason}
                onChange={(e) => setStockForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Reason for stock movement"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-reference">Reference</Label>
              <Input
                id="stock-reference"
                value={stockForm.reference}
                onChange={(e) => setStockForm(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="PO number, invoice, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-notes">Notes</Label>
              <Textarea
                id="stock-notes"
                value={stockForm.notes}
                onChange={(e) => setStockForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowStockDialog(false);
              setSelectedProduct(null);
              resetStockForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleStockAdjustment}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Adjust Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
