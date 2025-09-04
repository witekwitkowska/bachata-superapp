"use client";

import { PostsFeed } from "./PostsFeed";
import { Session } from "next-auth";

interface PostsFeedExampleProps {
    session: Session;
    isMobile?: boolean;
}

export function PostsFeedExample({ session, isMobile }: PostsFeedExampleProps) {
    return (
        <div className="space-y-8">
            {/* Option 1: Chronological Masonry (Recommended for Pinterest-like experience) */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Chronological Masonry</h2>
                <p className="text-muted-foreground mb-4">
                    Posts are distributed across columns while maintaining chronological order.
                    Newest posts appear at the top, oldest at the bottom.
                </p>
                <PostsFeed
                    session={session}
                    isMobile={isMobile}
                    layoutType="chronological"
                    enablePagination={true}
                    postsPerPage={20}
                />
            </div>

            {/* Option 2: Date Grouped Masonry */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Date Grouped Masonry</h2>
                <p className="text-muted-foreground mb-4">
                    Posts are grouped by date with separate masonry grids for each day.
                    Good for showing daily activity patterns.
                </p>
                <PostsFeed
                    session={session}
                    isMobile={isMobile}
                    layoutType="grouped"
                    enablePagination={true}
                    postsPerPage={30}
                />
            </div>

            {/* Option 3: Standard Masonry (Original) */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Standard Masonry</h2>
                <p className="text-muted-foreground mb-4">
                    Traditional masonry layout. Posts fill columns from left to right.
                    May not maintain perfect chronological order across columns.
                </p>
                <PostsFeed
                    session={session}
                    isMobile={isMobile}
                    layoutType="standard"
                    enablePagination={false}
                />
            </div>
        </div>
    );
}
