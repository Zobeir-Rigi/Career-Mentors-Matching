import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/Button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        {/* Header content goes here */}

        {/* Left end */}
        <div className="flex items-center gap-2">
          <Logo></Logo>
        </div>

        {/* Right end */}
        <div className="flex items-center">
          <ThemeToggle />
          <Button variant="quiet">LogIn</Button>
          <Button variant="primary">SignUp</Button>
        </div>
      </div>
    </header>
  );
}
