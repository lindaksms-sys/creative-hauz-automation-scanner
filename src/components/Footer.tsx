import { ExternalLink } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-background py-8 px-4">
    <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
      <div>
        <span className="font-display text-foreground">Creative </span>
        <span className="font-display text-primary">Hauz</span>
        <span className="ml-2">AI Automation Agency</span>
      </div>
      <a href="https://creativehauz.space" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
        creativehauz.space <ExternalLink className="w-3 h-3" />
      </a>
      <a href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</a>
      <span>Powered by Lovable</span>
    </div>
  </footer>
);

export default Footer;
