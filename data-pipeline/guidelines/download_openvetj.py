#!/usr/bin/env python3
"""
PMC Bulk Downloader for Open Veterinary Journal
Downloads both PDF and XML formats
"""

import os
import time
import requests
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class PMCDownloader:
    def __init__(self, output_dir):
        self.output_dir = Path(output_dir)
        self.pdf_dir = self.output_dir / 'pdf'
        self.xml_dir = self.output_dir / 'xml'
        self.pdf_dir.mkdir(parents=True, exist_ok=True)
        self.xml_dir.mkdir(parents=True, exist_ok=True)

        # NCBI recommends no more than 3 requests per second
        self.delay = 0.4

        # Statistics
        self.stats = {
            'total': 0,
            'pdf_success': 0,
            'xml_success': 0,
            'pdf_failed': 0,
            'xml_failed': 0
        }

    def download_pdf(self, pmcid):
        """Download PDF from PMC OA Service"""
        pmc_number = pmcid.replace('PMC', '')
        pdf_url = f"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC{pmc_number}/pdf/"
        pdf_path = self.pdf_dir / f"{pmcid}.pdf"

        if pdf_path.exists():
            logger.info(f"PDF already exists: {pmcid}")
            return True

        try:
            logger.info(f"Downloading PDF: {pmcid}")
            response = requests.get(pdf_url, timeout=30, allow_redirects=True)

            if response.status_code == 200 and response.headers.get('content-type', '').startswith('application/pdf'):
                pdf_path.write_bytes(response.content)
                logger.info(f"✓ PDF downloaded: {pmcid} ({len(response.content)} bytes)")
                return True
            else:
                logger.warning(f"✗ PDF not available: {pmcid} (Status: {response.status_code})")
                return False

        except Exception as e:
            logger.error(f"✗ PDF download failed: {pmcid} - {str(e)}")
            return False

    def download_xml(self, pmcid):
        """Download XML from PMC E-utilities"""
        pmc_number = pmcid.replace('PMC', '')
        xml_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id={pmc_number}&rettype=full&retmode=xml"
        xml_path = self.xml_dir / f"{pmcid}.xml"

        if xml_path.exists():
            logger.info(f"XML already exists: {pmcid}")
            return True

        try:
            logger.info(f"Downloading XML: {pmcid}")
            response = requests.get(xml_url, timeout=30)

            if response.status_code == 200 and len(response.content) > 0:
                xml_path.write_bytes(response.content)
                logger.info(f"✓ XML downloaded: {pmcid} ({len(response.content)} bytes)")
                return True
            else:
                logger.warning(f"✗ XML not available: {pmcid} (Status: {response.status_code})")
                return False

        except Exception as e:
            logger.error(f"✗ XML download failed: {pmcid} - {str(e)}")
            return False

    def download_paper(self, pmcid):
        """Download both PDF and XML for a given PMCID"""
        pmcid = pmcid.strip()
        if not pmcid:
            return

        logger.info(f"\n{'='*60}")
        logger.info(f"Processing: {pmcid}")
        logger.info(f"{'='*60}")

        self.stats['total'] += 1

        # Download PDF
        if self.download_pdf(pmcid):
            self.stats['pdf_success'] += 1
        else:
            self.stats['pdf_failed'] += 1

        time.sleep(self.delay)

        # Download XML
        if self.download_xml(pmcid):
            self.stats['xml_success'] += 1
        else:
            self.stats['xml_failed'] += 1

        time.sleep(self.delay)

    def download_from_file(self, pmcid_file):
        """Download all papers from a file containing PMCIDs"""
        logger.info(f"Reading PMCIDs from: {pmcid_file}")

        with open(pmcid_file, 'r') as f:
            pmcids = [line.strip() for line in f if line.strip()]

        logger.info(f"Found {len(pmcids)} PMCIDs to download")

        for i, pmcid in enumerate(pmcids, 1):
            logger.info(f"\n[{i}/{len(pmcids)}] Processing {pmcid}")
            self.download_paper(pmcid)

        self.print_summary()

    def print_summary(self):
        """Print download summary statistics"""
        logger.info(f"\n{'='*60}")
        logger.info("DOWNLOAD SUMMARY")
        logger.info(f"{'='*60}")
        logger.info(f"Total papers processed: {self.stats['total']}")
        logger.info(f"PDF - Success: {self.stats['pdf_success']}, Failed: {self.stats['pdf_failed']}")
        logger.info(f"XML - Success: {self.stats['xml_success']}, Failed: {self.stats['xml_failed']}")
        logger.info(f"{'='*60}")


def main():
    # Configuration for Open Veterinary Journal
    pmcid_file = os.path.expanduser("~/Desktop/pmcid-OpenVetJ.txt")
    output_dir = os.path.expanduser("~/medical/data-pipeline/guidelines")

    # Create downloader and run
    downloader = PMCDownloader(output_dir)
    downloader.download_from_file(pmcid_file)


if __name__ == "__main__":
    main()
