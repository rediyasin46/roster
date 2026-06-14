import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MarkbookProvider } from "@/context/MarkbookContext";
import Index from "./pages/Index";
import Home from "./pages/Home";
import GetStarted from "./pages/GetStarted";
import Rank from "./pages/Rank";
import Roster from "./pages/Roster";
import Analysis from "./pages/Analysis";
import Certificate from "./pages/Certificate";
import CertificateDetail from "./pages/CertificateDetail";
import Pricing from "./pages/Pricing";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MarkbookProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/getstarted" element={<GetStarted />} />
            <Route path="/rank" element={<Rank />} />
            <Route path="/roster" element={<Roster />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/certificate" element={<Certificate />} />
            <Route path="/certificate/:id" element={<CertificateDetail />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </MarkbookProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
