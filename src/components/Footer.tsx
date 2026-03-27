import { ExternalLink } from "lucide-react";

const Footer = () => (
  <footer className="bg-card border-t border-border py-10 px-4">
    <div className="container mx-auto max-w-4xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <span className="font-display font-bold text-foreground">Creative Hauz</span>
          <span className="text-muted-foreground text-sm ml-2">AI Automation Agency</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a
            href="https://creativehauz.space"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            creativehauz.space <ExternalLink className="w-3 h-3" />
          </a>
          <span>Privacy Policy</span>
          <span className="text-xs">Powered by Lovable</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
