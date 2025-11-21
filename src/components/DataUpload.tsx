import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, TrendingUp } from "lucide-react";
import { fetchCSVFromURL, fetchBalanceData, fetchCadastroData } from "@/utils/csvParser";
import { ProcessedProduct } from "@/types/inventory";
import { toast } from "sonner";

// PLANILHA DO SHEETS PARA SIMULAR O ESTOQUE REAL
const BALANCE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-0NIA1GWsBNW6co9OYnDYBkUYbgJtBxSa0fyPVLmQE7RPEhMVXf2-8lFeaCndUhP9GzQxW8ynVMii/pub?gid=1233627160&single=true&output=csv";

//// PLANILHA DO SHEETS PARA SIMULAR O ESTOQUE REAL
const CADASTRO_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-0NIA1GWsBNW6co9OYnDYBkUYbgJtBxSa0fyPVLmQE7RPEhMVXf2-8lFeaCndUhP9GzQxW8ynVMii/pub?gid=1339087143&single=true&output=csv";


const TURNOVER_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-0NIA1GWsBNW6co9OYnDYBkUYbgJtBxSa0fyPVLmQE7RPEhMVXf2-8lFeaCndUhP9GzQxW8ynVMii/pub?output=csv";
const REFRESH_INTERVAL = 30000; // 30 seconds

interface DataUploadProps {
  onDataLoaded: (turnoverData: ProcessedProduct[], balanceData: any[], cadastroCount: number) => void;
  onRevenueChange: (revenue: number) => void;
  weeklyRevenue: number;
}

const DataUpload = ({ onDataLoaded, onRevenueChange, weeklyRevenue }: DataUploadProps) => {
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = async (showToast = true) => {
    setLoading(true);
    try {
      // Buscar dados das três fontes em paralelo
      const [turnoverData, balanceData, cadastroProducts] = await Promise.all([
        fetchCSVFromURL(TURNOVER_URL),
        fetchBalanceData(BALANCE_URL),
        fetchCadastroData(CADASTRO_URL)
      ]);
      
      onDataLoaded(turnoverData, balanceData, cadastroProducts.length);
      setLastUpdate(new Date());
      
      if (showToast) {
        toast.success(`Dados atualizados! ${cadastroProducts.length} produtos cadastrados.`);
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
