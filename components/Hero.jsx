"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";


const HeroSection = () => {


  return (
    <section className="w-full pt-36 md:pt-48 pb-10">
      <div className="space-y-6 text-center">
        <div className="space-y-6 mx-auto">
          <h1 className="text-5xl font-bold md:text-6xl lg:text-7xl xl:text-7xl gradient-title">
            Where Ambition Meets AI-
            <br />
            Build the Career You Deserve.
          </h1>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
            Advance your career with personalized guidance, interview prep, and
            AI-powered tools for job success.
          </p>
        </div>

        <div className="flex justify-center"> 
          <Link href="/dashboard">
          <Button size='lg' className='px-8' >Get Started</Button>
          </Link>
        </div>
        <div className="hero-image-wrapper relative mt-5 md:mt-0 flex justify-center">
          <div className="relative w-fit">
            
            <div
              className="pointer-events-none absolute inset-0 rounded-lg"
              style={{
                background: `
                  radial-gradient(circle at top left, rgb(0,0,0,0.2), transparent 70%),
                  radial-gradient(circle at top right, rgb(0,0,0,0.2), transparent 70%),
                  radial-gradient(circle at bottom left, rgb(0,0,0,0.2), transparent 70%),
                  radial-gradient(circle at bottom right, rgb(0,0,0,0.2), transparent 70%)
                `
              }}
            />
          </div>
        </div>
        </div>
      
    </section>
  );
}

export default HeroSection;
