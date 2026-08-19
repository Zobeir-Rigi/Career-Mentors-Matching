import { useState, type SyntheticEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

import { resetPassword } from "@/services/authService";
import { getApiErrorMessage } from "@/services/getApiErrorMessages";

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    setError(null);

    if (!token) {
      setError("Password reset link is invalid or missing.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
   
    try {
      setIsSubmitting(true);

      await resetPassword(token, password);

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          "Unable to reset your password. The link may be invalid or expired.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

    if (!token) {
      return (
        <main className="mx-auto max-w-md px-4 py-10">
          <h1 className="font-display text-3xl font-semibold">
            Invalid reset link
          </h1>

          <p className="mt-2 text-muted">
            This password reset link is invalid or incomplete.
          </p>

          <div className="mt-6">
            <Link to="/forgot-password" className="text-accent underline">
              Request a new password reset link
            </Link>
          </div>
        </main>
      );
    }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">
        Reset your password
      </h1>

      <p className="mt-2 text-muted">Enter a new password for your account.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <Input
          id="password"
          name="password"
          type="password"
          label="New password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          required
        />

        <Input
          id="confirm-password"
          name="confirm-password"
          type="password"
          label="Confirm new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
        />

        <p className="text-sm text-muted">
          Password must contain at least 8 characters, including an uppercase
          letter, lowercase letter, number, and special character.
        </p>

        {error && (
          <p
            role="alert"
            className="rounded-md border-l-4 border-error bg-error-tint px-4 py-3 text-sm text-fg"
          >
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Resetting password..." : "Reset password"}
        </Button>

        <div className="text-center">
          <Link to="/login" className="text-accent underline">
            Back to login
          </Link>
        </div>
      </form>
    </main>
  );
}
