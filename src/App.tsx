import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import Dentistas from "./pages/Dentistas";
import Consultas from "./pages/Consultas";
import Horarios from "./pages/Horarios";
import Procedimentos from "./pages/Procedimentos";
import Financeiro from "./pages/Financeiro";
import Prontuario from "./pages/Prontuario";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pacientes" element={<Pacientes />} />
            <Route path="/dentistas" element={<Dentistas />} />
            <Route path="/consultas" element={<Consultas />} />
            <Route path="/horarios" element={<Horarios />} />
            <Route path="/procedimentos" element={<Procedimentos />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/prontuario" element={<Prontuario />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
