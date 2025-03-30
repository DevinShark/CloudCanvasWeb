import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RegisterForm from "@/components/auth/RegisterForm";

const RegisterPage = () => {
  const [location] = useLocation();
  
  // If user is already logged in (has valid session), redirect to dashboard
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
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
            <Card>
              <CardContent className="pt-6">
                <RegisterForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default RegisterPage;
