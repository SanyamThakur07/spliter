import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col pt-10">
      <section className="pt-5 pb-10">
        <div className="container mx-auto flex flex-col items-center justify-center space-y-6 text-center">
          <Badge
            variant="outline"
            className="bg-green-100 px-3 py-1 text-green-700"
          >
            Split expenses. Simplify life.
          </Badge>

          <h1 className="gradient-title max-w-2xl text-4xl font-bold sm:text-6xl">
            The smartest way to split expenses with friends
          </h1>

          <p className="text-md max-w-xl text-gray-500 sm:text-lg">
            Track shared expenses, split bills effortlessly, and settle up
            quickly. Never worry about who owes who again.
          </p>

          <div className="flex items-center space-x-4">
            <Button
              asChild
              className="bg-green-600 text-white transition hover:bg-green-700"
            >
              <a href="/dashboard">
                Get Started
                <ArrowRight className="ml-2" />
              </a>
            </Button>
            <Button variant={"outline"} className="px-4">
              <a href="#how-it-works"></a>See How It Works
            </Button>
          </div>

          <div className="mx-auto pt-20">
            <Image
              src={"/hero.png"}
              alt="Banner"
              width={1250}
              height={700}
              className="rounded-lg border-4 border-green-700 shadow-xl"
            ></Image>
          </div>
        </div>
      </section>
      <section className="p-10">
        <div className="mx-auto flex flex-col items-center justify-center space-y-4 pt-10 text-center">
          <Badge
            variant="outline"
            className="bg-green-100 px-3 py-1 text-green-700"
          >
            Features
          </Badge>

          <h1 className="gradient-title max-w-2xl text-4xl font-bold sm:text-4xl">
            Everything you need to split expenses
          </h1>

          <p className="text-md max-w-xl text-gray-500 sm:text-lg">
            Our platform provides all the tools you need to handle shared
            expenses with ease.
          </p>
        </div>
      </section>
    </div>
  );
}
