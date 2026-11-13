import BlogCard from "@/components/BlogCard";
import Button from "@/components/Button";

// "Related Articles" on a service page: three posts (see postsForService in
// wp.js) under a heading with the blog button opposite. Same markup and
// classes as the latest posts on the About page, so it is that section's
// look and spacing on both screen sizes. Nothing when there are no posts.
export default function RelatedPosts({ posts }) {
  if (!posts.length) return null;

  return (
    <section className="about-blogs">
      <div className="about-blogs-head">
        <h2 className="projects-heading" data-text-reveal="lift">
          Related Articles
        </h2>
        <Button href="/blog">VIEW ALL BLOGS</Button>
      </div>

      <div className="blog-grid">
        {posts.map((post) => (
          <BlogCard post={post} key={post.slug} />
        ))}
      </div>
    </section>
  );
}
