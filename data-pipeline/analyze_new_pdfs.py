#!/usr/bin/env python3
"""
새로운 4개 PDF 문서 구조 분석 스크립트
"""

import os
import re
from pathlib import Path
from collections import defaultdict, Counter
import fitz  # PyMuPDF

def analyze_font_sizes(doc):
    """문서의 폰트 크기 분포 분석"""
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
    """제목 계층 구조 탐지"""
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

                        font_name = span.get("font", "").lower()
                        if "bold" in font_name or "black" in font_name:
                            is_bold = True

                    line_text = line_text.strip()

                    # 제목 조건
                    if line_text and (
                        max_font_size > base_font_size + 1 or
                        (is_bold and len(line_text) < 100) or
                        re.match(r'^\d+\.', line_text) or
                        re.match(r'^[A-Z]\d+\.', line_text) or
                        re.match(r'^\d+\.\d+', line_text) or
                        re.match(r'^제\s*\d+\s*[장절]', line_text) or
                        re.match(r'^[IVX]+\.', line_text)
                    ):
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
    """표, 그림, 참고문헌 등 특수 요소 탐지"""
    tables = []
    figures = []
    references = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()

        if re.search(r'[Tt]able\s+\d+|표\s+\d+', text):
            tables.append(page_num + 1)

        if re.search(r'[Ff]igure\s+\d+|[Ff]ig\.\s+\d+|그림\s+\d+', text):
            figures.append(page_num + 1)

        if re.search(r'^\s*\d+\.\s+[A-Z]', text, re.MULTILINE) and \
           ('References' in text or '참고문헌' in text):
            references.append(page_num + 1)

    return {
        "tables": sorted(set(tables)),
        "figures": sorted(set(figures)),
        "references": sorted(set(references))
    }

def analyze_pdf(pdf_path):
    """PDF 분석"""
    print(f"\n{'='*80}")
    print(f"📄 {pdf_path.name}")
    print(f"{'='*80}")

    doc = fitz.open(pdf_path)
    total_pages = len(doc)

    print(f"총 페이지 수: {total_pages}페이지")

    # 폰트 크기 분석
    font_sizes = analyze_font_sizes(doc)
    most_common_fonts = font_sizes.most_common(5)
    base_font_size = most_common_fonts[0][0] if most_common_fonts else 10.0

    print(f"\n폰트 크기 분포 (상위 5개):")
    for font_size, count in most_common_fonts:
        percentage = (count / sum(font_sizes.values())) * 100
        print(f"  {font_size}pt: {count:,}회 ({percentage:.1f}%)")
    print(f"추정 본문 폰트: {base_font_size}pt")

    # 제목 계층 구조
    headings = detect_headings(doc, base_font_size)
    level_counts = Counter(h["level"] for h in headings)

    print(f"\n제목 계층 구조:")
    print(f"  총 제목 수: {len(headings)}개")
    for level in sorted(level_counts.keys()):
        print(f"  Level {level}: {level_counts[level]}개")

    print(f"\n제목 샘플 (처음 10개):")
    for h in headings[:10]:
        indent = "  " * (h["level"] - 1)
        print(f"  {indent}[L{h['level']} p.{h['page']}] {h['text'][:60]}")

    # 특수 요소
    special = detect_special_elements(doc)
    print(f"\n특수 요소:")
    print(f"  표: {len(special['tables'])}개")
    print(f"  그림: {len(special['figures'])}개")
    print(f"  참고문헌: {len(special['references'])}개 섹션")

    # 청킹 예상
    avg_section_length = total_pages / max(len([h for h in headings if h["level"] <= 2]), 1)
    estimated_chunks = len([h for h in headings if h['level'] <= 3])

    print(f"\n청킹 전략 예상:")
    print(f"  평균 섹션 길이: {avg_section_length:.1f} 페이지")
    print(f"  예상 청크 수: {estimated_chunks * 2} ~ {estimated_chunks * 3}개")

    doc.close()

    return {
        "filename": pdf_path.name,
        "pages": total_pages,
        "headings": len(headings),
        "estimated_chunks": estimated_chunks * 2
    }

def main():
    # 새로운 4개 PDF 파일
    new_pdfs = [
        '대한대장항문학회, 대변실금 진료권고안, 2021.pdf',
        '대한대장항문학회, 우측 결장 게실염 진료권고안, 2021.pdf',
        '대한대장항문학회, 직장암 다학제 진료권고안, 2021.pdf',
        '대장암진료권고안위원회, 대장암진료권고안, 2012.pdf'
    ]

    guidelines_dir = Path(__file__).parent / "guidelines"

    print("="*80)
    print("📊 새로운 4개 PDF 문서 구조 분석")
    print("="*80)

    stats = []

    for pdf_name in new_pdfs:
        pdf_path = guidelines_dir / pdf_name
        if pdf_path.exists():
            stat = analyze_pdf(pdf_path)
            stats.append(stat)
        else:
            print(f"❌ 파일을 찾을 수 없습니다: {pdf_name}")

    # 전체 통계
    print(f"\n{'='*80}")
    print("📊 전체 통계 요약")
    print(f"{'='*80}")

    total_pages = sum(s['pages'] for s in stats)
    total_headings = sum(s['headings'] for s in stats)
    total_chunks = sum(s['estimated_chunks'] for s in stats)

    print(f"\n처리할 파일 수: {len(stats)}개")
    print(f"총 페이지 수: {total_pages:,}페이지")
    print(f"총 제목 수: {total_headings:,}개")
    print(f"예상 청크 수: {total_chunks:,}개")

    print(f"\n{'='*80}")

if __name__ == "__main__":
    main()
