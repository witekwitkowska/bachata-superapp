"use client";
import { useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  TrendingUp,
  Clock,
  MapPin,
  Users,
  Calendar,
  Music,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaceFocusedImage } from "@/components/ui/face-focused-image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { handleFetch } from "@/lib/fetch";
import { UserProfile } from "@/types/user";
import { Event, Location as EventLocation } from "@/types/event.types";

// Types for our data
interface SearchResult {
  id: string;
  type: string;
  title?: string;
  name?: string;
  description?: string;
  bio?: string;
  location: string;
  city?: string;
  country?: string;
  date?: string;
  attendees?: number;
  students?: number;
  image: string;
  teacherName?: string;
  teacherImage?: string;
  isPaid?: boolean;
  price?: number;
  currency?: string;
  skillLevel?: string;
  focusAreas?: string[];
  specialty?: string;
  experience?: string;
  styles?: string[];
}

const searchTabs = [
  { id: "all", label: "All", icon: Search },
  { id: "festivals", label: "Festivals", icon: Music },
  { id: "socials", label: "Socials", icon: Users },
  { id: "workshops", label: "Workshops", icon: Calendar },
  { id: "private-sessions", label: "Private Sessions", icon: Users },
  { id: "artists", label: "Artists", icon: Star }
];

const sortOptions = [
  { id: "popular", label: "Most Popular", icon: TrendingUp },
  { id: "recent", label: "Most Recent", icon: Clock }
];


const transformUserToSearchResult = (user: UserProfile) => ({
  id: (user.id) as string,
  type: "artist",
  name: user.name as string,
  specialty: user.bachataLevel as string,
  bio: user.bio as string,
  location: (user.location as string) || "Unknown Location",
  city: user.location as string,
  country: user.location as string,
  students: (user.followersCount as number) || 0,
  image: (user.avatars?.[0] || user.gallery?.[0] || "") as string,
  experience: user.bachataLevel as string,
  // styles: user.bachataLevel as string[],
  createdAt: user.createdAt as string
})

const transformEventToSearchResult = (event: Event) => ({
  id: (event.id) as string,
  type: event.type as string,
  title: event.title as string,
  description: event.description as string,
  location: (event.location as EventLocation)?.name || "Unknown Location",
  city: (event.location as EventLocation)?.city || "",
  country: (event.location as EventLocation)?.country || "",
  date: event.time as unknown as string,
  attendees: (event.maxAttendees as number) || 0,
  teacherName: (event.teacher as any)?.name || "",
  teacherImage: (event.teacher as any)?.image || (event.teacher as any)?.avatars?.[0] || "",
  isPaid: event.isPaid as boolean,
  price: event.price as number,
  currency: event.currency as string,
  skillLevel: (event as any).skillLevel as string || "", // Type assertion for workshop/private-session
  focusAreas: (event as any).focusAreas as string[] || [], // Type assertion for workshop/private-session
  createdAt: event.createdAt instanceof Date ? event.createdAt.toISOString() : event.createdAt as string,
  image: event.images?.[0] || ""
})

export default function Home({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial state from URL
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">((searchParams.get("view") as "grid" | "list") || "grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [results, setResults] = useState<SearchResult[]>(initialData.map((item) => {
    if ('role' in item) {
      return transformUserToSearchResult(item as UserProfile);
    }
    return transformEventToSearchResult(item as Event);
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    priceRange: "all", // all, free, paid
    skillLevel: "all", // all, beginner, intermediate, advanced
    location: "all", // all, specific locations
    dateRange: "all", // all, today, this-week, this-month
  });

  // Update URL when state changes
  const updateURL = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  // Handle tab change
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    updateURL({ tab });

    // Immediately fetch data with the new tab
    fetchDataForTab(tab);
  }, [updateURL, router]);

  // Handle search query change
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    updateURL({ q: query });
  }, [updateURL]);

  // Handle sort change
  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    updateURL({ sort });
  };

  // Handle view mode change
  const handleViewModeChange = (view: "grid" | "list") => {
    setViewMode(view);
    updateURL({ view });
  };

  // Fetch data for a specific tab
  const fetchDataForTab = useCallback(async (tab: string) => {
    setLoading(true);
    setError(null);

    try {
      const allResults: SearchResult[] = [];

      // Fetch events if not just artists
      if (tab !== "artists") {
        let eventTypes: string[] = [];

        if (tab === "all") {
          eventTypes = ["festival", "social", "workshop", "private-session"];
        } else if (tab === "festivals") {
          eventTypes = ["festival"];
        } else if (tab === "socials") {
          eventTypes = ["social"];
        } else if (tab === "workshops") {
          eventTypes = ["workshop"];
        } else if (tab === "private-sessions") {
          eventTypes = ["private-session"];
        }


        const eventsData = await handleFetch(`/api/events?type=${eventTypes.join(",")}&limit=50`, "Failed to fetch events");
        if (eventsData.success && eventsData.data) {
          const events = eventsData.data.map(transformEventToSearchResult);
          allResults.push(...events);
        }
      }

      // Fetch artists (users with teacher role)
      if (tab === "all" || tab === "artists") {
        const artistsData = await handleFetch("/api/users?isPublic=true&limit=500", "Failed to fetch artists");
        if (artistsData.success && artistsData.data) {
          const artists = artistsData.data.map(transformUserToSearchResult);
          allResults.push(...artists);
        }
      }

      setResults(allResults);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data from your CRUD endpoints (for initial load)
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const allResults: SearchResult[] = [];

      // Fetch events if not just artists
      if (activeTab !== "artists") {
        let eventTypes: string[] = [];

        if (activeTab === "all") {
          eventTypes = ["festival", "social", "workshop", "private-session"];
        } else if (activeTab === "festivals") {
          eventTypes = ["festival"];
        } else if (activeTab === "socials") {
          eventTypes = ["social"];
        } else if (activeTab === "workshops") {
          eventTypes = ["workshop"];
        } else if (activeTab === "private-sessions") {
          eventTypes = ["private-session"];
        }


        const eventsData = await handleFetch(`/api/events?type=${eventTypes.join(",")}&limit=50`, "Failed to fetch events");
        if (eventsData.success && eventsData.data) {
          const events = eventsData.data.map((event: Event) => ({
            id: event.id,
            type: event.type,
            title: event.title,
            description: event.description,
            location: event.location?.name || "TBD",
            date: event.startDate ? new Date(event.startDate).toLocaleDateString() : "TBD",
            time: event.time ? new Date(event.time).toLocaleTimeString() : "TBD",
            price: event.price ? event.price.toString() : "Free",
            image: event.images?.[0] || "",
            organizer: "TBD", // This would need to be populated from organizerId
            tags: [], // This would need to be populated from other fields
            styles: [], // This would need to be populated from other fields
          }));
          allResults.push(...events);
        }
      }

      // Fetch artists if not just events
      if (activeTab !== "all" && activeTab !== "festivals" && activeTab !== "socials" && activeTab !== "workshops" && activeTab !== "private-sessions") {
        const artistsData = await handleFetch("/api/users?role=artist&limit=50", "Failed to fetch artists");
        if (artistsData.success && artistsData.data) {
          const artists = artistsData.data.map((artist: any) => ({
            id: artist.id as string,
            type: "artist" as string,
            title: artist.name as string,
            description: artist.bio as string,
            location: artist.location as string,
            image: artist.image as string,
            tags: artist.styles as string[],
            styles: artist.styles as string[],
          }));
          allResults.push(...artists);
        }
      }

      setResults(allResults);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Fetch data when tab changes
  // useEffect(() => {
  //   fetchData();
  // }, [fetchData]);

  const filteredResults = useMemo(() => {
    let filtered = [...results];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
      (item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.country?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply filters
    if (filters.priceRange !== "all") {
      if (filters.priceRange === "free") {
        filtered = filtered.filter(item => !item.isPaid || item.price === 0);
      } else if (filters.priceRange === "paid") {
        filtered = filtered.filter(item => item.isPaid && item.price && item.price > 0);
      }
    }

    if (filters.skillLevel !== "all") {
      filtered = filtered.filter(item => item.skillLevel === filters.skillLevel);
    }

    if (filters.dateRange !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

      filtered = filtered.filter(item => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);

        switch (filters.dateRange) {
          case "today":
            return itemDate >= today && itemDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
          case "this-week":
            return itemDate >= today && itemDate < thisWeek;
          case "this-month":
            return itemDate >= today && itemDate < thisMonth;
          default:
            return true;
        }
      });
    }

    // Sort results
    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => (b.attendees || b.students || 0) - (a.attendees || a.students || 0));
        break;
      case "recent":
        filtered.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }

    return filtered;
  }, [results, searchQuery, sortBy, filters]);

  const handleSearchFocus = () => {
    setShowSearchResults(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowSearchResults(false), 200);
  };

  const handleRetry = () => {
    fetchData();
  };

  const formatTabTitle = (tab: string) => {
    return activeTab.replace(/(^[a-z])|-([a-z])/g, (m, p1, p2) =>
      p1 ? p1.toUpperCase() : " " + p2.toUpperCase()
    );
  }

  return (
    <div className="w-full min-h-screen bg-transparent">
      {/* Hero Section */}
      <motion.div
        className="relative pt-20 pb-16 px-4 bg-transparent"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-full flex flex-col items-center justify-center max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-5xl md:text-6xl font-bold text-primary mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover {activeTab === "all" ? "Bachata" : formatTabTitle(activeTab)} in Barcelona
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Find festivals, workshops, socials, and connect with amazing artists
          </motion.p>

          {/* Search Tabs */}
          <motion.div
            className="flex flex-wrap justify-center gap-2 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {searchTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTabChange(tab.id)}
                  className="flex items-center gap-2 rounded-full"
                >
                  <Icon size={16} />
                  {tab.label}
                </Button>
              );
            })}
          </motion.div>

          {/* Search Bar */}
          <motion.div
            className="w-full relative max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="w-full relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Search for events, artists, or locations..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className="w-full pr-4 py-8 text-lg border-0 rounded-2xl shadow-lg focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all duration-200"
                style={{ paddingLeft: "2rem" }}
              />
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showSearchResults && searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-background rounded-2xl shadow-xl border border-border max-h-96 overflow-y-auto z-50"
                >
                  {filteredResults.length > 0 ? (
                    filteredResults.slice(0, 5).map((result) => (
                      <div
                        key={result.id}
                        className="p-4 hover:bg-muted/50 cursor-pointer border-b border-border last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={result.image}
                            alt={result.title || result.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">
                              {result.title || result.name}
                            </h4>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin size={14} />
                              {result.location}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-yellow-500">
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No results found
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Filters and View Toggle */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            {/* Filter Button */}
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter size={16} />
                  Filters
                  {(filters.priceRange !== "all" || filters.skillLevel !== "all" || filters.location !== "all" || filters.dateRange !== "all") && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {[filters.priceRange, filters.skillLevel, filters.location, filters.dateRange].filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                  <h4 className="font-medium">Filters</h4>

                  {/* Price Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price</label>
                    <Select value={filters.priceRange} onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="free">Free Only</SelectItem>
                        <SelectItem value="paid">Paid Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Skill Level */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Skill Level</label>
                    <Select value={filters.skillLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, skillLevel: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date Range</label>
                    <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Dates</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="this-week">This Week</SelectItem>
                        <SelectItem value="this-month">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clear Filters */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({
                      priceRange: "all",
                      skillLevel: "all",
                      location: "all",
                      dateRange: "all",
                    })}
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.id} value={option.id}>
                        <div className="flex items-center gap-2">
                          <Icon size={16} />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-background rounded-lg border border-border p-1">
              <Button
                type="button"
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewModeChange("grid")}
                className="p-2 h-auto"
              >
                <Grid3X3 size={18} />
              </Button>
              <Button
                type="button"
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewModeChange("list")}
                className="p-2 h-auto"
              >
                <List size={18} />
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Results Section */}
      <motion.div
        className="max-w-7xl mx-auto px-4 pb-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading amazing content...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRetry}>
              Try Again
            </Button>
          </div>
        )}

        {/* Results */}
        {!loading && !error && filteredResults.length > 0 && (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
            {filteredResults.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card
                  className={`overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer ${viewMode === "list" ? "flex items-center" : ""}`}
                  onClick={() => {
                    if (result.type !== "artist") {
                      router.push(`/events/${result.id}`);
                    } else {
                      router.push(`/profile/${result.id}`);
                    }
                  }}
                >
                  <FaceFocusedImage
                    src={result.image || "/images/placeholder.jpg"}
                    alt={result.title || result.name || "Event or Artist"}
                    width={viewMode === "list" ? 96 : 400}
                    height={viewMode === "list" ? 96 : 192}
                    className={`${viewMode === "list"
                      ? "w-24 h-24"
                      : "w-full h-48"
                      }`}
                    objectPosition={result.type === "artist" ? "top" : "center"}
                    priority={index < 4}
                    fallback="/images/placeholder.jpg"
                  />
                  <CardContent className={`p-4 flex-1 ${viewMode === "list" ? "flex-1" : ""}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground text-lg">
                        {result.title || result.name}
                      </h3>
                      <div className="flex items-center gap-1 text-yellow-500">
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-2 flex items-center gap-1">
                      <MapPin size={16} />
                      {result.location}
                    </p>
                    {result.date && (
                      <p className="text-muted-foreground mb-2 flex items-center gap-1">
                        <Calendar size={16} />
                        {new Date(result.date).toLocaleDateString()}
                      </p>
                    )}
                    {result.specialty && (
                      <p className="text-muted-foreground mb-2 text-sm">
                        {result.specialty}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {result.attendees || result.students} {result.attendees ? 'attendees' : 'students'}
                      </span>
                      <Badge variant="secondary">
                        {result.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredResults.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">No results found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
