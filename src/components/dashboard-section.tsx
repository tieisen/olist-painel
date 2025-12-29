import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useState } from "react"

interface DashboardAction {
  label: string
  variant?: "default" | "secondary" | "accent" | "success"
  endpoint: string
  description: string
}

interface DashboardSectionProps {
  title: string
  icon: React.ReactNode
  actions: DashboardAction[]
  empresa: string
}

interface ProductData {
  Produto: number;
  Unidade: string;
  "Descrição": string;
  "Saldo no E-commerce": number;
  "Qtd. solicitada": number;
}

interface IntegrationData {
  ecommerce: string;
  dados: ProductData[];
}

const apiCall = async (endpoint: string, method: "GET" | "POST", bodyData?: object): Promise<any> => {
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  }
  if (method === "POST" && bodyData) {
    options.body = JSON.stringify(bodyData)
  }
  const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, options);
  if (!response.ok) {
    // Lança um erro para ser capturado pelo bloco catch em handleAction
    const errorData = await response.text();
    throw new Error(`Erro na API: ${response.status} ${response.statusText} - ${errorData}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch (e) {
      throw new Error("Falha ao processar o JSON da resposta da API.");
    }
  }
  return true; // Retorna true para outras respostas de sucesso que não são JSON
};

export function DashboardSection({ title, icon, actions, empresa }: DashboardSectionProps) {
  const { toast } = useToast()
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  // novos estados para os inputs numéricos
  const [numeroNunota, setNumeroNunota] = useState<number | undefined>()
  // const [numeroNota, setNumeroNota] = useState<number | undefined>()
  // const [dataBaixa, setDataBaixa] = useState<string | undefined>()
  const [integrationData, setIntegrationData] = useState<IntegrationData[] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)

  const handleDownloadPdf = () => {
    if (!integrationData) {
      toast({
        title: "Aviso",
        description: "Não há dados para gerar o PDF.",
        variant: "default"
      });
      return;
    }

    setIsDownloadingPdf(true);

    try {
      const doc = new jsPDF();
      const pdfWidth = doc.internal.pageSize.getWidth();
      
      const getEmpresaName = (cod: string) => {
        if (cod === "31") return "STORYA - RS";
        if (cod === "21") return "OUTBEAUTY - SC";
        return `Código ${cod}`;
      }

      // Cabeçalho principal
      doc.setFontSize(18);
      doc.text("Relatório de Integração de Pedidos", pdfWidth / 2, 22, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Empresa: ${getEmpresaName(empresa)}`, pdfWidth / 2, 30, { align: 'center' });

      let finalY = 30;

      integrationData.forEach(item => {
        // Adiciona um espaço e o título do e-commerce
        finalY += 10;
        doc.setFontSize(12);
        doc.text(`E-commerce: ${item.ecommerce}`, pdfWidth / 2, finalY, { align: 'center' });
        finalY += 3;

        if (item.dados.length > 0) {
          autoTable(doc, {
            head: [["Produto", "Descrição", "Unidade", "Saldo", "Qtd. Solicitada"]],
            body: item.dados.map(d => [
              d.Produto,
              d["Descrição"],
              d.Unidade,
              d["Saldo no E-commerce"],
              d["Qtd. solicitada"]
            ]),
            startY: finalY,
            headStyles: {
              halign: 'center',
              valign: 'middle'
            }
          });
          finalY = (doc as any).lastAutoTable.finalY;
        } else {
          doc.setFontSize(10);
          doc.text("Nenhum dado de produto para este e-commerce.", pdfWidth / 2, finalY, { align: 'center' });
          finalY += 10;
        }
      });

      doc.save('relatorio_integracao.pdf');
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({ title: "Erro", description: "Não foi possível gerar o PDF.", variant: "destructive" });
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  const handleAction = async (action: DashboardAction) => {
    const loadingKey = `${title}-${action.label}`
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }))
    try {
      let method: "GET" | "POST" = "GET"
      let bodyData: object | undefined = undefined

      if (title === "Devoluções de clientes") {
        method = "POST"
        bodyData = { codemp: empresa }
      }    
      if (title === "Reverter importação") {
        method = "POST"
        bodyData = { nunota: numeroNunota ?? null, codemp: empresa }
      }    
      if (title === "Financeiro") {
        method = "POST"
        bodyData = { codemp: empresa }
      }
      if (title === "Pedidos") {
        method = "POST"
        bodyData = { codemp: empresa }
      }    
      if (title === "Produtos") {
        method = "POST"
        bodyData = { codemp: empresa }
      }    
      if (title === "Estoque") {
        method = "POST"
        bodyData = { codemp: empresa }
      }
      
      const result = await apiCall(action.endpoint, method, bodyData)
      
      if (result) {
        toast({
          title: "Sucesso!",
          description: `${action.description} executado com sucesso.`,
          variant: "success"
        })

        if (title === "Pedidos" && action.label === "Integrar") {
          setIntegrationData(result);
          setIsModalOpen(true);
        }

        // Limpar os campos após sucesso no card "Reverter importação"
        if (title === "Reverter importação") {          
          setNumeroNunota(undefined)
        }

      }
    } catch (error) {
      const description = error instanceof Error ? error.message : "Falha ao executar a operação.";
      toast({
        title: "Erro",
        description: description,
        variant: "destructive"
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }))
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">

        {title === "Reverter importação" && (
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Nº único pedido Sankhya"
              value={numeroNunota ?? ""}
              onChange={e => setNumeroNunota(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full"
            />
          </div>
        )}

        {actions.map((action) => {
          const loadingKey = `${title}-${action.label}`
          const isLoading = loadingStates[loadingKey]

          // 🔹 Desabilitar botão se for "Devoluções" e inputs vazios
          const disableButton =
            isLoading ||
            (title === "Reverter importação" && numeroNunota === undefined)||
            (title === "Financeiro" && action.label === "Processar Outros")

          return (
            <Button
              key={action.label}
              variant={action.variant || "default"}
              onClick={() => handleAction(action)}
              disabled={disableButton}
              className="w-full h-11 font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                action.label
              )}
            </Button>
          )
        })}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Relatório de Integração de Pedidos</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {integrationData?.map((item, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-lg mb-2">E-commerce: {item.ecommerce}</h3>
                  {item.dados.length > 0 ? (
                    <div className="border rounded-md overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="p-2 font-medium">Produto</th>
                            <th className="p-2 font-medium">Descrição</th>
                            <th className="p-2 font-medium">Unidade</th>
                            <th className="p-2 font-medium">Saldo</th>
                            <th className="p-2 font-medium">Qtd. Solicitada</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.dados.map((d, i) => (
                            <tr key={i} className="border-t">
                              <td className="p-2">{d.Produto}</td>
                              <td className="p-2">{d["Descrição"]}</td>
                              <td className="p-2">{d.Unidade}</td>
                              <td className="p-2">{d["Saldo no E-commerce"]}</td>
                              <td className="p-2">{d["Qtd. solicitada"]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">Nenhum dado de produto para este e-commerce.</p>
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Fechar</Button>
              <Button onClick={handleDownloadPdf} disabled={isDownloadingPdf}>
                {isDownloadingPdf ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Baixando...
                  </>
                ) : "Baixar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}