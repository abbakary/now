import { RequestHandler } from "express";

// Inventory item interface
interface InventoryItem {
  id: string;
  name: string;
  type: "product" | "service" | "part";
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

interface ServiceType {
  id: string;
  name: string;
  category: "car_service" | "tire_service" | "consultation" | "custom";
  description: string;
  basePrice: number;
  estimatedDuration: number;
  requiredSkills: string[];
  isActive: boolean;
  createdAt: Date;
}

interface ProductCategory {
  id: string;
  name: string;
  description: string;
  type: "product" | "service" | "part";
  isActive: boolean;
}

// Mock data - in production this would be a real database
let inventoryItems: InventoryItem[] = [
  {
    id: "item-1",
    name: "Michelin Tire 195/65R15",
    type: "product",
    category: "Tires",
    description: "Premium quality tire for passenger cars",
    price: 120.0,
    cost: 80.0,
    quantity: 25,
    minQuantity: 5,
    sku: "MICH-195-65-15",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "item-2",
    name: "Engine Oil 5W-30",
    type: "product",
    category: "Lubricants",
    description: "Synthetic engine oil for modern vehicles",
    price: 45.0,
    cost: 25.0,
    quantity: 50,
    minQuantity: 10,
    sku: "OIL-5W30-4L",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "item-3",
    name: "Brake Pad Set",
    type: "part",
    category: "Brake Parts",
    description: "Ceramic brake pads for front wheels",
    price: 85.0,
    cost: 45.0,
    quantity: 15,
    minQuantity: 3,
    sku: "BRAKE-PAD-FRONT",
    isActive: true,
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-20"),
  },
];

let serviceTypes: ServiceType[] = [
  {
    id: "service-1",
    name: "Oil Change Service",
    category: "car_service",
    description: "Complete oil change with filter replacement",
    basePrice: 60.0,
    estimatedDuration: 30,
    requiredSkills: ["basic_maintenance"],
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "service-2",
    name: "Tire Installation",
    category: "tire_service",
    description: "Tire mounting, balancing, and alignment",
    basePrice: 25.0,
    estimatedDuration: 45,
    requiredSkills: ["tire_specialist"],
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
];

let categories: ProductCategory[] = [
  {
    id: "cat-1",
    name: "Tires",
    description: "All types of vehicle tires",
    type: "product",
    isActive: true,
  },
  {
    id: "cat-2",
    name: "Lubricants",
    description: "Engine oils and fluids",
    type: "product",
    isActive: true,
  },
  {
    id: "cat-3",
    name: "Brake Parts",
    description: "Brake system components",
    type: "part",
    isActive: true,
  },
  {
    id: "cat-4",
    name: "Car Services",
    description: "Vehicle maintenance services",
    type: "service",
    isActive: true,
  },
  {
    id: "cat-5",
    name: "Tire Services",
    description: "Tire-related services",
    type: "service",
    isActive: true,
  },
];

// INVENTORY ITEMS ENDPOINTS

// GET /api/admin/inventory/items - List all inventory items
export const listInventoryItems: RequestHandler = (req, res) => {
  try {
    const { page = 1, limit = 50, search, type, category, status } = req.query;

    let filteredItems = [...inventoryItems];

    // Filter by search term
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      filteredItems = filteredItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.sku.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm),
      );
    }

    // Filter by type
    if (type && type !== "all") {
      filteredItems = filteredItems.filter((item) => item.type === type);
    }

    // Filter by category
    if (category && category !== "all") {
      filteredItems = filteredItems.filter(
        (item) => item.category === category,
      );
    }

    // Filter by status
    if (status && status !== "all") {
      const isActive = status === "active";
      filteredItems = filteredItems.filter(
        (item) => item.isActive === isActive,
      );
    }

    // Pagination
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    res.json({
      items: paginatedItems,
      total: filteredItems.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filteredItems.length / limitNum),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inventory items" });
  }
};

// POST /api/admin/inventory/items - Create new inventory item
export const createInventoryItem: RequestHandler = (req, res) => {
  try {
    const {
      name,
      type,
      category,
      description,
      price,
      cost,
      quantity,
      minQuantity,
      sku,
      isActive,
    } = req.body;

    // Validate required fields
    if (!name || !type || !category || !sku) {
      return res
        .status(400)
        .json({ error: "Name, type, category, and SKU are required" });
    }

    // Check if SKU already exists
    if (inventoryItems.find((item) => item.sku === sku)) {
      return res.status(409).json({ error: "SKU already exists" });
    }

    const newItem: InventoryItem = {
      id: `item-${Date.now()}`,
      name,
      type,
      category,
      description: description || "",
      price: price || 0,
      cost: cost || 0,
      quantity: quantity || 0,
      minQuantity: minQuantity || 0,
      sku,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    inventoryItems.push(newItem);

    res.status(201).json({
      item: newItem,
      message: "Inventory item created successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create inventory item" });
  }
};

// PUT /api/admin/inventory/items/:id - Update inventory item
export const updateInventoryItem: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const itemIndex = inventoryItems.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    // Check if SKU is being changed and already exists
    if (updates.sku && updates.sku !== inventoryItems[itemIndex].sku) {
      if (
        inventoryItems.find(
          (item) => item.sku === updates.sku && item.id !== id,
        )
      ) {
        return res.status(409).json({ error: "SKU already exists" });
      }
    }

    // Update item
    const updatedItem = {
      ...inventoryItems[itemIndex],
      ...updates,
      updatedAt: new Date(),
    };

    inventoryItems[itemIndex] = updatedItem;

    res.json({
      item: updatedItem,
      message: "Inventory item updated successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update inventory item" });
  }
};

// DELETE /api/admin/inventory/items/:id - Delete inventory item
export const deleteInventoryItem: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;

    const itemIndex = inventoryItems.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    inventoryItems.splice(itemIndex, 1);

    res.json({ message: "Inventory item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete inventory item" });
  }
};

// SERVICE TYPES ENDPOINTS

// GET /api/admin/inventory/services - List all service types
export const listServiceTypes: RequestHandler = (req, res) => {
  try {
    res.json({
      services: serviceTypes,
      total: serviceTypes.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch service types" });
  }
};

// POST /api/admin/inventory/services - Create new service type
export const createServiceType: RequestHandler = (req, res) => {
  try {
    const {
      name,
      category,
      description,
      basePrice,
      estimatedDuration,
      requiredSkills,
      isActive,
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: "Name and category are required" });
    }

    const newService: ServiceType = {
      id: `service-${Date.now()}`,
      name,
      category,
      description: description || "",
      basePrice: basePrice || 0,
      estimatedDuration: estimatedDuration || 30,
      requiredSkills: requiredSkills || [],
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date(),
    };

    serviceTypes.push(newService);

    res.status(201).json({
      service: newService,
      message: "Service type created successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create service type" });
  }
};

// CATEGORIES ENDPOINTS

// GET /api/admin/inventory/categories - List all categories
export const listCategories: RequestHandler = (req, res) => {
  try {
    const { type } = req.query;

    let filteredCategories = [...categories];

    if (type && type !== "all") {
      filteredCategories = filteredCategories.filter(
        (cat) => cat.type === type,
      );
    }

    res.json({
      categories: filteredCategories,
      total: filteredCategories.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// POST /api/admin/inventory/categories - Create new category
export const createCategory: RequestHandler = (req, res) => {
  try {
    const { name, description, type, isActive } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: "Name and type are required" });
    }

    // Check if category name already exists for this type
    if (categories.find((cat) => cat.name === name && cat.type === type)) {
      return res
        .status(409)
        .json({ error: "Category name already exists for this type" });
    }

    const newCategory: ProductCategory = {
      id: `cat-${Date.now()}`,
      name,
      description: description || "",
      type,
      isActive: isActive !== undefined ? isActive : true,
    };

    categories.push(newCategory);

    res.status(201).json({
      category: newCategory,
      message: "Category created successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create category" });
  }
};

// STATISTICS ENDPOINTS

// GET /api/admin/inventory/stats - Get inventory statistics
export const getInventoryStats: RequestHandler = (req, res) => {
  try {
    const totalItems = inventoryItems.length;
    const activeItems = inventoryItems.filter((item) => item.isActive).length;
    const lowStockItems = inventoryItems.filter(
      (item) => item.quantity <= item.minQuantity,
    ).length;
    const totalValue = inventoryItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const itemsByType = {
      product: inventoryItems.filter((item) => item.type === "product").length,
      service: inventoryItems.filter((item) => item.type === "service").length,
      part: inventoryItems.filter((item) => item.type === "part").length,
    };

    res.json({
      totalItems,
      activeItems,
      inactiveItems: totalItems - activeItems,
      lowStockItems,
      totalValue,
      itemsByType,
      totalServices: serviceTypes.length,
      totalCategories: categories.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inventory statistics" });
  }
};

// BULK OPERATIONS

// PATCH /api/admin/inventory/items/bulk-update - Bulk update inventory items
export const bulkUpdateItems: RequestHandler = (req, res) => {
  try {
    const { itemIds, updates } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ error: "Item IDs array is required" });
    }

    let updatedCount = 0;

    itemIds.forEach((id) => {
      const itemIndex = inventoryItems.findIndex((item) => item.id === id);
      if (itemIndex !== -1) {
        inventoryItems[itemIndex] = {
          ...inventoryItems[itemIndex],
          ...updates,
          updatedAt: new Date(),
        };
        updatedCount++;
      }
    });

    res.json({
      message: `${updatedCount} items updated successfully`,
      updatedCount,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to bulk update items" });
  }
};

// GET /api/admin/inventory/low-stock - Get low stock items
export const getLowStockItems: RequestHandler = (req, res) => {
  try {
    const lowStockItems = inventoryItems.filter(
      (item) => item.isActive && item.quantity <= item.minQuantity,
    );

    res.json({
      items: lowStockItems,
      total: lowStockItems.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch low stock items" });
  }
};
