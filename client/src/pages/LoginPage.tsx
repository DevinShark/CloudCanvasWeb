import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoginForm from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth";

const LoginPage = () => {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const registered = urlParams.get("registered") === "true";
  const verified = urlParams.get("verified") === "true";
  const reset = urlParams.get("reset") === "true";
  
  // If user is already logged in (has valid session), redirect to dashboard
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          window.location.href = "/dashboard";
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };
    
    checkAuthStatus();
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen py-24 bg-background">
        <div className="container mx-auto px-6 pt-20">
          <div className="max-w-md mx-auto">
            {registered && (
              <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
                <AlertDescription className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Registration successful! Please check your email to verify your account.
                </AlertDescription>
              </Alert>
            )}
            
            {verified && (
              <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
                <AlertDescription className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Email verified successfully! You can now log in.
                </AlertDescription>
              </Alert>
            )}
            
            {reset && (
              <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
                <AlertDescription className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Password reset successfully! You can now log in with your new password.
                </AlertDescription>
              </Alert>
            )}
            
            <Card>
              <CardContent className="pt-6">
                <LoginForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default LoginPage;
