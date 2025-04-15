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
import { updateUserProfile, updateEmailPreferences } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { UserProfile } from "@/types";
import { getApiUrl } from "@/config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

interface ProfileSettingsProps {
  user: UserProfile & { emailPreferences?: { newsletter?: boolean; productUpdates?: boolean; promotions?: boolean; } };
}

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email" }).optional(),
});

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Email preferences schema
const emailPrefsSchema = z.object({
  newsletter: z.boolean().optional(),
  productUpdates: z.boolean().optional(),
  promotions: z.boolean().optional(),
});

const ProfileSettings = ({ user }: ProfileSettingsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showEmailPrefsDialog, setShowEmailPrefsDialog] = useState(false);
  const [showDataPrivacyDialog, setShowDataPrivacyDialog] = useState(false);
  const [isSavingEmailPrefs, setIsSavingEmailPrefs] = useState(false);

  const queryClient = useQueryClient();

  // Use user prop for initial state
  const [currentEmailPrefs, setCurrentEmailPrefs] = useState({
    newsletter: user.emailNewsletter ?? true,
    productUpdates: user.emailProductUpdates ?? true,
    promotions: user.emailPromotions ?? false,
  });

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      company: user?.company || "",
      email: user?.email || "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
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

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsChangingPassword(true);
    try {
      // Call the API to change password using the getApiUrl function
      const response = await fetch(getApiUrl("/api/auth/change-password"), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
        credentials: 'include',
      });

      // Check response content type before parsing
      const contentType = response.headers.get("content-type");
      
      // Log response details for debugging
      console.log('Change password response:', {
        status: response.status,
        statusText: response.statusText,
        contentType,
        url: response.url
      });
      
      let data;
      
      // Only parse as JSON if the response is actually JSON
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // If not JSON, get the text and log it
        const text = await response.text();
        console.error('Server returned non-JSON response:', text.substring(0, 200) + '...');
        throw new Error(`Server returned unexpected response type: ${contentType}`);
      }

      if (!response.ok) {
        throw new Error(data?.message || `Error (${response.status}): ${response.statusText}`);
      }

      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed",
      });
      
      passwordForm.reset();
      setShowPasswordDialog(false);
    } catch (error) {
      console.error("Password change error:", error);
      toast({
        title: "Password Change Failed",
        description: error instanceof Error ? error.message : "There was an error changing your password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // When dialog opens, sync state with user prop
  const handleOpenEmailPrefsDialog = () => {
    setCurrentEmailPrefs({
      newsletter: user.emailNewsletter ?? true,
      productUpdates: user.emailProductUpdates ?? true,
      promotions: user.emailPromotions ?? false,
    });
    setShowEmailPrefsDialog(true);
  };

  // Handler for saving email preferences
  const onEmailPrefsSubmit = async () => {
    setIsSavingEmailPrefs(true);
    try {
      await updateEmailPreferences(currentEmailPrefs);
      toast({
        title: "Preferences Updated",
        description: "Your email notification settings have been saved.",
      });
      setShowEmailPrefsDialog(false);
      // Refetch user data so UI is up to date
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    } catch (error) {
      console.error("Email preferences update error:", error);
      const errorMessage = error instanceof Error ? error.message : (error as any)?.message || "Could not save email preferences.";
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSavingEmailPrefs(false);
    }
  };

  // Handler for toggling email preferences
  const handleEmailPrefChange = (prefKey: keyof typeof currentEmailPrefs, checked: boolean) => {
    setCurrentEmailPrefs(prev => ({ ...prev, [prefKey]: checked }));
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
          <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
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
              <Button variant="outline" onClick={handleOpenEmailPrefsDialog}>Manage</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Data and Privacy</h4>
                <p className="text-sm text-gray-500">Manage your data and privacy settings</p>
              </div>
              <Button variant="outline" onClick={() => setShowDataPrivacyDialog(true)}>Manage</Button>
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

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new password below.
            </DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
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
                control={passwordForm.control}
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
              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Email Preferences Dialog */}
      <Dialog open={showEmailPrefsDialog} onOpenChange={setShowEmailPrefsDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Email Notification Preferences</DialogTitle>
            <DialogDescription>
              Choose which emails you want to receive from Cloud Canvas.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="newsletter-pref" className="flex flex-col space-y-1">
                <span>Newsletter</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Occasional updates about Cloud Canvas features and news.
                </span>
              </Label>
              <Switch
                id="newsletter-pref"
                checked={currentEmailPrefs.newsletter}
                onCheckedChange={(checked) => handleEmailPrefChange('newsletter', checked)}
                aria-readonly={isSavingEmailPrefs}
                disabled={isSavingEmailPrefs}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
               <Label htmlFor="product-updates-pref" className="flex flex-col space-y-1">
                <span>Product Updates</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Notifications about new features, improvements, and releases.
                </span>
              </Label>
              <Switch
                id="product-updates-pref"
                checked={currentEmailPrefs.productUpdates}
                onCheckedChange={(checked) => handleEmailPrefChange('productUpdates', checked)}
                 aria-readonly={isSavingEmailPrefs}
                disabled={isSavingEmailPrefs}
             />
            </div>
             <div className="flex items-center justify-between space-x-2">
               <Label htmlFor="promotions-pref" className="flex flex-col space-y-1">
                <span>Promotions & Offers</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Receive special offers, discounts, and promotional emails.
                </span>
              </Label>
              <Switch
                id="promotions-pref"
                checked={currentEmailPrefs.promotions}
                onCheckedChange={(checked) => handleEmailPrefChange('promotions', checked)}
                 aria-readonly={isSavingEmailPrefs}
                disabled={isSavingEmailPrefs}
             />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSavingEmailPrefs}>Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={onEmailPrefsSubmit} disabled={isSavingEmailPrefs}>
              {isSavingEmailPrefs ? "Saving..." : "Save Preferences"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data and Privacy Dialog */}
      <Dialog open={showDataPrivacyDialog} onOpenChange={setShowDataPrivacyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Data and Privacy</DialogTitle>
            <DialogDescription>
              Review your data settings and privacy options.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
             <p className="text-sm text-muted-foreground">
              You can review our full data usage policy in our{" "}
              <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                <a className="underline text-primary hover:text-primary/80">Privacy Policy</a>
              </Link>.
            </p>
             <div>
                <Button variant="outline" disabled>Download My Data</Button>
                <p className="text-xs text-muted-foreground mt-1">Feature coming soon.</p>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileSettings;
