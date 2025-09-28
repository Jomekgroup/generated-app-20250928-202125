import { useState, FormEvent, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2, Gem } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api-client";
import type { User, CleanerProfile, UserRole } from "@shared/types";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelect, OptionType } from "@/components/ui/multi-select";
import { CLEANING_SPECIALTIES } from "@/lib/constants";
import { NIGERIAN_STATES } from "@/lib/nigerian-locations";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
const specialtyOptions: OptionType[] = CLEANING_SPECIALTIES.map((s) => ({ value: s, label: s }));
export function AuthPage() {
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);
  const [signupRole, setSignupRole] = useState<UserRole>('client');
  const [cleanerType, setCleanerType] = useState<'individual' | 'company'>('individual');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [idImageUrl, setIdImageUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [workGallery, setWorkGallery] = useState<string[]>([]);
  const [companyRegistrationUrl, setCompanyRegistrationUrl] = useState('');
  const citiesForState = useMemo(() => {
    const stateData = NIGERIAN_STATES.find((s) => s.name === selectedState);
    return stateData ? stateData.cities : [];
  }, [selectedState]);
  const handleRoleChange = (newRole: UserRole) => {
    setSignupRole(newRole);
    // Reset all role-specific fields to prevent data leakage between roles
    setCleanerType('individual');
    setSpecialties([]);
    setSelectedState("");
    setSelectedCity("");
    setIdImageUrl('');
    setAvatarUrl('');
    setWorkGallery([]);
    setCompanyRegistrationUrl('');
  };
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    try {
      const user = await api<User | CleanerProfile>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      loginAction(user, user.role);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const dashboardPath = user.role === 'cleaner' ? '/dashboard/cleaner' : '/dashboard/client';
      navigate(dashboardPath);
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };
  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const companyName = formData.get('companyName') as string;
    const payload: any = { name, email, password, role: signupRole, idImageUrl };
    if (signupRole === 'client') {
      payload.avatarUrl = avatarUrl;
    }
    if (signupRole === 'cleaner') {
      payload.cleanerType = cleanerType;
      if (cleanerType === 'company') {
        payload.companyName = companyName;
        payload.companyRegistrationUrl = companyRegistrationUrl;
      }
      payload.specialties = specialties;
      payload.state = selectedState;
      payload.city = selectedCity;
      payload.workGallery = workGallery;
    }
    try {
      const newUser = await api<User | CleanerProfile>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      loginAction(newUser, newUser.role);
      toast.success("Account created successfully!");
      const dashboardPath = newUser.role === 'cleaner' ? '/dashboard/cleaner' : '/dashboard/client';
      navigate(dashboardPath);
    } catch (error: any) {
      toast.error(error.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
            <Sparkles className="mx-auto h-12 w-auto text-primary" />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                Welcome to CleanConnect
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                Your space, spotless.
            </p>
        </div>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Log In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Log In</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-login">Email</Label>
                    <Input id="email-login" name="email" type="email" placeholder="aisha.bello@example.com" required disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-login">Password</Label>
                    <Input id="password-login" name="password" type="password" required defaultValue="password123" disabled={loading} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Log In
                  </Button>
                </CardContent>
              </form>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>Create an account to get started.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>I am a...</Label>
                    <RadioGroup defaultValue="client" onValueChange={(v) => handleRoleChange(v as UserRole)} className="flex space-x-4">
                      <div className="flex items-center space-x-2"><RadioGroupItem value="client" id="r1" /><Label htmlFor="r1">Client</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="cleaner" id="r2" /><Label htmlFor="r2">Cleaner</Label></div>
                    </RadioGroup>
                  </div>
                  {signupRole === 'cleaner' && (
                    <Alert>
                      <Gem className="h-4 w-4" />
                      <AlertTitle>Go Premium!</AlertTitle>
                      <AlertDescription>
                        Upgrade after signing up to get a premium badge, higher ranking, and more bookings.
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="name-signup">Full Name</Label>
                    <Input id="name-signup" name="name" placeholder="John Doe" required disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input id="email-signup" name="email" type="email" placeholder="m@example.com" required disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup">Password</Label>
                    <Input id="password-signup" name="password" type="password" required disabled={loading} />
                  </div>
                  {signupRole === 'client' && (
                    <>
                      <div className="space-y-2">
                        <FileUpload
                          value={avatarUrl}
                          onChange={(val) => setAvatarUrl(val as string)}
                          label="Profile Photo (Optional)"
                          description="Upload a profile photo to personalize your account."
                        />
                      </div>
                      <div className="space-y-2">
                        <FileUpload
                          value={idImageUrl}
                          onChange={(val) => setIdImageUrl(val as string)}
                          label="ID Verification"
                          description="Upload a government-issued ID. This helps build trust on the platform."
                        />
                      </div>
                    </>
                  )}
                  {signupRole === 'cleaner' &&
                  <>
                      <div className="space-y-2">
                        <FileUpload
                          value={idImageUrl}
                          onChange={(val) => setIdImageUrl(val as string)}
                          label="ID Verification"
                          description="Upload a government-issued ID (e.g., NIN slip, Driver's License)."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>State</Label>
                          <Select value={selectedState} onValueChange={(v) => {setSelectedState(v);setSelectedCity('');}}>
                            <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                            <SelectContent><SelectGroup>{NIGERIAN_STATES.map((s) => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}</SelectGroup></SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedState}>
                            <SelectTrigger><SelectValue placeholder="Select City" /></SelectTrigger>
                            <SelectContent><SelectGroup>{citiesForState.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectGroup></SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>I operate as an...</Label>
                        <RadioGroup defaultValue="individual" onValueChange={(value: 'individual' | 'company') => setCleanerType(value)} className="flex space-x-4">
                          <div className="flex items-center space-x-2"><RadioGroupItem value="individual" id="r3" /><Label htmlFor="r3">Individual</Label></div>
                          <div className="flex items-center space-x-2"><RadioGroupItem value="company" id="r4" /><Label htmlFor="r4">Company</Label></div>
                        </RadioGroup>
                      </div>
                      {cleanerType === 'company' &&
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input id="companyName" name="companyName" placeholder="SparklePro Cleaners" required disabled={loading} />
                          </div>
                          <div className="space-y-2">
                            <FileUpload
                              value={companyRegistrationUrl}
                              onChange={(val) => setCompanyRegistrationUrl(val as string)}
                              label="Company Registration (CAC)"
                              description="Upload your company's registration certificate."
                            />
                          </div>
                        </>
                      }
                      <div className="space-y-2">
                        <Label>Cleaning Specialties</Label>
                        <MultiSelect options={specialtyOptions} selected={specialties} onChange={setSpecialties} placeholder="Select your specialties..." />
                      </div>
                      <div className="space-y-2">
                        <FileUpload
                          value={workGallery}
                          onChange={(val) => setWorkGallery(val as string[])}
                          label="Work Gallery"
                          description="Showcase your best work. Add up to 8 photos."
                          multiple
                        />
                      </div>
                    </>
                  }
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </CardContent>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>);
}