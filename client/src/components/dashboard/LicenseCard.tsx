import { Copy, CheckCircle, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { formatDate, formatPlanName } from "@/lib/utils";
import { LicenseDetails } from "@/types";

interface LicenseCardProps {
  license: LicenseDetails;
}

const LicenseCard = ({ license }: LicenseCardProps) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(license.licenseKey);
    setCopied(true);
    toast({
      title: "License Key Copied",
      description: "The license key has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  const downloadLicenseKey = () => {
    const element = document.createElement("a");
    const file = new Blob([license.licenseKey], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `cloudcanvas-license-${license.id}.key`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "License Key Downloaded",
      description: "Your license key file has been downloaded.",
    });
  };

  // Determine if this is a trial license
  const isTrial = license.subscriptionId === null || license.subscriptionId === 0 || license.plan === 'trial';
  
  // Calculate remaining days if it's a trial
  const expiryDate = new Date(license.expiryDate);
  const today = new Date();
  const remainingDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  const isExpired = today > expiryDate;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between">
          <div className="mb-4 sm:mb-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">License Key</h3>
              <Badge variant={license.isActive ? "default" : "outline"} className={license.isActive ? "bg-green-600" : ""}>
                {license.isActive ? "Active" : "Inactive"}
              </Badge>
              
              {/* Show appropriate badge based on license type */}
              {isTrial ? (
                <Badge variant="secondary" className="bg-blue-600 text-white">
                  Trial
                </Badge>
              ) : (
                <Badge variant="secondary">
                  {formatPlanName(license.plan || 'standard')}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-gray-100 rounded mb-2 font-mono text-sm">
              <code className="flex-1 overflow-x-auto whitespace-nowrap py-1">
                {license.licenseKey}
              </code>
              <button
                onClick={copyToClipboard}
                className="text-gray-500 hover:text-primary transition-colors"
                aria-label="Copy license key"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            
            <div className="text-sm text-gray-500 space-y-1">
              <p>Expires: {formatDate(expiryDate)}</p>
              
              {/* Show trial-specific information */}
              {isTrial && !isExpired && (
                <p className="font-medium text-blue-600">
                  {remainingDays} day{remainingDays !== 1 ? 's' : ''} remaining
                </p>
              )}
              
              {/* Show expired warning */}
              {isExpired && (
                <p className="font-medium text-red-600">
                  Expired
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button size="sm" variant="outline" className="gap-2" onClick={downloadLicenseKey}>
              <Download className="h-4 w-4" />
              Download License File
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LicenseCard;
