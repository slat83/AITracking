"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      className="stack"
      style={{ marginTop: 20 }}
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const result = await signIn("credentials", {
          email: formData.get("email"),
          password: formData.get("password"),
          redirect: false,
          callbackUrl: "/app",
        });

        setPending(false);
        if (result?.error) {
          setError("Invalid email or password.");
          return;
        }

        router.push("/app");
        router.refresh();
      }}
    >
      <label className="field">
        <span>Email</span>
        <input
          name="email"
          type="email"
          placeholder="name@brand.com"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
        />
      </label>
      <label className="field">
        <span>Password</span>
        <div className="passwordField">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Your workspace password"
            autoComplete="current-password"
            required
          />
          <button
            className="passwordToggle"
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </label>
      {error ? <p style={{ color: "#b91c1c", margin: 0 }}>{error}</p> : null}
      <button className="button buttonPrimary" type="submit" disabled={pending}>
        {pending ? "Signing in..." : "Enter workspace"}
      </button>
    </form>
  );
}
