"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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
        <input name="email" type="email" placeholder="admin@example.com" required />
      </label>
      <label className="field">
        <span>Password</span>
        <input name="password" type="password" placeholder="change-me-now" required />
      </label>
      {error ? <p style={{ color: "#b91c1c", margin: 0 }}>{error}</p> : null}
      <button className="button buttonPrimary" type="submit" disabled={pending}>
        {pending ? "Signing in..." : "Continue"}
      </button>
    </form>
  );
}
