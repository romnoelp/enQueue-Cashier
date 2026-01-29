"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";
import { LiquidButton } from "@/components/animate-ui/primitives/buttons/liquid";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import ConcentricLoader from "@/components/mvpblocks/concentric-loader";
import { signInWithGoogle } from "@/lib/auth/signInWithGoogle";

export default function GradientHero() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showIntro, setShowIntro] = useState<boolean>(true);

  useEffect(() => {
    // Show intro for 2 seconds, then transition to main page
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Sign-in failed. Please try again.";
      toast.error(message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const renderButton = () => {
    if (isSigningIn) {
      return <ConcentricLoader />;
    }
    return (
      <LiquidButton
        onClick={handleSignIn}
        className="group bg-primary text-primary-foreground hover:shadow-primary/30 relative overflow-hidden rounded-full px-6 shadow-lg transition-all duration-300">
        <span className="relative z-10 flex items-center">
          Sign in with your .edu email
          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
        <span className="from-primary via-primary/90 to-primary/80 absolute inset-0 z-0 bg-linear-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
      </LiquidButton>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {showIntro ? (
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="text-center">
            <motion.h2
              className="from-primary via-primary/80 to-primary/60 bg-linear-to-r bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl md:text-7xl lg:text-8xl"
              initial={{ letterSpacing: "0.1em" }}
              animate={{ letterSpacing: "0em" }}
              transition={{ duration: 0.8, delay: 0.2 }}>
              enQueue
            </motion.h2>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-primary mx-auto mt-4 h-1 rounded-full"
            />
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="main"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <div className="bg-background relative w-full overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 z-0">
              <div className="from-primary/20 via-background to-background absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))]"></div>
              <div className="bg-primary/5 absolute top-0 left-1/2 -z-10 h-250 w-250 -translate-x-1/2 rounded-full blur-3xl"></div>
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-size-[16px_16px] opacity-15"></div>

            <div className="relative z-10 container mx-auto px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
              <div className="mx-auto max-w-5xl">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mx-auto mb-6 flex justify-center">
                  <div className="border-border bg-background/80 inline-flex items-center rounded-full border px-3 py-1 text-sm backdrop-blur-sm">
                    <span className="bg-primary mr-2 rounded-full px-2 py-0.5 text-xs font-semibold text-white">
                      Skip
                    </span>
                    <span className="text-muted-foreground">
                      the line, enjoy your time.{" "}
                    </span>
                    <ChevronRight className="text-muted-foreground ml-1 h-4 w-4" />
                  </div>
                </motion.div>

                {/* Heading */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="from-primary/10 via-foreground/85 to-foreground/50 bg-linear-to-tl bg-clip-text text-center text-4xl tracking-tighter text-balance text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
                  The Smart Queuing App for New Era University{" "}
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-muted-foreground mx-auto mt-6 max-w-2xl text-center text-lg">
                  <span className="font-bold">enQueue</span> helps students line
                  up digitally, making campus life smoother and more
                  efficient—because time in campus should be spent for learning,
                  not waiting.{" "}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  {renderButton()}
                </motion.div>

                {/* Feature Image */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.5,
                    type: "spring",
                    stiffness: 50,
                  }}
                  className="relative mx-auto mt-16 max-w-4xl">
                  <div className="border-border/40 bg-background/50 overflow-hidden rounded-xl border shadow-xl backdrop-blur-sm">
                    <div className="border-border/40 bg-muted/50 flex h-10 items-center border-b px-4">
                      <div className="flex space-x-2">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="bg-background/50 text-muted-foreground mx-auto flex items-center rounded-md px-3 py-1 text-xs">
                        https://enqueue/dashboard.edu.ph
                      </div>
                    </div>
                    <div className="relative">
                      <Image
                        src={"https://picsum.photos/1920/1080"}
                        alt="dashboard"
                        width={1920}
                        height={1080}
                        loading="eager"
                      />
                      <div className="from-background absolute inset-0 bg-linear-to-t to-transparent opacity-0"></div>
                    </div>
                  </div>

                  {/* Floating elements for visual interest */}
                  <div className="border-border/40 bg-background/80 absolute -top-6 -right-6 h-12 w-12 rounded-lg border p-3 shadow-lg backdrop-blur-md">
                    <div className="bg-primary/20 h-full w-full rounded-md"></div>
                  </div>
                  <div className="border-border/40 bg-background/80 absolute -bottom-4 -left-4 h-8 w-8 rounded-full border shadow-lg backdrop-blur-md"></div>
                  <div className="border-border/40 bg-background/80 absolute right-12 -bottom-6 h-10 w-10 rounded-lg border p-2 shadow-lg backdrop-blur-md">
                    <div className="h-full w-full rounded-md bg-green-500/20"></div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
