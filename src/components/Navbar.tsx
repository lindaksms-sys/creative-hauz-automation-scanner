import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "SERVICES", href: "https://creativehauz.space/#services" },
  { label: "INSIGHTS", href: "https://creativehauz.space/#insights" },
  { label: "ABOUT", href: "https://creativehauz.space/#about" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="max-w-6xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a
          href="https://creativehauz.space"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-baseline gap-1 shrink-0"
        >
          <span className="font-display text-xl text-foreground">Creative</span>
          <span className="font-display text-xl text-primary">Hauz</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Button variant="hero" size="sm" asChild>
            <a
              href="https://calendar.app.google/r7Q8bwxVH5JBsmJW9"
              target="_blank"
              rel="noopener noreferrer"
            >
              BOOK FREE AUDIT
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-b border-border bg-background"
          >
            <div className="flex flex-col gap-4 px-6 py-5">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Button variant="hero" size="sm" className="w-full" asChild>
                <a
                  href="https://calendar.app.google/r7Q8bwxVH5JBsmJW9"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  BOOK FREE AUDIT
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
