import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import * as adminUsers from "./routes/admin-users";
import * as adminInventory from "./routes/admin-inventory";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Admin routes - User Management
  app.get("/api/admin/users", adminUsers.listUsers);
  app.get("/api/admin/users/stats", adminUsers.getUserStats);
  app.get("/api/admin/users/:id", adminUsers.getUserById);
  app.post("/api/admin/users", adminUsers.createUser);
  app.put("/api/admin/users/:id", adminUsers.updateUser);
  app.patch("/api/admin/users/:id/toggle-status", adminUsers.toggleUserStatus);
  app.delete("/api/admin/users/:id", adminUsers.deleteUser);

  // Admin routes - Inventory Management
  app.get("/api/admin/inventory/items", adminInventory.listInventoryItems);
  app.post("/api/admin/inventory/items", adminInventory.createInventoryItem);
  app.put("/api/admin/inventory/items/:id", adminInventory.updateInventoryItem);
  app.delete(
    "/api/admin/inventory/items/:id",
    adminInventory.deleteInventoryItem,
  );
  app.patch(
    "/api/admin/inventory/items/bulk-update",
    adminInventory.bulkUpdateItems,
  );

  app.get("/api/admin/inventory/services", adminInventory.listServiceTypes);
  app.post("/api/admin/inventory/services", adminInventory.createServiceType);

  app.get("/api/admin/inventory/categories", adminInventory.listCategories);
  app.post("/api/admin/inventory/categories", adminInventory.createCategory);

  app.get("/api/admin/inventory/stats", adminInventory.getInventoryStats);
  app.get("/api/admin/inventory/low-stock", adminInventory.getLowStockItems);

  return app;
}
