import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import axios from "axios";

import { backendApi } from "@/services/backendApi";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import {
  validateName,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
} from "@/lib/validation";

const Signup = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // Validate name
    const nameValidation = validateName(trimmedName);
    if (!nameValidation.isValid) {
      setNameError(nameValidation.error || "Invalid name.");
      return;
    }

    // Validate email
    const emailValidation = validateEmail(trimmedEmail);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || "Invalid email.");
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error || "Invalid password.");
      return;
    }

    // Validate password match
    const passwordMatchValidation = validatePasswordMatch(
      password,
      confirmPassword,
    );
    if (!passwordMatchValidation.isValid) {
      setConfirmPasswordError(
        passwordMatchValidation.error || "Passwords do not match.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await backendApi.register(
        trimmedName,
        trimmedEmail,
        password,
      );

      login(response.data.user, response.data.token);
      navigate("/");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          (err.response?.data as { message?: string } | undefined)?.message ??
          "Unable to create account. Please try again.";
        setError(message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/project");
    }
  }, []);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <section className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-lg">
        <h1 className="text-2xl font-semibold text-foreground">
          Create account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign up to start collaborating.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSignup}>
          <label className="block space-y-2">
            <span className="text-sm text-foreground">
              Full name{" "}
              <span aria-label="required" className="text-red-500">
                *
              </span>
            </span>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setNameError(null);
              }}
              placeholder="Jane Doe"
              autoComplete="name"
              required
              aria-required="true"
              aria-invalid={!!nameError}
              aria-describedby={nameError ? "name-error" : "name-requirements"}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none ring-0 transition focus:border-ring focus:ring-2 focus:ring-ring/40 aria-invalid:border-red-500"
            />
            <span id="name-requirements" className="sr-only">
              Full name must contain only letters and spaces, minimum 2
              characters.
            </span>
            {nameError && (
              <p
                id="name-error"
                className="text-sm text-red-400"
                role="alert"
                aria-live="polite"
              >
                {nameError}
              </p>
            )}
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-foreground">
              Email{" "}
              <span aria-label="required" className="text-red-500">
                *
              </span>
            </span>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailError(null);
              }}
              placeholder="jane@company.com"
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-error" : undefined}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none ring-0 transition focus:border-ring focus:ring-2 focus:ring-ring/40 aria-invalid:border-red-500"
            />
            {emailError && (
              <p
                id="email-error"
                className="text-sm text-red-400"
                role="alert"
                aria-live="polite"
              >
                {emailError}
              </p>
            )}
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-foreground">
              Password{" "}
              <span aria-label="required" className="text-red-500">
                *
              </span>
            </span>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setPasswordError(null);
              }}
              placeholder="Enter your password"
              autoComplete="new-password"
              required
              aria-required="true"
              aria-invalid={!!passwordError}
              aria-describedby={
                passwordError ? "password-error" : "password-requirements"
              }
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none ring-0 transition focus:border-ring focus:ring-2 focus:ring-ring/40 aria-invalid:border-red-500"
            />
            <span id="password-requirements" className="sr-only">
              Password must be at least 8 characters.
            </span>
            {passwordError && (
              <p
                id="password-error"
                className="text-sm text-red-400"
                role="alert"
                aria-live="polite"
              >
                {passwordError}
              </p>
            )}
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-foreground">
              Confirm password{" "}
              <span aria-label="required" className="text-red-500">
                *
              </span>
            </span>
            <input
              id="signup-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setConfirmPasswordError(null);
              }}
              placeholder="Confirm your password"
              autoComplete="new-password"
              required
              aria-required="true"
              aria-invalid={!!confirmPasswordError}
              aria-describedby={
                confirmPasswordError ? "confirm-password-error" : undefined
              }
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none ring-0 transition focus:border-ring focus:ring-2 focus:ring-ring/40 aria-invalid:border-red-500"
            />
            {confirmPasswordError && (
              <p
                id="confirm-password-error"
                className="text-sm text-red-400"
                role="alert"
                aria-live="polite"
              >
                {confirmPasswordError}
              </p>
            )}
          </label>

          {error && (
            <div
              className="rounded-md bg-red-500/10 p-3 text-sm text-red-400"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label="Log in with existing account"
          >
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Signup;
