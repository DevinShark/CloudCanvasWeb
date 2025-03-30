import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/auth";
import logoPath from "@assets/CC_icon.ico";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  
  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser,
    staleTime: 60000,
  });

  // Handle scroll event for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? "bg-white bg-opacity-98 shadow-md" : "bg-white bg-opacity-95"
    }`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src={logoPath} alt="Cloud Canvas Logo" className="h-10 w-10" />
            <Link href="/">
              <a className="text-2xl font-bold text-primary">CloudCanvas</a>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="#features" 
              className="font-medium hover:text-accent transition-colors duration-200 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('features');
                if (element) {
                  const headerHeight = 80;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  });
                }
                if (location !== "/") {
                  window.history.pushState({}, "", "/#features");
                }
              }}
            >
              Features
            </a>
            <a 
              href="#workflow" 
              className="font-medium hover:text-accent transition-colors duration-200 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('workflow');
                if (element) {
                  const headerHeight = 80;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  });
                }
                if (location !== "/") {
                  window.history.pushState({}, "", "/#workflow");
                }
              }}
            >
              Workflow
            </a>
            <a 
              href="#applications" 
              className="font-medium hover:text-accent transition-colors duration-200 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('applications');
                if (element) {
                  const headerHeight = 80;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  });
                }
                if (location !== "/") {
                  window.history.pushState({}, "", "/#applications");
                }
              }}
            >
              Applications
            </a>
            <a 
              href="#pricing" 
              className="font-medium hover:text-accent transition-colors duration-200 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('pricing');
                if (element) {
                  const headerHeight = 80;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  });
                }
                if (location !== "/") {
                  window.history.pushState({}, "", "/#pricing");
                }
              }}
            >
              Pricing
            </a>
            <a 
              href="#contact" 
              className="font-medium hover:text-accent transition-colors duration-200 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('contact');
                if (element) {
                  const headerHeight = 80;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  });
                }
                if (location !== "/") {
                  window.history.pushState({}, "", "/#contact");
                }
              }}
            >
              Contact
            </a>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    My Account
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link href="/dashboard">
                    <DropdownMenuItem className="cursor-pointer">
                      Dashboard
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => {
                      window.location.href = "/";
                    })}
                  >
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" className="text-primary border border-primary hover:bg-primary hover:text-white transition-colors duration-200">
                    Log In
                  </Button>
                </Link>
                <Link href="/#pricing">
                  <Button className="bg-secondary text-white hover:bg-opacity-90 transition-colors duration-200">
                    Free Trial
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden text-primary focus:outline-none"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-6 pb-4">
            <div className="flex flex-col space-y-4">
              <a 
                href="#features" 
                className="font-medium hover:text-accent transition-colors duration-200 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  closeMobileMenu();
                  const element = document.getElementById('features');
                  if (element) {
                    const headerHeight = 80;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  }
                  if (location !== "/") {
                    window.history.pushState({}, "", "/#features");
                  }
                }}
              >
                Features
              </a>
              <a 
                href="#workflow" 
                className="font-medium hover:text-accent transition-colors duration-200 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  closeMobileMenu();
                  const element = document.getElementById('workflow');
                  if (element) {
                    const headerHeight = 80;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  }
                  if (location !== "/") {
                    window.history.pushState({}, "", "/#workflow");
                  }
                }}
              >
                Workflow
              </a>
              <a 
                href="#applications" 
                className="font-medium hover:text-accent transition-colors duration-200 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  closeMobileMenu();
                  const element = document.getElementById('applications');
                  if (element) {
                    const headerHeight = 80;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  }
                  if (location !== "/") {
                    window.history.pushState({}, "", "/#applications");
                  }
                }}
              >
                Applications
              </a>
              <a 
                href="#pricing" 
                className="font-medium hover:text-accent transition-colors duration-200 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  closeMobileMenu();
                  const element = document.getElementById('pricing');
                  if (element) {
                    const headerHeight = 80;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  }
                  if (location !== "/") {
                    window.history.pushState({}, "", "/#pricing");
                  }
                }}
              >
                Pricing
              </a>
              <a 
                href="#contact" 
                className="font-medium hover:text-accent transition-colors duration-200 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  closeMobileMenu();
                  const element = document.getElementById('contact');
                  if (element) {
                    const headerHeight = 80;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  }
                  if (location !== "/") {
                    window.history.pushState({}, "", "/#contact");
                  }
                }}
              >
                Contact
              </a>
              <div className="flex space-x-4 pt-4">
                {user ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="outline" className="text-primary border border-primary hover:bg-primary hover:text-white transition-colors duration-200" onClick={closeMobileMenu}>
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        fetch("/api/auth/logout", { method: "POST" }).then(() => {
                          window.location.href = "/";
                          closeMobileMenu();
                        });
                      }}
                    >
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="outline" className="text-primary border border-primary hover:bg-primary hover:text-white transition-colors duration-200" onClick={closeMobileMenu}>
                        Log In
                      </Button>
                    </Link>
                    <Link href="/#pricing">
                      <Button className="bg-secondary text-white hover:bg-opacity-90 transition-colors duration-200" onClick={closeMobileMenu}>
                        Free Trial
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
