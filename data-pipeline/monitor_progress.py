import json
import os
import time
from datetime import datetime

PROGRESS_FILE = '/Users/ksinfosys/medical/data-pipeline/bmcvetres_progress.json'
LOG_FILE = '/Users/ksinfosys/medical/data-pipeline/bmcvetres_processing.log'
TOTAL_FILES = 4754

def get_progress():
    """Load progress from JSON file"""
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r') as f:
            return json.load(f)
    return {'processed_files': [], 'total_chunks': 0, 'last_updated': ''}

def get_latest_log_lines(n=10):
    """Get the last n lines from log file"""
    try:
        with open(LOG_FILE, 'r') as f:
            lines = f.readlines()
            return ''.join(lines[-n:])
    except:
        return "Log file not found"

def display_progress():
    """Display current progress"""
    while True:
        os.system('clear')  # Clear screen

        print("=" * 100)
        print("BMC VETERINARY RESEARCH - PROCESSING PROGRESS")
        print("=" * 100)
        print()

        # Load progress
        progress = get_progress()
        processed_count = len(progress.get('processed_files', []))
        total_chunks = progress.get('total_chunks', 0)
        last_updated = progress.get('last_updated', 'N/A')

        # Calculate stats
        percent_complete = (processed_count / TOTAL_FILES) * 100 if TOTAL_FILES > 0 else 0
        remaining = TOTAL_FILES - processed_count

        # Estimate time
        if processed_count > 0:
            avg_chunks_per_file = total_chunks / processed_count
            estimated_total_chunks = int(avg_chunks_per_file * TOTAL_FILES)
        else:
            avg_chunks_per_file = 0
            estimated_total_chunks = 0

        # Display stats
        print(f"📊 OVERALL PROGRESS")
        print(f"   Files Processed:     {processed_count:,} / {TOTAL_FILES:,}")
        print(f"   Completion:          {percent_complete:.2f}%")
        print(f"   Remaining Files:     {remaining:,}")
        print()

        # Progress bar
        bar_length = 50
        filled_length = int(bar_length * processed_count / TOTAL_FILES)
        bar = '█' * filled_length + '░' * (bar_length - filled_length)
        print(f"   [{bar}] {percent_complete:.1f}%")
        print()

        print(f"📈 CHUNKS STATISTICS")
        print(f"   Total Chunks:        {total_chunks:,}")
        print(f"   Avg Chunks/File:     {avg_chunks_per_file:.1f}")
        print(f"   Estimated Total:     {estimated_total_chunks:,}")
        print()

        print(f"🕐 TIMING")
        print(f"   Last Updated:        {last_updated}")
        print()

        print("=" * 100)
        print("📝 LATEST LOG ENTRIES")
        print("=" * 100)
        print(get_latest_log_lines(15))

        print("=" * 100)
        print("Press Ctrl+C to exit monitoring")
        print("Refreshing in 5 seconds...")

        time.sleep(5)

if __name__ == "__main__":
    try:
        display_progress()
    except KeyboardInterrupt:
        print("\n\nMonitoring stopped.")