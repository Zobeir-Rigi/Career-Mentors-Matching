import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import { resendVerification, verifyEmail } from "@/services/authService";
import { Button } from "../ui/Button";
import { getApiErrorMessage } from "@/services/getApiErrorMessages";

type VerificationStatus = "check-email" | "verifying" | "verified" | "error";

interface VerifyEmailLocationState {
  email?: string;
  message?: string;
  verificationEmailSent?: boolean;
}

export function VerifyEmailPanel() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const locationState = location.state as VerifyEmailLocationState | null;

  const email = (location.state as VerifyEmailLocationState | null)?.email;
  const signupMessage = locationState?.message;
  const verificationEmailSent = locationState?.verificationEmailSent;

  const [status, setStatus] = useState<VerificationStatus>(
    token ? "verifying" : "check-email",
  );
  const [message, setMessage] = useState(signupMessage ?? "");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function verifyToken() {
      const tokenToVerify = token;
      if (!tokenToVerify) return;

      try {
        const result = await verifyEmail(tokenToVerify);

        setMessage(result.message);
        setStatus("verified");
      } catch (error) {
        setMessage(
          getApiErrorMessage(error, "Something went wrong. Please try again."),
        );
        setStatus("error");
      }
    }

    void verifyToken();
  }, [token]);

  async function handleResend() {
    if (!email || isResending) return;

    setMessage("");
    setIsResending(true);

    try {
      const result = await resendVerification(email);
      setMessage(result.message);
    } catch (error) {
      setMessage(
        getApiErrorMessage(
          error,
          "Unable to resend the verification email. Please try again.",
        ),
      );
    } finally {
      setIsResending(false);
    }
  }

  if (status === "verifying") {
    return (
      <section aria-live="polite">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          Verifying your email
        </h1>

        <p className="mt-4 text-muted">
          Please wait while we confirm your email address.
        </p>
      </section>
    );
  }

  if (status === "verified") {
    return (
      <section>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          Email verified
        </h1>

        <p className="mt-4 text-muted">{message}</p>

        <Link to="/login" className="mt-6 block">
          <Button className="w-full">Continue to log in</Button>
        </Link>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          Verification failed
        </h1>

        <p
          role="alert"
          className="mt-5 rounded-md border-l-4 border-error bg-error-tint px-4 py-3 text-sm text-fg"
        >
          {message}
        </p>

        <Link
          to="/signup"
          className="mt-6 inline-block font-medium text-accent hover:underline"
        >
          Return to signup
        </Link>
      </section>
    );
  }

  const emailDeliveryFailed = verificationEmailSent === false;

  return (
    <section>
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">
        {emailDeliveryFailed
          ? "Verification email not sent"
          : "Check your email"}
      </h1>

      <p className="mt-4 text-muted">
        {emailDeliveryFailed ? (
          <>
            Your account was created, but we could not send the verification
            email. Request a new one below.
          </>
        ) : (
          <>
            We sent a verification link
            {email && (
              <>
                {" "}
                to <span className="font-medium text-fg">{email}</span>
              </>
            )}
            . Open the link to verify your account.
          </>
        )}
      </p>

      {message && (
        <p
          role={emailDeliveryFailed ? "alert" : "status"}
          className={
            emailDeliveryFailed
              ? "mt-5 rounded-md border-l-4 border-warn bg-warn-tint px-4 py-3 text-sm text-fg"
              : "mt-5 rounded-md border-l-4 border-ok bg-ok-tint px-4 py-3 text-sm text-fg"
          }
        >
          {message}
        </p>
      )}

      {email && (
        <Button
          type="button"
          variant="outline"
          className="mt-6 w-full"
          disabled={isResending}
          onClick={handleResend}
        >
          {isResending ? "Resending..." : "Resend verification email"}
        </Button>
      )}

      <p className="mt-6 text-sm text-muted">
        Already verified?{" "}
        <Link to="/login" className="font-medium text-accent hover:underline">
          Log in
        </Link>
      </p>
    </section>
  );
}
