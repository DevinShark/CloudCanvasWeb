import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, User } from "lucide-react";
import { executeSubscription } from "@/lib/paypal";
import { generateLicense } from "@/lib/licenseGate";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const SuccessPage = () => {
  const [location, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  
  useEffect(() => {
    const processPayment = async () => {
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const subscriptionId = urlParams.get('subscription_id');
      const token = urlParams.get('token');
      
      if (!subscriptionId || !token) {
        setError("Invalid payment information. Missing required parameters.");
        setIsProcessing(false);
        return;
      }
      
      try {
        // Execute the subscription
        const subscription = await executeSubscription(subscriptionId, token);
        setSubscriptionId(subscription.id);
        
        // Generate license key
        const licenseKeyData = await generateLicense(subscription.id);
        setLicenseKey(licenseKeyData);
        
        setIsSuccess(true);
      } catch (err) {
        console.error("Payment processing error:", err);
        setError("There was a problem processing your payment. Please contact support.");
      } finally {
        setIsProcessing(false);
      }
    };
    
    processPayment();
  }, []);
  
  const handleDownloadLicense = () => {
    if (!licenseKey) return;
    
    const element = document.createElement("a");
    const file = new Blob([licenseKey], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "cloudcanvas-license.key";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen py-24 bg-background">
        <div className="container mx-auto px-6 pt-20">
          <div className="max-w-xl mx-auto">
            <Card>
              <CardContent className="pt-8">
                <div className="text-center">
                  {isProcessing ? (
                    <div className="py-12">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
                      <h1 className="text-2xl font-bold text-primary mb-4">Processing Your Payment</h1>
                      <p className="text-gray-600">
                        Please wait while we confirm your payment and activate your subscription...
                      </p>
                    </div>
                  ) : isSuccess ? (
                    <div className="py-6">
                      <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
                      <h1 className="text-3xl font-bold text-primary mb-4">Thank You For Your Purchase!</h1>
                      <p className="text-lg text-gray-600 mb-8">
                        Your subscription has been successfully activated.
                      </p>
                      
                      <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                        <h2 className="text-xl font-semibold mb-4">Your License Key</h2>
                        {licenseKey ? (
                          <>
                            <div className="bg-white border rounded p-4 mb-4 font-mono text-sm overflow-x-auto">
                              {licenseKey}
                            </div>
                            <p className="text-gray-500 text-sm mb-4">
                              This license key has also been sent to your email address.
                            </p>
                            <Button onClick={handleDownloadLicense} className="w-full sm:w-auto">
                              <Download className="mr-2 h-4 w-4" />
                              Download License File
                            </Button>
                          </>
                        ) : (
                          <p className="text-gray-600">
                            Your license key is being generated and will be sent to your email address.
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button onClick={() => navigate("/dashboard")} className="flex items-center justify-center">
                          <User className="mr-2 h-4 w-4" />
                          Go to Dashboard
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/")}>
                          Return to Home
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8">
                      <div className="rounded-full h-20 w-20 bg-red-100 flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="h-12 w-12 text-red-500" />
                      </div>
                      <h1 className="text-2xl font-bold text-primary mb-4">Payment Processing Issue</h1>
                      <p className="text-gray-600 mb-8">
                        {error || "There was a problem processing your payment."}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button onClick={() => navigate("/dashboard")}>
                          Go to Dashboard
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/#pricing")}>
                          Return to Pricing
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SuccessPage;
