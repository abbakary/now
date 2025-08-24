import React, { useState, useCallback, useMemo } from 'react';
import { Car, Shield, MessageCircle, Settings, Plus, Search, Filter, Calendar, Clock, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useCustomerStore } from '@/context/CustomerStoreContext';
import { useVisitTracking } from '@/context/VisitTrackingContext';
import { useJobCardIntegration } from '@/hooks/useJobCardIntegration';
import ServiceIntegrationManager from '@/components/services/ServiceIntegrationManager';
import { ServiceRecord, generateUnifiedCustomerData } from '@/services/customerDataService';
import { cn } from '@/lib/utils';

/**
 * Unified Service Management Page
 * Integrates car services, tire services, consultations into a single tracking-centered view
 */
export default function UnifiedServiceManagement() {
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed' | 'create' | 'analytics'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [filterType, setFilterType] = useState<'all' | 'car' | 'tire' | 'consultation' | 'custom'>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  
  const { customers } = useCustomerStore();
  const { visits, activeVisits } = useVisitTracking();
  const { createJobCardWithTracking } = useJobCardIntegration();
  
  // Mock service records (in real app, these would come from an API or context)
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  
  // Calculate service statistics
  const serviceStats = useMemo(() => {
    const stats = {
      total: serviceRecords.length,
      active: serviceRecords.filter(s => s.status === 'Active' || s.status === 'Pending').length,
      completed: serviceRecords.filter(s => s.status === 'Completed').length,
      revenue: serviceRecords.filter(s => s.status === 'Completed').reduce((sum, s) => sum + s.cost, 0),
      avgDuration: 0,
      byType: {
        car: serviceRecords.filter(s => s.serviceType === 'car').length,
        tire: serviceRecords.filter(s => s.serviceType === 'tire').length,
        consultation: serviceRecords.filter(s => s.serviceType === 'consultation').length,
        custom: serviceRecords.filter(s => s.serviceType === 'custom').length,
      }
    };
    
    const completedWithDuration = serviceRecords.filter(s => s.status === 'Completed' && s.duration);
    stats.avgDuration = completedWithDuration.length > 0 
      ? completedWithDuration.reduce((sum, s) => sum + (s.duration || 0), 0) / completedWithDuration.length
      : 0;
    
    return stats;
  }, [serviceRecords]);
  
  // Filter service records based on search and filters
  const filteredServices = useMemo(() => {
    let filtered = serviceRecords;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(service => 
        service.serviceName.toLowerCase().includes(term) ||
        service.notes?.toLowerCase().includes(term) ||
        service.technician?.toLowerCase().includes(term)
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(service => 
        service.status.toLowerCase() === filterStatus
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(service => 
        service.serviceType === filterType
      );
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [serviceRecords, searchTerm, filterStatus, filterType]);
  
  // Handle service creation
  const handleServiceCreate = useCallback((service: ServiceRecord) => {
    setServiceRecords(prev => [service, ...prev]);
    setIsServiceDialogOpen(false);
  }, []);
  
  // Get customer name by ID
  const getCustomerName = useCallback((customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unknown Customer';
  }, [customers]);
  
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };
  
  // Get service type icon
  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'car': return <Car className="h-4 w-4" />;
      case 'tire': return <Shield className="h-4 w-4" />;
      case 'consultation': return <MessageCircle className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Management</h1>
          <p className="text-muted-foreground">
            Unified car services, tire services, and consultations with real-time tracking
          </p>
        </div>
        <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Customer</label>
                <Select value={selectedCustomerId || ''} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedCustomerId && (
                <ServiceIntegrationManager
                  customerId={selectedCustomerId}
                  customerName={getCustomerName(selectedCustomerId)}
                  onServiceCreate={handleServiceCreate}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Services</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{serviceStats.total}</p>
                  <Badge variant="secondary" className="ml-2">
                    {serviceStats.active} Active
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">{Math.round(serviceStats.avgDuration)}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(serviceStats.revenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">
                    {serviceStats.total > 0 ? Math.round((serviceStats.completed / serviceStats.total) * 100) : 0}%
                  </p>
                </div>
                <Progress 
                  value={serviceStats.total > 0 ? (serviceStats.completed / serviceStats.total) * 100 : 0} 
                  className="mt-2" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Service Type Distribution */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(serviceStats.byType).map(([type, count]) => (
          <Card key={type}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {getServiceTypeIcon(type)}
                <div>
                  <h4 className="font-semibold text-sm capitalize">{type} Services</h4>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            <Clock className="h-4 w-4 mr-2" />
            Active Services ({serviceStats.active})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed ({serviceStats.completed})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Calendar className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          <ServiceListView 
            services={filteredServices.filter(s => s.status !== 'Completed')}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            filterType={filterType}
            onFilterTypeChange={setFilterType}
            getCustomerName={getCustomerName}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            getServiceTypeIcon={getServiceTypeIcon}
          />
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          <ServiceListView 
            services={filteredServices.filter(s => s.status === 'Completed')}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            filterType={filterType}
            onFilterTypeChange={setFilterType}
            getCustomerName={getCustomerName}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            getServiceTypeIcon={getServiceTypeIcon}
          />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <ServiceAnalytics 
            services={serviceRecords}
            stats={serviceStats}
            formatCurrency={formatCurrency}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ServiceListViewProps {
  services: ServiceRecord[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: any) => void;
  filterType: string;
  onFilterTypeChange: (type: any) => void;
  getCustomerName: (id: string) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  getStatusColor: (status: string) => string;
  getServiceTypeIcon: (type: string) => React.ReactNode;
}

const ServiceListView: React.FC<ServiceListViewProps> = ({
  services,
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterType,
  onFilterTypeChange,
  getCustomerName,
  formatCurrency,
  formatDate,
  getStatusColor,
  getServiceTypeIcon
}) => {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search services, customers, technicians..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={onFilterStatusChange}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={onFilterTypeChange}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="car">Car Services</SelectItem>
            <SelectItem value="tire">Tire Services</SelectItem>
            <SelectItem value="consultation">Consultations</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Service List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {services.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Services Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : 'Create your first service to get started.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            services.map((service) => (
              <Card key={service.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getServiceTypeIcon(service.serviceType)}
                        <h4 className="font-semibold">{service.serviceName}</h4>
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          getStatusColor(service.status)
                        )} />
                        <Badge variant="outline" className="text-xs">
                          {service.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Customer: {getCustomerName(service.id)}</p>
                        <p>Date: {formatDate(service.date)}</p>
                        {service.technician && <p>Technician: {service.technician}</p>}
                        {service.duration && <p>Duration: {service.duration} minutes</p>}
                        {service.notes && <p className="truncate">Notes: {service.notes}</p>}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-semibold">{formatCurrency(service.cost)}</div>
                      <div className="text-xs text-muted-foreground">
                        {service.jobCardId && `Job: ${service.jobCardId.slice(-8)}`}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

interface ServiceAnalyticsProps {
  services: ServiceRecord[];
  stats: any;
  formatCurrency: (amount: number) => string;
}

const ServiceAnalytics: React.FC<ServiceAnalyticsProps> = ({
  services,
  stats,
  formatCurrency
}) => {
  // Calculate monthly trends
  const monthlyData = useMemo(() => {
    const months = new Map<string, { count: number; revenue: number }>();
    
    services.forEach(service => {
      const month = new Date(service.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      const existing = months.get(month) || { count: 0, revenue: 0 };
      months.set(month, {
        count: existing.count + 1,
        revenue: existing.revenue + (service.status === 'Completed' ? service.cost : 0)
      });
    });
    
    return Array.from(months.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-6); // Last 6 months
  }, [services]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Service Type Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Add service type icons here */}
                  <span className="text-sm capitalize">{type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{count}</Badge>
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full"
                      style={{ 
                        width: `${stats.total > 0 ? ((count as number) / stats.total) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              {monthlyData.map(([month, data]) => (
                <div key={month} className="flex items-center justify-between">
                  <span className="text-sm">{month}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">{data.count} services</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(data.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
