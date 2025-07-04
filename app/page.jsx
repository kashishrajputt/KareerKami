import HeroSection from "@/components/Hero";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { faqs } from "@/data/faqs";
import { features } from "@/data/features";
import { howItWorks } from "@/data/howItWorks";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div className="grid-background"></div>

      <HeroSection />

      <section className="w-full py-12 md:py-24 lg:py-32 bg-background"> 
        
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-12"> Powerful Features for Your Career Growth</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature,index)=>{
            return(
              <Card key={index}
              className="border-2 hover:border-primary transition-colors duration-300">
              
                <CardContent className="pt-6 text-center flex flex-col items-center ">
                  <div className="flex flex-col items-center justify-center">{feature.icon}
                    <h3 className="text-xl font-bold mb-2">{features.title}</h3>
                    <p className=" foreground">{feature.description}</p>

                  </div>
                </CardContent>
                
              </Card>
            )
          })}</div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 bg-muted"> 
        
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="flex flex-col items-center justify-center space-y-2">
              <h3 className="text-4xl font-bold">50+</h3>
              <p className="text-muted-foreground">Industries Covered</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2">
              <h3 className="text-4xl font-bold">1000+</h3>
              <p className="text-muted-foreground">Interview Questions</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2">
              <h3 className="text-4xl font-bold">24/7</h3>
              <p className="text-muted-foreground">AI Support</p>
            </div>
            
          </div>
        </div>
      </section>

      <section className="w-full py-8 md:py-12 lg:py-32 bg-background"> 
        
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">
               How It Works
            </h2>
            <h1 className="text-muted-foreground font-bold">
              Four Simple Steps to Accelerate Your Career Growth
            </h1>
          </div>
          <div className="flex items-center justify-center gap-6 max-w-6xl mx-auto">
            <Carousel>
              <CarouselContent>
                {howItWorks.map((item, index) => (
                  <CarouselItem key={index}
                  className="flex flex-col items-center justify-center text-center">
                    {item.icon}
                  <div className=" mt-4 text-xl font-semibold">{item.title}</div>
                  <div className="mt-2 text-muted-foreground">{item.description}</div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </section>

      <section className="w-full py-8 md:py-12 lg:py-32 bg-background"> 
        
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">
               Frequently Asked Questions
            </h2>
            <h1 className="text-muted-foreground font-bold">
              Find answers to common questions about our platform
            </h1>
          </div>
          <div className=" max-w-6xl mx-auto">
            <Accordion type="single" collapsible>
              {faqs.map((faqs,index)=>{
                return(
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>{faqs.question}</AccordionTrigger>
                      <AccordionContent>
                        {faqs.answer}
                      </AccordionContent>
                    </AccordionItem>
              
                );
            })}
          </Accordion>
          </div>
        </div>
      </section>

      <section className="w-full bg-muted-foreground relative overflow-hidden"> 
        {/* Top Gradient */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 w-full h-32"
            style={{
              background: "linear-gradient(to bottom, oklch(20.791% 0.01814 300.045), transparent 90%)"
            }}
          />
          {/* Bottom Gradient */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 bottom-0 w-full h-32"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent 90%)"
            }}
          />
        <div className="mx-auto py-24 gradient rounded-lg">
          <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tracker text-primary-foreground sm:text-4xl md:text-5xl">
               Ready to Accelerate Your Career?
            </h2>
            <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl">
              Join thousands of professionals who are advancing their careers
              with AI-powered guidance.
            </p>
            <Link href="/dashboard" passHref>
            <Button
            size="lg"
            variant="secondary"
            className="h-11 mt-5 animate-bounce"
            >Start Your Journey Today<ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            </Link>
          </div>
          
        </div>
      </section>



    </div>
      
  );
}
