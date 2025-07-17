"use client";

import { useStoreUser } from "@/hooks/use-store-user";
import {
  SignedOut,
  SignedIn,
  SignInButton,
  SignUpButton,
  UserButton,
  SignIn,
} from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { LayoutDashboard } from "lucide-react";

export function Header() {
  const { isLoading } = useStoreUser();
  const path = usePathname();

  return (
    <div>
      <header className="fixed top-0 border-b bg-white/85 backdrop-blur-md w-full z-50 ">
        <nav className="flex items-center justify-between mx-auto px-4">
          <a href="/">
            <img
              src={"/logos/logo.png"}
              alt="logo"
              width={150}
              height={100}
              className="p-2"
            ></img>
          </a>

          {path === "/" && (
            <div className="flex items-center gap-6">
              <a
                href="#Feaures"
                className="text-md font-medium hover:text-green-700 transition"
              >
                Features
              </a>
              <a
                href="#How it Works"
                className="text-md font-medium hover:text-green-700 transition"
              >
                How is Works
              </a>
            </div>
          )}
          <div className="flex items-center gap-4">
            <Authenticated>
              <a href="/dashboard">
                <Button
                  variant={"outline"}
                >
                  <LayoutDashboard />
                  Dashboard
                </Button>
              </a>
              <UserButton />
            </Authenticated>
            <Unauthenticated>
              <SignInButton>
                <Button variant={"ghost"}> Sign In</Button>
              </SignInButton>
              <SignUpButton>
                <Button className="bg-green-600 hover:bg-green-700 transition">
                  Get Started
                </Button>
              </SignUpButton>
            </Unauthenticated>
          </div>
        </nav>
      </header>
    </div>
  );
}
