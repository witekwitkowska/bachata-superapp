"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, RotateCcw, Check } from "lucide-react";
import { toast } from "sonner";

interface ImagePositionEditorProps {
    imageUrl: string;
    initialX?: number;
    initialY?: number;
    onSave: (x: number, y: number) => Promise<void>;
    onCancel: () => void;
    isOpen: boolean;
}

export function ImagePositionEditor({
    imageUrl,
    initialX = 50,
    initialY = 50,
    onSave,
    onCancel,
    isOpen
}: ImagePositionEditorProps) {
    const [position, setPosition] = useState({ x: initialX, y: initialY });
    const [isDragging, setIsDragging] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        setPosition({ x: initialX, y: initialY });
    }, [initialX, initialY]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        updatePosition(e);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        updatePosition(e);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const updatePosition = (e: React.MouseEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Clamp values between 0 and 100
        const clampedX = Math.max(0, Math.min(100, x));
        const clampedY = Math.max(0, Math.min(100, y));

        setPosition({ x: clampedX, y: clampedY });
    };

    const resetPosition = () => {
        setPosition({ x: 50, y: 50 });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(position.x, position.y);
            toast.success("Avatar position updated successfully!");
        } catch (error) {
            toast.error("Failed to update avatar position");
            console.error("Error updating avatar position:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Adjust Avatar Position</CardTitle>
                        <Button variant="ghost" size="sm" onClick={onCancel}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                        Click and drag on the image to adjust the position. The image will be cropped to show the selected area.
                    </div>

                    {/* Image Preview Container */}
                    <div
                        ref={containerRef}
                        className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden cursor-crosshair select-none"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <img
                            ref={imageRef}
                            src={imageUrl}
                            alt="Avatar preview"
                            className="w-full h-full object-cover"
                            style={{
                                objectPosition: `${position.x}% ${position.y}%`
                            }}
                            draggable={false}
                        />

                        {/* Position indicator */}
                        <div
                            className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none"
                            style={{
                                left: `${position.x}%`,
                                top: `${position.y}%`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        />

                        {/* Grid overlay for better positioning */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-20">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="border border-white/30" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Position values display */}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                            <span>X: {Math.round(position.x)}%</span>
                            <span>Y: {Math.round(position.y)}%</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={resetPosition}
                            className="flex items-center gap-2"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Reset
                        </Button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Save Position
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
