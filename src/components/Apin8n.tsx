import { useQuery } from "@tanstack/react-query";

type ProdutoGET = {
  row_number: number;
  cadastroprodutoId: number;
  identrada: number;
  quantidade: number;
  nome: string;
  dataentrada: string;
};

type WebhookResponse = {
  success: boolean;
  periodo: {
    inicio: string;
    fim: string;
  };
  total_semana: number;
  entradas_segunda: number;
  entradas_terca_a_domingo: number;
  registros_filtrados: number;
  produtos_objetosGETALL: ProdutoGET[];
};

// ATUALIZAR PLANILHA 
const API_URL = "https://planilhastut-n8n.mikf4p.easypanel.host/webhook/6fcfa131-11f0-4dc2-9ff3-d62a09e1a9d1";

export default function EntradasSemana() {
  const { data, isLoading, isError } = useQuery<WebhookResponse>({
    queryKey: ["entradas-semana"],
    queryFn: async () => {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Erro ao buscar dados do webhook");
      return response.json();
    },
    refetchInterval: 1000 * 60 * 5, // atualiza a cada 5 minutos
  });

  if (isLoading) return <p className="text-muted-foreground">Carregando dados...</p>;
  if (isError) return <p className="text-red-600">Erro ao carregar dados.</p>;
  if (!data) return <p>Nenhum dado encontrado.</p>;

  return (
    <div className="mt-10 p-6 border rounded-xl bg-card shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Entradas da Semana</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 border rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">Período</p>
          <p className="font-semibold">
            {data.periodo.inicio} → {data.periodo.fim}
          </p>
        </div>

        <div className="p-4 border rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">Total da Semana</p>
          <p className="font-semibold">{data.total_semana}</p>
        </div>

        <div className="p-4 border rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">Entradas Segunda</p>
          <p className="font-semibold">{data.entradas_segunda}</p>
        </div>

        <div className="p-4 border rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">Terça a Domingo</p>
          <p className="font-semibold">{data.entradas_terca_a_domingo}</p>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-3">Produtos da Semana</h3>

      {data.produtos_objetosGETALL.length === 0 ? (
        <p className="text-muted-foreground">Nenhum produto encontrado.</p>
      ) : (
        <ul className="space-y-3">
          {data.produtos_objetosGETALL.map((produto) => (
            <li
              key={produto.row_number}
              className="p-4 border rounded-lg bg-background shadow-sm"
            >
              <p className="font-semibold">{produto.nome}</p>
              <p className="text-sm text-muted-foreground">
                Quantidade: {produto.quantidade}
              </p>
              <p className="text-sm text-muted-foreground">
                Entrada: {new Date(produto.dataentrada).toLocaleDateString("pt-BR")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
