import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20 bg-primary text-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Transform Your Geospatial Workflow?
        </h2>
        <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
          Join thousands of professionals who trust Cloud Canvas for powerful 3D terrain processing.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link href="#pricing">
            <Button size="lg" className="bg-secondary text-white hover:bg-opacity-90 transition-colors duration-200">
              Get Started Today
            </Button>
          </Link>
          <Link href="#demo">
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary transition-colors duration-200">
              Request Demo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
