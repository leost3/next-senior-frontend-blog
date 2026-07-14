import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import { Badge } from "@/components/ui/badge";

type Props = {
  posts: PostMeta[];
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function PostList({ posts }: Props) {
  if (posts.length === 0) {
    return (
      <p className="font-mono text-sm text-muted-foreground">
        No posts yet. Check back soon.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-8 list-none p-0 m-0">
      {posts.map((post) => (
        <li key={post.slug} className="border-b border-border pb-8">
          <Link
            href={`/blog/${post.slug}`}
            className="no-underline text-inherit"
          >
            <h2
              className="text-xl font-bold text-foreground mb-2"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.02em",
              }}
            >
              {post.title}
            </h2>
          </Link>

          <div className="flex gap-4 items-center mb-3 flex-wrap">
            <time
              dateTime={post.date}
              className="font-mono text-sm text-muted-foreground"
            >
              {formatDate(post.date)}
            </time>
            <span className="font-mono text-sm text-muted-foreground">
              {post.readingTime} min read
            </span>
          </div>

          <p className="text-muted-foreground mb-3 leading-relaxed">
            {post.description}
          </p>

          {post.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="purple">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
