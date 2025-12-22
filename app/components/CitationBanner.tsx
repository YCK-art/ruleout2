"use client";

import { useState, useRef, useEffect } from "react";
import { Reference } from "@/types/chat";

interface CitationBannerProps {
  citationIndices: number[];
  references: Reference[];
  messageIndex: number;
}

export default function CitationBanner({ citationIndices, references, messageIndex }: CitationBannerProps) {
  const [showPopover, setShowPopover] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<'left' | 'center' | 'right'>('center');
  const [popoverVertical, setPopoverVertical] = useState<'bottom' | 'top'>('bottom');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bannerRef = useRef<HTMLSpanElement | null>(null);

  // 디버깅: citationIndices 출력
  console.log('CitationBanner - citationIndices:', citationIndices, 'length:', citationIndices.length);

  // 중복 제거 및 유효한 참고문헌만 필터링
  const uniqueValidIndices = [...new Set(citationIndices)].filter(idx => references[idx]);
  console.log('CitationBanner - uniqueValidIndices:', uniqueValidIndices, 'length:', uniqueValidIndices.length);

  // 유효한 참고문헌이 없으면 아무것도 렌더링하지 않음
  if (uniqueValidIndices.length === 0) return null;

  // 첫 번째 참고문헌 정보 가져오기
  const firstRef = references[uniqueValidIndices[0]];

  // 저널 이름 사용 (논문 제목이 아님)
  const journalName = firstRef.journal && firstRef.journal !== 'Unknown'
    ? firstRef.journal
    : (firstRef.source || 'Reference');

  // 저널 이름 최대 20자로 제한
  const truncatedJournal = journalName.length > 20 ? journalName.slice(0, 20) + "..." : journalName;

  // 추가 참고문헌 개수 표시 (실제 유효한 참고문헌이 2개 이상일 때만)
  const additionalCount = uniqueValidIndices.length > 1 ? ` + ${uniqueValidIndices.length - 1}` : '';
  console.log('CitationBanner - additionalCount:', additionalCount, 'for journal:', truncatedJournal);

  // 드롭다운 위치 계산 (컨테이너 내부에 유지)
  const calculatePopoverPosition = () => {
    if (!bannerRef.current) return;

    const rect = bannerRef.current.getBoundingClientRect();
    const popoverWidth = 288; // w-72 = 18rem = 288px
    const popoverHeight = 400; // maxHeight: '400px'
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 수평 위치 계산 (왼쪽/중앙/오른쪽)
    const spaceOnLeft = rect.left;
    const spaceOnRight = viewportWidth - rect.right;
    const centerOffset = popoverWidth / 2;

    if (spaceOnLeft < centerOffset) {
      setPopoverPosition('left');
    } else if (spaceOnRight < centerOffset) {
      setPopoverPosition('right');
    } else {
      setPopoverPosition('center');
    }

    // 수직 위치 계산 (위/아래)
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // 아래쪽 공간이 충분하면 아래로, 부족하면 위로
    if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
      setPopoverVertical('top');
    } else {
      setPopoverVertical('bottom');
    }
  };

  // Animation effect - fade in/out with delayed unmounting
  useEffect(() => {
    if (showPopover) {
      // Fade in: render first, then animate
      setShouldRender(true);
      // Small delay to ensure DOM is ready before animation
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      // Fade out: animate first, then unmount
      setIsAnimating(false);
      // Wait for fade-out animation to complete before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 200); // Match the transition duration
      return () => clearTimeout(timer);
    }
  }, [showPopover]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    };
  }, []);

  // 호버 핸들러 - 지연 시간을 두어 부드러운 전환
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    calculatePopoverPosition();
    setShowPopover(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowPopover(false);
    }, 100); // 100ms 지연
  };

  // 모바일: 터치로 토글
  const handleClick = () => {
    if (!showPopover) {
      calculatePopoverPosition();
    }
    setShowPopover(!showPopover);
  };

  // 위치에 따른 transform 스타일
  const getPopoverTransform = () => {
    const horizontal = (() => {
      switch (popoverPosition) {
        case 'left':
          return { left: '0', transform: 'none' };
        case 'right':
          return { right: '0', transform: 'none' };
        case 'center':
        default:
          return { left: '50%', transform: 'translateX(-50%)' };
      }
    })();

    const vertical = popoverVertical === 'top'
      ? { bottom: '100%', top: 'auto', marginTop: '0', marginBottom: '8px' }
      : { top: '100%', bottom: 'auto', marginTop: '8px', marginBottom: '0' };

    return { ...horizontal, ...vertical };
  };

  return (
    <span className="relative inline-block ml-1" ref={bannerRef}>
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="inline-flex items-center px-1.5 py-0 text-[10px] font-medium rounded-lg cursor-pointer transition-all duration-200"
        style={{
          backgroundColor: 'rgba(90, 200, 216, 0.15)',
          color: '#FFFFFF'
        }}
      >
        {truncatedJournal}{additionalCount}
      </span>

      {/* Popover - 호버 시 표시 with fade animation */}
      {shouldRender && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute z-50 w-72 rounded-lg shadow-xl transition-opacity duration-200"
          style={{
            backgroundColor: '#2a2a2a',
            ...getPopoverTransform(),
            padding: '8px 12px',
            maxHeight: '400px',
            overflowY: 'auto',
            opacity: isAnimating ? 1 : 0
          }}
        >
          {/* 참고문헌 개수 헤더 */}
          <div className="text-xs italic mb-2" style={{ color: '#5AC8D8' }}>
            {uniqueValidIndices.length} {uniqueValidIndices.length === 1 ? 'reference' : 'references'}
          </div>

          {/* 모든 인용된 참고문헌 표시 */}
          <div className="space-y-2">
            {uniqueValidIndices.map((refIdx, idx) => {
              const ref = references[refIdx];
              console.log(`CitationBanner - Popover item ${idx}: refIdx=${refIdx}, ref exists:`, !!ref, ref ? `journal=${ref.journal}` : 'null');

              return (
                <div key={idx} className="text-sm">
                  {/* 논문 제목 with inline number */}
                  {ref.url ? (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:underline cursor-pointer block mb-0"
                      style={{ color: '#5AC8D8' }}
                    >
                      <span className="text-white font-medium">{refIdx + 1}. </span>{ref.title}
                    </a>
                  ) : (
                    <h4 className="text-sm font-medium mb-0" style={{ color: '#5AC8D8' }}>
                      <span className="text-white font-medium">{refIdx + 1}. </span>{ref.title}
                    </h4>
                  )}

                  {/* 논문 내용 */}
                  <div className="ml-0">

                  {/* 저자 */}
                  {ref.authors && ref.authors !== 'Unknown' && (
                    <p className="text-gray-300 text-xs mb-0">{ref.authors}</p>
                  )}

                  {/* 저널 및 연도 */}
                  {(ref.journal || ref.year) && (
                    <p className="text-gray-400 text-xs mb-0 leading-tight">
                      {ref.journal && ref.journal !== 'Unknown' && `${ref.journal}. `}
                      {ref.year && ref.year !== 'Unknown' && ref.year}
                    </p>
                  )}

                  {/* DOI */}
                  {ref.doi && ref.doi !== 'Unknown' && (
                    <p className="text-gray-400 text-xs mt-0 leading-tight">
                      doi: {ref.doi}
                    </p>
                  )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </span>
  );
}
