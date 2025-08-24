import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { Link } from 'react-router-dom';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { JobCard, JobStatus, JobPriority } from '@shared/types';

// Mock data - replace with actual API calls
const fetchAllOrders = async (): Promise<JobCard[]> => {
  // In a real app, this would be an API call
  return [];
};

const statusVariantMap: Record<JobStatus, string> = {
  [JobStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [JobStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [JobStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [JobStatus.CANCELLED]: 'bg-red-100 text-red-800',
};

const priorityVariantMap: Record<JobPriority, string> = {
  [JobPriority.LOW]: 'bg-blue-100 text-blue-800',
  [JobPriority.NORMAL]: 'bg-green-100 text-green-800',
  [JobPriority.HIGH]: 'bg-yellow-100 text-yellow-800',
  [JobPriority.URGENT]: 'bg-red-100 text-red-800',
};

export default function UnifiedOrderDashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<JobPriority | 'all'>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  // Fetch all orders
  const { data: orders = [], isLoading, error } = useQuery<JobCard[]>({
    queryKey: ['orders'],
    queryFn: fetchAllOrders,
  });

  // Process and filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Filter by search term
      const matchesSearch = searchTerm === '' || 
        order.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by status
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      // Filter by priority
      const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;

      // Filter by date range
      const now = new Date();
      const orderDate = new Date(order.createdAt);
      
      let matchesDateRange = true;
      if (dateRange === 'today') {
        matchesDateRange = orderDate.toDateString() === now.toDateString();
      } else if (dateRange === 'week') {
        const weekAgo = subDays(now, 7);
        matchesDateRange = orderDate >= weekAgo;
      } else if (dateRange === 'month') {
        const monthAgo = subDays(now, 30);
        matchesDateRange = orderDate >= monthAgo;
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesDateRange;
    });
  }, [orders, searchTerm, statusFilter, priorityFilter, dateRange]);

  // Calculate order statistics
  const orderStats = useMemo(() => {
    const total = orders.length;
    const completed = orders.filter(o => o.status === JobStatus.COMPLETED).length;
    const inProgress = orders.filter(o => o.status === JobStatus.IN_PROGRESS).length;
    const pending = orders.filter(o => o.status === JobStatus.PENDING).length;
    
    return {
      total,
      completed,
      inProgress,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [orders]);

  if (isLoading) {
    return <div className="p-6">Loading orders...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error loading orders: {error.message}</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
          <p className="text-muted-foreground">
            View and manage all service orders in one place
          </p>
        </div>
        <Button asChild>
          <Link to="/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">📋</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.total}</div>
            <p className="text-xs text-muted-foreground">All orders in the system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <div className="h-4 w-4 text-yellow-500">🔄</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Active service orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="h-4 w-4 text-green-500">✅</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.completed}</div>
            <p className="text-xs text-muted-foreground">Completed orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <div className="h-4 w-4 text-blue-500">📈</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.completionRate}%</div>
            <div className="mt-2 flex items-center space-x-2">
              <Progress value={orderStats.completionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as JobStatus | 'all')}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(JobStatus).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
                <SelectTrigger className="w-[180px]">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Orders Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <Link to={`/orders/${order.id}`} className="hover:underline">
                          {order.jobNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {order.customer.name}
                        </div>
                      </TableCell>
                      <TableCell>{order.title}</TableCell>
                      <TableCell>
                        <Badge className={statusVariantMap[order.status]}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityVariantMap[order.priority]}>
                          {order.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.assignedTechnician?.name || 'Unassigned'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/orders/${order.id}`} className="flex items-center">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {order.status === JobStatus.IN_PROGRESS && (
                              <DropdownMenuItem>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark Complete
                              </DropdownMenuItem>
                            )}
                            {order.status === JobStatus.PENDING && (
                              <DropdownMenuItem>
                                <Play className="mr-2 h-4 w-4" />
                                Start Work
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No orders found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
