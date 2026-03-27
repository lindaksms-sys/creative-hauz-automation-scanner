import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  totalHoursSaved: number;
}

const AnimatedCounter = ({ target }: { target: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame: number;
    const duration = 1500;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return <>{count}</>;
};

const HeroStat = ({ totalHoursSaved }: Props) => {
  const monthlyHours = Math.round(totalHoursSaved * 4.3);
  const yearlySavings = Math.round(monthlyHours * 12 * 35); // $35/hr avg

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl shadow-elevated mb-8 overflow-hidden"
    >
      <div className="gradient-primary p-8 text-center text-primary-foreground">
        <div className="font-display text-5xl sm:text-6xl font-extrabold mb-1">
          <AnimatedCounter target={totalHoursSaved} />+
        </div>
        <div className="text-lg opacity-90">
          estimated hours saved per week
        </div>
      </div>
      <div className="bg-card p-4 grid grid-cols-2 divide-x divide-border">
        <div className="text-center px-4">
          <div className="font-display text-2xl font-bold text-foreground">
            {monthlyHours}
          </div>
          <div className="text-xs text-muted-foreground">hours/month reclaimed</div>
        </div>
        <div className="text-center px-4">
          <div className="font-display text-2xl font-bold text-green-accent">
            ${yearlySavings.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">est. yearly savings</div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroStat;
