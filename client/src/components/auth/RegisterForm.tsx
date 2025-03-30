import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
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
import { registerUser } from "@/lib/auth";

const registerSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
});

const RegisterForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      company: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsSubmitting(true);
    try {
      await registerUser(values);
      // Redirect to login page after successful registration
      setLocation("/login?registered=true");
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Create an Account</h1>
        <p className="text-gray-600 mt-2">Join Cloud Canvas to transform your geospatial workflow</p>
      </div>
      
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Your Company Inc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="text-sm text-gray-600">
            By creating an account, you agree to our{" "}
            <Link href="#">
              <a className="text-accent hover:underline">Terms of Service</a>
            </Link>
            {" "}and{" "}
            <Link href="#">
              <a className="text-accent hover:underline">Privacy Policy</a>
            </Link>.
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </Form>
      
      <div className="text-center mt-6">
        <p className="text-gray-600">
          Already have an account?{" "}
          <Link href="/login">
            <a className="text-accent hover:underline">Log in</a>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
