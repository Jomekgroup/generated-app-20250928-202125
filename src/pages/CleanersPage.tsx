import { useState, useEffect, useCallback, useMemo } from "react";
import { CleanerCard } from "@/components/CleanerCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import type { CleanerProfile } from "@shared/types";
import { MultiSelect, OptionType } from "@/components/ui/multi-select";
import { CLEANING_SPECIALTIES } from "@/lib/constants";
import { NIGERIAN_STATES } from "@/lib/nigerian-locations";
import { useDebounce } from "@/hooks/use-debounce";
type CleanerWithStartingPrice = CleanerProfile & { startingPrice: number };
const specialtyOptions: OptionType[] = CLEANING_SPECIALTIES.map(s => ({ value: s, label: s }));
export function CleanersPage() {
  const [cleaners, setCleaners] = useState<CleanerWithStartingPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    searchQuery: "",
    state: "",
    city: "",
    specialties: [] as string[],
  });
  const debouncedSearchQuery = useDebounce(filters.searchQuery, 300);
  const citiesForState = useMemo(() => {
    const stateData = NIGERIAN_STATES.find(s => s.name === filters.state);
    return stateData ? stateData.cities : [];
  }, [filters.state]);
  const fetchCleaners = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (debouncedSearchQuery) query.append('q', debouncedSearchQuery);
      if (filters.state) query.append('state', filters.state);
      if (filters.city) query.append('city', filters.city);
      if (filters.specialties.length > 0) query.append('specialties', filters.specialties.join(','));
      const data = await api<CleanerWithStartingPrice[]>(`/api/cleaners?${query.toString()}`);
      setCleaners(data);
    } catch (err) {
      setError("Failed to fetch cleaners. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, filters.state, filters.city, filters.specialties]);
  useEffect(() => {
    fetchCleaners();
  }, [fetchCleaners]);
  const handleFilterChange = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => {
    setFilters(prev => {
      const newState = { ...prev, [key]: value };
      if (key === 'state') {
        newState.city = ''; // Reset city when state changes
      }
      return newState;
    });
  };
  return (
    <>
      <section className="bg-muted/40 py-12">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-center">Find Your Perfect Cleaner</h1>
          <p className="mt-4 text-lg text-muted-foreground text-center max-w-3xl mx-auto">
            Browse our network of trusted, professional cleaners across Nigeria.
          </p>
        </div>
      </section>
      <div className="container max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-background p-4 rounded-lg border shadow-sm mb-8 sticky top-20 z-40">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name or location..."
                className="pl-10"
                value={filters.searchQuery}
                onChange={e => handleFilterChange('searchQuery', e.target.value)}
              />
            </div>
            <Select value={filters.state} onValueChange={v => handleFilterChange('state', v)}>
              <SelectTrigger><SelectValue placeholder="Filter by state" /></SelectTrigger>
              <SelectContent><SelectGroup>{NIGERIAN_STATES.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
            <Select value={filters.city} onValueChange={v => handleFilterChange('city', v)} disabled={!filters.state}>
              <SelectTrigger><SelectValue placeholder="Filter by city" /></SelectTrigger>
              <SelectContent><SelectGroup>{citiesForState.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
            <div className="lg:col-span-4">
              <MultiSelect
                options={specialtyOptions}
                selected={filters.specialties}
                onChange={v => handleFilterChange('specialties', v)}
                placeholder="Filter by specialty..."
              />
            </div>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12"><p className="text-red-500">{error}</p></div>
        ) : cleaners.length === 0 ? (
          <div className="text-center py-12"><p className="text-muted-foreground">No cleaners found matching your criteria.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cleaners.map((cleaner) => (
              <CleanerCard key={cleaner.id} cleaner={cleaner} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}