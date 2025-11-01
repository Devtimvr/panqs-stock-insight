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
            // Clean currency strings - more robust handling
            const cleanCurrency = (value: string | number | undefined) => {
              if (!value && value !== 0) return 0;
              const stringValue = String(value);
              // Remove R$, spaces, and dots (thousands separator)
              // Replace comma with dot (decimal separator)
              const cleaned = stringValue.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
              const parsed = parseFloat(cleaned);
              return isNaN(parsed) ? 0 : parsed;
            };

            const cleanNumber = (value: string | number | undefined) => {
              if (!value && value !== 0) return 0;
              const num = Number(value);
              return isNaN(num) ? 0 : num;
            };

            const product = {
              name: row["Nome do Produto"],
              turnover: cleanNumber(row["Giro"]),
              initialCount: cleanNumber(row["Contagem 1"]),
              entry: cleanNumber(row["Entrada"]),
              finalCount: cleanNumber(row["Contagem 2"]),
              turnoverValue: cleanCurrency(row["Giro em Reais"]),
              unitPrice: cleanCurrency(row[""]),
            };

            // Debug log
            console.log('Produto processado:', {
              nome: product.name,
              finalCount: product.finalCount,
              unitPrice: product.unitPrice,
              valor: product.finalCount * product.unitPrice
            });

            return product;
          }).filter(p => p.name && p.name.trim() !== ''); // Filter out empty rows

          console.log('Total de produtos processados:', processed.length);
          console.log('Soma total:', processed.reduce((sum, p) => sum + (p.finalCount * p.unitPrice), 0));

          resolve(processed);
        } catch (error) {
          console.error('Erro ao processar CSV:', error);
          reject(error);
        }
      },
      error: (error) => {
        console.error('Erro ao baixar CSV:', error);
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
