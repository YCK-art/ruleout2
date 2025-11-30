"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X } from "lucide-react";
import Toolbar from "@/app/components/Toolbar";
import Footer from '@/app/components/Footer';
import { signInWithGoogle } from "@/lib/auth";
import emailjs from '@emailjs/browser';
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from '@/contexts/LanguageContext';

interface JobDetailPageProps {
  params: {
    slug: string;
  };
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const router = useRouter();
  const { effectiveTheme } = useTheme();
  const { language } = useLanguage();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "application">("overview");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    coverLetter: "",
    linkedin: "",
    portfolio: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(t.fileSizeError);
        return;
      }
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (!allowedTypes.includes(file.type)) {
        alert(t.fileTypeError);
        return;
      }
      setResumeFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      // Check file size and type
      if (file.size > 10 * 1024 * 1024) {
        alert(t.fileSizeError);
        return;
      }
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (!allowedTypes.includes(file.type)) {
        alert(t.fileTypeError);
        return;
      }
      setResumeFile(file);
    }
  };

  const removeFile = () => {
    setResumeFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isFormValid = () => {
    return formData.fullName && formData.email && resumeFile;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      alert(t.fillRequired);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // 1. Upload resume to Firebase Storage
      const timestamp = Date.now();
      const sanitizedName = formData.fullName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const fileExtension = resumeFile!.name.split('.').pop();
      const fileName = `${timestamp}_${sanitizedName}_resume.${fileExtension}`;
      const filePath = `job-applications/${params.slug}/${fileName}`;

      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, resumeFile!);

      // 2. Get download URL
      const resumeUrl = await getDownloadURL(storageRef);

      // 3. Send email with resume link
      const serviceId = "service_b2uqtz1";
      const templateId = "template_rufwsqe";
      const publicKey = "9wAZ264-mW1zVO5KO";

      const templateParams = {
        to_email: "kyc05220522@gmail.com",
        job_title: job.title,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone || "Not provided",
        cover_letter: formData.coverLetter || "Not provided",
        linkedin: formData.linkedin || "Not provided",
        portfolio: formData.portfolio || "Not provided",
        resume_name: resumeFile!.name,
        resume_url: resumeUrl,
      };

      // Initialize EmailJS
      emailjs.init(publicKey);

      // Send email
      await emailjs.send(serviceId, templateId, templateParams);

      setSubmitMessage({
        type: 'success',
        text: t.successMessage
      });

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        coverLetter: "",
        linkedin: "",
        portfolio: "",
      });
      setResumeFile(null);

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitMessage({
        type: 'error',
        text: t.errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = {
    English: {
      backToCareers: "Back to careers",
      jobNotFound: "Job Not Found",
      location: "Location",
      employmentType: "Employment Type",
      locationType: "Location Type",
      department: "Department",
      overview: "Overview",
      application: "Application",
      aboutRuleout: "About Ruleout",
      aboutRole: "About the Role",
      goodFit: "You might be a good fit if you are:",
      compensation: "Compensation:",
      applyForPosition: "Apply for this position",
      fullName: "Full Name",
      email: "Email",
      phone: "Phone Number",
      resume: "Resume/CV",
      coverLetter: "Cover Letter",
      linkedin: "LinkedIn Profile",
      portfolio: "Portfolio/GitHub (if applicable)",
      submitApplication: "Submit Application",
      submitting: "Submitting...",
      uploadPrompt: "Click to upload or drag and drop",
      fileTypes: "PDF, DOC, DOCX (max 10MB)",
      fileSizeError: "File size must be less than 10MB",
      fileTypeError: "Only PDF, DOC, and DOCX files are allowed",
      fillRequired: "Please fill in all required fields",
      successMessage: "Application submitted successfully! We will review your application and get back to you soon.",
      errorMessage: "Failed to submit application. Please try again or email us directly at kyc05220522@gmail.com",
      loginTitle: "Log in or Sign up",
      loginSubtitle: "Choose your work email.",
      whyNeeded: "Why is this needed?",
      continueGoogle: "Continue with Google",
      continueMicrosoft: "Continue with Microsoft",
      continueApple: "Continue with Apple",
      continueEmail: "Continue with Email",
      or: "or"
    },
    한국어: {
      backToCareers: "채용 공고로 돌아가기",
      jobNotFound: "채용 공고를 찾을 수 없습니다",
      location: "근무지",
      employmentType: "고용 형태",
      locationType: "근무 방식",
      department: "부서",
      overview: "개요",
      application: "지원하기",
      aboutRuleout: "Ruleout 소개",
      aboutRole: "직무 소개",
      goodFit: "다음과 같은 분께 적합합니다:",
      compensation: "보상:",
      applyForPosition: "이 포지션에 지원하기",
      fullName: "성명",
      email: "이메일",
      phone: "전화번호",
      resume: "이력서",
      coverLetter: "자기소개서",
      linkedin: "LinkedIn 프로필",
      portfolio: "포트폴리오/GitHub (해당시)",
      submitApplication: "지원서 제출",
      submitting: "제출 중...",
      uploadPrompt: "클릭하거나 드래그하여 업로드",
      fileTypes: "PDF, DOC, DOCX (최대 10MB)",
      fileSizeError: "파일 크기는 10MB 이하여야 합니다",
      fileTypeError: "PDF, DOC, DOCX 파일만 허용됩니다",
      fillRequired: "필수 항목을 모두 입력해주세요",
      successMessage: "지원서가 성공적으로 제출되었습니다! 검토 후 연락드리겠습니다.",
      errorMessage: "지원서 제출에 실패했습니다. 다시 시도하거나 kyc05220522@gmail.com으로 직접 이메일을 보내주세요",
      loginTitle: "로그인 또는 회원가입",
      loginSubtitle: "업무용 이메일을 선택하세요.",
      whyNeeded: "왜 필요한가요?",
      continueGoogle: "Google로 계속하기",
      continueMicrosoft: "Microsoft로 계속하기",
      continueApple: "Apple로 계속하기",
      continueEmail: "이메일로 계속하기",
      or: "또는"
    },
    日本語: {
      backToCareers: "採用情報に戻る",
      jobNotFound: "求人が見つかりません",
      location: "勤務地",
      employmentType: "雇用形態",
      locationType: "勤務形態",
      department: "部門",
      overview: "概要",
      application: "応募",
      aboutRuleout: "Ruleoutについて",
      aboutRole: "職務について",
      goodFit: "以下に該当する方に適しています:",
      compensation: "報酬:",
      applyForPosition: "このポジションに応募する",
      fullName: "氏名",
      email: "メールアドレス",
      phone: "電話番号",
      resume: "履歴書",
      coverLetter: "カバーレター",
      linkedin: "LinkedInプロフィール",
      portfolio: "ポートフォリオ/GitHub (該当する場合)",
      submitApplication: "応募書類を提出",
      submitting: "送信中...",
      uploadPrompt: "クリックまたはドラッグ&ドロップでアップロード",
      fileTypes: "PDF、DOC、DOCX (最大10MB)",
      fileSizeError: "ファイルサイズは10MB以下である必要があります",
      fileTypeError: "PDF、DOC、DOCXファイルのみ許可されています",
      fillRequired: "必須項目をすべて入力してください",
      successMessage: "応募書類が正常に送信されました！審査の上、ご連絡いたします。",
      errorMessage: "応募書類の送信に失敗しました。もう一度お試しいただくか、kyc05220522@gmail.comまで直接メールをお送りください",
      loginTitle: "ログインまたはサインアップ",
      loginSubtitle: "業務用メールアドレスを選択してください。",
      whyNeeded: "なぜ必要ですか？",
      continueGoogle: "Googleで続ける",
      continueMicrosoft: "Microsoftで続ける",
      continueApple: "Appleで続ける",
      continueEmail: "メールアドレスで続ける",
      or: "または"
    }
  };

  const t = content[language];

  // Job details data
  const jobDetails: Record<string, any> = {
    "founding-full-stack-engineer": {
      title: "Founding Full Stack Engineer",
      location: "Seoul, South Korea",
      employmentType: "Full time",
      locationType: "Hybrid",
      department: "Engineering",
      overview: {
        about: `Ruleout is building AI-powered tools to transform veterinary medicine and improve animal health outcomes worldwide.

We are creating the most advanced clinical decision support system for veterinarians, combining cutting-edge AI with comprehensive medical guidelines to help veterinarians make better, faster decisions.`,
        role: `We work in a fast-paced startup environment where your contributions will directly impact thousands of veterinarians and millions of animals.

You will be working on our core platform, building features that veterinarians use daily to save lives.

The entire codebase uses TypeScript, Next.js, and modern web technologies. We value clean code, good design, and user experience.`,
        fit: [
          "Passionate about building products that make a real difference",
          "Strong full-stack engineer (React/Next.js/Node.js experience)",
          "You know how to efficiently build and scale web applications",
          "You can work independently and take ownership of features",
          "Comfortable with rapid iteration and learning new technologies",
          "Experience with AI/ML integration is a plus"
        ],
        compensation: [
          "Competitive salary based on experience",
          "Equity in a fast-growing startup",
          "Flexible work arrangements"
        ]
      }
    },
    "content-creator": {
      title: "Content Creator",
      location: "Remote",
      employmentType: "Full time",
      locationType: "Remote",
      department: "Marketing",
      overview: {
        about: `Ruleout is transforming veterinary medicine with AI-powered clinical decision support tools.

We need a creative content creator to help us tell our story and educate veterinarians about the future of veterinary medicine.`,
        role: `You will create engaging content across multiple platforms - blog posts, social media, videos, and educational materials.

Your content will help veterinarians understand how AI can improve their practice and patient outcomes.

You'll work closely with our clinical team to ensure accuracy while making complex medical topics accessible and engaging.`,
        fit: [
          "Strong writing and storytelling skills",
          "Experience creating content for professional audiences",
          "Understanding of or interest in veterinary medicine/healthcare",
          "Comfortable with video creation and editing",
          "Self-motivated and able to work independently",
          "Experience with SEO and content marketing"
        ],
        compensation: [
          "Competitive salary for remote work",
          "Flexible schedule",
          "Opportunity to shape our brand voice"
        ]
      }
    },
    "veterinary-clinical-advisor": {
      title: "Veterinary Clinical Advisor",
      location: "Remote",
      employmentType: "Part time",
      locationType: "Remote",
      department: "Clinical & Research",
      overview: {
        about: `Ruleout is building the most advanced AI clinical decision support system for veterinarians.

We need experienced veterinarians to help us ensure our AI provides accurate, relevant, and practical clinical guidance.`,
        role: `You will review AI-generated clinical recommendations, provide feedback on guideline interpretations, and help us improve our system.

This is a part-time consulting role that can fit around your clinical practice.

Your expertise will directly improve the quality of care for thousands of animals worldwide.`,
        fit: [
          "Licensed veterinarian with clinical experience",
          "Strong understanding of evidence-based medicine",
          "Interest in technology and AI applications in medicine",
          "Excellent communication skills",
          "Attention to detail and commitment to accuracy",
          "Passion for improving veterinary care"
        ],
        compensation: [
          "Competitive hourly rate for consulting work",
          "Flexible hours that work with your schedule",
          "Remote work from anywhere"
        ]
      }
    }
  };

  const job = jobDetails[params.slug];

  if (!job) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white">
        <Toolbar onLoginClick={handleLogin} />
        <div className="max-w-6xl mx-auto px-6 py-24 pt-32">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Job Not Found</h1>
            <button
              onClick={() => router.push('/careers')}
              className="px-6 py-3 bg-[#20808D] text-white rounded-lg hover:bg-[#1a6b77] transition-colors"
            >
              Back to Careers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Toolbar */}
      <Toolbar onLoginClick={handleLogin} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-24 pt-32">
        {/* Submit Message */}
        {submitMessage && (
          <div className={`mb-8 p-4 rounded-lg ${
            submitMessage.type === 'success'
              ? 'bg-green-900/20 border border-green-500/50 text-green-300'
              : 'bg-red-900/20 border border-red-500/50 text-red-300'
          }`}>
            {submitMessage.text}
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => router.push('/careers')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t.backToCareers}</span>
        </button>

        {/* Job Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-12">
          {job.title}
        </h1>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Sidebar - Job Info */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-32">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">{t.location}</h3>
                <p className="text-white">{job.location}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">{t.employmentType}</h3>
                <p className="text-white">{job.employmentType}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">{t.locationType}</h3>
                <p className="text-white">{job.locationType}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">{t.department}</h3>
                <p className="text-white">{job.department}</p>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="flex gap-8 border-b border-gray-800 mb-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`pb-4 font-medium transition-colors relative ${
                  activeTab === "overview"
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                {t.overview}
                {activeTab === "overview" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4DB8C4]"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("application")}
                className={`pb-4 font-medium transition-colors relative ${
                  activeTab === "application"
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                {t.application}
                {activeTab === "application" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4DB8C4]"></div>
                )}
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" ? (
              <div className="space-y-8">
                {/* About Section */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">{t.aboutRuleout}</h2>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {job.overview.about}
                  </p>
                </div>

                {/* Role Section */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">{t.aboutRole}</h2>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {job.overview.role}
                  </p>
                </div>

                {/* Good Fit Section */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">{t.goodFit}</h2>
                  <ul className="space-y-3">
                    {job.overview.fit.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 text-gray-300">
                        <span className="text-[#4DB8C4] mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Compensation Section */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">{t.compensation}</h2>
                  <ul className="space-y-3">
                    {job.overview.compensation.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 text-gray-300">
                        <span className="text-[#4DB8C4] mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Apply Button */}
                <div className="pt-6">
                  <button
                    onClick={() => {
                      setActiveTab("application");
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-8 py-3 bg-[#20808D] text-white font-medium rounded-lg hover:bg-[#1a6b77] transition-colors"
                  >
                    {t.applyForPosition}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Application</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t.fullName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-4 py-3 bg-[#252525] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#20808D] transition-colors"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t.email} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-[#252525] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#20808D] transition-colors"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t.phone}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-[#252525] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#20808D] transition-colors"
                    placeholder="+82 10-1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t.resume} *
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {!resumeFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-[#20808D] transition-colors cursor-pointer"
                    >
                      <Upload className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">{t.uploadPrompt}</p>
                      <p className="text-sm text-gray-500 mt-2">{t.fileTypes}</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-[#252525] border border-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#20808D]/20 rounded">
                          <Upload className="w-5 h-5 text-[#4DB8C4]" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{resumeFile.name}</p>
                          <p className="text-sm text-gray-400">
                            {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-2 hover:bg-gray-700 rounded transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t.coverLetter}
                  </label>
                  <textarea
                    rows={6}
                    value={formData.coverLetter}
                    onChange={(e) => setFormData({...formData, coverLetter: e.target.value})}
                    className="w-full px-4 py-3 bg-[#252525] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#20808D] transition-colors resize-none"
                    placeholder="Tell us why you're interested in this position..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t.linkedin}
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                    className="w-full px-4 py-3 bg-[#252525] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#20808D] transition-colors"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t.portfolio}
                  </label>
                  <input
                    type="url"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
                    className="w-full px-4 py-3 bg-[#252525] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#20808D] transition-colors"
                    placeholder="https://github.com/yourusername"
                  />
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={!isFormValid() || isSubmitting}
                    className={`px-8 py-3 font-medium rounded-lg transition-colors ${
                      isFormValid() && !isSubmitting
                        ? 'bg-[#20808D] text-white hover:bg-[#1a6b77] cursor-pointer'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? t.submitting : t.submitApplication}
                  </button>
                </div>
              </form>
            )}
          </div>
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
                {t.loginTitle}
              </h2>
              <p className="text-gray-400">
                {t.loginSubtitle} <a href="#" className="text-[#20808D] hover:underline">{t.whyNeeded}</a>
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
                  <span className="text-white font-medium">{t.continueGoogle}</span>
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
                  <span className="text-white font-medium">{t.continueMicrosoft}</span>
                </div>
              </button>

              <button className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-700 rounded-lg hover:border-gray-600 transition-colors bg-[#2a2a2a]">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span className="text-white font-medium">{t.continueApple}</span>
                </div>
              </button>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-700"></div>
                <span className="px-4 text-gray-400">{t.or}</span>
                <div className="flex-1 border-t border-gray-700"></div>
              </div>

              <button className="w-full px-6 py-4 bg-[#20808D] text-white rounded-lg hover:bg-[#1a6a78] transition-colors font-medium">
                {t.continueEmail}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
