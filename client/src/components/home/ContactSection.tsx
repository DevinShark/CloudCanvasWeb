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
import { MapPin, Phone, Mail, Twitter, Linkedin, Youtube, Facebook } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  subject: z.string().min(1, {
    message: "Please select a subject.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

const ContactSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/contact", values);
      toast({
        title: "Message Sent",
        description: "Thank you for your message. We'll be in touch shortly.",
      });
      form.reset();
    } catch (error) {
      console.error("Error submitting contact form:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Contact Us
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Have questions or need assistance? Our team is here to help you get the most out of Cloud Canvas.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sales">Sales Inquiry</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
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
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Your message..."
                          className="resize-none"
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full bg-primary text-white hover:bg-opacity-90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Form>
          </div>
          
          <div>
            <div className="bg-background rounded-lg p-8 h-full">
              <h3 className="text-xl font-bold text-primary mb-6">Connect With Us</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium">Our Office</h4>
                    <p className="text-gray-600">123 Tech Park Drive<br />San Francisco, CA 94107</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Phone className="h-5 w-5 text-accent" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium">Phone</h4>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-gray-500 text-sm">Mon-Fri, 9am-5pm PT</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Mail className="h-5 w-5 text-accent" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium">Email</h4>
                    <p className="text-gray-600">info@cloudcanvas.com</p>
                    <p className="text-gray-500 text-sm">We respond within 24 hours</p>
                  </div>
                </div>
                
                <div className="pt-6">
                  <h4 className="font-medium mb-4">Follow Us</h4>
                  <div className="flex space-x-4">
                    <a href="#" className="text-accent hover:text-primary transition-colors duration-200" aria-label="Twitter">
                      <Twitter className="h-6 w-6" />
                    </a>
                    <a href="#" className="text-accent hover:text-primary transition-colors duration-200" aria-label="LinkedIn">
                      <Linkedin className="h-6 w-6" />
                    </a>
                    <a href="#" className="text-accent hover:text-primary transition-colors duration-200" aria-label="YouTube">
                      <Youtube className="h-6 w-6" />
                    </a>
                    <a href="#" className="text-accent hover:text-primary transition-colors duration-200" aria-label="Facebook">
                      <Facebook className="h-6 w-6" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
