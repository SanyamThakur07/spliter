import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, Ghost } from "lucide-react";
import { FEATURES, STEPS, TESTIMONIALS } from "@/lib/landing";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
              src={"/hero1.png"}
              alt="Banner"
              width={1000}
              height={500}
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

          <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-3">
            {FEATURES.map(({ title, Icon, bg, color, description }) => (
              <Card
                key={title}
                className="flex flex-col items-center justify-center space-y-2 p-6 text-center"
              >
                <div className={`rounded-full p-3 ${bg}`}>
                  <Icon className={`h-6 w-6 ${color} `} />
                </div>
                <h3 className="text-xl font-bold"> {title} </h3>
                <p className="text-gray-500"> {description} </p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="p-10">
        <div className="mx-auto flex flex-col items-center justify-center space-y-4 pt-10 text-center">
          <Badge
            variant="outline"
            className="bg-green-100 px-3 py-1 text-green-700"
          >
            How It Works
          </Badge>

          <h1 className="gradient-title max-w-2xl text-4xl font-bold sm:text-4xl">
            Splitting expenses has never been easier
          </h1>

          <p className="text-md max-w-xl text-gray-500 sm:text-lg">
            Follow these simple steps to start tracking and splitting expenses
            with friends.
          </p>

          <div className="mx-auto mt-10 grid max-w-6xl gap-6 sm:grid-cols-3">
            {STEPS.map(({ label, title, description }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center space-y-2 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-700">
                  {label}
                </div>
                <h3 className="text-xl font-bold"> {title} </h3>
                <p className="text-center text-gray-500"> {description} </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="p-10">
        <div className="mx-auto flex flex-col items-center justify-center space-y-4 pt-10 text-center">
          <Badge
            variant="outline"
            className="bg-green-100 px-3 py-1 text-green-700"
          >
            Testimonials
          </Badge>

          <h1 className="gradient-title max-w-2xl text-4xl font-bold sm:text-4xl">
            What our users are saying
          </h1>

          <div className="mx-auto grid max-w-6xl gap-6 pt-10 sm:grid-cols-3">
            {TESTIMONIALS.map(({ quote, name, image, role }) => (
              <Card key={name} className="">
                <CardContent className="space-y-6 p-6">
                  <p className="mx-auto max-w-md text-center text-gray-500">
                    {quote}
                  </p>
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={image} alt={name} />
                      <AvatarFallback className="uppercase">
                        {" "}
                        {name.charAt(0)}{" "}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium"> {name} </p>
                      <p className="text-sm text-gray-500"> {role} </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="gradient mt-10 p-10">
        <div className="mx-auto flex flex-col items-center justify-center space-y-4 pt-10 text-center">
          <h2 className="text-4xl font-bold text-white">
            Ready to simplify expense sharing?
          </h2>
          <p className="max-w-lg text-lg text-green-100">
            Join thousands of users who have made splitting expenses
            stress-free.
          </p>
          <Button
            asChild
            variant={"ghost"}
            className="bg-green-800 text-green-100"
          >
            <a href="/dashboard">
              Get Started
              <ArrowRight className="ml-2"></ArrowRight>
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
