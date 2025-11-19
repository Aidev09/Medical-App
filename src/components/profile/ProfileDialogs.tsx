
import React from 'react';
import { User2, Mail, Phone, Save, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserData } from '@/types/profile';

const personalInfoSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(6, { message: "Please enter a valid phone number." }),
  age: z.coerce.number().int().min(0, { message: "Please enter a valid age." })
});

const healthInfoSchema = z.object({
  bloodType: z.string().min(1, { message: "Please select a blood type." }),
  allergies: z.string().optional(),
  emergencyContact: z.string().min(6, { message: "Please provide an emergency contact." }),
  patientDisease: z.string().min(1, { message: "Please enter patient disease." })
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." })
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface ProfileDialogsProps {
  openDialog: string | null;
  userData: UserData;
  onCloseDialog: () => void;
  onSavePersonalInfo: (data: z.infer<typeof personalInfoSchema>) => void;
  onSaveHealthInfo: (data: z.infer<typeof healthInfoSchema>) => void;
  onChangePassword: (data: z.infer<typeof passwordSchema>) => void;
}

const ProfileDialogs: React.FC<ProfileDialogsProps> = ({
  openDialog,
  userData,
  onCloseDialog,
  onSavePersonalInfo,
  onSaveHealthInfo,
  onChangePassword
}) => {
  const personalInfoForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      age: userData.age || ''
    }
  });

  const healthInfoForm = useForm({
    resolver: zodResolver(healthInfoSchema),
    defaultValues: {
      bloodType: userData.healthInfo.bloodType,
      allergies: userData.healthInfo.allergies,
      emergencyContact: userData.healthInfo.emergencyContact,
      patientDisease: userData.healthInfo.patientDisease || ''
    }
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <>
      <Dialog open={openDialog === 'personal'} onOpenChange={(isOpen) => {
        if (!isOpen) onCloseDialog();
        if (isOpen) {
          personalInfoForm.reset({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            age: userData.age || ''
          });
          healthInfoForm.reset({
            bloodType: userData.healthInfo.bloodType,
            allergies: userData.healthInfo.allergies,
            emergencyContact: userData.healthInfo.emergencyContact,
            patientDisease: userData.healthInfo.patientDisease || ''
          });
        }
      }}>
        <DialogContent className="sm:max-w-[500px] w-full max-w-[98vw] px-3 py-4 rounded-2xl shadow-lg bg-white dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
              <User2 className="h-5 w-5 text-primary" />
              Edit Profile
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm mb-2">
              Update your personal and health information below
            </DialogDescription>
          </DialogHeader>
          <Form {...personalInfoForm}>
            <form onSubmit={personalInfoForm.handleSubmit((personalData) => {
              healthInfoForm.handleSubmit((healthData) => {
                onSavePersonalInfo(personalData);
                onSaveHealthInfo(healthData);
              })();
            })} className="space-y-10 py-2">
              <div>
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-primary"><User2 className="h-4 w-4" /> Personal Information</h3>
                <div className="grid grid-cols-1 gap-5">
              <FormField
                control={personalInfoForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                        <FormLabel className="text-xs font-medium">Full Name</FormLabel>
                    <FormControl>
                          <Input className="w-full text-base px-4 py-3 rounded-lg" placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={personalInfoForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                        <FormLabel className="text-xs font-medium">Email Address</FormLabel>
                    <FormControl>
                          <div className="flex items-center">
                        <Mail className="w-4 h-4 text-muted-foreground mr-2 self-center" />
                            <Input className="w-full text-base px-4 py-3 rounded-lg" placeholder="your.email@example.com" type="email" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={personalInfoForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                        <FormLabel className="text-xs font-medium">Phone Number</FormLabel>
                    <FormControl>
                          <div className="flex items-center">
                        <Phone className="w-4 h-4 text-muted-foreground mr-2 self-center" />
                            <Input className="w-full text-base px-4 py-3 rounded-lg" placeholder="+1 (555) 123-4567" type="tel" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                  <FormField
                    control={personalInfoForm.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">Age</FormLabel>
                        <FormControl>
                          <Input className="w-full text-base px-4 py-3 rounded-lg" placeholder="Enter your age" type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-primary"><Shield className="h-4 w-4" /> Health Information</h3>
                <div className="grid grid-cols-1 gap-5">
                  <FormField
                    control={healthInfoForm.control}
                    name="bloodType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">Blood Type</FormLabel>
                        <FormControl>
                          <select {...field} className="input w-full border rounded-lg px-4 py-3 text-base">
                            <option value="">Select blood type</option>
                            {bloodTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={healthInfoForm.control}
                    name="allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">Allergies</FormLabel>
                        <FormControl>
                          <Input className="w-full text-base px-4 py-3 rounded-lg" placeholder="e.g. Penicillin, Peanuts" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={healthInfoForm.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">Emergency Contact</FormLabel>
                        <FormControl>
                          <Input className="w-full text-base px-4 py-3 rounded-lg" placeholder="e.g. +1 555 123 4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={healthInfoForm.control}
                    name="patientDisease"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">Patient Disease</FormLabel>
                        <FormControl>
                          <Input className="w-full text-base px-4 py-3 rounded-lg" placeholder="e.g. Diabetes, Hypertension" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
                <Button type="button" variant="outline" onClick={onCloseDialog} className="w-full sm:w-auto py-3 rounded-lg text-base">Cancel</Button>
                <Button type="submit" className="gap-2 w-full sm:w-auto py-3 rounded-lg text-base font-semibold">
                  <Save className="h-5 w-5" />
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileDialogs;
