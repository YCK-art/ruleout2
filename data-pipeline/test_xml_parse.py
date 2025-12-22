import xml.etree.ElementTree as ET
import time

file_path = '/Users/ksinfosys/medical/data-pipeline/guidelines/xml_bmcvetres/PMC6150974.xml'

print(f"Testing XML parsing for: {file_path}")
print("Parsing XML...")
start = time.time()

try:
    tree = ET.parse(file_path)
    root = tree.getroot()
    print(f"✓ Parsed successfully in {time.time() - start:.2f}s")

    # Test abstract extraction
    print("\nTesting abstract extraction...")
    start = time.time()
    abstract_parts = []
    for abstract in root.findall('.//abstract'):
        abstract_text = ET.tostring(abstract, encoding='unicode', method='text')
        if abstract_text:
            abstract_parts.append(abstract_text)
    print(f"✓ Abstract extracted in {time.time() - start:.2f}s ({len(''.join(abstract_parts))} chars)")

    # Test body extraction
    print("\nTesting body extraction...")
    start = time.time()
    body = root.find('.//body')
    if body is not None:
        body_text = ET.tostring(body, encoding='unicode', method='text')
        print(f"✓ Body extracted in {time.time() - start:.2f}s ({len(body_text) if body_text else 0} chars)")
    else:
        print("No body found")

except Exception as e:
    print(f"✗ Error: {e}")
