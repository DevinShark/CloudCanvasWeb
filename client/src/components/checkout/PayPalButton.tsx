import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createSubscription } from "@/lib/paypal";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface PayPalButtonProps {
  plan: string;
  billingType: string;
  amount: number;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
}

const PayPalButton = ({
  plan,
  billingType,
  amount,
  isProcessing,
  setIsProcessing
}: PayPalButtonProps) => {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  // Function to handle PayPal checkout
  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Call API to create a PayPal subscription
      const approvalUrl = await createSubscription(plan, billingType);
      
      // Redirect to PayPal for payment
      window.location.href = approvalUrl;
    } catch (err) {
      console.error("PayPal checkout error:", err);
      setError("Failed to initialize PayPal checkout. Please try again.");
      toast({
        title: "Checkout Error",
        description: "There was a problem starting the checkout process. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      
      <Button
        onClick={handleCheckout}
        disabled={isProcessing}
        className="w-full bg-[#0070ba] hover:bg-[#005ea6] h-12 space-x-2"
      >
        {isProcessing ? (
          <>Processing...</>
        ) : (
          <>
            <span>Checkout with</span>
            <span className="font-bold">PayPal</span>
          </>
        )}
      </Button>
      
      <div className="relative flex items-center justify-center">
        <div className="border-t border-gray-200 w-full"></div>
        <span className="bg-white px-3 text-xs text-gray-500 absolute">OR</span>
      </div>
      
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setLocation("/#pricing")}
        disabled={isProcessing}
      >
        Cancel
      </Button>
      
      <div className="flex items-center justify-center space-x-4">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className="h-6 w-6 text-gray-400">
          <path fill="currentColor" d="M470.1 231.3s7.6 37.2 9.3 45H446c3.3-8.9 16-43.5 16-43.5-.2.3 3.3-9.1 5.3-14.9l2.8 13.4zM576 80v352c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V80c0-26.5 21.5-48 48-48h480c26.5 0 48 21.5 48 48zM152.5 331.2L215.7 176h-42.5l-39.3 106-4.3-21.5-14-71.4c-2.3-9.9-9.4-12.7-18.2-13.1H32.7l-.7 3.1c15.9 4 29.5 9.8 42.3 17.1l35.7 135h42.8zm94.5.2L272.1 176h-40.2l-25.1 155.4h40.1zm139.9-50.8c.2-17.7-10.6-31.2-33.7-42.3-14.1-7.1-22.7-11.9-22.7-19.2.2-6.6 7.3-13.4 23.1-13.4 13.1-.3 22.7 2.8 29.9 5.9l3.6 1.7 5.5-33.6c-7.9-3.1-20.5-6.6-36-6.6-39.7 0-67.6 21.2-67.8 51.4-.3 22.3 20 34.7 35.2 42.2 15.5 7.6 20.8 12.6 20.8 19.3-.2 10.4-12.6 15.2-24.1 15.2-16 0-24.6-2.5-37.7-8.3l-5.3-2.5-5.6 34.9c9.4 4.3 26.8 8.1 44.8 8.3 42.2.1 69.7-20.8 70-53zM528 331.4L495.6 176h-31.1c-9.6 0-16.9 2.8-21 12.9l-59.7 142.5H426s6.9-19.2 8.4-23.3H486c1.2 5.5 4.8 23.3 4.8 23.3H528z" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className="h-6 w-6 text-gray-400">
          <path fill="currentColor" d="M482.9 410.3c0 6.8-4.6 11.7-11.2 11.7-6.8 0-11.2-5.2-11.2-11.7 0-6.5 4.4-11.7 11.2-11.7 6.6 0 11.2 5.2 11.2 11.7zm-310.8-11.7c-7.1 0-11.2 5.2-11.2 11.7 0 6.5 4.1 11.7 11.2 11.7 6.5 0 10.9-4.9 10.9-11.7-.1-6.5-4.4-11.7-10.9-11.7zm117.5-.3c-5.4 0-8.7 3.5-9.5 8.7h19.1c-.9-5.7-4.4-8.7-9.6-8.7zm107.8.3c-6.8 0-10.9 5.2-10.9 11.7 0 6.5 4.1 11.7 10.9 11.7 6.8 0 11.2-4.9 11.2-11.7 0-6.5-4.4-11.7-11.2-11.7zm105.9 26.1c0 .3.3.5.3 1.1 0 .3-.3.5-.3 1.1-.3.3-.3.5-.5.8-.3.3-.5.5-1.1.5-.3.3-.5.3-1.1.3-.3 0-.5 0-1.1-.3-.3 0-.5-.3-.8-.5-.3-.3-.5-.5-.5-.8-.3-.5-.3-.8-.3-1.1 0-.5 0-.8.3-1.1 0-.5.3-.8.5-.8.3-.3.5-.5.8-.5.5-.3.8-.3 1.1-.3.5 0 .8 0 1.1.3.5.3.8.3.8.5.5.3.5.5.5.8zm-17.7-23.9h4.1c0-.8 0-1.7.4-2.5.3-.7.8-1.5 1.4-2.1.6-.6 1.4-1.1 2.4-1.5.9-.4 2.1-.5 3.2-.5 1.3 0 2.4.3 3.3.7.8.4 1.5.9 2 1.6s.8 1.4.9 2.1c.1.8.2 1.5.2 2.3v8.5c0 .8-.1 1.5-.3 2.3-.2.7-.6 1.4-1.1 2-.5.6-1.2 1.1-2.1 1.4-.9.3-2 .5-3.2.5-1.3 0-2.4-.2-3.4-.6s-1.7-.9-2.3-1.6-.9-1.3-1.2-2.2c-.2-.8-.3-1.6-.3-2.5h4.1c0 .4.1.9.3 1.3.2.4.4.8.8 1 .3.3.7.5 1.3.7.5.1 1.1.2 1.8.2.8 0 1.5-.1 2-.3.6-.2 1-.5 1.3-.9.3-.4.6-.8.7-1.3.1-.5.1-1 .1-1.6v-8.5c0-.5-.1-1-.1-1.4-.1-.5-.3-.8-.6-1.2s-.7-.6-1.2-.8c-.5-.2-1.2-.3-2-.3-.8 0-1.5.1-2 .3-.6.2-1 .5-1.4.9-.4.4-.6.8-.8 1.3-.1.5-.2 1-.2 1.6h4v3.9zm46.4-12.3c-4.6 0-8.3 1.5-11.2 4.6-3 3.1-4.4 7.4-4.4 12.8s1.5 9.7 4.4 12.9c2.9 3.1 6.6 4.6 11.2 4.6 4.6 0 8.3-1.5 11.2-4.6 2.9-3.1 4.4-7.5 4.4-12.9 0-5.4-1.5-9.7-4.4-12.8-3-3.1-6.6-4.6-11.2-4.6zm282.1 14.9h-4c-.2-1-.5-1.8-1.1-2.6-.6-.7-1.3-1.3-2.2-1.8s-1.9-.8-3-.9-2.2-.3-3.3-.3c-2.2 0-4.1.3-5.8 1.1-1.7.7-3 1.8-4.1 3.2-1.1 1.4-1.9 3.1-2.5 5-.5 2-.8 4.2-.8 6.6 0 2.4.3 4.6.8 6.6.6 1.9 1.4 3.6 2.5 5 1.1 1.4 2.4 2.4 4.1 3.2 1.6.7 3.6 1.1 5.8 1.1 1.1 0 2.2-.1 3.3-.3 1.1-.2 2.1-.5 3-.9.9-.5 1.7-1.1 2.2-1.8.6-.7.9-1.6 1.1-2.6h4c-.3 1.5-.8 2.9-1.6 4-1.5 2.2-3.3 3.6-5.5 4.5-2.1.9-4.2 1.3-6.4 1.3-3 0-5.6-.6-7.8-1.8-2.2-1.2-4-2.7-5.4-4.7s-2.5-4.3-3.1-6.8c-.7-2.5-1-5.1-1-7.8s.3-5.3 1-7.8c.7-2.5 1.7-4.7 3.1-6.7s3.2-3.6 5.4-4.7c2.2-1.2 4.8-1.8 7.8-1.8 2.1 0 4.3.4 6.4 1.3 2.1.8 4 2.2 5.5 4.4.8 1.2 1.3 2.5 1.6 4.1zm-261.6-12.3c-4.6 0-8.3 1.5-11.2 4.6-3 3.1-4.4 7.4-4.4 12.8s1.5 9.7 4.4 12.9c2.9 3.1 6.6 4.6 11.2 4.6 4.6 0 8.3-1.5 11.2-4.6 2.9-3.1 4.4-7.5 4.4-12.9 0-5.4-1.5-9.7-4.4-12.8-3-3.1-6.6-4.6-11.2-4.6zm-12.1 37.3c-2.2-1.2-4-2.8-5.4-4.8-1.3-2-2.3-4.2-3-6.6-.6-2.4-.9-4.9-.9-7.3 0-2.5.3-5 .9-7.5.6-2.4 1.6-4.6 3-6.6 1.3-2 3.1-3.5 5.4-4.7 2.2-1.2 4.9-1.8 8-1.8s5.8.6 8 1.8c2.2 1.2 4 2.8 5.4 4.7 1.4 2 2.4 4.2 3 6.6.6 2.5.9 5 .9 7.5 0 2.4-.3 4.9-.9 7.3-.6 2.4-1.6 4.6-3 6.6-1.3 2-3.1 3.6-5.4 4.8-2.2 1.2-4.9 1.8-8 1.8s-5.7-.6-8-1.8zm282.7 0c-2.2-1.2-4-2.8-5.4-4.8-1.3-2-2.3-4.2-3-6.6-.6-2.4-.9-4.9-.9-7.3 0-2.5.3-5 .9-7.5.6-2.4 1.6-4.6 3-6.6 1.3-2 3.1-3.5 5.4-4.7 2.2-1.2 4.9-1.8 8-1.8s5.8.6 8 1.8c2.2 1.2 4 2.8 5.4 4.7 1.4 2 2.4 4.2 3 6.6.6 2.5.9 5 .9 7.5 0 2.4-.3 4.9-.9 7.3-.6 2.4-1.6 4.6-3 6.6-1.3 2-3.1 3.6-5.4 4.8-2.2 1.2-4.9 1.8-8 1.8s-5.8-.6-8-1.8zM576 80v352c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V80c0-26.5 21.5-48 48-48h480c26.5 0 48 21.5 48 48zM64 432c0 8.8 7.2 16 16 16h416c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16v336z" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className="h-6 w-6 text-gray-400">
          <path fill="currentColor" d="M488 192H122.1L96.9 64H24C10.7 64 0 74.7 0 88c0 1.1 0 2.2.1 3.3 1.8 16 15.3 28.1 31.6 27.8H56l56.6 320H456c13.3 0 24-10.7 24-24s-10.7-24-24-24H102l-8.5-48h389.2c15.9 0 29.5-11.8 31.6-27.1l19.8-112.2c3.1-17.8-10.3-34.7-28.4-34.7h-17.7zm-50 96H98.8l-8.3-48h353.8l-6.3 48z" />
        </svg>
      </div>
    </div>
  );
};

export default PayPalButton;
