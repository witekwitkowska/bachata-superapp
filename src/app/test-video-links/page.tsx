"use client";

import { useState } from "react";
import { VideoLinksInput } from "@/components/common/video-links-input";
import { VideoCarousel } from "@/components/events/VideoCarousel";
import { VideoLink } from "@/lib/video-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TestVideoLinksPage() {
    const [videoLinks, setVideoLinks] = useState<VideoLink[]>([]);

    const handleSubmit = () => {
        console.log("Video Links:", videoLinks);
        alert(`Submitted ${videoLinks.length} video links!`);
    };

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle>Video Links Input Test</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <VideoLinksInput
                        value={videoLinks}
                        onChange={setVideoLinks}
                        label="Video Links"
                        placeholder="Enter YouTube or Instagram video URL..."
                        maxLinks={5}
                        showPreview={true}
                    />

                    <div className="flex gap-4">
                        <Button onClick={handleSubmit}>
                            Submit Video Links
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setVideoLinks([])}
                        >
                            Clear All
                        </Button>
                    </div>

                    {/* Video Carousel Preview */}
                    {videoLinks.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-4">Video Carousel Preview:</h3>
                            <VideoCarousel videoLinks={videoLinks} />
                        </div>
                    )}

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Current Video Links:</h3>
                        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                            {JSON.stringify(videoLinks, null, 2)}
                        </pre>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
