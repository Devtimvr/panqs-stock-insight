import Papa from 'papaparse';
import { ProductData, ProcessedProduct } from '@/types/inventory';

export const fetchCSVFromURL = async (url: string): Promise<ProcessedProduct[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<ProductData>(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const processed = results.data.map((row) => {
            // Clean currency strings
            const cleanCurrency = (value: string) => {
              if (!value) return 0;
              return parseFloat(value.replace(/[R$\s.]/g, '').replace(',', '.'));
            };

            return {
              name: row["Nome do Produto"],
              turnover: Number(row["Giro"]) || 0,
              initialCount: Number(row["Contagem 1"]) || 0,
              entry: Number(row["Entrada"]) || 0,
              finalCount: Number(row["Contagem 2"]) || 0,
              turnoverValue: cleanCurrency(row["Giro em Reais"]),
              unitPrice: cleanCurrency(row[""]),
            };
          }).filter(p => p.name); // Filter out empty rows

          resolve(processed);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const calculateMetrics = (products: ProcessedProduct[], weeklyRevenue?: number) => {
  const totalValue = products.reduce((sum, p) => sum + (p.finalCount * p.unitPrice), 0);
  const productCount = products.length;
  const totalTurnoverValue = products.reduce((sum, p) => sum + p.turnoverValue, 0);
  
  // CMV Real (%) = (Giro em Reais / Faturamento Semanal) * 100
  let cmvRealPercentage = null;
  if (weeklyRevenue && weeklyRevenue > 0) {
    cmvRealPercentage = (totalTurnoverValue / weeklyRevenue) * 100;
  }
  
  const productsWithoutPrice = products.filter(p => !p.unitPrice || p.unitPrice === 0).length;

  return {
    totalValue,
    productCount,
    cmvRealPercentage,
    totalTurnoverValue,
    productsWithoutPrice,
    turnoverTrend: 'stable' as const,
  };
};
