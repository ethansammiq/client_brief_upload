import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProductSchema, 
  insertRfpResponseSchema, 
  insertMediaPlanVersionSchema, 
  insertMediaPlanLineItemSchema,
  updateMediaPlanLineItemSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const { search, category } = req.query;
      
      let products;
      if (search) {
        products = await storage.searchProducts(search as string);
      } else if (category && category !== "All Categories") {
        products = await storage.getProductsByCategory(category as string);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete product" });
    }
  });

  // RFP Responses
  app.get("/api/rfp-responses", async (req, res) => {
    try {
      const rfpResponses = await storage.getRfpResponses();
      res.json(rfpResponses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch RFP responses" });
    }
  });

  app.get("/api/rfp-responses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const rfpResponse = await storage.getRfpResponse(id);
      
      if (!rfpResponse) {
        return res.status(404).json({ message: "RFP response not found" });
      }
      
      res.json(rfpResponse);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch RFP response" });
    }
  });

  app.post("/api/rfp-responses", async (req, res) => {
    try {
      const rfpResponseData = insertRfpResponseSchema.parse(req.body);
      const rfpResponse = await storage.createRfpResponse(rfpResponseData);
      res.status(201).json(rfpResponse);
    } catch (error) {
      res.status(400).json({ message: "Invalid RFP response data" });
    }
  });

  app.put("/api/rfp-responses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const rfpResponseData = insertRfpResponseSchema.partial().parse(req.body);
      const rfpResponse = await storage.updateRfpResponse(id, rfpResponseData);
      res.json(rfpResponse);
    } catch (error) {
      res.status(400).json({ message: "Invalid RFP response data" });
    }
  });

  app.delete("/api/rfp-responses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRfpResponse(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete RFP response" });
    }
  });

  // Media Plan Versions
  app.get("/api/rfp-responses/:rfpId/media-plan-versions", async (req, res) => {
    try {
      const rfpId = parseInt(req.params.rfpId);
      const versions = await storage.getMediaPlanVersions(rfpId);
      res.json(versions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch media plan versions" });
    }
  });

  app.get("/api/media-plan-versions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const version = await storage.getMediaPlanVersion(id);
      
      if (!version) {
        return res.status(404).json({ message: "Media plan version not found" });
      }
      
      res.json(version);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch media plan version" });
    }
  });

  app.post("/api/media-plan-versions", async (req, res) => {
    try {
      const versionData = insertMediaPlanVersionSchema.parse(req.body);
      const version = await storage.createMediaPlanVersion(versionData);
      res.status(201).json(version);
    } catch (error) {
      res.status(400).json({ message: "Invalid media plan version data" });
    }
  });

  app.put("/api/media-plan-versions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const versionData = insertMediaPlanVersionSchema.partial().parse(req.body);
      const version = await storage.updateMediaPlanVersion(id, versionData);
      res.json(version);
    } catch (error) {
      res.status(400).json({ message: "Invalid media plan version data" });
    }
  });

  app.delete("/api/media-plan-versions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMediaPlanVersion(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete media plan version" });
    }
  });

  // Media Plan Line Items
  app.get("/api/media-plan-versions/:versionId/line-items", async (req, res) => {
    try {
      const versionId = parseInt(req.params.versionId);
      const lineItems = await storage.getMediaPlanLineItems(versionId);
      res.json(lineItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch media plan line items" });
    }
  });

  app.get("/api/line-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lineItem = await storage.getMediaPlanLineItem(id);
      
      if (!lineItem) {
        return res.status(404).json({ message: "Line item not found" });
      }
      
      res.json(lineItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch line item" });
    }
  });

  app.post("/api/line-items", async (req, res) => {
    try {
      const lineItemData = insertMediaPlanLineItemSchema.parse(req.body);
      const lineItem = await storage.createMediaPlanLineItem(lineItemData);
      res.status(201).json(lineItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid line item data" });
    }
  });

  app.put("/api/line-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lineItemData = updateMediaPlanLineItemSchema.parse(req.body);
      const lineItem = await storage.updateMediaPlanLineItem(id, lineItemData);
      res.json(lineItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid line item data" });
    }
  });

  app.delete("/api/line-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMediaPlanLineItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete line item" });
    }
  });

  // Categories endpoint
  app.get("/api/categories", async (req, res) => {
    try {
      const products = await storage.getProducts();
      const categories = [...new Set(products.map(p => p.category))];
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
