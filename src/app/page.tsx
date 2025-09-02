"use client";;
import { useState, useMemo, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  rating: number;
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
  { id: "rated", label: "Most Rated", icon: Star },
  { id: "recent", label: "Most Recent", icon: Clock }
];

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial state from URL
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">((searchParams.get("view") as "grid" | "list") || "grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update URL when state changes
  const updateURL = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    updateURL({ tab });
  };

  // Handle search query change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateURL({ q: query });
  };

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

  // Fetch data from your CRUD endpoints
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const allResults: SearchResult[] = [];

      // Fetch events if not just artists
      if (activeTab !== "artists") {
        const eventTypes = activeTab === "all"
          ? ["festival", "social", "workshop", "private-session"]
          : [activeTab.replace("-s", "")];

        const eventsResponse = await fetch(`/api/events?type=${eventTypes.join(",")}&published=true&limit=50`);
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          if (eventsData.success && eventsData.data) {
            const events = eventsData.data.map((event: Record<string, unknown>) => ({
              id: (event._id || event.id) as string,
              type: event.type as string,
              title: event.title as string,
              description: event.description as string,
              location: (event.location as Record<string, unknown>)?.name as string || "Unknown Location",
              city: (event.location as Record<string, unknown>)?.city as string,
              country: (event.location as Record<string, unknown>)?.country as string,
              date: event.time as string,
              rating: (event.rating as number) || 4.5,
              attendees: (event.maxAttendees as number) || 0,
              image: (event.image as string) || "/images/avatar.jpg",
              teacherName: (event.teacher as Record<string, unknown>)?.name as string,
              teacherImage: (event.teacher as Record<string, unknown>)?.image as string,
              isPaid: event.isPaid as boolean,
              price: event.price as number,
              currency: event.currency as string,
              skillLevel: event.skillLevel as string,
              focusAreas: event.focusAreas as string[],
              createdAt: event.createdAt as string
            }));
            allResults.push(...events);
          }
        }
      }

      // Fetch artists (users with teacher role)
      if (activeTab === "all" || activeTab === "artists") {
        const artistsResponse = await fetch("/api/users?role=teacher&published=true&limit=50");
        if (artistsResponse.ok) {
          const artistsData = await artistsResponse.json();
          if (artistsData.success && artistsData.data) {
            const artists = artistsData.data.map((user: Record<string, unknown>) => ({
              id: (user._id || user.id) as string,
              type: "artist",
              name: user.name as string,
              specialty: user.specialty as string,
              bio: user.bio as string,
              location: (user.location as string) || "Unknown Location",
              city: user.city as string,
              country: user.country as string,
              rating: (user.rating as number) || 4.5,
              students: (user.studentsCount as number) || 0,
              image: (user.image as string) || "/images/avatar.jpg",
              experience: user.experience as string,
              styles: user.styles as string[],
              createdAt: user.createdAt as string
            }));
            allResults.push(...artists);
          }
        }
      }

      setResults(allResults);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when tab changes
  useEffect(() => {
    fetchData();
  }, [activeTab]);

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

    // Sort results
    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => (b.attendees || b.students || 0) - (a.attendees || a.students || 0));
        break;
      case "rated":
        filtered.sort((a, b) => b.rating - a.rating);
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
  }, [results, searchQuery, sortBy]);

  const handleSearchFocus = () => {
    setShowSearchResults(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowSearchResults(false), 200);
  };

  const handleRetry = () => {
    fetchData();
  };

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
            Discover {activeTab === "all" ? "Bachata" : activeTab} in Barcelona
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
                className="w-full pl-32 pr-8 py-8 text-lg border-0 rounded-2xl shadow-lg focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all duration-200"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full"
              >
                <Filter size={20} />
              </Button>
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
                              <Star size={14} fill="currentColor" />
                              <span className="text-sm font-medium">{result.rating}</span>
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
                <Card className={`overflow-hidden hover:shadow-xl transition-all duration-300 ${viewMode === "list" ? "flex items-center" : ""}`}>
                  <img
                    src={result.image}
                    alt={result.title || result.name}
                    className={`object-cover ${viewMode === "list"
                      ? "w-24 h-24"
                      : "w-full h-48"
                      }`}
                  />
                  <CardContent className={`p-4 flex-1 ${viewMode === "list" ? "flex-1" : ""}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground text-lg">
                        {result.title || result.name}
                      </h3>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={16} fill="currentColor" />
                        <span className="text-sm font-medium">{result.rating}</span>
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
