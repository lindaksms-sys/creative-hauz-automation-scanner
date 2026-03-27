import { useState } from "react";
import { Share2, Copy, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { ScanReport } from "@/types/scanner";

interface Props {
  report: ScanReport;
}

const ShareReport = ({ report }: Props) => {
  const [copied, setCopied] = useState(false);

  const shareText = `I just discovered I could save ${report.totalHoursSaved}+ hours/week by automating key tasks in my business! 🚀\n\nTop recommendations:\n${report.recommendations
    .slice(0, 3)
    .map((r, i) => `${i + 1}. ${r.title} (~${r.hoursSaved} hrs/week saved)`)
    .join("\n")}\n\nGet your free automation report at`;

  const shareUrl = "https://scanner.creativehauz.space";
  const fullText = `${shareText} ${shareUrl}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Automation Report — Creative Hauz",
          text: shareText,
          url: shareUrl,
        });
      } catch (e) {
        // User cancelled — ignore
      }
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const openShare = (platform: string) => {
    const encoded = encodeURIComponent(fullText);
    const encodedUrl = encodeURIComponent(shareUrl);
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encoded}`,
    };
    window.open(urls[platform], "_blank", "noopener,noreferrer");
  };

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="flex items-center gap-2">
      {hasNativeShare && (
        <Button variant="outline" size="sm" onClick={handleNativeShare} className="gap-1.5">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            {!hasNativeShare && <Share2 className="w-4 h-4" />}
            {hasNativeShare ? "More" : "Share Results"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuItem onClick={handleCopy} className="gap-2 cursor-pointer">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy to clipboard"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openShare("twitter")} className="gap-2 cursor-pointer">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Share on X
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openShare("linkedin")} className="gap-2 cursor-pointer">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            Share on LinkedIn
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openShare("whatsapp")} className="gap-2 cursor-pointer">
            <MessageCircle className="w-4 h-4" />
            Share on WhatsApp
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ShareReport;
