"use client";
import { FaGoogle } from "react-icons/fa";
import { signIn } from "next-auth/react";

export default function SignIn() {
  const handleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Welcome</h2>
          <p>Sign in to be 1% better everyday with Habits Aura</p>
          <div className="card-actions justify-center">
            <button onClick={handleSignIn} className="btn btn-primary">
              <FaGoogle size={20} />
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
