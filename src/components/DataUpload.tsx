import { useState, useEffect } from "react";
import { fetchCSVFromURL, fetchBalanceData, fetchCadastroData, fetchCadastroprodutos  } from "@/utils/csvParser";
import { ProcessedProduct } from "@/types/inventory";
import { toast } from "sonner";



// PLANILHA DO SHEETS PARA SIMULAR O ESTOQUE REAL
const BALANCE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-0NIA1GWsBNW6co9OYnDYBkUYbgJtBxSa0fyPVLmQE7RPEhMVXf2-8lFeaCndUhP9GzQxW8ynVMii/pub?gid=1233627160&single=true&output=csv";

//// PLANILHA DO SHEETS PARA SIMULAR O ESTOQUE REAL
const CADASTRO_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-0NIA1GWsBNW6co9OYnDYBkUYbgJtBxSa0fyPVLmQE7RPEhMVXf2-8lFeaCndUhP9GzQxW8ynVMii/pub?gid=1339087143&single=true&output=csv";


const TURNOVER_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-0NIA1GWsBNW6co9OYnDYBkUYbgJtBxSa0fyPVLmQE7RPEhMVXf2-8lFeaCndUhP9GzQxW8ynVMii/pub?output=csv";
const REFRESH_INTERVAL = 30000; // 30 seconds


// PLANILHA DO SHEETS PARA SIMULAR O ESTOQUE REAL
const Cadastro_total = "https://planilhastut-n8n.mikf4p.easypanel.host/webhook/c98b9f31-17b7-4005-9916-04b25b049837";



interface DataUploadProps {
  onDataLoaded: (turnoverData: ProcessedProduct[], balanceData: any[], cadastroCount: number) => void;
  onRevenueChange: (revenue: number) => void;
  weeklyRevenue: number;
  cadastroWebhook: number;
}


const DataUpload = ({ onDataLoaded, onRevenueChange, weeklyRevenue , cadastroWebhook}: DataUploadProps) => {
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = async (showToast = true) => {
    setLoading(true);
    try {
      // Buscar dados das três fontes em paralelo
      const [turnoverData, balanceData, cadastroPlanilha, cadastroWebhookArray] =
      await Promise.all([
        fetchCSVFromURL(TURNOVER_URL),
        fetchBalanceData(BALANCE_URL),
        fetchCadastroData(CADASTRO_URL),          // planilha CSV (se for lista, ajuste)
        fetchCadastroprodutos(Cadastro_total) // webhook retorna número direto

      ]);
      // Se cadastroWebhookArray for array, pega o length
    const cadastroCount = Array.isArray(cadastroWebhookArray)
      ? cadastroWebhookArray.length
      : Number(cadastroWebhookArray) || 0;
      
      
      onDataLoaded(turnoverData, balanceData, cadastroCount);
      setLastUpdate(new Date());
      
      if (showToast) {
        toast.success(`Dados atualizados! ${cadastroCount} produtos cadastrados.`);
      }
    } catch (error) {
      if (showToast) {
        toast.error('Erro ao buscar dados. Verifique a conexão.');
      }
      console.error(error);
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load data on mount
    fetchData(false);

    // Set up auto-refresh
    const interval = setInterval(() => {
      fetchData(false);
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return null;
  
};

export default DataUpload;
