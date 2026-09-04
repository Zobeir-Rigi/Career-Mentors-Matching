import { useState, type SyntheticEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

import { signup, type SignupRole } from "../../services/authService";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { RoleOption } from "../ui/RoleOption";
import { getApiErrorMessage } from "@/services/getApiErrorMessages";

interface SignupFormErrors {
  role?: string;
  fullName?: string;
  email?: string;
  password?: string;
  form?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()[\]{}\-_=+\\|;:'",.<>/?`~]).{8,}$/;
const DEFAULT_ERROR_MESSAGE =
  "Unable to create your account. Please try again.";

export function SignupForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const roleFromNavigation = location.state?.role as SignupRole | undefined;

  const [role, setRole] = useState<SignupRole | "">(roleFromNavigation ?? "");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  //   validate form input
  function validateForm(): SignupFormErrors {
    const validationErrors: SignupFormErrors = {};
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!role) {
      validationErrors.role = "You must select a role.";
    }

    if (!trimmedName) {
      validationErrors.fullName = "Full name is required.";
    }

    if (!trimmedEmail) {
      validationErrors.email = "Email is required.";
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      validationErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      validationErrors.password = "Password is required.";
    } else if (!PASSWORD_PATTERN.test(password)) {
      validationErrors.password =
        "Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character.";
    }
    return validationErrors;
  }

  function handleRoleSelect(selectedRole: SignupRole) {
    setRole(selectedRole);

    setErrors((currentErrors) => ({
      ...currentErrors,
      role: undefined,
      form: undefined,
    }));
  }

  //   handle submit
  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!role) return;

    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await signup({
        role,
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      navigate("/verify-email", {
        state: {
          email: result.user.email,
          message: result.message,
          verificationEmailSent: result.verificationEmailSent,
        },
      });
    } catch (err) {
      setErrors({
        form: getApiErrorMessage(err, DEFAULT_ERROR_MESSAGE),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <h1 className="font-display text-[2rem] font-semibold leading-tight text-fg">
        Join the CYF mentorship programme
      </h1>

      {errors.form && (
        <p className="mt-2 text-sm text-error" role="alert">
          {errors.form}
        </p>
      )}
      <form className="mt-7" onSubmit={handleSubmit} noValidate>
        <fieldset>
          <legend className="text-sm font-medium text-fg">
            I'm joining as
          </legend>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <RoleOption
              role="MENTEE"
              title="Mentee"
              description="CYF trainee or graduate"
              selectedRole={role}
              onSelect={handleRoleSelect}
            />
            <RoleOption
              role="MENTOR"
              title="Mentor"
              description="Volunteer Professional"
              selectedRole={role}
              onSelect={handleRoleSelect}
            />
          </div>
          {errors.role && (
            <p className="mt-2 text-sm text-error" role="alert">
              {errors.role}
            </p>
          )}
        </fieldset>

        <div className="mt-5 space-y-4">
          <Input
            id="fullName"
            name="fullName"
            type="text"
            label="Full name"
            autoComplete="name"
            value={fullName}
            onChange={(event) => {
              setFullName(event.target.value);
              setErrors((currentErrors) => ({
                ...currentErrors,
                fullName: undefined,
                form: undefined,
              }));
            }}
            required
            error={errors.fullName}
          />
          <Input
            id="signUpEmail"
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((currentErrors) => ({
                ...currentErrors,
                email: undefined,
                form: undefined,
              }));
            }}
            required
            error={errors.email}
          />
          <Input
            id="signupPassword"
            name="password"
            type="password"
            label="Password (8+ characters)"
            autoComplete="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((currentErrors) => ({
                ...currentErrors,
                password: undefined,
                form: undefined,
              }));
            }}
            required
            error={errors.password}
          />
          <Button className="w-full mt-6" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create an account"}
          </Button>

          <p className="mt-5 text-sm text-muted">
            Already registered?{" "}
            <Link
              to="/login"
              className="font-medium text-accent hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
