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
      description: "Advanced tools for importing, processing, and analyzing point cloud data from various sources.",
      icon: "cube",
      detailContent: `
        <h2>Comprehensive Point Cloud Management</h2>
        <p>Cloud Canvas provides state-of-the-art point cloud processing capabilities designed for surveyors, engineers, and GIS professionals. Our sophisticated algorithms allow you to work efficiently with massive datasets while maintaining precision and detail.</p>
        
        <h3>Key Capabilities</h3>
        <p>Explore some of the powerful point cloud processing capabilities below. Cloud Canvas includes over 25 specialized tools to handle every aspect of your workflow.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="M14 3v4a1 1 0 0 0 1 1h4"></path><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"></path><path d="M12 17v-6"></path><path d="M9 14h6"></path></svg>
              <h4 class="text-lg font-semibold">Multi-Format Import</h4>
            </div>
            <p>Import and merge point cloud data from LAS, LAZ, XYZ, CSV, TXT, and DXF formats with custom field mapping.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
              <h4 class="text-lg font-semibold">Advanced Point Filtering</h4>
            </div>
            <p>Separate ground and non-ground points using our proprietary multi-parameter morphological filter with attribute weighting and interactive selection.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="M6 18 18 6M18 18 6 6"></path></svg>
              <h4 class="text-lg font-semibold">Intelligent Decimation</h4>
            </div>
            <p>Reduce point cloud size while preserving critical features using grid-based, curvature-sensitive, and random subsampling methods.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><circle cx="13.5" cy="6.5" r="4.5"></circle><circle cx="5.5" cy="12.5" r="4.5"></circle><circle cx="18.5" cy="19.5" r="4.5"></circle></svg>
              <h4 class="text-lg font-semibold">Point Cloud Colorization</h4>
            </div>
            <p>Apply color from orthoimagery, attribute mapping, and elevation-based gradients for enhanced visualization and analysis.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
              <h4 class="text-lg font-semibold">Interactive Selection Tools</h4>
            </div>
            <p>Select and edit point clouds using polygon drawing, lasso selection, and fence tools with immediate visual feedback.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="M2 12h20"></path><path d="M10 16v-4a2 2 0 0 1 4 0v4"></path><path d="M14 16h-4"></path></svg>
              <h4 class="text-lg font-semibold">Point Cloud Smoothing</h4>
            </div>
            <p>Apply targeted noise reduction and smoothing operations while preserving sharp features and discontinuities.</p>
          </div>
        </div>
        
        <h3>Threshold Filtering</h3>
        <p>Cloud Canvas offers a sophisticated multi-parameter morphological filter for precise ground/non-ground point classification. This advanced algorithm combines geometric, color, density, and intensity data to effectively handle complex terrain and vegetation scenarios.</p>
        
        <ul class="mt-4 space-y-2">
          <li>Adaptive morphological filtering with customizable cell sizes and slope thresholds that adjust to local terrain conditions</li>
          <li>Multi-attribute weighting system that intelligently combines RGB color, point density, and intensity values for optimal filtering results</li>
          <li>Interactive polygon selection that allows precise filtering of specific areas with real-time visual feedback</li>
          <li>Statistical outlier removal based on neighborhood analysis with adjustable neighbor count and standard deviation ratios</li>
          <li>Dynamic window sizing that automatically adapts to terrain complexity for more accurate ground detection</li>
          <li>Masking capabilities to protect and preserve critical features during filtering operations</li>
        </ul>
        
        <h3>Point Cloud Analysis</h3>
        <p>Gain deeper insights into your point cloud data with built-in analysis tools that extract meaningful information about terrain characteristics and surface properties.</p>
        
        <ul class="mt-4 space-y-2">
          <li>Statistical analysis of point distributions and density</li>
          <li>Surface roughness mapping for identifying terrain features</li>
          <li>Slope and aspect calculation for geomorphological assessment</li>
          <li>Feature extraction including ridges and valleys</li>
        </ul>
        
        <h3>Typical Workflow</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 my-8">
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">1</div>
            <h4 class="font-semibold mb-2 mt-2">Import & Merge</h4>
            <p class="text-sm">Import point clouds from multiple sources and formats, with custom attribute mapping and coordinate system transformation.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">2</div>
            <h4 class="font-semibold mb-2 mt-2">Filter & Clean</h4>
            <p class="text-sm">Apply our advanced morphological filtering with multi-attribute weighting to separate ground and non-ground points with precision.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">3</div>
            <h4 class="font-semibold mb-2 mt-2">Interactive Selection</h4>
            <p class="text-sm">Use polygon drawing and interactive tools to isolate areas of interest with real-time feedback and editing capabilities.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">4</div>
            <h4 class="font-semibold mb-2 mt-2">Analyze & Export</h4>
            <p class="text-sm">Extract insights with statistical analysis tools and export results in various formats for visualization and further processing.</p>
          </div>
        </div>
        
        <p>Whether you're working with aerial LiDAR, terrestrial laser scanning, or photogrammetrically derived point clouds, Cloud Canvas provides the comprehensive toolset you need to process, analyze, and extract value from even the largest and most complex point cloud datasets.</p>
      `
    },
    {
      id: "surface-modeling",
      title: "Surface Modeling",
      description: "Transform point clouds into accurate, high-quality 3D surface models with powerful mesh generation and optimization tools.",
      icon: "layers",
      detailContent: `
        <h2>Advanced Mesh Generation</h2>
        <p>Cloud Canvas provides industry-leading algorithms to convert point cloud data into precise 3D surface models. Whether you're working with aerial LiDAR data, terrestrial laser scans, or photogrammetric point clouds, our surface modeling tools will produce accurate digital terrain models and surface meshes optimized for your specific application.</p>
        
        <h3>Key Capabilities</h3>
        <p>Explore some of the powerful surface modeling capabilities below. Cloud Canvas includes over 25 specialized tools to handle every aspect of your workflow.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
              <h4 class="text-lg font-semibold">Points to Mesh Conversion</h4>
            </div>
            <p>Convert point cloud data into accurate triangulated mesh surfaces with precise control over mesh density and quality.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
              <h4 class="text-lg font-semibold">Mesh Optimization</h4>
            </div>
            <p>Refine mesh surfaces with advanced smoothing algorithms that preserve important terrain features while reducing noise.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              <h4 class="text-lg font-semibold">Mesh Decimation</h4>
            </div>
            <p>Intelligently reduce mesh complexity while maintaining surface accuracy for optimized visualization and analysis.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              <h4 class="text-lg font-semibold">Surface Remeshing</h4>
            </div>
            <p>Regenerate mesh surfaces with improved topology and more uniform triangulation for better analytical results.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="M21 11H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1"></path><path d="M9 19h12a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-1"></path><path d="M12 3v16"></path></svg>
              <h4 class="text-lg font-semibold">Mesh Clipping</h4>
            </div>
            <p>Extract regions of interest from larger mesh models using polygon selection tools and precise cutting planes.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"></path><path d="M8 3h6a2 2 0 0 1 2 2v3"></path><path d="M16 10H8a2 2 0 0 0-2 2v3"></path><path d="M22 12 17 7l-5 5"></path><path d="M17 7v10"></path></svg>
              <h4 class="text-lg font-semibold">Multi-Resolution Modeling</h4>
            </div>
            <p>Work with meshes at different levels of detail to balance performance and precision for your specific project needs.</p>
          </div>
        </div>
        
        <h3>Intelligent Mesh Smoothing</h3>
        <p>Cloud Canvas features an interactive gradient-based mesh smoothing system that gives you precise control over surface modification. This advanced tool allows you to selectively smooth, raise, or lower specific areas while preserving critical terrain features through an intuitive brush-based interface.</p>
        
        <ul class="mt-4 space-y-2">
          <li>Adaptive brush-based smoothing with adjustable radius and intensity for targeted modifications</li>
          <li>Normal-aware processing that follows the local surface geometry for natural-looking results</li>
          <li>Multiple smoothing modes including general smoothing, selective raising, and targeted lowering</li>
          <li>Real-time visual feedback as you apply smoothing operations to your meshes</li>
          <li>Undo/redo functionality for non-destructive editing with unlimited history steps</li>
        </ul>
        
        <h3>Adaptive Decimation</h3>
        <p>Optimize your 3D models while maintaining critical surface details with Cloud Canvas's mesh decimation technology. Our algorithm intelligently reduces triangle count using industry-standard Open3D libraries for high-quality results that balance performance and visual fidelity.</p>
        
        <ul class="mt-4 space-y-2">
          <li>Percentage-based reduction with user-defined target values</li>
          <li>Color preservation during the decimation process to maintain visual appearance</li>
          <li>Smart triangle removal that prioritizes flat areas while preserving detailed regions</li>
          <li>Interactive preview before committing changes to your mesh</li>
        </ul>
        
        <h3>Surface Comparison and Analysis</h3>
        <p>Compare multiple surface models to identify changes, calculate volumes, and analyze terrain evolution over time. Cloud Canvas provides powerful tools to quantify differences between surfaces and visualize results with intuitive color mapping.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <h4 class="text-md font-semibold">Volume Calculation</h4>
            </div>
            <p class="text-sm">Calculate precise volumes between surfaces using both prism-based and grid-based methods with customizable resolution settings.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
              <h4 class="text-md font-semibold">Surface Deviation</h4>
            </div>
            <p class="text-sm">Measure and visualize vertical distances between surfaces with color-coded deviation maps and statistical analysis.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M3 3v18h18"></path><path d="M3 12h18"></path><path d="M12 3v18"></path></svg>
              <h4 class="text-md font-semibold">Cut & Fill Analysis</h4>
            </div>
            <p class="text-sm">Identify and quantify areas of material removal (cut) and addition (fill) with detailed reports and visualizations.</p>
          </div>
        </div>
        
        <h3>Typical Workflow</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 my-8">
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">1</div>
            <h4 class="font-semibold mb-2 mt-2">Import & Prepare</h4>
            <p class="text-sm">Import filtered point cloud data and prepare it for mesh generation with optional hole tolerance settings.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">2</div>
            <h4 class="font-semibold mb-2 mt-2">Generate Mesh</h4>
            <p class="text-sm">Create high-quality triangulated surfaces using Delaunay triangulation with chunked processing for large datasets.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">3</div>
            <h4 class="font-semibold mb-2 mt-2">Refine Surface</h4>
            <p class="text-sm">Apply interactive smoothing and decimation tools to optimize mesh quality and performance.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">4</div>
            <h4 class="font-semibold mb-2 mt-2">Analyze & Export</h4>
            <p class="text-sm">Calculate volumes, generate contours, and export to your preferred format for further use.</p>
          </div>
        </div>
        
        <p>Our mesh modeling tools ensure you can create highly accurate surface representations from your point cloud data. The intelligent algorithms automatically adapt to data density variations to produce optimal results even with incomplete or noisy datasets, while supporting industry-standard formats like OBJ, STL, PLY, and VTK.</p>
      `
    },
    {
      id: "water-flow",
      title: "Water Flow Analysis",
      description: "Simulate and visualize water flow patterns across terrain for hydrological studies, watershed analysis, and flood risk assessment.",
      icon: "droplet",
      detailContent: `
        <h2>Advanced Hydrological Modeling</h2>
        <p>Cloud Canvas's Water Flow Analysis tools provide powerful capabilities for simulating how water interacts with terrain, enabling critical insights for environmental studies, engineering projects, and land management applications. Using physically-based models and high-performance algorithms, our software delivers accurate results that can inform decision-making and risk assessment.</p>
        
        <h3>Key Capabilities</h3>
        <p>Explore some of the powerful water flow analysis capabilities below. Cloud Canvas includes over 25 specialized tools to handle every aspect of your workflow.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              <h4 class="text-lg font-semibold">Flow Path Analysis</h4>
            </div>
            <p>Visualize water movement across terrain with streamlines generated from elevation gradients and flow direction.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><path d="M11 18H8a2 2 0 0 1-2-2V9"></path></svg>
              <h4 class="text-lg font-semibold">Topographic Wetness Index</h4>
            </div>
            <p>Calculate and visualize TWI to identify areas prone to water accumulation based on slope and flow accumulation.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              <h4 class="text-lg font-semibold">Flow Accumulation</h4>
            </div>
            <p>Identify areas with high flow accumulation where water converges and potentially forms streams or channels.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
              <h4 class="text-lg font-semibold">Adjustable Parameters</h4>
            </div>
            <p>Customize grid spacing, contour intervals, and streamline density to achieve optimal visualization results.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><circle cx="13.5" cy="6.5" r="4.5"></circle><circle cx="5.5" cy="12.5" r="4.5"></circle><circle cx="18.5" cy="19.5" r="4.5"></circle></svg>
              <h4 class="text-lg font-semibold">Customizable Colormaps</h4>
            </div>
            <p>Choose from a variety of colormaps to effectively visualize elevation data and hydrological indices.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              <h4 class="text-lg font-semibold">Slope & Aspect Analysis</h4>
            </div>
            <p>Calculate terrain slope and aspect to understand how they influence water flow direction and velocity.</p>
          </div>
        </div>
        
        <h3>Interactive Flow Visualization</h3>
        <p>Cloud Canvas brings water flow patterns to life with interactive visualizations that allow you to explore hydrological dynamics in detail. Our visualization tools help you communicate complex water flow behaviors to stakeholders and decision-makers.</p>
        
        <ul class="mt-4 space-y-2">
          <li>Terrain-based streamlines showing water flow direction across the landscape</li>
          <li>Customizable color maps for effective visualization of elevation and TWI data</li>
          <li>Interactive contour plots with adjustable contour intervals</li>
          <li>Topographic Wetness Index (TWI) visualization for identifying potential water accumulation areas</li>
        </ul>
        
        <h3>Water Flow Algorithms</h3>
        <p>Cloud Canvas implements hydrological analysis algorithms combined with gradient-based flow direction calculation. Our approach provides reliable results for understanding water movement across terrain surfaces.</p>
        
        <ul class="mt-4 space-y-2">
          <li>D8 flow direction model for accurate flow routing</li>
          <li>Depression handling using fill depressions and resolve flats functions</li>
          <li>Flow accumulation analysis to identify areas of concentrated water flow</li>
          <li>Variable density streamline generation with customizable parameters</li>
        </ul>
        
        <h3>Export and Visualization Options</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
              <h4 class="text-md font-semibold">Interactive Elevation Plot</h4>
            </div>
            <p class="text-sm">Visualize terrain elevation with contour lines and overlaid streamlines showing water flow direction.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M18 16.016V7.984a4 4 0 0 0-2.343-3.654l-6-3a4 4 0 0 0-3.314 0l-6 3A4 4 0 0 0 6 7.984v8.032a4 4 0 0 0 2.343 3.654l6 3a4 4 0 0 0 3.314 0l6-3A4 4 0 0 0 18 16.016"></path></svg>
              <h4 class="text-md font-semibold">TWI Visualization</h4>
            </div>
            <p class="text-sm">Analyze the Topographic Wetness Index to identify areas prone to water accumulation and saturation.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              <h4 class="text-md font-semibold">Export Capabilities</h4>
            </div>
            <p class="text-sm">Save visualizations as interactive HTML files or static images for inclusion in reports and presentations.</p>
          </div>
        </div>
        
        <h3>Typical Workflow</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 my-8">
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">1</div>
            <h4 class="font-semibold mb-2 mt-2">Load Terrain Data</h4>
            <p class="text-sm">Import 3D surface model for water flow analysis with optional downsampling for larger datasets.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">2</div>
            <h4 class="font-semibold mb-2 mt-2">Configure Parameters</h4>
            <p class="text-sm">Set grid spacing, contour interval, streamline density, and select colormap for visualization.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">3</div>
            <h4 class="font-semibold mb-2 mt-2">Process Terrain</h4>
            <p class="text-sm">The system performs flow direction calculation, depression filling, and hydrological index computation.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">4</div>
            <h4 class="font-semibold mb-2 mt-2">Visualize Results</h4>
            <p class="text-sm">Explore interactive plots showing elevation contours, streamlines, and TWI visualization.</p>
          </div>
        </div>
        
        <h3>Applications</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M17 12h.01"></path></svg>
              <h4 class="text-md font-semibold">Civil Engineering</h4>
            </div>
            <p class="text-sm">Design drainage systems, culverts, and retention ponds for effective stormwater management.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path></svg>
              <h4 class="text-md font-semibold">Environmental Management</h4>
            </div>
            <p class="text-sm">Assess erosion risk, identify sensitive habitat areas, and plan conservation measures.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M7 21h10"></path><rect x="2" y="3" width="20" height="14" rx="2"></rect></svg>
              <h4 class="text-md font-semibold">Flood Risk Assessment</h4>
            </div>
            <p class="text-sm">Identify flood-prone areas and evaluate the impact of potential flood events.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M20 22V8h-6L2 22"></path><path d="M6 10.5V4a2 2 0 0 1 2-2h8.5L22 7.5V10"></path><polyline points="2 15 7 9"></polyline></svg>
              <h4 class="text-md font-semibold">Agricultural Planning</h4>
            </div>
            <p class="text-sm">Optimize irrigation systems and land use based on natural water flow patterns.</p>
          </div>
        </div>
        
        <p>For environmental studies, flood risk assessment, or civil engineering projects, our water flow analysis tools provide the insights you need to make informed decisions about terrain and water interaction.</p>
      `
    },
    {
      id: "surface-compare",
      title: "Surface Compare",
      description: "Compare surface models to analyze elevation differences and calculate volumetric changes for earthwork estimation, mining progress tracking, and terrain analysis.",
      icon: "area-chart",
      detailContent: `
        <h2>Surface Comparison and Analysis</h2>
        <p>Cloud Canvas provides powerful surface comparison tools that help you analyze differences between terrain models captured at different times or representing different design scenarios. Our advanced comparison algorithms deliver detailed elevation difference maps with statistical analysis to support informed decision-making in engineering, mining, and environmental applications.</p>
        
        <h3>Key Capabilities</h3>
        <p>Explore the powerful surface comparison capabilities below that make Cloud Canvas an essential tool for terrain analysis and volume calculation.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              <h4 class="text-lg font-semibold">Flexible Reference Selection</h4>
            </div>
            <p>Choose either surface as the reference for comparison and control the direction of difference calculation.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="M2 20h.01"></path><path d="M7 20v-4"></path><path d="M12 20v-8"></path><path d="M17 20v-10"></path><path d="M22 20V8"></path></svg>
              <h4 class="text-lg font-semibold">Vertical Threshold Control</h4>
            </div>
            <p>Set maximum vertical distance thresholds for comparison to focus on relevant changes and eliminate noise.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
              <h4 class="text-lg font-semibold">Intelligent Point Matching</h4>
            </div>
            <p>Utilize advanced spatial indexing techniques to efficiently find corresponding points between surfaces for comparison.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><circle cx="13.5" cy="6.5" r="4.5"></circle><circle cx="5.5" cy="12.5" r="4.5"></circle><circle cx="18.5" cy="19.5" r="4.5"></circle></svg>
              <h4 class="text-lg font-semibold">Color-Coded Visualization</h4>
            </div>
            <p>View surface differences with customizable color scales to highlight areas of cut and fill or other elevation changes.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="M12 3v14"></path><path d="M5 10h14"></path><path d="M5 21h14"></path></svg>
              <h4 class="text-lg font-semibold">Statistical Analysis</h4>
            </div>
            <p>Automatically calculate key statistics including mean, median, standard deviation, minimum, and maximum elevation differences.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="M3 3v18h18"></path><path d="M18 12H9.5a2.5 2.5 0 0 1 0-5H18"></path><path d="M18 7h-3"></path><path d="M18 17h-3"></path></svg>
              <h4 class="text-lg font-semibold">Histogram Distribution</h4>
            </div>
            <p>Visualize the distribution of elevation differences to better understand the pattern and magnitude of surface changes.</p>
          </div>
        </div>
        
        <h3>Point-Based Comparison Technology</h3>
        <p>Cloud Canvas utilizes advanced comparison algorithms that efficiently analyze differences between surface models. The system uses sophisticated spatial indexing to find corresponding points between surfaces, calculating vertical differences to generate comprehensive comparison data.</p>
        
        <ul class="mt-4 space-y-2">
          <li>Smart point matching for accurate correspondence between surfaces</li>
          <li>Adjustable search radius to control the precision of point matching</li>
          <li>Efficient handling of large datasets through optimized spatial analysis</li>
          <li>Robust statistics calculated from all valid point comparisons</li>
        </ul>
        
        <h3>Interactive Visualization</h3>
        <p>Understand surface differences at a glance with Cloud Canvas's intuitive visualization tools. Our color-coded 3D display makes it easy to identify areas of significant change, with customizable color ranges to highlight specific elevation differences of interest.</p>
        
        <ul class="mt-4 space-y-2">
          <li>Customizable color scales with adjustable minimum and maximum values</li>
          <li>Intuitive color mapping showing cuts and fills in contrasting colors</li>
          <li>Interactive 3D visualization allowing rotation, zoom, and pan for detailed inspection</li>
          <li>Clear visualization of gaps for areas where comparisons couldn't be made</li>
        </ul>
        
        <h3>Comprehensive Analysis Results</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M5 3a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Z"></path><path d="M9 10a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H9Z"></path><path d="M7 14v-4"></path><path d="M17 14v-4"></path></svg>
              <h4 class="text-md font-semibold">Statistical Metrics</h4>
            </div>
            <p class="text-sm">Review mean, median, standard deviation, minimum, and maximum values of elevation differences between surfaces.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M20 16H3"></path><path d="M7 16V3"></path></svg>
              <h4 class="text-md font-semibold">Histogram Analysis</h4>
            </div>
            <p class="text-sm">Visualize the distribution of elevation differences to identify patterns and outliers in your data.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M20.5 7.2 16 6l-4-4-1.4 1.3m-.8 3L6 10l-4 7 .8.8L9 12l3.8-3.8"></path><path d="m10 16-6 6h9l1-1 2-4 3.5-1 2.5-3.5-2-4.5-3.5-1-4.2 1.7"></path><path d="m16 10 6-2-3-4.5L14.5 3"></path></svg>
              <h4 class="text-md font-semibold">Coverage Assessment</h4>
            </div>
            <p class="text-sm">Understand the completeness of your comparison with reporting on the number and percentage of valid difference calculations.</p>
          </div>
        </div>
        
        <h3>Typical Workflow</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 my-8">
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">1</div>
            <h4 class="font-semibold mb-2 mt-2">Select Surfaces</h4>
            <p class="text-sm">Choose the top (new) and bottom (old) surfaces for comparison from your loaded datasets.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">2</div>
            <h4 class="font-semibold mb-2 mt-2">Set Reference</h4>
            <p class="text-sm">Determine which surface will provide the X,Y coordinates for comparison points.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">3</div>
            <h4 class="font-semibold mb-2 mt-2">Configure Comparison</h4>
            <p class="text-sm">Set maximum vertical threshold and color scale range for optimal visualization.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">4</div>
            <h4 class="font-semibold mb-2 mt-2">Analyze Results</h4>
            <p class="text-sm">Review the color-coded difference model, statistics, and histogram for complete analysis.</p>
          </div>
        </div>
        
        <h3>Applications</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="m2 9 3-3 2 2 5-5 2 1V1H9l1 2-5 5 2 2-3 3-2-4"></path><path d="M16 10a2 2 0 0 1 2 2c0 1.3-2 4-2 4s-2-2.7-2-4a2 2 0 0 1 2-2"></path><path d="m22 2-5 5"></path><path d="m17 2 5 5"></path><path d="M7 21a4 4 0 0 1-4-4"></path><path d="M21 11c0 2.8-4 7-6 8.5 0 0-3 2.5-5-1"></path></svg>
              <h4 class="text-md font-semibold">Mining Operations</h4>
            </div>
            <p class="text-sm">Track material extraction by comparing terrain models from different time periods to quantify volume changes.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1"></path><path d="M12 19h4a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-4"></path><path d="M12 19a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H7"></path><path d="M5 3v1a2 2 0 0 0 2 2h1"></path><path d="M17 12V8a2 2 0 0 0-2-2h-1"></path><path d="M17 12h-2a2 2 0 0 0-2 2v1a2 2 0 0 1-2 2h-1"></path><path d="M12 5v14"></path></svg>
              <h4 class="text-md font-semibold">Construction & Earthworks</h4>
            </div>
            <p class="text-sm">Compare as-built surveys with design models to verify compliance and calculate completed work volumes.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M3 3h4v7.5a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5V3"></path><path d="M7 3h3v7.5a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5V3Z"></path><path d="M10 3h4v7.5a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5V3"></path><path d="M14 3h4v7.5a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5V3Z"></path><path d="M18 3h3v7.5a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5V3Z"></path><path d="M22 3a1 1 0 0 1 1 1v15a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1"></path><path d="M3 16h18"></path></svg>
              <h4 class="text-md font-semibold">Stockpile Monitoring</h4>
            </div>
            <p class="text-sm">Assess changes in material stockpiles over time to track inventory and material usage.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="m21 12-2 2-2-2 2-2 2 2Z"></path><path d="M7 12 5 10l2-2"></path><path d="M9 7h0"></path><path d="M15 7h0"></path><path d="m21 17-2 2-2-2 2-2 2 2Z"></path><path d="m7 17-2-2 2-2"></path><path d="M9 22h0"></path><path d="M15 22h0"></path><path d="M15 2a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Z"></path><path d="M9 2a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Z"></path></svg>
              <h4 class="text-md font-semibold">Erosion & Deposition Studies</h4>
            </div>
            <p class="text-sm">Identify areas of erosion or sediment deposition by analyzing terrain changes between surveys.</p>
          </div>
        </div>
        
        <p>Whether you're tracking mining progress, estimating earthwork volumes for construction, or monitoring terrain changes over time, our surface comparison tools provide accurate, visually compelling results to support your decision-making process. The intelligent difference calculation algorithms handle surfaces of different resolutions and extents, automatically compensating for alignment issues to deliver reliable results even with imperfect input data.</p>
      `
    },
    {
      id: "contour-generation",
      title: "Contour Generation",
      description: "Create precise contour lines from 3D models with customizable settings for topographic mapping, engineering design, and geospatial analysis.",
      icon: "map",
      detailContent: `
        <h2>Precision Contour Creation</h2>
        <p>Cloud Canvas delivers high-quality contour lines derived directly from your 3D surface models. Our contour generation algorithms ensure accurate representation of terrain features while providing extensive customization options to meet project-specific requirements. From simple elevation contours to complex specialized mapping, Cloud Canvas gives you complete control over your contour output.</p>
        
        <h3>Key Capabilities</h3>
        <p>Explore the powerful contour generation capabilities that make Cloud Canvas an essential tool for topographic mapping and terrain visualization.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
              <h4 class="text-lg font-semibold">Customizable Intervals</h4>
            </div>
            <p>Set precise major and minor contour intervals to capture terrain details at your preferred resolution.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><polygon points="12 3 19 10 12 17 5 10 12 3"></polygon></svg>
              <h4 class="text-lg font-semibold">Vector Output</h4>
            </div>
            <p>Generate contours as vector data for seamless integration with CAD and GIS workflows.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><circle cx="13.5" cy="6.5" r="4.5"></circle><circle cx="5.5" cy="12.5" r="4.5"></circle><circle cx="18.5" cy="19.5" r="4.5"></circle></svg>
              <h4 class="text-lg font-semibold">Color Customization</h4>
            </div>
            <p>Select custom colors for both major and minor contour lines to create visually distinct elevation indicators.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="M3 6c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v0Z"></path><path d="M3 16c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v0Z"></path><path d="M17 16c0-1.1.9-2 2-2h0a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2v0Z"></path><path d="M9 16a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2v0Z"></path><path d="M12 12v-2"></path><path d="M7 12V8"></path><path d="M17 12v-2"></path></svg>
              <h4 class="text-lg font-semibold">Major/Minor Styling</h4>
            </div>
            <p>Apply different line weights and styling to major and minor contours for clear elevation visualization.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
              <h4 class="text-lg font-semibold">Elevation Labeling</h4>
            </div>
            <p>Automatically generate elevation labels along contours with options to label major, minor, or both contour types.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="M14 3v4a1 1 0 0 0 1 1h4"></path><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z"></path><path d="m8 11 4 4 4-4"></path><path d="M12 15v-7"></path></svg>
              <h4 class="text-lg font-semibold">DXF Export</h4>
            </div>
            <p>Export contours to industry-standard DXF format with preserved styling for CAD software compatibility.</p>
          </div>
        </div>
        
        <h3>Intelligent Contouring</h3>
        <p>Cloud Canvas implements sophisticated contouring algorithms that generate accurate, smooth contour lines directly from triangulated mesh surfaces. Our approach preserves critical terrain features while ensuring aesthetically pleasing results suitable for both technical analysis and presentation.</p>
        
        <ul class="mt-4 space-y-2">
          <li>Surface-based contouring for highly accurate elevation representation</li>
          <li>Automatic level calculation based on elevation range and specified intervals</li>
          <li>Separate control for major and minor contour generation</li>
          <li>Optimized processing capable of handling large-scale surface models efficiently</li>
        </ul>
        
        <h3>Contour Styling and Enhancement</h3>
        <p>Go beyond basic contours with Cloud Canvas's comprehensive styling and enhancement options. Customize the appearance of your contours to create professional-grade topographic maps that communicate elevation information clearly and effectively.</p>
        
        <ul class="mt-4 space-y-2">
          <li>Distinct styling for major/minor contours with different line weights and colors</li>
          <li>Selectable color schemes via an intuitive color picker interface</li>
          <li>Strategic label placement that optimizes readability across the map</li>
          <li>Interactive visibility control to show or hide contour elements as needed</li>
        </ul>
        
        <h3>Integration with Analysis Tools</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8"></path><path d="M9 4H4v5"></path><path d="m3 3 6 6"></path><path d="M4 14v5h16v-7"></path><path d="M10 4h10v8"></path></svg>
              <h4 class="text-md font-semibold">3D Visualization</h4>
            </div>
            <p class="text-sm">Display contours directly on 3D surface models for enhanced terrain understanding and presentation.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M8.4 10.6a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2"></path><path d="M18.9 17.1a2.1 2.1 0 1 0-.7-4A2.1 2.1 0 0 0 19 17"></path><path d="m2 2 20 20"></path><path d="M4.9 4.8a8 8 0 0 1 7.5-2.5"></path><path d="M15 7a8 8 0 0 1 3 6"></path><path d="M9 21a8 8 0 0 1-7-4"></path></svg>
              <h4 class="text-md font-semibold">Hydrological Analysis</h4>
            </div>
            <p class="text-sm">Combine contours with water flow analysis for comprehensive watershed and drainage studies.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M6 4a2 2 0 0 1 4 0v1"></path><path d="M12 17v4"></path><path d="M5 12 2 9l3-3"></path><path d="M19 12l3-3-3-3"></path><path d="M2 9h20"></path><path d="M10 5v12"></path><path d="M14 5V9"></path><path d="M14 13v4"></path></svg>
              <h4 class="text-md font-semibold">Profile Generation</h4>
            </div>
            <p class="text-sm">Extract elevation profiles along any path while visualizing the intersection with contour lines.</p>
          </div>
        </div>
        
        <h3>Typical Workflow</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 my-8">
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">1</div>
            <h4 class="font-semibold mb-2 mt-2">Select Surface</h4>
            <p class="text-sm">Choose the 3D surface model from which to generate contours.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">2</div>
            <h4 class="font-semibold mb-2 mt-2">Configure Settings</h4>
            <p class="text-sm">Define major and minor contour intervals, colors, and label visibility options.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">3</div>
            <h4 class="font-semibold mb-2 mt-2">Generate Contours</h4>
            <p class="text-sm">Process the surface to create vector contour lines based on your settings.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">4</div>
            <h4 class="font-semibold mb-2 mt-2">Refine & Export</h4>
            <p class="text-sm">Adjust styling if needed and export contours to DXF format.</p>
          </div>
        </div>
        
        <h3>Applications</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M12 18V2"></path><path d="M8 6.4 12 2l4 4.4"></path><path d="M20 14v4a1 1 0 0 1-1 1h-2v-5"></path><path d="M13 10h9"></path><path d="M9 10H1"></path><path d="M4 22a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M4 18v-7"></path></svg>
              <h4 class="text-md font-semibold">Topographic Mapping</h4>
            </div>
            <p class="text-sm">Create accurate topographic maps for land surveying, outdoor recreation, and planning.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M15 3H8a5 5 0 0 0 0 10h2a5 5 0 0 1 0 10H6"></path><path d="M8 21h8"></path><path d="M8 13h8"></path></svg>
              <h4 class="text-md font-semibold">Civil Engineering</h4>
            </div>
            <p class="text-sm">Design roads, drainage systems, and site developments with precise elevation data.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M9 10h.01"></path><path d="M15 10h.01"></path><path d="M12 10h.01"></path><path d="M9 14h.01"></path><path d="M15 14h.01"></path><path d="M12 14h.01"></path><path d="M19 5v14H5V5h14Z"></path></svg>
              <h4 class="text-md font-semibold">Mining & Excavation</h4>
            </div>
            <p class="text-sm">Plan and monitor mining operations with accurate elevation contours.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M2 22V12c0-5.5 4.5-10 10-10s10 4.5 10 10v10"></path><path d="M2 22h20"></path><path d="M12 2v4.4"></path><path d="M20 12h-8l-2 2-2-2H2"></path></svg>
              <h4 class="text-md font-semibold">Environmental Analysis</h4>
            </div>
            <p class="text-sm">Study terrain characteristics for environmental impact assessments and land management.</p>
          </div>
        </div>
        
        <p>Our contour generation tools create clean, cartographically pleasing contour lines that clearly represent terrain while maintaining spatial accuracy. Advanced smoothing algorithms eliminate jagged edges and artifacts while preserving important terrain features, allowing you to instantly visualize contours with different intervals and settings to find the optimal representation for your specific needs.</p>
      `
    },
    {
      id: "profile-tools",
      title: "Profile & Cross-Section Tools",
      description: "Extract and analyze precise elevation profiles and cross-sections from any 3D surface for engineering design, terrain analysis, and site planning.",
      icon: "ruler",
      detailContent: `
        <h2>Advanced Profile Analysis</h2>
        <p>Cloud Canvas provides powerful tools for extracting and analyzing elevation profiles and cross-sections from 3D surface models. Whether you're designing roads, planning excavations, or analyzing terrain characteristics, our profile tools give you detailed insights into surface variations along any specified path.</p>
        
        <h3>Key Capabilities</h3>
        <p>Explore the powerful profile and cross-section tools that make Cloud Canvas an essential solution for terrain analysis and engineering design.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"></path></svg>
              <h4 class="text-lg font-semibold">Interactive Path Drawing</h4>
            </div>
            <p>Create profile lines interactively by drawing directly on the 3D model with point-by-point placement.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path><path d="M13 6h6l2 2-8 8-4-4"></path></svg>
              <h4 class="text-lg font-semibold">Multi-Point Profiles</h4>
            </div>
            <p>Generate profiles with multiple vertices to follow complex paths across terrain surfaces.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"></path><path d="M22 21H7"></path><path d="m5 11 9 9"></path></svg>
              <h4 class="text-lg font-semibold">Multi-Surface Analysis</h4>
            </div>
            <p>Compare multiple surfaces along the same profile line with distinct color-coded plots for comprehensive analysis.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="M21 21H3"></path><path d="M6 16a6 5 0 1 1 12 0"></path><path d="M11 3v7"></path><path d="M13 7V3"></path></svg>
              <h4 class="text-lg font-semibold">Vertical Exaggeration</h4>
            </div>
            <p>Adjust vertical scaling with an interactive slider to highlight subtle terrain variations for better visualization.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><path d="M20 19v-7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7"></path><path d="M4 22h16"></path><path d="M12 12V8"></path><path d="m2 2 20 7"></path></svg>
              <h4 class="text-lg font-semibold">Path Saving</h4>
            </div>
            <p>Save profile paths as JSON files for reuse in future analysis sessions and consistent monitoring locations.</p>
          </div>
          
          <div class="bg-background p-6 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              <h4 class="text-lg font-semibold">Interactive HTML Export</h4>
            </div>
            <p>Export profiles as interactive HTML documents that preserve visualization capabilities and adjustable settings.</p>
          </div>
        </div>
        
        <h3>Interactive Profile Creation</h3>
        <p>Cloud Canvas offers an intuitive interface for creating profile lines directly on your 3D surface models. The interactive drawing tools let you precisely place profile points along specific paths of interest, ensuring you capture exactly the terrain information you need.</p>
        
        <ul class="mt-4 space-y-2">
          <li>Point-by-point placement for precise profile line definition</li>
          <li>Visual feedback with highlighted points and connecting lines</li>
          <li>Path reset option to start over if needed</li>
          <li>Path saving capability to store profile lines for future use</li>
        </ul>
        
        <h3>Comprehensive Profile Visualization</h3>
        <p>Once generated, Cloud Canvas provides powerful visualization tools for analyzing your elevation profiles. Examine surface characteristics across multiple datasets with our interactive plotting interface.</p>
        
        <ul class="mt-4 space-y-2">
          <li>Dual-view display showing both profile and plan views simultaneously</li>
          <li>Color-coded surface lines for clear differentiation between multiple surfaces</li>
          <li>Interactive zoom and pan for detailed examination of specific regions</li>
          <li>Adjustable vertical exaggeration via an interactive slider</li>
        </ul>
        
        <h3>Multiple Surface Comparison</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M10 3H6a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h4"></path><path d="M18 3h-4"></path><path d="M14 21h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-4"></path></svg>
              <h4 class="text-md font-semibold">Surface Selection</h4>
            </div>
            <p class="text-sm">Choose multiple surface models to compare in a single profile view with an intuitive selection interface.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M4 4v16"></path><path d="M9 4v16"></path><path d="M14 4v16"></path><path d="M19 4v16"></path><path d="M4 9h16"></path><path d="M4 14h16"></path></svg>
              <h4 class="text-md font-semibold">Distinct Visualization</h4>
            </div>
            <p class="text-sm">View each surface with a different color for clear differentiation and easy comparison of elevation differences.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path><path d="M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"></path><path d="M16.2 7.8c2.3 2.4 2.3 6.2 0 8.5"></path><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"></path></svg>
              <h4 class="text-md font-semibold">Common Reference</h4>
            </div>
            <p class="text-sm">Analyze all surfaces along the exact same path for direct and accurate comparison of elevation variations.</p>
          </div>
        </div>
        
        <h3>Interactive Outputs</h3>
        <p>Cloud Canvas provides feature-rich interactive outputs that go beyond static images, allowing continued analysis and exploration even after profile generation.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M3 9h18"></path><path d="M3 15h18"></path><path d="M8 3v18"></path><path d="M16 3v18"></path></svg>
              <h4 class="text-md font-semibold">HTML Export</h4>
            </div>
            <p class="text-sm">Save profiles as interactive HTML documents that can be viewed in any web browser with full functionality preserved.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M5 12a7 7 0 1 0 14 0 7 7 0 0 0-14 0Z"></path><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              <h4 class="text-md font-semibold">Adjustable Settings</h4>
            </div>
            <p class="text-sm">Export includes interactive controls that allow continued adjustment of vertical exaggeration and other display parameters.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"></path><path d="M8 3h6a2 2 0 0 1 2 2v8"></path><path d="m21 16-5-5-5 5"></path><path d="M16 21v-5"></path></svg>
              <h4 class="text-md font-semibold">Shareable Results</h4>
            </div>
            <p class="text-sm">Create self-contained files that can be shared with clients or team members who don't have Cloud Canvas installed.</p>
          </div>
        </div>
        
        <h3>Typical Workflow</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 my-8">
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">1</div>
            <h4 class="font-semibold mb-2 mt-2">Select Surfaces</h4>
            <p class="text-sm">Choose one or more 3D surface models to analyze with the profile tool.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">2</div>
            <h4 class="font-semibold mb-2 mt-2">Draw Profile Path</h4>
            <p class="text-sm">Place points directly on the 3D model to define the profile path, or load a previously saved path.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">3</div>
            <h4 class="font-semibold mb-2 mt-2">Configure Display</h4>
            <p class="text-sm">Set vertical exaggeration and other display parameters to optimize visualization.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100 relative">
            <div class="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center absolute -top-3 -left-3">4</div>
            <h4 class="font-semibold mb-2 mt-2">Save & Export</h4>
            <p class="text-sm">Save the profile as an interactive HTML document for further analysis and sharing.</p>
          </div>
        </div>
        
        <h3>Applications</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
              <h4 class="text-md font-semibold">Road Design</h4>
            </div>
            <p class="text-sm">Create longitudinal profiles for road corridor design and earthwork calculation.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M6 20h4M10 20h4M14 20h4M12 4v6.5M12 10.5v3M8.8 8.8a2.5 2.5 0 1 0 3.4-3.4l-2.7 2.7-3-3-4.5 4.5a2.5 2.5 0 1 0 3.5 3.5L8.2 9.3"></path><path d="m18.2 17-5.1-5"M22 8s-.5-1.5-2-2-3 0-3 0L11 13c0 3 2 5 5 5 3 0 6-3 6-3s-1-1-3-1c-1 0-1.5.5-1.5.5"></path></svg>
              <h4 class="text-md font-semibold">Hydraulic Engineering</h4>
            </div>
            <p class="text-sm">Analyze river, channel, and drainage profiles for flood studies and hydraulic design.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="m21 12-9-9-9 9"></path><path d="m21 16-9-9-9 9"></path><path d="M4 14h6v8h4v-8h6"></path></svg>
              <h4 class="text-md font-semibold">Geological Analysis</h4>
            </div>
            <p class="text-sm">Examine terrain profiles to identify geological features and landform characteristics.</p>
          </div>
          
          <div class="bg-background p-4 rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 9.5 2Z"></path><path d="M14.5 2A2.5 2.5 0 0 1 17 4.5v15a2.5 2.5 0 0 1-5 0"></path></svg>
              <h4 class="text-md font-semibold">Mining Operations</h4>
            </div>
            <p class="text-sm">Create profiles through mines and quarries to track progress and plan operations.</p>
          </div>
        </div>
        
        <p>Whether you're designing roads, analyzing drainage patterns, or planning excavation, our profile tools give you the detailed vertical information you need to make precise decisions. The interactive profile viewer allows you to measure distances and elevations at any point, and the batch processing capabilities make it easy to create standardized cross-sections for even the largest projects.</p>
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
              <div className="bg-slate-800 text-white px-8 py-10 rounded-lg mb-10">
                <div className="inline-block bg-blue-500/20 text-blue-400 rounded-full px-3 py-1 text-sm font-medium mb-4">
                  Feature
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{feature.title}</h1>
                <p className="text-xl text-slate-300">{feature.description}</p>
                <div className="absolute top-6 right-6">
                  {getIcon(feature.icon)}
                </div>
              </div>
              
              <div className="prose prose-lg max-w-none mb-12">
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
