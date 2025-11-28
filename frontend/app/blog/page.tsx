"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Toolbar from "@/app/components/Toolbar";
import { signInWithGoogle } from "@/lib/auth";
import { getAllBlogPosts, getFeaturedPost, BlogPost } from "@/lib/blogService";

export default function BlogPage() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All posts");
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

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
        // Already on blog page
        break;
    }
  };

  useEffect(() => {
    const loadBlogPosts = async () => {
      setLoading(true);
      try {
        const [featured, allPosts] = await Promise.all([
          getFeaturedPost(),
          getAllBlogPosts(),
        ]);
        setFeaturedPost(featured);
        // Filter out featured post from regular posts
        setBlogPosts(allPosts.filter(post => !post.isFeatured));
      } catch (error) {
        console.error("Error loading blog posts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBlogPosts();
  }, []);

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

  const filters = ["All posts", "Product", "Research", "Engineering", "Clinical"];

  // Filter posts based on selected category and search query
  const filteredPosts = blogPosts.filter(post => {
    const matchesFilter = selectedFilter === "All posts" || post.category === selectedFilter;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Toolbar */}
      <Toolbar onLoginClick={handleLogin} onMenuClick={handleMenuClick} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-24 pt-32">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400 text-lg">Loading blog posts...</div>
          </div>
        ) : (
          <>
            {/* Featured Blog Post */}
            {featuredPost && (
              <div className="mb-16">
                <div className="bg-gradient-to-br from-[#252525] to-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
                     onClick={() => router.push(`/blog/${featuredPost.slug}`)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12">
                    {/* Left: Text Content */}
                    <div className="flex flex-col justify-center space-y-6">
                      <span className="text-[#4DB8C4] text-sm font-semibold uppercase tracking-wide" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
                        FEATURED
                      </span>
                      <h1 className="text-2xl md:text-3xl font-bold leading-tight" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
                        {featuredPost.title}
                      </h1>
                      <p className="text-base text-gray-400 leading-relaxed" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
                        {featuredPost.subtitle || featuredPost.content.substring(0, 200) + '...'}
                      </p>
                      <button className="px-6 py-3 bg-[#20808D] text-white rounded-lg hover:bg-[#1a6b77] transition-colors font-medium w-fit">
                        Read more →
                      </button>
                    </div>

                    {/* Right: Image Placeholder */}
                    <div className="relative h-[400px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center">
                      {featuredPost.imageUrl ? (
                        <Image
                          src={featuredPost.imageUrl}
                          alt={featuredPost.title}
                          fill
                          className="object-cover rounded-xl"
                        />
                      ) : (
                        <span className="text-gray-600 text-lg">Featured Image</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

        {/* Filter and Search Bar */}
        <div className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedFilter === filter
                    ? "bg-[#20808D] text-white"
                    : "bg-[#252525] text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-80 px-4 py-2 pl-10 bg-[#252525] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#20808D] transition-colors"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>
        </div>

            {/* Blog Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.length === 0 ? (
                <div className="col-span-3 text-center py-20 text-gray-400">
                  No blog posts found. {blogPosts.length === 0 ? "Check back soon for new content!" : "Try adjusting your filters or search query."}
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => router.push(`/blog/${post.slug}`)}
                    className="transition-all duration-200 cursor-pointer group"
                  >
                    {/* Image Placeholder */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
                      {post.imageUrl ? (
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 text-sm">Post Image</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      {/* Category Badge */}
                      <span className="inline-block px-3 py-1 bg-[#20808D]/10 text-[#4DB8C4] text-xs font-semibold rounded-full">
                        {post.category}
                      </span>

                      {/* Title */}
                      <h3 className="text-xl font-semibold text-white group-hover:text-[#4DB8C4] transition-colors line-clamp-2" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
                        {post.title}
                      </h3>

                      {/* Author and Date */}
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{post.author}</span>
                        <span>•</span>
                        <span>{formatDate(post.date)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="relative bg-[#0a0a0a]">
        {/* Gradient transition */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-16 relative">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-12">
            {/* Product Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <button onClick={() => router.push('/pricing')} className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Pricing
                  </button>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <button onClick={() => router.push('/blog')} className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Blog
                  </button>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => router.push('/mission')} className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Mission
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/careers')} className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Careers
                  </button>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => router.push('/terms')} className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Terms of Use
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/privacy')} className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/security')} className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Security
                  </button>
                </li>
              </ul>
            </div>

            {/* Connect Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#4DB8C4] transition-colors">
                    YouTube
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2025 Ruleout. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

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
            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>

            {/* Logo and Title */}
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

            {/* Login Options */}
            <div className="space-y-3">
              {/* Google Login */}
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

              {/* Microsoft Login */}
              <button
                onClick={() => {/* Microsoft 로그인 구현 예정 */}}
                className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-700 rounded-lg hover:border-gray-600 transition-colors bg-[#2a2a2a]"
              >
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

              {/* Apple Login */}
              <button
                onClick={() => {/* Apple 로그인 구현 예정 */}}
                className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-700 rounded-lg hover:border-gray-600 transition-colors bg-[#2a2a2a]"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span className="text-white font-medium">Continue with Apple</span>
                </div>
              </button>

              {/* Divider */}
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-700"></div>
                <span className="px-4 text-gray-400">or</span>
                <div className="flex-1 border-t border-gray-700"></div>
              </div>

              {/* Email Login */}
              <button
                onClick={() => {/* 이메일 로그인 구현 예정 */}}
                className="w-full px-6 py-4 bg-[#20808D] text-white rounded-lg hover:bg-[#1a6a78] transition-colors font-medium"
              >
                Continue with Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
