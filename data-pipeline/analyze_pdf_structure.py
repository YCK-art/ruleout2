#!/usr/bin/env python3
"""
PDF 문서 구조 분석 스크립트
제목 계층, 섹션, 표/그림 위치 등을 분석하여 최적의 청킹 전략 수립
"""

import os
import re
from pathlib import Path
from collections import defaultdict, Counter
import fitz  # PyMuPDF

def analyze_font_sizes(doc):
    """
    문서의 폰트 크기 분포 분석
    """
    font_sizes = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        blocks = page.get_text("dict")["blocks"]

        for block in blocks:
            if block.get("type") == 0:  # 텍스트 블록
                for line in block.get("lines", []):
                    for span in line.get("spans", []):
                        font_size = span.get("size", 0)
                        if font_size > 0:
                            font_sizes.append(round(font_size, 1))

    return Counter(font_sizes)

def detect_headings(doc, base_font_size=10.0):
    """
    제목 계층 구조 탐지
    """
    headings = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        blocks = page.get_text("dict")["blocks"]

        for block in blocks:
            if block.get("type") == 0:  # 텍스트 블록
                for line in block.get("lines", []):
                    line_text = ""
                    max_font_size = 0
                    is_bold = False

                    for span in line.get("spans", []):
                        line_text += span.get("text", "")
                        font_size = span.get("size", 0)
                        max_font_size = max(max_font_size, font_size)

                        # 볼드 체크
                        font_name = span.get("font", "").lower()
                        if "bold" in font_name or "black" in font_name:
                            is_bold = True

                    line_text = line_text.strip()

                    # 제목 조건: 폰트가 크거나, 볼드이거나, 번호가 있는 패턴
                    if line_text and (
                        max_font_size > base_font_size + 1 or
                        (is_bold and len(line_text) < 100) or
                        re.match(r'^\d+\.', line_text) or  # 1.
                        re.match(r'^[A-Z]\d+\.', line_text) or  # A1.
                        re.match(r'^\d+\.\d+', line_text) or  # 1.1
                        re.match(r'^제\s*\d+\s*[장절]', line_text) or  # 제1장
                        re.match(r'^[IVX]+\.', line_text)  # I., II.
                    ):
                        # 제목 레벨 결정
                        level = 1
                        if max_font_size > base_font_size + 4:
                            level = 1
                        elif max_font_size > base_font_size + 2:
                            level = 2
                        elif max_font_size > base_font_size:
                            level = 3
                        elif re.match(r'^\d+\.\d+\.\d+', line_text):
                            level = 4
                        elif re.match(r'^\d+\.\d+', line_text):
                            level = 3
                        elif re.match(r'^\d+\.', line_text):
                            level = 2

                        headings.append({
                            "page": page_num + 1,
                            "level": level,
                            "text": line_text[:100],
                            "font_size": round(max_font_size, 1),
                            "is_bold": is_bold
                        })

    return headings

def detect_special_elements(doc):
    """
    표, 그림, 참고문헌 등 특수 요소 탐지
    """
    tables = []
    figures = []
    references = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()

        # 표 탐지
        if re.search(r'[Tt]able\s+\d+|표\s+\d+', text):
            tables.append(page_num + 1)

        # 그림 탐지
        if re.search(r'[Ff]igure\s+\d+|[Ff]ig\.\s+\d+|그림\s+\d+', text):
            figures.append(page_num + 1)

        # 참고문헌 탐지
        if re.search(r'^\s*\d+\.\s+[A-Z]', text, re.MULTILINE) and \
           ('References' in text or '참고문헌' in text):
            references.append(page_num + 1)

    return {
        "tables": sorted(set(tables)),
        "figures": sorted(set(figures)),
        "references": sorted(set(references))
    }

def analyze_text_density(doc):
    """
    페이지별 텍스트 밀도 분석
    """
    densities = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()

        # 페이지 크기
        rect = page.rect
        page_area = rect.width * rect.height

        # 텍스트 길이로 밀도 추정
        text_length = len(text.strip())
        density = text_length / page_area if page_area > 0 else 0

        densities.append({
            "page": page_num + 1,
            "text_length": text_length,
            "density": round(density, 4)
        })

    return densities

def main():
    # PDF 파일 경로
    pdf_path = Path(__file__).parent / "guidelines" / "대한대장항문학회, 결장암 진료권고안, 2023.pdf"

    if not pdf_path.exists():
        print(f"❌ PDF 파일을 찾을 수 없습니다: {pdf_path}")
        return

    print("=" * 80)
    print("📄 PDF 문서 구조 분석")
    print("=" * 80)
    print(f"\n파일: {pdf_path.name}")

    # PDF 열기
    doc = fitz.open(pdf_path)
    total_pages = len(doc)

    print(f"\n📊 기본 정보:")
    print(f"   - 총 페이지 수: {total_pages}페이지")

    # 1. 폰트 크기 분석
    print(f"\n🔤 폰트 크기 분포 분석 중...")
    font_sizes = analyze_font_sizes(doc)
    most_common_fonts = font_sizes.most_common(10)

    print(f"\n   상위 10개 폰트 크기:")
    for font_size, count in most_common_fonts:
        percentage = (count / sum(font_sizes.values())) * 100
        print(f"   - {font_size}pt: {count:,}회 ({percentage:.1f}%)")

    # 본문 폰트 크기 추정 (가장 많이 사용된 폰트)
    base_font_size = most_common_fonts[0][0] if most_common_fonts else 10.0
    print(f"\n   📝 추정 본문 폰트 크기: {base_font_size}pt")

    # 2. 제목 계층 구조 탐지
    print(f"\n📑 제목 계층 구조 분석 중...")
    headings = detect_headings(doc, base_font_size)

    print(f"\n   총 {len(headings)}개의 제목 발견")

    # 레벨별 제목 개수
    level_counts = Counter(h["level"] for h in headings)
    print(f"\n   레벨별 제목 분포:")
    for level in sorted(level_counts.keys()):
        print(f"   - Level {level}: {level_counts[level]}개")

    # 처음 20개 제목 샘플
    print(f"\n   제목 샘플 (처음 20개):")
    for h in headings[:20]:
        indent = "  " * (h["level"] - 1)
        print(f"   {indent}[L{h['level']} p.{h['page']}] {h['text'][:80]}")

    # 3. 특수 요소 탐지
    print(f"\n🎯 특수 요소 탐지 중...")
    special_elements = detect_special_elements(doc)

    print(f"\n   - 표(Table): {len(special_elements['tables'])}개")
    if special_elements['tables'][:5]:
        print(f"     위치 (처음 5개): {special_elements['tables'][:5]}")

    print(f"   - 그림(Figure): {len(special_elements['figures'])}개")
    if special_elements['figures'][:5]:
        print(f"     위치 (처음 5개): {special_elements['figures'][:5]}")

    print(f"   - 참고문헌: {len(special_elements['references'])}개 섹션")
    if special_elements['references']:
        print(f"     위치: {special_elements['references']}")

    # 4. 텍스트 밀도 분석
    print(f"\n📏 텍스트 밀도 분석 중...")
    densities = analyze_text_density(doc)

    avg_density = sum(d["density"] for d in densities) / len(densities)
    low_density_pages = [d for d in densities if d["density"] < avg_density * 0.3]

    print(f"\n   - 평균 텍스트 밀도: {avg_density:.4f}")
    print(f"   - 낮은 밀도 페이지 (여백/그림 많음): {len(low_density_pages)}페이지")
    if low_density_pages[:10]:
        pages = [str(d["page"]) for d in low_density_pages[:10]]
        print(f"     예시 (처음 10개): {', '.join(pages)}")

    # 5. 청킹 전략 제안
    print(f"\n" + "=" * 80)
    print("💡 청킹 전략 제안")
    print("=" * 80)

    avg_section_length = total_pages / max(len([h for h in headings if h["level"] <= 2]), 1)

    print(f"\n1. 계층적 청킹 (Hierarchical Chunking):")
    print(f"   - Level 1/2 제목을 기준으로 대섹션 분할")
    print(f"   - 평균 섹션 길이: 약 {avg_section_length:.1f} 페이지")
    print(f"   - 예상 청크 수: {len([h for h in headings if h['level'] <= 2])} ~ {len([h for h in headings if h['level'] <= 3])}개")

    print(f"\n2. 의미론적 청킹 (Semantic Chunking):")
    print(f"   - 제목 + 본문을 하나의 단위로 유지")
    print(f"   - 최대 청크 크기: 1000-1500 토큰")
    print(f"   - 표/그림이 포함된 섹션은 별도 처리")

    print(f"\n3. 하이브리드 청킹 (Hybrid Chunking):")
    print(f"   - 제목 기반으로 1차 분할")
    print(f"   - 너무 긴 섹션은 문단 단위로 2차 분할")
    print(f"   - 문맥 오버랩: 100-200자")

    print(f"\n4. 권장 전략:")
    print(f"   ✅ 계층적 + 의미론적 하이브리드 청킹")
    print(f"   - Level 2/3 제목을 기준으로 분할")
    print(f"   - 각 청크에 상위 제목 컨텍스트 포함")
    print(f"   - 최대 크기 초과 시 문단 단위로 분할")
    print(f"   - 예상 최종 청크 수: 800-1000개")

    print("\n" + "=" * 80)

    doc.close()

if __name__ == "__main__":
    main()
