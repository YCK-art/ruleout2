"use client";

import { useState, useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

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

export default function UpgradePage() {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

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
      buttonText: "Current Plan",
      buttonStyle: "border border-gray-700 bg-gray-800 cursor-not-allowed",
      disabled: true
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
      buttonText: "Upgrade to Pro",
      buttonStyle: "bg-[#20808D] hover:bg-[#1a6a78] text-white",
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
      buttonText: "Upgrade to Max",
      buttonStyle: "border border-gray-700 hover:bg-gray-800"
    }
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-10">Upgrade Your Plan</h1>

          {/* Billing Segment Control */}
          <div className="inline-flex items-center bg-[#2a2a2a] rounded-lg p-1 mb-4">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                billingPeriod === "monthly"
                  ? "bg-[#3a3a3a] text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                billingPeriod === "yearly"
                  ? "bg-[#3a3a3a] text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Plans Section */}
        <div className="mb-16 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => {
              const price = billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPricePerMonth;
              const animatedPrice = useCountUp(price);
              const discount = plan.monthlyPrice > 0
                ? Math.round((1 - plan.yearlyPricePerMonth / plan.monthlyPrice) * 100)
                : 0;

              return (
                <div
                  key={index}
                  className={`bg-[#212121] border ${
                    plan.recommended ? "border-[#20808D]" : "border-gray-800"
                  } rounded-2xl p-8 relative flex flex-col`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-[#20808D] text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Recommended
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-3 mb-2">
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold">${animatedPrice}</span>
                        {price > 0 && (
                          <span className="text-gray-400 ml-2">/mo.</span>
                        )}
                      </div>
                      {billingPeriod === "yearly" && discount > 0 && (
                        <span className="text-[#20808D] text-sm font-semibold">
                          {discount}% off
                        </span>
                      )}
                    </div>
                    {plan.name === "Free" && <p className="text-sm text-gray-400">Includes:</p>}
                    {plan.name !== "Free" && <p className="text-sm text-gray-400">{plan.description}</p>}
                  </div>

                  <div className="mb-8 space-y-3 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-[#20808D] mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    disabled={plan.disabled}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${plan.buttonStyle}`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
