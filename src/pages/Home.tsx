import { Link } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Award,
  Trophy,
  Cloud,
  FileSpreadsheet,
  Layers,
  Users,
  Sparkles,
  Star,
  ArrowRight,
  CheckCircle2,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

const highlightIcons = [Users, Award, Trophy, GraduationCap];

const featureIcons = [FileSpreadsheet, Trophy, Award, Layers, Cloud, GraduationCap];

const Home = () => {
  const { t, tRaw } = useLanguage();

  const highlights = [
    t('highlights.freeStudents'),
    t('highlights.certificates'),
    t('highlights.ranking'),
    t('highlights.ethiopian'),
  ];

  const features = [
    { icon: FileSpreadsheet, title: t('features.markEntry.title'),    desc: t('features.markEntry.desc') },
    { icon: Trophy,          title: t('features.ranking.title'),      desc: t('features.ranking.desc') },
    { icon: Award,           title: t('features.certificates.title'), desc: t('features.certificates.desc') },
    { icon: Layers,          title: t('features.plans.title'),        desc: t('features.plans.desc') },
    { icon: Cloud,           title: t('features.cloud.title'),        desc: t('features.cloud.desc') },
    { icon: GraduationCap,   title: t('features.curriculum.title'),   desc: t('features.curriculum.desc') },
  ];

  const steps = [
    { n: 1, title: t('howItWorks.step1.title'), desc: t('howItWorks.step1.desc') },
    { n: 2, title: t('howItWorks.step2.title'), desc: t('howItWorks.step2.desc') },
    { n: 3, title: t('howItWorks.step3.title'), desc: t('howItWorks.step3.desc') },
  ];

  const pricingPreview = [
    { name: t('pricing.plans.starter.name'),      price: '0',   limit: t('pricing.plans.starter.limit'),      highlights: [t('assessments.addStudent'), t('rank.pageTitle')] },
    { name: t('pricing.plans.growth.name'),       price: '50',  limit: t('pricing.plans.growth.limit'),       highlights: [t('nav.certificate'), t('features.plans.title')], popular: true },
    { name: t('pricing.plans.professional.name'), price: '100', limit: t('pricing.plans.professional.limit'), highlights: [t('assessments.exportExcel'), t('rank.pageTitle')] },
    { name: t('pricing.plans.premium.name'),      price: '200', limit: t('pricing.plans.premium.limit'),      highlights: [t('nav.analysis'), t('features.certificates.title')] },
  ];

  const testimonials = tRaw<{ name: string; school: string; quote: string }[]>('testimonials.items');

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-[hsl(210,100%,30%)]" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%)]" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col gap-10">
          <div className="text-primary-foreground animate-fade-in">
            <Badge className="bg-accent text-accent-foreground hover:bg-accent mb-4 gap-1">
              <Sparkles className="w-3 h-3" /> {t('hero.badge')}
            </Badge>
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6 animate-text-slide">
                {t('hero.headline')}
              </h2>
              <div className="overflow-hidden w-full bg-gradient-to-r from-transparent via-primary-foreground to-transparent py-4">
                <div className="flex gap-8 animate-marquee">
                  <span className="text-2xl md:text-3xl font-bold text-accent whitespace-nowrap flex-shrink-0">{t('hero.marquee')}</span>
                  <span className="text-2xl md:text-3xl font-bold text-accent whitespace-nowrap flex-shrink-0">{t('hero.marquee')}</span>
                  <span className="text-2xl md:text-3xl font-bold text-accent whitespace-nowrap flex-shrink-0">{t('hero.marquee')}</span>
                </div>
              </div>
            </div>
            <p className="text-base md:text-lg opacity-90 mb-8 max-w-xl">
              {t('hero.description')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold shadow-lg hover:scale-105 transition-transform">
                <Link to="/getstarted?mode=signup">{t('hero.ctaPrimary')} <ArrowRight className="w-4 h-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-2 border-white bg-transparent text-white hover:bg-white hover:text-primary font-semibold">
                <Link to="/getstarted?mode=signin">{t('hero.ctaSecondary')}</Link>
              </Button>
            </div>
          </div>
          <div className="relative animate-slide-left w-full">
            <div className="relative rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl p-4 rotate-1 hover:rotate-0 transition-transform">
              <div className="rounded-lg bg-card p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <div className="ml-2 text-xs text-muted-foreground">{t('demoTable.label')}</div>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-1 text-[10px] font-bold bg-[hsl(var(--table-header))] text-[hsl(var(--table-header-foreground))] p-1.5 rounded">
                    <div>{t('demoTable.rn')}</div><div className="col-span-2">{t('demoTable.name')}</div><div>{t('demoTable.avg')}</div><div>{t('demoTable.rank')}</div>
                  </div>
                  {[
                    ["1", "Abebe T.", "92", "1"],
                    ["2", "Marta G.", "88", "2"],
                    ["3", "Kebede A.", "85", "3"],
                    ["4", "Sara M.", "81", "4"],
                  ].map((r, i) => (
                    <div key={i} className={cn("grid grid-cols-5 gap-1 text-xs p-1.5 rounded", i % 2 ? "bg-[hsl(var(--table-row-alt))]" : "")}>
                      <div>{r[0]}</div><div className="col-span-2 font-medium">{r[1]}</div><div className="text-primary font-semibold">{r[2]}</div><div className="text-accent-foreground font-bold">{r[3]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Trust */}
      <section className="max-w-7xl mx-auto px-6 -mt-8 md:-mt-12 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {highlightIcons.map((Icon, i) => (
            <Card key={i} className="p-4 flex items-center gap-3 rounded-2xl shadow-lg hover:-translate-y-1 transition-transform">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold">{highlights[i]}</span>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-0 mb-3">{t('features.sectionBadge')}</Badge>
          <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            {t('features.sectionTitle')}
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('features.sectionDesc')}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <Card key={i} className="p-6 rounded-2xl hover:-translate-y-1 hover:shadow-xl transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[hsl(210,100%,40%)] text-primary-foreground mb-4 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-lg mb-2">{title}</h4>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/40 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="bg-accent/20 text-accent-foreground hover:bg-accent/20 border-0 mb-3">{t('howItWorks.sectionBadge')}</Badge>
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t('howItWorks.sectionTitle')}</h3>
          </div>
          <div className="relative grid md:grid-cols-3 gap-8">
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary via-accent to-primary" />
            {steps.map((s) => (
              <div key={s.n} className="relative text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-[hsl(210,100%,40%)] text-primary-foreground flex items-center justify-center text-2xl font-extrabold shadow-lg ring-4 ring-background mb-4">
                  {s.n}
                </div>
                <h4 className="font-bold text-lg mb-1">{s.title}</h4>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-0 mb-3">{t('pricing.sectionBadge')}</Badge>
          <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">{t('pricing.sectionTitle')}</h3>
          <p className="text-muted-foreground">{t('pricing.sectionDesc')}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pricingPreview.map((p) => (
            <Card key={p.name} className={cn(
              "p-5 rounded-2xl text-center transition-all hover:-translate-y-1",
              p.popular ? "border-2 border-accent shadow-xl bg-gradient-to-br from-primary/5 to-accent/10" : "shadow-md"
            )}>
              {p.popular && <Badge className="bg-accent text-accent-foreground mb-2"><Star className="w-3 h-3 fill-current mr-1" />Popular</Badge>}
              <h4 className="font-bold text-lg">{p.name}</h4>
              <div className="my-3">
                <span className="text-3xl font-extrabold text-primary">{p.price}</span>
                <span className="text-sm text-muted-foreground"> ETB/mo</span>
              </div>
              <div className="text-xs text-muted-foreground mb-3">{p.limit}</div>
              <ul className="text-sm space-y-1 mb-4">
                {p.highlights.map((h) => (
                  <li key={h} className="flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />{h}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button asChild size="lg" variant="outline" className="rounded-full font-semibold">
            <Link to="/pricing">{t('pricing.viewFull')} <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/40 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="bg-accent/20 text-accent-foreground hover:bg-accent/20 border-0 mb-3">{t('testimonials.sectionBadge')}</Badge>
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t('testimonials.sectionTitle')}</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t_item, i) => (
              <Card key={i} className="p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow">
                <div className="flex gap-0.5 mb-3 text-accent">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm mb-4 italic">"{t_item.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                    {t_item.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t_item.name}</div>
                    <div className="text-xs text-muted-foreground">{t_item.school}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[hsl(200,100%,38%)] to-[hsl(210,100%,30%)] p-10 md:p-16 text-center shadow-2xl">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_30%,white,transparent_50%)]" />
          <div className="relative">
            <h3 className="text-3xl md:text-5xl font-extrabold text-primary-foreground mb-4 tracking-tight">
              {t('cta.title')}
            </h3>
            <p className="text-primary-foreground/90 mb-8 max-w-xl mx-auto">
              {t('cta.desc')}
            </p>
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-bold text-base px-8 shadow-xl hover:scale-105 transition-transform">
              <Link to="/getstarted?mode=signup">{t('cta.button')} <ArrowRight className="w-5 h-5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-6 h-6 text-accent" />
              <span className="font-extrabold text-lg">{t('brand.name')}</span>
            </div>
            <p className="text-sm opacity-70">{t('footer.desc')}</p>
          </div>
          <div>
            <h5 className="font-bold mb-3">{t('footer.product')}</h5>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/" className="hover:text-accent">{t('footer.links.home')}</Link></li>
              <li><Link to="/pricing" className="hover:text-accent">{t('footer.links.pricing')}</Link></li>
              <li><Link to="/assessments" className="hover:text-accent">{t('footer.links.assessments')}</Link></li>
              <li><Link to="/certificate" className="hover:text-accent">{t('footer.links.certificates')}</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-3">{t('footer.company')}</h5>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a className="hover:text-accent" href="#">{t('footer.links.about')}</a></li>
              <li><a className="hover:text-accent" href="#">{t('footer.links.contact')}</a></li>
              <li><a className="hover:text-accent" href="#">{t('footer.links.privacy')}</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-3">{t('footer.follow')}</h5>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-background/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-background/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-background/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"><Linkedin className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-background/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"><Mail className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-background/10 text-sm opacity-60 text-center space-y-1">
          <p>{t('brand.copyright')}</p>
          <p>{t('brand.developer')}</p>
          <p>Phone: 0923766115</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
