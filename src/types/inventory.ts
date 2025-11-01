export interface ProductData {
  "Nome do Produto": string;
  "Giro": number;
  "Contagem 1": number;
  "Entrada": number;
  "Contagem 2": number;
  "Giro em Reais": string;
  "": string; // Price column
}

export interface ProcessedProduct {
  name: string;
  turnover: number;
  initialCount: number;
  entry: number;
  finalCount: number;
  turnoverValue: number;
  unitPrice: number;
  week?: string;
  category?: string;
}

export interface InventoryMetrics {
  totalValue: number;
  productCount: number;
  cmvReal: number;
  productsWithoutPrice: number;
  turnoverTrend: 'up' | 'down' | 'stable';
}
