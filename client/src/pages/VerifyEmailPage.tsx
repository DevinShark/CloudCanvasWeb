import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import { verifyEmail } from "@/lib/auth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const VerifyEmailPage = () => {
  const { token } = useParams();
  const [, navigate] = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError("Invalid verification link. The token is missing.");
        setIsVerifying(false);
        return;
      }
      
      try {
        await verifyEmail(token);
        setIsSuccess(true);
        // Auto redirect to login after successful verification
        setTimeout(() => {
          navigate("/login?verified=true");
        }, 3000);
      } catch (err) {
        setError("Email verification failed. The link may have expired or is invalid.");
      } finally {
        setIsVerifying(false);
      }
    };
    
    verify();
  }, [token, navigate]);

  return (
    <>
      <Header />
      <main className="min-h-screen py-24 bg-background">
        <div className="container mx-auto px-6 pt-20">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-primary mb-4">Email Verification</h1>
                  
                  {isVerifying ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                      <p className="text-gray-600">Verifying your email address...</p>
                    </div>
                  ) : isSuccess ? (
                    <div className="py-8">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h2 className="text-xl font-semibold text-green-700 mb-2">Email Verified Successfully!</h2>
                      <p className="text-gray-600 mb-6">
                        Your email has been verified. You can now log in to your account.
                      </p>
                      <p className="text-gray-500 text-sm">
                        Redirecting you to login page in a moment...
                      </p>
                    </div>
                  ) : (
                    <div className="py-8">
                      <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                      <h2 className="text-xl font-semibold text-red-700 mb-2">Verification Failed</h2>
                      <p className="text-gray-600 mb-6">
                        {error || "An unknown error occurred during verification."}
                      </p>
                      <div className="flex flex-col space-y-2">
                        <Button onClick={() => navigate("/login")}>
                          Go to Login
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/")}>
                          Return to Home
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

export default VerifyEmailPage;
