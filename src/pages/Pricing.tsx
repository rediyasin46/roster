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
import { useLanguage } from "@/context/LanguageContext";

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

function PlanCard({ plan, onSelect }: { plan: Plan; onSelect: (plan: Plan) => void }) {
  const { t } = useLanguage();
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
          <Star className="w-3 h-3 fill-current" /> {t('pricing.popular')}
        </Badge>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{plan.tagline}</p>
      </div>

      <div className="mb-4">
        {plan.contactSales ? (
          <div className="text-3xl font-extrabold text-primary">{t('pricing.custom')}</div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-primary tracking-tight">{plan.price}</span>
            <span className="text-sm font-medium text-muted-foreground"> {t('pricing.perMonth')}</span>
          </div>
        )}
      </div>

      <div className="inline-flex items-center gap-2 self-start rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground mb-5">
        <Users className="w-3.5 h-3.5" />
        {plan.limit}
      </div>

      <ul className="space-y-2.5 mb-6 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className={cn("flex items-start gap-2 text-sm", !f.included && "text-muted-foreground/70")}>
            <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-0.5",
              f.included ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
              {f.included ? <Check className="w-3 h-3" strokeWidth={3} /> : <Lock className="w-3 h-3" />}
            </span>
            <span>{f.label}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={() => onSelect(plan)}
        className={cn("w-full font-semibold",
          plan.popular ? "bg-accent text-accent-foreground hover:bg-accent/90"
            : plan.contactSales ? "bg-primary text-primary-foreground hover:bg-primary/90" : "")}
        variant={plan.popular || plan.contactSales ? "default" : "outline"}
      >
        {plan.contactSales && <Phone className="w-4 h-4 mr-2" />}
        {plan.cta}
      </Button>
    </Card>
  );
}

const Pricing = () => {
  const [tab, setTab] = useState("teachers");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const { t, tRaw } = useLanguage();

  // Build plans from i18n
  const included = (label: string) => ({ label, included: true });
  const excluded = (label: string) => ({ label, included: false });

  const teacherPlans: Plan[] = [
    {
      name: t('pricing.plans.starter.name'),
      tagline: t('pricing.plans.starter.tagline'),
      price: 0,
      limit: t('pricing.plans.starter.limit'),
      cta: t('pricing.plans.starter.cta'),
      features: tRaw<string[]>('pricing.plans.starter.features').map((f, i) =>
        i < 3 ? included(f) : excluded(f)),
    },
    {
      name: t('pricing.plans.growth.name'),
      tagline: t('pricing.plans.growth.tagline'),
      price: 50,
      limit: t('pricing.plans.growth.limit'),
      cta: t('pricing.plans.growth.cta'),
      popular: true,
      features: tRaw<string[]>('pricing.plans.growth.features').map((f, i) =>
        i < 4 ? included(f) : excluded(f)),
    },
    {
      name: t('pricing.plans.professional.name'),
      tagline: t('pricing.plans.professional.tagline'),
      price: 100,
      limit: t('pricing.plans.professional.limit'),
      cta: t('pricing.plans.professional.cta'),
      features: tRaw<string[]>('pricing.plans.professional.features').map((f, i) =>
        i < 4 ? included(f) : excluded(f)),
    },
    {
      name: t('pricing.plans.premium.name'),
      tagline: t('pricing.plans.premium.tagline'),
      price: 200,
      limit: t('pricing.plans.premium.limit'),
      cta: t('pricing.plans.premium.cta'),
      features: tRaw<string[]>('pricing.plans.premium.features').map(f => included(f)),
    },
  ];

  const schoolPlans: Plan[] = [
    {
      name: t('pricing.plans.smallSchool.name'),
      tagline: t('pricing.plans.smallSchool.tagline'),
      price: 500,
      limit: t('pricing.plans.smallSchool.limit'),
      cta: t('pricing.plans.smallSchool.cta'),
      features: tRaw<string[]>('pricing.plans.smallSchool.features').map(f => included(f)),
    },
    {
      name: t('pricing.plans.mediumSchool.name'),
      tagline: t('pricing.plans.mediumSchool.tagline'),
      price: 1200,
      limit: t('pricing.plans.mediumSchool.limit'),
      cta: t('pricing.plans.mediumSchool.cta'),
      popular: true,
      features: tRaw<string[]>('pricing.plans.mediumSchool.features').map(f => included(f)),
    },
    {
      name: t('pricing.plans.largeSchool.name'),
      tagline: t('pricing.plans.largeSchool.tagline'),
      price: 0,
      limit: t('pricing.plans.largeSchool.limit'),
      cta: t('pricing.plans.largeSchool.cta'),
      contactSales: true,
      features: tRaw<string[]>('pricing.plans.largeSchool.features').map(f => included(f)),
    },
  ];

  const faqs = tRaw<{ q: string; a: string }[]>('pricing.faq');

  const handlePlanSelect = (plan: Plan) => {
    if (plan.price > 0) {
      setSelectedPlan(plan);
      setPaymentDialogOpen(true);
    } else {
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
            <Sparkles className="w-3 h-3" /> {t('pricing.badge')}
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-3">
            {t('pricing.pageTitle')}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('pricing.pageDesc')}
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="h-12 p-1 rounded-full bg-muted">
              <TabsTrigger value="teachers" className="rounded-full px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {t('pricing.forTeachers')}
              </TabsTrigger>
              <TabsTrigger value="schools" className="rounded-full px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {t('pricing.forSchools')}
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
              {t('pricing.schoolDesc')}
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
          {t('pricing.paymentNote')}
        </div>

        {/* FAQ */}
        <section className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-2">{t('pricing.faqTitle')}</h3>
          <p className="text-center text-muted-foreground mb-8">{t('pricing.faqDesc')}</p>
          <Card className="p-2 md:p-4 rounded-2xl shadow-sm">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="px-3">
                  <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
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
          plan={{ name: selectedPlan.name, price: selectedPlan.price }}
        />
      )}
    </div>
  );
};

export default Pricing;
