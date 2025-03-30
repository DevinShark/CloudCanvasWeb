import TestimonialCard from "@/components/shared/TestimonialCard";
import { Testimonial } from "@/types";

const TestimonialsSection = () => {
  const testimonials: Testimonial[] = [
    {
      id: "1",
      quote: "Cloud Canvas has completely transformed our workflow. The surface modeling tools save us countless hours on every project.",
      author: "Michael Johnson",
      role: "Senior Surveyor",
      company: "GeoTech Solutions",
      rating: 5
    },
    {
      id: "2",
      quote: "The water flow analysis tools have been invaluable for our environmental impact studies. The visualization capabilities are unmatched.",
      author: "Sarah Thompson",
      role: "Environmental Engineer",
      company: "EcoSystems Inc.",
      rating: 5
    },
    {
      id: "3",
      quote: "The contour generation and volume calculation tools have revolutionized how we track mining progress. Customer support is also excellent.",
      author: "David Rodriguez",
      role: "Operations Manager",
      company: "Minerals Ltd.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join thousands of professionals who trust Cloud Canvas for their geospatial data processing needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
