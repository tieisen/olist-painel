import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
}

const apiCall = async (endpoint: string): Promise<Boolean> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`);
  console.log("Resposta da API:", response);
  if (!response.ok) {
    // Lança um erro para ser capturado pelo bloco catch em handleAction
    const errorData = await response.text();
    throw new Error(`Erro na API: ${response.status} ${response.statusText} - ${errorData}`);
  } else {
    return response.ok;
  }
};

export function DashboardSection({ title, icon, actions }: DashboardSectionProps) {
  const { toast } = useToast()
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const handleAction = async (action: DashboardAction) => {
    const loadingKey = `${title}-${action.label}`
    
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }))
    
    try {
      const result = await apiCall(action.endpoint)
      
      if (result) {
        toast({
          title: "Sucesso!",
          description: `${action.description} executado com sucesso.`,
          variant: "success"
        })
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
        {actions.map((action) => {
          const loadingKey = `${title}-${action.label}`
          const isLoading = loadingStates[loadingKey]
          
          return (
            <Button
              key={action.label}
              variant={action.variant || "default"}
              onClick={() => handleAction(action)}
              disabled={isLoading}
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