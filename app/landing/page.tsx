"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ArrowRight, BookText, Pill, Stethoscope, ArrowUpRight, Activity } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithGoogle } from "@/lib/auth";
import Toolbar from "@/app/components/Toolbar";
import { getAllBlogPosts, BlogPost } from "@/lib/blogService";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/app/components/Footer";

// FAQ Item Component
function FAQItem({ question, answer, theme }: { question: string; answer: string; theme: "light" | "dark" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border-b ${theme === "light" ? "border-gray-200" : "border-gray-800"}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left hover:text-[#4DB8C4] transition-colors group"
      >
        <span className={`text-lg md:text-xl font-medium ${theme === "light" ? "text-gray-900" : "text-white"} group-hover:text-[#4DB8C4] transition-colors`}>
          {question}
        </span>
        <ChevronDown
          className={`w-6 h-6 ${theme === "light" ? "text-gray-500" : "text-gray-400"} transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 pb-6" : "max-h-0"
        }`}
      >
        <p className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} leading-relaxed max-w-3xl`}>{answer}</p>
      </div>
    </div>
  );
}

// Carousel Content Component
function CarouselContent({ effectiveTheme, slides }: { effectiveTheme: "light" | "dark"; slides: Array<{ title: string; description: string }> }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
      {/* Left: Description Text */}
      <div className="lg:col-span-2 space-y-6 pt-4">
        <div className="min-h-[100px]">
          <h3 className={`text-xl font-semibold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-3 transition-opacity duration-500`}>
            {slides[currentSlide].title}
          </h3>
          <p className={`text-sm ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} leading-relaxed mb-4 transition-opacity duration-500`}>
            {slides[currentSlide].description}
          </p>
        </div>

        {/* Slide Indicators */}
        <div className="flex gap-2">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? 'w-8 bg-[#20808D]'
                  : `w-1.5 ${effectiveTheme === "light" ? "bg-gray-300" : "bg-gray-700"}`
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right: Image Carousel */}
      <div className="lg:col-span-3 relative">
        <div className={`rounded-xl overflow-hidden border ${effectiveTheme === "light" ? "border-gray-200 bg-gray-100" : "border-gray-800 bg-[#0d1117]"} shadow-2xl`}>
          <div className="aspect-[16/9] relative">
            {/* Slide 1 */}
            <div className={`absolute inset-0 transition-opacity duration-500 ${currentSlide === 0 ? 'opacity-100' : 'opacity-0'}`}>
              <div className="w-full h-full bg-gradient-to-br from-[#20808D]/10 to-[#4DB8C4]/10 flex items-center justify-center">
                <span className={`text-8xl font-bold ${effectiveTheme === "light" ? "text-gray-300" : "text-gray-800"}`}>
                  1
                </span>
              </div>
            </div>

            {/* Slide 2 */}
            <div className={`absolute inset-0 transition-opacity duration-500 ${currentSlide === 1 ? 'opacity-100' : 'opacity-0'}`}>
              <div className="w-full h-full bg-gradient-to-br from-[#4DB8C4]/10 to-[#6dccd7]/10 flex items-center justify-center">
                <span className={`text-8xl font-bold ${effectiveTheme === "light" ? "text-gray-300" : "text-gray-800"}`}>
                  2
                </span>
              </div>
            </div>

            {/* Slide 3 */}
            <div className={`absolute inset-0 transition-opacity duration-500 ${currentSlide === 2 ? 'opacity-100' : 'opacity-0'}`}>
              <div className="w-full h-full bg-gradient-to-br from-[#6dccd7]/10 to-[#20808D]/10 flex items-center justify-center">
                <span className={`text-8xl font-bold ${effectiveTheme === "light" ? "text-gray-300" : "text-gray-800"}`}>
                  3
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + 3) % 3)}
          className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full ${effectiveTheme === "light" ? "bg-white border-gray-200" : "bg-[#2a2a2a] border-gray-700"} border shadow-lg flex items-center justify-center hover:scale-110 transition-transform`}
        >
          <svg className={`w-5 h-5 ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % 3)}
          className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full ${effectiveTheme === "light" ? "bg-white border-gray-200" : "bg-[#2a2a2a] border-gray-700"} border shadow-lg flex items-center justify-center hover:scale-110 transition-transform`}
        >
          <svg className={`w-5 h-5 ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { effectiveTheme } = useTheme();
  const { language } = useLanguage();
  const [question, setQuestion] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);

  // Fetch blog posts on mount
  useEffect(() => {
    const fetchBlogPosts = async () => {
      setIsLoadingBlogs(true);
      const posts = await getAllBlogPosts();
      setBlogPosts(posts.slice(0, 4)); // Get only first 4 posts
      setIsLoadingBlogs(false);
    };
    fetchBlogPosts();
  }, []);

  const handleLogin = () => {
    // 로그인 모달 열기
    setShowLoginModal(true);
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      // 로그인 성공 시 홈으로 이동
      setShowLoginModal(false);
      router.push("/");
    } catch (error) {
      console.error("로그인 실패:", error);
      // 에러 처리 (필요시 사용자에게 알림)
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    // 질문과 함께 메인 앱으로 이동 (guest 모드)
    router.push(`/?q=${encodeURIComponent(question)}&guest=true`);
  };

  const handleQuestionClick = (q: string) => {
    // 질문 클릭 시 메인 앱으로 이동 (guest 모드)
    router.push(`/?q=${encodeURIComponent(q)}&guest=true`);
  };

  // Language content
  const content = {
    English: {
      hero: {
        title: "Science Behind Every\nAnimal Diagnosis",
        subtitle: "Empower veterinarians to make faster, smarter decisions",
        placeholder: "Ask a medical question..."
      },
      suggestions: [
        {
          icon: BookText,
          text: "Guidelines",
          questions: [
            "What are the WSAVA guidelines for canine vaccination protocols?",
            "What is the standard protocol for feline diabetes management?",
            "What are the pain management guidelines for post-operative dogs?"
          ]
        },
        {
          icon: Pill,
          text: "Drug Administration",
          questions: [
            "What is the safe dosage of meloxicam for a 15kg dog with osteoarthritis?",
            "Can I administer acepromazine to a cat with heart disease?",
            "How should antibiotic doses be adjusted for dogs with renal insufficiency?"
          ]
        },
        {
          icon: Stethoscope,
          text: "Treatment Alternatives",
          questions: [
            "What are alternative antibiotics for dogs allergic to penicillin?",
            "What NSAIDs can be used if a cat cannot tolerate meloxicam?",
            "What are treatment alternatives for canine atopic dermatitis besides steroids?"
          ]
        },
        {
          icon: Activity,
          text: "Diagnostic Protocols",
          questions: [
            "What diagnostic tests are recommended for suspected feline hyperthyroidism?",
            "What is the protocol for diagnosing canine Cushing's disease?",
            "How should I approach a dog with suspected pancreatitis?"
          ]
        }
      ],
      partners: {
        subtitle: "Journals",
        title: "Evidence-informed veterinary medicine, built for clinicians"
      },
      features: {
        title: "Clinically intelligent, Instantly responsive.",
        description: "Our model delivers veterinary answers with remarkable speed and medical precision.",
        link: "Learn about Features"
      },
      carousel: {
        title: "Advanced clinical insights at your fingertips",
        description: "Access evidence-based guidelines and treatment protocols instantly, helping you make confident clinical decisions with comprehensive reference support.",
        slides: [
          {
            title: "Comprehensive guideline database",
            description: "Access thousands of peer-reviewed clinical guidelines updated regularly with the latest veterinary research."
          },
          {
            title: "Evidence-based decision support",
            description: "Make confident clinical decisions with AI-powered recommendations backed by the latest medical literature."
          },
          {
            title: "Instant reference lookup",
            description: "Find relevant treatment protocols and diagnostic criteria in seconds, streamlining your clinical workflow."
          }
        ]
      },
      features2: {
        title: "Built for veterinary excellence",
        cards: [
          {
            title: "Trained on Leading veterinary journals",
            description: "Our AI is built on extensive clinical research, providing expert insight you can trust.",
            link: "Explore knowledge"
          },
          {
            title: "Made for vets to use",
            description: "Built for real clinical work, our AI delivers fast and precise understanding.",
            link: "Learn more"
          },
          {
            title: "For every animal's health and dignity",
            description: "Empowering better care and advancing animal welfare through intelligent medicine.",
            link: "See our mission"
          }
        ]
      },
      blog: {
        title: "Recent highlights",
        viewMore: "View more posts",
        noPosts: "No blog posts available yet."
      },
      faq: {
        title: "Frequently asked questions",
        items: [
          {
            question: "What veterinary guidelines are included in Ruleout?",
            answer: "Ruleout includes comprehensive clinical guidelines from major veterinary associations worldwide, covering companion animals, exotic species, and emergency medicine. Our database is continuously updated with the latest evidence-based recommendations."
          },
          {
            question: "Who is Ruleout for?",
            answer: "Ruleout is designed for veterinarians, veterinary technicians, and veterinary students who need quick, reliable access to clinical guidelines during patient care. It's perfect for busy practices, emergency clinics, and educational settings."
          },
          {
            question: "Is Ruleout free?",
            answer: "Ruleout offers a free tier with access to essential guidelines. Premium plans provide unlimited searches, advanced filtering, and access to our complete guideline library with regular updates."
          },
          {
            question: "How accurate are the clinical guidelines?",
            answer: "All guidelines in Ruleout are sourced directly from official veterinary medical associations and peer-reviewed publications. We maintain strict quality control and update our database regularly to ensure clinical accuracy."
          },
          {
            question: "What search capabilities does Ruleout offer?",
            answer: "Ruleout uses advanced AI to understand your clinical queries in natural language. You can search by symptoms, diagnosis, species, or treatment protocols, and get instant, relevant guideline recommendations with citations."
          },
          {
            question: "Can I access Ruleout on mobile devices?",
            answer: "Yes! Ruleout is fully responsive and works seamlessly on smartphones, tablets, and desktop computers. Access critical guidelines anywhere in your clinic or on the go."
          }
        ]
      },
      banner: {
        title: "Try Ruleout Now",
        button: "Get Started"
      }
    },
    한국어: {
      hero: {
        title: "모든 동물 진단에\n과학적 근거를",
        subtitle: "수의사가 더 빠르고, 명확한 의사결정을 내릴 수 있도록 돕습니다",
        placeholder: "의학 질문을 입력하세요..."
      },
      suggestions: [
        {
          icon: BookText,
          text: "가이드라인",
          questions: [
            "WSAVA 개 백신 접종 프로토콜 가이드라인은 무엇인가요?",
            "고양이 당뇨병 관리의 표준 프로토콜은 무엇인가요?",
            "수술 후 개의 통증 관리 가이드라인은 무엇인가요?"
          ]
        },
        {
          icon: Pill,
          text: "약물 투여",
          questions: [
            "골관절염이 있는 15kg 개에게 멜록시캄의 안전한 용량은?",
            "심장 질환이 있는 고양이에게 아세프로마진을 투여할 수 있나요?",
            "신장 기능 부전이 있는 개의 항생제 용량을 어떻게 조정해야 하나요?"
          ]
        },
        {
          icon: Stethoscope,
          text: "치료 대안",
          questions: [
            "페니실린 알레르기가 있는 개를 위한 대체 항생제는?",
            "고양이가 멜록시캄을 견디지 못할 경우 사용할 수 있는 NSAID는?",
            "스테로이드 외에 개 아토피 피부염의 치료 대안은?"
          ]
        },
        {
          icon: Activity,
          text: "진단 프로토콜",
          questions: [
            "고양이 갑상선 기능 항진증이 의심될 때 권장되는 진단 검사는?",
            "개 쿠싱 증후군 진단 프로토콜은 무엇인가요?",
            "췌장염이 의심되는 개에게 어떻게 접근해야 하나요?"
          ]
        }
      ],
      partners: {
        subtitle: "파트너",
        title: "Ruleout은 선도적인 수의학 플랫폼입니다"
      },
      features: {
        title: "임상적으로 똑똑하고, 즉각적으로 반응합니다.",
        description: "우리 모델은 놀라운 속도와 의학적 정확도로 수의학적 답변을 제공합니다.",
        link: "기능 알아보기"
      },
      carousel: {
        title: "손끝에서 제공되는 고급 임상 통찰력",
        description: "증거 기반 가이드라인과 치료 프로토콜에 즉시 액세스하여 포괄적인 참고 자료로 자신감 있는 임상 결정을 내릴 수 있습니다.",
        slides: [
          {
            title: "포괄적인 가이드라인 데이터베이스",
            description: "최신 수의학 연구로 정기적으로 업데이트되는 수천 개의 동료 검토 임상 가이드라인에 액세스하세요."
          },
          {
            title: "증거 기반 의사결정 지원",
            description: "최신 의학 문헌을 기반으로 한 AI 기반 권장 사항으로 자신감 있는 임상 결정을 내리세요."
          },
          {
            title: "즉각적인 참고 자료 검색",
            description: "관련 치료 프로토콜 및 진단 기준을 몇 초 만에 찾아 임상 워크플로를 간소화하세요."
          }
        ]
      },
      features2: {
        title: "수의학 우수성을 위해 제작됨",
        cards: [
          {
            title: "주요 수의학 저널로 학습",
            description: "우리 AI는 광범위한 임상 연구를 기반으로 구축되어 신뢰할 수 있는 전문가 통찰력을 제공합니다.",
            link: "지식 탐색"
          },
          {
            title: "수의사가 사용하도록 제작됨",
            description: "실제 임상 작업을 위해 구축된 우리 AI는 빠르고 정확한 이해를 제공합니다.",
            link: "자세히 알아보기"
          },
          {
            title: "모든 동물의 건강과 존엄성을 위해",
            description: "지능형 의학을 통해 더 나은 치료를 가능하게 하고 동물 복지를 향상시킵니다.",
            link: "우리의 미션 보기"
          }
        ]
      },
      blog: {
        title: "최신 소식",
        viewMore: "더 많은 게시물 보기",
        noPosts: "아직 블로그 게시물이 없습니다."
      },
      faq: {
        title: "자주 묻는 질문",
        items: [
          {
            question: "Ruleout에는 어떤 수의학 가이드라인이 포함되어 있나요?",
            answer: "Ruleout은 반려동물, 이국적 종, 응급 의학을 다루는 전 세계 주요 수의학 협회의 포괄적인 임상 가이드라인을 포함합니다. 우리 데이터베이스는 최신 증거 기반 권장 사항으로 지속적으로 업데이트됩니다."
          },
          {
            question: "Ruleout은 누구를 위한 것인가요?",
            answer: "Ruleout은 환자 치료 중 빠르고 신뢰할 수 있는 임상 가이드라인 액세스가 필요한 수의사, 수의 기술자 및 수의학 학생을 위해 설계되었습니다. 바쁜 진료소, 응급 클리닉 및 교육 환경에 완벽합니다."
          },
          {
            question: "Ruleout은 무료인가요?",
            answer: "Ruleout은 필수 가이드라인에 액세스할 수 있는 무료 등급을 제공합니다. 프리미엄 플랜은 무제한 검색, 고급 필터링 및 정기 업데이트가 포함된 완전한 가이드라인 라이브러리에 대한 액세스를 제공합니다."
          },
          {
            question: "임상 가이드라인은 얼마나 정확한가요?",
            answer: "Ruleout의 모든 가이드라인은 공식 수의학 협회 및 동료 검토 출판물에서 직접 가져옵니다. 우리는 엄격한 품질 관리를 유지하고 임상 정확성을 보장하기 위해 데이터베이스를 정기적으로 업데이트합니다."
          },
          {
            question: "Ruleout은 어떤 검색 기능을 제공하나요?",
            answer: "Ruleout은 고급 AI를 사용하여 자연어로 된 임상 쿼리를 이해합니다. 증상, 진단, 종 또는 치료 프로토콜로 검색하고 인용과 함께 즉각적이고 관련성 있는 가이드라인 권장 사항을 얻을 수 있습니다."
          },
          {
            question: "모바일 기기에서 Ruleout에 액세스할 수 있나요?",
            answer: "네! Ruleout은 완전히 반응형이며 스마트폰, 태블릿 및 데스크톱 컴퓨터에서 원활하게 작동합니다. 클리닉 어디에서나 또는 이동 중에도 중요한 가이드라인에 액세스하세요."
          }
        ]
      },
      banner: {
        title: "지금 Ruleout 사용해보기",
        button: "시작하기"
      }
    },
    日本語: {
      hero: {
        title: "すべての動物診断の\n科学的根拠",
        subtitle: "獣医師がより迅速で正確な診断を下せるように",
        placeholder: "医学的な質問を入力してください..."
      },
      suggestions: [
        {
          icon: BookText,
          text: "ガイドライン",
          questions: [
            "犬のワクチン接種プロトコルに関するWSAVAガイドラインは何ですか？",
            "猫の糖尿病管理の標準プロトコルは何ですか？",
            "術後の犬の疼痛管理ガイドラインは何ですか？"
          ]
        },
        {
          icon: Pill,
          text: "薬物投与",
          questions: [
            "骨関節炎のある15kgの犬に対するメロキシカムの安全な投与量は？",
            "心臓病のある猫にアセプロマジンを投与できますか？",
            "腎機能不全のある犬の抗生物質投与量をどのように調整すべきですか？"
          ]
        },
        {
          icon: Stethoscope,
          text: "治療の代替案",
          questions: [
            "ペニシリンアレルギーのある犬のための代替抗生物質は？",
            "猫がメロキシカムを耐えられない場合に使用できるNSAIDは？",
            "ステロイド以外の犬のアトピー性皮膚炎の治療代替案は？"
          ]
        },
        {
          icon: Activity,
          text: "診断プロトコル",
          questions: [
            "猫の甲状腺機能亢進症が疑われる場合に推奨される診断検査は？",
            "犬のクッシング症候群の診断プロトコルは何ですか？",
            "膵炎が疑われる犬にどのようにアプローチすべきですか？"
          ]
        }
      ],
      partners: {
        subtitle: "パートナー",
        title: "Ruleoutは獣医学の主要なプラットフォームです"
      },
      features: {
        title: "臨床的に高度で、即座に応答します。",
        description: "当社のモデルは、驚異的なスピードと医学的精度で獣医学の回答を提供します。",
        link: "機能について詳しく見る"
      },
      carousel: {
        title: "指先で高度な臨床知見にアクセス",
        description: "エビデンスに基づくガイドラインと治療プロトコルに即座にアクセスし、包括的な参照サポートで自信を持って臨床判断を下すことができます。",
        slides: [
          {
            title: "包括的なガイドラインデータベース",
            description: "最新の獣医学研究で定期的に更新される数千のピアレビュー臨床ガイドラインにアクセスできます。"
          },
          {
            title: "エビデンスに基づく意思決定支援",
            description: "最新の医学文献に裏付けられたAI搭載の推奨事項で、自信を持って臨床決定を下すことができます。"
          },
          {
            title: "即座の参照検索",
            description: "関連する治療プロトコルと診断基準を数秒で見つけ、臨床ワークフローを効率化します。"
          }
        ]
      },
      features2: {
        title: "獣医学の卓越性のために構築",
        cards: [
          {
            title: "主要な獣医学ジャーナルで訓練",
            description: "当社のAIは広範な臨床研究に基づいて構築され、信頼できる専門的な洞察を提供します。",
            link: "知識を探索"
          },
          {
            title: "獣医師が使用するために作成",
            description: "実際の臨床業務のために構築された当社のAIは、迅速で正確な理解を提供します。",
            link: "詳細を見る"
          },
          {
            title: "すべての動物の健康と尊厳のために",
            description: "インテリジェントな医療を通じて、より良いケアを可能にし、動物福祉を向上させます。",
            link: "私たちのミッションを見る"
          }
        ]
      },
      blog: {
        title: "最新のハイライト",
        viewMore: "もっと見る",
        noPosts: "まだブログ投稿はありません。"
      },
      faq: {
        title: "よくある質問",
        items: [
          {
            question: "Ruleoutにはどのような獣医学ガイドラインが含まれていますか？",
            answer: "Ruleoutには、コンパニオンアニマル、エキゾチック種、救急医療をカバーする世界中の主要な獣医学協会の包括的な臨床ガイドラインが含まれています。当社のデータベースは、最新のエビデンスに基づく推奨事項で継続的に更新されています。"
          },
          {
            question: "Ruleoutは誰のためのものですか？",
            answer: "Ruleoutは、患者ケア中に迅速で信頼できる臨床ガイドラインへのアクセスを必要とする獣医師、獣医技術者、獣医学生向けに設計されています。多忙な診療所、救急クリニック、教育環境に最適です。"
          },
          {
            question: "Ruleoutは無料ですか？",
            answer: "Ruleoutは、必須のガイドラインにアクセスできる無料プランを提供しています。プレミアムプランでは、無制限の検索、高度なフィルタリング、定期的な更新を含む完全なガイドラインライブラリへのアクセスを提供します。"
          },
          {
            question: "臨床ガイドラインはどのくらい正確ですか？",
            answer: "Ruleoutのすべてのガイドラインは、公式の獣医学協会およびピアレビューされた出版物から直接取得されています。臨床の正確性を確保するために、厳格な品質管理を維持し、データベースを定期的に更新しています。"
          },
          {
            question: "Ruleoutはどのような検索機能を提供していますか？",
            answer: "Ruleoutは、自然言語での臨床クエリを理解する高度なAIを使用しています。症状、診断、種、または治療プロトコルで検索し、引用付きの即座で関連性の高いガイドライン推奨事項を取得できます。"
          },
          {
            question: "モバイルデバイスでRuleoutにアクセスできますか？",
            answer: "はい！Ruleoutは完全にレスポンシブで、スマートフォン、タブレット、デスクトップコンピュータでシームレスに動作します。クリニックのどこからでも、または外出先でも重要なガイドラインにアクセスできます。"
          }
        ]
      },
      banner: {
        title: "今すぐRuleoutを試す",
        button: "始める"
      }
    }
  };

  const currentContent = content[language as keyof typeof content];
  const suggestions = currentContent.suggestions;

  return (
    <div className={`min-h-screen ${effectiveTheme === "light" ? "bg-white text-gray-900" : "bg-[#1a1a1a] text-white"}`}>
      {/* Toolbar */}
      <Toolbar onLoginClick={handleLogin} />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-24 pt-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* 왼쪽: 텍스트 및 입력 */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
                {currentContent.hero.title.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i === 0 && <br />}
                  </span>
                ))}
              </h1>
              <p className={`text-base sm:text-lg md:text-xl ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
                {currentContent.hero.subtitle}
              </p>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSubmit} className="w-full max-w-2xl mb-6">
              <div className={`flex items-center ${effectiveTheme === "light" ? "bg-gray-50 border-gray-300" : "bg-[#2a2a2a] border-gray-700"} rounded-2xl border px-6 pr-2 py-3`}>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={currentContent.hero.placeholder}
                  className={`flex-1 bg-transparent outline-none ${effectiveTheme === "light" ? "text-gray-900 placeholder-gray-400" : "text-white placeholder-gray-500"}`}
                />
                <button
                  type="submit"
                  className="w-10 h-10 flex items-center justify-center bg-[#20808D] rounded-full transition-all duration-200 hover:shadow-[0_0_20px_rgba(32,128,141,0.4)] hover:brightness-110"
                >
                  <ArrowRight className="w-5 h-5 text-white" />
                </button>
              </div>
            </form>

            {/* 제안 버튼들 */}
            <div className="w-full">
              <div className="flex flex-wrap gap-3 mb-4">
                {suggestions.map((suggestion, index) => {
                  const Icon = suggestion.icon;
                  const isExpanded = expandedCategory === suggestion.text;
                  return (
                    <button
                      key={index}
                      onClick={() => setExpandedCategory(isExpanded ? null : suggestion.text)}
                      className={`flex items-center space-x-2 px-4 py-2 ${effectiveTheme === "light" ? "bg-gray-50 border-gray-300 hover:border-gray-400" : "bg-[#2a2a2a] border-gray-700 hover:border-gray-600"} border rounded-lg transition-colors`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{suggestion.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* 확장된 질문 목록 */}
              {expandedCategory && (
                <div className="space-y-2 animate-slideDown">
                  {suggestions
                    .find((s) => s.text === expandedCategory)
                    ?.questions.map((q, qIndex) => (
                      <button
                        key={qIndex}
                        onClick={() => handleQuestionClick(q)}
                        className={`w-full group flex items-center justify-between px-5 py-4 ${effectiveTheme === "light" ? "bg-gray-50 border-gray-300 hover:border-gray-400" : "bg-[#2a2a2a] border-gray-700 hover:border-gray-600"} border rounded-lg transition-all text-left`}
                      >
                        <span className={`text-sm ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-200"} pr-4`}>{q}</span>
                        <ArrowUpRight className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-[#20808D] transition-colors" />
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 일러스트레이션 영역 */}
          <div className={`relative h-96 flex items-center justify-center ${effectiveTheme === "light" ? "bg-gray-100" : "bg-[#1a1a1a]"} rounded-lg pt-24`}>
            <Image
              src="/image/cat.png"
              alt="Cat"
              width={300}
              height={300}
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className={`${effectiveTheme === "light" ? "bg-gray-50" : "bg-[#212121]"} py-12`}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-[#20808D] text-2xl font-semibold mb-4" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>{currentContent.partners.subtitle}</p>
            <h2 className={`text-3xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-6`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
              {currentContent.partners.title}
            </h2>
          </div>

          {/* 파트너 로고 그리드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center">
            {/* 첫 번째 줄 */}
            <div className={`flex items-center justify-center h-24 ${effectiveTheme === "light" ? "bg-white border border-gray-200" : "bg-[#2a2a2a]"} rounded-lg p-4`}>
              <Image
                src="/image/stmary.png"
                alt="St. Mary's Hospital"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>
            <div className={`flex items-center justify-center h-24 ${effectiveTheme === "light" ? "bg-white border border-gray-200" : "bg-[#2a2a2a]"} rounded-lg p-4`}>
              <Image
                src="/image/asan.svg"
                alt="Asan Medical Center"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>
            <div className={`flex items-center justify-center h-24 ${effectiveTheme === "light" ? "bg-white border border-gray-200" : "bg-[#2a2a2a]"} rounded-lg p-4`}>
              <Image
                src="/image/severance.svg"
                alt="Severance Hospital"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>
            <div className={`flex items-center justify-center h-24 ${effectiveTheme === "light" ? "bg-white border border-gray-200" : "bg-[#2a2a2a]"} rounded-lg p-4`}>
              <Image
                src="/image/hanyang.svg"
                alt="Hanyang University Hospital"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>

            {/* 두 번째 줄 */}
            <div className={`flex items-center justify-center h-24 ${effectiveTheme === "light" ? "bg-white border border-gray-200" : "bg-[#2a2a2a]"} rounded-lg p-4`}>
              <Image
                src="/image/snuh.svg"
                alt="Seoul National University Hospital"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>
            <div className={`flex items-center justify-center h-24 ${effectiveTheme === "light" ? "bg-white border border-gray-200" : "bg-[#2a2a2a]"} rounded-lg p-4`}>
              <Image
                src="/image/knuh.svg"
                alt="Kyungpook National University Hospital"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>
            <div className={`flex items-center justify-center h-24 ${effectiveTheme === "light" ? "bg-white border border-gray-200" : "bg-[#2a2a2a]"} rounded-lg p-4`}>
              <Image
                src="/image/ajou.svg"
                alt="Ajou University Hospital"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>
            <div className={`flex items-center justify-center h-24 ${effectiveTheme === "light" ? "bg-white border border-gray-200" : "bg-[#2a2a2a]"} rounded-lg p-4`}>
              <Image
                src="/image/korea.svg"
                alt="Korea University Hospital"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>
          </div>

          {/* Footnote */}
          <div className="text-right mt-6">
            <p className="text-xs text-gray-500" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
              Journal logos are the property of their respective owners. Display does not imply endorsement or affiliation.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`${effectiveTheme === "light" ? "bg-white" : "bg-[#1a1a1a]"} py-20`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* 왼쪽: 비디오 */}
            <div className={`relative rounded-2xl overflow-hidden ${effectiveTheme === "light" ? "bg-gray-50 border-gray-200" : "bg-[#0d1117] border-gray-800"} border shadow-2xl`}>
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto"
              >
                <source src="/image/features.mp4" type="video/mp4" />
              </video>
            </div>

            {/* 오른쪽: 텍스트 */}
            <div className="space-y-6">
              <h2 className={`text-3xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
                {currentContent.features.title}
              </h2>
              <p className={`text-xl ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} leading-relaxed`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
                {currentContent.features.description}
              </p>
              <button
                onClick={() => router.push('/features')}
                className="flex items-center space-x-2 text-[#20808D] hover:text-[#2a9fad] transition-colors group"
              >
                <span className="text-lg font-medium">{currentContent.features.link}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Carousel Section */}
      <div className={`${effectiveTheme === "light" ? "bg-gray-50" : "bg-[#0a0a0a]"} py-32`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-16">
            {/* Title and Description - Left Aligned */}
            <div className="max-w-3xl">
              <h2 className={`text-3xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-6`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
                {currentContent.carousel.title}
              </h2>
              <p className={`text-lg ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} leading-relaxed`}>
                {currentContent.carousel.description}
              </p>
            </div>

            {/* Content Card Container */}
            <div className={`rounded-2xl border ${effectiveTheme === "light" ? "bg-white border-gray-200" : "bg-[#1a1a1a] border-gray-800"} shadow-xl p-6 md:p-8`}>
              <CarouselContent effectiveTheme={effectiveTheme} slides={currentContent.carousel.slides} />
            </div>
          </div>
        </div>
      </div>

      {/* Features2 Section */}
      <div className={`${effectiveTheme === "light" ? "bg-white" : "bg-[#1a1a1a]"} py-20`}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <h2 className={`text-3xl font-semibold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
              {currentContent.features2.title}
            </h2>
          </div>

          {/* 3 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className={`${effectiveTheme === "light" ? "bg-white border-gray-200 hover:border-gray-300" : "bg-[#1a1a1a] border-gray-800 hover:border-gray-700"} rounded-xl p-6 border transition-colors flex flex-col`}>
              <div className="flex-1">
                <h3 className={`text-base ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-3`}>
                  {currentContent.features2.cards[0].title}
                </h3>
                <p className={`text-base ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} leading-relaxed mb-4`}>
                  {currentContent.features2.cards[0].description}
                </p>
                <button className="flex items-center space-x-2 text-[#4DB8C4] hover:text-[#6dccd7] transition-colors group">
                  <span className="text-sm font-medium">{currentContent.features2.cards[0].link}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>

              {/* Image */}
              <div className={`mt-6 w-full h-64 rounded-lg overflow-hidden border ${effectiveTheme === "light" ? "border-gray-200" : "border-gray-800"}`}>
                <Image
                  src="/image/paper.png"
                  alt="Veterinary Research Papers"
                  width={400}
                  height={256}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Card 2 */}
            <div className={`${effectiveTheme === "light" ? "bg-white border-gray-200 hover:border-gray-300" : "bg-[#1a1a1a] border-gray-800 hover:border-gray-700"} rounded-xl p-6 border transition-colors flex flex-col`}>
              <div className="flex-1">
                <h3 className={`text-base ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-3`}>
                  {currentContent.features2.cards[1].title}
                </h3>
                <p className={`text-base ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} leading-relaxed mb-4`}>
                  {currentContent.features2.cards[1].description}
                </p>
                <button className="flex items-center space-x-2 text-[#4DB8C4] hover:text-[#6dccd7] transition-colors group">
                  <span className="text-sm font-medium">{currentContent.features2.cards[1].link}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>

              {/* Image */}
              <div className={`mt-6 w-full h-64 rounded-lg overflow-hidden border ${effectiveTheme === "light" ? "border-gray-200" : "border-gray-800"}`}>
                <Image
                  src="/image/vets.jpeg"
                  alt="Veterinarians at work"
                  width={400}
                  height={256}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Card 3 */}
            <div className={`${effectiveTheme === "light" ? "bg-white border-gray-200 hover:border-gray-300" : "bg-[#1a1a1a] border-gray-800 hover:border-gray-700"} rounded-xl p-6 border transition-colors flex flex-col`}>
              <div className="flex-1">
                <h3 className={`text-base ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-3`}>
                  {currentContent.features2.cards[2].title}
                </h3>
                <p className={`text-base ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} leading-relaxed mb-4`}>
                  {currentContent.features2.cards[2].description}
                </p>
                <button
                  onClick={() => router.push('/mission')}
                  className="flex items-center space-x-2 text-[#4DB8C4] hover:text-[#6dccd7] transition-colors group"
                >
                  <span className="text-sm font-medium">{currentContent.features2.cards[2].link}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>

              {/* Image */}
              <div className={`mt-6 w-full h-64 rounded-lg overflow-hidden border ${effectiveTheme === "light" ? "border-gray-200" : "border-gray-800"}`}>
                <Image
                  src="/image/welfare.webp"
                  alt="Animal Welfare"
                  width={400}
                  height={256}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Section */}
      <div className={`${effectiveTheme === "light" ? "bg-white" : "bg-[#0a0a0a]"} py-20`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Header */}
            <div className="lg:col-span-3">
              <h2 className={`text-3xl font-semibold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} sticky top-8`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
                {currentContent.blog.title}
              </h2>
            </div>

            {/* Right: Blog Posts */}
            <div className="lg:col-span-9">
              <div className="space-y-4">
                {isLoadingBlogs ? (
                  // Loading state
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`${effectiveTheme === "light" ? "bg-gray-50 border-gray-200" : "bg-[#0d0d0d] border-gray-800"} rounded-xl p-6 border animate-pulse`}>
                        <div className={`h-6 ${effectiveTheme === "light" ? "bg-gray-200" : "bg-gray-800"} rounded w-3/4 mb-2`}></div>
                        <div className={`h-4 ${effectiveTheme === "light" ? "bg-gray-200" : "bg-gray-800"} rounded w-full mb-1`}></div>
                        <div className={`h-4 ${effectiveTheme === "light" ? "bg-gray-200" : "bg-gray-800"} rounded w-2/3 mb-3`}></div>
                        <div className={`h-3 ${effectiveTheme === "light" ? "bg-gray-200" : "bg-gray-800"} rounded w-1/4`}></div>
                      </div>
                    ))}
                  </div>
                ) : blogPosts.length > 0 ? (
                  // Display actual blog posts
                  blogPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => router.push(`/blog/${post.slug}`)}
                      className={`group cursor-pointer ${effectiveTheme === "light" ? "bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300" : "bg-[#0d0d0d] hover:bg-[#151515] border-gray-800 hover:border-gray-700"} rounded-xl p-6 border transition-all duration-200`}
                    >
                      <h3 className={`text-lg font-semibold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-2 group-hover:text-[#4DB8C4] transition-colors`}>
                        {post.title}
                      </h3>
                      {post.subtitle && (
                        <p className={`${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} mb-3 leading-relaxed text-sm`}>
                          {post.subtitle}
                        </p>
                      )}
                      <p className={`text-xs ${effectiveTheme === "light" ? "text-gray-500" : "text-gray-500"}`}>
                        {post.category} · {post.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  ))
                ) : (
                  // No posts found
                  <div className={`${effectiveTheme === "light" ? "bg-gray-50 border-gray-200" : "bg-[#0d0d0d] border-gray-800"} rounded-xl p-6 border text-center`}>
                    <p className={`${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>{currentContent.blog.noPosts}</p>
                  </div>
                )}
              </div>

              {/* View More Link */}
              <div className="mt-10">
                <button
                  onClick={() => router.push('/blog')}
                  className="flex items-center space-x-2 text-[#4DB8C4] hover:text-[#6dccd7] transition-colors group"
                >
                  <span className="text-base font-medium">{currentContent.blog.viewMore}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className={`${effectiveTheme === "light" ? "bg-gray-50" : "bg-[#1a1a1a]"} py-24`}>
        <div className="max-w-5xl mx-auto px-6">
          <h2 className={`text-3xl md:text-4xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-12`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
            {currentContent.faq.title}
          </h2>

          <div className="space-y-4">
            {currentContent.faq.items.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} theme={effectiveTheme} />
            ))}
          </div>
        </div>
      </div>

      {/* Banner Section */}
      <div className={`${effectiveTheme === "light" ? "bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50" : "bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]"} py-32`}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className={`text-5xl md:text-6xl font-bold mb-16 ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
            {currentContent.banner.title}
          </h2>
          <button className="group relative px-8 py-3 bg-white text-black text-base font-semibold rounded-full hover:bg-[#4DB8C4] hover:text-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#4DB8C4]/20 overflow-hidden">
            <span className="relative z-10 flex items-center justify-center space-x-2">
              <span>{currentContent.banner.button}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* 로그인 모달 */}
      {showLoginModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className={`${effectiveTheme === "light" ? "bg-white border-gray-200" : "bg-[#1a1a1a] border-gray-700"} rounded-2xl p-8 w-full max-w-md mx-4 relative border`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowLoginModal(false)}
              className={`absolute top-4 right-4 ${effectiveTheme === "light" ? "text-gray-500 hover:text-gray-700" : "text-gray-400 hover:text-gray-200"}`}
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
                <span className={`text-2xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>Ruleout</span>
              </div>
              <h2 className={`text-3xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-2`}>
                Log in or Sign up
              </h2>
              <p className={`${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                Choose your work email. <a href="#" className="text-[#20808D] hover:underline">Why is this needed?</a>
              </p>
            </div>

            {/* Login Options */}
            <div className="space-y-3">
              {/* Google Login */}
              <button
                onClick={handleGoogleLogin}
                className={`w-full flex items-center justify-center px-6 py-4 border-2 ${effectiveTheme === "light" ? "border-gray-300 hover:border-gray-400 bg-gray-50" : "border-gray-700 hover:border-gray-600 bg-[#2a2a2a]"} rounded-lg transition-colors`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className={`font-medium ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>Continue with Google</span>
                </div>
              </button>

              {/* Microsoft Login */}
              <button
                onClick={() => {/* Microsoft 로그인 구현 예정 */}}
                className={`w-full flex items-center justify-center px-6 py-4 border-2 ${effectiveTheme === "light" ? "border-gray-300 hover:border-gray-400 bg-gray-50" : "border-gray-700 hover:border-gray-600 bg-[#2a2a2a]"} rounded-lg transition-colors`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 23 23">
                    <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                  <span className={`font-medium ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>Continue with Microsoft</span>
                </div>
              </button>

              {/* Apple Login */}
              <button
                onClick={() => {/* Apple 로그인 구현 예정 */}}
                className={`w-full flex items-center justify-center px-6 py-4 border-2 ${effectiveTheme === "light" ? "border-gray-300 hover:border-gray-400 bg-gray-50" : "border-gray-700 hover:border-gray-600 bg-[#2a2a2a]"} rounded-lg transition-colors`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill={effectiveTheme === "light" ? "black" : "white"}>
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span className={`font-medium ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>Continue with Apple</span>
                </div>
              </button>

              {/* Divider */}
              <div className="flex items-center my-4">
                <div className={`flex-1 border-t ${effectiveTheme === "light" ? "border-gray-300" : "border-gray-700"}`}></div>
                <span className={`px-4 ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>or</span>
                <div className={`flex-1 border-t ${effectiveTheme === "light" ? "border-gray-300" : "border-gray-700"}`}></div>
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
