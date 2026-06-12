import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";

const Certificate = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <header className="markbook-header mb-4 flex items-center justify-between">
        <h1>Certificate</h1>
        <Navigation />
      </header>
      <main className="max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Certificate Generation</h2>
          <p className="text-muted-foreground">Coming soon — generate student certificates here.</p>
        </Card>
      </main>
    </div>
  );
};

export default Certificate;
