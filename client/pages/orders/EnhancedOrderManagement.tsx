import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Link, useLocation } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle,
  Play,
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  Clock,
  DollarSign,
  FileText,
  Building2,
  Globe,
  Users,
  TrendingUp,
  Activity,
  AlertTriangle,
  Settings,
  Download,
  RefreshCw,
  Pause,
  RotateCcw,
  X,
  Archive,
  Flag,
  UserPlus,
  MessageSquare,
  Bell,
  Printer,
  Receipt,
  Copy,
  Trash2,
  FileDown,
  CalendarSchedule,
  ArrowUpCircle,
  ArrowDownCircle,
  Minus,
  Timer,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCustomerStore } from '@/context/CustomerStoreContext';
import { JobCard, JobStatus, JobPriority, Customer } from '@shared/types';
import { cn } from '@/lib/utils';
import { useFeedback } from '@/components/ui/status-popup';

// Enhanced sample data with more realistic workflow
const generateEnhancedOrders = (): (JobCard & { customerDetails: any })[] => {
  return [
    {
      id: 'JOB-2024-001',
      jobNumber: 'JOB-2024-001',
      title: 'Oil Change & Inspection',
      description: 'Regular oil change with full vehicle inspection',
      customerId: 'CUST-001',
      customer: {
        id: 'CUST-001',
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+256 700 123 456',
        address: '123 Main St, Kampala',
        customerType: 'individual',
        notes: 'Prefers synthetic oil',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
      },
      customerDetails: {
        id: 'CUST-001',
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+256 700 123 456',
        address: '123 Main St, Kampala',
        customerType: 'individual',
        notes: 'Prefers synthetic oil',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        type: 'Personal',
        subType: 'Car Owner',
        location: 'Kampala, Uganda',
        totalOrders: 8,
        lastVisit: '2024-01-20',
        status: 'Active'
      },
      assignedTechnicianId: 'TECH-001',
      assignedTechnician: {
        id: 'TECH-001',
        name: 'Mike Johnson',
        email: 'mike@garage.com',
        role: 'TECHNICIAN' as const,
        isActive: true,
        createdAt: new Date(),
        permissions: []
      },
      createdBy: 'ADMIN-001',
      createdAt: new Date('2024-01-18T09:00:00'),
      scheduledStartDate: new Date('2024-01-18T10:00:00'),
      expectedCompletionDate: new Date('2024-01-18T12:00:00'),
      actualStartDate: new Date('2024-01-18T10:15:00'),
      actualCompletionDate: new Date('2024-01-18T11:45:00'),
      status: JobStatus.COMPLETED,
      priority: JobPriority.NORMAL,
      tasks: ['Change oil filter', 'Replace engine oil', 'Check fluid levels', 'Visual inspection'],
      laborEntries: [],
      materialsUsed: [],
      attachments: [],
      notes: ['Customer satisfied with service', 'Used synthetic oil as requested'],
      approvals: [],
      digitalSignatures: [],
      lastUpdatedBy: 'TECH-001',
      lastUpdatedAt: new Date('2024-01-18T11:45:00'),
      orderId: 'ORD-2024-001',
      serviceCategory: 'Vehicle Maintenance',
      estimatedDuration: 120,
      actualDuration: 90,
      serviceLocation: 'Main Workshop',
      vehicleInfo: {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        plateNumber: 'UAG 123A'
      }
    },
    {
      id: 'JOB-2024-002',
      jobNumber: 'JOB-2024-002',
      title: 'Tire Installation - 4 Tires',
      description: 'Replace all four tires with new Michelin tires',
      customerId: 'CUST-002',
      customer: {
        id: 'CUST-002',
        name: 'Uganda Revenue Authority',
        email: 'fleet@ura.go.ug',
        phone: '+256 414 123 456',
        address: 'Nakawa, Kampala',
        customerType: 'business',
        notes: 'Government fleet account',
        createdAt: new Date('2023-12-01'),
        updatedAt: new Date('2024-01-19'),
      },
      customerDetails: {
        id: 'CUST-002',
        name: 'Uganda Revenue Authority',
        email: 'fleet@ura.go.ug',
        phone: '+256 414 123 456',
        address: 'Nakawa, Kampala',
        customerType: 'business',
        notes: 'Government fleet account',
        createdAt: new Date('2023-12-01'),
        updatedAt: new Date('2024-01-19'),
        type: 'Government',
        subType: 'Fleet Management',
        location: 'Nakawa, Kampala',
        totalOrders: 23,
        lastVisit: '2024-01-19',
        status: 'Active'
      },
      assignedTechnicianId: 'TECH-002',
      assignedTechnician: {
        id: 'TECH-002',
        name: 'Sarah Wilson',
        email: 'sarah@garage.com',
        role: 'TECHNICIAN' as const,
        isActive: true,
        createdAt: new Date(),
        permissions: []
      },
      createdBy: 'ADMIN-001',
      createdAt: new Date('2024-01-19T08:30:00'),
      scheduledStartDate: new Date('2024-01-19T14:00:00'),
      expectedCompletionDate: new Date('2024-01-19T16:30:00'),
      actualStartDate: new Date('2024-01-19T14:10:00'),
      status: JobStatus.IN_PROGRESS,
      priority: JobPriority.HIGH,
      tasks: ['Remove old tires', 'Install new tires', 'Balance wheels', 'Test drive'],
      laborEntries: [],
      materialsUsed: [],
      attachments: [],
      notes: ['Customer requires invoice for government processing'],
      approvals: [],
      digitalSignatures: [],
      lastUpdatedBy: 'TECH-002',
      lastUpdatedAt: new Date('2024-01-19T15:30:00'),
      orderId: 'ORD-2024-002',
      serviceCategory: 'Tire Services',
      estimatedDuration: 150,
      serviceLocation: 'Tire Bay 1',
      vehicleInfo: {
        make: 'Toyota',
        model: 'Hilux',
        year: 2021,
        plateNumber: 'UG 456B'
      }
    },
    {
      id: 'JOB-2024-003',
      jobNumber: 'JOB-2024-003',
      title: 'Fleet Inspection - Express Taxi',
      description: 'Comprehensive inspection for taxi fleet certification',
      customerId: 'CUST-003',
      customer: {
        id: 'CUST-003',
        name: 'Express Taxi Services',
        email: 'info@expresstaxi.ug',
        phone: '+256 702 987 654',
        address: 'Entebbe Road',
        customerType: 'business',
        notes: 'Regular fleet customer',
        createdAt: new Date('2023-11-20'),
        updatedAt: new Date('2024-01-18'),
      },
      customerDetails: {
        id: 'CUST-003',
        name: 'Express Taxi Services',
        email: 'info@expresstaxi.ug',
        phone: '+256 702 987 654',
        address: 'Entebbe Road',
        customerType: 'business',
        notes: 'Regular fleet customer',
        createdAt: new Date('2023-11-20'),
        updatedAt: new Date('2024-01-18'),
        type: 'Private',
        subType: 'Taxi Company',
        location: 'Entebbe Road',
        totalOrders: 15,
        lastVisit: '2024-01-18',
        status: 'Active'
      },
      assignedTechnicianId: 'TECH-001',
      assignedTechnician: {
        id: 'TECH-001',
        name: 'Mike Johnson',
        email: 'mike@garage.com',
        role: 'TECHNICIAN' as const,
        isActive: true,
        createdAt: new Date(),
        permissions: []
      },
      createdBy: 'ADMIN-001',
      createdAt: new Date('2024-01-20T07:00:00'),
      scheduledStartDate: new Date('2024-01-20T09:00:00'),
      expectedCompletionDate: new Date('2024-01-20T17:00:00'),
      status: JobStatus.PENDING,
      priority: JobPriority.URGENT,
      tasks: ['Safety inspection', 'Emissions test', 'Brake check', 'Light inspection', 'Documentation'],
      laborEntries: [],
      materialsUsed: [],
      attachments: [],
      notes: ['Required for operating license renewal'],
      approvals: [],
      digitalSignatures: [],
      lastUpdatedBy: 'ADMIN-001',
      lastUpdatedAt: new Date('2024-01-20T07:00:00'),
      orderId: 'ORD-2024-003',
      serviceCategory: 'Fleet Management',
      estimatedDuration: 480,
      serviceLocation: 'Inspection Bay',
      vehicleInfo: {
        make: 'Suzuki',
        model: 'Swift',
        year: 2019,
        plateNumber: 'UAT 789C'
      }
    }
  ];
};

// Mock API function
const fetchAllOrders = async (): Promise<(JobCard & { customerDetails: any })[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return generateEnhancedOrders();
};

// Utility functions
const getStatusColor = (status: JobStatus) => {
  switch (status) {
    case JobStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case JobStatus.IN_PROGRESS:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case JobStatus.COMPLETED:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case JobStatus.ON_HOLD:
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case JobStatus.CANCELLED:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

const getPriorityColor = (priority: JobPriority) => {
  switch (priority) {
    case JobPriority.LOW:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case JobPriority.NORMAL:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case JobPriority.HIGH:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case JobPriority.URGENT:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

const getCustomerTypeColor = (type: string) => {
  switch (type) {
    case 'Personal':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'Government':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'NGO':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'Private':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function EnhancedOrderManagement() {
  const { user } = useAuth();
  const { customers } = useCustomerStore();
  const { success, error } = useFeedback();
  const location = useLocation();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<JobPriority | 'all'>('all');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const [statusUpdateForm, setStatusUpdateForm] = useState({
    newStatus: '',
    notes: '',
    estimatedCompletion: '',
  });

  // Check for highlighted order from navigation state
  const highlightedOrderId = location.state?.highlightOrder;

  // Fetch orders data
  const { data: orders = [], isLoading, error: fetchError, refetch } = useQuery({
    queryKey: ['enhanced-orders'],
    queryFn: fetchAllOrders,
  });

  // Process and filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = searchTerm === '' || 
        order.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerDetails?.phone?.includes(searchTerm) ||
        order.customerDetails?.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
      const matchesCustomerType = customerTypeFilter === 'all' || 
        order.customerDetails?.type === customerTypeFilter;

      const now = new Date();
      const orderDate = new Date(order.createdAt);
      
      let matchesDateRange = true;
      if (dateRange === 'today') {
        matchesDateRange = orderDate >= startOfDay(now) && orderDate <= endOfDay(now);
      } else if (dateRange === 'week') {
        const weekAgo = subDays(now, 7);
        matchesDateRange = orderDate >= weekAgo;
      } else if (dateRange === 'month') {
        const monthAgo = subDays(now, 30);
        matchesDateRange = orderDate >= monthAgo;
      }

      return matchesSearch && matchesStatus && matchesPriority && 
             matchesCustomerType && matchesDateRange;
    });
  }, [orders, searchTerm, statusFilter, priorityFilter, customerTypeFilter, dateRange]);

  // Calculate comprehensive statistics
  const orderStats = useMemo(() => {
    const total = orders.length;
    const active = orders.filter(o => [JobStatus.PENDING, JobStatus.IN_PROGRESS, JobStatus.ON_HOLD].includes(o.status)).length;
    const completed = orders.filter(o => o.status === JobStatus.COMPLETED).length;
    const inProgress = orders.filter(o => o.status === JobStatus.IN_PROGRESS).length;
    const pending = orders.filter(o => o.status === JobStatus.PENDING).length;
    const onHold = orders.filter(o => o.status === JobStatus.ON_HOLD).length;
    const urgent = orders.filter(o => o.priority === JobPriority.URGENT && o.status !== JobStatus.COMPLETED).length;
    
    const totalRevenue = completed * 150000; // Mock revenue calculation
    const avgOrderValue = total > 0 ? totalRevenue / total : 0;

    return {
      total, active, completed, inProgress, pending, onHold, urgent,
      totalRevenue, avgOrderValue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [orders]);

  // Handle status update
  const handleStatusUpdate = useCallback(async (order: any) => {
    try {
      if (!statusUpdateForm.newStatus) {
        error('Please select a new status');
        return;
      }

      // In a real app, this would call an API
      console.log('Updating order status:', {
        orderId: order.id,
        oldStatus: order.status,
        newStatus: statusUpdateForm.newStatus,
        notes: statusUpdateForm.notes,
        estimatedCompletion: statusUpdateForm.estimatedCompletion,
      });

      success(`Order ${order.jobNumber} status updated to ${statusUpdateForm.newStatus}`);
      
      setStatusUpdateForm({ newStatus: '', notes: '', estimatedCompletion: '' });
      setIsStatusUpdateOpen(false);
      setSelectedOrder(null);
      
      // Refresh orders
      refetch();
      
    } catch (err) {
      console.error('Error updating status:', err);
      error('Failed to update order status. Please try again.');
    }
  }, [statusUpdateForm, success, error, refetch]);

  // Quick status update actions
  const handleQuickStatusUpdate = useCallback(async (order: any, newStatus: JobStatus) => {
    try {
      console.log('Quick status update:', { orderId: order.id, newStatus });
      success(`Order ${order.jobNumber} status updated to ${newStatus.replace('_', ' ')}`);
      refetch();
    } catch (err) {
      error('Failed to update status');
    }
  }, [success, error, refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Error loading orders. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enhanced Order Management</h1>
          <p className="text-muted-foreground">
            Complete order workflow with status management and customer integration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link to="/customers">
              <Users className="h-4 w-4 mr-2" />
              Customer Management
            </Link>
          </Button>
          <Button asChild>
            <Link to="/customers" state={{ createOrder: true }}>
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Enhanced Statistics Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.total}</div>
            <p className="text-xs text-muted-foreground">All orders</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{orderStats.active}</div>
            <p className="text-xs text-muted-foreground">{orderStats.inProgress} in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting start</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{orderStats.completed}</div>
            <p className="text-xs text-muted-foreground">{orderStats.completionRate}% rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <Zap className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{orderStats.urgent}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(orderStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Total earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order number, customer, phone, location, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as JobStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.values(JobStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as JobPriority | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {Object.values(JobPriority).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={customerTypeFilter} onValueChange={setCustomerTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Customer Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Government">Government</SelectItem>
                  <SelectItem value="NGO">NGO</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{filteredOrders.length}</span> of <span className="font-medium">{orders.length}</span> orders
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {orderStats.active} Active Orders
          </Badge>
          {orderStats.urgent > 0 && (
            <Badge variant="destructive" className="text-xs animate-pulse">
              {orderStats.urgent} Urgent
            </Badge>
          )}
        </div>
      </div>

      {/* Enhanced Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order Management Workflow</CardTitle>
          <CardDescription>
            Complete order tracking with integrated status management and customer details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Details</TableHead>
                  <TableHead>Customer Info</TableHead>
                  <TableHead>Service & Timeline</TableHead>
                  <TableHead>Status & Priority</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow 
                    key={order.id} 
                    className={cn(
                      "hover:bg-accent/50",
                      highlightedOrderId === order.id && "bg-primary/10 border-l-4 border-l-primary"
                    )}
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{order.jobNumber}</div>
                        <div className="text-sm text-muted-foreground">{order.title}</div>
                        <div className="text-xs text-muted-foreground">
                          Created: {format(new Date(order.createdAt), 'MMM dd, HH:mm')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                            {order.customer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{order.customer.name}</div>
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getCustomerTypeColor(order.customerDetails?.type || ''))}
                            >
                              {order.customerDetails?.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {order.customer.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {order.customerDetails?.location || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Badge variant="outline" className="text-xs">
                          {order.serviceCategory}
                        </Badge>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Duration: {order.estimatedDuration || 'N/A'}min</div>
                          <div>Location: {order.serviceLocation || 'N/A'}</div>
                          {order.vehicleInfo && (
                            <div className="flex items-center gap-1">
                              <Car className="h-3 w-3" />
                              {order.vehicleInfo.make} {order.vehicleInfo.model} ({order.vehicleInfo.plateNumber})
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                          {order.status === JobStatus.PENDING && (
                            <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" title="Pending" />
                          )}
                          {order.status === JobStatus.IN_PROGRESS && (
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" title="In Progress" />
                          )}
                          {order.status === JobStatus.COMPLETED && (
                            <div className="h-2 w-2 rounded-full bg-green-500" title="Completed" />
                          )}
                        </div>
                        <Badge className={getPriorityColor(order.priority)}>
                          {order.priority}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.assignedTechnician ? (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">
                              {order.assignedTechnician.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-xs">{order.assignedTechnician.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Unassigned</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick Status Actions */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedOrder(order)}
                          className="h-8 w-8 p-0"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {order.status === JobStatus.PENDING && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Start Work"
                            onClick={() => handleQuickStatusUpdate(order, JobStatus.IN_PROGRESS)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {order.status === JobStatus.IN_PROGRESS && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Mark Complete"
                              onClick={() => handleQuickStatusUpdate(order, JobStatus.COMPLETED)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              title="Put On Hold"
                              onClick={() => handleQuickStatusUpdate(order, JobStatus.ON_HOLD)}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        {order.status === JobStatus.ON_HOLD && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Resume Work"
                            onClick={() => handleQuickStatusUpdate(order, JobStatus.IN_PROGRESS)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Update Status"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsStatusUpdateOpen(true);
                          }}
                        >
                          <Timer className="h-4 w-4" />
                        </Button>
                        
                        {/* More Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="More Actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Order
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate Order
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Assign Technician
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Flag className="h-4 w-4 mr-2" />
                              Update Priority
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Add Notes
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem asChild>
                              <Link to={`/customers/${order.customerId}`}>
                                <User className="h-4 w-4 mr-2" />
                                View Customer
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="h-4 w-4 mr-2" />
                              Call Customer
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem>
                              <Printer className="h-4 w-4 mr-2" />
                              Print Order
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Receipt className="h-4 w-4 mr-2" />
                              Generate Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileDown className="h-4 w-4 mr-2" />
                              Export PDF
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder && !isStatusUpdateOpen} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.jobNumber}</DialogTitle>
            <DialogDescription>
              Complete order information with customer details and workflow status
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="customer">Customer</TabsTrigger>
                  <TabsTrigger value="workflow">Workflow</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Order Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Job Number:</span>
                          <span className="font-medium">{selectedOrder.jobNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Title:</span>
                          <span className="font-medium">{selectedOrder.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge className={getStatusColor(selectedOrder.status)}>
                            {selectedOrder.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Priority:</span>
                          <Badge className={getPriorityColor(selectedOrder.priority)}>
                            {selectedOrder.priority}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Service Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Category:</span>
                          <span className="font-medium">{selectedOrder.serviceCategory}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium">{selectedOrder.serviceLocation || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium">{selectedOrder.estimatedDuration || 'N/A'} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Technician:</span>
                          <span className="font-medium">{selectedOrder.assignedTechnician?.name || 'Unassigned'}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Description & Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3">{selectedOrder.description}</p>
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Tasks:</span>
                        <ul className="text-sm space-y-1">
                          {selectedOrder.tasks.map((task: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="customer" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-medium">
                          {selectedOrder.customer.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">{selectedOrder.customer.name}</h3>
                          <Badge className={getCustomerTypeColor(selectedOrder.customerDetails?.type || '')}>
                            {selectedOrder.customerDetails?.type} - {selectedOrder.customerDetails?.subType}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedOrder.customer.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedOrder.customer.email || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedOrder.customerDetails?.location || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Orders:</span>
                            <span className="font-medium">{selectedOrder.customerDetails?.totalOrders || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Visit:</span>
                            <span className="font-medium">{selectedOrder.customerDetails?.lastVisit || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant="outline">{selectedOrder.customerDetails?.status || 'Active'}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="workflow" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Status Management</CardTitle>
                      <CardDescription>Update order status and track progress</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(selectedOrder.status)} variant="outline">
                          Current: {selectedOrder.status.replace('_', ' ')}
                        </Badge>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsStatusUpdateOpen(true)}
                        >
                          <Timer className="h-4 w-4 mr-2" />
                          Update Status
                        </Button>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid gap-2 md:grid-cols-2">
                        {selectedOrder.status === JobStatus.PENDING && (
                          <Button onClick={() => handleQuickStatusUpdate(selectedOrder, JobStatus.IN_PROGRESS)}>
                            <Play className="h-4 w-4 mr-2" />
                            Start Work
                          </Button>
                        )}
                        
                        {selectedOrder.status === JobStatus.IN_PROGRESS && (
                          <>
                            <Button onClick={() => handleQuickStatusUpdate(selectedOrder, JobStatus.COMPLETED)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Complete
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => handleQuickStatusUpdate(selectedOrder, JobStatus.ON_HOLD)}
                            >
                              <Pause className="h-4 w-4 mr-2" />
                              Put On Hold
                            </Button>
                          </>
                        )}

                        {selectedOrder.status === JobStatus.ON_HOLD && (
                          <Button onClick={() => handleQuickStatusUpdate(selectedOrder, JobStatus.IN_PROGRESS)}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Resume Work
                          </Button>
                        )}
                      </div>

                      {/* Notes */}
                      {selectedOrder.notes.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Order Notes</h4>
                          {selectedOrder.notes.map((note: string, index: number) => (
                            <div key={index} className="text-sm p-2 bg-muted rounded">
                              {note}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="timeline">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Order Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <CalendarIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Order Created</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(selectedOrder.createdAt), 'PPpp')}
                            </p>
                          </div>
                        </div>

                        {selectedOrder.actualStartDate && (
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                              <Play className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">Work Started</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(selectedOrder.actualStartDate), 'PPpp')}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedOrder.actualCompletionDate && (
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">Work Completed</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(selectedOrder.actualCompletionDate), 'PPpp')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={isStatusUpdateOpen} onOpenChange={setIsStatusUpdateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Update the status for order {selectedOrder?.jobNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select
                value={statusUpdateForm.newStatus}
                onValueChange={(value) => setStatusUpdateForm(prev => ({ ...prev, newStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(JobStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estimated Completion (Optional)</Label>
              <Input
                type="datetime-local"
                value={statusUpdateForm.estimatedCompletion}
                onChange={(e) => setStatusUpdateForm(prev => ({ ...prev, estimatedCompletion: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Update Notes</Label>
              <Textarea
                value={statusUpdateForm.notes}
                onChange={(e) => setStatusUpdateForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add notes about this status update..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsStatusUpdateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleStatusUpdate(selectedOrder)}>
              Update Status
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
