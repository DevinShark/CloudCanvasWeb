import { Link } from "wouter";
import { ChevronRight, Package, Layers, Droplet, BarChart2, Map, Ruler } from "lucide-react";
import { Feature } from "@/types";

interface FeatureCardProps {
  feature: Feature;
}

const FeatureCard = ({ feature }: FeatureCardProps) => {
  // Map feature icon string to Lucide React icon component
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "cube":
        return <Package className="h-10 w-10 text-accent" />;
      case "layers":
        return <Layers className="h-10 w-10 text-accent" />;
      case "droplet":
        return <Droplet className="h-10 w-10 text-accent" />;
      case "area-chart":
        return <BarChart2 className="h-10 w-10 text-accent" />;
      case "map":
        return <Map className="h-10 w-10 text-accent" />;
      case "ruler":
        return <Ruler className="h-10 w-10 text-accent" />;
      default:
        return <Package className="h-10 w-10 text-accent" />;
    }
  };

  return (
    <div className="bg-background rounded-lg shadow-md p-6 transition-transform duration-300 hover:transform hover:scale-105">
      <div className="flex justify-center mb-4">
        {getIcon(feature.icon)}
      </div>
      <h3 className="text-xl font-bold text-center mb-3">{feature.title}</h3>
      <p className="text-gray-600 text-center mb-4">{feature.description}</p>
      <div className="text-center">
        <Link href={`/features/${feature.id}`}>
          <a className="text-accent hover:underline inline-flex items-center">
            Learn More
            <ChevronRight className="h-4 w-4 ml-1" />
          </a>
        </Link>
      </div>
    </div>
  );
};

export default FeatureCard;
