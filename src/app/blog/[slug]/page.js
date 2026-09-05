import { notFound } from "next/navigation";
import Button from "@/components/Button";
import BlogCard from "@/components/BlogCard";
import WindLeaf from "@/components/WindLeaf";
import { getPost, getPosts } from "@/lib/wp";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: post ? `${post.title} | Rent-A-Pot` : "Blog | Rent-A-Pot" };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const [post, posts] = await Promise.all([getPost(slug), getPosts()]);
  if (!post) notFound();

  const related = posts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <main className="post-page">
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
          <img src={post.image} alt="" className="parallax-image" />
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
