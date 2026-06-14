import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { PaymentDialog } from "@/components/PaymentDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Check, Lock, Sparkles, Users, Star, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

type Plan = {
  name: string;
  tagline: string;
  price: number;
  limit: string;
  features: { label: string; included: boolean }[];
  cta: string;
  popular?: boolean;
  contactSales?: boolean;
};

const teacherPlans: Plan[] = [
  {
    name: "Starter",
    tagline: "Free",
    price: 0,
    limit: "Up to 30 students",
    cta: "Get Started",
    features: [
      { label: "Basic mark entry", included: true },
      { label: "Student ranking", included: true },
      { label: "Simple report cards", included: true },
      { label: "Certificate generation", included: false },
      { label: "Custom branding", included: false },
      { label: "Bulk export & analytics", included: false },
    ],
  },
  {
    name: "Growth",
    tagline: "Basic",
    price: 50,
    limit: "Up to 80 students",
    cta: "Choose Growth",
    popular: true,
    features: [
      { label: "Everything in Starter", included: true },
      { label: "Certificate generation", included: true },
      { label: "Custom branding on report cards", included: true },
      { label: "Email support", included: true },
      { label: "Bulk export", included: false },
      { label: "Advanced analytics", included: false },
    ],
  },
  {
    name: "Professional",
    tagline: "Pro",
    price: 100,
    limit: "Up to 150 students",
    cta: "Choose Pro",
    features: [
      { label: "Everything in Growth", included: true },
      { label: "Bulk export to Excel/PDF", included: true },
      { label: "Multiple class management", included: true },
      { label: "Priority support", included: true },
      { label: "Custom certificate templates", included: false },
    ],
  },
  {
    name: "Premium",
    tagline: "Best Value",
    price: 200,
    limit: "Up to 300 students",
    cta: "Go Premium",
    features: [
      { label: "Everything in Professional", included: true },
      { label: "Advanced analytics dashboard", included: true },
      { label: "Custom certificate templates", included: true },
      { label: "PDF batch generation", included: true },
      { label: "Dedicated account manager", included: true },
    ],
  },
];

const schoolPlans: Plan[] = [
  {
    name: "Small School",
    tagline: "Up to 5 teachers",
    price: 500,
    limit: "Up to 500 students",
    cta: "Start School Plan",
    features: [
      { label: "5 teacher accounts", included: true },
      { label: "Centralized administration", included: true },
      { label: "All Growth features", included: true },
      { label: "School-wide ranking", included: true },
    ],
  },
  {
    name: "Medium School",
    tagline: "Most schools choose this",
    price: 1200,
    limit: "Up to 1,500 students",
    cta: "Start School Plan",
    popular: true,
    features: [
      { label: "15 teacher accounts", included: true },
      { label: "Admin controls & roles", included: true },
      { label: "School-wide analytics dashboard", included: true },
      { label: "All Professional features", included: true },
      { label: "Priority email & chat support", included: true },
    ],
  },
  {
    name: "Large School",
    tagline: "Enterprise",
    price: 0,
    limit: "Unlimited students & teachers",
    cta: "Contact Sales",
    contactSales: true,
    features: [
      { label: "Unlimited teacher accounts", included: true },
      { label: "Custom onboarding & training", included: true },
      { label: "Dedicated success manager", included: true },
      { label: "Custom integrations & SSO", included: true },
      { label: "SLA & priority phone support", included: true },
    ],
  },
];

const faqs = [
  {
    q: "Can I upgrade or downgrade anytime?",
    a: "Yes. You can change your plan from your account at any time. Upgrades take effect immediately, and downgrades apply at the end of your current billing cycle.",
  },
  {
    q: "What happens if I exceed my student limit?",
    a: "You'll receive a notification when you approach your limit. You can continue viewing existing students, but adding new ones requires upgrading to a higher tier.",
  },
  {
    q: "Is payment in Ethiopian Birr (ETB) only?",
    a: "Yes. All plans are billed in ETB through Chapa, which supports telebirr, CBE, Awash, and major Ethiopian banks and cards.",
  },
  {
    q: "Do you offer discounts for annual billing?",
    a: "Annual billing offers up to 2 months free. Contact us for school-level annual pricing.",
  },
  {
    q: "Is my student data secure?",
    a: "Absolutely. All data is encrypted in transit and at rest, and stored securely in the cloud with role-based access control.",
  },
];

function PlanCard({ plan, onSelect }: { plan: Plan; onSelect: (plan: Plan) => void }) {
  const handleCtaClick = () => {
    onSelect(plan);
  };

  return (
    <Card
      className={cn(
        "relative p-6 flex flex-col rounded-2xl border transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-2xl",
        plan.popular
          ? "border-accent border-2 shadow-xl bg-gradient-to-br from-primary/5 via-background to-accent/10"
          : "shadow-md bg-card",
      )}
    >
      {plan.popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground hover:bg-accent gap-1 px-3 py-1 shadow-md">
          <Star className="w-3 h-3 fill-current" /> Most Popular
        </Badge>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
          {plan.tagline}
        </p>
      </div>

      <div className="mb-4">
        {plan.contactSales ? (
          <div className="text-3xl font-extrabold text-primary">Custom</div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-primary tracking-tight">
              {plan.price}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              ETB/month
            </span>
          </div>
        )}
      </div>

      <div className="inline-flex items-center gap-2 self-start rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground mb-5">
        <Users className="w-3.5 h-3.5" />
        {plan.limit}
      </div>

      <ul className="space-y-2.5 mb-6 flex-1">
        {plan.features.map((f, i) => (
          <li
            key={i}
            className={cn(
              "flex items-start gap-2 text-sm",
              !f.included && "text-muted-foreground/70",
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-0.5",
                f.included
                  ? "bg-success/15 text-success"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {f.included ? (
                <Check className="w-3 h-3" strokeWidth={3} />
              ) : (
                <Lock className="w-3 h-3" />
              )}
            </span>
            <span>{f.label}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={handleCtaClick}
        className={cn(
          "w-full font-semibold",
          plan.popular
            ? "bg-accent text-accent-foreground hover:bg-accent/90"
            : plan.contactSales
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "",
        )}
        variant={plan.popular || plan.contactSales ? "default" : "outline"}
      >
        {plan.contactSales && <Phone className="w-4 h-4" />}
        {plan.cta}
      </Button>
    </Card>
  );
}

const Pricing = () => {
  const [tab, setTab] = useState("teachers");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const handlePlanSelect = (plan: Plan) => {
    if (plan.price > 0) {
      setSelectedPlan(plan);
      setPaymentDialogOpen(true);
    } else {
      // Free plan - navigate to signup
      window.location.href = "/getstarted?mode=signup";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 p-4">
      <AppHeader />

      <main className="max-w-6xl mx-auto pb-16 mt-8">
        {/* Heading */}
        <div className="text-center mb-10">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-0 mb-4 gap-1">
            <Sparkles className="w-3 h-3" /> Simple, transparent pricing
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-3">
            Choose Your Plan
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            All prices in <span className="font-semibold text-foreground">Ethiopian Birr (ETB)</span>,
            billed monthly. Cancel or change plans anytime.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="h-12 p-1 rounded-full bg-muted">
              <TabsTrigger
                value="teachers"
                className="rounded-full px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                For Teachers
              </TabsTrigger>
              <TabsTrigger
                value="schools"
                className="rounded-full px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                For Schools
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="teachers">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 pt-4">
              {teacherPlans.map((p) => (
                <PlanCard key={p.name} plan={p} onSelect={handlePlanSelect} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schools">
            <p className="text-center text-sm text-muted-foreground max-w-2xl mx-auto mb-6">
              School-level plans cover multiple teachers and classes with
              centralized administration, role-based access, and school-wide
              analytics.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-4">
              {schoolPlans.map((p) => (
                <PlanCard key={p.name} plan={p} onSelect={handlePlanSelect} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Payment note */}
        <div className="text-center mt-10 text-sm text-muted-foreground">
          Secure payment via <span className="font-semibold text-foreground">Chapa</span> —
          telebirr, CBE, Awash & all major Ethiopian banks supported.
        </div>

        {/* FAQ */}
        <section className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-2">
            Frequently Asked Questions
          </h3>
          <p className="text-center text-muted-foreground mb-8">
            Everything you need to know about ScoreBook pricing.
          </p>
          <Card className="p-2 md:p-4 rounded-2xl shadow-sm">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="px-3">
                  <AccordionTrigger className="text-left font-semibold">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </section>
      </main>

      {selectedPlan && (
        <PaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          plan={{
            name: selectedPlan.name,
            price: selectedPlan.price,
          }}
        />
      )}
    </div>
  );
};

export default Pricing;
