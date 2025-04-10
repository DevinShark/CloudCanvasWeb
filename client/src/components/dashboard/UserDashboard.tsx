import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileDown } from "lucide-react";
import { getCurrentUser, fetchUserLicenses, LicenseDetails } from "@/lib/auth";
import { getUserSubscription } from "@/lib/paypal";
import { generateTrialLicense } from "@/lib/licenseGate";
import { formatDate, formatPlanName, capitalizeFirstLetter } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import LicenseCard from "@/components/dashboard/LicenseCard";
import ProfileSettings from "@/components/dashboard/ProfileSettings";

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("licenses");
  const [isGeneratingTrial, setIsGeneratingTrial] = useState(false);
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
  
  const isLoading = isLoadingUser || isLoadingSubscription || isLoadingLicenses || isGeneratingTrial;
  
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
          
          {licenses && licenses.length > 0 && licenses.some(license => license.isActive) ? (
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
                    <Button className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">LAS Format Plugin</h4>
                      <p className="text-sm text-gray-500">Additional format support</p>
                    </div>
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
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
              {subscription ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Plan</h3>
                      <p className="text-lg font-semibold mt-1">
                        {formatPlanName(subscription.plan)}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <div className="flex items-center mt-1">
                        <div className={`h-2.5 w-2.5 rounded-full mr-2 ${
                          subscription.status === "active" ? "bg-green-500" : "bg-gray-400"
                        }`}></div>
                        <p className="text-lg font-semibold">
                          {capitalizeFirstLetter(subscription.status)}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Billing Cycle</h3>
                      <p className="text-lg font-semibold mt-1">
                        {subscription.billingType === "annual" ? "Annual" : "Monthly"}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Next Billing Date</h3>
                      <p className="text-lg font-semibold mt-1">
                        {formatDate(new Date(subscription.endDate))}
                      </p>
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
              {subscription ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(new Date(subscription.startDate))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatPlanName(subscription.plan)} Plan - {subscription.billingType === "annual" ? "Annual" : "Monthly"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${subscription.billingType === "annual" ? 
                            subscription.plan === "standard" ? "708.00" : 
                            subscription.plan === "professional" ? "1,188.00" : "2,988.00"
                            : 
                            subscription.plan === "standard" ? "59.00" : 
                            subscription.plan === "professional" ? "99.00" : "249.00"
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Paid
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No billing history available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="profile">
          <ProfileSettings user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
