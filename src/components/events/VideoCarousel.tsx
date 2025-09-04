"use client";;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { VideoLink, extractInstagramId } from "@/lib/video-utils";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import dynamic from "next/dynamic";

// Dynamic imports for video players
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });
const InstagramEmbed = dynamic(() => import("react-social-media-embed").then(mod => ({ default: mod.InstagramEmbed })), { ssr: false });

interface VideoCarouselProps {
    videoLinks: VideoLink[];
    className?: string;
    loop?: boolean;
    muted?: boolean;
    autoPlay?: boolean;
    autoPlayIndex?: number;
}

export function VideoCarousel({ videoLinks, className = "", loop = false, muted = false, autoPlayIndex = -1, autoPlay = false }: VideoCarouselProps) {
    const [isPlaying, setIsPlaying] = useState(autoPlay);

    const renderVideoContent = (link: VideoLink, index: number) => {
        try {
            if (link.type === "youtube") {
                if (link.url) {
                    return (
                        <div className="relative w-full h-64 md:h-80 lg:h-96">
                            <ReactPlayer
                                src={link.url}
                                width="100%"
                                height="100%"
                                controls
                                light
                                playing={isPlaying}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                muted={muted}
                                loop={loop}
                                autoPlay={autoPlay && autoPlayIndex === index}
                                style={{ position: 'absolute', top: 0, left: 0 }}
                            />
                        </div>
                    );
                }
            } else if (link.type === "instagram") {
                const postId = extractInstagramId(link.url);
                if (postId) {
                    return (
                        <div className="flex justify-center">
                            <div className="relative w-full max-w-md aspect-square overflow-hidden">
                                <div className="absolute -top-16 -left-2 w-[calc(100%+16px)] h-[calc(100%+16px)]">
                                    <InstagramEmbed
                                        url={link.url}
                                        width={328}
                                        height={256}
                                        captioned={false}
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                }
            }
        } catch (error) {
            console.error("Error rendering video content:", error);
        }

        // Fallback for unsupported video types
        return (
            <div className="flex items-center justify-center h-64 md:h-80 lg:h-96 bg-gray-100 rounded-lg">
                <div className="text-center">
                    <p className="text-gray-500 mb-2">Unsupported video type</p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(link.url, "_blank")}
                    >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Video
                    </Button>
                </div>
            </div>
        );
    };

    if (!videoLinks || videoLinks.length === 0) {
        return null;
    }

    return (
        <Card className={`w-full ${className}`}>
            <CardContent className="p-0">
                <Carousel className="w-full">
                    <CarouselContent>
                        {videoLinks.map((link, index) => (
                            <CarouselItem key={link.id}>
                                <div className="w-full space-y-4">
                                    {/* Video Content */}
                                    <div className="relative">
                                        {renderVideoContent(link, index)}
                                    </div>
                                    {/* <Accordion type="single" collapsible className="w-full px-8">
                                        <AccordionItem value={`item-${index}`}>
                                            <AccordionTrigger>
                                                {link.url}
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant={link.type === "youtube" ? "destructive" : "secondary"}>
                                                                {link.type === "youtube" ? "YouTube" : "Instagram"}
                                                            </Badge>
                                                            <span className="text-sm text-muted-foreground">
                                                                Video {index + 1} of {videoLinks.length}
                                                            </span>
                                                        </div>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => window.open(link.url, "_blank")}
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground break-all">
                                                        {link.url}
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion> */}
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    {/* Navigation Arrows */}
                    {videoLinks.length > 1 && (
                        <>
                            <CarouselPrevious />
                            <CarouselNext />
                        </>
                    )}
                </Carousel>
            </CardContent>
        </Card>
    );
}
