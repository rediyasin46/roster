import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <header className="markbook-header mb-4 flex items-center justify-between">
        <h1>Pricing</h1>
        <Navigation />
      </header>

      <main className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2">
        <Card className="p-6 flex flex-col">
          <h2 className="text-2xl font-bold mb-2">Free</h2>
          <p className="text-muted-foreground mb-4">Try it out</p>
          <div className="text-4xl font-bold mb-4">0 ETB</div>
          <ul className="space-y-2 mb-6 flex-1">
            <li className="flex gap-2"><Check className="w-5 h-5 text-success" /> Up to 10 students</li>
            <li className="flex gap-2"><Check className="w-5 h-5 text-success" /> Up to 5 subjects</li>
            <li className="flex gap-2"><Check className="w-5 h-5 text-success" /> Rank calculation</li>
          </ul>
          <Button variant="outline">Current plan</Button>
        </Card>

        <Card className="p-6 flex flex-col border-primary border-2">
          <h2 className="text-2xl font-bold mb-2">Premium</h2>
          <p className="text-muted-foreground mb-4">Unlock everything</p>
          <div className="text-4xl font-bold mb-4">50 ETB</div>
          <ul className="space-y-2 mb-6 flex-1">
            <li className="flex gap-2"><Check className="w-5 h-5 text-success" /> Unlimited students</li>
            <li className="flex gap-2"><Check className="w-5 h-5 text-success" /> Unlimited subjects</li>
            <li className="flex gap-2"><Check className="w-5 h-5 text-success" /> Certificate generation</li>
            <li className="flex gap-2"><Check className="w-5 h-5 text-success" /> Export & reports</li>
          </ul>
          <Button>Pay with Chapa</Button>
        </Card>
      </main>
    </div>
  );
};

export default Pricing;
