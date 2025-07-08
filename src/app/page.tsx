'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ArrowRight, Briefcase, Lightbulb, Wand2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { UserNav } from '@/components/user-nav';

const fadeInStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const fadeInFromBottom = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const FeatureCard = forwardRef<HTMLDivElement, { icon: React.ElementType, title: string, description: string }>(
  ({ icon: Icon, title, description }, ref) => {
  return (
    <motion.div
      ref={ref}
      variants={fadeInFromBottom}
      className="flex flex-col items-center p-6 text-center bg-card rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="p-4 mb-4 rounded-full bg-primary/10 text-primary">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
});

FeatureCard.displayName = "FeatureCard";


export default function LandingPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (user && role) {
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } else {
      router.push('/signup');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16">
          <Logo />
          <div className="flex items-center gap-4">
            {loading ? (
                <div className="w-20 h-8 animate-pulse rounded-md bg-muted" />
            ) : user ? (
              <UserNav />
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 text-center md:py-32 overflow-hidden">
          <motion.div
            className="container"
            initial="hidden"
            animate="visible"
            variants={fadeInStagger}
          >
            <motion.h1 
              variants={fadeInFromBottom}
              className="text-4xl font-extrabold tracking-tighter font-headline md:text-6xl"
            >
              Connect to Your Future Career
            </motion.h1>
            <motion.p 
              variants={fadeInFromBottom}
              className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground"
            >
              HireJacks is the ultimate job portal for students, offering AI-powered tools to build your resume, find tailored job recommendations, and land your dream job.
            </motion.p>
            <motion.div
              variants={fadeInFromBottom} 
              className="mt-8">
              <Button size="lg" onClick={handleGetStarted}>
                Get Started for Free <ArrowRight className="ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </section>

        <section className="py-20 bg-muted/50 md:py-32 overflow-hidden">
          <motion.div
            className="container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInStagger}
          >
            <motion.div variants={fadeInFromBottom} className="max-w-xl mx-auto mb-12 text-center">
                <h2 className="text-3xl font-bold font-headline">Why HireJacks?</h2>
                <p className="mt-2 text-muted-foreground">We provide everything you need to kickstart your professional journey.</p>
            </motion.div>
            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard
                icon={Wand2}
                title="AI Resume Builder"
                description="Instantly transform your raw notes into a professional, industry-standard resume that gets noticed."
              />
              <FeatureCard
                icon={Lightbulb}
                title="Smart Job Recommendations"
                description="Our AI analyzes your skills and resume to suggest jobs that are the perfect fit for you."
              />
              <FeatureCard
                icon={Briefcase}
                title="Exclusive Opportunities"
                description="Get access to a curated list of internships and full-time jobs from top companies."
              />
            </div>
          </motion.div>
        </section>

        <section className="py-20 md:py-32 overflow-hidden">
            <motion.div
              className="container"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={fadeInStagger}
            >
                <div className="items-center grid-cols-2 gap-16 md:grid">
                    <motion.div variants={fadeInFromBottom}>
                        <h2 className="text-3xl font-bold font-headline">From Resume to Offer Letter, We've Got You Covered</h2>
                        <p className="mt-4 text-muted-foreground">HireJacks is more than just a job board. It's your personal career assistant. Track applications, get news and insights, and configure alerts so you never miss an opportunity.</p>
                         <div className="mt-8">
                            <Button asChild>
                                <Link href="/signup">Create Your Account</Link>
                            </Button>
                        </div>
                    </motion.div>
                    <motion.div variants={fadeInFromBottom} className="mt-10 md:mt-0">
                        <Image src="https://placehold.co/600x400.png" alt="App Screenshot" width={600} height={400} className="rounded-lg shadow-xl" data-ai-hint="collaboration meeting" />
                    </motion.div>
                </div>
            </motion.div>
        </section>
      </main>

      <footer className="py-6 border-t">
        <div className="container text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HireJacks. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
