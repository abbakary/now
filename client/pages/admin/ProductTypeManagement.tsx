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
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Tags,
  MoreHorizontal,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Hash,
  Target,
  Filter,
} from 'lucide-react';
import { useFeedback } from '@/components/ui/status-popup';
import { cn } from '@/lib/utils';

interface ProductCategory {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  level: number; // 0 = main category, 1 = subcategory, 2 = sub-subcategory
  
  // Configuration
  isActive: boolean;
  sortOrder: number;
  color: string;
  icon?: string;
  
  // Business Rules
  requiresModel: boolean;
  requiresSerial: boolean;
  requiresExpiry: boolean;
  trackStock: boolean;
  allowBackorder: boolean;
  
  // Defaults
  defaultTaxRate: number;
  defaultMarkupPercent: number;
  defaultWarrantyDays: number;
  
  // Statistics
  productCount: number;
  totalValue: number;
  avgPrice: number;
  fastMovingThreshold: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  notes?: string;
  tags: string[];
}

interface ProductAttribute {
  id: string;
  name: string;
  displayName: string;
  description: string;
  dataType: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date';
  
  // Configuration
  isRequired: boolean;
  isSearchable: boolean;
  isFilterable: boolean;
  isVariant: boolean; // Used for product variations
  
  // Validation
  minValue?: number;
  maxValue?: number;
  maxLength?: number;
  pattern?: string;
  allowedValues?: string[];
  
  // Categories this attribute applies to
  categoryIds: string[];
  
  // Display
  sortOrder: number;
  groupName?: string;
  helpText?: string;
  placeholder?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

interface ProductBrand {
  id: string;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  
  // Configuration
  isActive: boolean;
  isPremium: boolean;
  
  // Business Info
  countryOfOrigin?: string;
  contactEmail?: string;
  contactPhone?: string;
  
  // Statistics
  productCount: number;
  avgRating: number;
  totalSales: number;
  
  // Categories they operate in
  categoryIds: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// Mock data
const mockCategories: ProductCategory[] = [
  {
    id: 'CAT-001',
    name: 'Tires',
    description: 'All types of vehicle tires',
    level: 0,
    isActive: true,
    sortOrder: 1,
    color: 'blue',
    icon: 'Shield',
    requiresModel: true,
    requiresSerial: false,
    requiresExpiry: false,
    trackStock: true,
    allowBackorder: true,
    defaultTaxRate: 18,
    defaultMarkupPercent: 25,
    defaultWarrantyDays: 365,
    productCount: 245,
    totalValue: 15600000,
    avgPrice: 220000,
    fastMovingThreshold: 10,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    notes: 'Main tire category',
    tags: ['automotive', 'tires', 'wheels']
  },
  {
    id: 'CAT-002',
    name: 'Passenger Tires',
    description: 'Tires for passenger vehicles',
    parentId: 'CAT-001',
    level: 1,
    isActive: true,
    sortOrder: 1,
    color: 'blue',
    requiresModel: true,
    requiresSerial: false,
    requiresExpiry: false,
    trackStock: true,
    allowBackorder: true,
    defaultTaxRate: 18,
    defaultMarkupPercent: 25,
    defaultWarrantyDays: 365,
    productCount: 156,
    totalValue: 9800000,
    avgPrice: 210000,
    fastMovingThreshold: 15,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    notes: 'Standard passenger car tires',
    tags: ['passenger', 'car', 'sedan']
  },
  {
    id: 'CAT-003',
    name: 'Engine Parts',
    description: 'Engine components and parts',
    level: 0,
    isActive: true,
    sortOrder: 2,
    color: 'red',
    icon: 'Settings',
    requiresModel: true,
    requiresSerial: true,
    requiresExpiry: false,
    trackStock: true,
    allowBackorder: false,
    defaultTaxRate: 18,
    defaultMarkupPercent: 35,
    defaultWarrantyDays: 180,
    productCount: 89,
    totalValue: 8900000,
    avgPrice: 125000,
    fastMovingThreshold: 5,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-12',
    notes: 'Engine related components',
    tags: ['engine', 'mechanical', 'parts']
  },
  {
    id: 'CAT-004',
    name: 'Fluids & Lubricants',
    description: 'Oils, coolants, and other fluids',
    level: 0,
    isActive: true,
    sortOrder: 3,
    color: 'green',
    icon: 'Droplets',
    requiresModel: false,
    requiresSerial: false,
    requiresExpiry: true,
    trackStock: true,
    allowBackorder: true,
    defaultTaxRate: 18,
    defaultMarkupPercent: 30,
    defaultWarrantyDays: 0,
    productCount: 67,
    totalValue: 3400000,
    avgPrice: 45000,
    fastMovingThreshold: 20,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-18',
    notes: 'Consumable fluids',
    tags: ['fluids', 'oil', 'consumables']
  }
];

const mockAttributes: ProductAttribute[] = [
  {
    id: 'ATTR-001',
    name: 'tire_size',
    displayName: 'Tire Size',
    description: 'The size specification of the tire',
    dataType: 'text',
    isRequired: true,
    isSearchable: true,
    isFilterable: true,
    isVariant: true,
    maxLength: 20,
    pattern: '^\\d{3}/\\d{2}R\\d{2}$',
    categoryIds: ['CAT-001', 'CAT-002'],
    sortOrder: 1,
    groupName: 'Specifications',
    helpText: 'Format: 185/65R15',
    placeholder: 'e.g. 185/65R15',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 'ATTR-002',
    name: 'season_type',
    displayName: 'Season Type',
    description: 'Type of tire for different seasons',
    dataType: 'select',
    isRequired: true,
    isSearchable: true,
    isFilterable: true,
    isVariant: true,
    allowedValues: ['Summer', 'Winter', 'All-Season', 'Performance'],
    categoryIds: ['CAT-001', 'CAT-002'],
    sortOrder: 2,
    groupName: 'Specifications',
    helpText: 'Choose the appropriate season type',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 'ATTR-003',
    name: 'viscosity',
    displayName: 'Viscosity Grade',
    description: 'Oil viscosity rating',
    dataType: 'select',
    isRequired: true,
    isSearchable: true,
    isFilterable: true,
    isVariant: true,
    allowedValues: ['0W-20', '5W-20', '5W-30', '10W-30', '10W-40', '15W-40', '20W-50'],
    categoryIds: ['CAT-004'],
    sortOrder: 1,
    groupName: 'Properties',
    helpText: 'SAE viscosity grade',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

const mockBrands: ProductBrand[] = [
  {
    id: 'BRAND-001',
    name: 'Michelin',
    description: 'Premium tire manufacturer',
    website: 'https://www.michelin.com',
    isActive: true,
    isPremium: true,
    countryOfOrigin: 'France',
    contactEmail: 'info@michelin.ug',
    contactPhone: '+256 414 123 456',
    productCount: 89,
    avgRating: 4.8,
    totalSales: 15600000,
    categoryIds: ['CAT-001', 'CAT-002'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    notes: 'Leading tire brand'
  },
  {
    id: 'BRAND-002',
    name: 'Castrol',
    description: 'Leading motor oil brand',
    website: 'https://www.castrol.com',
    isActive: true,
    isPremium: true,
    countryOfOrigin: 'United Kingdom',
    contactEmail: 'info@castrol.ug',
    contactPhone: '+256 414 789 012',
    productCount: 45,
    avgRating: 4.6,
    totalSales: 8900000,
    categoryIds: ['CAT-004'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-12',
    notes: 'Premium lubricants'
  }
];

export default function ProductTypeManagement() {
  const { success, error } = useFeedback();
  const [categories, setCategories] = useState<ProductCategory[]>(mockCategories);
  const [attributes, setAttributes] = useState<ProductAttribute[]>(mockAttributes);
  const [brands, setBrands] = useState<ProductBrand[]>(mockBrands);
  const [activeTab, setActiveTab] = useState("categories");

  // Category management
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [showEditCategoryDialog, setShowEditCategoryDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    parentId: '',
    color: 'blue',
    requiresModel: false,
    requiresSerial: false,
    requiresExpiry: false,
    trackStock: true,
    allowBackorder: false,
    defaultTaxRate: 18,
    defaultMarkupPercent: 25,
    defaultWarrantyDays: 0,
    fastMovingThreshold: 10,
    isActive: true,
    notes: '',
    tags: [] as string[],
  });

  // Attribute management
  const [showAddAttributeDialog, setShowAddAttributeDialog] = useState(false);
  const [showEditAttributeDialog, setShowEditAttributeDialog] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<ProductAttribute | null>(null);

  const [attributeForm, setAttributeForm] = useState({
    name: '',
    displayName: '',
    description: '',
    dataType: 'text' as 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date',
    isRequired: false,
    isSearchable: true,
    isFilterable: true,
    isVariant: false,
    minValue: 0,
    maxValue: 0,
    maxLength: 255,
    pattern: '',
    allowedValues: [] as string[],
    categoryIds: [] as string[],
    groupName: '',
    helpText: '',
    placeholder: '',
  });

  // Brand management
  const [showAddBrandDialog, setShowAddBrandDialog] = useState(false);
  const [showEditBrandDialog, setShowEditBrandDialog] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<ProductBrand | null>(null);

  const [brandForm, setBrandForm] = useState({
    name: '',
    description: '',
    website: '',
    isActive: true,
    isPremium: false,
    countryOfOrigin: '',
    contactEmail: '',
    contactPhone: '',
    categoryIds: [] as string[],
    notes: '',
  });

  // Filter categories
  const filteredCategories = useMemo(() => {
    return categories.filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [categories, searchTerm]);

  // Get category hierarchy
  const getCategoryHierarchy = useMemo(() => {
    const hierarchy: Record<string, ProductCategory[]> = {};
    const mainCategories = categories.filter(c => c.level === 0);
    
    mainCategories.forEach(main => {
      hierarchy[main.id] = categories.filter(c => c.parentId === main.id);
    });
    
    return { mainCategories, hierarchy };
  }, [categories]);

  // Statistics
  const typeStats = useMemo(() => {
    const totalCategories = categories.length;
    const activeCategories = categories.filter(c => c.isActive).length;
    const totalAttributes = attributes.length;
    const totalBrands = brands.filter(b => b.isActive).length;
    const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);
    const totalValue = categories.reduce((sum, c) => sum + c.totalValue, 0);

    return {
      totalCategories,
      activeCategories,
      totalAttributes,
      totalBrands,
      totalProducts,
      totalValue,
    };
  }, [categories, attributes, brands]);

  // Reset forms
  const resetCategoryForm = useCallback(() => {
    setCategoryForm({
      name: '', description: '', parentId: '', color: 'blue',
      requiresModel: false, requiresSerial: false, requiresExpiry: false,
      trackStock: true, allowBackorder: false, defaultTaxRate: 18,
      defaultMarkupPercent: 25, defaultWarrantyDays: 0, fastMovingThreshold: 10,
      isActive: true, notes: '', tags: [],
    });
  }, []);

  const resetAttributeForm = useCallback(() => {
    setAttributeForm({
      name: '', displayName: '', description: '', dataType: 'text',
      isRequired: false, isSearchable: true, isFilterable: true, isVariant: false,
      minValue: 0, maxValue: 0, maxLength: 255, pattern: '',
      allowedValues: [], categoryIds: [], groupName: '', helpText: '', placeholder: '',
    });
  }, []);

  const resetBrandForm = useCallback(() => {
    setBrandForm({
      name: '', description: '', website: '', isActive: true, isPremium: false,
      countryOfOrigin: '', contactEmail: '', contactPhone: '', categoryIds: [], notes: '',
    });
  }, []);

  // Handle add category
  const handleAddCategory = useCallback(async () => {
    try {
      if (!categoryForm.name || !categoryForm.description) {
        error('Please fill in all required fields');
        return;
      }

      if (categories.some(c => c.name.toLowerCase() === categoryForm.name.toLowerCase())) {
        error('A category with this name already exists');
        return;
      }

      const level = categoryForm.parentId ? 1 : 0;
      const sortOrder = categories.filter(c => c.level === level).length + 1;

      const newCategory: ProductCategory = {
        id: `CAT-${Date.now()}`,
        ...categoryForm,
        level,
        sortOrder,
        productCount: 0,
        totalValue: 0,
        avgPrice: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      setCategories(prev => [...prev, newCategory]);
      success(`Category ${newCategory.name} created successfully!`);
      resetCategoryForm();
      setShowAddCategoryDialog(false);
    } catch (err) {
      console.error('Error adding category:', err);
      error('Failed to create category. Please try again.');
    }
  }, [categoryForm, categories, success, error, resetCategoryForm]);

  // Handle add attribute
  const handleAddAttribute = useCallback(async () => {
    try {
      if (!attributeForm.name || !attributeForm.displayName || !attributeForm.categoryIds.length) {
        error('Please fill in all required fields');
        return;
      }

      if (attributes.some(a => a.name === attributeForm.name)) {
        error('An attribute with this name already exists');
        return;
      }

      const sortOrder = attributes.length + 1;

      const newAttribute: ProductAttribute = {
        id: `ATTR-${Date.now()}`,
        ...attributeForm,
        sortOrder,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      setAttributes(prev => [...prev, newAttribute]);
      success(`Attribute ${newAttribute.displayName} created successfully!`);
      resetAttributeForm();
      setShowAddAttributeDialog(false);
    } catch (err) {
      console.error('Error adding attribute:', err);
      error('Failed to create attribute. Please try again.');
    }
  }, [attributeForm, attributes, success, error, resetAttributeForm]);

  // Handle add brand
  const handleAddBrand = useCallback(async () => {
    try {
      if (!brandForm.name || !brandForm.description) {
        error('Please fill in all required fields');
        return;
      }

      if (brands.some(b => b.name.toLowerCase() === brandForm.name.toLowerCase())) {
        error('A brand with this name already exists');
        return;
      }

      const newBrand: ProductBrand = {
        id: `BRAND-${Date.now()}`,
        ...brandForm,
        productCount: 0,
        avgRating: 0,
        totalSales: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      setBrands(prev => [...prev, newBrand]);
      success(`Brand ${newBrand.name} created successfully!`);
      resetBrandForm();
      setShowAddBrandDialog(false);
    } catch (err) {
      console.error('Error adding brand:', err);
      error('Failed to create brand. Please try again.');
    }
  }, [brandForm, brands, success, error, resetBrandForm]);

  // Get color classes
  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Product Type Management</h2>
          <p className="text-muted-foreground">
            Manage product categories, attributes, and brand classifications
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'categories' && (
            <Button onClick={() => setShowAddCategoryDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          )}
          {activeTab === 'attributes' && (
            <Button onClick={() => setShowAddAttributeDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Attribute
            </Button>
          )}
          {activeTab === 'brands' && (
            <Button onClick={() => setShowAddBrandDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Brand
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeStats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              {typeStats.activeCategories} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attributes</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeStats.totalAttributes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brands</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeStats.totalBrands}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeStats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {typeStats.totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+12.5%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">Categories ({categories.length})</TabsTrigger>
          <TabsTrigger value="attributes">Attributes ({attributes.length})</TabsTrigger>
          <TabsTrigger value="brands">Brands ({brands.length})</TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Search Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories Display */}
          <div className="grid gap-4">
            {getCategoryHierarchy.mainCategories
              .filter(cat => filteredCategories.includes(cat))
              .map(category => (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center",
                          getColorClasses(category.color)
                        )}>
                          <Tags className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Package className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-blue-600">{category.productCount}</p>
                        <p className="text-xs text-gray-600">Products</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-green-600">UGX {category.avgPrice.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">Avg. Price</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-purple-600">{category.defaultMarkupPercent}%</p>
                        <p className="text-xs text-gray-600">Markup</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <Target className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-orange-600">{category.fastMovingThreshold}</p>
                        <p className="text-xs text-gray-600">Fast Moving</p>
                      </div>
                    </div>

                    {/* Subcategories */}
                    {getCategoryHierarchy.hierarchy[category.id]?.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Subcategories:</h4>
                        <div className="flex flex-wrap gap-2">
                          {getCategoryHierarchy.hierarchy[category.id].map(subcat => (
                            <Badge key={subcat.id} variant="outline" className="text-xs">
                              {subcat.name} ({subcat.productCount})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {category.tags.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Tags:</h4>
                        <div className="flex flex-wrap gap-1">
                          {category.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs bg-gray-50">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Attributes Tab */}
        <TabsContent value="attributes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Attributes ({attributes.length})</CardTitle>
              <CardDescription>Define custom attributes for product categories</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attribute</TableHead>
                    <TableHead>Data Type</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attributes.map((attribute) => (
                    <TableRow key={attribute.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{attribute.displayName}</div>
                          <div className="text-sm text-muted-foreground">{attribute.description}</div>
                          <div className="text-xs text-muted-foreground">Name: {attribute.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{attribute.dataType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {attribute.categoryIds.map(catId => {
                            const category = categories.find(c => c.id === catId);
                            return category ? (
                              <Badge key={catId} variant="outline" className="text-xs">
                                {category.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {attribute.isRequired && (
                            <Badge variant="outline" className="text-xs bg-red-50 text-red-700">Required</Badge>
                          )}
                          {attribute.isSearchable && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">Searchable</Badge>
                          )}
                          {attribute.isFilterable && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Filterable</Badge>
                          )}
                          {attribute.isVariant && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">Variant</Badge>
                          )}
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
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Attribute
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Attribute
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brands Tab */}
        <TabsContent value="brands" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => (
              <Card key={brand.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {brand.name}
                        {brand.isPremium && (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                            Premium
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{brand.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Brand
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Brand
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Products</p>
                        <p className="font-medium">{brand.productCount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Rating</p>
                        <p className="font-medium">{brand.avgRating > 0 ? `${brand.avgRating}/5` : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Origin</p>
                        <p className="font-medium">{brand.countryOfOrigin || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <Badge variant={brand.isActive ? "default" : "secondary"} className="text-xs">
                          {brand.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    
                    {brand.website && (
                      <div className="text-sm">
                        <p className="text-gray-600">Website</p>
                        <a href={brand.website} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:underline">{brand.website}</a>
                      </div>
                    )}

                    {brand.categoryIds.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Categories:</p>
                        <div className="flex flex-wrap gap-1">
                          {brand.categoryIds.map(catId => {
                            const category = categories.find(c => c.id === catId);
                            return category ? (
                              <Badge key={catId} variant="outline" className="text-xs">
                                {category.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Category Dialog */}
      <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new product category with configuration settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Category Name *</Label>
                <Input
                  id="cat-name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cat-parent">Parent Category</Label>
                <Select 
                  value={categoryForm.parentId} 
                  onValueChange={(value) => setCategoryForm(prev => ({ ...prev, parentId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Parent (Main Category)</SelectItem>
                    {categories.filter(c => c.level === 0).map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-description">Description *</Label>
              <Textarea
                id="cat-description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Category description..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cat-tax">Default Tax Rate (%)</Label>
                <Input
                  id="cat-tax"
                  type="number"
                  value={categoryForm.defaultTaxRate}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, defaultTaxRate: Number(e.target.value) }))}
                  placeholder="18"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cat-markup">Default Markup (%)</Label>
                <Input
                  id="cat-markup"
                  type="number"
                  value={categoryForm.defaultMarkupPercent}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, defaultMarkupPercent: Number(e.target.value) }))}
                  placeholder="25"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cat-warranty">Warranty (days)</Label>
                <Input
                  id="cat-warranty"
                  type="number"
                  value={categoryForm.defaultWarrantyDays}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, defaultWarrantyDays: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Category Configuration</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="cat-requires-model"
                    checked={categoryForm.requiresModel}
                    onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, requiresModel: checked }))}
                  />
                  <Label htmlFor="cat-requires-model">Requires Model</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="cat-requires-serial"
                    checked={categoryForm.requiresSerial}
                    onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, requiresSerial: checked }))}
                  />
                  <Label htmlFor="cat-requires-serial">Requires Serial Number</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="cat-requires-expiry"
                    checked={categoryForm.requiresExpiry}
                    onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, requiresExpiry: checked }))}
                  />
                  <Label htmlFor="cat-requires-expiry">Has Expiry Date</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="cat-track-stock"
                    checked={categoryForm.trackStock}
                    onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, trackStock: checked }))}
                  />
                  <Label htmlFor="cat-track-stock">Track Stock</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="cat-allow-backorder"
                    checked={categoryForm.allowBackorder}
                    onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, allowBackorder: checked }))}
                  />
                  <Label htmlFor="cat-allow-backorder">Allow Backorders</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddCategoryDialog(false);
              resetCategoryForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Attribute Dialog */}
      <Dialog open={showAddAttributeDialog} onOpenChange={setShowAddAttributeDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Attribute</DialogTitle>
            <DialogDescription>
              Create a new product attribute for specific categories.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="attr-name">Attribute Name *</Label>
                <Input
                  id="attr-name"
                  value={attributeForm.name}
                  onChange={(e) => setAttributeForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. tire_size"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="attr-display">Display Name *</Label>
                <Input
                  id="attr-display"
                  value={attributeForm.displayName}
                  onChange={(e) => setAttributeForm(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="e.g. Tire Size"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attr-description">Description</Label>
              <Textarea
                id="attr-description"
                value={attributeForm.description}
                onChange={(e) => setAttributeForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Attribute description..."
                rows={2}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="attr-type">Data Type *</Label>
                <Select 
                  value={attributeForm.dataType} 
                  onValueChange={(value) => setAttributeForm(prev => ({ ...prev, dataType: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="select">Select (Single)</SelectItem>
                    <SelectItem value="multiselect">Multi-Select</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attr-group">Group Name</Label>
                <Input
                  id="attr-group"
                  value={attributeForm.groupName}
                  onChange={(e) => setAttributeForm(prev => ({ ...prev, groupName: e.target.value }))}
                  placeholder="e.g. Specifications"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Attribute Properties</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="attr-required"
                    checked={attributeForm.isRequired}
                    onCheckedChange={(checked) => setAttributeForm(prev => ({ ...prev, isRequired: checked }))}
                  />
                  <Label htmlFor="attr-required">Required</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="attr-searchable"
                    checked={attributeForm.isSearchable}
                    onCheckedChange={(checked) => setAttributeForm(prev => ({ ...prev, isSearchable: checked }))}
                  />
                  <Label htmlFor="attr-searchable">Searchable</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="attr-filterable"
                    checked={attributeForm.isFilterable}
                    onCheckedChange={(checked) => setAttributeForm(prev => ({ ...prev, isFilterable: checked }))}
                  />
                  <Label htmlFor="attr-filterable">Filterable</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="attr-variant"
                    checked={attributeForm.isVariant}
                    onCheckedChange={(checked) => setAttributeForm(prev => ({ ...prev, isVariant: checked }))}
                  />
                  <Label htmlFor="attr-variant">Product Variant</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddAttributeDialog(false);
              resetAttributeForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddAttribute}>
              <Plus className="h-4 w-4 mr-2" />
              Create Attribute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Brand Dialog */}
      <Dialog open={showAddBrandDialog} onOpenChange={setShowAddBrandDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Brand</DialogTitle>
            <DialogDescription>
              Register a new product brand in the system.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brand-name">Brand Name *</Label>
                <Input
                  id="brand-name"
                  value={brandForm.name}
                  onChange={(e) => setBrandForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter brand name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brand-origin">Country of Origin</Label>
                <Input
                  id="brand-origin"
                  value={brandForm.countryOfOrigin}
                  onChange={(e) => setBrandForm(prev => ({ ...prev, countryOfOrigin: e.target.value }))}
                  placeholder="e.g. Germany"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand-description">Description *</Label>
              <Textarea
                id="brand-description"
                value={brandForm.description}
                onChange={(e) => setBrandForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brand description..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brand-website">Website</Label>
                <Input
                  id="brand-website"
                  value={brandForm.website}
                  onChange={(e) => setBrandForm(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://www.brand.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brand-email">Contact Email</Label>
                <Input
                  id="brand-email"
                  type="email"
                  value={brandForm.contactEmail}
                  onChange={(e) => setBrandForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="contact@brand.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="brand-premium"
                  checked={brandForm.isPremium}
                  onCheckedChange={(checked) => setBrandForm(prev => ({ ...prev, isPremium: checked }))}
                />
                <Label htmlFor="brand-premium">Premium Brand</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="brand-active"
                  checked={brandForm.isActive}
                  onCheckedChange={(checked) => setBrandForm(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="brand-active">Active</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddBrandDialog(false);
              resetBrandForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddBrand}>
              <Plus className="h-4 w-4 mr-2" />
              Create Brand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
