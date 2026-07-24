import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/StatusBadge";

export function Landing() {
  return (
    <div className="min-h-screen bg-bg text-fg p-8 space-y-12">
      {/* 🌗 Navigation / Header */}
      <Header></Header>

      {/* 🚀 Staggered Hero Section */}
      <section className="max-w-4xl mx-auto text-center space-y-4">
        <div className="rise-1 inline-block px-3 py-1 text-xs font-semibold rounded-full text-ok bg-ok-tint">
          System Ready 🟢
        </div>

        <h1 className="rise-2 text-4xl sm:text-5xl font-display font-bold">
          Crafting <span className="overshoot">Beautiful</span> Interfaces
        </h1>

        <p className="rise-3 text-muted text-lg max-w-2xl mx-auto">
          A showcase of our token-driven design primitives, theme switching, and
          signature thread animation.
        </p>
      </section>

      {/* 💳 Showcase Card & Signature SVG */}
      <section className="rise-4 max-w-2xl mx-auto space-y-8">
        <Card className="space-y-6">
          <h2 className="text-xl font-semibold">UI Primitives Showcase 🧱</h2>

          {/* 📢 Callout Box */}
          <div className="bg-tint p-4 rounded-lg border border-line text-sm">
            📢 <strong>Notice:</strong> All components adapt dynamically to
            light and dark themes using semantic tokens.
          </div>

          {/* 🏷️ Status Indicators */}
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted">Statuses:</span>
            <StatusBadge variant="active">Success</StatusBadge>
            <StatusBadge variant="proposed">Warning</StatusBadge>
          </div>

          {/* 🔘 Action Buttons */}
          <div className="flex gap-4 items-center">
            <Button className="bg-accent text-on-accent">Primary Action</Button>
            <Button variant="outline">Secondary</Button>
          </div>
        </Card>

        {/* 🧵 Signature Pairing-Thread SVG */}
        <div className="flex justify-center items-center p-4">
          <svg className="w-48 h-12" viewBox="0 0 200 50">
            <path
              d="M 10,25 Q 100,0 190,25"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="thread-draw text-accent"
            />
            <circle cx="190" cy="25" r="4" className="thread-dot fill-accent" />
          </svg>
        </div>
      </section>
      <Footer></Footer>
    </div>
  );
}
