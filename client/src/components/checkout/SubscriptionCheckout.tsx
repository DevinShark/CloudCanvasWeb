import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import PayPalButton from "./PayPalButton";
import { formatCurrency } from "@/lib/utils";
import { PricingPlan } from "@/types";

interface SubscriptionCheckoutProps {
  plan: PricingPlan;
}

const SubscriptionCheckout = ({ plan }: SubscriptionCheckoutProps) => {
  const [billingType, setBillingType] = useState<"annual" | "monthly">("annual");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const annualPrice = plan.annualPrice;
  const monthlyPrice = plan.monthlyPrice;
  
  const selectedPrice = billingType === "annual" ? annualPrice : monthlyPrice;
  const monthlyAmount = billingType === "annual" ? (annualPrice / 12) : monthlyPrice;
  
  // Calculate savings percentage for annual billing
  const savingsPercentage = Math.round(((monthlyPrice * 12 - annualPrice) / (monthlyPrice * 12)) * 100);

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Subscribe to {plan.name}</CardTitle>
          <CardDescription>
            {plan.name === 'Standard' && (
              <>
                For individuals who need full access on a monthly or annual basis.
              </>
            )}
            {plan.name === 'Enterprise' && (
              <>
                For teams and organizations needing multiple licenses and priority support.
              </>
            )}
            {plan.name !== 'Standard' && plan.name !== 'Enterprise' && (
              <>Choose your preferred billing cycle</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={billingType}
            onValueChange={(value) => setBillingType(value as "annual" | "monthly")}
            className="space-y-4"
          >
            <div className="flex items-start p-4 border rounded-lg space-x-3 cursor-pointer hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="annual" id="annual" className="mt-1" />
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <Label htmlFor="annual" className="font-medium cursor-pointer">
                    Annual Billing
                  </Label>
                  <div className="text-right">
                    <span className="font-bold text-lg">{formatCurrency(annualPrice)}</span>
                    <span className="text-gray-500 text-sm">/year</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {formatCurrency(annualPrice / 12)} per month, billed annually
                </p>
                <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Save {savingsPercentage}%
                </div>
              </div>
            </div>
            
            <div className="flex items-start p-4 border rounded-lg space-x-3 cursor-pointer hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="monthly" id="monthly" className="mt-1" />
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <Label htmlFor="monthly" className="font-medium cursor-pointer">
                    Monthly Billing
                  </Label>
                  <div className="text-right">
                    <span className="font-bold text-lg">{formatCurrency(monthlyPrice)}</span>
                    <span className="text-gray-500 text-sm">/month</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Billed monthly, cancel anytime
                </p>
              </div>
            </div>
          </RadioGroup>
          
          <div className="border-t pt-6">
            <div className="space-y-2 mb-6">
              <h3 className="font-medium">Plan Features:</h3>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span>{formatCurrency(selectedPrice)}</span>
              </div>
              <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-medium">
                <span>Total due today:</span>
                <span>{formatCurrency(selectedPrice)}</span>
              </div>
            </div>
            
            <PayPalButton
              plan={plan.id}
              billingType={billingType}
              amount={selectedPrice}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />
            
            <p className="text-xs text-gray-500 text-center mt-4">
              By subscribing, you agree to our Terms of Service and Privacy Policy.
              You'll be charged {formatCurrency(selectedPrice)} for your {billingType} subscription.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionCheckout;
