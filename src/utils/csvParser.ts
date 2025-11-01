import Papa from 'papaparse';
import { ProductData, ProcessedProduct } from '@/types/inventory';

export const fetchCSVFromURL = async (url: string): Promise<ProcessedProduct[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          // Log primeira linha para ver as colunas disponíveis
          if (results.data.length > 0) {
            console.log('Colunas disponíveis:', Object.keys(results.data[0]));
            console.log('Primeira linha de dados:', results.data[0]);
          }

          const processed = results.data.map((row: any) => {
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

            // Try different possible column names
            const productName = row["Nome do Produto"] || row["Nome"] || row["Produto"] || row["nome"] || "";
            const giro = row["Giro"] || row["giro"] || 0;
            const contagem1 = row["Contagem 1"] || row["Contagem1"] || row["contagem1"] || 0;
            const entrada = row["Entrada"] || row["entrada"] || 0;
            const contagem2 = row["Contagem 2"] || row["Contagem2"] || row["contagem2"] || 0;
            const giroReais = row["Giro em Reais"] || row["GiroReais"] || row["giroReais"] || 0;
            
            // For price, try empty string column or common price column names
            const preco = row[""] || row["Preço"] || row["Preco"] || row["Preço Unitário"] || row["PrecoUnitario"] || row["preco"] || 0;

            const product = {
              name: productName,
              turnover: cleanNumber(giro),
              initialCount: cleanNumber(contagem1),
              entry: cleanNumber(entrada),
              finalCount: cleanNumber(contagem2),
              turnoverValue: cleanCurrency(giroReais),
              unitPrice: cleanCurrency(preco),
            };

            return product;
          }).filter(p => p.name && p.name.trim() !== ''); // Filter out empty rows

          console.log('Total de produtos processados:', processed.length);
          console.log('Amostra de 3 produtos:', processed.slice(0, 3));
          console.log('Soma total em estoque:', processed.reduce((sum, p) => sum + (p.finalCount * p.unitPrice), 0));

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
