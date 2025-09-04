"use client";

import { useState } from "react";
import { Event, Location, SocialEvent, Festival, PrivateSession, Workshop } from "@/types/event.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Star,
    Euro,
    Music,
    User,
    BookOpen,
    Heart,
    Share2,
    ChevronLeft,
    ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { handlePost } from "@/lib/fetch";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { iconLibrary } from "@/resources/icons";
import { FaceFocusedImage } from "@/components/ui/face-focused-image";
import { VideoCarousel } from "./VideoCarousel";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import {
    formatEventTime,
    generateGoogleMapsLink,
    formatEventDuration,
    getEventTypeIcon,
    getEventTypeColor
} from "@/utils/event-utils";

interface EventDetailsProps {
    event: Event | SocialEvent | Festival | PrivateSession | Workshop;
    session: Session;
}

const getSocialMediaIcon = (platform: string) => {
    const IconComponent = iconLibrary[platform as keyof typeof iconLibrary];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
};

export function EventDetails({ event, session }: EventDetailsProps) {
    const router = useRouter();
    const [isAttending, setIsAttending] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Debug logging to see what data we have
    console.log('EventDetails - event:', event);
    console.log('EventDetails - event.coordinates:', event.coordinates);
    console.log('EventDetails - event.location:', event.location);
    console.log('EventDetails - event.location?.coordinates:', (event.location as Location)?.coordinates);

    const getEventTypeIconComponent = (type: string) => {
        const iconName = getEventTypeIcon(type);
        switch (iconName) {
            case "Users":
                return <Users className="h-5 w-5" />;
            case "Music":
                return <Music className="h-5 w-5" />;
            case "BookOpen":
                return <BookOpen className="h-5 w-5" />;
            case "User":
                return <User className="h-5 w-5" />;
            default:
                return <Calendar className="h-5 w-5" />;
        }
    };

    const handleAttendEvent = async () => {
        if (!session?.user?.id) {
            toast.error("Please sign in to attend events");
            router.push("/auth/signin");
            return;
        }

        setIsLoading(true);
        try {
            const { success, error } = await handlePost(`/api/events/${event.id}/attend`, {
                userId: session.user.id,
            });

            if (success) {
                setIsAttending(true);
                toast.success("You're now attending this event!");
            } else {
                toast.error(error || "Failed to attend event");
            }
        } catch (error) {
            toast.error("An error occurred while attending the event");
            console.error("Error attending event:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleShareEvent = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: event.title,
                    text: event.description,
                    url: window.location.href,
                });
                toast.success("Event shared successfully!");
            } catch (error) {
                // User cancelled sharing - don't show error toast
                if (error instanceof Error && error.name !== 'AbortError') {
                    toast.error("Failed to share event");
                }
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                toast.success("Event link copied to clipboard!");
            } catch (error) {
                toast.error("Failed to copy link to clipboard");
            }
        }
    };


    const eventTime = (event.time || event.startDate) ? formatEventTime(event.startDate || event.time) : null;

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-4"
            >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
            </Button>

            {/* Event Header */}
            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            {event.type && getEventTypeIconComponent(event.type)}
                            <Badge className={getEventTypeColor(event.type)}>
                                {event.type?.replace("-", " ").toUpperCase()}
                            </Badge>
                            {event.isPaid && (
                                <Badge variant="secondary">
                                    <Euro className="h-3 w-3 mr-1" />
                                    Paid Event
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                            {event.title}
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleShareEvent}
                        >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                        >
                            <Heart className="h-4 w-4 mr-2" />
                            Save
                        </Button>
                    </div>
                </div>

                {/* Event Images */}
                {event.images && event.images.length > 0 && (
                    <div className="w-full">
                        <Carousel className="w-full">
                            <CarouselContent>
                                {event.images.map((image, index) => (
                                    <CarouselItem key={index}>
                                        <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
                                            <FaceFocusedImage
                                                src={image}
                                                alt={`${event.title} - Image ${index + 1}`}
                                                width={800}
                                                height={384}
                                                className="w-full h-full"
                                                objectPosition="center"
                                                priority={index === 0}
                                                fallback="/images/placeholder.jpg"
                                            />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            {event.images.length > 1 && (
                                <>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </>
                            )}
                        </Carousel>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Event Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle>About This Event</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                {event.description}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Event Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Event Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                {eventTime ? (
                                    <div>
                                        <p className="font-medium">{eventTime.date}</p>
                                        <p className="text-sm text-muted-foreground">{eventTime.time}</p>
                                    </div>
                                ) : (
                                    null
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                {event.startDate && event.endDate ? (
                                    <div>
                                        <p className="font-medium">Duration</p>
                                        <p className="text-sm text-muted-foreground">{formatEventDuration(event, event.startDate, event.endDate)}</p>
                                    </div>
                                ) : (
                                    null
                                )}
                            </div>

                            {event.location && (
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                    <div className="flex-1">
                                        <p className="font-medium">{(event.location as Location).name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {(event.location as Location).address}, {(event.location as Location).city}
                                        </p>
                                        {(event.coordinates || (event.location as Location).coordinates) && (
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="p-0 h-auto text-blue-600 hover:text-blue-800"
                                                onClick={() => {
                                                    const coordinates = event.coordinates || (event.location as Location).coordinates!;
                                                    const locationName = (event.location as Location).name;
                                                    const mapsLink = generateGoogleMapsLink(coordinates, locationName);
                                                    window.open(mapsLink, '_blank');
                                                }}
                                            >
                                                <ExternalLink className="h-3 w-3 mr-1" />
                                                View on Google Maps
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {event.maxAttendees && (
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Capacity</p>
                                        <p className="text-sm text-muted-foreground">
                                            Up to {event.maxAttendees} attendees
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Event-specific details */}
                            {event.type === "workshop" && "skillLevel" in event && (
                                <div className="flex items-center gap-3">
                                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Skill Level</p>
                                        <p className="text-sm text-muted-foreground capitalize">
                                            {event.skillLevel}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {event.type === "private-session" && "skillLevel" in event && (
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Skill Level</p>
                                        <p className="text-sm text-muted-foreground capitalize">
                                            {event.skillLevel}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {event.type === "social" && "musicStyle" in event && (
                                <div className="flex items-center gap-3">
                                    <Music className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Music Style</p>
                                        <p className="text-sm text-muted-foreground">
                                            {event.musicStyle}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Social Media Links */}
                    {(event.facebookLink || event.instagramLink || event.twitterLink || event.youtubeLink || event.tiktokLink || event.websiteLink) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Follow This Event</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-3">
                                    {event.facebookLink && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2"
                                            onClick={() => window.open(event.facebookLink, '_blank')}
                                        >
                                            {getSocialMediaIcon('facebook')}
                                            Facebook
                                        </Button>
                                    )}
                                    {event.instagramLink && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2"
                                            onClick={() => window.open(event.instagramLink, '_blank')}
                                        >
                                            {getSocialMediaIcon('instagram')}
                                            Instagram
                                        </Button>
                                    )}
                                    {event.twitterLink && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2"
                                            onClick={() => window.open(event.twitterLink, '_blank')}
                                        >
                                            {getSocialMediaIcon('x')}
                                            Twitter
                                        </Button>
                                    )}
                                    {event.youtubeLink && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2"
                                            onClick={() => window.open(event.youtubeLink, '_blank')}
                                        >
                                            {getSocialMediaIcon('youtube')}
                                            YouTube
                                        </Button>
                                    )}
                                    {event.tiktokLink && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2"
                                            onClick={() => window.open(event.tiktokLink, '_blank')}
                                        >
                                            {getSocialMediaIcon('tiktok')}
                                            TikTok
                                        </Button>
                                    )}
                                    {event.websiteLink && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2"
                                            onClick={() => window.open(event.websiteLink, '_blank')}
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            Website
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Video Carousel */}
                    {event.videoLinks && event.videoLinks.length > 0 && (
                        <VideoCarousel
                            videoLinks={event.videoLinks}
                            className="mt-6"
                        />
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Event Actions */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {event.isPaid && event.price && (
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-foreground">
                                            €{event.price}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {event.currency || "EUR"}
                                        </p>
                                    </div>
                                )}

                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleAttendEvent}
                                    disabled={isLoading || isAttending}
                                >
                                    {isLoading ? (
                                        "Processing..."
                                    ) : isAttending ? (
                                        "Attending"
                                    ) : event.isPaid ? (
                                        "Buy Ticket"
                                    ) : (
                                        "Attend Event"
                                    )}
                                </Button>

                                {event.rating && (
                                    <div className="flex items-center justify-center gap-1">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm font-medium">{event.rating}</span>
                                        <span className="text-sm text-muted-foreground">(4.8)</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Event Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Event Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Attendees</span>
                                <span className="font-medium">24</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Interested</span>
                                <span className="font-medium">156</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shares</span>
                                <span className="font-medium">12</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    );
}
