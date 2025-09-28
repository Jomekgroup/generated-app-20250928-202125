import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { Sparkles, Menu, User as UserIcon, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthStore } from "@/stores/authStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";
const navLinks = [
  { to: "/", label: "Home" },
  { to: "/cleaners", label: "Find Cleaners" },
];
function MainNav() {
  return (
    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
      {navLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `transition-colors hover:text-primary ${isActive ? "text-primary" : "text-muted-foreground"}`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
function UserNav() {
  const { user, role, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const getDashboardPath = () => {
    switch (role) {
      case 'admin': return '/dashboard/admin';
      case 'cleaner': return '/dashboard/cleaner';
      case 'client':
      default:
        return '/dashboard/client';
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatarUrl} alt={user?.name} />
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={getDashboardPath()}>
            {role === 'admin' ? <Shield className="mr-2 h-4 w-4" /> : <UserIcon className="mr-2 h-4 w-4" />}
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export function Layout() {
  const isMobile = useIsMobile();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl font-display">CleanConnect</span>
            </Link>
            {!isMobile && <MainNav />}
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <UserNav />
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/auth">Log In</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Sign Up</Link>
                </Button>
              </div>
            )}
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <nav className="grid gap-6 text-lg font-medium mt-8">
                    {navLinks.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                          `transition-colors hover:text-primary ${isActive ? "text-primary" : "text-foreground"}`
                        }
                      >
                        {link.label}
                      </NavLink>
                    ))}
                    {!isAuthenticated && (
                      <>
                        <Separator />
                        <NavLink to="/auth" className="text-foreground">Log In</NavLink>
                        <NavLink to="/auth" className="text-foreground">Sign Up</NavLink>
                      </>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-muted">
        <div className="container max-w-7xl py-8 px-4 sm:px-6 lg:px-8 text-muted-foreground text-sm">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>&copy; {new Date().getFullYear()} CleanConnect. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/support" className="hover:text-primary transition-colors">Support</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            </div>
            <p>Built with ❤️ at Cloudflare</p>
          </div>
        </div>
      </footer>
      <Toaster richColors />
    </div>
  );
}