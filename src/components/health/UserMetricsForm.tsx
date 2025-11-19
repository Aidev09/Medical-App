
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, User, Ruler, Weight, Activity } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  age: z.coerce.number().int().min(13).max(100),
  height: z.coerce.number().min(120).max(250),
  weight: z.coerce.number().min(30).max(300),
  gender: z.enum(["male", "female"]),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very-active"])
});

export type UserMetrics = z.infer<typeof formSchema>;

interface UserMetricsFormProps {
  onMetricsSubmit: (data: UserMetrics) => void;
  className?: string;
  isLoading?: boolean;
}

const UserMetricsForm: React.FC<UserMetricsFormProps> = ({ 
  onMetricsSubmit, 
  className,
  isLoading = false
}) => {
  const form = useForm<UserMetrics>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      height: undefined,
      weight: undefined,
      gender: "male",
      activityLevel: "moderate"
    },
  });

  const onSubmit = async (data: UserMetrics) => {
    try {
      onMetricsSubmit(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to calculate diet plan. Please try again."
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  Age (years)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter your age"
                    {...field}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (isNaN(value)) {
                        field.onChange("");
                      } else {
                        field.onChange(value);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  Gender
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Ruler className="h-4 w-4" />
                  Height (cm)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter your height"
                    {...field}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (isNaN(value)) {
                        field.onChange("");
                      } else {
                        field.onChange(value);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Weight className="h-4 w-4" />
                  Weight (kg)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter your weight"
                    {...field}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (isNaN(value)) {
                        field.onChange("");
                      } else {
                        field.onChange(value);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="activityLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <Activity className="h-4 w-4" />
                Activity Level
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                  <SelectItem value="light">Light (exercise 1-3 days/week)</SelectItem>
                  <SelectItem value="moderate">Moderate (exercise 3-5 days/week)</SelectItem>
                  <SelectItem value="active">Active (exercise 6-7 days/week)</SelectItem>
                  <SelectItem value="very-active">Very Active (physically demanding job or training)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            "Generate Diet Plans"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default UserMetricsForm;
