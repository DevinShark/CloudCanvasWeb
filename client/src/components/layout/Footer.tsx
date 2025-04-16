import { Link } from "wouter";
import { CloudDownload, Twitter, Linkedin, Youtube, Facebook } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";

const Footer = () => {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      window.history.pushState({}, '', `/#${sectionId}`);
    }
  };

  return (
    <footer className="bg-primary text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <CloudDownload className="h-8 w-8 text-white" />
              <Link href="/">
                <a className="text-2xl font-bold">CloudCanvas</a>
              </Link>
            </div>
            <p className="text-gray-300 mb-6">
              Transform your geospatial data into actionable insights with our powerful
              visualization and analysis tool.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-6">Product</h3>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer" onClick={e => scrollToSection(e, 'features')}>Features</a>
              </li>
              <li>
                <a href="#workflow" className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer" onClick={e => scrollToSection(e, 'workflow')}>Workflow</a>
              </li>
              <li>
                <a href="#applications" className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer" onClick={e => scrollToSection(e, 'applications')}>Applications</a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer" onClick={e => scrollToSection(e, 'pricing')}>Pricing</a>
              </li>
              <li>
                <span className="text-gray-300 opacity-50 cursor-not-allowed">Documentation</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-6">Company</h3>
            <ul className="space-y-3">
              <li>
                <Dialog>
                  <DialogTrigger asChild>
                    <a className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer">About Us</a>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>About Us</DialogTitle>
                      <DialogDescription>
                        <p><strong>Our Story:</strong></p>
                        <p>CloudCanvas began with a vision to transform how professionals work with geospatial data. Founded by a passionate developer with extensive experience in 3D visualization and photogrammetry, our journey started when we encountered the limitations of conventional aerial data processing methods.</p>
                        
                        <p className="mt-2">What began as a personal solution to streamline editing and analysis workflows has evolved into a comprehensive platform that serves professionals across multiple industries. CloudCanvas was built tool by tool, each addressing specific challenges encountered in real-world projects.</p>
                        
                        <p className="mt-2"><strong>Our Mission:</strong></p>
                        <p>At Digital Mapping Solutions, we're committed to making geospatial data processing more accessible, accurate, and efficient. We continuously expand our software capabilities to accommodate diverse applications while maintaining an intuitive user experience.</p>
                        
                        <p className="mt-2"><strong>Continuous Innovation:</strong></p>
                        <p>CloudCanvas is constantly evolving. We regularly release updates with new features, performance improvements, and bug fixes. Your feedback is invaluable to our development process—if you encounter any issues, please report them so we can address them promptly.</p>
                        
                        <p className="mt-2">Thank you for choosing CloudCanvas. We appreciate your support and patience as we work to deliver the best possible tools for your geospatial data needs.</p>
                        
                        <p className="mt-2"><strong>Contact:</strong></p>
                        <p>Email: dms@live.co.za</p>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </li>
              <li>
                <a href="#contact" className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer" onClick={e => scrollToSection(e, 'contact')}>Contact</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row md:justify-between">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">&copy; {new Date().getFullYear()} Digital Mapping Solutions. All rights reserved.</p>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
            <Dialog>
              <DialogTrigger asChild>
                <a className="hover:text-white transition-colors duration-200 cursor-pointer">Privacy Policy</a>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Privacy Policy</DialogTitle>
                  <DialogDescription>
                    <p><strong>Effective Date:</strong> April 2025</p>
                    <p>We value your privacy. This Privacy Policy explains how CloudCanvas collects, uses, and protects your personal information when you use our services.</p>
                    <ul className="list-disc pl-5 mt-2">
                      <li><strong>Information We Collect:</strong> We may collect your name, email address, usage data, and cookies when you use our website or services.</li>
                      <li><strong>How We Use Information:</strong> To provide, improve, and personalize our services, communicate with you, and ensure security.</li>
                      <li><strong>Sharing:</strong> We do not sell your data. We may share information with trusted third parties for service provision, legal compliance, or protection of rights.</li>
                      <li><strong>Cookies:</strong> We use cookies for analytics, preferences, and improving user experience. You can manage cookies in your browser settings.</li>
                      <li><strong>Your Rights:</strong> You may request access, correction, or deletion of your data. Contact us at dms@live.co.za.</li>
                    </ul>
                    <p className="mt-2">For more details, please contact us or visit our website.</p>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <a className="hover:text-white transition-colors duration-200 cursor-pointer">Terms of Service</a>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Terms of Service</DialogTitle>
                  <DialogDescription>
                    <p><strong>Effective Date:</strong> April 2025</p>
                    <ul className="list-disc pl-5 mt-2">
                      <li><strong>Acceptance:</strong> By using CloudCanvas, you agree to these terms. If you do not agree, do not use our services.</li>
                      <li><strong>Use of Service:</strong> You must use our services lawfully and not misuse or attempt to disrupt them.</li>
                      <li><strong>Intellectual Property:</strong> All content, trademarks, and data on this site are owned by or licensed to Digital Mapping Solutions.</li>
                      <li><strong>Limitation of Liability:</strong> We are not liable for any damages arising from your use of our services.</li>
                      <li><strong>Termination:</strong> We may suspend or terminate your access for violations of these terms.</li>
                      <li><strong>Changes:</strong> We may update these terms at any time. Continued use means you accept the new terms.</li>
                    </ul>
                    <p className="mt-2">For questions, contact us at dms@live.co.za.</p>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <a className="hover:text-white transition-colors duration-200 cursor-pointer">Cookie Policy</a>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cookie Policy</DialogTitle>
                  <DialogDescription>
                    <p><strong>Effective Date:</strong> April 2025</p>
                    <ul className="list-disc pl-5 mt-2">
                      <li><strong>What Are Cookies:</strong> Cookies are small text files stored on your device to help us improve your experience.</li>
                      <li><strong>Types of Cookies We Use:</strong> Essential, analytics, and preference cookies.</li>
                      <li><strong>Managing Cookies:</strong> You can control cookies through your browser settings. Disabling cookies may affect site functionality.</li>
                      <li><strong>Third-Party Cookies:</strong> We may use third-party services (like analytics) that set their own cookies.</li>
                    </ul>
                    <p className="mt-2">For more information, contact us at dms@live.co.za.</p>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
