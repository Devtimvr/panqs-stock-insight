import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Package } from "lucide-react";

interface ProcessedProduct {
  name: string;
  turnover: number;
  initialCount: number;
  entry: number;
  finalCount: number;
  turnoverValue: number;
  unitPrice: number;
  semana: number;   // novo campo
}

const ProductTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<ProcessedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔵 GET DO WEBHOOK DIRETO NO COMPONENTE
  const fetchExcelData = async () => {
    try {
      const res = await fetch(
        "https://planilhastut-n8n.mikf4p.easypanel.host/webhook/b1a8df9c-ac2d-41fe-91ec-8612b230183c"
      );
      const data = await res.json();

      // 🔹 Como o seu webhook retorna um array direto
      const formatted: ProcessedProduct[] = data.map((item: any) => ({
        name: item.Produto || "",
        turnover: item.giro_qtd || 0,
        initialCount: item.contagem_inicial || 0,
        entry: item["entradas_qtd (D2)"] || 0,
        finalCount: item.contagem_final || 0,
        turnoverValue: item["giro em reais"] || 0,
        semana: item.Semana || 0,      // ADICIONANDO SEMANA
        unitPrice: 0, // se não tiver preço real, coloque depois
      }));

      setProducts(formatted);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      setLoading(false);
    }
  };

  // 🔵 CHAMADA AUTOMÁTICA DA API
  useEffect(() => {
    fetchExcelData();
  }, []);

  // 🔵 FILTRO
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  if (loading) {
    return <div>Carregando produtos...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Produtos em Estoque
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Giro</TableHead>
                <TableHead className="text-right">Semana</TableHead>
                <TableHead className="text-right">Estoque Inicial</TableHead>
                <TableHead className="text-right">Entrada</TableHead>
                <TableHead className="text-right">Estoque Final</TableHead>
                <TableHead className="text-right">Giro (R$)</TableHead>
                {/*<TableHead className="text-right">Preço Unit.</TableHead>*/}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhum produto encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-right">{product.turnover}</TableCell>
                  <TableCell className="text-right">{product.semana}</TableCell>       
                  <TableCell className="text-right">{product.initialCount}</TableCell>
                  <TableCell className="text-right">{product.entry}</TableCell>
                  <TableCell className="text-right">{product.finalCount}</TableCell>
                  <TableCell className="text-right">{formatCurrency(product.turnoverValue)}</TableCell>
                  {/*<TableCell className="text-right">{formatCurrency(product.unitPrice)}</TableCell>*/}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductTable;
