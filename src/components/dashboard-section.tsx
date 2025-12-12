import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

const apiCall = async (endpoint: string, method: "GET" | "POST", bodyData?: object): Promise<Boolean> => {
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
  } else {
    return response.ok;
  }
};

export function DashboardSection({ title, icon, actions, empresa }: DashboardSectionProps) {
  const { toast } = useToast()
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  // novos estados para os inputs numéricos
  const [numeroNunota, setNumeroNunota] = useState<number | undefined>()
  const [numeroNota, setNumeroNota] = useState<number | undefined>()
  const [dataBaixa, setDataBaixa] = useState<string | undefined>()

  const handleAction = async (action: DashboardAction) => {
    const loadingKey = `${title}-${action.label}`
    
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }))
    
    try {
      let method: "GET" | "POST" = "GET"
      let bodyData: object | undefined = undefined

      if (title === "Devoluções de clientes") {
        method = "POST"
        bodyData = { numero: numeroNota ?? null, codemp: empresa }
      }    

      if (title === "Reverter importação") {
        method = "POST"
        bodyData = { nunota: numeroNunota ?? null, codemp: empresa }
      }    

      if (title === "Financeiro") {
        method = "POST"
        bodyData = { data: dataBaixa ?? null, codemp: empresa }
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
      
      const result = await apiCall(action.endpoint,method, bodyData)
      
      if (result) {
        toast({
          title: "Sucesso!",
          description: `${action.description} executado com sucesso.`,
          variant: "success"
        })

        // 🔹 Limpar os campos após sucesso no card "Devoluções"
        if (title === "Devoluções de clientes") {          
          setNumeroNota(undefined)
        }

        // 🔹 Limpar os campos após sucesso no card "Reverter importação"
        if (title === "Reverter importação") {          
          setNumeroNunota(undefined)
        }

        // 🔹 Limpar os campos após sucesso no card "FinanceiroReverter importação"
        if (title === "Financeiro") {          
          setDataBaixa(undefined)
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

        {title === "Devoluções de clientes" && (
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Nº Nota de Devolução"
              value={numeroNota ?? ""}
              onChange={e => setNumeroNota(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full"
            />
          </div>
        )}

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

        {title === "Financeiro" && (
          <div className="flex gap-2">
            <Input
              type="date"
              placeholder="Data"
              value={dataBaixa ?? ""}
              onChange={e => setDataBaixa(e.target.value ? String(e.target.value) : undefined)}
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
            (title === "Devoluções de clientes" && numeroNota === undefined)||
            (title === "Reverter importação" && numeroNunota === undefined)||
            (title === "Financeiro" && dataBaixa === undefined)

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
      </CardContent>
    </Card>
  )
}