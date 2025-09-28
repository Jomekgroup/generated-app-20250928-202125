import React, { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Star, Loader2, CheckCircle } from "lucide-react";
import { api } from "@/lib/api-client";
import type { Booking, CleanerProfile, Service, User } from "@shared/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileUpload } from "@/components/ui/file-upload";
type EnrichedBooking = Booking & {
  cleaner: Pick<CleanerProfile, 'name' | 'id'>;
  service: Pick<Service, 'name'>;
};
const ReviewDialog = ({ booking, onReviewSubmit }: { booking: EnrichedBooking, onReviewSubmit: (bookingId: string) => void }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const handleSubmit = async () => {
    if (rating === 0 || !comment.trim()) {
      toast.error("Please provide a rating and a comment.");
      return;
    }
    setLoading(true);
    try {
      await api('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: booking.id,
          cleanerId: booking.cleaner.id,
          rating,
          comment,
        }),
      });
      toast.success("Thank you for your review!");
      onReviewSubmit(booking.id);
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!!booking.reviewId}><Star className="w-4 h-4 mr-2" /> {booking.reviewId ? 'Reviewed' : 'Leave a Review'}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave a review for {booking.cleaner.name}</DialogTitle>
          <DialogDescription>Your feedback helps other users and our cleaners.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-8 h-8 cursor-pointer transition-colors ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} onClick={() => setRating(i + 1)} />
            ))}
          </div>
          <Textarea placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export function ClientDashboardPage() {
  const { user, updateUser } = useAuthStore();
  const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatarUrl: user?.avatarUrl || '',
    idImageUrl: user?.idImageUrl || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api<EnrichedBooking[]>('/api/bookings/client');
      setBookings(data);
    } catch (err) {
      setError("Failed to fetch your bookings.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.id]: e.target.value });
  };
  const handleProfileSave = async () => {
    setIsSaving(true);
    try {
      const updatedUserData = await api<User>('/api/profile/client', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      updateUser(updatedUserData);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };
  const handleReviewSubmitted = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, reviewId: 'newly-added' } : b));
  };
  const handleCancelBooking = async (bookingId: string) => {
    try {
      await api(`/api/bookings/${bookingId}/cancel`, { method: 'PUT' });
      toast.success("Booking cancelled successfully.");
      fetchBookings(); // Re-fetch to update the list
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel booking.");
    }
  };
  const handleApprovePayment = async (bookingId: string) => {
    try {
      await api(`/api/bookings/${bookingId}/approve`, { method: 'PUT' });
      toast.success("Payment approved and released to the cleaner.");
      fetchBookings();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve payment.");
    }
  };
  if (!user) return <div>Loading user...</div>;
  const upcomingBookings = bookings.filter(b => new Date(b.bookingDate) >= new Date() && !['approved', 'cancelled'].includes(b.status));
  const pastBookings = bookings.filter(b => new Date(b.bookingDate) < new Date() || ['approved', 'cancelled'].includes(b.status));
  const renderBookingList = (bookingList: EnrichedBooking[], isPast = false) => {
    if (loading) return <Skeleton className="h-24 w-full" />;
    if (error) return <p className="text-red-500 text-center">{error}</p>;
    if (bookingList.length === 0) return <p className="text-muted-foreground text-center">No {isPast ? 'past' : 'upcoming'} bookings found.</p>;
    return bookingList.map(booking => (
      <div key={booking.id} className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="font-semibold text-lg">{booking.service.name}</p>
          <p className="text-sm text-muted-foreground">with {booking.cleaner.name}</p>
          <div className="flex items-center gap-4 text-sm mt-2">
            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> {new Date(booking.bookingDate).toLocaleDateString()}</span>
            <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5" /> {new Date(booking.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        <div className="self-end md:self-center flex items-center gap-2">
          {booking.status === 'awaiting_approval' && (
            <Button onClick={() => handleApprovePayment(booking.id)}><CheckCircle className="w-4 h-4 mr-2" />Approve Payment</Button>
          )}
          {booking.status === 'approved' && (
            <ReviewDialog booking={booking} onReviewSubmit={handleReviewSubmitted} />
          )}
          {!isPast && booking.status === 'confirmed' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Cancel Booking</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently cancel your booking.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Back</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleCancelBooking(booking.id)}>Confirm Cancellation</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    ));
  };
  return (
    <div className="bg-gray-50/50 dark:bg-black/50 min-h-[calc(100vh-4rem)]">
      <div className="container max-w-7xl mx-auto py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Welcome back, {user.name?.split(' ')[0]}!</h1>
          <p className="mt-2 text-lg text-muted-foreground">Manage your bookings and profile information.</p>
        </header>
        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          <TabsContent value="bookings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
                <CardDescription>Here are your scheduled cleaning appointments.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">{renderBookingList(upcomingBookings)}</CardContent>
            </Card>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Past Bookings</CardTitle>
                <CardDescription>Review your past cleaning services.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">{renderBookingList(pastBookings, true)}</CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Keep your personal information up to date.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={profileData.name} onChange={handleProfileChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={profileData.email} onChange={handleProfileChange} />
                  </div>
                </div>
                <FileUpload
                  value={profileData.avatarUrl}
                  onChange={(val) => setProfileData(p => ({ ...p, avatarUrl: val as string }))}
                  label="Profile Photo"
                  description="Upload a new profile photo."
                />
                <FileUpload
                  value={profileData.idImageUrl}
                  onChange={(val) => setProfileData(p => ({ ...p, idImageUrl: val as string }))}
                  label="ID Verification"
                  description="Update your government-issued ID."
                />
                <Button onClick={handleProfileSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}