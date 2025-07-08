"use client";

import { useForm } from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import { onboardingSchema } from "@/app/lib/schema";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const OnboardingPage = ({industries}) => {


    const [selectedIndustry, setSelectedIndustry] = useState(null);
    const router = useRouter();
    const {
        register, 
        handleSubmit, 
        formState:{errors},
        setValue,
        watch,
        } = useForm({
        resolver: zodResolver (onboardingSchema),
    });

    const onSubmit = async (values) => {
      console.log(values);
    };

    
    const watchIndustry = watch("industry");

  return (
  <div className="flex items-center justify-center bg-background">
      <Card className="w-full max-w-lg mt-10 mx-2">
        <CardHeader>
          <CardTitle className="gradient-title text-4xl">Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
          
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
            <Select 
            onValueChange = {(value) => {
              setValue("industry", value);
              setSelectedIndustry(
                industries.find((ind) => ind.id === value)
              );
              setValue("subIndustry","");
            }}
            >
              <SelectTrigger className="industry">
                <SelectValue placeholder="Select an Industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((ind)=>{
                  return (
                    <SelectItem value={ind.id} key={ind.id}>{ind.name}</SelectItem>
                  );
                })}
                
                
              </SelectContent>
            </Select>
            {errors.industry && (
              <p className="text-sm text-red-500">
                {errors.industry.message}
              </p>
            )}
            </div>
            
          {watchIndustry && (
              <div className="space-y-2">
              <Label htmlFor="subIndustry">Specialization</Label>
            <Select onValueChange = {(value) => setValue("subIndustry", value)}>
              <SelectTrigger id="subIndustry">
                <SelectValue placeholder="Select your Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                      <SelectLabel>Specializations</SelectLabel>
                      {selectedIndustry?.subIndustries.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectGroup>
              </SelectContent>
            </Select>
            {errors.subIndustry && (
              <p className="text-sm text-red-500">
                {errors.subIndustry.message}
              </p>
            )}
            </div>
          )}

          <div className="space-y-2">
              <Label htmlFor="subIndustry">Years of Experience</Label>
            <Input 
            id="experience"
            type="number"
            min='0'
            max='50'
            placeholder="Enter years of Experience" 
            {...register("experience")}
            />
            {errors.experience && (
              <p className="text-sm text-red-500">
                {errors.experience.message}
              </p>
            )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
            <Input 
            id="skills"
            placeholder="e.g., Python, TavaScript, etc." 
            {...register("skills")}
            />
            <p className="text-sm text-muted-foreground">
              Separate multiple skills with commas
            </p>
            {errors.skills && (
              <p className="text-sm text-red-500">
                {errors.skills.message}
              </p>
            )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
            <Textarea
            id="skills"
            placeholder="Tell us about your professional background..." 
            className="h-32"
            {...register("bio")}
            />
            
            {errors.bio && (
              <p className="text-sm text-red-500">
                {errors.bio.message}
              </p>
            )}
            </div>
            <Button type="submit" className="w-full">
              Complete Profile
            </Button>
          </form>
        </CardContent>
        
      </Card>
  </div>
  );
};

export default OnboardingPage;
