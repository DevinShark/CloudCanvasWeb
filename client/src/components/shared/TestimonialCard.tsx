import { Star } from "lucide-react";
import { Testimonial } from "@/types";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < testimonial.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
          />
        ))}
      </div>
      
      <p className="text-gray-600 mb-6">"{testimonial.quote}"</p>
      
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-gray-300 mr-3">
          {/* Placeholder avatar using initials */}
          <div className="h-full w-full rounded-full flex items-center justify-center bg-primary text-white">
            {testimonial.author.charAt(0)}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium">{testimonial.author}</h4>
          <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
