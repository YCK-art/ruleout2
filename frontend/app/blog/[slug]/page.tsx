"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Toolbar from "@/app/components/Toolbar";
import { signInWithGoogle } from "@/lib/auth";
import { getBlogPostBySlug, BlogPost } from "@/lib/blogService";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

interface BlogDetailPageProps {
  params: {
    slug: string;
  };
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [highlightedSection, setHighlightedSection] = useState("");

  const handleMenuClick = (menu: string) => {
    switch(menu) {
      case 'Home':
        router.push('/');
        break;
      case 'Mission':
        router.push('/mission');
        break;
      case 'Pricing':
        router.push('/pricing');
        break;
      case 'Blog':
        router.push('/blog');
        break;
    }
  };

  useEffect(() => {
    const loadBlogPost = async () => {
      setLoading(true);
      try {
        const post = await getBlogPostBySlug(params.slug);
        setBlogPost(post);
      } catch (error) {
        console.error("Error loading blog post:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBlogPost();
  }, [params.slug]);

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      setShowLoginModal(false);
      router.push("/");
    } catch (error) {
      console.error("로그인 실패:", error);
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const toolbarHeight = 100; // Toolbar height in pixels
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - toolbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveSection(id);

      // Highlight the section heading
      setHighlightedSection(id);
      setTimeout(() => {
        setHighlightedSection("");
      }, 2000); // Remove highlight after 2 seconds
    }
  };

  useEffect(() => {
    if (!blogPost?.tableOfContents) return;

    const handleScroll = () => {
      const sections = blogPost.tableOfContents!.map(item => item.id);
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 200) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [blogPost]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white">
        <Toolbar onLoginClick={handleLogin} onMenuClick={handleMenuClick} />
        <div className="max-w-7xl mx-auto px-6 py-24 pt-32">
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400 text-lg">Loading blog post...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white">
        <Toolbar onLoginClick={handleLogin} onMenuClick={handleMenuClick} />
        <div className="max-w-7xl mx-auto px-6 py-24 pt-32">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>Blog Post Not Found</h1>
            <p className="text-gray-400 mb-8" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>The blog post you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/blog')}
              className="px-6 py-3 bg-[#20808D] text-white rounded-lg hover:bg-[#1a6b77] transition-colors"
            >
              Back to Blog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Toolbar */}
      <Toolbar onLoginClick={handleLogin} onMenuClick={handleMenuClick} />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-24 pt-32">
        <div className="flex gap-12">
          {/* Left Sidebar - Table of Contents */}
          {blogPost.tableOfContents && blogPost.tableOfContents.length > 0 && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-32">
                <button
                  onClick={() => router.push('/blog')}
                  className="flex items-center gap-2 text-gray-400 hover:text-[#4DB8C4] transition-colors mb-6 pb-4 border-b border-gray-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm font-medium">Back to Blog</span>
                </button>
                <nav className="space-y-1">
                  {blogPost.tableOfContents.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`block w-full text-left py-2 transition-colors text-sm ${
                        activeSection === item.id
                          ? "text-[#4DB8C4] font-normal"
                          : "text-gray-500 hover:text-gray-300 font-normal"
                      }`}
                    >
                      {item.title}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* Right Content Area */}
          <main className="flex-1 max-w-3xl">
            {/* Blog Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
                {blogPost.title}
              </h1>
              {blogPost.subtitle && (
                <h2 className="text-xl text-gray-400 mb-4" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>{blogPost.subtitle}</h2>
              )}
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <span>{blogPost.author}</span>
                <span>•</span>
                <span>{formatDate(blogPost.date)}</span>
              </div>
            </div>

            {/* Hero Image/Video */}
            {(blogPost.imageUrl || blogPost.videoUrl) && (
              <div className="relative h-[400px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center mb-12 overflow-hidden">
                {blogPost.videoUrl ? (
                  <video
                    src={blogPost.videoUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : blogPost.imageUrl ? (
                  <Image
                    src={blogPost.imageUrl}
                    alt={blogPost.title}
                    fill
                    className="object-cover rounded-xl"
                  />
                ) : null}
              </div>
            )}

            {/* Blog Content */}
            <article className="prose prose-invert max-w-none
              prose-headings:text-white
              prose-h2:text-3xl prose-h2:font-bold prose-h2:mb-6 prose-h2:mt-12
              prose-h3:text-2xl prose-h3:font-semibold prose-h3:mb-4 prose-h3:mt-8
              prose-h4:text-xl prose-h4:font-semibold prose-h4:mb-3 prose-h4:mt-6
              prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
              prose-strong:text-white prose-strong:font-bold
              prose-ul:text-gray-300 prose-ul:list-disc prose-ul:mb-6 prose-ul:ml-6
              prose-li:mb-2 prose-li:text-gray-300
              prose-em:text-gray-300 prose-em:italic">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings]}
                components={{
                  h2: ({node, ...props}) => {
                    const id = props.id as string;
                    const isHighlighted = highlightedSection === id;
                    return (
                      <h2
                        {...props}
                        className={`transition-colors duration-300 ${
                          isHighlighted ? 'text-[#4DB8C4]' : ''
                        }`}
                      />
                    );
                  },
                  h3: ({node, ...props}) => {
                    const id = props.id as string;
                    const isHighlighted = highlightedSection === id;
                    return (
                      <h3
                        {...props}
                        className={`transition-colors duration-300 ${
                          isHighlighted ? 'text-[#4DB8C4]' : ''
                        }`}
                      />
                    );
                  },
                  h4: ({node, ...props}) => {
                    const id = props.id as string;
                    const isHighlighted = highlightedSection === id;
                    return (
                      <h4
                        {...props}
                        className={`transition-colors duration-300 ${
                          isHighlighted ? 'text-[#4DB8C4]' : ''
                        }`}
                      />
                    );
                  },
                }}
              >
                {blogPost.content}
              </ReactMarkdown>
            </article>
          </main>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="bg-[#1a1a1a] rounded-2xl p-8 w-full max-w-md mx-4 relative border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>

            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center space-x-1 mb-6">
                <Image
                  src="/image/clinical4-Photoroom.png"
                  alt="Ruleout Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                />
                <span className="text-2xl font-bold text-white">Ruleout</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Log in or Sign up
              </h2>
              <p className="text-gray-400">
                Choose your work email. <a href="#" className="text-[#20808D] hover:underline">Why is this needed?</a>
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-700 rounded-lg hover:border-gray-600 transition-colors bg-[#2a2a2a]"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-white font-medium">Continue with Google</span>
                </div>
              </button>

              <button className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-700 rounded-lg hover:border-gray-600 transition-colors bg-[#2a2a2a]">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 23 23">
                    <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                  <span className="text-white font-medium">Continue with Microsoft</span>
                </div>
              </button>

              <button className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-700 rounded-lg hover:border-gray-600 transition-colors bg-[#2a2a2a]">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span className="text-white font-medium">Continue with Apple</span>
                </div>
              </button>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-700"></div>
                <span className="px-4 text-gray-400">or</span>
                <div className="flex-1 border-t border-gray-700"></div>
              </div>

              <button className="w-full px-6 py-4 bg-[#20808D] text-white rounded-lg hover:bg-[#1a6a78] transition-colors font-medium">
                Continue with Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
