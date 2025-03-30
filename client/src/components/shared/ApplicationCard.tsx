import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { Application } from "@/types";

interface ApplicationCardProps {
  application: Application;
}

const ApplicationCard = ({ application }: ApplicationCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-xl font-bold mb-3 text-primary">{application.title}</h3>
      <p className="text-gray-600 mb-4">{application.description}</p>
      {application.link && (
        <Link href={application.link}>
          <a className="text-accent hover:underline inline-flex items-center">
            Learn More
            <ChevronRight className="h-4 w-4 ml-1" />
          </a>
        </Link>
      )}
    </div>
  );
};

export default ApplicationCard;
