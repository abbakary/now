import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Users,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Settings,
  Key,
} from "lucide-react";
import { User, UserRole, Permission } from "@shared/types";
import { useFeedback } from "@/components/ui/status-popup";
import { cn } from "@/lib/utils";

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: UserRole | "";
  isActive: boolean;
  permissions: Permission[];
  password?: string;
}

// Mock users data - in real app would come from API
const mockUsers: User[] = [
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@company.com",
    role: UserRole.ADMIN,
    phone: "+256 700 123 456",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    permissions: [{ module: "*", actions: ["*"] }],
  },
  {
    id: "manager-1",
    name: "Sarah Manager",
    email: "sarah@company.com",
    role: UserRole.OFFICE_MANAGER,
    phone: "+256 700 123 457",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    permissions: [
      { module: "customers", actions: ["create", "read", "update", "delete"] },
      { module: "orders", actions: ["create", "read", "update", "delete"] },
      { module: "job_cards", actions: ["create", "read", "update", "assign"] },
      { module: "services", actions: ["create", "read", "update", "delete"] },
      { module: "reports", actions: ["read"] },
      { module: "invoices", actions: ["create", "read", "update"] },
      { module: "inventory", actions: ["read", "update"] },
    ],
  },
  {
    id: "tech-1",
    name: "Mike Technician",
    email: "mike@company.com",
    role: UserRole.TECHNICIAN,
    phone: "+256 700 123 458",
    isActive: true,
    createdAt: new Date("2024-02-01"),
    permissions: [
      { module: "job_cards", actions: ["read", "update_assigned"] },
      { module: "orders", actions: ["read", "update_status"] },
      { module: "time_tracking", actions: ["create", "read", "update"] },
      { module: "materials", actions: ["read", "use"] },
      { module: "checklists", actions: ["read", "update"] },
      { module: "sales_items", actions: ["create", "read"] },
    ],
  },
  {
    id: "tech-2",
    name: "John Mechanic",
    email: "john@company.com",
    role: UserRole.TECHNICIAN,
    phone: "+256 700 123 459",
    isActive: false,
    createdAt: new Date("2024-01-20"),
    permissions: [
      { module: "job_cards", actions: ["read", "update_assigned"] },
      { module: "orders", actions: ["read", "update_status"] },
      { module: "time_tracking", actions: ["create", "read", "update"] },
    ],
  },
];

const availableModules = [
  "customers",
  "orders",
  "job_cards",
  "services",
  "reports",
  "invoices",
  "inventory",
  "time_tracking",
  "materials",
  "checklists",
  "sales_items",
  "admin",
];

const availableActions = [
  "create",
  "read",
  "update",
  "delete",
  "assign",
  "approve",
  "use",
];

export default function UserManagement() {
  const { success, error } = useFeedback();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [userForm, setUserForm] = useState<UserFormData>({
    name: "",
    email: "",
    phone: "",
    role: "",
    isActive: true,
    permissions: [],
    password: "",
  });

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Reset form
  const resetForm = useCallback(() => {
    setUserForm({
      name: "",
      email: "",
      phone: "",
      role: "",
      isActive: true,
      permissions: [],
      password: "",
    });
  }, []);

  // Handle add user
  const handleAddUser = useCallback(async () => {
    try {
      if (!userForm.name || !userForm.email || !userForm.role) {
        error("Please fill in all required fields");
        return;
      }

      if (users.some((u) => u.email === userForm.email)) {
        error("A user with this email already exists");
        return;
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        name: userForm.name,
        email: userForm.email,
        phone: userForm.phone,
        role: userForm.role as UserRole,
        isActive: userForm.isActive,
        createdAt: new Date(),
        permissions:
          userForm.role === UserRole.ADMIN
            ? [{ module: "*", actions: ["*"] }]
            : userForm.permissions,
      };

      setUsers((prev) => [...prev, newUser]);
      success(`User ${newUser.name} created successfully!`);
      resetForm();
      setShowAddDialog(false);
    } catch (err) {
      console.error("Error adding user:", err);
      error("Failed to create user. Please try again.");
    }
  }, [userForm, users, success, error, resetForm]);

  // Handle edit user
  const handleEditUser = useCallback(async () => {
    try {
      if (
        !selectedUser ||
        !userForm.name ||
        !userForm.email ||
        !userForm.role
      ) {
        error("Please fill in all required fields");
        return;
      }

      const updatedUser: User = {
        ...selectedUser,
        name: userForm.name,
        email: userForm.email,
        phone: userForm.phone,
        role: userForm.role as UserRole,
        isActive: userForm.isActive,
        permissions:
          userForm.role === UserRole.ADMIN
            ? [{ module: "*", actions: ["*"] }]
            : userForm.permissions,
      };

      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? updatedUser : u)),
      );
      success(`User ${updatedUser.name} updated successfully!`);
      resetForm();
      setShowEditDialog(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Error updating user:", err);
      error("Failed to update user. Please try again.");
    }
  }, [selectedUser, userForm, success, error, resetForm]);

  // Handle delete user
  const handleDeleteUser = useCallback(
    async (user: User) => {
      if (
        window.confirm(`Are you sure you want to delete user ${user.name}?`)
      ) {
        try {
          setUsers((prev) => prev.filter((u) => u.id !== user.id));
          success(`User ${user.name} deleted successfully!`);
        } catch (err) {
          console.error("Error deleting user:", err);
          error("Failed to delete user. Please try again.");
        }
      }
    },
    [success, error],
  );

  // Handle toggle user status
  const handleToggleUserStatus = useCallback(
    async (user: User) => {
      try {
        const updatedUser = { ...user, isActive: !user.isActive };
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? updatedUser : u)),
        );
        success(
          `User ${user.name} ${updatedUser.isActive ? "activated" : "deactivated"} successfully!`,
        );
      } catch (err) {
        console.error("Error toggling user status:", err);
        error("Failed to update user status. Please try again.");
      }
    },
    [success, error],
  );

  // Open edit dialog
  const openEditDialog = useCallback((user: User) => {
    setSelectedUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      isActive: user.isActive,
      permissions: user.permissions,
    });
    setShowEditDialog(true);
  }, []);

  // Get role badge color
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "bg-red-100 text-red-800 border-red-300";
      case UserRole.OFFICE_MANAGER:
        return "bg-blue-100 text-blue-800 border-blue-300";
      case UserRole.TECHNICIAN:
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Set default permissions based on role
  const setDefaultPermissions = (role: UserRole) => {
    if (role === UserRole.ADMIN) {
      setUserForm((prev) => ({
        ...prev,
        permissions: [{ module: "*", actions: ["*"] }],
      }));
    } else if (role === UserRole.OFFICE_MANAGER) {
      setUserForm((prev) => ({
        ...prev,
        permissions: [
          {
            module: "customers",
            actions: ["create", "read", "update", "delete"],
          },
          { module: "orders", actions: ["create", "read", "update", "delete"] },
          {
            module: "job_cards",
            actions: ["create", "read", "update", "assign"],
          },
          {
            module: "services",
            actions: ["create", "read", "update", "delete"],
          },
          { module: "reports", actions: ["read"] },
          { module: "invoices", actions: ["create", "read", "update"] },
          { module: "inventory", actions: ["read", "update"] },
        ],
      }));
    } else if (role === UserRole.TECHNICIAN) {
      setUserForm((prev) => ({
        ...prev,
        permissions: [
          { module: "job_cards", actions: ["read", "update_assigned"] },
          { module: "orders", actions: ["read", "update_status"] },
          { module: "time_tracking", actions: ["create", "read", "update"] },
          { module: "materials", actions: ["read", "use"] },
          { module: "checklists", actions: ["read", "update"] },
          { module: "sales_items", actions: ["create", "read"] },
        ],
      }));
    }
  };

  const userStats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
    admins: users.filter((u) => u.role === UserRole.ADMIN).length,
    managers: users.filter((u) => u.role === UserRole.OFFICE_MANAGER).length,
    technicians: users.filter((u) => u.role === UserRole.TECHNICIAN).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {userStats.active}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {userStats.inactive}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.admins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
            <Settings className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.managers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Technicians</CardTitle>
            <Settings className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.technicians}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={roleFilter}
              onValueChange={(value) =>
                setRoleFilter(value as UserRole | "all")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                <SelectItem value={UserRole.OFFICE_MANAGER}>
                  Office Manager
                </SelectItem>
                <SelectItem value={UserRole.TECHNICIAN}>Technician</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as "all" | "active" | "inactive")
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Details</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getRoleBadgeColor(user.role)}
                      >
                        {user.role.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {user.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={user.isActive ? "default" : "secondary"}
                          className={
                            user.isActive ? "bg-green-100 text-green-800" : ""
                          }
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Switch
                          checked={user.isActive}
                          onCheckedChange={() => handleToggleUserStatus(user)}
                          size="sm"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.createdAt).toLocaleDateString()}
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
                          <DropdownMenuItem
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleUserStatus(user)}
                          >
                            {user.isActive ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with appropriate role and permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={userForm.name}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="user@company.com"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={userForm.phone}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+256 700 123 456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={userForm.role}
                  onValueChange={(value) => {
                    setUserForm((prev) => ({
                      ...prev,
                      role: value as UserRole,
                    }));
                    setDefaultPermissions(value as UserRole);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.ADMIN}>
                      Administrator
                    </SelectItem>
                    <SelectItem value={UserRole.OFFICE_MANAGER}>
                      Office Manager
                    </SelectItem>
                    <SelectItem value={UserRole.TECHNICIAN}>
                      Technician
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Initial Password</Label>
              <Input
                id="password"
                type="password"
                value={userForm.password}
                onChange={(e) =>
                  setUserForm((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Enter initial password"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={userForm.isActive}
                onCheckedChange={(checked) =>
                  setUserForm((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label htmlFor="active">User is active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddUser}>
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user account information and permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={userForm.name}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="user@company.com"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={userForm.phone}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+256 700 123 456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role">Role *</Label>
                <Select
                  value={userForm.role}
                  onValueChange={(value) => {
                    setUserForm((prev) => ({
                      ...prev,
                      role: value as UserRole,
                    }));
                    setDefaultPermissions(value as UserRole);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.ADMIN}>
                      Administrator
                    </SelectItem>
                    <SelectItem value={UserRole.OFFICE_MANAGER}>
                      Office Manager
                    </SelectItem>
                    <SelectItem value={UserRole.TECHNICIAN}>
                      Technician
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={userForm.isActive}
                onCheckedChange={(checked) =>
                  setUserForm((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label htmlFor="edit-active">User is active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setSelectedUser(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditUser}>
              <Edit className="h-4 w-4 mr-2" />
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
