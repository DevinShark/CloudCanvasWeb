import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import PricingCard from "@/components/shared/PricingCard";
import { PricingPlan } from "@/types";

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  
  const plans: PricingPlan[] = [
    {
      id: "standard",
      name: "Standard",
      description: "Perfect for individual professionals",
      monthlyPrice: 59,
      annualPrice: 708, // $59 * 12
      features: [
        "Single user license",
        "Core processing tools",
        "5GB cloud storage",
        "Email support"
      ]
    },
    {
      id: "professional",
      name: "Professional",
      description: "For advanced users with complex needs",
      monthlyPrice: 99,
      annualPrice: 1188, // $99 * 12
      features: [
        "Single user license",
        "All processing tools",
        "20GB cloud storage",
        "Priority email & phone support",
        "Advanced analytics features"
      ],
      isPopular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For teams and organizations",
      monthlyPrice: 249,
      annualPrice: 2988, // $249 * 12
      features: [
        "5 user licenses",
        "All processing tools + API access",
        "100GB cloud storage",
        "24/7 dedicated support",
        "Custom integration support"
      ]
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Choose the plan that works best for your needs, with no hidden fees or complicated licensing.
          </p>
          
          <div className="flex justify-center mt-8 space-x-4">
            <Button
              variant={isAnnual ? "default" : "outline"}
              className={isAnnual ? "bg-accent text-white" : ""}
              onClick={() => setIsAnnual(true)}
            >
              Annual
            </Button>
            <Button
              variant={!isAnnual ? "default" : "outline"}
              className={!isAnnual ? "bg-accent text-white" : ""}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <PricingCard 
              key={plan.id} 
              plan={plan} 
              isAnnual={isAnnual} 
            />
          ))}
        </div>
        
        <div className="mt-12 max-w-3xl mx-auto bg-background rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold text-primary mb-3">Need a custom solution?</h3>
          <p className="text-gray-600 mb-6">
            Contact us for custom pricing and deployment options tailored to your organization's specific requirements.
          </p>
          <Link href="#contact">
            <Button className="bg-primary text-white hover:bg-opacity-90 transition-colors duration-200">
              Contact Sales
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
