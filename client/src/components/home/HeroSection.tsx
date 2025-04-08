import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import splashBg from "@assets/CC_Splash.jpeg";

const HeroSection = () => {
  return (
    <section className="relative">
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat" 
          style={{ backgroundImage: `url(${splashBg})` }}
          aria-hidden="true"
        ></div>
        <div className="absolute inset-0 gradient-bg"></div>
      </div>
      
      <div className="relative container mx-auto px-6 pt-32 pb-24 md:pt-48 md:pb-32">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Advanced 3D Point Cloud & Surface Processing
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8">
            Transform your geospatial data into actionable insights with our powerful data visualization and analysis tool.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <a 
              href="#pricing"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('pricing');
                if (element) {
                  const headerHeight = 80;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  });
                }
              }}
            >
              <Button size="lg" className="bg-secondary text-white hover:bg-opacity-90 transition-colors duration-200">
                Get Started
              </Button>
            </a>
            <a 
              href="#demo"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('demo');
                if (element) {
                  const headerHeight = 80;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  });
                }
              }}
            >
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary transition-colors duration-200">
                Request Demo
              </Button>
            </a>
          </div>
          <div className="mt-8">
            <div className="flex items-center">
              <div className="inline-flex px-3 py-1 rounded-full bg-secondary bg-opacity-30">
                <span className="text-white text-sm font-medium">Professional 3D Terrain Editor</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
