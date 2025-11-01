import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProcessedProduct } from "@/types/inventory";
import { Search, Package } from "lucide-react";

interface ProductTableProps {
  products: ProcessedProduct[];
}

const ProductTable = ({ products }: ProductTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

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
                <TableHead className="text-right">Estoque Inicial</TableHead>
                <TableHead className="text-right">Entrada</TableHead>
                <TableHead className="text-right">Estoque Final</TableHead>
                <TableHead className="text-right">Giro (R$)</TableHead>
                <TableHead className="text-right">Preço Unit.</TableHead>
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
                    <TableCell className="text-right">{product.initialCount}</TableCell>
                    <TableCell className="text-right">{product.entry}</TableCell>
                    <TableCell className="text-right">{product.finalCount}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.turnoverValue)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.unitPrice)}</TableCell>
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
