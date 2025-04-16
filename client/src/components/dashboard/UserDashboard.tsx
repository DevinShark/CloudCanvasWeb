import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileDown, ShieldCheck, Loader2 } from "lucide-react";
import { getCurrentUser, fetchUserLicenses, LicenseDetails } from "@/lib/auth";
import { getUserSubscription } from "@/lib/paypal";
import { generateTrialLicense } from "@/lib/licenseGate";
import { getInstallerDownloadUrl } from "@/lib/downloads";
import { formatDate, formatPlanName, capitalizeFirstLetter } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import LicenseCard from "@/components/dashboard/LicenseCard";
import ProfileSettings from "@/components/dashboard/ProfileSettings";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// Add TypeScript interface for window with Turnstile
interface TurnstileWindow extends Window {
  turnstile?: {
    render: (container: HTMLElement, options: any) => string;
    remove: (widgetId: string) => void;
  };
}

declare const window: TurnstileWindow;

// Custom Turnstile component that uses the Cloudflare Turnstile script directly
interface TurnstileProps {
  siteKey: string;
  onSuccess: (token: string) => void;
  onError?: (error: any) => void;
  onExpire?: () => void;
}

const Turnstile: React.FC<TurnstileProps> = ({ siteKey, onSuccess, onError, onExpire }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Load the Turnstile script if it's not already loaded
    if (!window.turnstile) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }

    return () => {
      // Clean up the widget when the component unmounts
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Initialize the widget when the script is loaded and the container is ready
    const interval = setInterval(() => {
      if (window.turnstile && containerRef.current) {
        clearInterval(interval);
        
        // Allow time for the script to fully initialize
        setTimeout(() => {
          try {
            if (widgetIdRef.current && window.turnstile) {
              window.turnstile.remove(widgetIdRef.current);
            }
            
            widgetIdRef.current = window.turnstile.render(containerRef.current, {
              sitekey: siteKey,
              callback: onSuccess,
              'error-callback': onError,
              'expired-callback': onExpire,
              theme: 'light',
            });
          } catch (err) {
            console.error('Error rendering Turnstile widget:', err);
            if (onError) onError(err);
          }
        }, 500);
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [siteKey, onSuccess, onError, onExpire]);

  return <div ref={containerRef} className="cf-turnstile"></div>;
};

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("licenses");
  const [isGeneratingTrial, setIsGeneratingTrial] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });
  
  const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ["userSubscription", user?.id],
    queryFn: getUserSubscription,
    enabled: !!user,
  });
  
  const { data: licenses, isLoading: isLoadingLicenses } = useQuery<LicenseDetails[], Error>({
    queryKey: ["userLicenses", user?.id],
    queryFn: fetchUserLicenses,
    enabled: !!user,
  });
  
  const handleGenerateTrial = async () => {
    try {
      await generateTrialLicense();
      queryClient.invalidateQueries({ queryKey: ["userLicenses"] });
      toast({
        title: "Trial activated",
        description: "Your 7-day trial license has been generated and sent to your email.",
      });
    } catch (error) {
      console.error("Error generating trial license:", error);
    }
  };
  
  const startDownload = async (token: string) => {
    try {
      setIsDownloading(true);
      
      toast({
        title: "Preparing download",
        description: "Generating secure download link...",
      });
      
      // Get the download URL from the server
      const downloadUrl = await getInstallerDownloadUrl(token);
      
      // Validate URL before using it
      console.log('[UserDashboard] Received URL from getInstallerDownloadUrl:', downloadUrl);
      console.log('[UserDashboard] Type of URL:', typeof downloadUrl);
      
      if (!downloadUrl || typeof downloadUrl !== 'string') {
        console.error('[UserDashboard] Validation failed. URL:', downloadUrl, 'Type:', typeof downloadUrl);
        throw new Error('Invalid download URL received');
      }
      
      // Initiate the download
      console.log('[UserDashboard] Assigning window.location.href to:', downloadUrl);
      window.location.href = downloadUrl;
      
      toast({
        title: "Download started",
        description: "Your download should begin shortly. If not, click the download button again.",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Could not download the installer. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
      setShowCaptcha(false);
    }
  };
  
  const handleDownload = () => {
    // Open the CAPTCHA dialog
    setShowCaptcha(true);
  };
  
  const onCaptchaVerified = useCallback((token: string) => {
    setCaptchaToken(token);
    setCaptchaVerified(!!token);
  }, []);

  const onCaptchaExpired = useCallback(() => {
    setCaptchaToken(null);
    setCaptchaVerified(false);
  }, []);
  
  const handleCloseCaptcha = () => {
    setShowCaptcha(false);
    setCaptchaToken(null);
    setCaptchaVerified(false);
  };
  
  const handleCaptchaDownload = () => {
    if (captchaToken) {
      startDownload(captchaToken);
    } else {
      console.error("Attempted download without a valid CAPTCHA token.");
      toast({
        title: "Verification Error",
        description: "CAPTCHA token is missing. Please try verifying again.",
        variant: "destructive",
      });
    }
  };
  
  const isLoading = isLoadingUser || isLoadingSubscription || isLoadingLicenses || isGeneratingTrial || isDownloading;
  
  // Check if the user has at least one active license
  const hasActiveLicense = licenses && licenses.length > 0 && 
    licenses.some(license => license.isActive);
  
  // Add debug output for licenses when they change
  useEffect(() => {
    if (licenses) {
      console.log("Dashboard received licenses:", {
        count: licenses.length,
        data: licenses
      });
    }
  }, [licenses]);
  
  // Helper: Get the most relevant license (active paid > active trial > expired paid > expired trial)
  const getCurrentLicense = (licenses) => {
    if (!licenses || licenses.length === 0) return null;
    // Prefer active, non-trial licenses
    const activePaid = licenses.find(l => l.isActive && l.plan !== 'trial');
    if (activePaid) return activePaid;
    // Fallback: active trial
    const activeTrial = licenses.find(l => l.isActive && l.plan === 'trial');
    if (activeTrial) return activeTrial;
    // Fallback: most recent expired paid
    const expiredPaid = licenses.filter(l => !l.isActive && l.plan !== 'trial');
    if (expiredPaid.length > 0) return expiredPaid[0];
    // Fallback: most recent expired trial
    const expiredTrial = licenses.filter(l => !l.isActive && l.plan === 'trial');
    if (expiredTrial.length > 0) return expiredTrial[0];
    return licenses[0];
  };

  const currentLicense = getCurrentLicense(licenses);
  const isTrial = currentLicense?.plan === 'trial';
  const isActive = currentLicense?.isActive;
  const planName = currentLicense ? (currentLicense.plan.charAt(0).toUpperCase() + currentLicense.plan.slice(1)) : '—';
  const billingType = isTrial ? '—' : (currentLicense?.billingType === 'annual' ? 'Annual' : 'Monthly');
  const nextBillingDate = isTrial ? '—' : (currentLicense?.expiryDate ? formatDate(new Date(currentLicense.expiryDate)) : '—');
  const status = isActive ? 'Active' : 'Expired';
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">My Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {user?.firstName || user?.email}
            </p>
          </div>
          
          <TabsList>
            <TabsTrigger value="licenses">Licenses</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="licenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Licenses</CardTitle>
              <CardDescription>
                Manage your Cloud Canvas license keys and downloads
              </CardDescription>
            </CardHeader>
            <CardContent>
              {licenses && licenses.length > 0 ? (
                <div className="grid gap-6">
                  {licenses.map((license) => (
                    <LicenseCard key={license.licenseKey} license={license} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileDown className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No licenses found</h3>
                  <p className="text-gray-500 mb-4">
                    You don't have any active licenses yet. Subscribe to get started.
                  </p>
                  <Button
                    onClick={() => window.location.href = "/#pricing"}
                  >
                    View Pricing Plans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {hasActiveLicense && (
            <Card>
              <CardHeader>
                <CardTitle>Downloads</CardTitle>
                <CardDescription>
                  Download the latest version of Cloud Canvas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Cloud Canvas v3.5.2</h4>
                      <p className="text-sm text-gray-500">Released on {formatDate(new Date("2025-03-15"))}</p>
                    </div>
                    <Button 
                      className="gap-2" 
                      onClick={handleDownload}
                      disabled={isDownloading}
                    >
                      <Download className="h-4 w-4" />
                      {isDownloading ? 'Downloading...' : 'Download'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {!hasActiveLicense && (
            <Card>
              <CardHeader>
                <CardTitle>Downloads</CardTitle>
                <CardDescription>
                  Access Cloud Canvas downloads with a license
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Download className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No active license found</h3>
                  <p className="text-gray-500 mb-6">
                    Subscribe to a plan to access Cloud Canvas downloads.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => window.location.href = "/#pricing"}
                    >
                      View Pricing Plans
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleGenerateTrial}
                      disabled={isGeneratingTrial || hasActiveLicense}
                    >
                      {isGeneratingTrial ? 'Generating Trial...' : 'Start Free Trial'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>
                Manage your Cloud Canvas subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentLicense ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Plan</h3>
                      <p className="text-lg font-semibold mt-1">{planName}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <div className="flex items-center mt-1">
                        <div className={`h-2.5 w-2.5 rounded-full mr-2 ${isActive ? "bg-green-500" : "bg-gray-400"}`}></div>
                        <p className="text-lg font-semibold">{status}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Billing Cycle</h3>
                      <p className="text-lg font-semibold mt-1">{billingType}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Next Billing Date</h3>
                      <p className="text-lg font-semibold mt-1">{nextBillingDate}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                    <Button variant="outline" onClick={() => window.location.href = "/#pricing"}>
                      Change Plan
                    </Button>
                    <Button variant="destructive">
                      Cancel Subscription
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No active subscription</h3>
                  <p className="text-gray-500 mb-4">
                    Subscribe to a plan to access Cloud Canvas features.
                  </p>
                  <Button
                    onClick={() => window.location.href = "/#pricing"}
                  >
                    View Pricing Plans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View your past invoices and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* If LicenseGate provides billing/invoice data, map and display it here. Otherwise, show a message. */}
              <p className="text-gray-500 text-center py-4">No billing history available</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="profile">
          <ProfileSettings user={user} />
        </TabsContent>
      </Tabs>
      
      {/* CAPTCHA Verification Dialog */}
      <Dialog open={showCaptcha} onOpenChange={handleCloseCaptcha}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Human Verification</DialogTitle>
            <DialogDescription>
              Please complete the verification below to download the installer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4">
            <ShieldCheck className="h-12 w-12 text-primary mb-4" />
            <div className="my-4">
              <Turnstile
                siteKey="0x4AAAAAABK_6neEiKMKO5Ri"
                onSuccess={onCaptchaVerified}
                onError={() => {
                  console.error("Turnstile verification failed.");
                  toast({
                    title: "Verification Failed",
                    description: "Could not verify CAPTCHA. Please try again.",
                    variant: "destructive",
                  });
                  onCaptchaExpired();
                }}
                onExpire={onCaptchaExpired}
              />
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              This helps us prevent automated downloads and protect our services.
            </p>
          </div>
          <DialogFooter className="flex justify-between">
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isDownloading}>
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="button" 
              disabled={!captchaVerified || isDownloading}
              onClick={handleCaptchaDownload}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                'Download'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDashboard;
