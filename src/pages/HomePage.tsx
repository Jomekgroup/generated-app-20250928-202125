import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CleanerCard } from "@/components/CleanerCard";
import { CheckCircle, Calendar, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import type { CleanerProfile } from "@shared/types";
type CleanerWithStartingPrice = CleanerProfile & { startingPrice: number };
const featureVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.5,
    },
  }),
};
export function HomePage() {
  const [featuredCleaners, setFeaturedCleaners] = useState<CleanerWithStartingPrice[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchFeaturedCleaners = async () => {
      try {
        setLoading(true);
        const data = await api<CleanerWithStartingPrice[]>('/api/cleaners?limit=3');
        setFeaturedCleaners(data);
      } catch (err) {
        console.error("Failed to fetch featured cleaners:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedCleaners();
  }, []);
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative bg-gray-50 dark:bg-gray-900/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10"></div>
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center py-24">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-tight"
            >
              A <span className="text-primary">Spotless Home</span> is a Click Away
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground"
            >
              Discover and book trusted, professional cleaners in Nigeria. Simple, secure, and sparkling clean.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" asChild>
                <Link to="/cleaners">Find a Cleaner</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth">Become a Cleaner</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold">How CleanConnect Works</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Three simple steps to a cleaner space.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { icon: <CheckCircle className="h-10 w-10 text-primary" />, title: "Choose Your Cleaner", description: "Browse profiles, read reviews, and select the professional that's right for you." },
              { icon: <Calendar className="h-10 w-10 text-primary" />, title: "Book a Date & Time", description: "Pick a convenient time slot that fits your schedule. It's fast and easy." },
              { icon: <ShieldCheck className="h-10 w-10 text-primary" />, title: "Pay Securely", description: "Complete your booking with our secure payment system and relax." },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                variants={featureVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                className="text-center p-6"
              >
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mx-auto mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Featured Cleaners Section */}
      <section className="py-16 md:py-24 bg-muted/40">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold">Featured Cleaners</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Top-rated professionals ready to make your space shine.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))
            ) : (
              featuredCleaners.map((cleaner) => (
                <CleanerCard key={cleaner.id} cleaner={cleaner} />
              ))
            )}
          </div>
          <div className="mt-12 text-center">
            <Button size="lg" variant="outline" asChild>
              <Link to="/cleaners">View All Cleaners</Link>
            </Button>
          </div>
        </div>
      </section>
      {/* Join as Cleaner Section */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Grow Your Cleaning Business?</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Join CleanConnect to connect with new clients, manage your schedule, and build your reputation.
            </p>
            <div className="mt-10 flex justify-center">
              <ul className="text-left space-y-3 text-muted-foreground">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3 text-primary" /><span>Access a wide network of clients.</span></li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3 text-primary" /><span>Manage your bookings with ease.</span></li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-3 text-primary" /><span>Secure and timely payments.</span></li>
              </ul>
            </div>
            <Button size="lg" className="mt-10" asChild>
              <Link to="/auth">Become a Cleaner Today</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}