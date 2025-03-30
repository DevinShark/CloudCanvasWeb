import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative">
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="w-full h-full bg-[url('https://images.unsplash.com/photo-1508098682722-e99c643e7485?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center"
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
            <Link href="/#pricing">
              <Button size="lg" className="bg-secondary text-white hover:bg-opacity-90 transition-colors duration-200">
                Get Started
              </Button>
            </Link>
            <Link href="/#demo">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary transition-colors duration-200">
                Request Demo
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-8">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-300 mr-2">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
                  alt="User" 
                  className="h-10 w-10 rounded-full object-cover"
                />
              </div>
              <div className="opacity-80 text-sm">
                "Cloud Canvas transformed our entire workflow." - Robert M., Civil Engineer
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                ))}
              </div>
              <span className="ml-2 opacity-80 text-sm">5.0 (48 reviews)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
