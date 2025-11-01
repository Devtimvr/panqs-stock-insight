import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { parseCSV } from "@/utils/csvParser";
import { ProcessedProduct } from "@/types/inventory";
import { toast } from "sonner";

interface DataUploadProps {
  onDataLoaded: (data: ProcessedProduct[]) => void;
}

const DataUpload = ({ onDataLoaded }: DataUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error('Por favor, selecione um arquivo CSV');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const data = await parseCSV(file);
      onDataLoaded(data);
      toast.success(`${data.length} produtos carregados com sucesso!`);
    } catch (error) {
      toast.error('Erro ao processar o arquivo. Verifique o formato.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Dados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-border rounded-lg hover:border-accent cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {file ? file.name : 'Clique para selecionar arquivo CSV'}
                </span>
                {file && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-2"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveFile();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </label>
            </div>
            <Button
              onClick={handleUpload}
              disabled={!file || loading}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {loading ? 'Processando...' : 'Carregar Dados'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            O arquivo deve conter as colunas: Nome do Produto, Giro, Contagem 1, Entrada, Contagem 2, Giro em Reais, e Preço Unitário
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataUpload;
