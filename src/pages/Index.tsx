import { useState } from "react";
import { Package, DollarSign, AlertTriangle } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import DataUpload from "@/components/DataUpload";
import MetricCard from "@/components/MetricCard";
import ProductTable from "@/components/ProductTable";
import { Cmvfunction , ValEstoque } from "@/components/Apin8n"; // <-- ADICIONADO
import { ProcessedProduct } from "@/types/inventory";
import { calculateMetrics } from "@/utils/csvParser";



const Index = () => {
  const [turnoverData, setTurnoverData] = useState<ProcessedProduct[]>([]);
  const [balanceData, setBalanceData] = useState<any[]>([]);
  const [cadastroCount, setCadastroCount] = useState<number>(0);
  const [hasData, setHasData] = useState(false);
  const [weeklyRevenue, setWeeklyRevenue] = useState<number>(0);

  const handleDataLoaded = (
    turnover: ProcessedProduct[],
    balance: any[],
    productCount: number

  ) => {
    setTurnoverData(turnover);
    setBalanceData(balance);
    setCadastroCount(productCount);
    setHasData(true);
    setWeeklyRevenue;
  };

  const handleRevenueChange = (revenue: number) => {
    setWeeklyRevenue(revenue);
  };

  // webhook do cmv
  const { data: cmvSemanal, isLoading: loadingCMV } = Cmvfunction();

  //Webhook do faturamento
  const { data: fatSemanal, isLoading: loadingFat } = ValEstoque();

  const metrics = hasData
    ? calculateMetrics(balanceData, cadastroCount, turnoverData, weeklyRevenue, cmvSemanal, fatSemanal)
    : null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* SAUDAÇÕES */}
        <DashboardHeader userName="RAFAEL" />
        <DataUpload
          onDataLoaded={handleDataLoaded}
          onRevenueChange={handleRevenueChange}
          weeklyRevenue={weeklyRevenue}
        />

        {hasData && metrics && (
          <>
            {/* BiG NUMBERS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard
                title="Valor em Estoque"
                value={formatCurrency(metrics.fatSemanal)}
                subtitle="Total atual"
                icon={Package}
                iconBg="bg-accent/20"
              />
              <MetricCard
                title="Produtos Cadastrados"
                value={metrics.productCount}
                subtitle="Total de itens"
                icon={Package}
                iconBg="bg-secondary/20"
              />

              {/*     CMV          */}
              <MetricCard
                title="CMV Semanal"
                value={
                  loadingCMV
                    ? "Carregando..."
                    : cmvSemanal === undefined
                    ? "Sem dados"
                    : cmvSemanal === 0
                    ? "Atualizar o Faturamento"
                    : `${(cmvSemanal * 100).toFixed(2)}%`
                }
                subtitle={
                  loadingCMV
                    ? "Carregando..."
                    : cmvSemanal === undefined
                    ? "Necessita atenção"
                    : cmvSemanal === 0
                    ? "Atualizar o Faturamento"
                    : "CMV Atualizado"
                }
                icon={AlertTriangle}
                iconBg="bg-destructive/20"
              />

            </div>

            {/* Product Table */}
            <ProductTable />

            {/* ENTRADAS DA SEMANA (WEBHOOK) */}
              {/* <EntradasSemana /><-- COMPONENTE ADICIONADO AQUI */}

          </>
        )}

        {!hasData && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum dado carregado</h3>
            <p className="text-muted-foreground">
              Faça o upload de um arquivo CSV para visualizar o dashboard
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
