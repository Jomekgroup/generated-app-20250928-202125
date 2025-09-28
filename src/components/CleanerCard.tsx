import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { CleanerProfile } from "@shared/types";
interface CleanerCardProps {
  cleaner: Pick<CleanerProfile, 'id' | 'name' | 'avatarUrl' | 'location' | 'rating' | 'reviewsCount' | 'isPremium' | 'featuredUntil'> & {
    startingPrice?: number;
  };
}
export function CleanerCard({ cleaner }: CleanerCardProps) {
  const isFeatured = cleaner.featuredUntil && new Date(cleaner.featuredUntil) > new Date();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
      className="h-full"
    >
      <Card className={`flex flex-col h-full overflow-hidden transition-shadow duration-300 shadow-md ${isFeatured ? 'border-primary border-2' : ''}`}>
        <CardHeader className="p-0">
          <div className="relative">
            <img
              src={cleaner.avatarUrl || `https://api.dicebear.com/8.x/lorelei/svg?seed=${cleaner.name}`}
              alt={cleaner.name}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-2 right-2 flex flex-col items-end gap-2">
              {isFeatured && (
                <Badge variant="default" className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1">
                  <Rocket className="w-3 h-3" /> Featured
                </Badge>
              )}
              {cleaner.isPremium && (
                <Badge className="bg-primary text-primary-foreground">Premium</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 flex-grow">
          <h3 className="text-xl font-bold font-display">{cleaner.name}</h3>
          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <MapPin className="w-4 h-4 mr-1.5" />
            <span>{cleaner.location}</span>
          </div>
          <div className="flex items-center mt-2">
            <div className="flex items-center text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(cleaner.rating) ? 'fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="ml-2 text-sm text-muted-foreground">({cleaner.reviewsCount} reviews)</span>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0 flex justify-between items-center">
          <p className="text-lg font-semibold">
            <span className="text-sm font-normal text-muted-foreground">From </span>
            ₦{cleaner.startingPrice?.toLocaleString() || '5,000'}
          </p>
          <Button asChild>
            <Link to={`/cleaner/${cleaner.id}`}>View Profile</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}