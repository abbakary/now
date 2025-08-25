import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Wrench,
  Car,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Box,
  Settings,
} from 'lucide-react';

// Types for inventory items
interface InventoryItem {
  id: string;
  name: string;
  type: 'product' | 'service' | 'part';
  category: string;
  description: string;
  price: number;
  cost: number;
  quantity: number;
  minQuantity: number;
  sku: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ServiceType {
  id: string;
  name: string;
  category: 'car_service' | 'tire_service' | 'consultation' | 'custom';
  description: string;
  basePrice: number;
  estimatedDuration: number; // in minutes
  requiredSkills: string[];
  isActive: boolean;
  createdAt: Date;
}

interface ProductCategory {
  id: string;
  name: string;
  description: string;
  type: 'product' | 'service' | 'part';
  isActive: boolean;
}

// Mock data
const mockInventoryItems: InventoryItem[] = [
  {
    id: 'item-1',
    name: 'Michelin Tire 195/65R15',
    type: 'product',
    category: 'Tires',
    description: 'Premium quality tire for passenger cars',
    price: 120.00,
    cost: 80.00,
    quantity: 25,
    minQuantity: 5,
    sku: 'MICH-195-65-15',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'item-2',
    name: 'Engine Oil 5W-30',
    type: 'product',
    category: 'Lubricants',
    description: 'Synthetic engine oil for modern vehicles',
    price: 45.00,
    cost: 25.00,
    quantity: 50,
    minQuantity: 10,
    sku: 'OIL-5W30-4L',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'item-3',
    name: 'Brake Pad Set',
    type: 'part',
    category: 'Brake Parts',
    description: 'Ceramic brake pads for front wheels',
    price: 85.00,
    cost: 45.00,
    quantity: 15,
    minQuantity: 3,
    sku: 'BRAKE-PAD-FRONT',
    isActive: true,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-20'),
  },
];

const mockServiceTypes: ServiceType[] = [
  {
    id: 'service-1',
    name: 'Oil Change Service',
    category: 'car_service',
    description: 'Complete oil change with filter replacement',
    basePrice: 60.00,
    estimatedDuration: 30,
    requiredSkills: ['basic_maintenance'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'service-2',
    name: 'Tire Installation',
    category: 'tire_service',
    description: 'Tire mounting, balancing, and alignment',
    basePrice: 25.00,
    estimatedDuration: 45,
    requiredSkills: ['tire_specialist'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'service-3',
    name: 'Brake System Inspection',
    category: 'car_service',
    description: 'Complete brake system check and testing',
    basePrice: 50.00,
    estimatedDuration: 60,
    requiredSkills: ['brake_specialist'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
];

const mockCategories: ProductCategory[] = [
  { id: 'cat-1', name: 'Tires', description: 'All types of vehicle tires', type: 'product', isActive: true },
  { id: 'cat-2', name: 'Lubricants', description: 'Engine oils and fluids', type: 'product', isActive: true },
  { id: 'cat-3', name: 'Brake Parts', description: 'Brake system components', type: 'part', isActive: true },
  { id: 'cat-4', name: 'Car Services', description: 'Vehicle maintenance services', type: 'service', isActive: true },
  { id: 'cat-5', name: 'Tire Services', description: 'Tire-related services', type: 'service', isActive: true },
];

const typeColors = {
  product: 'bg-blue-100 text-blue-800',
  service: 'bg-green-100 text-green-800',
  part: 'bg-purple-100 text-purple-800',
};

const serviceCategories = {
  car_service: 'Car Service',
  tire_service: 'Tire Service',
  consultation: 'Consultation',
  custom: 'Custom Service',
};

export default function InventoryManagement() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(mockInventoryItems);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(mockServiceTypes);
  const [categories, setCategories] = useState<ProductCategory[]>(mockCategories);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'service' | 'part'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editingService, setEditingService] = useState<ServiceType | null>(null);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);

  const [itemFormData, setItemFormData] = useState({
    name: '',
    type: 'product' as const,
    category: '',
    description: '',
    price: 0,
    cost: 0,
    quantity: 0,
    minQuantity: 0,
    sku: '',
    isActive: true,
  });

  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    category: 'car_service' as const,
    description: '',
    basePrice: 0,
    estimatedDuration: 30,
    requiredSkills: [] as string[],
    isActive: true,
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    type: 'product' as const,
    isActive: true,
  });

  // Filter inventory items
  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && item.isActive) ||
        (statusFilter === 'inactive' && !item.isActive);

      return matchesSearch && matchesType && matchesCategory && matchesStatus;
    });
  }, [inventoryItems, searchTerm, typeFilter, categoryFilter, statusFilter]);

  // Statistics
  const inventoryStats = useMemo(() => {
    const totalItems = inventoryItems.length;
    const activeItems = inventoryItems.filter(item => item.isActive).length;
    const lowStockItems = inventoryItems.filter(item => item.quantity <= item.minQuantity).length;
    const totalValue = inventoryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return { totalItems, activeItems, lowStockItems, totalValue };
  }, [inventoryItems]);

  // Form handlers
  const resetItemForm = () => {
    setItemFormData({
      name: '',
      type: 'product',
      category: '',
      description: '',
      price: 0,
      cost: 0,
      quantity: 0,
      minQuantity: 0,
      sku: '',
      isActive: true,
    });
  };

  const resetServiceForm = () => {
    setServiceFormData({
      name: '',
      category: 'car_service',
      description: '',
      basePrice: 0,
      estimatedDuration: 30,
      requiredSkills: [],
      isActive: true,
    });
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      description: '',
      type: 'product',
      isActive: true,
    });
  };

  const handleCreateItem = () => {
    const newItem: InventoryItem = {
      id: `item-${Date.now()}`,
      ...itemFormData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setInventoryItems([...inventoryItems, newItem]);
    setIsItemDialogOpen(false);
    resetItemForm();
  };

  const handleEditItem = () => {
    if (!editingItem) return;
    
    const updatedItems = inventoryItems.map(item =>
      item.id === editingItem.id 
        ? { ...item, ...itemFormData, updatedAt: new Date() }
        : item
    );
    setInventoryItems(updatedItems);
    setIsItemDialogOpen(false);
    setEditingItem(null);
    resetItemForm();
  };

  const handleCreateService = () => {
    const newService: ServiceType = {
      id: `service-${Date.now()}`,
      ...serviceFormData,
      createdAt: new Date(),
    };
    setServiceTypes([...serviceTypes, newService]);
    setIsServiceDialogOpen(false);
    resetServiceForm();
  };

  const handleCreateCategory = () => {
    const newCategory: ProductCategory = {
      id: `cat-${Date.now()}`,
      ...categoryFormData,
    };
    setCategories([...categories, newCategory]);
    setIsCategoryDialogOpen(false);
    resetCategoryForm();
  };

  const openEditItemDialog = (item: InventoryItem) => {
    setEditingItem(item);
    setItemFormData({
      name: item.name,
      type: item.type,
      category: item.category,
      description: item.description,
      price: item.price,
      cost: item.cost,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      sku: item.sku,
      isActive: item.isActive,
    });
    setIsItemDialogOpen(true);
  };

  const openCreateItemDialog = () => {
    setEditingItem(null);
    resetItemForm();
    setIsItemDialogOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setInventoryItems(inventoryItems.filter(item => item.id !== itemId));
    }
  };

  const handleToggleItemStatus = (itemId: string) => {
    const updatedItems = inventoryItems.map(item =>
      item.id === itemId ? { ...item, isActive: !item.isActive } : item
    );
    setInventoryItems(updatedItems);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Manage products, services, and pricing</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats.totalItems}</div>
            <p className="text-xs text-muted-foreground">{inventoryStats.activeItems} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{inventoryStats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">items below minimum</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${inventoryStats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">inventory value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <Wrench className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceTypes.length}</div>
            <p className="text-xs text-muted-foreground">available services</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">Inventory Items</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        {/* Inventory Items Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Inventory Items</CardTitle>
                <Button onClick={openCreateItemDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
              
              {/* Filters */}
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div className="relative w-full md:max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="part">Part</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">SKU: {item.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={typeColors[item.type]}>
                            {item.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">${item.price.toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground">Cost: ${item.cost.toFixed(2)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`${item.quantity <= item.minQuantity ? 'text-orange-600' : ''}`}>
                            {item.quantity}
                            {item.quantity <= item.minQuantity && (
                              <span className="ml-1">⚠️</span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">Min: {item.minQuantity}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.isActive ? 'default' : 'secondary'}>
                            {item.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditItemDialog(item)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleItemStatus(item.id)}>
                                {item.isActive ? (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Service Types</CardTitle>
                <Button onClick={() => setIsServiceDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Service
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Base Price</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceTypes.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-muted-foreground">{service.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            {serviceCategories[service.category]}
                          </Badge>
                        </TableCell>
                        <TableCell>${service.basePrice.toFixed(2)}</TableCell>
                        <TableCell>{service.estimatedDuration} min</TableCell>
                        <TableCell>
                          <Badge variant={service.isActive ? 'default' : 'secondary'}>
                            {service.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Categories</CardTitle>
                <Button onClick={() => setIsCategoryDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>
                          <Badge className={typeColors[category.type]}>
                            {category.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{category.description}</TableCell>
                        <TableCell>
                          <Badge variant={category.isActive ? 'default' : 'secondary'}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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
      </Tabs>

      {/* Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Create New Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="item-name">Name</Label>
              <Input
                id="item-name"
                value={itemFormData.name}
                onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                placeholder="Enter item name"
              />
            </div>

            <div>
              <Label htmlFor="item-type">Type</Label>
              <Select value={itemFormData.type} onValueChange={(v) => setItemFormData({ ...itemFormData, type: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="part">Part</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="item-category">Category</Label>
              <Select value={itemFormData.category} onValueChange={(v) => setItemFormData({ ...itemFormData, category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(cat => cat.type === itemFormData.type).map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="item-sku">SKU</Label>
              <Input
                id="item-sku"
                value={itemFormData.sku}
                onChange={(e) => setItemFormData({ ...itemFormData, sku: e.target.value })}
                placeholder="Enter SKU"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item-price">Price ($)</Label>
                <Input
                  id="item-price"
                  type="number"
                  step="0.01"
                  value={itemFormData.price}
                  onChange={(e) => setItemFormData({ ...itemFormData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="item-cost">Cost ($)</Label>
                <Input
                  id="item-cost"
                  type="number"
                  step="0.01"
                  value={itemFormData.cost}
                  onChange={(e) => setItemFormData({ ...itemFormData, cost: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item-quantity">Quantity</Label>
                <Input
                  id="item-quantity"
                  type="number"
                  value={itemFormData.quantity}
                  onChange={(e) => setItemFormData({ ...itemFormData, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="item-min-quantity">Min Quantity</Label>
                <Input
                  id="item-min-quantity"
                  type="number"
                  value={itemFormData.minQuantity}
                  onChange={(e) => setItemFormData({ ...itemFormData, minQuantity: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="item-description">Description</Label>
              <Textarea
                id="item-description"
                value={itemFormData.description}
                onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="item-active"
                checked={itemFormData.isActive}
                onCheckedChange={(checked) => setItemFormData({ ...itemFormData, isActive: checked })}
              />
              <Label htmlFor="item-active">Active</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={editingItem ? handleEditItem : handleCreateItem}
                disabled={!itemFormData.name || !itemFormData.sku}
              >
                {editingItem ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Dialog */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="service-name">Service Name</Label>
              <Input
                id="service-name"
                value={serviceFormData.name}
                onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                placeholder="Enter service name"
              />
            </div>

            <div>
              <Label htmlFor="service-category">Category</Label>
              <Select value={serviceFormData.category} onValueChange={(v) => setServiceFormData({ ...serviceFormData, category: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car_service">Car Service</SelectItem>
                  <SelectItem value="tire_service">Tire Service</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="custom">Custom Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service-price">Base Price ($)</Label>
                <Input
                  id="service-price"
                  type="number"
                  step="0.01"
                  value={serviceFormData.basePrice}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, basePrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="service-duration">Duration (min)</Label>
                <Input
                  id="service-duration"
                  type="number"
                  value={serviceFormData.estimatedDuration}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, estimatedDuration: parseInt(e.target.value) || 30 })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="service-description">Description</Label>
              <Textarea
                id="service-description"
                value={serviceFormData.description}
                onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                placeholder="Enter service description"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="service-active"
                checked={serviceFormData.isActive}
                onCheckedChange={(checked) => setServiceFormData({ ...serviceFormData, isActive: checked })}
              />
              <Label htmlFor="service-active">Active</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsServiceDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateService}
                disabled={!serviceFormData.name}
              >
                Create Service
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                placeholder="Enter category name"
              />
            </div>

            <div>
              <Label htmlFor="category-type">Type</Label>
              <Select value={categoryFormData.type} onValueChange={(v) => setCategoryFormData({ ...categoryFormData, type: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="part">Part</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category-description">Description</Label>
              <Textarea
                id="category-description"
                value={categoryFormData.description}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                placeholder="Enter category description"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="category-active"
                checked={categoryFormData.isActive}
                onCheckedChange={(checked) => setCategoryFormData({ ...categoryFormData, isActive: checked })}
              />
              <Label htmlFor="category-active">Active</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCategory}
                disabled={!categoryFormData.name}
              >
                Create Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
