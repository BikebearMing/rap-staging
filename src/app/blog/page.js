import Button from "@/components/Button";
import BlogCard from "@/components/BlogCard";
import { getPageHeader, getPosts } from "@/lib/wp";

export const metadata = {
  title: "Blog | Rent-A-Pot",
  description: "A collection of spaces, details, and moments brought to life.",
};

// Blog listing. Heading and subtitle come from the Page Header field group;
// the posts are WordPress posts, newest first. The sticky post is featured
// (or the newest when none is sticky).
export default async function Blog() {
  const [header, posts] = await Promise.all([getPageHeader("blog"), getPosts()]);
  const featured = posts.find((post) => post.featured) || posts[0];
  const rest = posts.filter((post) => post !== featured);

  return (
    <main className="blog-page">
      <section className="blog-header">
        <h1 className="h1" data-text-reveal="lift">
          {header.heading}
        </h1>
        <p className="body grey" data-text-reveal="flip">
          {header.subtitle}
        </p>
      </section>

      <section className="blog-list">
        {featured && (
          <article className="blog-featured has-parallax">
            <div className="featured-media parallax-frame">
              <img src={featured.image} alt="" className="parallax-image" />
            </div>

            <div className="featured-content">
              <span className="blog-tag">Featured</span>
              <p className="body">{featured.date}</p>
              <h2 className="h3" data-text-reveal="lift">
                {featured.title}
              </h2>
              <p className="body" data-text-reveal="flip">
                {featured.excerpt}
              </p>
              <Button href={`/blog/${featured.slug}`} className="featured-link">
                READ MORE
              </Button>
            </div>
          </article>
        )}

        <div className="blog-grid">
          {rest.map((post) => (
            <BlogCard post={post} key={post.slug} />
          ))}
        </div>
      </section>
    </main>
  );
}
