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

const stats = [
  { icon: Users, label: "Free for up to 30 Students" },
  { icon: Award, label: "Instant Certificate Generation" },
  { icon: Trophy, label: "Automatic Class Ranking" },
  { icon: GraduationCap, label: "Built for Ethiopian Schools" },
];

const features = [
  { icon: FileSpreadsheet, title: "Easy Mark Entry", desc: "Excel-like inline editing with smart navigation. Enter marks fast, without modals." },
  { icon: Trophy, title: "Automatic Ranking & Grading", desc: "Rankings and grade letters update instantly as you enter scores." },
  { icon: Award, title: "Certificates & Report Cards", desc: "Generate professional, print-ready report cards and certificates in one click." },
  { icon: Layers, title: "Flexible Subscription Plans", desc: "Free for small classes. Affordable monthly plans in Ethiopian Birr." },
  { icon: Cloud, title: "Cloud-Based Access", desc: "Your data is safely stored in the cloud. Access from any device, anywhere." },
  { icon: GraduationCap, title: "Ethiopian Curriculum Ready", desc: "Designed around real Ethiopian school reporting needs and standards." },
];

const steps = [
  { n: 1, title: "Sign Up", desc: "Create your free account in seconds." },
  { n: 2, title: "Enter Marks", desc: "Add students and scores in a familiar spreadsheet view." },
  { n: 3, title: "Generate Reports", desc: "Download rankings, report cards, and certificates instantly." },
];

const pricingPreview = [
  { name: "Starter", price: "0", limit: "30 students", highlights: ["Mark entry", "Ranking"] },
  { name: "Growth", price: "50", limit: "80 students", highlights: ["Certificates", "Branding"], popular: true },
  { name: "Pro", price: "100", limit: "150 students", highlights: ["Bulk export", "Priority support"] },
  { name: "Premium", price: "200", limit: "300 students", highlights: ["Analytics", "Custom templates"] },
];

const testimonials = [
  { name: "Tigist Alemu", school: "Addis Ababa Model School", quote: "ScoreBook saved me 10+ hours every term. Report cards are now a 5-minute job.", rating: 5 },
  { name: "Dawit Bekele", school: "Hawassa Primary School", quote: "The automatic ranking is incredibly accurate. My students love getting their certificates on time.", rating: 5 },
  { name: "Hanna Tesfaye", school: "Bahir Dar Academy", quote: "Finally a tool built for Ethiopian teachers. Payment in Birr makes everything simple.", rating: 5 },
];

const Home = () => {
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
              <Sparkles className="w-3 h-3" /> Built for Ethiopian Teachers
            </Badge>
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6 animate-text-slide">
                Simplify Mark Entry:-
              </h2>
              <div className="overflow-hidden w-full bg-gradient-to-r from-transparent via-primary-foreground to-transparent py-4">
                <div className="flex gap-8 animate-marquee">
                  <span className="text-2xl md:text-3xl font-bold text-accent whitespace-nowrap flex-shrink-0">Ranking, Roster, Analysis and Certificate Generation.</span>
                  <span className="text-2xl md:text-3xl font-bold text-accent whitespace-nowrap flex-shrink-0">Ranking, Roster, Analysis and Certificate Generation.</span>
                  <span className="text-2xl md:text-3xl font-bold text-accent whitespace-nowrap flex-shrink-0">Ranking, Roster, Analysis and Certificate Generation.</span>
                </div>
              </div>
            </div>
            <p className="text-base md:text-lg opacity-90 mb-8 max-w-xl">
              ScoreBook saves teachers hours of manual report card work — record marks, rank students, and print certificates in minutes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold shadow-lg hover:scale-105 transition-transform">
                <Link to="/getstarted?mode=signup">Get Started Free <ArrowRight className="w-4 h-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-2 border-white bg-transparent text-white hover:bg-white hover:text-primary font-semibold">
                <Link to="/getstarted?mode=signin">Sign In</Link>
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
                  <div className="ml-2 text-xs text-muted-foreground">ScoreBook · Grade 8A</div>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-1 text-[10px] font-bold bg-[hsl(var(--table-header))] text-[hsl(var(--table-header-foreground))] p-1.5 rounded">
                    <div>RN</div><div className="col-span-2">Name</div><div>Avg</div><div>Rank</div>
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
          {stats.map(({ icon: Icon, label }, i) => (
            <Card key={i} className="p-4 flex items-center gap-3 rounded-2xl shadow-lg hover:-translate-y-1 transition-transform">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold">{label}</span>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-0 mb-3">Features</Badge>
          <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Everything You Need to Manage Student Performance
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From mark entry to printed certificates — ScoreBook handles the full workflow.
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
            <Badge className="bg-accent/20 text-accent-foreground hover:bg-accent/20 border-0 mb-3">How It Works</Badge>
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">Three Simple Steps</h3>
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
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-0 mb-3">Pricing</Badge>
          <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Plans for Every Classroom</h3>
          <p className="text-muted-foreground">Pay in Ethiopian Birr. Cancel anytime.</p>
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
            <Link to="/pricing">View Full Pricing <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/40 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="bg-accent/20 text-accent-foreground hover:bg-accent/20 border-0 mb-3">Testimonials</Badge>
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">Loved by Ethiopian Teachers</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} className="p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow">
                <div className="flex gap-0.5 mb-3 text-accent">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm mb-4 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.school}</div>
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
              Start Saving Time on Report Cards Today
            </h3>
            <p className="text-primary-foreground/90 mb-8 max-w-xl mx-auto">
              Join Ethiopian teachers using ScoreBook to grade smarter, not harder.
            </p>
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-bold text-base px-8 shadow-xl hover:scale-105 transition-transform">
              <Link to="/getstarted?mode=signup">Get Started Free <ArrowRight className="w-5 h-5" /></Link>
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
              <span className="font-extrabold text-lg">ScoreBook</span>
            </div>
            <p className="text-sm opacity-70">Simplifying student performance management for Ethiopian teachers.</p>
          </div>
          <div>
            <h5 className="font-bold mb-3">Product</h5>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/home" className="hover:text-accent">Home</Link></li>
              <li><Link to="/pricing" className="hover:text-accent">Pricing</Link></li>
              <li><Link to="/" className="hover:text-accent">Assessments</Link></li>
              <li><Link to="/certificate" className="hover:text-accent">Certificates</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-3">Company</h5>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a className="hover:text-accent" href="#">About</a></li>
              <li><a className="hover:text-accent" href="#">Contact</a></li>
              <li><a className="hover:text-accent" href="#">Privacy</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-3">Follow</h5>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-background/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-background/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-background/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"><Linkedin className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-background/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"><Mail className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-background/10 text-sm opacity-60 text-center">
          © {new Date().getFullYear()} ScoreBook. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
