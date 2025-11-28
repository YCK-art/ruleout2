"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Monitor, Sun, Moon, Globe } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithGoogle } from "@/lib/auth";
import Toolbar from "@/app/components/Toolbar";
import { useTheme } from "@/contexts/ThemeContext";

// Count-up animation hook
function useCountUp(targetValue: number, duration: number = 500) {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const prevTargetRef = useRef(targetValue);

  useEffect(() => {
    if (prevTargetRef.current === targetValue) return;

    const startValue = prevTargetRef.current;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);

      const currentValue = Math.round(startValue + (targetValue - startValue) * easedProgress);
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevTargetRef.current = targetValue;
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration]);

  return displayValue;
}

export default function PricingPage() {
  const router = useRouter();
  const { themeMode, setThemeMode, effectiveTheme } = useTheme();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [showLoginModal, setShowLoginModal] = useState(false);
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

  const getButtonStyle = (isPrimary: boolean) => {
    if (isPrimary) {
      return "bg-[#20808D] hover:bg-[#1a6a78] text-white";
    }
    return effectiveTheme === "light"
      ? "border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-900"
      : "border border-gray-700 hover:bg-gray-800 text-white";
  };

  const plans = [
    {
      name: "Free",
      monthlyPrice: 0,
      yearlyPricePerMonth: 0,
      description: "Get started with basic features",
      features: [
        "One-week Pro trial",
        "Limited Agent requests",
        "Limited Tab completions"
      ],
      buttonText: "Get Started",
      buttonStyle: getButtonStyle(false),
      onClick: () => setShowLoginModal(true)
    },
    {
      name: "Pro",
      monthlyPrice: 20,
      yearlyPricePerMonth: 12,
      description: "Everything in Free, plus:",
      features: [
        "Extended limits on Agent",
        "Unlimited Tab completions",
        "Background Agents",
        "Maximum context windows"
      ],
      buttonText: "Get Pro",
      buttonStyle: getButtonStyle(true),
      recommended: true
    },
    {
      name: "Max",
      monthlyPrice: 60,
      yearlyPricePerMonth: 45,
      description: "Everything in Pro, plus:",
      features: [
        "3x usage on all OpenAI, Claude, Gemini models",
        "Priority access to new features"
      ],
      buttonText: "Get Max",
      buttonStyle: getButtonStyle(false)
    },
    {
      name: "Enterprise",
      monthlyPrice: null,
      yearlyPricePerMonth: null,
      description: "Everything in Max, plus:",
      features: [
        "Centralized billing",
        "Admin dashboard with analytics",
        "Priority support",
        "Custom integrations"
      ],
      buttonText: "Contact Sales",
      buttonStyle: getButtonStyle(false),
      isEnterprise: true
    }
  ];

  return (
    <div className={`min-h-screen ${effectiveTheme === "light" ? "bg-white text-gray-900" : "bg-[#1a1a1a] text-white"}`}>
      {/* Toolbar */}
      <Toolbar onLoginClick={handleLogin} />

      {/* Pricing Content */}
      <div className="max-w-7xl mx-auto px-6 py-20 pt-32" style={{ marginTop: '20px' }}>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-5xl font-bold mb-4 ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>Pricing</h1>
          <p className={`text-xl ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} mb-10`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>We are committed to a better life for animals.</p>

          {/* Billing Segment Control */}
          <div className={`inline-flex items-center ${effectiveTheme === "light" ? "bg-gray-100" : "bg-[#2a2a2a]"} rounded-xl p-1 mb-4`}>
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                billingPeriod === "monthly"
                  ? effectiveTheme === "light" ? "bg-white text-gray-900 shadow-sm" : "bg-[#3a3a3a] text-white"
                  : effectiveTheme === "light" ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                billingPeriod === "yearly"
                  ? effectiveTheme === "light" ? "bg-white text-gray-900 shadow-sm" : "bg-[#3a3a3a] text-white"
                  : effectiveTheme === "light" ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Plans and Pricing Section */}
        <div className="mb-16 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
            {plans.map((plan, index) => {
              const price = billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPricePerMonth;
              const animatedPrice = useCountUp(price || 0);
              const discount = plan.monthlyPrice && plan.monthlyPrice > 0
                ? Math.round((1 - (plan.yearlyPricePerMonth || 0) / plan.monthlyPrice) * 100)
                : 0;

              return (
                <div
                  key={index}
                  className={`${
                    effectiveTheme === "light"
                      ? plan.recommended
                        ? "bg-gradient-to-br from-gray-50 via-white to-gray-50 border-[#20808D]"
                        : "bg-gradient-to-br from-gray-50 via-white to-gray-100 border-gray-300"
                      : plan.recommended
                        ? "bg-gradient-to-br from-[#252525] via-[#212121] to-[#1a1a1a] border-[#20808D]"
                        : "bg-gradient-to-br from-[#252525] via-[#212121] to-[#181818] border-gray-700"
                  } border-2 rounded-2xl p-8 relative flex flex-col`}
                  style={{
                    boxShadow: plan.recommended
                      ? effectiveTheme === "light"
                        ? "0 20px 50px -12px rgba(32, 128, 141, 0.15), 0 8px 16px -8px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.8)"
                        : "0 20px 50px -12px rgba(32, 128, 141, 0.25), 0 8px 16px -8px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.1)"
                      : effectiveTheme === "light"
                        ? "0 20px 50px -12px rgba(0, 0, 0, 0.08), 0 8px 16px -8px rgba(0, 0, 0, 0.06)"
                        : "0 20px 50px -12px rgba(0, 0, 0, 0.4), 0 8px 16px -8px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.05), inset 0 -2px 4px rgba(0, 0, 0, 0.2)",
                    transform: "perspective(1000px) rotateX(2deg)",
                    transformStyle: "preserve-3d"
                  }}
                >

                  <div className="mb-6 relative z-20">
                    <h3 className={`text-2xl font-bold mb-2 ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>{plan.name}</h3>
                    <div className="flex items-baseline gap-3 mb-2">
                      {plan.isEnterprise ? (
                        <div className="flex items-baseline">
                          <span className={`text-4xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>Let's Talk</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-baseline">
                            <span className={`text-4xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>${animatedPrice}</span>
                            {price && price > 0 && (
                              <span className={`ml-2 ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>/mo.</span>
                            )}
                          </div>
                          {billingPeriod === "yearly" && discount > 0 && (
                            <span className="text-[#20808D] text-sm font-semibold">
                              {discount}% off
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    {plan.name === "Free" && <p className={`text-sm ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>Includes:</p>}
                    {plan.name !== "Free" && <p className={`text-sm ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>{plan.description}</p>}
                  </div>

                  <div className="mb-8 space-y-3 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-[#20808D] mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={plan.onClick}
                    className={`w-full py-3 rounded-lg font-medium transition-all duration-200 relative z-20 ${plan.buttonStyle}`}
                    style={{
                      boxShadow: plan.buttonStyle.includes('bg-[#20808D]')
                        ? '0 4px 14px rgba(32, 128, 141, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
                        : '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
                      transform: 'translateZ(10px)',
                    }}
                    onMouseEnter={(e) => {
                      if (plan.buttonStyle.includes('bg-[#20808D]')) {
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(32, 128, 141, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-2px) translateZ(10px)';
                      } else {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-1px) translateZ(10px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (plan.buttonStyle.includes('bg-[#20808D]')) {
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(32, 128, 141, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)';
                      } else {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2)';
                      }
                      e.currentTarget.style.transform = 'translateZ(10px)';
                    }}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Compare Plans Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h2 className={`text-5xl font-bold text-center mb-16 ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>Compare plans</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead>
              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200" : "border-gray-800"}`}>
                <th className={`text-left py-6 px-4 font-normal ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} w-1/6`}></th>

                {/* Free Plan */}
                <th className="text-center py-6 px-4">
                  <div className="flex flex-col items-center gap-4">
                    <div className={`font-bold text-xl ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>Free</div>
                    <div className={`text-sm ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                      <span className={`text-2xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>$0</span> per month
                    </div>
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className={`w-full px-6 py-2.5 border-2 ${
                        effectiveTheme === "light"
                          ? "border-gray-300 hover:border-gray-400 text-gray-900 hover:bg-gray-50"
                          : "border-gray-700 hover:border-gray-600 text-white hover:bg-[#252525]"
                      } rounded-lg transition-all duration-200 font-medium`}
                      style={{
                        boxShadow: effectiveTheme === "light"
                          ? '0 2px 8px rgba(0, 0, 0, 0.1)'
                          : '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      Sign up
                    </button>
                  </div>
                </th>

                {/* Pro Plan */}
                <th className="text-center py-6 px-4">
                  <div className="flex flex-col items-center gap-4">
                    <div className={`font-bold text-xl ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>Pro</div>
                    <div className={`text-sm ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                      <span className={`text-2xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>${billingPeriod === "monthly" ? 20 : 12}</span> per month
                    </div>
                    <button
                      className="w-full px-6 py-2.5 bg-[#20808D] rounded-lg hover:bg-[#1a6b77] transition-all duration-200 text-white font-medium"
                      style={{
                        boxShadow: '0 4px 14px rgba(32, 128, 141, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      Sign up
                    </button>
                  </div>
                </th>

                {/* Max Plan */}
                <th className="text-center py-6 px-4">
                  <div className="flex flex-col items-center gap-4">
                    <div className={`font-bold text-xl ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>Max</div>
                    <div className={`text-sm ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                      <span className={`text-2xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>${billingPeriod === "monthly" ? 60 : 45}</span> per month
                    </div>
                    <button
                      className={`w-full px-6 py-2.5 border-2 ${
                        effectiveTheme === "light"
                          ? "border-gray-300 hover:border-gray-400 text-gray-900 hover:bg-gray-50"
                          : "border-gray-700 hover:border-gray-600 text-white hover:bg-[#252525]"
                      } rounded-lg transition-all duration-200 font-medium`}
                      style={{
                        boxShadow: effectiveTheme === "light"
                          ? '0 2px 8px rgba(0, 0, 0, 0.1)'
                          : '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      Sign up
                    </button>
                  </div>
                </th>

                {/* Enterprise Plan */}
                <th className="text-center py-6 px-4">
                  <div className="flex flex-col items-center gap-4">
                    <div className={`font-bold text-xl ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>Enterprise</div>
                    <div className={`text-sm h-[40px] flex items-center justify-center ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                      <span className={`text-lg font-semibold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>Contact Us</span>
                    </div>
                    <button
                      className={`w-full px-6 py-2.5 border-2 ${
                        effectiveTheme === "light"
                          ? "border-gray-300 hover:border-gray-400 text-gray-900 hover:bg-gray-50"
                          : "border-gray-700 hover:border-gray-600 text-white hover:bg-[#252525]"
                      } rounded-lg transition-all duration-200 font-medium`}
                      style={{
                        boxShadow: effectiveTheme === "light"
                          ? '0 2px 8px rgba(0, 0, 0, 0.1)'
                          : '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      Contact us
                    </button>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Cascade Section */}
              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200" : "border-gray-800"}`}>
                <td colSpan={5} className="py-4 px-4">
                  <div className={`font-semibold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>Cascade</div>
                </td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>Message Limits</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>15 messages/mo</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>300 messages/mo</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>Unlimited</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>Unlimited</td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>Add-on prompt credits</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>$10 for 250 credits</td>
                <td className={`py-4 px-4 text-center text-sm ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>Add-on credits available for purchase</td>
                <td className={`py-4 px-4 text-center text-sm ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>Add-on credits available for purchase</td>
              </tr>

              {/* Features Section */}
              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200" : "border-gray-800"}`}>
                <td colSpan={5} className="py-4 px-4">
                  <div className={`font-semibold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>Features</div>
                </td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>Tab</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>Unlimited</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>Unlimited</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>Unlimited</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>Unlimited</td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>Previews</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>Deploys</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>All premium models</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>Fast Context</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>SWE-15 model</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>Windsurf Reviews</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>Centralized billing</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>Admin dashboard with analytics</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>Priority support</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <footer className={`relative ${effectiveTheme === "light" ? "bg-white" : "bg-[#0a0a0a]"}`}>
        {/* Gradient transition */}
        <div className={`absolute top-0 left-0 right-0 h-32 ${effectiveTheme === "light" ? "bg-gradient-to-b from-white to-white" : "bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]"} pointer-events-none`} />
        <div className="max-w-7xl mx-auto px-6 py-16 relative">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-12">
            {/* Product Column */}
            <div>
              <h3 className={`${effectiveTheme === "light" ? "text-gray-900" : "text-white"} font-semibold mb-4`}>Product</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Features
                  </a>
                </li>
                <li>
                  <button onClick={() => router.push('/pricing')} className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Pricing
                  </button>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className={`${effectiveTheme === "light" ? "text-gray-900" : "text-white"} font-semibold mb-4`}>Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Documentation
                  </a>
                </li>
                <li>
                  <button onClick={() => router.push('/blog')} className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Blog
                  </button>
                </li>
                <li>
                  <a href="#" className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className={`${effectiveTheme === "light" ? "text-gray-900" : "text-white"} font-semibold mb-4`}>Company</h3>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => router.push('/mission')} className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Mission
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/careers')} className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Careers
                  </button>
                </li>
                <li>
                  <a href="#" className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className={`${effectiveTheme === "light" ? "text-gray-900" : "text-white"} font-semibold mb-4`}>Legal</h3>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => router.push('/terms')} className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Terms of Use
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/privacy')} className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/security')} className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Security
                  </button>
                </li>
              </ul>
            </div>

            {/* Connect Column */}
            <div>
              <h3 className={`${effectiveTheme === "light" ? "text-gray-900" : "text-white"} font-semibold mb-4`}>Connect</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className={`${effectiveTheme === "light" ? "text-gray-600 hover:text-[#4DB8C4]" : "text-gray-400 hover:text-[#4DB8C4]"} transition-colors`}>
                    YouTube
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className={`pt-8 border-t ${effectiveTheme === "light" ? "border-gray-200" : "border-gray-800"} flex flex-col md:flex-row items-center justify-between gap-4`}>
            {/* Left: Copyright */}
            <p className={`${effectiveTheme === "light" ? "text-gray-500" : "text-gray-500"} text-sm`}>
              © 2025 Ruleout. All rights reserved.
            </p>

            {/* Right: Theme Selector & Language */}
            <div className="flex items-center gap-4">
              {/* Theme Selector */}
              <div className={`flex items-center ${effectiveTheme === "light" ? "bg-gray-100 border-gray-200" : "bg-[#1a1a1a] border-gray-800"} rounded-lg p-1 border`}>
                <button
                  onClick={() => setThemeMode("system")}
                  className={`p-2 rounded transition-colors ${
                    themeMode === "system"
                      ? effectiveTheme === "light" ? "bg-white text-gray-900 shadow-sm" : "bg-gray-700 text-white"
                      : effectiveTheme === "light" ? "text-gray-500 hover:text-gray-900" : "text-gray-400 hover:text-white"
                  }`}
                  title="System"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setThemeMode("light")}
                  className={`p-2 rounded transition-colors ${
                    themeMode === "light"
                      ? effectiveTheme === "light" ? "bg-white text-gray-900 shadow-sm" : "bg-gray-700 text-white"
                      : effectiveTheme === "light" ? "text-gray-500 hover:text-gray-900" : "text-gray-400 hover:text-white"
                  }`}
                  title="Light"
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setThemeMode("dark")}
                  className={`p-2 rounded transition-colors ${
                    themeMode === "dark"
                      ? effectiveTheme === "light" ? "bg-white text-gray-900 shadow-sm" : "bg-gray-700 text-white"
                      : effectiveTheme === "light" ? "text-gray-500 hover:text-gray-900" : "text-gray-400 hover:text-white"
                  }`}
                  title="Dark"
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>

              {/* Language Selector */}
              <div className="relative">
                <button className={`flex items-center gap-2 px-3 py-2 ${effectiveTheme === "light" ? "bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900" : "bg-[#1a1a1a] border-gray-800 text-gray-400 hover:text-white"} rounded-lg border transition-colors`}>
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">{language}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

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
