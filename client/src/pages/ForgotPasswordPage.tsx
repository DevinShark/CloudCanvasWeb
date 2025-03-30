import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

const ForgotPasswordPage = () => {
  return (
    <>
      <Header />
      <main className="min-h-screen py-24 bg-background">
        <div className="container mx-auto px-6 pt-20">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6">
                <ForgotPasswordForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ForgotPasswordPage;
