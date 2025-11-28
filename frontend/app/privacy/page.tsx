"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Sun, Moon, Monitor, Globe, ChevronDown } from "lucide-react";
import Toolbar from "@/app/components/Toolbar";
import { signInWithGoogle } from "@/lib/auth";
import { useTheme } from "@/contexts/ThemeContext";

export default function PrivacyPage() {
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
          Ruleout, Inc. — Privacy Policy
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
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
          prose-p:leading-relaxed prose-p:mb-6
          prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-6
          prose-li:mb-2`}>

          <h2>Introduction</h2>
          <p>
            This Privacy Policy describes how Ruleout, Inc. ("Ruleout," "we," "us," or "our"), a company organized under the laws of the Republic of Korea and headquartered in Seoul, collects, uses, processes, stores, protects, and shares information in connection with your use of:
          </p>
          <ul>
            <li>our websites, mobile applications, AI services, and other digital resources intended for veterinarians, veterinary staff, researchers, and pet owners;</li>
            <li>features including evidence summaries, reference content, clinical tools, AI-generated insights, personalized recommendations, educational content, advertising, email communications, discussion forums, and subscription-based premium services</li>
          </ul>
          <p>(collectively, the "Services").</p>
          <p>
            This Privacy Policy applies only to Ruleout properties that reference it. If certain Ruleout products display a separate privacy policy, that separate policy applies to those products.
          </p>
          <p>
            <strong>By using the Services, you acknowledge that you have read, understand, and agree to this Privacy Policy and the Ruleout Terms of Use, which form a legally binding agreement between you and Ruleout.</strong>
          </p>
          <p>
            <strong>If you do not agree with this Privacy Policy, do not use the Services.</strong>
          </p>

          <h2>1. Information We Collect</h2>
          <p>We collect information in the following ways:</p>

          <h3>1.1 Registration Information</h3>
          <p>To create an account, you may be required to provide:</p>
          <ul>
            <li>name</li>
            <li>email address</li>
            <li>mobile number (optional)</li>
            <li>country/region</li>
            <li>profession or role (e.g., veterinarian, technician, researcher, pet owner)</li>
            <li>veterinary license number or equivalent (if applicable)</li>
            <li>password and authentication information</li>
          </ul>
          <p>
            Veterinary professionals may be required to provide additional credentials to verify their licensure or professional status.
          </p>
          <p>You may update your information through account settings.</p>

          <h3>1.2 Service Usage Information</h3>
          <p>We automatically collect information about how you interact with the Services, including:</p>
          <ul>
            <li>pages viewed, buttons clicked, features used</li>
            <li>search history and browsing activity</li>
            <li>engagement with particular content, alerts, newsletters, or evidence summaries</li>
            <li>interaction with AI-generated answers, uploaded documents, and queries</li>
            <li>time spent on pages, timestamps, session data</li>
            <li>whether you opened or clicked Service emails</li>
            <li>interaction with advertising (where applicable)</li>
          </ul>
          <p>We also collect device-level information:</p>
          <ul>
            <li>IP address</li>
            <li>browser type and settings</li>
            <li>operating system</li>
            <li>device identifiers, advertising ID (resettable)</li>
            <li>language/timezone</li>
            <li>precise or approximate location (if permitted by your device)</li>
            <li>referring URL</li>
          </ul>
          <p>We use cookies, pixels, SDKs, tags, and similar tracking technologies to collect this data.</p>

          <h3>1.3 Cross-Device Tracking</h3>
          <p>To provide a seamless experience, we may link usage across devices to:</p>
          <ul>
            <li>personalize content and recommendations</li>
            <li>maintain login sessions</li>
            <li>synchronize preferences</li>
            <li>limit repeated advertisements</li>
            <li>detect fraud and maintain security</li>
          </ul>

          <h3>1.4 Pet Owner Usage Information</h3>
          <p>Pet owners may use Ruleout for general educational purposes. We may collect:</p>
          <ul>
            <li>symptoms input into tools</li>
            <li>search keywords</li>
            <li>uploaded images/files (e.g., lab results, notes)</li>
            <li>interaction with AI-generated educational information</li>
          </ul>
          <p>Pet owners must not upload sensitive data belonging to third parties without permission.</p>

          <h3>1.5 Market Research & Surveys</h3>
          <p>You may be invited to participate in surveys or educational programs. If you choose to participate, we may collect:</p>
          <ul>
            <li>survey responses</li>
            <li>professional information</li>
            <li>contact information for follow-up</li>
            <li>payment information (for honoraria, if applicable)</li>
          </ul>
          <p>Participation is voluntary and based on your consent.</p>

          <h3>1.6 Public Forums & Community Features</h3>
          <p>When you post content (e.g., discussions, comments), your:</p>
          <ul>
            <li>display name</li>
            <li>profession/role</li>
            <li>specialty (if applicable)</li>
            <li>profile photo (if provided)</li>
          </ul>
          <p>
            may be visible to other users. Information posted publicly may be used by Ruleout or third parties in accordance with the Terms of Use.
          </p>

          <h3>1.7 Information from Third Parties</h3>
          <p>We may obtain additional information from third-party sources such as:</p>
          <ul>
            <li>veterinary professional registries</li>
            <li>identity verification services</li>
            <li>analytics providers</li>
            <li>advertisers</li>
            <li>educational partners</li>
            <li>market research firms</li>
          </ul>
          <p>This information may help verify credentials, personalize content, prevent fraud, or improve the Services.</p>

          <h3>1.8 Non-Registered Users</h3>
          <p>
            You may access limited features without registration. We still collect basic device and usage information via cookies and similar technologies.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>We use information for the following purposes:</p>

          <h3>2.1 To Provide and Improve the Services</h3>
          <p>Including:</p>
          <ul>
            <li>account creation, authentication, and administration</li>
            <li>delivering evidence summaries, AI-generated outputs, and recommendations</li>
            <li>providing personalized veterinary content</li>
            <li>maintaining system functionality, performance, and security</li>
          </ul>

          <h3>2.2 Member Profiles</h3>
          <p>We associate your registration information with usage data to create a Ruleout Member Profile, allowing us to:</p>
          <ul>
            <li>tailor content to your role, species of interest, specialty, or behavior</li>
            <li>recommend articles, guidelines, or AI tools</li>
            <li>improve clinical relevance and user experience</li>
          </ul>

          <h3>2.3 Communications</h3>
          <p>By registering, you agree that Ruleout may send:</p>
          <ul>
            <li>service-related announcements</li>
            <li>product updates</li>
            <li>newsletters and educational messages</li>
            <li>promotional content (only where legally permitted)</li>
            <li>alerts regarding your subscription</li>
          </ul>
          <p>You may adjust some communication preferences in account settings.</p>

          <h3>2.4 AI Model Improvement</h3>
          <p>We may use anonymized, aggregated, or de-identified data to:</p>
          <ul>
            <li>improve AI model performance</li>
            <li>enhance veterinary knowledge retrieval quality</li>
            <li>develop new features</li>
            <li>ensure safety, accuracy, and reliability</li>
          </ul>
          <p>We do not use identifiable personal data to train models unless we have your explicit consent or it is de-identified.</p>

          <h3>2.5 Personalization</h3>
          <p>We personalize:</p>
          <ul>
            <li>content (evidence, tools, references)</li>
            <li>recommendations</li>
            <li>in-app educational messaging</li>
            <li>certain advertisements (if used)</li>
          </ul>
          <p>Personalization is based on:</p>
          <ul>
            <li>your profession</li>
            <li>behavior</li>
            <li>search queries</li>
            <li>device information</li>
            <li>preferences and interaction history</li>
          </ul>

          <h3>2.6 Verification</h3>
          <p>We may use your data to verify:</p>
          <ul>
            <li>your identity</li>
            <li>your professional credentials (for licensed veterinarians)</li>
            <li>eligibility for certain features</li>
            <li>compliance with Terms of Use</li>
          </ul>

          <h3>2.7 Account Management & Support</h3>
          <p>We use data to:</p>
          <ul>
            <li>manage your subscription</li>
            <li>respond to inquiries</li>
            <li>assist with technical issues</li>
            <li>process payments</li>
          </ul>

          <h3>2.8 Investigations & Compliance</h3>
          <p>We may use information to:</p>
          <ul>
            <li>detect and prevent fraud or abuse</li>
            <li>enforce Terms of Use</li>
            <li>comply with legal obligations</li>
            <li>respond to lawful requests by authorities</li>
          </ul>

          <h2>3. Legal Basis (for compliance with Korean PIPA and global standards)</h2>
          <p>We process personal data under the following legal grounds:</p>
          <ul>
            <li><strong>Consent:</strong> newsletter signup, surveys, optional personal data, marketing communications.</li>
            <li><strong>Contract performance:</strong> providing the Ruleout Services you subscribed to.</li>
            <li><strong>Legitimate interests:</strong> service security, product improvement, analytics, fraud detection.</li>
            <li><strong>Legal obligations:</strong> tax, accounting, regulatory compliance, recordkeeping.</li>
          </ul>
          <p>Where required, we obtain separate and explicit consent for collection or use of sensitive information.</p>

          <h2>4. Sharing Your Information with Third Parties</h2>
          <p>We share personal information only as follows:</p>

          <h3>4.1 Service Providers</h3>
          <p>We use trusted third-party vendors for:</p>
          <ul>
            <li>cloud hosting</li>
            <li>analytics</li>
            <li>email delivery</li>
            <li>payment processing</li>
            <li>identity verification</li>
            <li>customer support</li>
            <li>advertising management (if applicable)</li>
            <li>security monitoring</li>
          </ul>
          <p>Providers are contractually required to use your information only for Ruleout's purposes and follow security standards.</p>

          <h3>4.2 Advertising & Educational Sponsors (if applicable)</h3>
          <p>Certain content may be supported by sponsors (e.g., pharmaceutical or animal health companies). If so, we may share limited information such as:</p>
          <ul>
            <li>profession (e.g., veterinarian/technician/student)</li>
            <li>specialty</li>
            <li>generalized behavioral insights</li>
          </ul>
          <p>
            We do not share your email address, phone number, or password with advertisers.
          </p>
          <p>If sponsors require further personal information, it will be obtained only with your explicit consent.</p>

          <h3>4.3 Market Research Partners</h3>
          <p>If you participate in paid surveys:</p>
          <ul>
            <li>payment vendors receive necessary information to process compensation</li>
            <li>survey sponsors may receive de-identified or aggregated data only</li>
            <li>personal data is provided to sponsors only with your consent</li>
          </ul>

          <h3>4.4 Business Transfers</h3>
          <p>
            In mergers, acquisitions, reorganizations, or bankruptcy, personal information may be transferred to a successor entity, subject to this Privacy Policy.
          </p>

          <h3>4.5 Legal Requirements</h3>
          <p>We may disclose information:</p>
          <ul>
            <li>to comply with laws, court orders, or government requests</li>
            <li>to protect the rights, safety, or property of Ruleout, users, or others</li>
            <li>to investigate fraud or violations of law</li>
          </ul>

          <h3>4.6 Aggregated or De-Identified Information</h3>
          <p>We may share de-identified or aggregated data for:</p>
          <ul>
            <li>veterinary research</li>
            <li>AI model improvement</li>
            <li>analytics</li>
            <li>industry insights</li>
            <li>product development</li>
          </ul>
          <p>This data cannot reasonably identify you.</p>

          <h2>5. Data Security</h2>
          <p>We implement technical and organizational measures including:</p>
          <ul>
            <li>encryption of data in transit (HTTPS / SSL)</li>
            <li>encryption at rest for sensitive data</li>
            <li>access controls and authentication</li>
            <li>monitoring and logging</li>
            <li>intrusion detection</li>
            <li>regular audits</li>
          </ul>
          <p>However, no system is fully secure. You are responsible for protecting your own password and account.</p>

          <h2>6. Data Retention</h2>
          <p>We retain your personal data:</p>
          <ul>
            <li>as long as your account is active</li>
            <li>and up to one year after account deletion, unless longer retention is required by law</li>
          </ul>
          <p>After that, data is anonymized or securely deleted.</p>

          <h2>7. Your Rights (Korea PIPA + global standards)</h2>
          <p>You may:</p>
          <ul>
            <li>access your personal information</li>
            <li>request correction or deletion</li>
            <li>request suspension of processing</li>
            <li>withdraw consent at any time</li>
            <li>request data portability where applicable</li>
          </ul>
          <p>
            To exercise rights, contact <strong>privacy@ruleout.com</strong>.
          </p>
          <p>We may need to verify your identity before responding.</p>

          <h2>8. Cookies and Tracking Technologies</h2>
          <p>
            You may control cookies through your browser, but disabling essential cookies may limit functionality. For mobile devices, you may opt out of advertising identifiers via OS settings.
          </p>
          <p>A detailed Cookie Policy will be made available separately.</p>

          <h2>9. International Data Transfers</h2>
          <p>Your information may be processed in:</p>
          <ul>
            <li>Korea</li>
            <li>countries where our cloud providers operate (e.g., Singapore, Japan, EU, U.S.)</li>
          </ul>
          <p>We ensure protection through:</p>
          <ul>
            <li>contractual safeguards</li>
            <li>encryption</li>
            <li>secure transfer mechanisms</li>
          </ul>
          <p>
            If you are in a jurisdiction with data-transfer restrictions, you may not use the Services unless such transfers are legally permitted.
          </p>

          <h2>10. Children's Privacy</h2>
          <p>
            The Services are not intended for individuals under 18. We do not knowingly collect personal information from minors.
          </p>

          <h2>11. Privacy Policy Changes</h2>
          <p>We may modify this Privacy Policy at any time. Material changes will be communicated via:</p>
          <ul>
            <li>email,</li>
            <li>prominent notice within the Services, or</li>
            <li>both.</li>
          </ul>
          <p>Continued use of the Services after modifications constitutes acceptance.</p>

          <h2>12. Contact Us</h2>
          <p>For questions or data access requests:</p>
          <p>
            <strong>Ruleout, Inc. – Privacy Office</strong><br />
            Seoul, Republic of Korea<br />
            Email: privacy@ruleout.com
          </p>
          <p>If legally required, a Data Protection Officer (DPO) may be appointed and listed here.</p>
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
