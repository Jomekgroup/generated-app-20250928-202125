import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DollarSign, Briefcase, Star, Users, Loader2, PlusCircle, Trash2, Edit, Calendar, Clock, Gem, Rocket, Banknote, Copy, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import type { CleanerProfile, Booking, Service } from "@shared/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelect, OptionType } from "@/components/ui/multi-select";
import { CLEANING_SPECIALTIES } from "@/lib/constants";
import { NIGERIAN_STATES } from "@/lib/nigerian-locations";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/ui/file-upload";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
interface CleanerStats {totalRevenue: number;completedBookings: number;rating: number;reviewsCount: number;newClients: number;}
type EnrichedBooking = Booking & {client: {name: string;};service: {name: string;};};
const specialtyOptions: OptionType[] = CLEANING_SPECIALTIES.map((s) => ({ value: s, label: s }));
const ServiceDialog = ({ service, onSave }: {service?: Service | null;onSave: () => void;}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    price: service?.price || 0,
    priceUnit: service?.priceUnit || 'flat_rate'
  });
  useEffect(() => {
    if (open) {
      setFormData({
        name: service?.name || '',
        description: service?.description || '',
        price: service?.price || 0,
        priceUnit: service?.priceUnit || 'flat_rate'
      });
    }
  }, [open, service]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSelectChange = (value: 'flat_rate' | 'per_hour') => {
    setFormData({ ...formData, priceUnit: value });
  };
  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (service) {
        await api(`/api/services/${service.id}`, { method: 'PUT', body: JSON.stringify(formData) });
        toast.success("Service updated successfully!");
      } else {
        await api('/api/services', { method: 'POST', body: JSON.stringify(formData) });
        toast.success("Service added successfully!");
      }
      onSave();
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save service.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {service ?
        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button> :
        <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Service</Button>
        }
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service ? 'Edit Service' : 'Add New Service'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input name="name" placeholder="Service Name" value={formData.name} onChange={handleChange} />
          <Textarea name="description" placeholder="Service Description" value={formData.description} onChange={handleChange} />
          <Input name="price" type="number" placeholder="Price (₦)" value={formData.price} onChange={handleChange} />
          <Select value={formData.priceUnit} onValueChange={handleSelectChange}>
            <SelectTrigger><SelectValue placeholder="Price Unit" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="flat_rate">Flat Rate</SelectItem>
              <SelectItem value="per_hour">Per Hour</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);
};
export function CleanerDashboardPage() {
  const { user, updateUser } = useAuthStore();
  const cleanerUser = user as CleanerProfile;
  const [stats, setStats] = useState<CleanerStats | null>(null);
  const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [profileData, setProfileData] = useState({ name: cleanerUser?.name || '', companyName: cleanerUser?.companyName || '', bio: cleanerUser?.bio || '' });
  const [selectedState, setSelectedState] = useState(cleanerUser?.state || '');
  const [selectedCity, setSelectedCity] = useState(cleanerUser?.city || '');
  const [cleanerType, setCleanerType] = useState(cleanerUser?.cleanerType || 'individual');
  const [specialties, setSpecialties] = useState(cleanerUser?.specialties || []);
  const [workGallery, setWorkGallery] = useState(cleanerUser?.workGallery || []);
  const [companyRegistrationUrl, setCompanyRegistrationUrl] = useState(cleanerUser?.companyRegistrationUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isNotifying, setIsNotifying] = useState<'premium' | 'featured' | null>(null);
  const [activeTab, setActiveTab] = useState("bookings");
  const citiesForState = useMemo(() => {
    const stateData = NIGERIAN_STATES.find((s) => s.name === selectedState);
    return stateData ? stateData.cities : [];
  }, [selectedState]);
  const fetchData = useCallback(async () => {
    setLoadingStats(true);setLoadingBookings(true);setLoadingServices(true);
    try {
      const [statsData, bookingsData, servicesData] = await Promise.all([
      api<CleanerStats>('/api/dashboard/cleaner/stats'),
      api<EnrichedBooking[]>('/api/dashboard/cleaner/bookings'),
      api<Service[]>('/api/services')]
      );
      setStats(statsData);
      setBookings(bookingsData);
      setServices(servicesData);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoadingStats(false);setLoadingBookings(false);setLoadingServices(false);
    }
  }, []);
  useEffect(() => {fetchData();}, [fetchData]);
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({ ...profileData, [e.target.id]: e.target.value });
  };
  const handleProfileSave = async () => {
    setIsSaving(true);
    try {
      const payload = { ...profileData, state: selectedState, city: selectedCity, cleanerType, specialties, workGallery, companyRegistrationUrl };
      const updatedUserData = await api<CleanerProfile>('/api/profile/cleaner', { method: 'PUT', body: JSON.stringify(payload) });
      updateUser(updatedUserData);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };
  const handleDeleteService = async (serviceId: string) => {
    try {
      await api(`/api/services/${serviceId}`, { method: 'DELETE' });
      toast.success("Service deleted.");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete service.");
    }
  };
  const handleBookingStatusChange = async (bookingId: string, status: Booking['status']) => {
    try {
      await api(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      toast.success(`Booking ${status}.`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || `Failed to update booking status.`);
    }
  };
  const handleNotifyPayment = async (type: 'premium' | 'featured', amount: number) => {
    setIsNotifying(type);
    try {
      const updatedUser = await api<CleanerProfile>('/api/payments/notify', {
        method: 'POST',
        body: JSON.stringify({ type, amount })
      });
      updateUser(updatedUser);
      toast.success("Admin has been notified of your payment. Please allow up to 24 hours for verification.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send notification.");
    } finally {
      setIsNotifying(null);
    }
  };
  const { newRequests, upcomingBookings, pastBookings } = useMemo(() => {
    const now = new Date();
    return {
      newRequests: bookings.filter((b) => b.status === 'pending'),
      upcomingBookings: bookings.filter((b) => b.status === 'confirmed' && new Date(b.bookingDate) >= now),
      pastBookings: bookings.filter((b) => ['approved', 'cancelled', 'declined', 'awaiting_approval'].includes(b.status) || b.status === 'confirmed' && new Date(b.bookingDate) < now)
    };
  }, [bookings]);
  const renderBookingList = (bookingList: EnrichedBooking[], type: 'new' | 'upcoming' | 'past') => {
    if (loadingBookings) return <Skeleton className="h-24 w-full" />;
    if (bookingList.length === 0) return <p className="text-muted-foreground text-center py-8">No bookings in this category.</p>;
    return bookingList.map((booking) =>
    <div key={booking.id} className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="font-semibold">{booking.service.name} for {booking.client.name}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> {new Date(booking.bookingDate).toLocaleDateString()}</span>
            <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5" /> {new Date(booking.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        {type === 'new' &&
      <div className="flex gap-2 self-end md:self-center">
            <Button variant="outline" size="sm" onClick={() => handleBookingStatusChange(booking.id, 'declined')}>Decline</Button>
            <Button size="sm" onClick={() => handleBookingStatusChange(booking.id, 'confirmed')}>Accept</Button>
          </div>
      }
        {type === 'upcoming' &&
      <Button variant="secondary" size="sm" onClick={() => handleBookingStatusChange(booking.id, 'completed')}>Mark as Completed</Button>
      }
        {type === 'past' &&
      <Badge variant={booking.status === 'approved' ? 'default' : 'secondary'}>{booking.status.replace('_', ' ')}</Badge>
      }
      </div>
    );
  };
  const renderStats = () => {
    if (loadingStats || !stats) return [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />);
    return (
      <>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Revenue</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</div><p className="text-xs text-muted-foreground">from approved bookings</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Completed Bookings</CardTitle><Briefcase className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">+{stats.completedBookings}</div><p className="text-xs text-muted-foreground">approved by clients</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Your Rating</CardTitle><Star className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.rating.toFixed(1)} / 5.0</div><p className="text-xs text-muted-foreground">Based on {stats.reviewsCount} reviews</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">New Clients</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">+{stats.newClients}</div><p className="text-xs text-muted-foreground">In the last 30 days</p></CardContent></Card>
      </>);
  };
  if (!user) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  return (
    <div className="bg-gray-50/50 dark:bg-black/50 min-h-[calc(100vh-4rem)]">
      <div className="container max-w-7xl mx-auto py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Cleaner Dashboard</h1>
            <p className="mt-2 text-lg text-muted-foreground">Here's your business at a glance, {user.name?.split(' ')[0]}.</p>
          </div>
          {!cleanerUser.isPremium &&
          <Button onClick={() => setActiveTab("growth")}>
              <Gem className="mr-2 h-4 w-4" />
              Upgrade to Premium
            </Button>
          }
        </header>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-12">{renderStats()}</div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:w-[800px]">
            <TabsTrigger value="bookings">Manage Bookings</TabsTrigger>
            <TabsTrigger value="services">Manage Services</TabsTrigger>
            <TabsTrigger value="profile">Manage Profile</TabsTrigger>
            <TabsTrigger value="growth">Grow Business</TabsTrigger>
          </TabsList>
          <TabsContent value="bookings" className="mt-6">
            <Card><CardHeader><CardTitle>Your Bookings</CardTitle><CardDescription>Manage all your client appointments here.</CardDescription></CardHeader><CardContent><Tabs defaultValue="new" className="w-full"><TabsList><TabsTrigger value="new">New Requests</TabsTrigger><TabsTrigger value="upcoming">Upcoming</TabsTrigger><TabsTrigger value="past">Past</TabsTrigger></TabsList><TabsContent value="new" className="mt-4 space-y-4">{renderBookingList(newRequests, 'new')}</TabsContent><TabsContent value="upcoming" className="mt-4 space-y-4">{renderBookingList(upcomingBookings, 'upcoming')}</TabsContent><TabsContent value="past" className="mt-4 space-y-4">{renderBookingList(pastBookings, 'past')}</TabsContent></Tabs></CardContent></Card>
          </TabsContent>
          <TabsContent value="services" className="mt-6">
            <Card><CardHeader className="flex flex-row items-center justify-between"><div className="space-y-1.5"><CardTitle>Your Services</CardTitle><CardDescription>Add, edit, or remove the services you offer.</CardDescription></div><ServiceDialog onSave={fetchData} /></CardHeader><CardContent>{loadingServices ? <Skeleton className="h-24 w-full" /> : services.length > 0 ? <div className="space-y-4">{services.map((service) => <div key={service.id} className="border rounded-lg p-4 flex justify-between items-start"><div><h4 className="font-semibold">{service.name} - ₦{service.price.toLocaleString()}</h4><p className="text-sm text-muted-foreground">{service.description}</p></div><div className="flex items-center"><ServiceDialog service={service} onSave={fetchData} /><Button variant="ghost" size="icon" onClick={() => handleDeleteService(service.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></div>)}</div> : <p className="text-muted-foreground text-center">You haven't added any services yet.</p>}</CardContent></Card>
          </TabsContent>
          <TabsContent value="profile" className="mt-6">
            <Card><CardHeader><CardTitle>Edit Your Public Profile</CardTitle><CardDescription>This is how clients will see you on CleanConnect.</CardDescription></CardHeader><CardContent className="space-y-6"><div className="flex items-center space-x-4"><Avatar className="w-20 h-20"><AvatarImage src={user.avatarUrl} /><AvatarFallback>{user.name?.charAt(0)}</AvatarFallback></Avatar><Button variant="outline" onClick={() => toast.info("Feature not implemented yet.")}>Change Photo</Button></div><div className="space-y-2"><Label>I operate as an...</Label><RadioGroup value={cleanerType} onValueChange={(v: 'individual' | 'company') => setCleanerType(v)} className="flex space-x-4"><div className="flex items-center space-x-2"><RadioGroupItem value="individual" id="p-r1" /><Label htmlFor="p-r1">Individual</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="company" id="p-r2" /><Label htmlFor="p-r2">Company</Label></div></RadioGroup></div>{cleanerType === 'company' && <><div className="space-y-2"><Label htmlFor="companyName">Company Name</Label><Input id="companyName" value={profileData.companyName} onChange={handleProfileChange} /></div><FileUpload value={companyRegistrationUrl} onChange={(val) => setCompanyRegistrationUrl(val as string)} label="Company Registration (CAC)" description="Update your company's registration certificate." /></>}<div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="name">Full Name / Company Rep.</Label><Input id="name" value={profileData.name} onChange={handleProfileChange} /></div><div className="space-y-2"><Label>State</Label><Select value={selectedState} onValueChange={(v) => {setSelectedState(v);setSelectedCity('');}}><SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger><SelectContent><SelectGroup>{NIGERIAN_STATES.map((s) => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}</SelectGroup></SelectContent></Select></div><div className="space-y-2"><Label>City</Label><Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedState}><SelectTrigger><SelectValue placeholder="Select City" /></SelectTrigger><SelectContent><SelectGroup>{citiesForState.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectGroup></SelectContent></Select></div></div><div className="space-y-2"><Label htmlFor="bio">About Me</Label><Textarea id="bio" rows={5} value={profileData.bio} onChange={handleProfileChange} /></div><div className="space-y-2"><Label>Cleaning Specialties</Label><MultiSelect options={specialtyOptions} selected={specialties} onChange={setSpecialties} /></div><div className="space-y-2"><FileUpload value={workGallery} onChange={(val) => setWorkGallery(val as string[])} label="Work Gallery" description="Update your portfolio to attract more clients." multiple /></div><Button onClick={handleProfileSave} disabled={isSaving}>{isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Profile</Button></CardContent></Card>
          </TabsContent>
          <TabsContent value="growth" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Manual Payment Instructions</CardTitle>
                <CardDescription>To upgrade or feature your profile, please make a bank transfer to the account below and notify us.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg border bg-muted/50">
                  <p className="font-semibold">Bank Name: <span className="font-normal">Wema Bank</span></p>
                  <p className="font-semibold">Account Name: <span className="font-normal">CleanConnect Services</span></p>
                  <div className="flex items-center">
                    <p className="font-semibold">Account Number: <span className="font-normal">1234567890</span></p>
                    <Button variant="ghost" size="icon" className="ml-2 h-7 w-7" onClick={() => {navigator.clipboard.writeText("1234567890");toast.success("Account number copied!");}}><Copy className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card className="flex flex-col">
                <CardHeader><CardTitle className="flex items-center gap-2"><Gem className="text-primary" />CleanConnect Premium</CardTitle><CardDescription>Unlock exclusive features to get more bookings.</CardDescription></CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2"><li>Higher ranking in search results</li><li>Premium badge on your profile</li><li>Advanced analytics (coming soon)</li></ul>
                  {cleanerUser.isPremium && cleanerUser.subscriptionExpiresAt ? <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"><CheckCircle className="h-4 w-4 text-green-600" /><AlertTitle className="text-green-800 dark:text-green-300">Premium Active!</AlertTitle><AlertDescription className="text-green-700 dark:text-green-400">Expires on: {new Date(cleanerUser.subscriptionExpiresAt).toLocaleDateString()}</AlertDescription></Alert> : cleanerUser.premiumPaymentStatus === 'pending' ? <Alert variant="default"><Loader2 className="h-4 w-4 animate-spin" /><AlertTitle>Payment Pending</AlertTitle><AlertDescription>Your payment is being verified. This may take up to 24 hours.</AlertDescription></Alert> : <p className="text-muted-foreground">You are currently on the free plan.</p>}
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleNotifyPayment('premium', 5000)} disabled={isNotifying === 'premium' || cleanerUser.premiumPaymentStatus === 'pending'}>{isNotifying === 'premium' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Banknote className="w-4 h-4 mr-2" />} I've Paid ₦5,000/month</Button>
                </CardFooter>
              </Card>
              <Card className="flex flex-col">
                <CardHeader><CardTitle className="flex items-center gap-2"><Rocket className="text-primary" />Featured Cleaner</CardTitle><CardDescription>Get top placement on the homepage and search results.</CardDescription></CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <p className="text-sm text-muted-foreground">Boost your visibility for 7 days and get seen by more potential clients.</p>
                  {cleanerUser.featuredUntil && new Date(cleanerUser.featuredUntil) > new Date() ? <Alert variant="default" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"><CheckCircle className="h-4 w-4 text-blue-600" /><AlertTitle className="text-blue-800 dark:text-blue-300">Profile is Featured!</AlertTitle><AlertDescription className="text-blue-700 dark:text-blue-400">Featured until: {new Date(cleanerUser.featuredUntil).toLocaleDateString()}</AlertDescription></Alert> : cleanerUser.featuredPaymentStatus === 'pending' ? <Alert variant="default"><Loader2 className="h-4 w-4 animate-spin" /><AlertTitle>Payment Pending</AlertTitle><AlertDescription>Your payment is being verified. This may take up to 24 hours.</AlertDescription></Alert> : <p className="text-muted-foreground">Your profile is not currently featured.</p>}
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleNotifyPayment('featured', 2500)} disabled={isNotifying === 'featured' || cleanerUser.featuredPaymentStatus === 'pending'}>{isNotifying === 'featured' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Banknote className="w-4 h-4 mr-2" />} I've Paid ₦2,500/week</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>);
}