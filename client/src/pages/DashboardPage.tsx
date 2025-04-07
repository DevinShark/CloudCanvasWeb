import { useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import UserDashboard from "@/components/dashboard/UserDashboard";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/auth";

const DashboardPage = () => {
  const [, navigate] = useLocation();
  
  // Check if user is authenticated
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: 1,
  });
  
  // Redirect to login if user fetch fails
  useEffect(() => {
    if (isError) {
      console.log("User fetch error, redirecting to login...");
      navigate("/login");
    }
  }, [isError, navigate]);
  
  if (isLoading) {
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
          {user && <UserDashboard />}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default DashboardPage;
