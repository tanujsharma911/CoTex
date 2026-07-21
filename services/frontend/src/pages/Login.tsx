import { useState } from "react";
import { Link, useNavigate } from "react-router";

import axios from "axios";

import { backendApi } from "@/services/backendApi";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { validateEmail, validatePassword } from "@/lib/validation";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    setEmailError(null);
    setPasswordError(null);

    const trimmedEmail = email.trim().toLowerCase();

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

    try {
      setIsSubmitting(true);
      const response = await backendApi.login(trimmedEmail, password);

      login(response.data.user, response.data.token);
      navigate("/project");
    } catch (err) {
      console.log("Login error:", err);
      setPassword("");
      if (axios.isAxiosError(err)) {
        const message =
          (err.response?.data as { message?: string } | undefined)?.message ??
          "Unable to log in. Please try again.";
        setError(message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <section className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-lg">
        <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Log in with your email and password.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm text-foreground">
              Email{" "}
              <span aria-label="required" className="text-red-500">
                *
              </span>
            </span>
            <input
              id="login-email"
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
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setPasswordError(null);
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
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
            className="w-full"
            disabled={isSubmitting}
            onClick={handleLogin}
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </Button>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          New here?{" "}
          <Link
            to="/signup"
            className="text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label="Create an account"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
