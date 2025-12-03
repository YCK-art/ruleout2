"""
전체 PDF 메타데이터 추출 스크립트
298개 PDF의 메타데이터를 CSV와 Markdown으로 출력
"""

import json
from pathlib import Path
import csv

# 메타데이터 매핑 로드
metadata_file = Path(__file__).parent / "pdf_metadata_mapping.json"
with open(metadata_file, 'r', encoding='utf-8') as f:
    metadata_mapping = json.load(f)

# URL 매핑 로드
url_mapping_file = Path(__file__).parent.parent / "backend" / "pdf_url_mapping.json"
with open(url_mapping_file, 'r', encoding='utf-8') as f:
    url_mapping = json.load(f)

print(f"총 {len(metadata_mapping)}개의 PDF 메타데이터를 추출합니다...")

# 파일명으로 정렬
sorted_files = sorted(metadata_mapping.keys())

# Markdown 파일 생성
md_output = Path(__file__).parent / "ALL_PDF_METADATA.md"
with open(md_output, 'w', encoding='utf-8') as f:
    f.write("# 전체 PDF 메타데이터 목록\n\n")
    f.write(f"**총 {len(metadata_mapping)}개 PDF**\n\n")
    f.write("---\n\n")

    for i, filename in enumerate(sorted_files, 1):
        meta = metadata_mapping[filename]
        url = url_mapping.get(filename, "")

        f.write(f"## {i}. {filename}\n\n")
        f.write(f"- **Title**: {meta.get('title', 'N/A')}\n")
        f.write(f"- **Authors**: {meta.get('authors', 'N/A')}\n")
        f.write(f"- **Journal**: {meta.get('journal', 'N/A')}\n")
        f.write(f"- **Year**: {meta.get('year', 'N/A')}\n")
        f.write(f"- **DOI**: {meta.get('doi', 'N/A')}\n")
        if url:
            f.write(f"- **URL**: {url}\n")
        f.write("\n---\n\n")

print(f"✅ Markdown 파일 생성: {md_output}")

# CSV 파일 생성
csv_output = Path(__file__).parent / "ALL_PDF_METADATA.csv"
with open(csv_output, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['번호', '파일명', 'Title', 'Authors', 'Journal', 'Year', 'DOI', 'URL'])

    for i, filename in enumerate(sorted_files, 1):
        meta = metadata_mapping[filename]
        url = url_mapping.get(filename, "")

        writer.writerow([
            i,
            filename,
            meta.get('title', 'N/A'),
            meta.get('authors', 'N/A'),
            meta.get('journal', 'N/A'),
            meta.get('year', 'N/A'),
            meta.get('doi', 'N/A'),
            url
        ])

print(f"✅ CSV 파일 생성: {csv_output}")

# 텍스트 파일 생성 (간단한 형식)
txt_output = Path(__file__).parent / "ALL_PDF_METADATA.txt"
with open(txt_output, 'w', encoding='utf-8') as f:
    f.write(f"전체 PDF 메타데이터 목록 (총 {len(metadata_mapping)}개)\n")
    f.write("="*80 + "\n\n")

    for i, filename in enumerate(sorted_files, 1):
        meta = metadata_mapping[filename]
        url = url_mapping.get(filename, "")

        f.write(f"{i}. {filename}\n")
        f.write(f"   Title: {meta.get('title', 'N/A')}\n")
        f.write(f"   Authors: {meta.get('authors', 'N/A')}\n")
        f.write(f"   Journal: {meta.get('journal', 'N/A')}\n")
        f.write(f"   Year: {meta.get('year', 'N/A')}\n")
        f.write(f"   DOI: {meta.get('doi', 'N/A')}\n")
        if url:
            f.write(f"   URL: {url}\n")
        f.write("\n" + "-"*80 + "\n\n")

print(f"✅ 텍스트 파일 생성: {txt_output}")

print("\n" + "="*80)
print(f"✅ 총 3개 파일 생성 완료!")
print(f"   - {md_output.name} (Markdown)")
print(f"   - {csv_output.name} (CSV)")
print(f"   - {txt_output.name} (Text)")
print("="*80)
