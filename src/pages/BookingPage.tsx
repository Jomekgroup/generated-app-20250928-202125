import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar as CalendarIcon, Clock, CreditCard, Home, Loader2, PartyPopper, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import type { Service } from "@shared/types";
const steps = [
  { id: 1, name: "Select Service" },
  { id: 2, name: "Choose Date & Time" },
  { id: 3, name: "Address & Payment" },
  { id: 4, name: "Confirmation" },
];
export function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: cleanerId } = useParams();
  const { cleaner } = location.state || {};
  const { user, isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  if (!cleaner) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">Cleaner information is missing. Please go back and select a cleaner.</p>
        <Button onClick={() => navigate('/cleaners')} className="mt-4">Find Cleaners</Button>
      </div>
    );
  }
  const handleNext = () => {
    if (currentStep === 1 && !selectedService) {
      toast.error("Please select a service.");
      return;
    }
    if (currentStep === 2 && !bookingDate) {
      toast.error("Please select a date.");
      return;
    }
    if (currentStep === 3 && !address.trim()) {
      toast.error("Please enter your address.");
      return;
    }
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleBooking();
    }
  };
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      navigate(`/cleaner/${cleanerId}`);
    }
  };
  const handleBooking = async () => {
    if (!isAuthenticated || user?.role !== 'client') {
      toast.error("Please log in as a client to book a service.");
      navigate('/auth');
      return;
    }
    if (!selectedService || !bookingDate || !address) return;
    setLoading(true);
    try {
      await api('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          cleanerId,
          serviceId: selectedService.id,
          bookingDate: bookingDate.toISOString(),
          address,
          totalCost: selectedService.price,
        }),
      });
      toast.success("Booking successful!");
      setCurrentStep(4);
    } catch (error: any) {
      toast.error(error.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <RadioGroup value={selectedService?.id} onValueChange={(id) => setSelectedService(cleaner.services.find(s => s.id === id) || null)}>
            <div className="space-y-4">
              {cleaner.services.map((service: Service) => (
                <Label key={service.id} htmlFor={service.id} className="flex items-start space-x-4 rounded-md border p-4 hover:bg-accent has-[input:checked]:border-primary">
                  <RadioGroupItem value={service.id} id={service.id} />
                  <div className="flex-1">
                    <p className="font-semibold">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    <p className="font-bold text-primary mt-2">₦{service.price.toLocaleString()}</p>
                  </div>
                </Label>
              ))}
            </div>
          </RadioGroup>
        );
      case 2:
        return (
          <div className="flex justify-center">
            <Calendar mode="single" selected={bookingDate} onSelect={setBookingDate} className="rounded-md border" />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="address">Cleaning Address</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., 123 Main St, Ikeja, Lagos" className="mt-2" />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Mock Payment</CardTitle>
                <CardDescription>Enter mock card details to confirm.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-primary/10 p-4 rounded-lg flex items-start space-x-3">
                  <ShieldCheck className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <p className="text-sm text-primary-foreground/80">
                    <strong>Your payment is secure.</strong> Funds are held by CleanConnect and will only be released to the cleaner after you confirm the job is completed to your satisfaction.
                  </p>
                </div>
                <Input placeholder="Card Number (e.g., 4242 4242 4242 4242)" />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="MM/YY" />
                  <Input placeholder="CVC" />
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 4:
        return (
          <div className="text-center py-8">
            <PartyPopper className="w-16 h-16 mx-auto text-primary" />
            <h2 className="mt-4 text-2xl font-bold">Booking Confirmed!</h2>
            <p className="mt-2 text-muted-foreground">{cleaner.name} is scheduled to clean your space.</p>
            <Button onClick={() => navigate('/dashboard/client')} className="mt-6">Go to Dashboard</Button>
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <div className="bg-gray-50/50 dark:bg-black/50 min-h-[calc(100vh-4rem)] py-12 md:py-16">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl">Book {cleaner.name}</CardTitle>
            <CardDescription>Complete the steps below to secure your appointment.</CardDescription>
            <div className="flex items-center pt-4">
              {steps.slice(0, 3).map((step, index) => (
                <div key={step.id} className="flex items-center w-full">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= step.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {step.id}
                  </div>
                  <p className={`ml-2 text-sm font-medium ${currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'}`}>{step.name}</p>
                  {index < steps.length - 2 && <div className="flex-1 h-0.5 bg-border ml-4" />}
                </div>
              ))}
            </div>
          </CardHeader>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="py-8 min-h-[300px]">
                {renderStepContent()}
              </CardContent>
            </motion.div>
          </AnimatePresence>
          {currentStep < 4 && (
            <>
              <Separator />
              <CardFooter className="flex justify-between p-6">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {currentStep === 1 ? "Back to Profile" : "Back"}
                </Button>
                <div className="text-right">
                  {selectedService && <p className="text-xl font-bold">Total: ₦{selectedService.price.toLocaleString()}</p>}
                  <Button onClick={handleNext} disabled={loading} className="mt-2">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {currentStep === 3 ? "Confirm & Pay" : "Next Step"}
                  </Button>
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}