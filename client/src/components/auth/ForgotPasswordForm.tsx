import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/auth";
import { passwordResetRequestSchema } from "@shared/schema";

const ForgotPasswordForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const form = useForm<z.infer<typeof passwordResetRequestSchema>>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof passwordResetRequestSchema>) {
    setIsSubmitting(true);
    try {
      await requestPasswordReset(values.email);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Password reset request error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Reset Your Password</h1>
        <p className="text-gray-600 mt-2">
          Enter your email and we'll send you instructions to reset your password
        </p>
      </div>
      
      {isSubmitted ? (
        <div className="text-center p-6 bg-green-50 rounded-lg border border-green-100">
          <h2 className="text-xl font-semibold text-green-700 mb-2">Check Your Email</h2>
          <p className="text-gray-600 mb-4">
            If an account exists with that email, we've sent instructions to reset your password.
          </p>
          <Link href="/login">
            <Button variant="outline" className="mt-2">
              Return to Login
            </Button>
          </Link>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" {...field} />
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
              {isSubmitting ? "Sending..." : "Reset Password"}
            </Button>
          </form>
        </Form>
      )}
      
      <div className="text-center mt-6">
        <p className="text-gray-600">
          Remembered your password?{" "}
          <Link href="/login">
            <a className="text-accent hover:underline">Log in</a>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
