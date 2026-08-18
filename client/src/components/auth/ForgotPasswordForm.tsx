import { useState, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";

import { forgotPassword } from "@/services/authService";
import { getApiErrorMessage } from "@/services/getApiErrorMessages";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    try {
      event.preventDefault();

      setIsSubmitting(true);
      setError(null);
      setMessage(null);

      const response = await forgotPassword(email.trim());

      setMessage(response.message);
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          "Unable to request a password reset. Please try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">Forgot password?</h1>

      <p className="mt-2 text-muted">
        Enter your email address and we'll send you a password reset link.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          placeholder="test@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        {error && (
          <p role="alert" className="text-error">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="text-muted">
            {message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send reset link"}
        </Button>

        <Link to="/login" className="text-accent underline">
          Back to login
        </Link>
      </form>
    </main>
  );
}
