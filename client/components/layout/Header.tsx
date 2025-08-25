import React from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Menu,
  Bell,
  Settings,
  User,
  Sun,
  Moon,
  LayoutDashboard,
  Users,
  ClipboardList,
  Car,
  ShoppingCart,
  Package,
  Receipt,
  BarChart3,
  Calendar,
  TrendingUp,
  FileText,
  Clock,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useVisitTracking } from "@/context/VisitTrackingContext";
import { RoleSwitcher } from "@/components/ui/role-switcher";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  onToggleSidebar: () => void;
  isCollapsed: boolean;
}

// Define page configurations
const pageConfigs: Record<string, {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  actions?: React.ComponentType<any>[];
}> = {
  '/': {
    title: 'Dashboard Overview',
    description: 'Welcome back! Monitor your business performance and key metrics.',
    icon: LayoutDashboard,
  },
  '/customers': {
    title: 'Customer & Service Management',
    description: 'Integrated workflow: manage customers and create service orders seamlessly.',
    icon: Users,
  },
  '/orders': {
    title: 'Order Workflow Management',
    description: 'Complete order lifecycle with status tracking and customer integration.',
    icon: ClipboardList,
  },
  '/orders/active': {
    title: 'Active Orders',
    description: 'Monitor and manage all currently active service orders.',
    icon: Clock,
  },
  '/orders/completed': {
    title: 'Completed Orders',
    description: 'Review completed orders and their service history.',
    icon: FileText,
  },
  '/orders/job-cards': {
    title: 'Job Cards Management',
    description: 'Create, assign, and track job cards for service operations.',
    icon: FileText,
  },
  '/services/car': {
    title: 'Car Services',
    description: 'Manage vehicle maintenance and repair services.',
    icon: Car,
  },
  '/services/tires': {
    title: 'Tire Services',
    description: 'Handle tire installation, sales, and maintenance services.',
    icon: Settings,
  },
  '/services/consultations': {
    title: 'Consultation Services',
    description: 'Manage customer consultation requests and advisory services.',
    icon: FileText,
  },
  '/inventory/tires': {
    title: 'Tire Inventory',
    description: 'Track tire stock levels, purchases, and inventory management.',
    icon: Package,
  },
  '/invoices': {
    title: 'Invoice Management',
    description: 'Create, send, and track customer invoices and payments.',
    icon: Receipt,
  },
  '/sales': {
    title: 'Sales Management',
    description: 'Track sales performance, transactions, and revenue analytics.',
    icon: ShoppingCart,
  },
  '/sales/new': {
    title: 'New Sale Transaction',
    description: 'Create new sales transactions and process customer purchases.',
    icon: ShoppingCart,
  },
  '/sales/analytics': {
    title: 'Sales Analytics',
    description: 'Analyze sales performance, trends, and business insights.',
    icon: BarChart3,
  },
  '/tracking/daily': {
    title: 'Daily Time Tracking',
    description: 'Monitor daily activities and time allocation for services.',
    icon: Calendar,
  },
  '/tracking/status': {
    title: 'Service Status Tracking',
    description: 'Track service progress and completion status in real-time.',
    icon: TrendingUp,
  },
  '/reports/daily': {
    title: 'Daily Reports',
    description: 'Generate and review daily performance and activity reports.',
    icon: Calendar,
  },
  '/reports/weekly': {
    title: 'Weekly Reports',
    description: 'Analyze weekly trends and performance metrics.',
    icon: TrendingUp,
  },
  '/reports/monthly': {
    title: 'Monthly Reports',
    description: 'Review monthly analytics and business insights.',
    icon: BarChart3,
  },
  '/reports/yearly': {
    title: 'Yearly Reports',
    description: 'Comprehensive yearly analysis and growth metrics.',
    icon: TrendingUp,
  },
  '/admin/users': {
    title: 'User Access Control',
    description: 'Manage user permissions, roles, and access levels.',
    icon: Shield,
  },
  '/admin/settings': {
    title: 'System Settings',
    description: 'Configure system preferences and business settings.',
    icon: Settings,
  },
};

// Helper function to get page config based on current path
const getPageConfig = (pathname: string) => {
  // First try exact match
  if (pageConfigs[pathname]) {
    return pageConfigs[pathname];
  }

  // Then try partial matches for dynamic routes
  for (const [path, config] of Object.entries(pageConfigs)) {
    if (pathname.startsWith(path) && path !== '/') {
      return config;
    }
  }

  // Fallback for customer details pages
  if (pathname.startsWith('/customers/') && pathname !== '/customers') {
    return {
      title: 'Customer Details',
      description: 'View detailed customer information and service history.',
      icon: Users,
    };
  }

  // Fallback for order details pages
  if (pathname.startsWith('/orders/') && !pathname.match(/\/(active|completed|job-cards)$/)) {
    return {
      title: 'Order Details',
      description: 'View and manage detailed order information.',
      icon: ClipboardList,
    };
  }

  // Default fallback
  return {
    title: 'Dashboard',
    description: 'Welcome to TrackPro - Your business management system.',
    icon: LayoutDashboard,
  };
};

export function Header({ onToggleSidebar, isCollapsed }: HeaderProps) {
  const location = useLocation();
  const { alerts, updateExpectedLeave, markLeft, activeVisits } = useVisitTracking();
  const { logout, user } = useAuth();

  const pageConfig = getPageConfig(location.pathname);
  const IconComponent = pageConfig.icon;

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="h-9 w-9 p-0"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {pageConfig.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {pageConfig.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Role Switcher */}
          <RoleSwitcher />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative h-9 w-9 p-0"
              >
                <Bell className="h-4 w-4" />
                {(alerts.length + activeVisits.length) > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {alerts.length + activeVisits.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="space-y-2 p-2">
                {alerts.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">No active alerts.</div>
                ) : (
                  alerts.map((a) => (
                    <div
                      key={a.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg",
                        a.severity === "danger"
                          ? "bg-destructive/10"
                          : a.severity === "warning"
                          ? "bg-warning/10"
                          : "bg-accent/50",
                      )}
                    >
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full mt-2",
                          a.severity === "danger"
                            ? "bg-destructive"
                            : a.severity === "warning"
                            ? "bg-warning"
                            : "bg-primary",
                        )}
                      ></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{a.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.visitType}
                          {a.service ? ` • ${a.service}` : ""} — {a.message}
                        </p>
                        {a.expectedLeaveAt && (
                          <p className="text-xs text-muted-foreground">
                            Expected: {new Date(a.expectedLeaveAt).toLocaleTimeString()}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" onClick={() => updateExpectedLeave(a.id, { addMinutes: 15 })}>
                            +15m
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => updateExpectedLeave(a.id, { addMinutes: 30 })}>
                            +30m
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => markLeft(a.id)}>
                            Mark Left
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Active Visits ({activeVisits.length})</div>
              <div className="space-y-2 p-2 max-h-64 overflow-y-auto">
                {activeVisits.length === 0 ? (
                  <div className="text-sm text-muted-foreground px-1">No active visits.</div>
                ) : (
                  activeVisits.map((v) => (
                    <div key={v.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                      <div className="h-2 w-2 rounded-full mt-2 bg-info" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{v.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.visitType}
                          {v.service ? ` • ${v.service}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expected: {v.expectedLeaveAt ? new Date(v.expectedLeaveAt).toLocaleTimeString() : "-"}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" onClick={() => updateExpectedLeave(v.id, { addMinutes: 15 })}>+15m</Button>
                          <Button size="sm" variant="outline" onClick={() => updateExpectedLeave(v.id, { addMinutes: 30 })}>+30m</Button>
                          <Button size="sm" variant="destructive" onClick={() => markLeft(v.id)}>Mark Left</Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-sm text-primary">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Settings className="h-4 w-4" />
          </Button>

          {/* Theme Toggle */}
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Help & Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
