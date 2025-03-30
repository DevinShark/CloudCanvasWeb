import WorkflowStep from "@/components/shared/WorkflowStep";
import { WorkflowStep as WorkflowStepType } from "@/types";

const WorkflowSection = () => {
  const workflowSteps: WorkflowStepType[] = [
    {
      id: "import",
      number: 1,
      title: "Import Data",
      description: "Import point clouds, meshes, and ortho imagery from various industry-standard formats."
    },
    {
      id: "process",
      number: 2,
      title: "Process & Analyze",
      description: "Clean, filter, and transform your data with advanced algorithms and visualization tools."
    },
    {
      id: "generate",
      number: 3,
      title: "Generate Results",
      description: "Create professional outputs including surface models, contours, and analytical reports."
    },
    {
      id: "export",
      number: 4,
      title: "Export & Share",
      description: "Export to industry-standard formats including DXF, ASC, and LAS for seamless integration."
    }
  ];

  return (
    <section id="workflow" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Streamlined Workflow</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our intuitive workflow takes you from raw data to professional results in just four simple steps.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {workflowSteps.map((step) => (
            <WorkflowStep key={step.id} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
