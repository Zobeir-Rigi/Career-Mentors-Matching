import { useNavigate } from "react-router-dom";
import { Logo } from "./ui/Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/Button";
import { useAuth } from "@/lib/context/useAuth";

export function Header() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const fullName = user?.fullName || profile?.user?.fullName || "";

  const roleName = user?.role?.toLowerCase();
  const isAuthenticated = Boolean(user && user.role);

  const handleLogout = async () => {
    if (logout) {
      await logout();
    }
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        {/* Left end */}
        <div className="flex items-center gap-2">
          <Logo></Logo>
        </div>

        {/* Center: Navigation */}
        {isAuthenticated && roleName && (
          <nav className="flex items-center gap-4">
            <Button
              variant="quiet"
              onClick={() => navigate(`/${roleName}/profile`)}
            >
              Profile
            </Button>
            <Button
              variant="quiet"
              onClick={() => navigate(`/${roleName}/dashboard`)}
            >
              Dashboard
            </Button>
          </nav>
        )}

        {/* Right end */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <>
              <span className="text-sm font-medium text-foreground">
                {fullName}
              </span>
              <Button variant="quiet" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="quiet" onClick={() => navigate("/login")}>
                LogIn
              </Button>
              <Button variant="primary" onClick={() => navigate("/signup")}>
                SignUp
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
