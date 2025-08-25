import React, { useState, useMemo, useCallback } from "react";
import { useCustomerStore } from "@/context/CustomerStoreContext";
import { useVisitTracking } from "@/context/VisitTrackingContext";
import { useFeedback } from "@/components/ui/status-popup";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Plus,
  Filter,
  Users,
  User,
  Building2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Car,
  Settings,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  ClipboardList,
  Play,
  Clock,
  CheckCircle,
  DollarSign,
  Wrench,
  Shield,
  MessageCircle,
  ArrowRight,
  TrendingUp,
  Activity,
  RefreshCw,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JobStatus, JobPriority } from "@shared/types";

// Service Templates
const SERVICE_CATEGORIES = {
  'Vehicle Maintenance': {
    services: [
      { id: 'oil-change', name: 'Oil Change', duration: 60, cost: 80, description: 'Engine oil and filter replacement' },
      { id: 'brake-service', name: 'Brake Service', duration: 120, cost: 150, description: 'Brake pads and system inspection' },
      { id: 'engine-repair', name: 'Engine Repair', duration: 240, cost: 400, description: 'Engine diagnostics and repair' },
      { id: 'transmission-service', name: 'Transmission Service', duration: 180, cost: 250, description: 'Transmission fluid and inspection' },
    ],
    icon: Car,
    color: 'blue',
  },
  'Tire Services': {
    services: [
      { id: 'tire-installation', name: 'Tire Installation', duration: 90, cost: 300, description: 'New tire installation with balancing' },
      { id: 'tire-rotation', name: 'Tire Rotation', duration: 30, cost: 50, description: 'Rotate tires for even wear' },
      { id: 'wheel-alignment', name: 'Wheel Alignment', duration: 60, cost: 100, description: 'Adjust wheel alignment' },
      { id: 'tire-repair', name: 'Tire Repair', duration: 45, cost: 25, description: 'Patch or plug tire puncture' },
    ],
    icon: Shield,
    color: 'orange',
  },
  'Consultation': {
    services: [
      { id: 'vehicle-inspection', name: 'Vehicle Inspection', duration: 60, cost: 80, description: 'Comprehensive safety inspection' },
      { id: 'estimate-consultation', name: 'Cost Estimate', duration: 30, cost: 0, description: 'Detailed repair cost estimate' },
      { id: 'maintenance-planning', name: 'Maintenance Planning', duration: 45, cost: 50, description: 'Long-term maintenance schedule' },
    ],
    icon: MessageCircle,
    color: 'green',
  },
};

const CUSTOMER_TYPES = {
  Personal: { icon: User, color: 'orange', label: 'Personal' },
  Government: { icon: Building2, color: 'blue', label: 'Government' },
  NGO: { icon: Globe, color: 'green', label: 'NGO' },
  Private: { icon: Building2, color: 'purple', label: 'Private' },
};

interface CustomerFormData {
  firstName: string;
  lastName: string;
  companyName: string;
  customerType: "Personal" | "Government" | "NGO" | "Private" | "";
  subType: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  country: string;
  notes: string;
}

interface ServiceOrderData {
  serviceCategory: string;
  serviceId: string;
  priority: JobPriority;
  scheduledDate?: string;
  notes: string;
}

// Sample data for existing customers
const SAMPLE_CUSTOMERS = [
  {
    id: "CUST-001",
    name: "John Doe",
    type: "Personal",
    subType: "Car Owner",
    phone: "+256 700 123 456",
    email: "john.doe@email.com",
    location: "Kampala, Uganda",
    registeredDate: "2024-01-15",
    lastVisit: "2024-01-20",
    totalOrders: 8,
    status: "Active",
    lastService: "Oil Change",
  },
  {
    id: "CUST-002",
    name: "Uganda Revenue Authority",
    type: "Government",
    subType: "Fleet Management",
    phone: "+256 414 123 456",
    email: "fleet@ura.go.ug",
    location: "Nakawa, Kampala",
    registeredDate: "2023-12-01",
    lastVisit: "2024-01-19",
    totalOrders: 23,
    status: "Active",
    lastService: "Fleet Inspection",
  },
  {
    id: "CUST-003",
    name: "Express Taxi Services",
    type: "Private",
    subType: "Taxi Company",
    phone: "+256 702 987 654",
    email: "info@expresstaxi.ug",
    location: "Entebbe Road",
    registeredDate: "2023-11-20",
    lastVisit: "2024-01-18",
    totalOrders: 15,
    status: "Active",
    lastService: "Tire Installation",
  },
];

export default function EnhancedCustomerManagement() {
  const { customers: storedCustomers, addCustomer } = useCustomerStore();
  const { addVisit } = useVisitTracking();
  const { success, error } = useFeedback();
  const navigate = useNavigate();

  // State management
  const [activeTab, setActiveTab] = useState<"customers" | "new-customer" | "service-order">("customers");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  
  // Form data
  const [customerForm, setCustomerForm] = useState<CustomerFormData>({
    firstName: "",
    lastName: "",
    companyName: "",
    customerType: "",
    subType: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    district: "",
    country: "Uganda",
    notes: "",
  });

  const [serviceOrderForm, setServiceOrderForm] = useState<ServiceOrderData>({
    serviceCategory: "",
    serviceId: "",
    priority: JobPriority.NORMAL,
    scheduledDate: "",
    notes: "",
  });

  // Combined customer data
  const allCustomers = useMemo(() => {
    const combined = [...storedCustomers, ...SAMPLE_CUSTOMERS];
    return combined.filter((customer, index, self) => 
      index === self.findIndex(c => c.id === customer.id)
    );
  }, [storedCustomers]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return allCustomers;
    
    const term = searchTerm.toLowerCase();
    return allCustomers.filter(customer =>
      customer.name.toLowerCase().includes(term) ||
      customer.phone.includes(term) ||
      customer.email?.toLowerCase().includes(term) ||
      customer.location?.toLowerCase().includes(term) ||
      customer.type.toLowerCase().includes(term)
    );
  }, [allCustomers, searchTerm]);

  // Statistics
  const customerStats = useMemo(() => {
    const total = allCustomers.length;
    const newThisMonth = allCustomers.filter(c => {
      const regDate = new Date(c.registeredDate || 0);
      const now = new Date();
      return regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear();
    }).length;

    const typeStats = allCustomers.reduce((acc, customer) => {
      acc[customer.type] = (acc[customer.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, newThisMonth, typeStats };
  }, [allCustomers]);

  // Reset customer form
  const resetCustomerForm = useCallback(() => {
    setCustomerForm({
      firstName: "", lastName: "", companyName: "", customerType: "",
      subType: "", phone: "", email: "", address: "", city: "",
      district: "", country: "Uganda", notes: "",
    });
  }, []);

  // Handle customer form submission
  const handleAddCustomer = useCallback(async () => {
    try {
      if (!customerForm.customerType) {
        error('Please select a customer type');
        return;
      }

      const isPersonal = customerForm.customerType === "Personal";
      if (isPersonal && (!customerForm.firstName || !customerForm.lastName)) {
        error('First name and last name are required for personal customers');
        return;
      }

      if (!isPersonal && !customerForm.companyName) {
        error('Company name is required for business customers');
        return;
      }

      if (!customerForm.phone) {
        error('Phone number is required');
        return;
      }

      const customerName = isPersonal 
        ? `${customerForm.firstName} ${customerForm.lastName}`.trim()
        : customerForm.companyName;

      const newCustomer = {
        id: `CUST-${Date.now()}`,
        name: customerName,
        type: customerForm.customerType,
        subType: customerForm.subType,
        phone: customerForm.phone,
        email: customerForm.email,
        location: [customerForm.address, customerForm.city, customerForm.district, customerForm.country]
          .filter(Boolean).join(", "),
        registeredDate: new Date().toISOString(),
        lastVisit: new Date().toISOString(),
        totalOrders: 0,
        status: "Active",
        notes: customerForm.notes,
      };

      await addCustomer(newCustomer);
      success('Customer added successfully!');

      // Reset form and close dialog
      resetCustomerForm();
      setShowCustomerForm(false);
      setSelectedCustomer(newCustomer);
      setActiveTab("service-order");
      
    } catch (err) {
      console.error('Error adding customer:', err);
      error('Failed to add customer. Please try again.');
    }
  }, [customerForm, addCustomer, success, error]);

  // Handle service order creation
  const handleCreateServiceOrder = useCallback(async () => {
    try {
      if (!selectedCustomer) {
        error('No customer selected');
        return;
      }

      if (!serviceOrderForm.serviceCategory || !serviceOrderForm.serviceId) {
        error('Please select a service');
        return;
      }

      const service = SERVICE_CATEGORIES[serviceOrderForm.serviceCategory as keyof typeof SERVICE_CATEGORIES]
        ?.services.find(s => s.id === serviceOrderForm.serviceId);

      if (!service) {
        error('Selected service not found');
        return;
      }

      // Create visit record
      const visit = addVisit({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        visitType: 'Service',
        service: service.name,
        arrivedAt: new Date().toISOString(),
        notes: serviceOrderForm.notes,
      });

      // Create order (this would typically call an API)
      const orderData = {
        id: `ORD-${Date.now()}`,
        jobNumber: `JOB-${Date.now()}`,
        customerId: selectedCustomer.id,
        customer: selectedCustomer,
        title: service.name,
        description: service.description,
        serviceCategory: serviceOrderForm.serviceCategory,
        priority: serviceOrderForm.priority,
        status: JobStatus.PENDING,
        estimatedDuration: service.duration,
        estimatedCost: service.cost,
        scheduledDate: serviceOrderForm.scheduledDate,
        createdAt: new Date().toISOString(),
        notes: serviceOrderForm.notes,
      };

      success(`Service order created successfully! Order ID: ${orderData.jobNumber}`);
      
      // Reset form
      setServiceOrderForm({
        serviceCategory: "", serviceId: "", priority: JobPriority.NORMAL,
        scheduledDate: "", notes: "",
      });
      
      setShowServiceDialog(false);
      
      // Navigate to order management
      navigate('/orders', { 
        state: { 
          newOrder: orderData,
          highlightOrder: orderData.id 
        }
      });
      
    } catch (err) {
      console.error('Error creating service order:', err);
      error('Failed to create service order. Please try again.');
    }
  }, [selectedCustomer, serviceOrderForm, addVisit, success, error, navigate]);

  // Select customer for service
  const handleSelectCustomerForService = (customer: any) => {
    setSelectedCustomer(customer);
    success(`Customer ${customer.name} selected for service order!`);
    // Auto-switch to service order tab after a brief moment for user feedback
    setTimeout(() => {
      setActiveTab("service-order");
    }, 500);
  };

  // Get customer type styling
  const getCustomerTypeColor = (type: string) => {
    const config = CUSTOMER_TYPES[type as keyof typeof CUSTOMER_TYPES];
    if (!config) return 'bg-gray-100 text-gray-800';
    
    switch (config.color) {
      case 'blue': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'green': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'purple': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'orange': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer & Service Management</h1>
          <p className="text-muted-foreground">
            Manage customers and create service orders in one integrated workflow
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link to="/orders">
              <ClipboardList className="h-4 w-4 mr-2" />
              View All Orders
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveTab("customers")}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Users className="h-4 w-4 mr-2" />
            Use Existing Customer
          </Button>
          <Button onClick={() => setShowCustomerForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Customer
          </Button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.total}</div>
            <p className="text-xs text-muted-foreground">
              +{customerStats.newThisMonth} this month
            </p>
          </CardContent>
        </Card>

        {Object.entries(customerStats.typeStats).map(([type, count]) => {
          const config = CUSTOMER_TYPES[type as keyof typeof CUSTOMER_TYPES];
          const IconComponent = config?.icon || User;
          
          return (
            <Card key={type}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{config?.label || type}</CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((count / customerStats.total) * 100)}% of total
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Action Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("customers")}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-blue-900">Use Existing Customer</h3>
                <p className="text-sm text-blue-700">
                  Select from {allCustomers.length} registered customers
                  {selectedCustomer && ` • ${selectedCustomer.name} selected`}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("new-customer")}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-green-900">Add New Customer</h3>
                <p className="text-sm text-green-700">
                  Register a new customer and create service order
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customers" className="relative">
            Customer Directory
            {selectedCustomer && (
              <Badge variant="secondary" className="ml-2 text-xs">
                1 Selected
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="new-customer">Add New Customer</TabsTrigger>
          <TabsTrigger value="service-order" disabled={!selectedCustomer} className={cn(
            "relative",
            selectedCustomer && "text-blue-600 font-medium"
          )}>
            Create Service Order
            {selectedCustomer && (
              <div className="ml-2">
                <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                  {selectedCustomer.name.split(' ')[0]}
                </Badge>
              </div>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Customer Directory Tab */}
        <TabsContent value="customers" className="space-y-4">
          {/* Quick Selection Panel */}
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Create Service Order</h3>
                    <p className="text-sm text-gray-600">
                      {selectedCustomer
                        ? `Ready to create order for ${selectedCustomer.name}`
                        : "Select a customer below to create a service order"
                      }
                    </p>
                  </div>
                </div>
                {selectedCustomer ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {selectedCustomer.name} Selected
                    </Badge>
                    <Button
                      onClick={() => setActiveTab("service-order")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Create Order
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <div className="h-2 w-2 bg-amber-400 rounded-full animate-pulse"></div>
                    Waiting for customer selection
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Customer Directory
              </CardTitle>
              <CardDescription>
                Browse existing customers and click "Create Order" to initiate service orders
                {selectedCustomer && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">{selectedCustomer.name}</span> selected for service order.
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setActiveTab("service-order")}
                        className="p-0 h-auto text-blue-600 underline"
                      >
                        Continue to create order →
                      </Button>
                    </div>
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, phone, email, location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Customers ({filteredCustomers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer Details</TableHead>
                      <TableHead>Contact Information</TableHead>
                      <TableHead>Type & Status</TableHead>
                      <TableHead>Order History</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-accent/50">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {customer.id}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Registered: {new Date(customer.registeredDate).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </div>
                            {customer.email && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3" />
                              {customer.location}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Badge 
                              variant="outline" 
                              className={getCustomerTypeColor(customer.type)}
                            >
                              {customer.type}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {customer.subType}
                            </div>
                            <Badge 
                              variant={customer.status === 'Active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {customer.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {customer.totalOrders} orders
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Last visit: {new Date(customer.lastVisit).toLocaleDateString()}
                            </div>
                            {customer.lastService && (
                              <div className="text-xs text-muted-foreground">
                                Last service: {customer.lastService}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {selectedCustomer?.id === customer.id ? (
                              <div className="flex items-center gap-2">
                                <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Selected
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setActiveTab("service-order")}
                                  className="border-green-300 text-green-700 hover:bg-green-50"
                                >
                                  <ArrowRight className="h-4 w-4 mr-1" />
                                  Continue to Order
                                </Button>
                              </div>
                            ) : (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleSelectCustomerForService(customer)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <ClipboardList className="h-4 w-4 mr-1" />
                                  Create Order
                                </Button>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Customer Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                      <Link to={`/customers/${customer.id}`}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Customer
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleSelectCustomerForService(customer)}>
                                      <ClipboardList className="h-4 w-4 mr-2" />
                                      Select for Service Order
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Phone className="h-4 w-4 mr-2" />
                                      Call Customer
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add New Customer Tab */}
        <TabsContent value="new-customer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Customer</CardTitle>
              <CardDescription>
                Register a new customer and immediately create a service order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Type Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Customer Type *</Label>
                <RadioGroup
                  value={customerForm.customerType}
                  onValueChange={(value) => setCustomerForm(prev => ({ ...prev, customerType: value as any }))}
                  className="grid grid-cols-2 gap-3"
                >
                  {Object.entries(CUSTOMER_TYPES).map(([key, type]) => {
                    const IconComponent = type.icon;
                    return (
                      <label
                        key={key}
                        className={cn(
                          "border-2 rounded-lg p-3 cursor-pointer transition-all hover:bg-accent",
                          customerForm.customerType === key
                            ? "border-primary bg-primary/5"
                            : "border-border",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value={key} id={key} />
                          <IconComponent className="h-4 w-4" />
                          <span className="font-medium text-sm">{type.label}</span>
                        </div>
                      </label>
                    );
                  })}
                </RadioGroup>
              </div>

              {/* Name Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                {customerForm.customerType === "Personal" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={customerForm.firstName}
                        onChange={(e) => setCustomerForm(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={customerForm.lastName}
                        onChange={(e) => setCustomerForm(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter last name"
                      />
                    </div>
                  </>
                ) : (
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="companyName">Organization/Company Name *</Label>
                    <Input
                      id="companyName"
                      value={customerForm.companyName}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Enter organization or company name"
                    />
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+256 700 123 456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={customerForm.city}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={customerForm.district}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, district: e.target.value }))}
                    placeholder="District"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={customerForm.country}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Uganda"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={customerForm.notes}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about the customer..."
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={handleAddCustomer} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
                <Button
                  variant="outline"
                  onClick={resetCustomerForm}
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Service Order Tab */}
        <TabsContent value="service-order" className="space-y-4">
          {selectedCustomer ? (
            <>
              {/* Selected Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Selected Customer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                      {selectedCustomer.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{selectedCustomer.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{selectedCustomer.phone}</span>
                        <span>{selectedCustomer.email}</span>
                        <Badge variant="outline" className={getCustomerTypeColor(selectedCustomer.type)}>
                          {selectedCustomer.type}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedCustomer(null);
                        setActiveTab("customers");
                      }}
                    >
                      Change Customer
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Service Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Service</CardTitle>
                  <CardDescription>
                    Choose the service you want to order for this customer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Service Category */}
                  <div className="space-y-3">
                    <Label>Service Category</Label>
                    <Select
                      value={serviceOrderForm.serviceCategory}
                      onValueChange={(value) => setServiceOrderForm(prev => ({ ...prev, serviceCategory: value, serviceId: "" }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SERVICE_CATEGORIES).map(([key, category]) => {
                          const IconComponent = category.icon;
                          return (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                {key}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Specific Service */}
                  {serviceOrderForm.serviceCategory && (
                    <div className="space-y-3">
                      <Label>Specific Service</Label>
                      <div className="grid gap-3 md:grid-cols-2">
                        {SERVICE_CATEGORIES[serviceOrderForm.serviceCategory as keyof typeof SERVICE_CATEGORIES]?.services.map((service) => (
                          <Card 
                            key={service.id}
                            className={cn(
                              "cursor-pointer transition-all hover:shadow-md",
                              serviceOrderForm.serviceId === service.id 
                                ? "ring-2 ring-primary bg-primary/5" 
                                : "hover:bg-accent/50"
                            )}
                            onClick={() => setServiceOrderForm(prev => ({ ...prev, serviceId: service.id }))}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">{service.name}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    ${service.cost}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{service.description}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {service.duration}min
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Details */}
                  {serviceOrderForm.serviceId && (
                    <div className="space-y-4 p-4 border rounded-lg bg-accent/20">
                      <h4 className="font-medium">Order Details</h4>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Select
                            value={serviceOrderForm.priority}
                            onValueChange={(value) => setServiceOrderForm(prev => ({ ...prev, priority: value as JobPriority }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(JobPriority).map((priority) => (
                                <SelectItem key={priority} value={priority}>
                                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Scheduled Date (Optional)</Label>
                          <Input
                            type="datetime-local"
                            value={serviceOrderForm.scheduledDate}
                            onChange={(e) => setServiceOrderForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Additional Notes</Label>
                        <Textarea
                          value={serviceOrderForm.notes}
                          onChange={(e) => setServiceOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Any special instructions or notes for this service order..."
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-4">
                        <Button onClick={handleCreateServiceOrder} className="flex-1">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Create Service Order
                        </Button>
                        <Button variant="outline" onClick={() => setServiceOrderForm({
                          serviceCategory: "", serviceId: "", priority: JobPriority.NORMAL,
                          scheduledDate: "", notes: "",
                        })}>
                          Reset
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Customer Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Please select a customer from the directory or add a new customer first.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setActiveTab("customers")}>
                    Select Existing Customer
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("new-customer")}>
                    Add New Customer
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Customer Form Dialog */}
      <Dialog open={showCustomerForm} onOpenChange={setShowCustomerForm}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Quick customer registration for immediate service order
            </DialogDescription>
          </DialogHeader>
          {/* Same form content as in tab, but condensed */}
          <div className="space-y-4 py-4">
            {/* Condensed form here... */}
            <div className="space-y-3">
              <Label>Customer Type *</Label>
              <Select
                value={customerForm.customerType}
                onValueChange={(value) => setCustomerForm(prev => ({ ...prev, customerType: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CUSTOMER_TYPES).map(([key, type]) => (
                    <SelectItem key={key} value={key}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {customerForm.customerType === "Personal" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input
                    value={customerForm.firstName}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input
                    value={customerForm.lastName}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Last name"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input
                  value={customerForm.companyName}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Company name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Phone Number *</Label>
              <Input
                value={customerForm.phone}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+256 700 123 456"
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={customerForm.email}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCustomerForm(false);
                resetCustomerForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddCustomer}>
              Add Customer & Create Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
