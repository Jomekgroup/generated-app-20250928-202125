import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Star, MapPin, Phone, Mail, Loader2, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import type { CleanerProfile, Service, Review } from "@shared/types";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
type FullCleanerProfile = CleanerProfile & {
  reviews: Review[];
};
export function CleanerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [cleaner, setCleaner] = useState<FullCleanerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!id) return;
    const fetchCleanerProfile = async () => {
      try {
        setLoading(true);
        const data = await api<FullCleanerProfile>(`/api/cleaners/${id}`);
        setCleaner(data);
      } catch (err) {
        setError("Failed to load cleaner profile.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCleanerProfile();
  }, [id]);
  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-1 space-y-8">
            <Card>
              <CardContent className="p-8 text-center">
                <Skeleton className="w-32 h-32 rounded-full mx-auto mb-4" />
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
                <Skeleton className="h-12 w-full mt-6" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }
  if (error || !cleaner) {
    return <div className="text-center py-20 text-red-500">{error || "Cleaner not found."}</div>;
  }
  return (
    <div className="bg-gray-50/50 dark:bg-black/50">
      <div className="container max-w-7xl mx-auto py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="shadow-lg">
              <CardContent className="p-8 text-center">
                <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary">
                  <AvatarImage src={cleaner.avatarUrl} alt={cleaner.name} />
                  <AvatarFallback>{cleaner.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h1 className="text-3xl font-bold">{cleaner.name}</h1>
                <div className="flex items-center justify-center text-muted-foreground mt-2">
                  <MapPin className="w-4 h-4 mr-1.5" />
                  <span>{cleaner.location}</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-3">
                  {cleaner.isPremium && <Badge>Premium Cleaner</Badge>}
                  {cleaner.idImageUrl && <Badge variant="secondary" className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> ID Verified</Badge>}
                </div>
                <div className="flex items-center justify-center mt-4">
                    <div className="flex items-center text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-5 h-5 ${i < Math.round(cleaner.rating) ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                    </div>
                    <span className="ml-2 text-md font-semibold">{cleaner.rating.toFixed(1)}</span>
                    <span className="ml-1 text-sm text-muted-foreground">({cleaner.reviews.length} reviews)</span>
                </div>
                <Button size="lg" className="w-full mt-6" asChild>
                  <Link to={`/book/${cleaner.id}`} state={{ cleaner }}>Book Now</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center"><Mail className="w-4 h-4 mr-3 text-muted-foreground"/><span>{cleaner.email}</span></div>
                    <div className="flex items-center"><Phone className="w-4 h-4 mr-3 text-muted-foreground"/><span>+234-XXX-XXX-XXXX</span></div>
                </CardContent>
            </Card>
          </div>
          {/* Right Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader><CardTitle>About Me</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground">{cleaner.bio}</p></CardContent>
            </Card>
            {cleaner.workGallery && cleaner.workGallery.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Work Gallery</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {cleaner.workGallery.map((imgUrl, index) => (
                      <Dialog key={index}>
                        <DialogTrigger asChild>
                          <div className="aspect-square overflow-hidden rounded-lg cursor-pointer group">
                            <img src={imgUrl} alt={`Work sample ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl p-0">
                          <img src={imgUrl} alt={`Work sample ${index + 1}`} className="w-full h-auto rounded-lg" />
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader><CardTitle>Services Offered</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {cleaner.services.map((service, index) => (
                    <li key={service.id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{service.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-primary">₦{service.price.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {service.priceUnit === 'flat_rate' ? 'flat rate' : 'per hour'}
                          </p>
                        </div>
                      </div>
                      {index < cleaner.services.length - 1 && <Separator className="my-4"/>}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Client Reviews</CardTitle></CardHeader>
              <CardContent>
                {cleaner.reviews.length > 0 ? (
                  <ul className="space-y-6">
                    {cleaner.reviews.map((review) => (
                      <li key={review.id} className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src={review.authorAvatarUrl} />
                          <AvatarFallback>{review.authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold">{review.authorName}</h4>
                            <div className="flex items-center text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No reviews yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}