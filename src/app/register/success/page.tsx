"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterSuccessPage() {
  return (
    <div>
      <div className="flex min-h-screen w-full items-center justify-center">
        <Card className="w-full max-w-sm  p-8 text-center shadow-2xl dark:shadow-[0_4px_24px_0_rgba(255,255,255,0.05)]">
          <CardHeader>
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
            <CardTitle>Registration Successful!</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>You can now log in and start using Czechitoken.</CardDescription>{" "}
          </CardContent>
          <CardFooter>
            {/*   <a href="/profile">
              <button className="w-full rounded-xl bg-[#ff007B] p-2 font-bold text-white hover:bg-[#d60068]">
                Log in  </a>
              </button> */}

            <Button variant="outline" size="sm" className="w-full">
              Log in
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
