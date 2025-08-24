import React, { useState, useMemo, useCallback } from "react";
import { useCustomerStore } from "@/context/CustomerStoreContext";
import { useVisitTracking } from "@/context/VisitTrackingContext";
import { useFeedback } from "@/components/ui/status-popup";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Plus,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Settings,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  FileText,
  Car,
  AlertTriangle,
  CheckCircle,
  Activity,
  TrendingUp,
  Users,
  Building2,
  Globe,
  User,
  Star,
  MoreHorizontal,
  Download,
  Upload,
  RefreshCw,
  BarChart3,
  Target,
  Zap,
  Heart,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface CustomerFormData {
  firstName: string;
  lastName: string;
  companyName: string;
  customerType: "Personal" | "Government" | "NGO" | "Private" | "";
  subType: string;
  phone: string;
  email: string;
  altPhone: string;
  address: string;
  city: string;
  district: string;
  country: string;
  businessRegNumber: string;
  taxId: string;
  contactPerson: string;
  nationalId: string;
  isOwner: boolean;
  notes: string;
  preferredServices?: string[];
}

interface VisitFormData {
  visitType: "Ask" | "Service" | "Sales" | "";
  service: string;
  arrivedAt: string;
  expectedLeaveAt: string;
  notes: string;
  salesItemType?: string;
  salesQuantity?: number;
  salesPricePerItem?: number;
  salesAmount?: number;
  salesPersonName?: string;
}

// Constants
const CUSTOMER_TYPES = {
  Personal: {
    label: "Personal",
    color: "orange",
    icon: User,
    subTypes: [
      "Car Owner",
      "Driver (Brings Client Car)",
      "Motorcycle Owner",
      "Other",
    ],
  },
  Government: {
    label: "Government",
    color: "blue",
    icon: Building2,
    subTypes: [
      "Fleet Management",
      "Individual Department",
      "Parastatal",
      "Local Government",
    ],
  },
  NGO: {
    label: "NGO",
    color: "green",
    icon: Globe,
    subTypes: [
      "International NGO",
      "Local NGO",
      "Humanitarian Organization",
      "Development Agency",
    ],
  },
  Private: {
    label: "Private",
    color: "purple",
    icon: Building2,
    subTypes: [
      "Company Fleet",
      "Taxi/Uber Company",
      "Transport Business",
      "Motorcycle (Bodaboda)",
      "Other Business",
    ],
  },
};

const SERVICE_OPTIONS = [
  "Oil Change",
  "Tire Installation",
  "Tire Sales",
  "Engine Repair",
  "Brake Service",
  "Transmission Service",
  "AC Service",
  "Battery Service",
  "Consultation",
  "Fleet Maintenance",
];

// Sample data to supplement the store
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
    totalOrders: 5,
    status: "Active",
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
  },
  {
    id: "CUST-004",
    name: "World Vision Uganda",
    type: "NGO",
    subType: "Humanitarian",
    phone: "+256 414 567 890",
    email: "logistics@worldvision.ug",
    location: "Ntinda, Kampala",
    registeredDate: "2023-10-10",
    lastVisit: "2024-01-17",
    totalOrders: 8,
    status: "Active",
  },
];

// Utility functions
const getColorClasses = (color: string) => {
  switch (color) {
    case "blue":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "green":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "purple":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    case "orange":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
    case "Completed":
    case "Paid":
      return "bg-success text-success-foreground";
    case "Inactive":
    case "Pending":
    case "In Progress":
      return "bg-warning text-warning-foreground";
    case "Suspended":
    case "Cancelled":
    case "Overdue":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
  }).format(amount);
};

const toLocalInput = (isoOrDate?: string | Date) => {
  if (!isoOrDate) return "";
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => `${n}`.padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${y}-${m}-${dd}T${h}:${min}`;
};

export default function UnifiedCustomerManagement() {
  const { customers: storedCustomers, addCustomer } = useCustomerStore();
  const { visits, addVisit, activeVisits, overdueVisits, alerts } =
    useVisitTracking();
  const { success, error } = useFeedback();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "date" | "type" | "status">(
    "name",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerFormStep, setCustomerFormStep] = useState(1);
  const [showStepOptions, setShowStepOptions] = useState(false);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Form state
  const [customerForm, setCustomerForm] = useState<CustomerFormData>({
    firstName: "",
    lastName: "",
    companyName: "",
    customerType: "",
    subType: "",
    phone: "",
    email: "",
    altPhone: "",
    address: "",
    city: "",
    district: "",
    country: "Uganda",
    businessRegNumber: "",
    taxId: "",
    contactPerson: "",
    nationalId: "",
    isOwner: true,
    notes: "",
    preferredServices: [],
  });

  const [visitForm, setVisitForm] = useState<VisitFormData>({
    visitType: "",
    service: "",
    arrivedAt: toLocalInput(new Date()),
    expectedLeaveAt: "",
    notes: "",
    salesItemType: "",
    salesQuantity: 1,
    salesPricePerItem: 0,
    salesAmount: 0,
    salesPersonName: "",
  });

  // Handle adding a new customer
  const handleAddCustomer = useCallback(async () => {
    try {
      // Basic validation
      if (!customerForm.firstName.trim() || !customerForm.lastName.trim()) {
        error('First name and last name are required');
        return;
      }

      if (!customerForm.phone.trim()) {
        error('Phone number is required');
        return;
      }

      // Create customer data
      const newCustomer = {
        id: `CUST-${Date.now()}`,
        name: `${customerForm.firstName} ${customerForm.lastName}`.trim(),
        email: customerForm.email,
        phone: customerForm.phone,
        type: customerForm.customerType,
        status: 'active',
        location: customerForm.district || customerForm.city || customerForm.country,
        lastVisit: new Date().toISOString(),
        notes: customerForm.notes,
        // Include additional fields
        ...customerForm
      };

      // Add customer using the store
      await addCustomer(newCustomer);
      
      // Show success message
      success('Customer added successfully');
      
      // Reset form and close dialog
      setCustomerForm({
        firstName: "",
        lastName: "",
        companyName: "",
        customerType: "",
        subType: "",
        phone: "",
        email: "",
        altPhone: "",
        address: "",
        city: "",
        district: "",
        country: "Uganda",
        businessRegNumber: "",
        taxId: "",
        contactPerson: "",
        nationalId: "",
        isOwner: true,
        notes: "",
        preferredServices: [],
      });
      
      setShowCustomerForm(false);
      
    } catch (err) {
      console.error('Error adding customer:', err);
      error('Failed to add customer. Please try again.');
    }
  }, [customerForm, addCustomer, success, error]);

  // Combined customer data
  const allCustomers = useMemo(() => {
    const byId = new Map();
    [...storedCustomers, ...SAMPLE_CUSTOMERS].forEach((customer) => {
      byId.set(customer.id, customer);
    });
    return Array.from(byId.values());
  }, [storedCustomers]);

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let filtered = allCustomers;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(term) ||
          customer.id.toLowerCase().includes(term) ||
          customer.email?.toLowerCase().includes(term) ||
          customer.phone?.includes(searchTerm) ||
          customer.location?.toLowerCase().includes(term),
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((customer) => customer.type === filterType);
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (customer) => customer.status === filterStatus,
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "date":
          aVal = new Date(a.registeredDate || 0).getTime();
          bVal = new Date(b.registeredDate || 0).getTime();
          break;
        case "type":
          aVal = a.type;
          bVal = b.type;
          break;
        case "status":
          aVal = a.status || "";
          bVal = b.status || "";
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [allCustomers, searchTerm, filterType, filterStatus, sortBy, sortOrder]);

  // Dashboard statistics
  const dashboardStats = useMemo(() => {
    const totalCustomers = allCustomers.length;
    const newCustomersThisMonth = allCustomers.filter((c) => {
      const regDate = new Date(c.registeredDate || 0);
      const now = new Date();
      return (
        regDate.getMonth() === now.getMonth() &&
        regDate.getFullYear() === now.getFullYear()
      );
    }).length;

    const customerTypeStats = allCustomers.reduce(
      (acc, customer) => {
        acc[customer.type] = (acc[customer.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const activeCustomers = new Set(
      activeVisits.map((v) => v.customerId || v.customerName),
    ).size;

    const totalSales = visits
      .filter((v) => v.visitType === "Sales")
      .reduce((sum, v) => sum + (v.salesDetails?.amount || 0), 0);

    return {
      totalCustomers,
      newCustomersThisMonth,
      customerTypeStats,
      activeCustomers,
      totalSales,
      activeVisits: activeVisits.length,
      overdueVisits: overdueVisits.length,
      alerts: alerts.length,
    };
  }, [allCustomers, visits, activeVisits, overdueVisits, alerts]);

  // Event handlers
  const handleCustomerFormChange = (
    field: keyof CustomerFormData,
    value: any,
  ) => {
    setCustomerForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleVisitFormChange = (field: keyof VisitFormData, value: any) => {
    setVisitForm((prev) => ({ ...prev, [field]: value }));
  };

  // Validation for basic info step
  const validateBasicInfo = () => {
    if (!customerForm.customerType) {
      error("Missing customer type", "Please select a customer type.");
      return false;
    }

    if (!customerForm.subType) {
      error("Missing sub-type", "Please select a customer sub-type.");
      return false;
    }

    const isPersonal = customerForm.customerType === "Personal";
    if (isPersonal && (!customerForm.firstName || !customerForm.lastName)) {
      error("Missing name", "Please enter first and last name.");
      return false;
    }

    if (!isPersonal && !customerForm.companyName) {
      error("Missing company name", "Please enter company/organization name.");
      return false;
    }

    return true;
  };

  // Validation for contact info step
  const validateContactInfo = () => {
    if (!customerForm.phone) {
      error("Missing phone", "Please enter a phone number.");
      return false;
    }

    return true;
  };

  // Handle step navigation
  const handleNextStep = () => {
    if (customerFormStep === 1 && validateBasicInfo()) {
      setCustomerFormStep(2);
    } else if (customerFormStep === 2 && validateContactInfo()) {
      setShowStepOptions(true);
    }
  };

  const handlePreviousStep = () => {
    if (customerFormStep === 2) {
      setCustomerFormStep(1);
    }
  };

  // Continue to additional steps
  const handleContinueToPreferences = () => {
    setShowStepOptions(false);
    setCustomerFormStep(3);
  };

  // Save customer with basic info only
  const handleQuickSave = () => {
    createCustomer();
  };

  // Complete customer creation with all details
  const handleCompleteCustomer = () => {
    createCustomer();
  };

  // Create customer function
  const createCustomer = () => {
    try {
      const isPersonal = customerForm.customerType === "Personal";
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
        location: [
          customerForm.address,
          customerForm.city,
          customerForm.district,
          customerForm.country,
        ]
          .filter(Boolean)
          .join(", "),
        registeredDate: new Date().toISOString(),
        lastVisit: new Date().toISOString(),
        totalOrders: 0,
        status: "Active",
      };

      addCustomer(newCustomer);
      success(
        "Customer added successfully!",
        `${customerName} has been added to your database.`,
      );

      // Reset form and states
      resetCustomerForm();
    } catch (err) {
      error("Failed to add customer", "Please try again.");
    }
  };

  const resetCustomerForm = () => {
    setCustomerForm({
      firstName: "",
      lastName: "",
      companyName: "",
      customerType: "",
      subType: "",
      phone: "",
      email: "",
      altPhone: "",
      address: "",
      city: "",
      district: "",
      country: "Uganda",
      businessRegNumber: "",
      taxId: "",
      contactPerson: "",
      nationalId: "",
      isOwner: true,
      notes: "",
      preferredServices: [],
    });
    setCustomerFormStep(1);
    setShowStepOptions(false);
    setShowCustomerForm(false);
  };

  const handleCreateVisit = () => {
    try {
      if (!selectedCustomer) {
        error("No customer selected", "Please select a customer first.");
        return;
      }

      if (!visitForm.visitType) {
        error("Missing visit type", "Please select a visit type.");
        return;
      }

      if (visitForm.visitType === "Sales") {
        if (
          !visitForm.salesItemType ||
          !visitForm.salesQuantity ||
          !visitForm.salesPricePerItem
        ) {
          error(
            "Incomplete sales details",
            "Please fill in all sales information.",
          );
          return;
        }
      }

      // Create visit
      const visit = addVisit({
        customerName: selectedCustomer.name,
        customerId: selectedCustomer.id,
        visitType: visitForm.visitType as any,
        service: visitForm.service || undefined,
        arrivedAt: visitForm.arrivedAt,
        expectedLeaveAt: visitForm.expectedLeaveAt || undefined,
        notes: visitForm.notes || undefined,
        salesDetails:
          visitForm.visitType === "Sales"
            ? {
                itemType: visitForm.salesItemType,
                quantity: visitForm.salesQuantity,
                pricePerItem: visitForm.salesPricePerItem,
                amount:
                  visitForm.salesAmount ||
                  visitForm.salesQuantity! * visitForm.salesPricePerItem!,
                salesperson: visitForm.salesPersonName
                  ? { name: visitForm.salesPersonName }
                  : undefined,
              }
            : undefined,
      });

      success(
        "Visit created successfully!",
        `${visitForm.visitType} visit started for ${selectedCustomer.name}.`,
      );

      // Reset form
      setVisitForm({
        visitType: "",
        service: "",
        arrivedAt: toLocalInput(new Date()),
        expectedLeaveAt: "",
        notes: "",
        salesItemType: "",
        salesQuantity: 1,
        salesPricePerItem: 0,
        salesAmount: 0,
        salesPersonName: "",
      });
      setShowVisitForm(false);
    } catch (err) {
      error("Failed to create visit", "Please try again.");
    }
  };

  const getCustomerStats = (customerId: string) => {
    const customerVisits = visits.filter(
      (v) =>
        v.customerId === customerId ||
        v.customerName === allCustomers.find((c) => c.id === customerId)?.name,
    );

    const serviceVisits = customerVisits.filter(
      (v) => v.visitType === "Service",
    );
    const salesVisits = customerVisits.filter((v) => v.visitType === "Sales");
    const completedVisits = customerVisits.filter(
      (v) => v.status === "Completed",
    );
    const activeVisitsCount = customerVisits.filter(
      (v) => v.status === "Active",
    ).length;
    const overdueVisitsCount = customerVisits.filter(
      (v) => v.status === "Overdue",
    ).length;

    const totalSalesAmount = salesVisits.reduce((sum, visit) => {
      return sum + (visit.salesDetails?.amount || 0);
    }, 0);

    return {
      totalVisits: customerVisits.length,
      serviceVisits: serviceVisits.length,
      salesVisits: salesVisits.length,
      completedVisits: completedVisits.length,
      activeVisits: activeVisitsCount,
      overdueVisits: overdueVisitsCount,
      totalSalesAmount,
      lastVisit:
        customerVisits.length > 0
          ? customerVisits.sort(
              (a, b) =>
                new Date(b.arrivedAt).getTime() -
                new Date(a.arrivedAt).getTime(),
            )[0]
          : null,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Customer Management Hub
            </h1>
            <p className="text-muted-foreground mt-1">
              Unified customer management with search, analytics, and tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            {alerts.length > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {alerts.length} Alert{alerts.length > 1 ? "s" : ""}
              </Badge>
            )}
            <Dialog open={showCustomerForm} onOpenChange={setShowCustomerForm}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                  <DialogDescription>
                    Create a new customer record with all necessary information.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Customer Type */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">
                      Customer Type *
                    </Label>
                    <RadioGroup
                      value={customerForm.customerType}
                      onValueChange={(value) =>
                        handleCustomerFormChange("customerType", value)
                      }
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
                              <span className="font-medium text-sm">
                                {type.label}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </RadioGroup>
                  </div>

                  {/* Sub Type */}
                  {customerForm.customerType && (
                    <div className="space-y-2">
                      <Label htmlFor="subType">Sub-Type *</Label>
                      <Select
                        value={customerForm.subType}
                        onValueChange={(value) =>
                          handleCustomerFormChange("subType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sub-type" />
                        </SelectTrigger>
                        <SelectContent>
                          {CUSTOMER_TYPES[
                            customerForm.customerType as keyof typeof CUSTOMER_TYPES
                          ]?.subTypes.map((subType) => (
                            <SelectItem key={subType} value={subType}>
                              {subType}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Name Fields */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {customerForm.customerType === "Personal" ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={customerForm.firstName}
                            onChange={(e) =>
                              handleCustomerFormChange(
                                "firstName",
                                e.target.value,
                              )
                            }
                            placeholder="Enter first name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={customerForm.lastName}
                            onChange={(e) =>
                              handleCustomerFormChange(
                                "lastName",
                                e.target.value,
                              )
                            }
                            placeholder="Enter last name"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="companyName">
                          Organization/Company Name *
                        </Label>
                        <Input
                          id="companyName"
                          value={customerForm.companyName}
                          onChange={(e) =>
                            handleCustomerFormChange(
                              "companyName",
                              e.target.value,
                            )
                          }
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
                        onChange={(e) =>
                          handleCustomerFormChange("phone", e.target.value)
                        }
                        placeholder="+256 700 123 456"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerForm.email}
                        onChange={(e) =>
                          handleCustomerFormChange("email", e.target.value)
                        }
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={customerForm.address}
                        onChange={(e) =>
                          handleCustomerFormChange("address", e.target.value)
                        }
                        placeholder="Street address"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={customerForm.city}
                          onChange={(e) =>
                            handleCustomerFormChange("city", e.target.value)
                          }
                          placeholder="City"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="district">District</Label>
                        <Input
                          id="district"
                          value={customerForm.district}
                          onChange={(e) =>
                            handleCustomerFormChange("district", e.target.value)
                          }
                          placeholder="District"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={customerForm.country}
                          onChange={(e) =>
                            handleCustomerFormChange("country", e.target.value)
                          }
                          placeholder="Uganda"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={customerForm.notes}
                      onChange={(e) =>
                        handleCustomerFormChange("notes", e.target.value)
                      }
                      placeholder="Additional notes about the customer..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomerForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddCustomer}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Total Customers
                  </p>
                  <p className="text-3xl font-bold">
                    {dashboardStats.totalCustomers}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    +{dashboardStats.newCustomersThisMonth} this month
                  </p>
                </div>
                <Users className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Active Visits
                  </p>
                  <p className="text-3xl font-bold">
                    {dashboardStats.activeVisits}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats.activeCustomers} unique customers
                  </p>
                </div>
                <Activity className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(dashboardStats.totalSales)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    From sales visits
                  </p>
                </div>
                <DollarSign className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "bg-gradient-to-br border-2",
              dashboardStats.overdueVisits > 0
                ? "from-red-500/10 to-red-600/10 border-red-200 dark:border-red-800"
                : "from-gray-500/10 to-gray-600/10 border-gray-200 dark:border-gray-800",
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      dashboardStats.overdueVisits > 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-600 dark:text-gray-400",
                    )}
                  >
                    Alerts
                  </p>
                  <p className="text-3xl font-bold">{dashboardStats.alerts}</p>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats.overdueVisits} overdue visits
                  </p>
                </div>
                <AlertTriangle
                  className={cn(
                    "h-10 w-10",
                    dashboardStats.overdueVisits > 0
                      ? "text-red-500"
                      : "text-gray-500",
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers by name, ID, phone, email, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-white dark:bg-gray-800"
                />
              </div>

              {/* Filter Controls */}
              <div className="flex items-center gap-2">
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="h-12">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filter Customers</SheetTitle>
                      <SheetDescription>
                        Refine your customer search with advanced filters
                      </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-6 py-6">
                      <div className="space-y-3">
                        <Label>Customer Type</Label>
                        <Select
                          value={filterType}
                          onValueChange={setFilterType}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {Object.keys(CUSTOMER_TYPES).map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label>Status</Label>
                        <Select
                          value={filterStatus}
                          onValueChange={setFilterStatus}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            <SelectItem value="Suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label>Sort By</Label>
                        <Select
                          value={sortBy}
                          onValueChange={(value: any) => setSortBy(value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="date">
                              Registration Date
                            </SelectItem>
                            <SelectItem value="type">Customer Type</SelectItem>
                            <SelectItem value="status">Status</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="sort-order"
                          checked={sortOrder === "desc"}
                          onCheckedChange={(checked) =>
                            setSortOrder(checked ? "desc" : "asc")
                          }
                        />
                        <Label htmlFor="sort-order">Descending Order</Label>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-12">
                      {sortOrder === "asc" ? (
                        <SortAsc className="h-4 w-4" />
                      ) : (
                        <SortDesc className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Sort Order</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSortOrder("asc")}>
                      <SortAsc className="h-4 w-4 mr-2" />
                      Ascending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOrder("desc")}>
                      <SortDesc className="h-4 w-4 mr-2" />
                      Descending
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none h-12"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none h-12"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(filterType !== "all" || filterStatus !== "all") && (
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm text-muted-foreground">
                  Active filters:
                </span>
                {filterType !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Type: {filterType}
                    <button
                      onClick={() => setFilterType("all")}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filterStatus !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Status: {filterStatus}
                    <button
                      onClick={() => setFilterStatus("all")}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterType("all");
                    setFilterStatus("all");
                  }}
                  className="h-7 px-2 text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredCustomers.length} of {allCustomers.length}{" "}
              customers
            </p>
            {searchTerm && (
              <Badge variant="outline">Search: "{searchTerm}"</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Customer Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((customer) => {
              const stats = getCustomerStats(customer.id);
              const typeConfig =
                CUSTOMER_TYPES[customer.type as keyof typeof CUSTOMER_TYPES];
              const IconComponent = typeConfig?.icon || User;

              return (
                <Card
                  key={customer.id}
                  className="hover:shadow-lg transition-all duration-200 group cursor-pointer bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-md"
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-12 w-12 rounded-full flex items-center justify-center",
                            typeConfig
                              ? `bg-${typeConfig.color}-100 dark:bg-${typeConfig.color}-900/30`
                              : "bg-gray-100 dark:bg-gray-800",
                          )}
                        >
                          <IconComponent
                            className={cn(
                              "h-6 w-6",
                              typeConfig
                                ? `text-${typeConfig.color}-600 dark:text-${typeConfig.color}-400`
                                : "text-gray-600",
                            )}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-lg truncate">
                            {customer.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {customer.id}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowVisitForm(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Visit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Customer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Customer Type and Status */}
                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        variant="outline"
                        className={getColorClasses(typeConfig?.color || "gray")}
                      >
                        {customer.type}
                      </Badge>
                      <Badge className={getStatusColor(customer.status || "")}>
                        {customer.status}
                      </Badge>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4 text-sm">
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4 text-blue-500" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      {customer.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4 text-green-500" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                      )}
                      {customer.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 text-red-500" />
                          <span className="truncate">{customer.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-4">
                      <div className="grid grid-cols-3 gap-3 text-center text-sm">
                        <div>
                          <div className="font-bold text-lg text-blue-600">
                            {stats.totalVisits}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Visits
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-lg text-green-600">
                            {stats.completedVisits}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Done
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-lg text-purple-600">
                            {formatCurrency(stats.totalSalesAmount)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Sales
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCustomer(customer)}
                        className="flex-1 h-9"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowVisitForm(true);
                        }}
                        className="flex-1 h-9 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Visit
                      </Button>
                    </div>

                    {/* Alerts */}
                    {stats.overdueVisits > 0 && (
                      <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-xs">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">
                            {stats.overdueVisits} overdue visit
                            {stats.overdueVisits > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left p-4 font-medium">Customer</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Contact</th>
                      <th className="text-left p-4 font-medium">Location</th>
                      <th className="text-left p-4 font-medium">Stats</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => {
                      const stats = getCustomerStats(customer.id);
                      const typeConfig =
                        CUSTOMER_TYPES[
                          customer.type as keyof typeof CUSTOMER_TYPES
                        ];
                      const IconComponent = typeConfig?.icon || User;

                      return (
                        <tr
                          key={customer.id}
                          className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "h-10 w-10 rounded-full flex items-center justify-center",
                                  typeConfig
                                    ? `bg-${typeConfig.color}-100 dark:bg-${typeConfig.color}-900/30`
                                    : "bg-gray-100",
                                )}
                              >
                                <IconComponent
                                  className={cn(
                                    "h-5 w-5",
                                    typeConfig
                                      ? `text-${typeConfig.color}-600 dark:text-${typeConfig.color}-400`
                                      : "text-gray-600",
                                  )}
                                />
                              </div>
                              <div>
                                <div className="font-semibold">
                                  {customer.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {customer.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge
                              variant="outline"
                              className={getColorClasses(
                                typeConfig?.color || "gray",
                              )}
                            >
                              {customer.type}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-blue-500" />
                                <span>{customer.phone || "-"}</span>
                              </div>
                              {customer.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3 text-green-500" />
                                  <span className="truncate max-w-[150px]">
                                    {customer.email}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 max-w-[200px]">
                            <div className="truncate text-sm">
                              {customer.location || "-"}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3 text-sm">
                              <div className="text-center">
                                <div className="font-bold text-blue-600">
                                  {stats.totalVisits}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Visits
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-green-600">
                                  {stats.completedVisits}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Done
                                </div>
                              </div>
                              {stats.overdueVisits > 0 && (
                                <div className="text-center">
                                  <div className="font-bold text-red-600">
                                    {stats.overdueVisits}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Overdue
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge
                              className={getStatusColor(customer.status || "")}
                            >
                              {customer.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1 justify-end">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedCustomer(customer)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setShowVisitForm(true);
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {filteredCustomers.length === 0 && (
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No customers found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || filterType !== "all" || filterStatus !== "all"
                  ? "Try adjusting your search or filters to find customers."
                  : "Get started by adding your first customer to the system."}
              </p>
              {!searchTerm &&
                filterType === "all" &&
                filterStatus === "all" && (
                  <Button onClick={() => setShowCustomerForm(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Your First Customer
                  </Button>
                )}
            </CardContent>
          </Card>
        )}

        {/* Customer Details Sheet */}
        <Sheet
          open={!!selectedCustomer}
          onOpenChange={() => setSelectedCustomer(null)}
        >
          <SheetContent className="sm:max-w-[600px] w-full overflow-y-auto">
            {selectedCustomer && (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    {selectedCustomer.name}
                  </SheetTitle>
                  <SheetDescription>
                    Customer ID: {selectedCustomer.id} • {selectedCustomer.type}
                  </SheetDescription>
                </SheetHeader>

                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="mt-6"
                >
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="visits">Visits</TabsTrigger>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6 mt-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      {(() => {
                        const stats = getCustomerStats(selectedCustomer.id);
                        return (
                          <>
                            <Card>
                              <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                  {stats.totalVisits}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Total Visits
                                </div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">
                                  {stats.completedVisits}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Completed
                                </div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                  {formatCurrency(stats.totalSalesAmount)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Total Sales
                                </div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                  {selectedCustomer.totalOrders || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Orders
                                </div>
                              </CardContent>
                            </Card>
                          </>
                        );
                      })()}
                    </div>

                    {/* Contact Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Contact Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-blue-500" />
                          <span>{selectedCustomer.phone || "No phone"}</span>
                        </div>
                        {selectedCustomer.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-green-500" />
                            <span>{selectedCustomer.email}</span>
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                          <span>
                            {selectedCustomer.location || "No address"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => setShowVisitForm(true)}
                        className="h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Visit
                      </Button>
                      <Button variant="outline" className="h-12">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Customer
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="visits" className="space-y-4 mt-6">
                    {(() => {
                      const customerVisits = visits.filter(
                        (v) =>
                          v.customerId === selectedCustomer.id ||
                          v.customerName === selectedCustomer.name,
                      );

                      return customerVisits.length === 0 ? (
                        <div className="text-center py-8">
                          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            No visits recorded for this customer.
                          </p>
                          <Button
                            onClick={() => setShowVisitForm(true)}
                            className="mt-4"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Visit
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {customerVisits.map((visit) => (
                            <Card key={visit.id}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                      {visit.visitType}
                                    </Badge>
                                    <Badge
                                      className={getStatusColor(visit.status)}
                                    >
                                      {visit.status}
                                    </Badge>
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(
                                      visit.arrivedAt,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm font-medium">
                                  {visit.service || "General visit"}
                                </p>
                                {visit.notes && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {visit.notes}
                                  </p>
                                )}
                                {visit.salesDetails?.amount && (
                                  <p className="text-sm font-medium text-green-600 mt-1">
                                    Sales:{" "}
                                    {formatCurrency(visit.salesDetails.amount)}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      );
                    })()}
                  </TabsContent>

                  <TabsContent value="profile" className="space-y-4 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Customer Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <span className="ml-2 font-medium">
                              {selectedCustomer.type}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Sub-type:
                            </span>
                            <span className="ml-2 font-medium">
                              {selectedCustomer.subType || "-"}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Status:
                            </span>
                            <span className="ml-2">
                              <Badge
                                className={getStatusColor(
                                  selectedCustomer.status || "",
                                )}
                              >
                                {selectedCustomer.status}
                              </Badge>
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Registered:
                            </span>
                            <span className="ml-2 font-medium">
                              {selectedCustomer.registeredDate
                                ? new Date(
                                    selectedCustomer.registeredDate,
                                  ).toLocaleDateString()
                                : "-"}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Last Visit:
                            </span>
                            <span className="ml-2 font-medium">
                              {selectedCustomer.lastVisit
                                ? new Date(
                                    selectedCustomer.lastVisit,
                                  ).toLocaleDateString()
                                : "-"}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Total Orders:
                            </span>
                            <span className="ml-2 font-medium">
                              {selectedCustomer.totalOrders || 0}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analytics" className="space-y-4 mt-6">
                    {(() => {
                      const stats = getCustomerStats(selectedCustomer.id);
                      const totalVisits = stats.totalVisits;

                      return (
                        <div className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">
                                Visit Distribution
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Service Visits</span>
                                  <span>
                                    {stats.serviceVisits}/{totalVisits}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{
                                      width: `${totalVisits ? (stats.serviceVisits / totalVisits) * 100 : 0}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Sales Visits</span>
                                  <span>
                                    {stats.salesVisits}/{totalVisits}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{
                                      width: `${totalVisits ? (stats.salesVisits / totalVisits) * 100 : 0}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Completed Visits</span>
                                  <span>
                                    {stats.completedVisits}/{totalVisits}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{
                                      width: `${totalVisits ? (stats.completedVisits / totalVisits) * 100 : 0}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {stats.totalSalesAmount > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">
                                  Revenue Metrics
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 gap-4 text-center">
                                  <div>
                                    <div className="text-2xl font-bold text-green-600">
                                      {formatCurrency(stats.totalSalesAmount)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Total Sales
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-2xl font-bold text-blue-600">
                                      {formatCurrency(
                                        stats.salesVisits > 0
                                          ? stats.totalSalesAmount /
                                              stats.salesVisits
                                          : 0,
                                      )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Avg per Sale
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      );
                    })()}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Visit Creation Dialog */}
        <Dialog open={showVisitForm} onOpenChange={setShowVisitForm}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Visit</DialogTitle>
              <DialogDescription>
                {selectedCustomer
                  ? `Create a new visit for ${selectedCustomer.name}`
                  : "Create a new customer visit"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Visit Type */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Visit Type *</Label>
                <RadioGroup
                  value={visitForm.visitType}
                  onValueChange={(value) =>
                    handleVisitFormChange("visitType", value)
                  }
                  className="grid grid-cols-3 gap-3"
                >
                  <label
                    className={cn(
                      "border-2 rounded-lg p-3 cursor-pointer transition-all hover:bg-accent",
                      visitForm.visitType === "Ask"
                        ? "border-primary bg-primary/5"
                        : "border-border",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="Ask" id="visit-ask" />
                      <span className="font-medium text-sm">Inquiry</span>
                    </div>
                  </label>
                  <label
                    className={cn(
                      "border-2 rounded-lg p-3 cursor-pointer transition-all hover:bg-accent",
                      visitForm.visitType === "Service"
                        ? "border-primary bg-primary/5"
                        : "border-border",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="Service" id="visit-service" />
                      <span className="font-medium text-sm">Service</span>
                    </div>
                  </label>
                  <label
                    className={cn(
                      "border-2 rounded-lg p-3 cursor-pointer transition-all hover:bg-accent",
                      visitForm.visitType === "Sales"
                        ? "border-primary bg-primary/5"
                        : "border-border",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="Sales" id="visit-sales" />
                      <span className="font-medium text-sm">Sales</span>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              {/* Service Selection */}
              {(visitForm.visitType === "Service" ||
                visitForm.visitType === "Sales") && (
                <div className="space-y-2">
                  <Label htmlFor="service">Service Required *</Label>
                  <Select
                    value={visitForm.service}
                    onValueChange={(value) =>
                      handleVisitFormChange("service", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_OPTIONS.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Timing */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="arrivedAt">Arrived At</Label>
                  <Input
                    id="arrivedAt"
                    type="datetime-local"
                    value={visitForm.arrivedAt}
                    onChange={(e) =>
                      handleVisitFormChange("arrivedAt", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedLeaveAt">Expected Leave</Label>
                  <Input
                    id="expectedLeaveAt"
                    type="datetime-local"
                    value={visitForm.expectedLeaveAt}
                    onChange={(e) =>
                      handleVisitFormChange("expectedLeaveAt", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Sales Details */}
              {visitForm.visitType === "Sales" && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-semibold text-green-700 dark:text-green-400">
                    Sales Details
                  </h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="salesItemType">Item Type *</Label>
                      <Input
                        id="salesItemType"
                        value={visitForm.salesItemType || ""}
                        onChange={(e) =>
                          handleVisitFormChange("salesItemType", e.target.value)
                        }
                        placeholder="e.g., Tire, Battery, Oil"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salesPersonName">Salesperson</Label>
                      <Input
                        id="salesPersonName"
                        value={visitForm.salesPersonName || ""}
                        onChange={(e) =>
                          handleVisitFormChange(
                            "salesPersonName",
                            e.target.value,
                          )
                        }
                        placeholder="Salesperson name"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="salesQuantity">Quantity *</Label>
                      <Input
                        id="salesQuantity"
                        type="number"
                        min="1"
                        value={visitForm.salesQuantity ?? ""}
                        onChange={(e) => {
                          const q = e.target.value ? Number(e.target.value) : 1;
                          handleVisitFormChange("salesQuantity", q);
                          const p = visitForm.salesPricePerItem ?? 0;
                          if (q && p)
                            handleVisitFormChange("salesAmount", q * p);
                        }}
                        placeholder="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salesPricePerItem">
                        Price per Item *
                      </Label>
                      <Input
                        id="salesPricePerItem"
                        type="number"
                        min="0"
                        value={visitForm.salesPricePerItem ?? ""}
                        onChange={(e) => {
                          const p = e.target.value ? Number(e.target.value) : 0;
                          handleVisitFormChange("salesPricePerItem", p);
                          const q = visitForm.salesQuantity ?? 1;
                          if (q && p)
                            handleVisitFormChange("salesAmount", q * p);
                        }}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salesAmount">Total Amount</Label>
                      <Input
                        id="salesAmount"
                        type="number"
                        value={visitForm.salesAmount ?? ""}
                        onChange={(e) => {
                          const a = e.target.value ? Number(e.target.value) : 0;
                          handleVisitFormChange("salesAmount", a);
                        }}
                        placeholder="Auto-calculated"
                        className="bg-muted"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="visitNotes">Visit Notes</Label>
                <Textarea
                  id="visitNotes"
                  value={visitForm.notes}
                  onChange={(e) =>
                    handleVisitFormChange("notes", e.target.value)
                  }
                  placeholder="Add details about this visit..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowVisitForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateVisit}>
                <Plus className="h-4 w-4 mr-2" />
                Create Visit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
