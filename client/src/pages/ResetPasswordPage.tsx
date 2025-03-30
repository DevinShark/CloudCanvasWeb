import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/auth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const resetPasswordSchema = z.object({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Validate token
  useEffect(() => {
    if (!token) {
      setIsError(true);
      setErrorMessage("Invalid or missing reset token");
    }
  }, [token]);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    if (!token) {
      setIsError(true);
      setErrorMessage("Invalid or missing reset token");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token, values.password);
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/login?reset=true");
      }, 3000);
    } catch (error) {
      console.error("Password reset error:", error);
      setIsError(true);
      setErrorMessage("Failed to reset password. The token may be expired or invalid.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen py-24 bg-background">
        <div className="container mx-auto px-6 pt-20">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-primary">Reset Your Password</h1>
                  <p className="text-gray-600 mt-2">Enter a new password for your account</p>
                </div>

                {isSuccess ? (
                  <div className="text-center p-6 bg-green-50 rounded-lg border border-green-100">
                    <h2 className="text-xl font-semibold text-green-700 mb-2">Password Reset Successful</h2>
                    <p className="text-gray-600 mb-4">
                      Your password has been reset successfully. You will be redirected to the login page in a moment.
                    </p>
                  </div>
                ) : isError ? (
                  <div className="text-center p-6 bg-red-50 rounded-lg border border-red-100">
                    <h2 className="text-xl font-semibold text-red-700 mb-2">Password Reset Failed</h2>
                    <p className="text-gray-600 mb-4">{errorMessage}</p>
                    <Button onClick={() => navigate("/forgot-password")}>
                      Request New Reset Link
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Resetting..." : "Reset Password"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ResetPasswordPage;
