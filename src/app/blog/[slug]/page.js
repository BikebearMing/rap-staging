import { notFound } from "next/navigation";
import Button from "@/components/Button";
import BlogCard from "@/components/BlogCard";
import Img from "@/components/Img";
import WindLeaf from "@/components/WindLeaf";
import { getPost, getPosts } from "@/lib/wp";
import JsonLd from "@/components/JsonLd";
import { pageMeta } from "@/lib/site";
import { breadcrumbSchema } from "@/lib/schema";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Blog | Rent-A-Pot" };
  // The Yoast fields win when set; otherwise only the post's own excerpt,
  // never the site-wide description (null leaves the tag out).
  const meta = pageMeta({
    title: post.seoTitle || `${post.title} | Rent-A-Pot`,
    description: post.seoDescription || post.excerpt || null,
    path: `/blog/${slug}`,
    image: post.image.src,
  });
  // Shared as an article rather than pageMeta's "website"
  meta.openGraph = { ...meta.openGraph, type: "article", publishedTime: post.sortKey };
  return meta;
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const [post, posts] = await Promise.all([getPost(slug), getPosts()]);
  if (!post) notFound();

  // The three posts after this one in date order, wrapping round to the
  // newest, so each post is linked from three others instead of every post
  // linking the same newest three.
  const at = posts.findIndex((p) => p.slug === slug);
  const related = [...posts.slice(at + 1), ...posts.slice(0, Math.max(at, 0))].slice(0, 3);

  return (
    <main className="post-page">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${slug}` },
        ])}
      />
      <section className="post-header has-parallax">
        <WindLeaf />
        <Button href="/blog" className="is-reverse post-back">
          BACK TO BLOGS
        </Button>

        <div className="post-title">
          <p className="body grey" data-text-reveal="flip">
            {post.date}
          </p>
          <h1 className="h2" data-text-reveal="lift">
            {post.title}
          </h1>
        </div>

        <div className="post-media parallax-frame">
          <Img
            image={post.image}
            alt={post.title}
            sizes="(max-width: 768px) 88vw, 74vw"
            priority
            className="parallax-image"
          />
        </div>
      </section>

      {/* Editor HTML from WordPress goes straight in here; .blog-content
          standardises how its headings, paragraphs, images and lists look. */}
      <section className="post-body">
        <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }} />
      </section>

      <section className="post-related" data-line>
        <h2 className="projects-heading" data-text-reveal="lift">
          Related Article
        </h2>
        <div className="blog-grid">
          {related.map((p) => (
            <BlogCard post={p} key={p.slug} />
          ))}
        </div>
      </section>
    </main>
  );
}
