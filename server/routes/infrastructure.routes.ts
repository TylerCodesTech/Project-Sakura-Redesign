import type { Express } from "express";
import { storage } from "../storage";
import { insertMonitoredServiceSchema } from "@shared/schema";
import { handleAsync, notFound, badRequest, unauthorized } from "../middleware/error-handler";

export function registerInfrastructureRoutes(app: Express) {
  // Get all monitored services
  app.get("/api/monitored-services", handleAsync(async (_req, res) => {
    const services = await storage.getMonitoredServices();
    res.json(services);
  }));

  // Get single monitored service by ID
  app.get("/api/monitored-services/:id", handleAsync(async (req, res) => {
    const service = await storage.getMonitoredServiceById(req.params.id);
    if (!service) {
      throw notFound("Service not found");
    }
    res.json(service);
  }));

  // Create new monitored service
  app.post("/api/monitored-services", handleAsync(async (req, res) => {
    const result = insertMonitoredServiceSchema.safeParse(req.body);
    if (!result.success) {
      throw badRequest(result.error.message);
    }

    const service = await storage.createMonitoredService(result.data);
    res.status(201).json(service);
  }));

  // Update monitored service
  app.patch("/api/monitored-services/:id", handleAsync(async (req, res) => {
    const result = insertMonitoredServiceSchema.partial().safeParse(req.body);
    if (!result.success) {
      throw badRequest(result.error.message);
    }

    const service = await storage.updateMonitoredService(req.params.id, result.data);
    res.json(service);
  }));

  // Delete monitored service
  app.delete("/api/monitored-services/:id", handleAsync(async (req, res) => {
    await storage.deleteMonitoredService(req.params.id);
    res.sendStatus(204);
  }));

  // Get service status history
  app.get("/api/service-status-history/:serviceId", handleAsync(async (req, res) => {
    const history = await storage.getServiceStatusHistory(req.params.serviceId);
    res.json(history);
  }));

  // Get all service alerts
  app.get("/api/service-alerts", handleAsync(async (_req, res) => {
    const alerts = await storage.getServiceAlerts();
    res.json(alerts);
  }));

  // Acknowledge service alert
  app.patch("/api/service-alerts/:id/acknowledge", handleAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
      throw unauthorized("Authentication required");
    }

    const alert = await storage.acknowledgeServiceAlert(req.params.id, req.user!.id);
    res.json(alert);
  }));
}
