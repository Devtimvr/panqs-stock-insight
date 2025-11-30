import Papa from 'papaparse';
import { ProductData, ProcessedProduct } from '@/types/inventory';

interface BalanceProduct {
  name: string;
  quantity: number;
  unitPrice: number;
}

export const fetchBalanceData = async (url: string): Promise<BalanceProduct[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          console.log('Dados do Balanço - Colunas:', Object.keys(results.data[0] || {}));
          
          const cleanCurrency = (value: string | number | undefined) => {
            if (!value && value !== 0) return 0;
            const stringValue = String(value);
            const cleaned = stringValue.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? 0 : parsed;
          };

          const cleanNumber = (value: string | number | undefined) => {
            if (!value && value !== 0) return 0;
            const num = Number(value);
            return isNaN(num) ? 0 : num;
          };

          const processed = results.data.map((row: any) => {
            return {
              name: row["Nome do Produto"] || row["Produto"] || row["Nome"] || "",
              quantity: cleanNumber(row["Contagem 2"] || row["Quantidade"] || row["Estoque"] || 0),
              unitPrice: cleanCurrency(row[""] || row["Preço"] || row["Preco"] || 0),
            };
          }).filter(p => p.name && p.name.trim() !== '');

          console.log('Balanço processado:', processed.length, 'produtos');
          console.log('Amostra:', processed.slice(0, 3));
          
          resolve(processed);
        } catch (error) {
          console.error('Erro ao processar Balanço:', error);
          reject(error);
        }
      },
      error: (error) => {
        console.error('Erro ao baixar Balanço:', error);
        reject(error);
      },
    });
  });
};

export const fetchCadastroData = async (url: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          console.log('Dados do Cadastro - Colunas:', Object.keys(results.data[0] || {}));
          
          const products = results.data
            .map((row: any) => row["Nome do Produto"] || row["Produto"] || row["Nome"] || "")
            .filter((name: string) => name && name.trim() !== '');

          console.log('Cadastro processado:', products.length, 'produtos');
          
          resolve(products);
        } catch (error) {
          console.error('Erro ao processar Cadastro:', error);
          reject(error);
        }
      },
      error: (error) => {
        console.error('Erro ao baixar Cadastro:', error);
        reject(error);
      },
    });
  });
};

// CADASTRO TOTAL
// cadastroService.ts
export const fetchCadastroprodutos = (url: string): Promise<number> => {
  return new Promise(async (resolve) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Erro ao buscar cadastro");

      const text = await res.text();
      const total = Number(text);
      if (isNaN(total)) throw new Error("Resposta do webhook não é um número");

      resolve(total); // retorna o número
    } catch (err) {
      console.error("Erro ao buscar dados de cadastro:", err);
      resolve(0); // fallback em caso de erro
    }
  });
};


export const fetchCSVFromURL = async (url: string): Promise<ProcessedProduct[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          console.log('Dados principais - Colunas:', Object.keys(results.data[0] || {}));

          const cleanCurrency = (value: string | number | undefined) => {
            if (!value && value !== 0) return 0;
            const stringValue = String(value);
            const cleaned = stringValue.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? 0 : parsed;
          };

          const cleanNumber = (value: string | number | undefined) => {
            if (!value && value !== 0) return 0;
            const num = Number(value);
            return isNaN(num) ? 0 : num;
          };

          const processed = results.data.map((row: any) => {
            return {
              name: row["Nome do Produto"] || row["Nome"] || row["Produto"] || "",
              turnover: cleanNumber(row["Giro"] || 0),
              initialCount: cleanNumber(row["Contagem 1"] || 0),
              entry: cleanNumber(row["Entrada"] || 0),
              finalCount: cleanNumber(row["Contagem 2"] || 0),
              turnoverValue: cleanCurrency(row["Giro em Reais"] || 0),
              unitPrice: cleanCurrency(row[""] || row["Preço"] || 0),
            };
          }).filter(p => p.name && p.name.trim() !== '');

          console.log('Dados principais processados:', processed.length);
          
          resolve(processed);
        } catch (error) {
          console.error('Erro ao processar CSV principal:', error);
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

export const calculateMetrics = (
  balanceProducts: BalanceProduct[], 
  cadastroCount: number,
  turnoverData: ProcessedProduct[], 
  weeklyRevenue?: number,
  maisum?: number,
  maisdois?: number
) => {
  // Valor em estoque vem da API
  const fatSemanal = maisdois;
  
  // Número de produtos cadastrados vem do Cadastro
  const productCount = cadastroCount;
  
  // Giro em Reais vem dos dados de movimentação
  const totalTurnoverValue = turnoverData.reduce((sum, p) => sum + p.turnoverValue, 0);
  
  // CMV Real (%) = (Giro em Reais / Faturamento Semanal) * 100
  let cmvRealPercentage = null;
  if (weeklyRevenue && weeklyRevenue > 0) {
    cmvRealPercentage = (totalTurnoverValue / weeklyRevenue) * 100;
  }
  
  // Produtos sem preço no Balanço
  const productsWithoutPrice = balanceProducts.filter(p => !p.unitPrice || p.unitPrice === 0).length;

  console.log('Métricas calculadas:', {
    fatSemanal,
    productCount,
    cmvRealPercentage,
    totalTurnoverValue,
    productsWithoutPrice
  });

  return {
    fatSemanal,
    productCount,
    cmvRealPercentage,
    totalTurnoverValue,
    productsWithoutPrice,
    turnoverTrend: 'stable' as const,
  };
};
