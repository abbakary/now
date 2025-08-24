import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, Filter, Grid, List, Clock, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { useCustomerStore } from '../../context/CustomerStoreContext';
import { useVisitTracking } from '../../context/VisitTrackingContext';
import { 
  UnifiedCustomerData, 
  SearchResult, 
  ServiceRecord,
  globalSearch, 
  generateUnifiedCustomerData 
} from '../../services/customerDataService';
import { cn } from '../../lib/utils';

interface AdvancedSearchDashboardProps {
  className?: string;
  customers?: any[];
  onCustomerSelect?: (customerId: string) => void;
}

export const AdvancedSearchDashboard: React.FC<AdvancedSearchDashboardProps> = ({
  className,
  customers: passedCustomers,
  onCustomerSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<UnifiedCustomerData | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'customer' | 'visit' | 'order' | 'invoice'>('all');

  const { customers: storedCustomers } = useCustomerStore();
  const { visits, alerts } = useVisitTracking();

  // Use passed customers if provided, otherwise fall back to stored customers
  const customers = passedCustomers || storedCustomers;
  
  // Mock data for job cards and invoices (in real app, these would come from contexts/API)
  const mockJobCards: any[] = [];
  const mockOrders: any[] = [];
  const mockInvoices: any[] = [];
  
  // Perform global search
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return globalSearch(searchTerm, customers, visits, mockJobCards, mockOrders, mockInvoices);
  }, [searchTerm, customers, visits, mockJobCards, mockOrders, mockInvoices]);
  
  // Filter results by type
  const filteredResults = useMemo(() => {
    if (filterType === 'all') return searchResults;
    return searchResults.filter(result => result.type === filterType);
  }, [searchResults, filterType]);
  
  // Generate unified customer data when a customer is selected
  const handleCustomerSelect = useCallback((customerId: string) => {
    try {
      const unifiedData = generateUnifiedCustomerData(
        customerId, 
        customers, 
        visits, 
        mockJobCards, 
        mockOrders, 
        mockInvoices
      );
      setSelectedCustomer(unifiedData);
      onCustomerSelect?.(customerId);
    } catch (error) {
      console.error('Error generating unified customer data:', error);
    }
  }, [customers, visits, mockJobCards, mockOrders, mockInvoices, onCustomerSelect]);
  
  // Handle search result selection
  const handleResultSelect = useCallback((result: SearchResult) => {
    if (result.type === 'customer') {
      handleCustomerSelect(result.id);
    } else if (result.data?.customerId) {
      handleCustomerSelect(result.data.customerId);
    }
  }, [handleCustomerSelect]);
  
  // Get status color for various statuses
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'overdue': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Search Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search customers, services, orders, invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              All
            </Button>
            <Button
              variant={filterType === 'customer' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('customer')}
            >
              Customers
            </Button>
            <Button
              variant={filterType === 'visit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('visit')}
            >
              Visits
            </Button>
            <Button
              variant={filterType === 'order' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('order')}
            >
              Orders
            </Button>
            <Button
              variant={filterType === 'invoice' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('invoice')}
            >
              Invoices
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search Stats */}
        {searchTerm && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Found {filteredResults.length} results</span>
            {filteredResults.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{filteredResults.filter(r => r.type === 'customer').length} Customers</Badge>
                <Badge variant="secondary">{filteredResults.filter(r => r.type === 'visit').length} Visits</Badge>
                <Badge variant="secondary">{filteredResults.filter(r => r.type === 'order').length} Orders</Badge>
                <Badge variant="secondary">{filteredResults.filter(r => r.type === 'invoice').length} Invoices</Badge>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Results */}
        <div className="lg:col-span-2 space-y-4">
          {!searchTerm ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Search & Tracking</h3>
                <p className="text-muted-foreground">
                  Search across all customer data including visits, services, orders, and invoices.
                  Get comprehensive customer insights and tracking information.
                </p>
              </CardContent>
            </Card>
          ) : filteredResults.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className={cn(
                "space-y-2",
                viewMode === 'grid' && "grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0"
              )}>
                {filteredResults.map((result) => (
                  <Card 
                    key={`${result.type}-${result.id}`} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleResultSelect(result)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {result.category}
                            </Badge>
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              getStatusColor(result.data?.status || 'unknown')
                            )} />
                          </div>
                          <h4 className="font-semibold">{result.title}</h4>
                          <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                          {result.lastActivity && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(result.lastActivity)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            Relevance: {result.relevance}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        
        {/* Customer Profile Sidebar */}
        <div className="space-y-4">
          {selectedCustomer ? (
            <CustomerProfileSidebar customer={selectedCustomer} />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Customer Profile</h3>
                <p className="text-muted-foreground">
                  Select a customer from search results to view their comprehensive profile.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

interface CustomerProfileSidebarProps {
  customer: UnifiedCustomerData;
}

const CustomerProfileSidebar: React.FC<CustomerProfileSidebarProps> = ({ customer }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {customer.customer.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{customer.customer.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{customer.customer.customerType}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">{customer.visitStats.totalVisits}</div>
            <div className="text-xs text-muted-foreground">Total Visits</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(customer.totalRevenue)}</div>
            <div className="text-xs text-muted-foreground">Revenue</div>
          </div>
        </div>
        
        {/* Status Indicators */}
        <div className="space-y-2">
          {customer.activeVisits.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {customer.activeVisits.length} Active Visit{customer.activeVisits.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          {customer.overdueVisits.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">
                {customer.overdueVisits.length} Overdue Visit{customer.overdueVisits.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          {customer.activeJobCards.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {customer.activeJobCards.length} Active Job{customer.activeJobCards.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Visit Frequency:</span>
                <span className="font-medium">{customer.analytics.visitFrequency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Risk Level:</span>
                <span className={cn("font-medium", getRiskColor(customer.analytics.riskLevel))}>
                  {customer.analytics.riskLevel.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg Visit Duration:</span>
                <span className="font-medium">{Math.round(customer.visitStats.averageVisitDuration)} min</span>
              </div>
            </div>
            
            {customer.analytics.preferredServices.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Preferred Services</h4>
                <div className="space-y-1">
                  {customer.analytics.preferredServices.map((service, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="services" className="space-y-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Car Services: <span className="font-medium">{customer.serviceHistory.carServices.length}</span></div>
                <div>Tire Services: <span className="font-medium">{customer.serviceHistory.tireServices.length}</span></div>
                <div>Consultations: <span className="font-medium">{customer.serviceHistory.consultations.length}</span></div>
                <div>Other: <span className="font-medium">{customer.serviceHistory.customServices.length}</span></div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Time Tracking</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total Hours:</span>
                    <span className="font-medium">{customer.timeTracking.totalHoursWorked.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Labor Cost:</span>
                    <span className="font-medium">{formatCurrency(customer.timeTracking.totalLaborCost)}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="financial" className="space-y-4">
            <div className="space-y-3">
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <div className="text-xl font-bold text-primary">
                  {formatCurrency(customer.analytics.customerLifetimeValue)}
                </div>
                <div className="text-xs text-muted-foreground">Lifetime Value</div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="font-medium">{formatCurrency(customer.analytics.averageOrderValue)}</div>
                  <div className="text-muted-foreground">Avg Order</div>
                </div>
                <div>
                  <div className="font-medium">{customer.invoices.length}</div>
                  <div className="text-muted-foreground">Total Invoices</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pending:</span>
                  <span className="text-yellow-600">{customer.pendingInvoices.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Paid:</span>
                  <span className="text-green-600">{customer.paidInvoices.length}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearchDashboard;
