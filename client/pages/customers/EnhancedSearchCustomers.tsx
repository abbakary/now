import React, { useState, useCallback, useMemo } from "react";
import { Search, Users, TrendingUp, Clock, DollarSign, AlertTriangle, CheckCircle, Filter, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useCustomerStore } from "@/context/CustomerStoreContext";
import { useVisitTracking } from "@/context/VisitTrackingContext";
import AdvancedSearchDashboard from "@/components/search/AdvancedSearchDashboard";
import TimeTrackingIntegration from "@/components/tracking/TimeTrackingIntegration";
import { generateUnifiedCustomerData } from "@/services/customerDataService";
import { cn } from "@/lib/utils";

// Sample customer data for demonstration
const sampleCustomers = [
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
  {
    id: "CUST-005",
    name: "Michael Okello",
    type: "Personal",
    subType: "Driver",
    phone: "+256 703 456 789",
    email: "mike.okello@email.com",
    location: "Nansana",
    registeredDate: "2024-01-05",
    lastVisit: "2024-01-16",
    totalOrders: 2,
    status: "Active",
  },
  {
    id: "CUST-006",
    name: "Sarah Nakato",
    type: "Personal",
    subType: "Business Owner",
    phone: "+256 701 234 567",
    email: "sarah@nakato.biz",
    location: "Mukono",
    registeredDate: "2023-09-15",
    lastVisit: "2024-01-21",
    totalOrders: 12,
    status: "Active",
  },
  {
    id: "CUST-007",
    name: "East African Development Bank",
    type: "Government",
    subType: "Financial Institution",
    phone: "+256 414 236 000",
    email: "transport@eadb.org",
    location: "Nakasero, Kampala",
    registeredDate: "2023-08-01",
    lastVisit: "2024-01-15",
    totalOrders: 18,
    status: "Active",
  },
];

/**
 * Enhanced Search Customers page with comprehensive tracking integration
 * This is the center of the tracking-focused customer management system
 */
export default function EnhancedSearchCustomers() {
  const [selectedTab, setSelectedTab] = useState<'search' | 'analytics' | 'tracking'>('search');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  const { customers: storedCustomers } = useCustomerStore();
  const { visits, activeVisits, overdueVisits, alerts } = useVisitTracking();

  // Combine stored customers with sample data for demonstration
  const allCustomers = useMemo(() => {
    const byId = new Map();
    [...storedCustomers, ...sampleCustomers].forEach(customer => {
      byId.set(customer.id, customer);
    });
    return Array.from(byId.values());
  }, [storedCustomers]);
  
  // Calculate dashboard statistics
  const dashboardStats = useMemo(() => {
    const totalCustomers = allCustomers.length;
    const activeCustomers = new Set(activeVisits.map(v => v.customerId || v.customerName)).size;
    const totalVisits = visits.length;
    const completedVisits = visits.filter(v => v.status === 'Completed').length;
    const overdueCount = overdueVisits.length;
    const totalSales = visits
      .filter(v => v.visitType === 'Sales')
      .reduce((sum, v) => sum + (v.salesDetails?.amount || 0), 0);
    
    // Calculate average visit duration for completed visits
    const avgDuration = completedVisits > 0 
      ? visits
          .filter(v => v.status === 'Completed' && v.leftAt)
          .reduce((sum, v) => {
            const duration = new Date(v.leftAt!).getTime() - new Date(v.arrivedAt).getTime();
            return sum + (duration / (1000 * 60)); // minutes
          }, 0) / completedVisits
      : 0;
    
    return {
      totalCustomers,
      activeCustomers,
      totalVisits,
      completedVisits,
      overdueCount,
      totalSales,
      avgDuration,
      completionRate: totalVisits > 0 ? (completedVisits / totalVisits) * 100 : 0,
    };
  }, [allCustomers, visits, activeVisits, overdueVisits]);
  
  // Handle customer selection from search
  const handleCustomerSelect = useCallback((customerId: string) => {
    setSelectedCustomerId(customerId);
  }, []);
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Get customer insights
  const customerInsights = useMemo(() => {
    const insights = [];
    
    // High-value customers (top 20% by revenue)
    const customerRevenues = allCustomers.map(customer => {
      const customerVisits = visits.filter(v => 
        v.customerId === customer.id || v.customerName === customer.name
      );
      const revenue = customerVisits
        .filter(v => v.visitType === 'Sales')
        .reduce((sum, v) => sum + (v.salesDetails?.amount || 0), 0);
      return { customer, revenue };
    });
    
    const highValueCustomers = customerRevenues
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, Math.ceil(allCustomers.length * 0.2))
      .filter(c => c.revenue > 0);
    
    if (highValueCustomers.length > 0) {
      insights.push({
        type: 'high-value',
        title: 'High-Value Customers',
        count: highValueCustomers.length,
        description: `${highValueCustomers.length} customers contributing ${formatCurrency(
          highValueCustomers.reduce((sum, c) => sum + c.revenue, 0)
        )} in revenue`,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      });
    }
    
    // At-risk customers (overdue visits)
    const atRiskCustomers = new Set(overdueVisits.map(v => v.customerId || v.customerName));
    if (atRiskCustomers.size > 0) {
      insights.push({
        type: 'at-risk',
        title: 'At-Risk Customers',
        count: atRiskCustomers.size,
        description: `${atRiskCustomers.size} customers with overdue visits`,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
      });
    }
    
    // Frequent visitors (>3 visits in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentVisits = visits.filter(v => new Date(v.arrivedAt) >= thirtyDaysAgo);
    const frequentVisitors = new Map<string, number>();
    
    recentVisits.forEach(visit => {
      const key = visit.customerId || visit.customerName;
      frequentVisitors.set(key, (frequentVisitors.get(key) || 0) + 1);
    });
    
    const veryFrequentVisitors = Array.from(frequentVisitors.entries())
      .filter(([_, count]) => count > 3);
    
    if (veryFrequentVisitors.length > 0) {
      insights.push({
        type: 'frequent',
        title: 'Frequent Visitors',
        count: veryFrequentVisitors.length,
        description: `${veryFrequentVisitors.length} customers with 3+ visits this month`,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      });
    }
    
    return insights;
  }, [allCustomers, visits, overdueVisits]);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Search & Tracking</h1>
          <p className="text-muted-foreground">
            Comprehensive customer management with real-time tracking and analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          {alerts.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {alerts.length} Alert{alerts.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{dashboardStats.totalCustomers}</p>
                  <Badge variant="secondary" className="ml-2">
                    {dashboardStats.activeCustomers} Active
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
                <p className="text-sm font-medium text-muted-foreground">Visit Stats</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{dashboardStats.totalVisits}</p>
                  {dashboardStats.overdueCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {dashboardStats.overdueCount} Overdue
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(dashboardStats.totalSales)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{dashboardStats.completionRate.toFixed(1)}%</p>
                </div>
                <Progress value={dashboardStats.completionRate} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Customer Insights */}
      {customerInsights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {customerInsights.map((insight, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className={cn("flex items-center gap-3 p-3 rounded-lg", insight.bgColor)}>
                  <div className={cn("font-semibold", insight.color)}>
                    {insight.count}
                  </div>
                  <div>
                    <h4 className={cn("font-semibold text-sm", insight.color)}>
                      {insight.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Advanced Search
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="tracking">
            <Clock className="h-4 w-4 mr-2" />
            Live Tracking
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="space-y-4">
          <AdvancedSearchDashboard
            customers={allCustomers}
            onCustomerSelect={handleCustomerSelect}
          />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <CustomerAnalyticsDashboard />
        </TabsContent>
        
        <TabsContent value="tracking" className="space-y-4">
          <LiveTrackingDashboard />

          {/* Time Tracking Integration */}
          {selectedCustomerId && (
            <Card>
              <CardHeader>
                <CardTitle>Time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <TimeTrackingIntegration
                  customerId={selectedCustomerId}
                  onTimeEntryCreate={(entry) => {
                    console.log('Time entry created:', entry);
                    // In real app, this would update customer data
                  }}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Customer Analytics Dashboard Component
 */
const CustomerAnalyticsDashboard: React.FC = () => {
  const { customers } = useCustomerStore();
  const { visits } = useVisitTracking();
  
  // Analytics calculations
  const analytics = useMemo(() => {
    const serviceTypeStats = visits.reduce((acc, visit) => {
      const type = visit.visitType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const monthlyVisits = visits.reduce((acc, visit) => {
      const month = new Date(visit.arrivedAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const customerTypeStats = allCustomers.reduce((acc, customer) => {
      acc[customer.type] = (acc[customer.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { serviceTypeStats, monthlyVisits, customerTypeStats };
  }, [allCustomers, visits]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Visit Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analytics.serviceTypeStats).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm">{type}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Customer Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analytics.customerTypeStats).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm">{type}</span>
                <Badge variant="secondary">{count}</Badge>
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
              {Object.entries(analytics.monthlyVisits)
                .reverse()
                .slice(0, 6)
                .map(([month, count]) => (
                <div key={month} className="flex items-center justify-between">
                  <span className="text-sm">{month}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Live Tracking Dashboard Component
 */
const LiveTrackingDashboard: React.FC = () => {
  const { activeVisits, overdueVisits, alerts } = useVisitTracking();
  
  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={cn(
                    "p-3 rounded-lg border-l-4",
                    alert.severity === 'danger' && "border-red-500 bg-red-50",
                    alert.severity === 'warning' && "border-yellow-500 bg-yellow-50",
                    alert.severity === 'info' && "border-blue-500 bg-blue-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{alert.customerName}</h4>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {alert.visitType}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Visits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Active Visits ({activeVisits.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {activeVisits.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No active visits</p>
                ) : (
                  activeVisits.map((visit) => (
                    <div key={visit.id} className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{visit.customerName}</h4>
                        <Badge variant="secondary">{visit.visitType}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {visit.service || 'General visit'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Arrived: {new Date(visit.arrivedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Overdue Visits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Overdue Visits ({overdueVisits.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {overdueVisits.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No overdue visits</p>
                ) : (
                  overdueVisits.map((visit) => (
                    <div key={visit.id} className="p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{visit.customerName}</h4>
                        <Badge variant="destructive">{visit.visitType}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {visit.service || 'General visit'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Expected to leave: {visit.expectedLeaveAt ? new Date(visit.expectedLeaveAt).toLocaleTimeString() : 'Not set'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
