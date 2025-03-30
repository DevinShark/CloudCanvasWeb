import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateUserProfile } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { UserProfile } from "@/types";

interface ProfileSettingsProps {
  user: UserProfile;
}

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email" }).optional(),
});

const ProfileSettings = ({ user }: ProfileSettingsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      company: user?.company || "",
      email: user?.email || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    setIsSubmitting(true);
    try {
      await updateUserProfile(values);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your.email@example.com"
                        disabled
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                <AlertDescription>
                  To change your email address, please contact support.
                </AlertDescription>
              </Alert>
              
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Update your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => window.location.href = '/forgot-password'}>
            Change Password
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Preferences</CardTitle>
          <CardDescription>
            Manage your account settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-gray-500">Receive updates about your account and subscriptions</p>
              </div>
              <Button variant="outline">Manage</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Data and Privacy</h4>
                <p className="text-sm text-gray-500">Manage your data and privacy settings</p>
              </div>
              <Button variant="outline">Manage</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-red-600">Delete Account</h4>
                <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
