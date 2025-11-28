"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Sun, Moon, Monitor, Globe, ChevronDown } from "lucide-react";
import Toolbar from "@/app/components/Toolbar";
import { signInWithGoogle } from "@/lib/auth";
import { useTheme } from "@/contexts/ThemeContext";

export default function TermsPage() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { themeMode, setThemeMode, effectiveTheme } = useTheme();
  const [language, setLanguage] = useState("English");

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

  return (
    <div className={`min-h-screen ${effectiveTheme === 'dark' ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'}`}>
      {/* Toolbar */}
      <Toolbar onLoginClick={handleLogin} />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-24 pt-32">
        {/* Header */}
        <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
          Ruleout, Inc. — Terms of Use
        </h1>
        <p className={`text-lg mb-12 ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
          Last Updated: November 22, 2025 (KST)
        </p>

        {/* Content */}
        <div className={`prose max-w-none
          ${effectiveTheme === 'dark'
            ? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-ul:text-gray-300 prose-strong:text-white'
            : 'prose-headings:text-gray-900 prose-p:text-gray-700 prose-ul:text-gray-700 prose-strong:text-gray-900'
          }
          prose-headings:font-bold
          prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
          prose-p:leading-relaxed prose-p:mb-6
          prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-6
          prose-li:mb-2`}>

          <p>
            These Terms of Use ("Terms") apply to your use of the websites, mobile applications, software, APIs, and other resources provided by Ruleout, Inc., a company organized under the laws of the Republic of Korea and headquartered in Seoul ("Ruleout," "we," "us," or "our").
          </p>
          <p>
            These Terms govern your use of the Ruleout Platform and the personalized veterinary information and services we provide such as evidence summaries, reference content, clinical tools, applications, sponsored programs, advertising, email communications, continuing education content, market research opportunities, and discussion forums (collectively, the "Services").
          </p>
          <p>
            You can always view the most current version of these Terms via the Terms of Use link on any page of Ruleout properties. <strong>By using the Services, you agree to these Terms, whether or not you register an account. If you do not agree to all of these Terms, do not use the Services.</strong>
          </p>

          <h2>Account Registration</h2>
          <p>
            To access certain features, you must create an account and provide accurate, current, and complete information (e.g., name, email, profession/role). You are solely responsible for safeguarding your credentials and for all activities under your account. If you suspect unauthorized access, change your password immediately and notify us. We are not liable for losses arising from unauthorized use of your account.
          </p>

          <h2>Intended Users & Eligibility</h2>
          <p>The Services are intended for:</p>
          <ul>
            <li>Licensed veterinarians and veterinary specialists</li>
            <li>Veterinary technicians/staff and students</li>
            <li>Researchers and veterinary industry professionals</li>
            <li>Pet owners and caregivers seeking general educational information only</li>
          </ul>
          <p>
            You represent that you are at least 18 years old and have the legal capacity to agree to these Terms.
          </p>
          <p>
            <strong>Important notice for pet owners/caregivers:</strong><br />
            Ruleout is for informational and educational purposes only and must not be used to diagnose, treat, or manage any condition without consulting a licensed veterinarian. In emergencies, contact a veterinary emergency hospital immediately (e.g., in Korea call 119) or your local emergency number.
          </p>

          <h2>Subscription, Billing & Renewal</h2>
          <p>
            Paid subscription is required for premium features. By subscribing, you authorize us to charge your selected payment method per the billing cycle shown at checkout. Fees are listed in the applicable currency and are non-refundable except where required by law or our posted refund policy.
          </p>
          <p>
            Subscriptions auto-renew unless canceled prior to renewal in your account settings. We may change pricing with prior notice; continued use after notice constitutes acceptance.
          </p>

          <h2>License & Permitted Use</h2>
          <p>
            Subject to your compliance with these Terms, Ruleout grants you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use the Services and view content for your personal and professional veterinary purposes. Except as expressly permitted, you must not copy, modify, create derivative works, distribute, sell, publicly display, reverse engineer, or scrape any part of the Services or content.
          </p>

          <h2>NO VETERINARY ADVICE</h2>
          <p>
            <strong>Ruleout is not a veterinary clinic, hospital, or medical device, and Ruleout Content is not intended to provide veterinary medical advice, diagnosis, or treatment, nor to substitute for an individual patient assessment based on a qualified veterinarian's evaluation.</strong>
          </p>
          <p>You acknowledge and agree that the Ruleout Content:</p>
          <ul>
            <li>is provided for general educational and informational purposes only and must not be relied upon as professional advice or as evidence that a particular product, test, or treatment is safe, appropriate, or effective for any specific animal;</li>
            <li>is not comprehensive and does not cover all indications, contraindications, precautions, adverse events, interactions, dosing, local regulations, or standards of care;</li>
            <li>may not apply to any specific species, breed, age group, comorbidity, geography, formulary, or practice setting;</li>
            <li>has not been reviewed for compliance with country-specific pharmaceutical/medical advertising, marketing, or disclosure statutes or regulations;</li>
            <li>is subject to change without notice, may be incomplete, outdated, or contain errors or model hallucinations; and</li>
            <li>must always be interpreted by a licensed veterinarian, who remains solely responsible for clinical decision-making, including diagnostics, prescriptions, procedures, client communications, and follow-up.</li>
          </ul>
          <p>
            You agree not to use the Services to establish a veterinarian-client-patient relationship or to diagnose or treat animals without a licensed veterinarian's independent judgment. Ruleout is not responsible or liable for any advice, course of treatment, diagnosis, therapeutic choice, delayed referral, or other decisions or services you obtain from or provide to others.
          </p>
          <p>
            <strong>IF AN ANIMAL MAY BE IN A LIFE-THREATENING OR EMERGENCY SITUATION, SEEK IMMEDIATE CARE FROM A LICENSED VETERINARIAN OR A VETERINARY EMERGENCY HOSPITAL (IN KOREA CALL 119 OR YOUR LOCAL EMERGENCY NUMBER).</strong>
          </p>

          <h2>Professional Compliance & Jurisdictions</h2>
          <p>
            You are solely responsible for complying with all laws, regulations, ethical rules, and standards of practice applicable to you (including advertising rules, record-keeping, prescription requirements, and informed consent). We make no representation that the Services or content are legally compliant in your jurisdiction. We may limit access to the Services by person, region, or jurisdiction at any time.
          </p>

          <h2>User Content & Data You Provide</h2>
          <p>
            If you upload or submit content (e.g., files, cases, notes, prompts, comments, images) ("User Content"), you retain ownership, but you grant Ruleout a worldwide, royalty-free, transferable, sublicensable license to host, process, reproduce, analyze, adapt, and display such User Content to operate, protect, maintain, and improve the Services (including model quality, safety, and performance).
          </p>
          <p>
            You must ensure your User Content complies with applicable laws, including Korea's Personal Information Protection Act (PIPA) and any confidentiality obligations. De-identify any personal data when possible; obtain all necessary consents/authorizations if you include personal data (e.g., client contact info). You are solely responsible for claims arising from your failure to comply.
          </p>
          <p>
            Prohibited User Content includes content you lack rights to share; infringes IP or privacy/publicity rights; violates laws; is unlawful, harmful, defamatory, harassing, hateful, obscene, or deceptive; promotes illegal activity; constitutes advertising/spam; or contains malware or code intended to disrupt systems.
          </p>

          <h2>Acceptable Use & Prohibited Conduct</h2>
          <p>
            You agree not to: (a) access the Services by any automated means (bots, scrapers, crawlers) except via our expressly permitted APIs; (b) remove proprietary notices; (c) misuse trademarks or branding; (d) attempt to bypass security or rate limits; (e) interfere with the Services, users, hosts, or networks (e.g., flooding, spamming, DDoS); (f) harvest others' information; (g) impersonate another person or misrepresent your affiliation; (h) use the Services to train competing models without our prior written consent; or (i) otherwise use the Services in a manner not permitted by these Terms. We may monitor and take action (including content removal or account suspension) where we reasonably believe violations occur.
          </p>

          <h2>Third-Party Links & Resources</h2>
          <p>
            The Services may link to third-party sites or resources. We are not responsible or liable for their availability, content, products, services, or practices. Inclusion of third-party resources does not imply endorsement.
          </p>

          <h2>Privacy</h2>
          <p>
            Our Privacy Policy explains how we collect, use, store, and share information, including adherence to PIPA and applicable laws. By using the Services, you agree that our Privacy Policy forms an integral part of these Terms.
          </p>
          <p>
            We may collect and use aggregated or de-identified data for service operations, safety, analytics, and product improvement. We do not sell personal information unless expressly permitted by law and disclosed in our Privacy Policy.
          </p>

          <h2>Service Changes; Availability</h2>
          <p>
            We aim for high availability but do not guarantee uninterrupted or error-free operation. We may modify, suspend, or discontinue parts or all of the Services at any time (e.g., maintenance, security, legal compliance, or business reasons).
          </p>

          <h2>Intellectual Property</h2>
          <p>
            All Ruleout content, software, UI, and data architecture are protected by IP laws and belong to Ruleout or its licensors. Except as expressly allowed, you may not copy, modify, distribute, publicly display, reverse engineer, or create derivative works from the Services or content.
          </p>

          <h2>Notice & Takedown (Copyright)</h2>
          <p>
            If you believe content accessible via the Services infringes your copyright, send a notice including: (i) the copyrighted work; (ii) the allegedly infringing material and its location (URL); (iii) your contact details; (iv) a good-faith statement of unauthorized use; (v) a statement that the information is accurate and that you are the owner or authorized agent; and (vi) your physical/electronic signature.
          </p>
          <p>
            <strong>Copyright Agent:</strong> legal@ruleout.com (Ruleout, Inc., Seoul, Republic of Korea).
          </p>
          <p>
            We may disable accounts of repeat infringers in appropriate circumstances.
          </p>

          <h2>Disclaimers</h2>
          <p>
            <strong>THE SERVICES AND ALL RULEOUT CONTENT ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. TO THE FULLEST EXTENT PERMITTED BY LAW, RULEOUT AND ITS LICENSORS DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY, COMPLETENESS, QUALITY, AVAILABILITY, AND COMPATIBILITY. DATA TRANSMISSION OVER THE INTERNET MAY BE SUBJECT TO DELAYS, FAILURES, OR ERRORS; WE ARE NOT RESPONSIBLE FOR SUCH ISSUES OR FOR THIRD-PARTY HARDWARE/SOFTWARE/PLATFORMS.</strong>
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            <strong>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, RULEOUT AND ITS DIRECTORS, OFFICERS, EMPLOYEES, CONTRACTORS, AGENTS, SPONSORS, AND LICENSORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, EXEMPLARY, OR PUNITIVE DAMAGES; NOR FOR LOSS OF PROFITS, SALES, BUSINESS, GOODWILL, OR DATA; NOR FOR PERSONAL INJURY, WRONGFUL DEATH, OR VETERINARY OUTCOMES, ARISING OUT OF OR RELATING TO THE SERVICES OR THESE TERMS, EVEN IF ADVISED OF THE POSSIBILITY.</strong>
          </p>
          <p>
            <strong>OUR AGGREGATE LIABILITY FOR ALL CLAIMS IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO LIABILITY SHALL NOT EXCEED THE AMOUNTS YOU PAID TO RULEOUT FOR THE SERVICES IN THAT PERIOD. SOME JURISDICTIONS DO NOT ALLOW CERTAIN LIMITATIONS; SOME OF THE ABOVE MAY NOT APPLY TO YOU.</strong>
          </p>

          <h2>Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless Ruleout and its officers, directors, employees, agents, licensors, and suppliers from any claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or relating to: (a) your use or misuse of the Services; (b) your User Content; (c) your violation of these Terms; or (d) your violation of any law or third-party rights.
          </p>

          <h2>Termination</h2>
          <p>
            We may suspend or terminate your account or access (with or without notice) if we reasonably believe you violated these Terms, failed to pay fees, engaged in fraud/abuse, or where required by law. Upon termination, your license ends immediately and you must cease use. Fees are non-refundable except where required by law or expressly stated otherwise.
          </p>

          <h2>Governing Law & Venue</h2>
          <p>
            These Terms are governed by the laws of the Republic of Korea without regard to conflict-of-laws rules. All disputes shall be subject to the exclusive jurisdiction of the courts located in Seoul, Korea. You consent to personal jurisdiction and venue in those courts.
          </p>

          <h2>Modifications to These Terms</h2>
          <p>
            We may modify these Terms at our discretion. If changes are material, we will provide notice (e.g., in-product banner, email). Changes take effect upon posting unless stated otherwise. By continuing to use the Services after changes become effective, you accept the revised Terms.
          </p>

          <h2>Assignment</h2>
          <p>
            You may not assign or transfer these Terms without our prior written consent; any attempted assignment is void. We may assign or transfer these Terms without restriction. These Terms bind and benefit the parties and their permitted successors and assigns.
          </p>

          <h2>Notices; Feedback</h2>
          <p>
            We may provide notices via email to your registered address or by posting within the Services. By submitting feedback or suggestions, you grant Ruleout a non-exclusive, perpetual, irrevocable, royalty-free license to use them without restriction or attribution.
          </p>

          <h2>Entire Agreement; Waiver; Severability; Survival</h2>
          <p>
            These Terms (together with the Privacy Policy and posted policies) constitute the entire agreement between you and Ruleout and supersede all prior understandings. Our failure to enforce a provision is not a waiver. If any provision is held unenforceable, the remaining provisions will remain in full force. Sections 5, 10, 12–18, and 22 survive termination.
          </p>

          <h2>Contact Us</h2>
          <p>
            <strong>Ruleout, Inc.</strong><br />
            Seoul, Republic of Korea<br />
            Email: support@ruleout.com
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className={`relative ${effectiveTheme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
        {/* Gradient transition */}
        <div className={`absolute top-0 left-0 right-0 h-32 pointer-events-none ${
          effectiveTheme === 'dark'
            ? 'bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]'
            : 'bg-gradient-to-b from-white to-gray-50'
        }`} />
        <div className="max-w-7xl mx-auto px-6 py-16 relative">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-12">
            {/* Product Column */}
            <div>
              <h3 className={`font-semibold mb-4 ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Product</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className={`transition-colors ${effectiveTheme === 'dark' ? 'text-gray-400 hover:text-[#4DB8C4]' : 'text-gray-600 hover:text-[#20808D]'}`}>
                    Features
                  </a>
                </li>
                <li>
                  <button onClick={() => router.push('/pricing')} className={`transition-colors ${effectiveTheme === 'dark' ? 'text-gray-400 hover:text-[#4DB8C4]' : 'text-gray-600 hover:text-[#20808D]'}`}>
                    Pricing
                  </button>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className={`font-semibold mb-4 ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className={`transition-colors ${effectiveTheme === 'dark' ? 'text-gray-400 hover:text-[#4DB8C4]' : 'text-gray-600 hover:text-[#20808D]'}`}>
                    Documentation
                  </a>
                </li>
                <li>
                  <button onClick={() => router.push('/blog')} className={`transition-colors ${effectiveTheme === 'dark' ? 'text-gray-400 hover:text-[#4DB8C4]' : 'text-gray-600 hover:text-[#20808D]'}`}>
                    Blog
                  </button>
                </li>
                <li>
                  <a href="#" className={`transition-colors ${effectiveTheme === 'dark' ? 'text-gray-400 hover:text-[#4DB8C4]' : 'text-gray-600 hover:text-[#20808D]'}`}>
                    Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className={`font-semibold mb-4 ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Company</h3>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => router.push('/mission')} className={`transition-colors ${effectiveTheme === 'dark' ? 'text-gray-400 hover:text-[#4DB8C4]' : 'text-gray-600 hover:text-[#20808D]'}`}>
                    Mission
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/careers')} className={`transition-colors ${effectiveTheme === 'dark' ? 'text-gray-400 hover:text-[#4DB8C4]' : 'text-gray-600 hover:text-[#20808D]'}`}>
                    Careers
                  </button>
                </li>
                <li>
                  <a href="#" className={`transition-colors ${effectiveTheme === 'dark' ? 'text-gray-400 hover:text-[#4DB8C4]' : 'text-gray-600 hover:text-[#20808D]'}`}>
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className={`font-semibold mb-4 ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Legal</h3>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => router.push('/terms')} className={`transition-colors ${effectiveTheme === 'dark' ? 'text-gray-400 hover:text-[#4DB8C4]' : 'text-gray-600 hover:text-[#20808D]'}`}>
                    Terms of Use
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/privacy')} className={`transition-colors ${effectiveTheme === 'dark' ? 'text-gray-400 hover:text-[#4DB8C4]' : 'text-gray-600 hover:text-[#20808D]'}`}>
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/security')} className={`transition-colors ${effectiveTheme === 'dark' ? 'text-gray-400 hover:text-[#4DB8C4]' : 'text-gray-600 hover:text-[#20808D]'}`}>
                    Security
                  </button>
                </li>
              </ul>
            </div>

            {/* Connect Column */}
            <div>
              <h3 className={`font-semibold mb-4 ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Connect</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className={`transition-colors ${effectiveTheme === 'dark' ? 'text-gray-400 hover:text-[#4DB8C4]' : 'text-gray-600 hover:text-[#20808D]'}`}>
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className={`transition-colors ${effectiveTheme === 'dark' ? 'text-gray-400 hover:text-[#4DB8C4]' : 'text-gray-600 hover:text-[#20808D]'}`}>
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className={`transition-colors ${effectiveTheme === 'dark' ? 'text-gray-400 hover:text-[#4DB8C4]' : 'text-gray-600 hover:text-[#20808D]'}`}>
                    YouTube
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className={`pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 ${
            effectiveTheme === 'dark' ? 'border-gray-800' : 'border-gray-200'
          }`}>
            {/* Left: Copyright */}
            <p className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
              © 2025 Ruleout. All rights reserved.
            </p>

            {/* Right: Theme Selector & Language */}
            <div className="flex items-center gap-4">
              {/* Theme Selector */}
              <div className={`flex items-center rounded-lg p-1 border ${
                effectiveTheme === 'dark'
                  ? 'bg-[#1a1a1a] border-gray-800'
                  : 'bg-white border-gray-200'
              }`}>
                <button
                  onClick={() => setThemeMode("system")}
                  className={`p-2 rounded transition-colors ${
                    themeMode === "system"
                      ? effectiveTheme === 'dark'
                        ? "bg-gray-700 text-white"
                        : "bg-gray-200 text-gray-900"
                      : effectiveTheme === 'dark'
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="System"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setThemeMode("light")}
                  className={`p-2 rounded transition-colors ${
                    themeMode === "light"
                      ? effectiveTheme === 'dark'
                        ? "bg-gray-700 text-white"
                        : "bg-gray-200 text-gray-900"
                      : effectiveTheme === 'dark'
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="Light"
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setThemeMode("dark")}
                  className={`p-2 rounded transition-colors ${
                    themeMode === "dark"
                      ? effectiveTheme === 'dark'
                        ? "bg-gray-700 text-white"
                        : "bg-gray-200 text-gray-900"
                      : effectiveTheme === 'dark'
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="Dark"
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>

              {/* Language Selector */}
              <div className="relative">
                <button className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  effectiveTheme === 'dark'
                    ? 'bg-[#1a1a1a] border-gray-800 text-gray-400 hover:text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
                }`}>
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">{language}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
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
            className={`rounded-2xl p-8 w-full max-w-md mx-4 relative border ${
              effectiveTheme === 'dark'
                ? 'bg-[#1a1a1a] border-gray-700'
                : 'bg-white border-gray-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLoginModal(false)}
              className={`absolute top-4 right-4 transition-colors ${
                effectiveTheme === 'dark'
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
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
                <span className={`text-2xl font-bold ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Ruleout</span>
              </div>
              <h2 className={`text-3xl font-bold mb-2 ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Log in or Sign up
              </h2>
              <p className={effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Choose your work email. <a href="#" className="text-[#20808D] hover:underline">Why is this needed?</a>
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                className={`w-full flex items-center justify-center px-6 py-4 border-2 rounded-lg transition-colors ${
                  effectiveTheme === 'dark'
                    ? 'border-gray-700 hover:border-gray-600 bg-[#2a2a2a]'
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className={`font-medium ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Continue with Google</span>
                </div>
              </button>

              <button className={`w-full flex items-center justify-center px-6 py-4 border-2 rounded-lg transition-colors ${
                effectiveTheme === 'dark'
                  ? 'border-gray-700 hover:border-gray-600 bg-[#2a2a2a]'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}>
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 23 23">
                    <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                  <span className={`font-medium ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Continue with Microsoft</span>
                </div>
              </button>

              <button className={`w-full flex items-center justify-center px-6 py-4 border-2 rounded-lg transition-colors ${
                effectiveTheme === 'dark'
                  ? 'border-gray-700 hover:border-gray-600 bg-[#2a2a2a]'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}>
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill={effectiveTheme === 'dark' ? 'white' : 'black'}>
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span className={`font-medium ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Continue with Apple</span>
                </div>
              </button>

              <div className="flex items-center my-4">
                <div className={`flex-1 border-t ${effectiveTheme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}></div>
                <span className={`px-4 ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>or</span>
                <div className={`flex-1 border-t ${effectiveTheme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}></div>
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
