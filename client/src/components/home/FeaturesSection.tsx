import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/shared/FeatureCard";
import { Feature } from "@/types";

const FeaturesSection = () => {
  const features: Feature[] = [
    {
      id: "point-cloud",
      title: "Point Cloud Processing",
      description: "Import, filter, and analyze LAS files and other point cloud formats with advanced processing capabilities.",
      icon: "cube"
    },
    {
      id: "surface-modeling",
      title: "Surface Modeling",
      description: "Generate precise 3D meshes from point data with automatic smoothing and decimation options.",
      icon: "layers"
    },
    {
      id: "water-flow",
      title: "Water Flow Analysis",
      description: "Simulate and visualize water flow patterns across terrain for hydrological studies.",
      icon: "droplet"
    },
    {
      id: "surface-compare",
      title: "Surface Compare",
      description: "Compare surface models to analyze elevation differences for earthwork estimation, mining progress tracking, and terrain analysis.",
      icon: "area-chart"
    },
    {
      id: "contour-generation",
      title: "Contour Generation",
      description: "Create precise contour lines from meshes with custom interval settings.",
      icon: "map"
    },
    {
      id: "profile-tools",
      title: "Profile & Cross-Section Tools",
      description: "Extract and analyze profiles and cross-sections from any 3D surface.",
      icon: "ruler"
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Powerful Features for Professionals
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore some of our key capabilities below. Cloud Canvas includes over 25 specialized tools to handle every aspect of your geospatial workflow.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="#">
            <Button className="bg-primary text-white hover:bg-opacity-90 transition-colors duration-200">
              View All Features
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
