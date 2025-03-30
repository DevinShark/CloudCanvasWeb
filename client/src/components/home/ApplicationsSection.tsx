import ApplicationCard from "@/components/shared/ApplicationCard";
import { Application } from "@/types";

const ApplicationsSection = () => {
  const applications: Application[] = [
    {
      id: "mining",
      title: "Mining & Excavation",
      description: "Track progress, calculate volumes, and plan mining operations with precision.",
      link: "#"
    },
    {
      id: "surveying",
      title: "Surveying & Mapping",
      description: "Process and visualize survey data from various sources into accurate 3D models.",
      link: "#"
    },
    {
      id: "civil",
      title: "Civil Engineering",
      description: "Design, analyze and monitor infrastructure projects with comprehensive 3D tools.",
      link: "#"
    },
    {
      id: "environmental",
      title: "Environmental Monitoring",
      description: "Track changes in terrain, water bodies, and vegetation over time.",
      link: "#"
    }
  ];

  return (
    <section id="applications" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Industry Applications
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Cloud Canvas is designed to serve professionals across various industries with specialized tools for each sector.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {applications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ApplicationsSection;
