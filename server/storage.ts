import { 
  Product, 
  InsertProduct, 
  RfpResponse, 
  InsertRfpResponse, 
  MediaPlanVersion, 
  InsertMediaPlanVersion, 
  MediaPlanLineItem, 
  InsertMediaPlanLineItem,
  UpdateMediaPlanLineItem 
} from "@shared/schema";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  searchProducts(query: string): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  
  // RFP Responses
  getRfpResponses(): Promise<RfpResponse[]>;
  getRfpResponse(id: number): Promise<RfpResponse | undefined>;
  createRfpResponse(rfpResponse: InsertRfpResponse): Promise<RfpResponse>;
  updateRfpResponse(id: number, rfpResponse: Partial<InsertRfpResponse>): Promise<RfpResponse>;
  deleteRfpResponse(id: number): Promise<void>;
  
  // Media Plan Versions
  getMediaPlanVersions(rfpResponseId: number): Promise<MediaPlanVersion[]>;
  getMediaPlanVersion(id: number): Promise<MediaPlanVersion | undefined>;
  createMediaPlanVersion(mediaPlanVersion: InsertMediaPlanVersion): Promise<MediaPlanVersion>;
  updateMediaPlanVersion(id: number, mediaPlanVersion: Partial<InsertMediaPlanVersion>): Promise<MediaPlanVersion>;
  deleteMediaPlanVersion(id: number): Promise<void>;
  
  // Media Plan Line Items
  getMediaPlanLineItems(mediaPlanVersionId: number): Promise<MediaPlanLineItem[]>;
  getMediaPlanLineItem(id: number): Promise<MediaPlanLineItem | undefined>;
  createMediaPlanLineItem(lineItem: InsertMediaPlanLineItem): Promise<MediaPlanLineItem>;
  updateMediaPlanLineItem(id: number, lineItem: UpdateMediaPlanLineItem): Promise<MediaPlanLineItem>;
  deleteMediaPlanLineItem(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product> = new Map();
  private rfpResponses: Map<number, RfpResponse> = new Map();
  private mediaPlanVersions: Map<number, MediaPlanVersion> = new Map();
  private mediaPlanLineItems: Map<number, MediaPlanLineItem> = new Map();
  
  private productIdCounter = 1;
  private rfpResponseIdCounter = 1;
  private mediaPlanVersionIdCounter = 1;
  private mediaPlanLineItemIdCounter = 1;

  constructor() {
    // Initialize with CSV data
    this.initializeProducts();
    this.initializeSampleData();
  }

  private initializeProducts() {
    const csvProducts = [
      {
        name: "Standard Display",
        category: "Display",
        targetingDetails: "MiQ will utilize Sigma Audiences to target BRAND's target audience. MiQ Sigma Audiences uses the power of generative AI to deliver fast, customized audience activation across diverse formats, channels and DSP platforms.",
        placementName: "MiQ Sigma Audiences_Standard Display_Desktop/Tablet/Mobile_Package",
        adSizes: "Desktop: 300x250, 300x600, 120x600, 160x600, 728x90\nTablet: 300x250, 300x600, 120x600, 160x600, 728x90\nMobile: 300x250,300x600, 300x50, 320x50",
        pricingModel: "dCPM"
      },
      {
        name: "Online Video",
        category: "Video",
        targetingDetails: "MiQ's Sigma Audiences uses the power of generative AI to deliver fast, customized audience activation to ensure MiQ is reaching BRAND target audience at scale and at the right time, via online video units across desktop, table, and mobile.",
        placementName: "MiQ Sigma Audiences_Online Video_Desktop/Tablet/Mobile_Package",
        adSizes: ":06s | :15s | :30s",
        pricingModel: "dCPM"
      },
      {
        name: "CTV/OTT",
        category: "Video",
        targetingDetails: "MiQ to utilize Connected TV to serve BRAND creatives to the desired audience. Connected TV allows for 100% viewability, 97% Completion Rate, and 90% Streamed to TV.",
        placementName: "MiQ_Connected TV_Video_Package",
        adSizes: ":15s | :30s",
        pricingModel: "dCPM"
      },
      {
        name: "Sigma TV Targeting - Video",
        category: "Video",
        targetingDetails: "MiQ's data-driving 1:1 TV product, providing second-by-second viewership data about the ads and content the BRAND target audience is watching on TV.",
        placementName: "MiQ Sigma Viewing Audiences_ACR Retargeting_Video_Desktop/Tablet/Mobile_Package",
        adSizes: ":15s | :30s",
        pricingModel: "dCPM"
      },
      {
        name: "Sigma TV Targeting - Display",
        category: "Display",
        targetingDetails: "MiQ's data-driving 1:1 TV product, providing second-by-second viewership data about the ads and content the BRAND target audience is watching on TV.",
        placementName: "MiQ Sigma Viewing Audiences_ACR Retargeting_Standard Display_Desktop/Tablet/Mobile_Package",
        adSizes: "Desktop: 300x250, 300x600, 120x600, 160x600, 728x90\nTablet: 300x250, 300x600, 120x600, 160x600, 728x90\nMobile: 300x250,300x600, 300x50, 320x50",
        pricingModel: "dCPM"
      },
      {
        name: "High Impact",
        category: "Display",
        targetingDetails: "MiQ will utilize Sigma Audiences to target BRAND target audience via custom high impact units across desktop, tablet, and mobile.",
        placementName: "MiQ Sigma Audiences_High Impact XXX_Rich Media_Desktop/Mobile_Package",
        adSizes: "Custom sizes depending on High Impact unit",
        pricingModel: "dCPM"
      },
      {
        name: "Native - Display",
        category: "Display",
        targetingDetails: "MiQ will utilize Sigma Audiences to target BRAND target audience via rich media Native units which will drive awareness across desktop and mobile.",
        placementName: "MiQ Sigma Audiences_Native_Desktop/Tablet/Mobile_Package",
        adSizes: "Square: 627 x 627 pixels\nRectangle: minimum 1200 x 627 and maximum 2000 x 1047",
        pricingModel: "dCPM"
      },
      {
        name: "Native - Video",
        category: "Video",
        targetingDetails: "MiQ will utilize Sigma Audiences to target BRAND target audience via rich media Native video units across desktop and mobile.",
        placementName: "MiQ Sigma Audiences_Native_Video_Desktop/Tablet/Mobile_Package",
        adSizes: "Maximum 60 seconds",
        pricingModel: "dCPM"
      },
      {
        name: "Audio",
        category: "Audio",
        targetingDetails: "MiQ's Programmatic Audio offering grants access to premium audio including Spotify, Audiology, TargetSpot, Triton, and more.",
        placementName: "MiQ_Programmatic Audio_Package",
        adSizes: ":06s | :15s | :30s",
        pricingModel: "dCPM"
      },
      {
        name: "Social Boost",
        category: "Social",
        targetingDetails: "MiQ is able to ingest BRAND social media posts and connect them to premium mobile web content, amplifying the impact of these posts.",
        placementName: "MiQ_BRAND_Social Boost_Social Units_Package",
        adSizes: "300x250, 300x600",
        pricingModel: "dCPM"
      },
      {
        name: "DCO",
        category: "Display",
        targetingDetails: "MiQ will use Dynamic Creative Optimization to build out and target users who have engaged with elements/products.",
        placementName: "MiQ Sigma Audiences_Dynamic XXX_Desktop/Tablet/Mobile_Package",
        adSizes: "Depends on channel being used",
        pricingModel: "dCPM"
      },
      {
        name: "Shoppable",
        category: "Display",
        targetingDetails: "MiQ will use Shoppable creative to shorten the path to purchase, collecting unique data about consumer behavior.",
        placementName: "MiQ Sigma Buying Audiences_Shoppable Display_Desktop/Mobile_Package",
        adSizes: "Desktop: 300x600, 300x250, 160x600, 728x90, 970x250\nMobile: 300x250",
        pricingModel: "dCPM"
      },
      {
        name: "YouTube",
        category: "Video",
        targetingDetails: "MiQ will dynamically target key BRAND audience on YouTube (via DV360) with in-stream and discovery formats.",
        placementName: "YouTube packages",
        adSizes: ":06s | :15s | :30s",
        pricingModel: "dCPM"
      }
    ];

    csvProducts.forEach(product => {
      const productWithId: Product = {
        id: this.productIdCounter++,
        ...product,
        createdAt: new Date()
      };
      this.products.set(productWithId.id, productWithId);
    });
  }

  private initializeSampleData() {
    // Create sample RFP
    const sampleRfp: RfpResponse = {
      id: this.rfpResponseIdCounter++,
      title: "Q4 2024 Brand Campaign",
      clientName: "Global Tech Company",
      dueDate: "December 15, 2024",
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.rfpResponses.set(sampleRfp.id, sampleRfp);

    // Create sample media plan version
    const sampleVersion: MediaPlanVersion = {
      id: this.mediaPlanVersionIdCounter++,
      rfpResponseId: sampleRfp.id,
      versionNumber: 1,
      title: "Plan Version 1",
      totalBudget: "245000",
      totalImpressions: 6450000,
      avgCpm: "38.00",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mediaPlanVersions.set(sampleVersion.id, sampleVersion);
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct: Product = {
      id: this.productIdCounter++,
      ...product,
      createdAt: new Date()
    };
    this.products.set(newProduct.id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) {
      throw new Error(`Product with id ${id} not found`);
    }
    
    const updatedProduct: Product = {
      ...existingProduct,
      ...product
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    const exists = this.products.has(id);
    if (!exists) {
      throw new Error(`Product with id ${id} not found`);
    }
    this.products.delete(id);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const products = Array.from(this.products.values());
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery) ||
      product.targetingDetails.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const products = Array.from(this.products.values());
    return products.filter(product => product.category === category);
  }

  // RFP Responses
  async getRfpResponses(): Promise<RfpResponse[]> {
    return Array.from(this.rfpResponses.values());
  }

  async getRfpResponse(id: number): Promise<RfpResponse | undefined> {
    return this.rfpResponses.get(id);
  }

  async createRfpResponse(rfpResponse: InsertRfpResponse): Promise<RfpResponse> {
    const newRfpResponse: RfpResponse = {
      id: this.rfpResponseIdCounter++,
      ...rfpResponse,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.rfpResponses.set(newRfpResponse.id, newRfpResponse);
    return newRfpResponse;
  }

  async updateRfpResponse(id: number, rfpResponse: Partial<InsertRfpResponse>): Promise<RfpResponse> {
    const existing = this.rfpResponses.get(id);
    if (!existing) {
      throw new Error(`RFP Response with id ${id} not found`);
    }
    const updated: RfpResponse = {
      ...existing,
      ...rfpResponse,
      updatedAt: new Date()
    };
    this.rfpResponses.set(id, updated);
    return updated;
  }

  async deleteRfpResponse(id: number): Promise<void> {
    this.rfpResponses.delete(id);
  }

  // Media Plan Versions
  async getMediaPlanVersions(rfpResponseId: number): Promise<MediaPlanVersion[]> {
    const versions = Array.from(this.mediaPlanVersions.values());
    return versions.filter(version => version.rfpResponseId === rfpResponseId);
  }

  async getMediaPlanVersion(id: number): Promise<MediaPlanVersion | undefined> {
    return this.mediaPlanVersions.get(id);
  }

  async createMediaPlanVersion(mediaPlanVersion: InsertMediaPlanVersion): Promise<MediaPlanVersion> {
    const newVersion: MediaPlanVersion = {
      id: this.mediaPlanVersionIdCounter++,
      ...mediaPlanVersion,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mediaPlanVersions.set(newVersion.id, newVersion);
    return newVersion;
  }

  async updateMediaPlanVersion(id: number, mediaPlanVersion: Partial<InsertMediaPlanVersion>): Promise<MediaPlanVersion> {
    const existing = this.mediaPlanVersions.get(id);
    if (!existing) {
      throw new Error(`Media Plan Version with id ${id} not found`);
    }
    const updated: MediaPlanVersion = {
      ...existing,
      ...mediaPlanVersion,
      updatedAt: new Date()
    };
    this.mediaPlanVersions.set(id, updated);
    return updated;
  }

  async deleteMediaPlanVersion(id: number): Promise<void> {
    this.mediaPlanVersions.delete(id);
  }

  // Media Plan Line Items
  async getMediaPlanLineItems(mediaPlanVersionId: number): Promise<MediaPlanLineItem[]> {
    const lineItems = Array.from(this.mediaPlanLineItems.values());
    return lineItems.filter(item => item.mediaPlanVersionId === mediaPlanVersionId);
  }

  async getMediaPlanLineItem(id: number): Promise<MediaPlanLineItem | undefined> {
    return this.mediaPlanLineItems.get(id);
  }

  async createMediaPlanLineItem(lineItem: InsertMediaPlanLineItem): Promise<MediaPlanLineItem> {
    const newLineItem: MediaPlanLineItem = {
      id: this.mediaPlanLineItemIdCounter++,
      ...lineItem,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mediaPlanLineItems.set(newLineItem.id, newLineItem);
    return newLineItem;
  }

  async updateMediaPlanLineItem(id: number, lineItem: UpdateMediaPlanLineItem): Promise<MediaPlanLineItem> {
    const existing = this.mediaPlanLineItems.get(id);
    if (!existing) {
      throw new Error(`Media Plan Line Item with id ${id} not found`);
    }
    const updated: MediaPlanLineItem = {
      ...existing,
      ...lineItem,
      updatedAt: new Date()
    };
    this.mediaPlanLineItems.set(id, updated);
    return updated;
  }

  async deleteMediaPlanLineItem(id: number): Promise<void> {
    this.mediaPlanLineItems.delete(id);
  }
}

export const storage = new MemStorage();
