import { DashboardSection } from "@/components/dashboard-section"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  Package, 
  ShoppingCart, 
  ClipboardList, 
  FileText,
  Settings
} from "lucide-react"

const Index = () => {
  const dashboardSections = [
    {
      title: "Estoque",
      icon: <Package className="h-5 w-5" />,
      actions: [
        { label: "Integrar", description: "Integrar estoque", variant: "default" as const, endpoint: "/estoque/integrar" }
      ]
    },
    {
      title: "Produtos",
      icon: <ShoppingCart className="h-5 w-5" />,
      actions: [
        { label: "Buscar", description: "Buscar produtos", variant: "secondary" as const, endpoint: "/produtos/buscar" },
        { label: "Integrar", description: "Integrar produtos", variant: "default" as const, endpoint: "/produtos/integrar" }
      ]
    },
    {
      title: "Pedidos",
      icon: <ClipboardList className="h-5 w-5" />,
      actions: [
        { label: "Buscar", description: "Buscar pedidos", variant: "secondary" as const, endpoint: "/pedidos/buscar" },
        { label: "Integrar", description: "Integrar pedidos", variant: "default" as const, endpoint: "/pedidos/integrar" },
        { label: "Faturar", description: "Faturar pedidos", variant: "accent" as const, endpoint: "/pedidos/faturar" }
      ]
    },
    {
      title: "Notas",
      icon: <FileText className="h-5 w-5" />,
      actions: [
        { label: "Integrar", description: "Integrar notas fiscais", variant: "default" as const, endpoint: "/notas/integrar" },
        { label: "Emitir", description: "Emitir notas fiscais", variant: "accent" as const, endpoint: "/notas/emitir" },
        { label: "Confirmar", description: "Confirmar notas fiscais", variant: "success" as const, endpoint: "/notas/confirmar" }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">Integrador Olist</h1>
              <h1 className="text-l text-foreground self-end">/Painel de Controle</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardSections.map((section) => (
            <DashboardSection
              key={section.title}
              title={section.title}
              icon={section.icon}
              actions={section.actions}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
