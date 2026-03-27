import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const COOKIE_CONSENT_KEY = "ch-cookie-consent";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6"
        >
          <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl shadow-elevated p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-sm text-muted-foreground flex-1">
              We use minimal cookies for functionality and analytics to improve your experience. No
              third-party advertising cookies are used.{" "}
              <a href="/privacy-policy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </a>
            </p>
            <div className="flex gap-3 shrink-0">
              <Button variant="ghost" size="sm" onClick={decline}>
                Decline
              </Button>
              <Button size="sm" onClick={accept}>
                Accept
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
