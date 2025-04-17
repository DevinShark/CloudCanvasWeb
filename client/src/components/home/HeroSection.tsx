import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

const HeroSection = () => {
  const scrollToPricing = (e: React.MouseEvent<HTMLAnchorElement>) => {
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
  };

  return (
    <section className="relative">
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: "url('/CC_Splash.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: "scale(1.2)",
            transformOrigin: "center"
          }}
          aria-hidden="true"
        ></div>
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      <div className="relative container mx-auto px-6 pt-32 pb-24 md:pt-48 md:pb-32">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Advanced 3D Point Cloud & Surface Processing
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8">
            Transform your geospatial data into actionable insights with our powerful data visualization and analysis tool.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#pricing" onClick={scrollToPricing}>
              <Button className="bg-secondary hover:bg-secondary/90 text-white py-2 px-6 rounded-md w-full sm:w-auto text-lg">
                Get Started
              </Button>
            </a>
            <Link href="/register">
              <Button variant="outline" className="bg-transparent border-white text-white border-2 hover:bg-white/10 py-2 px-6 rounded-md w-full sm:w-auto text-lg">
                Request Trial
              </Button>
            </Link>
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
