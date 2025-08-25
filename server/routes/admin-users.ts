import { RequestHandler } from "express";
import { User, UserRole, Permission } from "../../shared/types";

// Mock database - in production this would be a real database
let users: User[] = [
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@company.com",
    role: UserRole.ADMIN,
    phone: "+1234567890",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    permissions: [{ module: "*", actions: ["*"] }],
  },
  {
    id: "manager-1",
    name: "Office Manager",
    email: "manager@company.com",
    role: UserRole.OFFICE_MANAGER,
    phone: "+1234567891",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    permissions: [
      { module: "customers", actions: ["create", "read", "update", "delete"] },
      { module: "orders", actions: ["create", "read", "update", "delete"] },
      { module: "reports", actions: ["read"] },
    ],
  },
  {
    id: "tech-1",
    name: "John Technician",
    email: "john@company.com",
    role: UserRole.TECHNICIAN,
    phone: "+1234567892",
    isActive: true,
    createdAt: new Date("2024-02-01"),
    permissions: [
      { module: "job_cards", actions: ["read", "update_assigned"] },
      { module: "time_tracking", actions: ["create", "read", "update"] },
    ],
  },
];

// GET /api/admin/users - List all users
export const listUsers: RequestHandler = (req, res) => {
  try {
    const { page = 1, limit = 50, search, role, status } = req.query;

    let filteredUsers = [...users];

    // Filter by search term
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm),
      );
    }

    // Filter by role
    if (role && role !== "all") {
      filteredUsers = filteredUsers.filter((user) => user.role === role);
    }

    // Filter by status
    if (status && status !== "all") {
      const isActive = status === "active";
      filteredUsers = filteredUsers.filter(
        (user) => user.isActive === isActive,
      );
    }

    // Pagination
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    res.json({
      users: paginatedUsers,
      total: filteredUsers.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filteredUsers.length / limitNum),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// GET /api/admin/users/:id - Get user by ID
export const getUserById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const user = users.find((u) => u.id === id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// POST /api/admin/users - Create new user
export const createUser: RequestHandler = (req, res) => {
  try {
    const { name, email, phone, role, isActive, permissions } = req.body;

    // Validate required fields
    if (!name || !email || !role) {
      return res
        .status(400)
        .json({ error: "Name, email, and role are required" });
    }

    // Check if email already exists
    if (users.find((u) => u.email === email)) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // Default permissions based on role
    const defaultPermissions = {
      [UserRole.ADMIN]: [{ module: "*", actions: ["*"] }],
      [UserRole.OFFICE_MANAGER]: [
        {
          module: "customers",
          actions: ["create", "read", "update", "delete"],
        },
        { module: "orders", actions: ["create", "read", "update", "delete"] },
        {
          module: "job_cards",
          actions: ["create", "read", "update", "assign"],
        },
        { module: "services", actions: ["create", "read", "update", "delete"] },
        { module: "reports", actions: ["read"] },
        { module: "invoices", actions: ["create", "read", "update"] },
        { module: "inventory", actions: ["read", "update"] },
      ],
      [UserRole.TECHNICIAN]: [
        { module: "job_cards", actions: ["read", "update_assigned"] },
        { module: "orders", actions: ["read", "update_status"] },
        { module: "time_tracking", actions: ["create", "read", "update"] },
        { module: "materials", actions: ["read", "use"] },
        { module: "checklists", actions: ["read", "update"] },
        { module: "sales_items", actions: ["create", "read"] },
      ],
    };

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone,
      role,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date(),
      permissions: permissions || defaultPermissions[role as UserRole] || [],
    };

    users.push(newUser);

    res.status(201).json({
      user: newUser,
      message: "User created successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

// PUT /api/admin/users/:id - Update user
export const updateUser: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, isActive, permissions } = req.body;

    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if email is being changed and already exists
    if (email && email !== users[userIndex].email) {
      if (users.find((u) => u.email === email && u.id !== id)) {
        return res.status(409).json({ error: "Email already exists" });
      }
    }

    // Update user
    const updatedUser = {
      ...users[userIndex],
      ...(name && { name }),
      ...(email && { email }),
      ...(phone !== undefined && { phone }),
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
      ...(permissions && { permissions }),
    };

    users[userIndex] = updatedUser;

    res.json({
      user: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

// DELETE /api/admin/users/:id - Delete user
export const deleteUser: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;

    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    users.splice(userIndex, 1);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// PATCH /api/admin/users/:id/toggle-status - Toggle user active status
export const toggleUserStatus: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;

    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    users[userIndex].isActive = !users[userIndex].isActive;

    res.json({
      user: users[userIndex],
      message: `User ${users[userIndex].isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle user status" });
  }
};

// GET /api/admin/users/stats - Get user statistics
export const getUserStats: RequestHandler = (req, res) => {
  try {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const byRole = {
      admin: users.filter((u) => u.role === UserRole.ADMIN).length,
      manager: users.filter((u) => u.role === UserRole.OFFICE_MANAGER).length,
      technician: users.filter((u) => u.role === UserRole.TECHNICIAN).length,
    };

    res.json({
      total,
      active,
      inactive: total - active,
      byRole,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user statistics" });
  }
};
