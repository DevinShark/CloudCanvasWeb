import { Link } from "wouter";
import { CloudDownload, Twitter, Linkedin, Youtube, Facebook } from "lucide-react";

const Footer = () => {
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
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200" aria-label="YouTube">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-6">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/#features">
                  <a className="text-gray-300 hover:text-white transition-colors duration-200">Features</a>
                </Link>
              </li>
              <li>
                <Link href="/#workflow">
                  <a className="text-gray-300 hover:text-white transition-colors duration-200">Workflow</a>
                </Link>
              </li>
              <li>
                <Link href="/#applications">
                  <a className="text-gray-300 hover:text-white transition-colors duration-200">Applications</a>
                </Link>
              </li>
              <li>
                <Link href="/#pricing">
                  <a className="text-gray-300 hover:text-white transition-colors duration-200">Pricing</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-gray-300 hover:text-white transition-colors duration-200">Documentation</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-gray-300 hover:text-white transition-colors duration-200">Updates</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-6">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#">
                  <a className="text-gray-300 hover:text-white transition-colors duration-200">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-gray-300 hover:text-white transition-colors duration-200">Careers</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-gray-300 hover:text-white transition-colors duration-200">Blog</a>
                </Link>
              </li>
              <li>
                <Link href="/#contact">
                  <a className="text-gray-300 hover:text-white transition-colors duration-200">Contact</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-gray-300 hover:text-white transition-colors duration-200">Partners</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-6">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#">
                  <a className="text-gray-300 hover:text-white transition-colors duration-200">Help Center</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-gray-300 hover:text-white transition-colors duration-200">Community</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-gray-300 hover:text-white transition-colors duration-200">Tutorials</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-gray-300 hover:text-white transition-colors duration-200">Webinars</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-gray-300 hover:text-white transition-colors duration-200">API Reference</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row md:justify-between">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">&copy; {new Date().getFullYear()} Digital Mapping Solutions. All rights reserved.</p>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
            <Link href="#">
              <a className="hover:text-white transition-colors duration-200">Privacy Policy</a>
            </Link>
            <Link href="#">
              <a className="hover:text-white transition-colors duration-200">Terms of Service</a>
            </Link>
            <Link href="#">
              <a className="hover:text-white transition-colors duration-200">Cookie Policy</a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
