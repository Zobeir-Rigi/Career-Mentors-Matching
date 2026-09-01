import { useState, type SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { login } from "@/services/authService";
import { getApiErrorMessage } from "@/services/getApiErrorMessages";
import { useAuth } from "@/lib/context/useAuth";

import { isMentorProfileResponse } from "@/services/mentorService";
import { isMenteeProfileResponse } from "@/services/menteeService";

export function LoginForm() {
  const navigate = useNavigate();
  const { setUser, refreshProfile } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      const result = await login({
        email: email.trim(),
        password,
      });

      setUser(result.user);
      const profile = await refreshProfile(result.user);

      if (result.user.role === "ADMIN") {
        navigate("/admin");
      } else if (result.user.role === "MENTOR") {
        if (isMentorProfileResponse(profile) && profile.isProfileComplete) {
          navigate("/mentor/dashboard");
        } else {
          navigate("/mentor/profile");
        }
      } else if (result.user.role === "MENTEE") {
        if (isMenteeProfileResponse(profile) && profile.matchReady) {
          navigate("/mentee/dashboard");
        } else {
          navigate("/mentee/profile");
        }
      }
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Something went wrong. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">
        Welcome back
      </h1>
      {error && (
        <p
          role="alert"
          className="mt-5 rounded-md border-l-4 border-error bg-error-tint px-4 py-3 text-sm text-fg"
        >
          {error}
        </p>
      )}
      <section>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            label="Email"
            autoComplete="email"
            placeholder="your@example.com"
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <Input
            id="password"
            name="password"
            type="password"
            value={password}
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            onChange={(event) => {
              setPassword(event.target.value);
            }}
            required
          />

          <div className="text-left">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="mt-8 text-sm text-muted">
          New here?{" "}
          <Link
            to="/signup"
            className="font-medium text-accent hover:underline"
          >
            Create an account
          </Link>
        </p>
      </section>
    </>
  );
}
