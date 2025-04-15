import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PricingPlan } from "@/types";

interface PricingCardProps {
  plan: PricingPlan;
  isAnnual: boolean;
}

// Helper to check login status (simple localStorage/session check, or replace with your auth logic)
function isLoggedIn() {
  // This is a placeholder. Replace with your actual auth check if needed.
  return !!localStorage.getItem("authToken") || !!sessionStorage.getItem("authToken");
}

const PricingCard = ({ plan, isAnnual }: PricingCardProps) => {
  const price = isAnnual ? plan.annualPrice / 12 : plan.monthlyPrice;
  const totalPrice = isAnnual ? plan.annualPrice : null;

  // Special logic for Trial plan button
  let buttonHref = `/checkout/${plan.id}`;
  let buttonText = `Choose ${plan.name}`;
  if (plan.id === "trial") {
    buttonHref = isLoggedIn() ? "/dashboard" : "/register";
    buttonText = "Start Free Trial";
  }

  return (
    <div
      className={cn(
        "bg-background rounded-lg shadow-md overflow-hidden",
        plan.isPopular ? "transform scale-105 border-2 border-accent shadow-xl" : ""
      )}
    >
      {plan.isPopular && (
        <div className="bg-accent text-white text-center py-2 text-sm font-medium">
          MOST POPULAR
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-primary mb-2">{plan.name}</h3>
        <p className="text-gray-600 mb-6">{plan.description}</p>
        
        <div className="mb-6">
          <span className="text-4xl font-bold">{plan.id === "trial" ? "Free" : `$${price}`}</span>
          {plan.id !== "trial" && <span className="text-gray-600">/month</span>}
          {isAnnual && plan.id !== "trial" && (
            <p className="text-sm text-gray-500 mt-1">
              Billed annually (${totalPrice})
            </p>
          )}
        </div>
        
        <ul className="space-y-3 mb-8">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-secondary mr-2" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="px-6 pb-6">
        <Link href={buttonHref}>
          <Button
            className={cn(
              "w-full",
              plan.isPopular
                ? "bg-accent text-white hover:bg-opacity-90"
                : "border-2 border-primary text-primary hover:bg-primary hover:text-white"
            )}
            variant={plan.isPopular ? "default" : "outline"}
          >
            {buttonText}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PricingCard;
