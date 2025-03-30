import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SubscriptionCheckout from "@/components/checkout/SubscriptionCheckout";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/auth";
import { PricingPlan } from "@/types";

const CheckoutPage = () => {
  const { plan } = useParams();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is authenticated
  const { data: user, isLoading: isAuthLoading, isError } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser,
    retry: 1,
  });
  
  // Plans data
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
  
  // Find the selected plan
  const selectedPlan = plans.find(p => p.id === plan);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (isError) {
      navigate(`/login?redirect=/checkout/${plan}`);
    }
    
    // Redirect to pricing if plan is invalid
    if (!isAuthLoading && !isLoading && !selectedPlan) {
      navigate("/#pricing");
    }
    
    setIsLoading(false);
  }, [isError, navigate, plan, selectedPlan, isAuthLoading, isLoading]);
  
  if (isAuthLoading || isLoading) {
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
          {selectedPlan ? (
            <SubscriptionCheckout plan={selectedPlan} />
          ) : (
            <div className="max-w-md mx-auto text-center">
              <h2 className="text-2xl font-bold text-primary mb-4">Plan Not Found</h2>
              <p className="text-gray-600 mb-6">The selected plan is not available. Please choose a valid plan.</p>
              <Button onClick={() => navigate("/#pricing")}>
                View Available Plans
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CheckoutPage;
