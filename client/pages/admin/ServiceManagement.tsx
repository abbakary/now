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
  Car,
  Shield,
  MessageCircle,
  Settings,
  MoreHorizontal,
  Clock,
  DollarSign,
  Wrench,
  Copy,
  Eye,
  AlertTriangle,
  CheckCircle,
  Star,
  BarChart3,
} from 'lucide-react';
import { useFeedback } from '@/components/ui/status-popup';

interface ServiceTemplate {
  id: string;
  name: string;
  description: string;
  category: 'car_service' | 'tire_service' | 'consultation' | 'custom' | 'maintenance';
  subcategory?: string;
  
  // Pricing & Time
  basePrice: number;
  laborRate: number;
  estimatedDuration: number; // in minutes
  
  // Configuration
  isActive: boolean;
  isPopular: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  requiredSkills: string[];
  
  // Materials & Tasks
  defaultTasks: string[];
  requiredMaterials: ServiceMaterial[];
  optionalMaterials: ServiceMaterial[];
  
  // Business Rules
  allowCustomPricing: boolean;
  requiresApproval: boolean;
  maxDiscountPercent: number;
  
  // Tracking
  timesUsed: number;
  averageCompletionTime: number;
  customerRating: number;
  profitMargin: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  notes?: string;
  tags: string[];
}

interface ServiceMaterial {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isRequired: boolean;
  supplier?: string;
  category: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  isActive: boolean;
  serviceCount: number;
  avgPrice: number;
  avgDuration: number;
}

interface ServiceFormData {
  name: string;
  description: string;
  category: string;
  subcategory: string;
  basePrice: number;
  laborRate: number;
  estimatedDuration: number;
  difficulty: string;
  requiredSkills: string[];
  defaultTasks: string[];
  requiredMaterials: ServiceMaterial[];
  optionalMaterials: ServiceMaterial[];
  allowCustomPricing: boolean;
  requiresApproval: boolean;
  maxDiscountPercent: number;
  isActive: boolean;
  isPopular: boolean;
  notes: string;
  tags: string[];
}

// Mock data
const serviceCategories: ServiceCategory[] = [
  {
    id: 'car_service',
    name: 'Car Services',
    description: 'General automotive maintenance and repair services',
    icon: Car,
    color: 'blue',
    isActive: true,
    serviceCount: 12,
    avgPrice: 150000,
    avgDuration: 120,
  },
  {
    id: 'tire_service',
    name: 'Tire Services',
    description: 'Tire installation, repair, and maintenance services',
    icon: Shield,
    color: 'orange',
    isActive: true,
    serviceCount: 8,
    avgPrice: 200000,
    avgDuration: 90,
  },
  {
    id: 'consultation',
    name: 'Consultations',
    description: 'Diagnostic and advisory services',
    icon: MessageCircle,
    color: 'green',
    isActive: true,
    serviceCount: 5,
    avgPrice: 50000,
    avgDuration: 45,
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    description: 'Preventive maintenance and inspections',
    icon: Settings,
    color: 'purple',
    isActive: true,
    serviceCount: 15,
    avgPrice: 100000,
    avgDuration: 60,
  },
];

const mockServiceTemplates: ServiceTemplate[] = [
  {
    id: 'SRV-001',
    name: 'Oil Change Service',
    description: 'Complete engine oil and filter replacement',
    category: 'car_service',
    subcategory: 'Engine Maintenance',
    basePrice: 80000,
    laborRate: 25000,
    estimatedDuration: 60,
    isActive: true,
    isPopular: true,
    difficulty: 'easy',
    requiredSkills: ['Basic Maintenance'],
    defaultTasks: [
      'Drain old engine oil',
      'Replace oil filter',
      'Add new engine oil',
      'Check fluid levels',
      'Reset service indicator'
    ],
    requiredMaterials: [
      {
        id: 'MAT-001',
        name: 'Engine Oil (5L)',
        quantity: 1,
        unitPrice: 35000,
        totalPrice: 35000,
        isRequired: true,
        category: 'Fluids'
      },
      {
        id: 'MAT-002',
        name: 'Oil Filter',
        quantity: 1,
        unitPrice: 15000,
        totalPrice: 15000,
        isRequired: true,
        category: 'Filters'
      }
    ],
    optionalMaterials: [
      {
        id: 'MAT-003',
        name: 'Air Filter',
        quantity: 1,
        unitPrice: 12000,
        totalPrice: 12000,
        isRequired: false,
        category: 'Filters'
      }
    ],
    allowCustomPricing: true,
    requiresApproval: false,
    maxDiscountPercent: 10,
    timesUsed: 156,
    averageCompletionTime: 55,
    customerRating: 4.8,
    profitMargin: 45.5,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-20',
    createdBy: 'Admin User',
    notes: 'Most popular service',
    tags: ['popular', 'quick', 'maintenance']
  },
  {
    id: 'SRV-002',
    name: 'Brake Service',
    description: 'Brake inspection and pad replacement',
    category: 'car_service',
    subcategory: 'Brake System',
    basePrice: 250000,
    laborRate: 40000,
    estimatedDuration: 120,
    isActive: true,
    isPopular: false,
    difficulty: 'medium',
    requiredSkills: ['Brake Systems', 'Safety Procedures'],
    defaultTasks: [
      'Inspect brake pads and discs',
      'Remove old brake pads',
      'Install new brake pads',
      'Check brake fluid level',
      'Test brake system',
      'Road test vehicle'
    ],
    requiredMaterials: [
      {
        id: 'MAT-004',
        name: 'Brake Pads Set',
        quantity: 1,
        unitPrice: 120000,
        totalPrice: 120000,
        isRequired: true,
        category: 'Brake Components'
      },
      {
        id: 'MAT-005',
        name: 'Brake Fluid',
        quantity: 1,
        unitPrice: 25000,
        totalPrice: 25000,
        isRequired: true,
        category: 'Fluids'
      }
    ],
    optionalMaterials: [
      {
        id: 'MAT-006',
        name: 'Brake Disc Set',
        quantity: 1,
        unitPrice: 180000,
        totalPrice: 180000,
        isRequired: false,
        category: 'Brake Components'
      }
    ],
    allowCustomPricing: true,
    requiresApproval: true,
    maxDiscountPercent: 5,
    timesUsed: 89,
    averageCompletionTime: 110,
    customerRating: 4.6,
    profitMargin: 38.2,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-18',
    createdBy: 'Admin User',
    notes: 'Safety critical service',
    tags: ['safety', 'brake-system', 'inspection']
  },
  {
    id: 'SRV-003',
    name: 'Tire Installation',
    description: 'New tire installation with balancing',
    category: 'tire_service',
    subcategory: 'Installation',
    basePrice: 50000,
    laborRate: 30000,
    estimatedDuration: 90,
    isActive: true,
    isPopular: true,
    difficulty: 'medium',
    requiredSkills: ['Tire Installation', 'Wheel Balancing'],
    defaultTasks: [
      'Remove old tires',
      'Mount new tires',
      'Balance wheels',
      'Check tire pressure',
      'Test drive'
    ],
    requiredMaterials: [
      {
        id: 'MAT-007',
        name: 'Wheel Weights',
        quantity: 4,
        unitPrice: 2000,
        totalPrice: 8000,
        isRequired: true,
        category: 'Tire Accessories'
      },
      {
        id: 'MAT-008',
        name: 'Valve Stems',
        quantity: 4,
        unitPrice: 1500,
        totalPrice: 6000,
        isRequired: true,
        category: 'Tire Accessories'
      }
    ],
    optionalMaterials: [],
    allowCustomPricing: false,
    requiresApproval: false,
    maxDiscountPercent: 0,
    timesUsed: 234,
    averageCompletionTime: 85,
    customerRating: 4.9,
    profitMargin: 42.8,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-19',
    createdBy: 'Admin User',
    notes: 'High volume service',
    tags: ['tire', 'installation', 'balancing']
  }
];

export default function ServiceManagement() {
  const { success, error } = useFeedback();
  const [services, setServices] = useState<ServiceTemplate[]>(mockServiceTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceTemplate | null>(null);
  const [activeTab, setActiveTab] = useState("services");

  const [serviceForm, setServiceForm] = useState<ServiceFormData>({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    basePrice: 0,
    laborRate: 0,
    estimatedDuration: 0,
    difficulty: 'easy',
    requiredSkills: [],
    defaultTasks: [],
    requiredMaterials: [],
    optionalMaterials: [],
    allowCustomPricing: true,
    requiresApproval: false,
    maxDiscountPercent: 10,
    isActive: true,
    isPopular: false,
    notes: '',
    tags: [],
  });

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && service.isActive) ||
                           (statusFilter === 'inactive' && !service.isActive) ||
                           (statusFilter === 'popular' && service.isPopular);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [services, searchTerm, categoryFilter, statusFilter]);

  // Calculate service statistics
  const serviceStats = useMemo(() => {
    const totalServices = services.length;
    const activeServices = services.filter(s => s.isActive).length;
    const popularServices = services.filter(s => s.isPopular).length;
    const avgPrice = services.reduce((sum, s) => sum + s.basePrice, 0) / totalServices;
    const avgDuration = services.reduce((sum, s) => sum + s.estimatedDuration, 0) / totalServices;
    const totalUsage = services.reduce((sum, s) => sum + s.timesUsed, 0);

    return {
      totalServices,
      activeServices,
      popularServices,
      avgPrice: avgPrice.toFixed(0),
      avgDuration: avgDuration.toFixed(0),
      totalUsage,
    };
  }, [services]);

  // Reset form
  const resetServiceForm = useCallback(() => {
    setServiceForm({
      name: '',
      description: '',
      category: '',
      subcategory: '',
      basePrice: 0,
      laborRate: 0,
      estimatedDuration: 0,
      difficulty: 'easy',
      requiredSkills: [],
      defaultTasks: [],
      requiredMaterials: [],
      optionalMaterials: [],
      allowCustomPricing: true,
      requiresApproval: false,
      maxDiscountPercent: 10,
      isActive: true,
      isPopular: false,
      notes: '',
      tags: [],
    });
  }, []);

  // Handle add service
  const handleAddService = useCallback(async () => {
    try {
      if (!serviceForm.name || !serviceForm.category || !serviceForm.basePrice) {
        error('Please fill in all required fields');
        return;
      }

      if (services.some(s => s.name.toLowerCase() === serviceForm.name.toLowerCase())) {
        error('A service with this name already exists');
        return;
      }

      const materialsTotal = serviceForm.requiredMaterials.reduce((sum, m) => sum + m.totalPrice, 0);
      const profitMargin = serviceForm.basePrice > 0 
        ? ((serviceForm.basePrice - materialsTotal) / serviceForm.basePrice * 100)
        : 0;

      const newService: ServiceTemplate = {
        id: `SRV-${Date.now()}`,
        ...serviceForm,
        timesUsed: 0,
        averageCompletionTime: serviceForm.estimatedDuration,
        customerRating: 0,
        profitMargin: profitMargin,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'Admin User',
      };

      setServices(prev => [...prev, newService]);
      success(`Service template ${newService.name} created successfully!`);
      resetServiceForm();
      setShowAddDialog(false);
    } catch (err) {
      console.error('Error adding service:', err);
      error('Failed to create service template. Please try again.');
    }
  }, [serviceForm, services, success, error, resetServiceForm]);

  // Handle edit service
  const handleEditService = useCallback(async () => {
    try {
      if (!selectedService || !serviceForm.name || !serviceForm.category) {
        error('Please fill in all required fields');
        return;
      }

      const materialsTotal = serviceForm.requiredMaterials.reduce((sum, m) => sum + m.totalPrice, 0);
      const profitMargin = serviceForm.basePrice > 0 
        ? ((serviceForm.basePrice - materialsTotal) / serviceForm.basePrice * 100)
        : 0;

      const updatedService: ServiceTemplate = {
        ...selectedService,
        ...serviceForm,
        profitMargin: profitMargin,
        updatedAt: new Date().toISOString().split('T')[0],
      };

      setServices(prev => prev.map(s => s.id === selectedService.id ? updatedService : s));
      success(`Service template ${updatedService.name} updated successfully!`);
      resetServiceForm();
      setShowEditDialog(false);
      setSelectedService(null);
    } catch (err) {
      console.error('Error updating service:', err);
      error('Failed to update service template. Please try again.');
    }
  }, [selectedService, serviceForm, success, error, resetServiceForm]);

  // Handle delete service
  const handleDeleteService = useCallback(async (service: ServiceTemplate) => {
    if (window.confirm(`Are you sure you want to delete service "${service.name}"?`)) {
      try {
        setServices(prev => prev.filter(s => s.id !== service.id));
        success(`Service template ${service.name} deleted successfully!`);
      } catch (err) {
        console.error('Error deleting service:', err);
        error('Failed to delete service template. Please try again.');
      }
    }
  }, [success, error]);

  // Handle toggle service status
  const handleToggleServiceStatus = useCallback(async (service: ServiceTemplate) => {
    try {
      const updatedService = { ...service, isActive: !service.isActive };
      setServices(prev => prev.map(s => s.id === service.id ? updatedService : s));
      success(`Service ${service.name} ${updatedService.isActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (err) {
      console.error('Error toggling service status:', err);
      error('Failed to update service status. Please try again.');
    }
  }, [success, error]);

  // Handle duplicate service
  const handleDuplicateService = useCallback(async (service: ServiceTemplate) => {
    try {
      const duplicatedService: ServiceTemplate = {
        ...service,
        id: `SRV-${Date.now()}`,
        name: `${service.name} (Copy)`,
        timesUsed: 0,
        customerRating: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'Admin User',
      };

      setServices(prev => [...prev, duplicatedService]);
      success(`Service template duplicated as "${duplicatedService.name}"`);
    } catch (err) {
      console.error('Error duplicating service:', err);
      error('Failed to duplicate service template. Please try again.');
    }
  }, [success, error]);

  // Open edit dialog
  const openEditDialog = useCallback((service: ServiceTemplate) => {
    setSelectedService(service);
    setServiceForm({
      name: service.name,
      description: service.description,
      category: service.category,
      subcategory: service.subcategory || '',
      basePrice: service.basePrice,
      laborRate: service.laborRate,
      estimatedDuration: service.estimatedDuration,
      difficulty: service.difficulty,
      requiredSkills: service.requiredSkills,
      defaultTasks: service.defaultTasks,
      requiredMaterials: service.requiredMaterials,
      optionalMaterials: service.optionalMaterials,
      allowCustomPricing: service.allowCustomPricing,
      requiresApproval: service.requiresApproval,
      maxDiscountPercent: service.maxDiscountPercent,
      isActive: service.isActive,
      isPopular: service.isPopular,
      notes: service.notes || '',
      tags: service.tags,
    });
    setShowEditDialog(true);
  }, []);

  // Get category info
  const getCategoryInfo = (categoryId: string) => {
    return serviceCategories.find(c => c.id === categoryId);
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'hard':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'expert':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Service Management</h2>
          <p className="text-muted-foreground">
            Configure service types, templates, and pricing for all service offerings
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service Template
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceStats.totalServices}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{serviceStats.activeServices}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Popular</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{serviceStats.popularServices}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {serviceStats.avgPrice}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceStats.avgDuration}m</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceStats.totalUsage}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services">Service Templates ({filteredServices.length})</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, description, or tags..."
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
                    {serviceCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
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
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Services Table */}
          <Card>
            <CardHeader>
              <CardTitle>Service Templates ({filteredServices.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Details</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Pricing</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.map((service) => {
                      const categoryInfo = getCategoryInfo(service.category);
                      const CategoryIcon = categoryInfo?.icon || Wrench;
                      
                      return (
                        <TableRow key={service.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="font-medium">{service.name}</div>
                                {service.isPopular && (
                                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                                    Popular
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {service.description}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={getDifficultyColor(service.difficulty)}>
                                  {service.difficulty}
                                </Badge>
                                {service.tags.slice(0, 2).map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CategoryIcon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{categoryInfo?.name}</div>
                                {service.subcategory && (
                                  <div className="text-xs text-muted-foreground">{service.subcategory}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">UGX {service.basePrice.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">
                                Labor: UGX {service.laborRate.toLocaleString()}/hr
                              </div>
                              <div className="text-xs text-green-600">
                                Margin: {service.profitMargin.toFixed(1)}%
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{service.estimatedDuration}m</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Avg: {service.averageCompletionTime}m
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <Badge 
                                variant={service.isActive ? "default" : "secondary"}
                                className={service.isActive ? "bg-green-100 text-green-800" : ""}
                              >
                                {service.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Switch
                                  checked={service.isActive}
                                  onCheckedChange={() => handleToggleServiceStatus(service)}
                                  size="sm"
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">Used: {service.timesUsed}x</div>
                              <div className="text-xs text-muted-foreground">
                                Rating: {service.customerRating > 0 ? `${service.customerRating}/5` : 'N/A'}
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
                                <DropdownMenuItem onClick={() => openEditDialog(service)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Service
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicateService(service)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleServiceStatus(service)}>
                                  {service.isActive ? (
                                    <>
                                      <AlertTriangle className="h-4 w-4 mr-2" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteService(service)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Service
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {serviceCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">
                          {category.serviceCount} services
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm mb-4">
                      {category.description}
                    </CardDescription>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Avg. Price:</span>
                        <span className="font-medium">UGX {category.avgPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg. Duration:</span>
                        <span className="font-medium">{category.avgDuration}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant={category.isActive ? "default" : "secondary"} className="text-xs">
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Services</CardTitle>
                <CardDescription>Services by usage frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {services
                    .sort((a, b) => b.timesUsed - a.timesUsed)
                    .slice(0, 5)
                    .map(service => (
                      <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {service.timesUsed} times used
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          {service.customerRating > 0 ? `${service.customerRating}/5` : 'N/A'}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Highest Margin Services</CardTitle>
                <CardDescription>Services by profit margin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {services
                    .sort((a, b) => b.profitMargin - a.profitMargin)
                    .slice(0, 5)
                    .map(service => (
                      <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground">
                            UGX {service.basePrice.toLocaleString()}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          {service.profitMargin.toFixed(1)}% margin
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Service Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Service Template</DialogTitle>
            <DialogDescription>
              Create a new service template with pricing and configuration.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter service name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={serviceForm.category} 
                  onValueChange={(value) => setServiceForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={serviceForm.description}
                onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Service description..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={serviceForm.basePrice}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="laborRate">Labor Rate (per hour)</Label>
                <Input
                  id="laborRate"
                  type="number"
                  value={serviceForm.laborRate}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, laborRate: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">Duration (minutes) *</Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  value={serviceForm.estimatedDuration}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, estimatedDuration: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select 
                  value={serviceForm.difficulty} 
                  onValueChange={(value) => setServiceForm(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDiscountPercent">Max Discount (%)</Label>
                <Input
                  id="maxDiscountPercent"
                  type="number"
                  value={serviceForm.maxDiscountPercent}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, maxDiscountPercent: Number(e.target.value) }))}
                  placeholder="10"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="allowCustomPricing"
                  checked={serviceForm.allowCustomPricing}
                  onCheckedChange={(checked) => setServiceForm(prev => ({ ...prev, allowCustomPricing: checked }))}
                />
                <Label htmlFor="allowCustomPricing">Allow custom pricing</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="requiresApproval"
                  checked={serviceForm.requiresApproval}
                  onCheckedChange={(checked) => setServiceForm(prev => ({ ...prev, requiresApproval: checked }))}
                />
                <Label htmlFor="requiresApproval">Requires approval</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPopular"
                  checked={serviceForm.isPopular}
                  onCheckedChange={(checked) => setServiceForm(prev => ({ ...prev, isPopular: checked }))}
                />
                <Label htmlFor="isPopular">Mark as popular</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              resetServiceForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddService}>
              <Plus className="h-4 w-4 mr-2" />
              Create Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Service Template</DialogTitle>
            <DialogDescription>
              Update service template information and configuration.
            </DialogDescription>
          </DialogHeader>
          
          {/* Same form content as Add Dialog but for editing */}
          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Service Name *</Label>
                <Input
                  id="edit-name"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter service name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select 
                  value={serviceForm.category} 
                  onValueChange={(value) => setServiceForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="edit-basePrice">Base Price *</Label>
                <Input
                  id="edit-basePrice"
                  type="number"
                  value={serviceForm.basePrice}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-laborRate">Labor Rate</Label>
                <Input
                  id="edit-laborRate"
                  type="number"
                  value={serviceForm.laborRate}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, laborRate: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-estimatedDuration">Duration (minutes) *</Label>
                <Input
                  id="edit-estimatedDuration"
                  type="number"
                  value={serviceForm.estimatedDuration}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, estimatedDuration: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setSelectedService(null);
              resetServiceForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditService}>
              <Edit className="h-4 w-4 mr-2" />
              Update Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
