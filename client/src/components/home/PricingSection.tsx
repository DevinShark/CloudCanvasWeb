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
      id: "trial",
      name: "Trial",
      description: "Try Cloud Canvas free for 7 days. No credit card required.",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "Single user license",
        "7-day full access to all features",
        "Email support"
      ]
    },
    {
      id: "standard",
      name: "Standard",
      description: "For individuals who need full access on a monthly or annual basis.",
      monthlyPrice: 75,
      annualPrice: 60 * 12, // $60 * 12 = $720
      features: [
        "Single user license",
        "Full access to all features",
        "Email support",
        "Monthly recurring subscription"
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For teams and organizations needing multiple licenses and priority support.",
      monthlyPrice: 300,
      annualPrice: 240 * 12, // $240 * 12 = $2880
      features: [
        "5 user licenses (bulk discount)",
        "Full access to all features",
        "Priority email support",
        "Suggest tool implementation requests for future releases"
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
