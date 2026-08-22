import { useNavigate } from "react-router-dom";

import { Header } from "@/components/Header";
import { Button } from "@/components/ui/Button";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <Header />

      <main className="flex min-h-[70vh] items-center justify-center px-5">
        <div className="max-w-lg text-center">
          <p className="font-sans text-sm font-bold text-accent">404 Error </p>
          <p className="mt-5 font-sans text-base leading-7 text-muted">
            This page is currently under development and will be available soon.
          </p>

          <Button className="mt-8" onClick={() => navigate("/")}>
            Back to home
          </Button>
        </div>
      </main>
    </>
  );
}
