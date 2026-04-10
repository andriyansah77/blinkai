import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Templates } from "@/components/landing/Templates";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";
import { ForceLightTheme } from "./force-light-theme";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <ForceLightTheme />
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Templates />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
}
