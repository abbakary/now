import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Package,
  Wrench,
  Settings,
  DollarSign,
  Shield,
  BarChart3,
  FileText,
  Tags,
  Box,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
} from "lucide-react";
import { UserRole } from "@shared/types";
import { useAuth } from "@/context/AuthContext";
import UserManagement from "./UserManagement";
import InventoryManagement from "./InventoryManagement";
import ServiceManagement from "./ServiceManagement";
import ProductTypeManagement from "./ProductTypeManagement";
import SystemSettings from "./SystemSettings";
import PricingManagement from "./PricingManagement";

export default function AdminManagementSystem() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect if not admin
  if (user?.role !== UserRole.ADMIN) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            Only administrators can access this system.
          </p>
        </div>
      </div>
    );
  }

  // Mock statistics - in real app would come from API
  const systemStats = {
    totalUsers: 15,
    totalProducts: 1247,
    totalServices: 23,
    totalCategories: 12,
    monthlyRevenue: 145680,
    lowStockItems: 8,
    pendingOrders: 12,
    systemHealth: 98.5,
  };

  const quickStats = [
    {
      title: "System Health",
      value: `${systemStats.systemHealth}%`,
      icon: CheckCircle,
      color: "green",
      description: "All systems operational",
    },
    {
      title: "Total Users",
      value: systemStats.totalUsers.toString(),
      icon: Users,
      color: "blue",
      description: `${Math.floor(systemStats.totalUsers * 0.8)} active users`,
    },
    {
      title: "Total Products",
      value: systemStats.totalProducts.toLocaleString(),
      icon: Package,
      color: "purple",
      description: `${systemStats.lowStockItems} low stock items`,
    },
    {
      title: "Active Services",
      value: systemStats.totalServices.toString(),
      icon: Wrench,
      color: "orange",
      description: "Across all service types",
    },
    {
      title: "Monthly Revenue",
      value: `$${systemStats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "green",
      description: "+12% from last month",
    },
    {
      title: "Pending Orders",
      value: systemStats.pendingOrders.toString(),
      icon: ShoppingCart,
      color: "amber",
      description: "Require attention",
    },
  ];

  const managementSections = [
    {
      id: "users",
      title: "User Management",
      description: "Manage user accounts, roles, and permissions",
      icon: Users,
      color: "blue",
      stats: `${systemStats.totalUsers} users`,
    },
    {
      id: "inventory",
      title: "Inventory Management",
      description: "Manage all products, stock levels, and pricing",
      icon: Package,
      color: "purple",
      stats: `${systemStats.totalProducts} products`,
    },
    {
      id: "services",
      title: "Service Management",
      description: "Configure service types, templates, and pricing",
      icon: Wrench,
      color: "orange",
      stats: `${systemStats.totalServices} services`,
    },
    {
      id: "products",
      title: "Product Types",
      description: "Manage product categories and classifications",
      icon: Tags,
      color: "green",
      stats: `${systemStats.totalCategories} categories`,
    },
    {
      id: "pricing",
      title: "Pricing Management",
      description: "Set and manage pricing across all products and services",
      icon: DollarSign,
      color: "emerald",
      stats: "Global pricing control",
    },
    {
      id: "settings",
      title: "System Settings",
      description: "Configure system-wide settings and preferences",
      icon: Settings,
      color: "gray",
      stats: "System configuration",
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      green: "bg-green-100 text-green-800 border-green-200",
      emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200",
      amber: "bg-amber-100 text-amber-800 border-amber-200",
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Admin Management System
          </h1>
          <p className="text-muted-foreground">
            Complete administrative control over users, inventory, services, and
            system settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            System Healthy
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="products">Product Types</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Management Sections */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {managementSections.map((section) => {
              const IconComponent = section.icon;
              return (
                <Card
                  key={section.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
                  onClick={() => setActiveTab(section.id)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${getColorClasses(section.color)}`}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {section.title}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">
                          {section.stats}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {section.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Administrative Activities
              </CardTitle>
              <CardDescription>
                Latest system changes and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    action: "New user created",
                    details: "Tech User #15 added to system",
                    time: "2 hours ago",
                    type: "user",
                  },
                  {
                    action: "Inventory updated",
                    details: "245 tire products restocked",
                    time: "4 hours ago",
                    type: "inventory",
                  },
                  {
                    action: "Service pricing updated",
                    details: "Oil change service price modified",
                    time: "6 hours ago",
                    type: "pricing",
                  },
                  {
                    action: "System backup completed",
                    details: "Full system backup successful",
                    time: "8 hours ago",
                    type: "system",
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50"
                  >
                    <div
                      className={`h-2 w-2 rounded-full mt-2 ${
                        activity.type === "user"
                          ? "bg-blue-500"
                          : activity.type === "inventory"
                            ? "bg-purple-500"
                            : activity.type === "pricing"
                              ? "bg-green-500"
                              : "bg-gray-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.details}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Management Tabs */}
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryManagement />
        </TabsContent>

        <TabsContent value="services">
          <ServiceManagement />
        </TabsContent>

        <TabsContent value="products">
          <ProductTypeManagement />
        </TabsContent>

        <TabsContent value="pricing">
          <PricingManagement />
        </TabsContent>

        <TabsContent value="settings">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
