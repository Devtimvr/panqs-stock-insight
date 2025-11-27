import { useQuery } from "@tanstack/react-query";

const API_URL =
  "https://planilhastut-n8n.mikf4p.easypanel.host/webhook/34c080bb-e2fb-43cc-8466-e74449b7c0dc";

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