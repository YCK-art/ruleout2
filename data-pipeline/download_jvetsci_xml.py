import requests
import time
import os
import logging
from datetime import datetime

# Set up logging
log_dir = '/Users/ksinfosys/medical/data-pipeline/guidelines'
log_file = os.path.join(log_dir, 'jvetsci_download.log')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)

def download_pmc_xml(pmcid, output_dir):
    """
    Download XML for a given PMCID from NCBI PMC
    """
    # Remove PMC prefix if present
    pmcid_clean = pmcid.replace('PMC', '')

    # PMC API endpoint
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id={pmcid_clean}&rettype=xml&retmode=xml"

    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()

        # Check if we got valid XML
        if len(response.content) > 0 and b'<?xml' in response.content:
            # Save to file
            output_file = os.path.join(output_dir, f"{pmcid}.xml")
            with open(output_file, 'wb') as f:
                f.write(response.content)

            logging.info(f"✓ XML downloaded: {pmcid} ({len(response.content)} bytes)")
            return True
        else:
            logging.warning(f"✗ Invalid XML response for {pmcid}")
            return False

    except requests.exceptions.RequestException as e:
        logging.error(f"✗ Error downloading {pmcid}: {str(e)}")
        return False

def main():
    # Input file with PMCIDs
    pmcid_file = '/Users/ksinfosys/Downloads/pmcid-JVetSci.txt'

    # Output directory for XML files
    output_dir = '/Users/ksinfosys/medical/data-pipeline/guidelines/xml_jvetsci'

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Read PMCIDs from file
    logging.info(f"Reading PMCIDs from: {pmcid_file}")
    with open(pmcid_file, 'r') as f:
        pmcids = [line.strip() for line in f if line.strip()]

    logging.info(f"Found {len(pmcids)} PMCIDs to download")

    # Track statistics
    successful = 0
    failed = 0

    # Download each XML
    for i, pmcid in enumerate(pmcids, 1):
        logging.info(f"\n[{i}/{len(pmcids)}] Processing {pmcid}")
        logging.info(f"Downloading XML: {pmcid}")

        if download_pmc_xml(pmcid, output_dir):
            successful += 1
        else:
            failed += 1

        # Rate limiting - NCBI recommends max 3 requests per second
        time.sleep(0.4)  # 400ms delay = ~2.5 requests per second

    # Final statistics
    logging.info(f"\n{'='*50}")
    logging.info(f"Download Complete!")
    logging.info(f"Total PMCIDs: {len(pmcids)}")
    logging.info(f"Successful: {successful}")
    logging.info(f"Failed: {failed}")
    logging.info(f"Output directory: {output_dir}")
    logging.info(f"Log file: {log_file}")
    logging.info(f"{'='*50}")

if __name__ == "__main__":
    main()