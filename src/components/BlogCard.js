import Img from "@/components/Img";

// Blog grid card: image, date, title. Used by the blog listing and the
// related articles on a post.
export default function BlogCard({ post }) {
  const href = `/blog/${post.slug}`;

  return (
    <article className="blog-card has-parallax">
      <a href={href} className="blog-media parallax-frame" aria-label={post.title}>
        <Img
          image={post.image}
          alt={post.title}
          sizes="(max-width: 768px) 88vw, 29vw"
          className="parallax-image"
        />
      </a>
      <p className="body grey">{post.date}</p>
      <h3 className="h4">
        <a href={href}>{post.title}</a>
      </h3>
    </article>
  );
}
