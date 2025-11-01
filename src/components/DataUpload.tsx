import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, TrendingUp } from "lucide-react";
import { fetchCSVFromURL, fetchBalanceData, fetchCadastroData } from "@/utils/csvParser";
import { ProcessedProduct } from "@/types/inventory";
import { toast } from "sonner";

const BALANCE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-0NIA1GWsBNW6co9OYnDYBkUYbgJtBxSa0fyPVLmQE7RPEhMVXf2-8lFeaCndUhP9GzQxW8ynVMii/pub?gid=1233627160&single=true&output=csv";
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

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Dados em Tempo Real
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Fonte: Google Sheets
            </span>
            {lastUpdate && (
              <span className="text-muted-foreground">
                Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
              </span>
            )}
          </div>
          
          <div className="pt-4 border-t">
            <Label htmlFor="weekly-revenue" className="text-sm font-medium">
              Faturamento Total da Semana (R$)
            </Label>
            <Input
              id="weekly-revenue"
              type="number"
              step="0.01"
              min="0"
              value={weeklyRevenue || ''}
              onChange={(e) => onRevenueChange(parseFloat(e.target.value) || 0)}
              placeholder="Ex: 15000.00"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Necessário para calcular o CMV Real em porcentagem
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            Os dados são atualizados automaticamente a cada 30 segundos
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataUpload;
