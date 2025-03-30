import { WorkflowStep as WorkflowStepType } from "@/types";

interface WorkflowStepProps {
  step: WorkflowStepType;
}

const WorkflowStep = ({ step }: WorkflowStepProps) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="step-circle mb-4">{step.number}</div>
      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
      <p className="text-gray-600">{step.description}</p>
    </div>
  );
};

export default WorkflowStep;
