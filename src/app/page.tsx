"use client";

import {
  heroColors as colors,
  HeartDoodle,
  HeroIllustration,
  SparkDoodle,
  StarDoodle,
} from "@/components/hero-illustration";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Book,
  Code2,
  Gamepad2,
  GraduationCap,
  Heart,
  PartyPopper,
  Play,
  Rocket,
  Send,
  Sparkles,
  Terminal,
  TestTube,
  Zap,
} from "lucide-react";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

// Zigzag decorative line
function ZigzagLine({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        height: "12px",
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='12' viewBox='0 0 40 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6 L10 0 L20 6 L30 0 L40 6 L30 12 L20 6 L10 12 Z' fill='%23000'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat-x",
        backgroundSize: "40px 12px",
      }}
    />
  );
}

// Feature card - more playful
function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
  rotate = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  rotate?: number;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -6, rotate: 0, scale: 1.02 }}
      style={{ rotate }}
      className="group relative overflow-hidden rounded-2xl border-3 border-black bg-white p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900"
    >
      <div className="mb-3 inline-flex rounded-xl border-3 border-black p-2.5" style={{ backgroundColor: color }}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-1.5 text-lg font-black">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      {/* Corner decoration */}
      <div
        className="absolute -right-6 -top-6 h-12 w-12 rotate-45 transition-transform group-hover:scale-110"
        style={{ backgroundColor: color, opacity: 0.3 }}
      />
    </motion.div>
  );
}

// Step card for "How it works"
function StepCard({
  number,
  title,
  description,
  color,
}: {
  number: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <motion.div variants={fadeInUp} className="relative">
      <div
        className="absolute -left-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full border-3 border-black text-lg font-black"
        style={{ backgroundColor: color }}
      >
        {number}
      </div>
      <div className="rounded-2xl border-3 border-black bg-white p-5 pl-8 pt-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900">
        <h3 className="mb-2 font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}

// API Preview card
function APIPreviewCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border-3 border-black bg-zinc-900 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
    >
      {/* Window buttons */}
      <div className="mb-3 flex gap-2">
        <div className="h-3 w-3 rounded-full border-2 border-black bg-red-400" />
        <div className="h-3 w-3 rounded-full border-2 border-black bg-yellow-400" />
        <div className="h-3 w-3 rounded-full border-2 border-black bg-green-400" />
      </div>
      {/* Code */}
      <pre className="text-xs leading-relaxed">
        <code>
          <span className="text-gray-500"># Create a transfer</span>
          {"\n"}
          <span className="text-blue-400">POST</span> <span className="text-green-400">/api/v1/transactions</span>
          {"\n\n"}
          <span className="text-purple-400">{"{"}</span>
          {"\n  "}
          <span className="text-yellow-300">&quot;amount&quot;</span>
          <span className="text-white">:</span> <span className="text-orange-400">1000</span>
          <span className="text-white">,</span>
          {"\n  "}
          <span className="text-yellow-300">&quot;to&quot;</span>
          <span className="text-white">:</span> <span className="text-green-400">&quot;CZ123456&quot;</span>
          {"\n"}
          <span className="text-purple-400">{"}"}</span>
        </code>
      </pre>
      {/* Decorative gradient */}
      <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-xl" />
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FFFBF5] dark:bg-zinc-950">
      {/* Decorative background elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-20 top-40 h-40 w-40 rounded-full bg-pink-200/40 blur-3xl" />
        <div className="absolute -right-20 top-80 h-60 w-60 rounded-full bg-yellow-200/40 blur-3xl" />
        <div className="absolute bottom-40 left-1/3 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b-3 border-black bg-white/80 backdrop-blur-sm dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              style={{ backgroundColor: colors.pink }}
            >
              <span className="text-xl font-black">C</span>
            </div>
            <span className="text-xl font-black">CzechiBank</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/api/v1/docs/page" className="hidden text-sm font-bold hover:underline md:block">
              API Docs
            </Link>
            <Link href="/signin">
              <Button
                variant="outline"
                className="border-3 border-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 md:px-6 md:pb-24 md:pt-16">
          {/* Floating decorations */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute left-8 top-20 hidden lg:block"
          >
            <StarDoodle className="h-8 w-8 text-yellow-400" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="absolute right-12 top-32 hidden lg:block"
          >
            <SparkDoodle className="h-10 w-10 text-pink-400" />
          </motion.div>

          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
            {/* Left side - Text */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="order-2 text-center md:order-1 md:text-left"
            >
              <motion.div
                variants={fadeInUp}
                className="mb-4 inline-flex items-center gap-2 rounded-full border-3 border-black px-4 py-2 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                style={{ backgroundColor: colors.yellow }}
              >
                <Gamepad2 className="h-4 w-4" />
                Your API Playground
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="mb-6 text-4xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl"
              >
                Learn banking APIs
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10">the fun way!</span>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="absolute -bottom-1 left-0 h-4 w-full origin-left md:h-5"
                    style={{ backgroundColor: colors.pink }}
                  />
                </span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="mb-8 text-lg text-muted-foreground md:text-xl">
                CzechiBank is a <span className="font-bold text-foreground">sandbox environment</span> for developers
                and students. Create accounts, make transfers, explore our API — break things, learn, and have fun!
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start"
              >
                <Link href="/register">
                  <Button
                    size="lg"
                    className="group w-full border-3 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:w-auto"
                    style={{ backgroundColor: colors.green }}
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Start Playing
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/api/v1/docs/page">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-3 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:w-auto"
                  >
                    <Book className="mr-2 h-4 w-4" />
                    Read the Docs
                  </Button>
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                variants={fadeInUp}
                className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-green-400">
                    <span className="text-xs text-black">✓</span>
                  </div>
                  100% Free
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-blue-400">
                    <span className="text-xs text-black">✓</span>
                  </div>
                  No Credit Card
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-pink-400">
                    <span className="text-xs text-black">✓</span>
                  </div>
                  REST API
                </div>
              </motion.div>
            </motion.div>

            {/* Right side - Illustration */}
            <div className="relative order-1 h-80 md:order-2 md:h-[420px]">
              <div
                className="absolute inset-0 rounded-3xl border-3 border-black"
                style={{ backgroundColor: `${colors.blue}30` }}
              />
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* What is CzechiBank */}
      <section className="relative border-y-3 border-black bg-white dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid items-center gap-12 md:grid-cols-2"
          >
            <motion.div variants={fadeInUp}>
              <div
                className="mb-4 inline-flex items-center gap-2 rounded-full border-3 border-black px-3 py-1.5 text-sm font-bold"
                style={{ backgroundColor: colors.purple }}
              >
                <GraduationCap className="h-4 w-4" />
                For Learners
              </div>
              <h2 className="mb-4 text-3xl font-black md:text-4xl">
                A real bank?{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">Nope!</span>
                  <span className="absolute -bottom-1 left-0 h-3 w-full" style={{ backgroundColor: colors.orange }} />
                </span>
              </h2>
              <p className="mb-6 text-muted-foreground">
                CzechiBank is a <span className="font-bold text-foreground">testing sandbox</span> created for the{" "}
                <span className="font-bold text-foreground">Czechitas</span> community. It&apos;s designed to help you
                learn how banking APIs work without any risk.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: TestTube, text: "Safe environment to experiment", color: colors.green },
                  { icon: Code2, text: "Real REST API endpoints", color: colors.blue },
                  { icon: Book, text: "Interactive documentation", color: colors.yellow },
                  { icon: Heart, text: "Made with love for learning", color: colors.pink },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black"
                      style={{ backgroundColor: item.color }}
                    >
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <APIPreviewCard />
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Full Swagger documentation included{" "}
                <span role="img" aria-label="party">
                  🎉
                </span>
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative zigzag */}
        <ZigzagLine className="absolute -bottom-1.5 left-0 w-full" />
      </section>

      {/* Features */}
      <section className="relative py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-12 text-center md:mb-16"
          >
            <motion.div
              variants={fadeInUp}
              className="mb-4 inline-flex items-center gap-2 rounded-full border-3 border-black px-4 py-2 font-bold"
              style={{ backgroundColor: colors.orange }}
            >
              <Sparkles className="h-4 w-4" />
              Features
            </motion.div>
            <motion.h2 variants={fadeInUp} className="mb-4 text-3xl font-black md:text-4xl">
              Everything you need to{" "}
              <span className="relative inline-block">
                <span className="relative z-10">learn</span>
                <span className="absolute -bottom-1 left-0 h-3 w-full" style={{ backgroundColor: colors.green }} />
              </span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="mx-auto max-w-2xl text-muted-foreground">
              Explore banking concepts through hands-on experience. No textbooks, just doing!
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <FeatureCard
              icon={Send}
              title="Make Transfers"
              description="Send virtual money between accounts. See how transactions work in real time."
              color={colors.pink}
              rotate={-1}
            />
            <FeatureCard
              icon={Terminal}
              title="REST API"
              description="Full featured API with authentication, transactions, and account management."
              color={colors.yellow}
              rotate={1}
            />
            <FeatureCard
              icon={Book}
              title="Swagger Docs"
              description="Interactive API documentation. Test endpoints directly in your browser."
              color={colors.blue}
              rotate={-1}
            />
            <FeatureCard
              icon={Zap}
              title="Instant Setup"
              description="Create an account in seconds. Get your API key and start building."
              color={colors.green}
              rotate={1}
            />
            <FeatureCard
              icon={TestTube}
              title="Test Mode"
              description="All money is fake! Experiment freely without any consequences."
              color={colors.purple}
              rotate={-1}
            />
            <FeatureCard
              icon={Rocket}
              title="Learn Fast"
              description="Perfect for bootcamps, courses, and self-learning. Progress at your own pace."
              color={colors.orange}
              rotate={1}
            />
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y-3 border-black bg-white py-16 dark:bg-zinc-900 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-12 text-center md:mb-16"
          >
            <motion.div
              variants={fadeInUp}
              className="mb-4 inline-flex items-center gap-2 rounded-full border-3 border-black px-4 py-2 font-bold"
              style={{ backgroundColor: colors.blue }}
            >
              <Play className="h-4 w-4" />
              How it works
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl font-black md:text-4xl">
              3 steps to{" "}
              <span className="relative inline-block">
                <span className="relative z-10">start</span>
                <span className="absolute -bottom-1 left-0 h-3 w-full" style={{ backgroundColor: colors.yellow }} />
              </span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mx-auto grid max-w-3xl gap-8 md:grid-cols-3"
          >
            <StepCard
              number="1"
              title="Create Account"
              description="Sign up with your email. It takes 30 seconds!"
              color={colors.pink}
            />
            <StepCard
              number="2"
              title="Get API Key"
              description="Generate your personal API key from the dashboard."
              color={colors.yellow}
            />
            <StepCard
              number="3"
              title="Start Building"
              description="Make your first API call. The docs will guide you!"
              color={colors.green}
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-16 md:py-24" style={{ backgroundColor: colors.pink }}>
        {/* Decorative elements */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="absolute -left-10 top-10"
        >
          <StarDoodle className="h-20 w-20 text-yellow-300" />
        </motion.div>
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="absolute -right-10 bottom-10"
        >
          <HeartDoodle className="h-16 w-16 text-white" />
        </motion.div>

        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.div
              variants={fadeInUp}
              className="mb-4 inline-flex items-center gap-2 rounded-full border-3 border-black bg-white px-4 py-2 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              <PartyPopper className="h-4 w-4" />
              Ready to play?
            </motion.div>
            <motion.h2 variants={fadeInUp} className="mb-6 text-3xl font-black text-black md:text-5xl">
              Your banking adventure
              <br />
              starts{" "}
              <span className="relative inline-block">
                <span className="relative z-10">here!</span>
                <span className="absolute -bottom-1 left-0 h-4 w-full bg-white md:h-5" />
              </span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="mb-8 text-lg text-black/70">
              Join hundreds of developers and students learning APIs with CzechiBank.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="w-full border-3 border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] transition-all hover:bg-zinc-800 hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)] sm:w-auto"
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Create Free Account
                </Button>
              </Link>
              <Link href="/api/v1/docs/page">
                <Button
                  size="lg"
                  className="w-full border-3 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] sm:w-auto"
                >
                  Explore API Docs
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-3 border-black bg-white dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                style={{ backgroundColor: colors.pink }}
              >
                <span className="text-xl font-black">C</span>
              </div>
              <div>
                <span className="text-lg font-black">CzechiBank</span>
                <p className="text-xs text-muted-foreground">A Czechitas Learning Project</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <Link href="/api/v1/docs/page" className="font-medium hover:underline">
                API Docs
              </Link>
              <Link href="/register" className="font-medium hover:underline">
                Sign Up
              </Link>
              <Link href="/signin" className="font-medium hover:underline">
                Sign In
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t-2 border-dashed border-border pt-8 md:flex-row">
            <p className="text-sm text-muted-foreground">
              Made with <HeartDoodle className="inline-block h-4 w-4 text-pink-500" /> for learning
            </p>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} CzechiBank — Not a real bank!
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
