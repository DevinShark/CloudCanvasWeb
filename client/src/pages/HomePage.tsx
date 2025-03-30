import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import TrustedBySection from "@/components/home/TrustedBySection";
import WorkflowSection from "@/components/home/WorkflowSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import ApplicationsSection from "@/components/home/ApplicationsSection";
import DemoSection from "@/components/home/DemoSection";
import PricingSection from "@/components/home/PricingSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";
import ContactSection from "@/components/home/ContactSection";

const HomePage = () => {
  // Handle smooth scrolling to sections via hash links
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          // Adjust for header height
          const headerHeight = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    };
    
    // Handle initial page load with hash
    if (window.location.hash) {
      setTimeout(handleHashChange, 100);
    }
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <TrustedBySection />
        <WorkflowSection />
        <FeaturesSection />
        <ApplicationsSection />
        <DemoSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
