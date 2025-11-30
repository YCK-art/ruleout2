"use client";

import { useState } from "react";
import { Shield, Lock, Cloud, Search, Smartphone, FileText, Award, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Toolbar from "@/app/components/Toolbar";
import Footer from '@/app/components/Footer';
import { signInWithGoogle } from "@/lib/auth";
import { useLanguage } from '@/contexts/LanguageContext';

export default function SecurityPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  const content = {
    English: {
      pageTitle: "SECURITY",
      heroTitle: "Security is at the heart of everything we do",
      heroSubtitle: "Security is a core principle of Ruleout—from our tech to our culture. We're SOC 2 Type I & II and Privacy Law compliant.",
      trustCenterBtn: "Visit the trust center",
      vulnerabilityBtn: "Vulnerability Disclosure Policy",
      howWeThinkTitle: "How we think about security",
      foundThreatTitle: "Found a security threat?",
      foundThreatSubtitle: "We reward those who help us stay secure.",
      reportThreatBtn: "Report security threat",
      vetDataTitle: "Veterinary Medical Data Protection",
      vetDataDesc: "Ruleout protects all veterinary clinical data including patient records, test results, and prescriptions with the highest security standards. Our platform gives veterinarians peace of mind when searching clinical guidelines.",
      encryption: "256-bit",
      encryptionLabel: "AES Encryption",
      monitoring: "24/7",
      monitoringLabel: "Security Monitoring",
      compliance: "100%",
      complianceLabel: "Compliance",
      loginTitle: "Log in or Sign up",
      loginSubtitle: "Choose your work email.",
      whyNeeded: "Why is this needed?",
      continueGoogle: "Continue with Google",
      continueMicrosoft: "Continue with Microsoft",
      continueApple: "Continue with Apple",
      continueEmail: "Continue with Email",
      or: "or",
      securityFeatures: [
        {
          title: "Encryption of sensitive data",
          description: "We encrypt your data using AES-256, the gold standard in encryption technology and safeguard passwords using secure cryptographic hash (SHA-256)."
        },
        {
          title: "Trusted cloud security",
          description: "We leverage industry-leading cloud providers to ensure your data is safe. This means global accessibility with enterprise-grade protection."
        },
        {
          title: "Penetration testing and scanning",
          description: "We conduct annual third-party penetration tests and share results via our Trust center. Weekly scans keep our product resilient against vulnerabilities."
        },
        {
          title: "Endpoint security",
          description: "We ensure our devices run the latest OS and app versions within a month of release, with security updates applied as soon as available."
        }
      ],
      securityThreats: [
        {
          title: "Responsible vulnerability disclosure",
          description: "Our policy encourages ethical reporting of vulnerabilities. We assess and respond quickly—security concerns are our top priority."
        },
        {
          title: "Reward eligibility",
          description: "Qualifying vulnerabilities may earn you a place in our bug bounty program. We recognize discoveries that enhance our security."
        }
      ]
    },
    한국어: {
      pageTitle: "보안",
      heroTitle: "보안은 우리가 하는 모든 일의 핵심입니다",
      heroSubtitle: "보안은 Ruleout의 핵심 원칙입니다. 기술부터 문화까지 모든 것이 보안에 기반합니다. 우리는 SOC 2 Type I & II 및 개인정보보호법을 준수합니다.",
      trustCenterBtn: "보안 센터 방문",
      vulnerabilityBtn: "취약점 공개 정책",
      howWeThinkTitle: "보안에 대한 우리의 접근법",
      foundThreatTitle: "보안 위협을 발견하셨나요?",
      foundThreatSubtitle: "우리의 보안을 강화하는 분들께 보상을 제공합니다.",
      reportThreatBtn: "보안 위협 신고",
      vetDataTitle: "수의학 의료 데이터 보호",
      vetDataDesc: "Ruleout은 환자 기록, 검사 결과, 처방전을 포함한 모든 수의학 임상 데이터를 최고 수준의 보안 표준으로 보호합니다. 우리 플랫폼은 수의사가 임상 가이드라인을 검색할 때 안심할 수 있도록 합니다.",
      encryption: "256비트",
      encryptionLabel: "AES 암호화",
      monitoring: "연중무휴",
      monitoringLabel: "보안 모니터링",
      compliance: "100%",
      complianceLabel: "규정 준수",
      loginTitle: "로그인 또는 회원가입",
      loginSubtitle: "업무용 이메일을 선택하세요.",
      whyNeeded: "왜 필요한가요?",
      continueGoogle: "Google로 계속하기",
      continueMicrosoft: "Microsoft로 계속하기",
      continueApple: "Apple로 계속하기",
      continueEmail: "이메일로 계속하기",
      or: "또는",
      securityFeatures: [
        {
          title: "민감한 데이터의 암호화",
          description: "업계 표준인 AES-256 암호화 기술을 사용하여 데이터를 보호하고, 안전한 암호화 해시(SHA-256)를 사용하여 비밀번호를 보호합니다."
        },
        {
          title: "신뢰할 수 있는 클라우드 보안",
          description: "업계 최고의 클라우드 제공업체를 활용하여 데이터를 안전하게 보호합니다. 이는 엔터프라이즈급 보호와 함께 전 세계적인 접근성을 의미합니다."
        },
        {
          title: "침투 테스트 및 스캐닝",
          description: "연간 제3자 침투 테스트를 수행하고 결과를 보안 센터를 통해 공유합니다. 매주 스캔을 실시하여 제품이 취약점에 대해 복원력을 유지하도록 합니다."
        },
        {
          title: "엔드포인트 보안",
          description: "모든 장치가 출시 후 한 달 이내에 최신 OS 및 앱 버전을 실행하도록 하며, 보안 업데이트는 사용 가능한 즉시 적용됩니다."
        }
      ],
      securityThreats: [
        {
          title: "책임 있는 취약점 공개",
          description: "우리의 정책은 윤리적인 취약점 보고를 장려합니다. 신속하게 평가하고 대응하며, 보안 문제는 우리의 최우선 과제입니다."
        },
        {
          title: "보상 자격",
          description: "자격을 갖춘 취약점 발견자는 버그 바운티 프로그램에 참여할 수 있습니다. 우리의 보안을 강화하는 발견에 대해 보상합니다."
        }
      ]
    },
    日本語: {
      pageTitle: "セキュリティ",
      heroTitle: "セキュリティは私たちのすべての業務の中心です",
      heroSubtitle: "セキュリティはRuleoutの中核原則です。技術から文化まで、すべてがセキュリティに基づいています。SOC 2 Type I & IIおよびプライバシー法に準拠しています。",
      trustCenterBtn: "トラストセンターを訪問",
      vulnerabilityBtn: "脆弱性開示ポリシー",
      howWeThinkTitle: "セキュリティに対する私たちの考え方",
      foundThreatTitle: "セキュリティの脅威を発見しましたか？",
      foundThreatSubtitle: "セキュリティ強化にご協力いただいた方に報酬を提供します。",
      reportThreatBtn: "セキュリティ脅威を報告",
      vetDataTitle: "獣医医療データ保護",
      vetDataDesc: "Ruleoutは、患者記録、検査結果、処方箋を含むすべての獣医臨床データを最高レベルのセキュリティ基準で保護します。当プラットフォームは、獣医師が臨床ガイドラインを検索する際に安心感を提供します。",
      encryption: "256ビット",
      encryptionLabel: "AES暗号化",
      monitoring: "24時間365日",
      monitoringLabel: "セキュリティ監視",
      compliance: "100%",
      complianceLabel: "コンプライアンス",
      loginTitle: "ログインまたはサインアップ",
      loginSubtitle: "業務用メールを選択してください。",
      whyNeeded: "なぜ必要ですか？",
      continueGoogle: "Googleで続行",
      continueMicrosoft: "Microsoftで続行",
      continueApple: "Appleで続行",
      continueEmail: "メールで続行",
      or: "または",
      securityFeatures: [
        {
          title: "機密データの暗号化",
          description: "業界標準のAES-256暗号化技術を使用してデータを保護し、安全な暗号化ハッシュ（SHA-256）を使用してパスワードを保護します。"
        },
        {
          title: "信頼できるクラウドセキュリティ",
          description: "業界をリードするクラウドプロバイダーを活用してデータを安全に保護します。これは、エンタープライズグレードの保護とグローバルなアクセス性を意味します。"
        },
        {
          title: "侵入テストとスキャン",
          description: "年次で第三者侵入テストを実施し、結果をトラストセンターを通じて共有します。毎週のスキャンにより、製品が脆弱性に対して回復力を維持します。"
        },
        {
          title: "エンドポイントセキュリティ",
          description: "すべてのデバイスがリリース後1か月以内に最新のOSとアプリバージョンを実行するようにし、セキュリティアップデートは利用可能になり次第適用します。"
        }
      ],
      securityThreats: [
        {
          title: "責任ある脆弱性の開示",
          description: "私たちのポリシーは、倫理的な脆弱性の報告を奨励します。迅速に評価し対応します。セキュリティ上の懸念は最優先事項です。"
        },
        {
          title: "報酬の資格",
          description: "適格な脆弱性の発見者は、バグバウンティプログラムに参加できます。セキュリティを強化する発見に対して報酬を提供します。"
        }
      ]
    }
  };

  const currentContent = content[language as keyof typeof content];

  const securityFeatures = currentContent.securityFeatures.map((feature, index) => ({
    icon: [Lock, Cloud, Search, Smartphone][index],
    title: feature.title,
    description: feature.description
  }));

  const complianceItems = [
    { name: "SOC 2", type: "TYPE I" },
    { name: "SOC 2", type: "TYPE II" },
    { name: "PRIVACY", type: "LAW" },
  ];

  const securityThreatItems = currentContent.securityThreats.map((threat, index) => ({
    icon: [FileText, Award][index],
    title: threat.title,
    description: threat.description
  }));

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Toolbar */}
      <Toolbar onLoginClick={handleLogin} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-24 pt-32">
        {/* Hero Section */}
        <div className="mb-20 flex items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <p className="text-[#4DB8C4] text-xl font-medium mb-6" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>{currentContent.pageTitle}</p>
            <h1 className="text-5xl font-bold text-white leading-tight mb-6" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
              {currentContent.heroTitle.split(' ').slice(0, -6).join(' ')} <span className="italic">{currentContent.heroTitle.split(' ').slice(-6, -5).join(' ')}</span>
              <br />
              {currentContent.heroTitle.split(' ').slice(-5).join(' ')}
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-8" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
              {currentContent.heroSubtitle}
            </p>
            <div className="flex items-center gap-4">
              <button className="px-6 py-3 bg-[#20808D] text-white font-medium rounded-lg hover:bg-[#1a6b77] transition-colors">
                {currentContent.trustCenterBtn}
              </button>
              <button className="px-6 py-3 text-gray-300 hover:text-white transition-colors">
                {currentContent.vulnerabilityBtn}
              </button>
            </div>
          </div>

          {/* Compliance Badges */}
          <div className="hidden lg:flex items-center gap-6">
            {complianceItems.map((item, index) => (
              <div
                key={index}
                className="relative w-40 h-40 rounded-full flex flex-col items-center justify-center hover:scale-105 transition-transform"
                style={{
                  background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
                  boxShadow: '12px 12px 24px #0f0f0f, -12px -12px 24px #353535',
                  transform: `rotate(${index * 15 - 15}deg) translateY(${index * 10}px)`,
                }}
              >
                {/* Inner highlight for 3D effect */}
                <div
                  className="absolute inset-2 rounded-full"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.05), transparent)',
                  }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="flex items-center mb-1">
                    {[...Array(item.type ? 3 : 5)].map((_, i) => (
                      <span key={i} className="text-yellow-500 text-xs">★</span>
                    ))}
                  </div>
                  <p className="text-gray-200 text-2xl font-bold">{item.name}</p>
                  {item.type && (
                    <p className="text-gray-400 text-xs uppercase tracking-wider">{item.type}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How we think about security */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white mb-12" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>{currentContent.howWeThinkTitle}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-8 bg-[#252525] rounded-2xl hover:bg-[#2a2a2a] transition-all group relative overflow-hidden"
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#20808D]/20 to-[#4DB8C4]/10 flex items-center justify-center mb-6 relative">
                    <Icon className="w-10 h-10 text-[#4DB8C4]" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 relative">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed relative">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Found a security threat */}
        <div className="mb-20">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-3">{currentContent.foundThreatTitle}</h2>
              <p className="text-gray-400 text-lg">{currentContent.foundThreatSubtitle}</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-[#4DB8C4]" />
          </div>

          <button className="text-[#4DB8C4] font-medium flex items-center gap-2 mb-8 hover:gap-4 transition-all">
            {currentContent.reportThreatBtn}
            <span>→</span>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityThreatItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="p-6 bg-[#252525] rounded-xl hover:bg-[#2a2a2a] transition-all group relative overflow-hidden"
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  <div className="flex items-center gap-3 mb-4 relative">
                    <div className="w-10 h-10 rounded-lg bg-[#20808D]/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#4DB8C4]" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed relative">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Security Information */}
        <div className="p-12 bg-gradient-to-br from-[#20808D]/10 to-[#4DB8C4]/10 rounded-2xl border border-[#20808D]/20">
          <div className="flex items-center gap-4 mb-6">
            <Shield className="w-12 h-12 text-[#4DB8C4]" />
            <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>{currentContent.vetDataTitle}</h2>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed mb-6" style={{ fontFamily: "'TikTok Sans', sans-serif" }}>
            {currentContent.vetDataDesc}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#1a1a1a]/50 rounded-lg">
              <p className="text-[#4DB8C4] font-bold text-2xl mb-1">{currentContent.encryption}</p>
              <p className="text-gray-400 text-sm">{currentContent.encryptionLabel}</p>
            </div>
            <div className="p-4 bg-[#1a1a1a]/50 rounded-lg">
              <p className="text-[#4DB8C4] font-bold text-2xl mb-1">{currentContent.monitoring}</p>
              <p className="text-gray-400 text-sm">{currentContent.monitoringLabel}</p>
            </div>
            <div className="p-4 bg-[#1a1a1a]/50 rounded-lg">
              <p className="text-[#4DB8C4] font-bold text-2xl mb-1">{currentContent.compliance}</p>
              <p className="text-gray-400 text-sm">{currentContent.complianceLabel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

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
                {currentContent.loginTitle}
              </h2>
              <p className="text-gray-400">
                {currentContent.loginSubtitle} <a href="#" className="text-[#20808D] hover:underline">{currentContent.whyNeeded}</a>
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
                  <span className="text-white font-medium">{currentContent.continueGoogle}</span>
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
                  <span className="text-white font-medium">{currentContent.continueMicrosoft}</span>
                </div>
              </button>

              <button className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-700 rounded-lg hover:border-gray-600 transition-colors bg-[#2a2a2a]">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span className="text-white font-medium">{currentContent.continueApple}</span>
                </div>
              </button>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-700"></div>
                <span className="px-4 text-gray-400">{currentContent.or}</span>
                <div className="flex-1 border-t border-gray-700"></div>
              </div>

              <button className="w-full px-6 py-4 bg-[#20808D] text-white rounded-lg hover:bg-[#1a6a78] transition-colors font-medium">
                {currentContent.continueEmail}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
