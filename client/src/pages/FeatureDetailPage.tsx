import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Package, Layers, Droplet, BarChart2, Map, Ruler } from "lucide-react";
import { Feature } from "@/types";

const FeatureDetailPage = () => {
  const { featureId } = useParams();
  const [, navigate] = useLocation();
  const [feature, setFeature] = useState<Feature | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Feature data
  const features: Feature[] = [
    {
      id: "point-cloud",
      title: "Point Cloud Processing",
      description: "Import, filter, and analyze LAS files and other point cloud formats with advanced processing capabilities.",
      icon: "cube",
      detailContent: `
        <h2>Point Cloud Processing</h2>
        <p>Our advanced point cloud processing tools enable you to work efficiently with large LAS and other point cloud formats.</p>
        
        <h3>Key Capabilities:</h3>
        <ul>
          <li>Support for industry-standard formats: LAS, LAZ, XYZ, PLY, and more</li>
          <li>Automatic point classification for ground, vegetation, buildings, and other features</li>
          <li>Point cloud filtering and noise reduction</li>
          <li>Efficient thinning algorithms for large datasets</li>
          <li>Custom visualization options including height, intensity, and classification coloring</li>
          <li>Point cloud registration and merging</li>
        </ul>
        
        <p>Whether you're working with aerial LiDAR, terrestrial laser scanning, or photogrammetrically derived point clouds, Cloud Canvas provides the tools you need to process, analyze, and extract value from your point cloud data.</p>
        
        <p>The intuitive interface allows you to quickly load even massive point cloud datasets and immediately begin analysis, with automatic optimization for your hardware configuration to ensure smooth performance.</p>
      `
    },
    {
      id: "surface-modeling",
      title: "Surface Modeling",
      description: "Generate precise 3D meshes from point data with automatic smoothing and decimation options.",
      icon: "layers",
      detailContent: `
        <h2>Surface Modeling</h2>
        <p>Transform your point cloud data into accurate 3D surface models with Cloud Canvas's advanced surface modeling tools.</p>
        
        <h3>Key Capabilities:</h3>
        <ul>
          <li>Triangulated Irregular Network (TIN) creation with multiple algorithm options</li>
          <li>Automatic hole filling for incomplete data</li>
          <li>Variable smoothing controls to reduce noise while preserving important features</li>
          <li>Mesh decimation to optimize large models</li>
          <li>Breakline enforcement for accurate representation of hard edges</li>
          <li>Automatic edge detection and feature preservation</li>
          <li>Quality analysis tools to validate surface accuracy</li>
        </ul>
        
        <p>Our mesh modeling tools ensure you can create highly accurate surface representations from your point cloud data. The intelligent algorithms automatically adapt to data density variations to produce optimal results even with incomplete or noisy datasets.</p>
        
        <p>Multiple export options allow you to share your surface models with other software, including common formats like OBJ, STL, DXF, and PLY.</p>
      `
    },
    {
      id: "water-flow",
      title: "Water Flow Analysis",
      description: "Simulate and visualize water flow patterns across terrain for hydrological studies.",
      icon: "droplet",
      detailContent: `
        <h2>Water Flow Analysis</h2>
        <p>Understand water movement across terrain with our powerful hydrological analysis tools.</p>
        
        <h3>Key Capabilities:</h3>
        <ul>
          <li>Flow direction and accumulation analysis</li>
          <li>Watershed delineation</li>
          <li>Stream network extraction and ordering</li>
          <li>Flood simulation with variable water levels</li>
          <li>Ponding detection and volume calculation</li>
          <li>Rainfall-runoff modeling</li>
          <li>Erosion potential mapping</li>
        </ul>
        
        <p>For environmental studies, flood risk assessment, or civil engineering projects, our water flow analysis tools provide the insights you need to make informed decisions about terrain and water interaction.</p>
        
        <p>The interactive visualization allows you to dynamically change parameters and immediately see the results, making it easy to communicate complex hydrological concepts to stakeholders and clients.</p>
      `
    },
    {
      id: "surface-compare",
      title: "Surface Compare",
      description: "Compare surface models to analyze elevation differences for earthwork estimation, mining progress tracking, and terrain analysis.",
      icon: "area-chart",
      detailContent: `
        <h2>Surface Compare</h2>
        <p>Accurately quantify changes between surfaces for earthwork estimation, mining progress tracking, and land monitoring.</p>
        
        <h3>Key Capabilities:</h3>
        <ul>
          <li>Direct comparison between temporal surface models</li>
          <li>Cut/fill volume calculations with detailed reporting</li>
          <li>Customizable color ramps for difference visualization</li>
          <li>Contour generation of differential surfaces</li>
          <li>Statistical analysis of elevation changes</li>
          <li>Cross-section creation along user-defined paths</li>
          <li>PDF and CAD-compatible report generation</li>
        </ul>
        
        <p>Whether you're tracking mining progress, estimating earthwork volumes for construction, or monitoring terrain changes over time, our surface comparison tools provide accurate, visually compelling results to support your decision-making process.</p>
        
        <p>The intelligent difference calculation algorithms handle surfaces of different resolutions and extents, automatically compensating for alignment issues to deliver reliable results even with imperfect input data.</p>
      `
    },
    {
      id: "contour-generation",
      title: "Contour Generation",
      description: "Create precise contour lines from meshes with custom interval settings.",
      icon: "map",
      detailContent: `
        <h2>Contour Generation</h2>
        <p>Generate precise topographic contours from your surface models with flexible customization options.</p>
        
        <h3>Key Capabilities:</h3>
        <ul>
          <li>Variable contour intervals with major/minor settings</li>
          <li>Smooth contour generation with adjustable smoothing parameters</li>
          <li>Contour simplification to reduce complexity while maintaining accuracy</li>
          <li>Automatic contour labeling with customizable placement</li>
          <li>Depression contour handling</li>
          <li>Export to CAD and GIS formats including DXF, SHP, and DWG</li>
          <li>Styles and formatting controls including line weights, colors, and patterns</li>
        </ul>
        
        <p>Our contour generation tools create clean, cartographically pleasing contour lines that clearly represent terrain while maintaining spatial accuracy. Advanced smoothing algorithms eliminate jagged edges and artifacts while preserving important terrain features.</p>
        
        <p>The intuitive interface allows you to instantly visualize contours with different intervals and settings, helping you find the optimal representation for your specific needs.</p>
      `
    },
    {
      id: "profile-tools",
      title: "Profile & Cross-Section Tools",
      description: "Extract and analyze profiles and cross-sections from any 3D surface.",
      icon: "ruler",
      detailContent: `
        <h2>Profile & Cross-Section Tools</h2>
        <p>Extract and analyze detailed terrain profiles and cross-sections to support design and analysis workflows.</p>
        
        <h3>Key Capabilities:</h3>
        <ul>
          <li>Interactive profile creation along user-defined paths</li>
          <li>Multiple profile comparison on a single graph</li>
          <li>Automated cross-section generation at specified intervals</li>
          <li>Volume calculation between profiles</li>
          <li>Slope and grade analysis</li>
          <li>Vertical exaggeration controls for better visualization</li>
          <li>Export profiles to CAD, CSV, and PDF formats</li>
        </ul>
        
        <p>Whether you're designing roads, analyzing drainage patterns, or planning excavation, our profile tools give you the detailed vertical information you need to make precise decisions.</p>
        
        <p>The interactive profile viewer allows you to measure distances and elevations at any point, and the batch processing capabilities make it easy to create standardized cross-sections for even the largest projects.</p>
      `
    }
  ];
  
  useEffect(() => {
    if (featureId) {
      const foundFeature = features.find(f => f.id === featureId);
      setFeature(foundFeature || null);
    }
    setIsLoading(false);
  }, [featureId]);
  
  // Function to get icon component based on icon name
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "cube": return <Package className="h-10 w-10 text-accent" />;
      case "layers": return <Layers className="h-10 w-10 text-accent" />;
      case "droplet": return <Droplet className="h-10 w-10 text-accent" />;
      case "area-chart": return <BarChart2 className="h-10 w-10 text-accent" />;
      case "map": return <Map className="h-10 w-10 text-accent" />;
      case "ruler": return <Ruler className="h-10 w-10 text-accent" />;
      default: return <Package className="h-10 w-10 text-accent" />;
    }
  };
  
  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen py-24 bg-background">
          <div className="container mx-auto px-6 pt-20">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen py-24 bg-background">
        <div className="container mx-auto px-6 pt-20">
          <Button 
            variant="ghost" 
            className="mb-6 flex items-center"
            onClick={() => navigate("/#features")}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Features
          </Button>
          
          {feature ? (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-8">
                <div className="mr-4">
                  {getIcon(feature.icon)}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-primary">{feature.title}</h1>
              </div>
              
              <div className="prose prose-lg max-w-none mb-12">
                <p className="text-xl text-gray-600 mb-8">{feature.description}</p>
                
                <div dangerouslySetInnerHTML={{ __html: feature.detailContent || '' }} />
              </div>
              
              <div className="border-t border-gray-200 pt-8 mt-8 flex justify-between">
                <Button variant="outline" onClick={() => navigate("/#features")}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to All Features
                </Button>
                
                <Button onClick={() => navigate("/#demo")}>
                  Request Demo
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-primary mb-4">Feature Not Found</h2>
              <p className="text-gray-600 mb-6">The feature you are looking for doesn't exist or has been moved.</p>
              <Button onClick={() => navigate("/#features")}>
                View All Features
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default FeatureDetailPage;
