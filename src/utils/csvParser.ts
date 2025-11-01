import Papa from 'papaparse';
import { ProductData, ProcessedProduct } from '@/types/inventory';

export const parseCSV = (file: File): Promise<ProcessedProduct[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<ProductData>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const processed = results.data.map((row) => {
            // Clean currency strings
            const cleanCurrency = (value: string) => {
              return parseFloat(value.replace(/[R$\s.]/g, '').replace(',', '.'));
            };

            return {
              name: row["Nome do Produto"],
              turnover: Number(row["Giro"]),
              initialCount: Number(row["Contagem 1"]),
              entry: Number(row["Entrada"]),
              finalCount: Number(row["Contagem 2"]),
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

export const calculateMetrics = (products: ProcessedProduct[]) => {
  const totalValue = products.reduce((sum, p) => sum + (p.finalCount * p.unitPrice), 0);
  const productCount = products.length;
  const totalTurnoverValue = products.reduce((sum, p) => sum + p.turnoverValue, 0);
  const totalCost = products.reduce((sum, p) => sum + (p.turnover * p.unitPrice), 0);
  
  // CMV Real = Total cost of goods sold
  const cmvReal = totalCost;
  
  const productsWithoutPrice = products.filter(p => !p.unitPrice || p.unitPrice === 0).length;

  return {
    totalValue,
    productCount,
    cmvReal,
    productsWithoutPrice,
    turnoverTrend: 'stable' as const,
    totalTurnoverValue,
  };
};
