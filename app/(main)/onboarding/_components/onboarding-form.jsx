"use client";

import { useForm } from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import { onboardingSchema } from "@/app/lib/schema";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

  return <div>OnboardingForm</div>
  
};

export default OnboardingPage;
