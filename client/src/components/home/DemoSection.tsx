import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  company: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  industry: z.string().min(1, {
    message: "Please select an industry.",
  }),
  message: z.string().optional(),
});

const DemoSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      company: "",
      industry: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/demos/request", values);
      toast({
        title: "Demo Request Received",
        description: "We'll be in touch with you shortly to schedule your demo.",
      });
      form.reset();
    } catch (error) {
      console.error("Error submitting demo request:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="demo" className="py-20 relative">
      <div className="absolute inset-0 z-0">
        <div 
          className="w-full h-full bg-[url('https://images.unsplash.com/photo-1573167507387-6b4b98cb7c13?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center"
          aria-hidden="true"
        ></div>
        <div className="absolute inset-0 gradient-bg opacity-90"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
            Request a Free Demo
          </h2>
          <p className="text-gray-600 mb-6">
            Experience the full power of Cloud Canvas with a personalized demo tailored to your industry needs.
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Company Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mining">Mining & Excavation</SelectItem>
                        <SelectItem value="surveying">Surveying & Mapping</SelectItem>
                        <SelectItem value="civil">Civil Engineering</SelectItem>
                        <SelectItem value="environmental">Environmental Monitoring</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How can we help you?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your specific needs..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="w-full bg-secondary text-white hover:bg-opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Schedule Demo"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
