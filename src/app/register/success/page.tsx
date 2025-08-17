"use client";
import { useEffect, useState } from "react";

export default function RegisterSuccessPage() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();
    document.addEventListener("click", checkTheme);
    return () => {
      document.removeEventListener("click", checkTheme);
    };
  }, []);

  return (
    <div>
      <style jsx>{`
        .bg-money {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: -1;
        }
        .light-bg-money {
          background-image:
            radial-gradient(ellipse 70% 50% at center, transparent 0%, rgba(255, 255, 255, 0.9) 98%),
            url("/bg-money.png");
          background-repeat: repeat;
          background-size: auto;
        }

        .dark-bg-money {
          background-image:
            radial-gradient(ellipse 70% 50% at center, #000000e6 0%, #000000ff 100%), url("/bg-money.png");
          background-repeat: repeat;
          background-size: auto;
        }
      `}</style>
      <div className={isDark ? "bg-money dark-bg-money" : "bg-money light-bg-money"}></div>
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="w-full max-w-sm -translate-y-20 rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-900">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ff007B] p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold">Registration Successful!</h1>
          <p className="mb-6 text-gray-600">You can now log in and start using Czechitoken.</p>
          <a href="/profile">
            <button className="w-full rounded-xl bg-[#ff007B] p-2 font-bold text-white hover:bg-[#d60068]">
              Log in
            </button>
          </a>
        </div>
      </div>{" "}
    </div>
  );
}
