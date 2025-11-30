import { useQuery } from "@tanstack/react-query";

// TABELA ENTRADAS DA SEMANA <INT>
const API_URL = "https://planilhastut-n8n.mikf4p.easypanel.host/webhook/34c080bb-e2fb-43cc-8466-e74449b7c0dc";
export function Cmvfunction() {
  return useQuery<number>({
    queryKey: ["entradas-semana"],
    queryFn: async () => {
      const response = await fetch(API_URL);
      const text = await response.text();
      return Number(text); // exemplo: 0.235466
    },
    refetchInterval: 1000 * 60 * 5,
  });

  
}

// TABELA VALOR EM ESTOQUE <INT>
const API_URL1 = 'https://planilhastut-n8n.mikf4p.easypanel.host/webhook/461985db-24d6-4110-81d0-9bdc28de14bb';

export function ValEstoque() {
  return useQuery<number>({
    queryKey: ["Valor_em_estoque"],
    queryFn: async () => {

      const response = await fetch(API_URL1);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();

      const value = Number(text);
      
      if (isNaN(value)) {
        throw new Error(`Valor inválido recebido da API: ${text}`);
      }
      // Retorna o valor do primeiro item
      return value
    },
    refetchInterval: 1000 * 60 * 5, // 5 minutos
  });
}