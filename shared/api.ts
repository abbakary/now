/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Admin API Types

// User Management API Types
export interface AdminUserListResponse {
  users: import('./types').User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUserResponse {
  user: import('./types').User;
  message?: string;
}

export interface AdminUserStatsResponse {
  total: number;
  active: number;
  inactive: number;
  byRole: {
    admin: number;
    manager: number;
    technician: number;
  };
}

export interface CreateUserRequest {
  name: string;
  email: string;
  phone?: string;
  role: import('./types').UserRole;
  isActive?: boolean;
  permissions?: import('./types').Permission[];
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: import('./types').UserRole;
  isActive?: boolean;
  permissions?: import('./types').Permission[];
}

// Inventory Management API Types
export interface InventoryItem {
  id: string;
  name: string;
  type: 'product' | 'service' | 'part';
  category: string;
  description: string;
  price: number;
  cost: number;
  quantity: number;
  minQuantity: number;
  sku: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceType {
  id: string;
  name: string;
  category: 'car_service' | 'tire_service' | 'consultation' | 'custom';
  description: string;
  basePrice: number;
  estimatedDuration: number;
  requiredSkills: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  type: 'product' | 'service' | 'part';
  isActive: boolean;
}

export interface InventoryListResponse {
  items: InventoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ServiceListResponse {
  services: ServiceType[];
  total: number;
}

export interface CategoryListResponse {
  categories: ProductCategory[];
  total: number;
}

export interface InventoryStatsResponse {
  totalItems: number;
  activeItems: number;
  inactiveItems: number;
  lowStockItems: number;
  totalValue: number;
  itemsByType: {
    product: number;
    service: number;
    part: number;
  };
  totalServices: number;
  totalCategories: number;
}

export interface CreateInventoryItemRequest {
  name: string;
  type: 'product' | 'service' | 'part';
  category: string;
  description?: string;
  price?: number;
  cost?: number;
  quantity?: number;
  minQuantity?: number;
  sku: string;
  isActive?: boolean;
}

export interface UpdateInventoryItemRequest {
  name?: string;
  type?: 'product' | 'service' | 'part';
  category?: string;
  description?: string;
  price?: number;
  cost?: number;
  quantity?: number;
  minQuantity?: number;
  sku?: string;
  isActive?: boolean;
}

export interface CreateServiceRequest {
  name: string;
  category: 'car_service' | 'tire_service' | 'consultation' | 'custom';
  description?: string;
  basePrice?: number;
  estimatedDuration?: number;
  requiredSkills?: string[];
  isActive?: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  type: 'product' | 'service' | 'part';
  isActive?: boolean;
}

export interface BulkUpdateRequest {
  itemIds: string[];
  updates: Partial<InventoryItem>;
}

export interface AdminResponse {
  message: string;
}

export interface LowStockResponse {
  items: InventoryItem[];
  total: number;
}
