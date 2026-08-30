import os
import urllib.request
import zipfile
import shutil
import sys

def main():
    target_dir = os.path.abspath(".node")
    node_exe = os.path.join(target_dir, "node.exe")
    
    if os.path.exists(node_exe):
        print(f"[*] Node.js is already installed at {target_dir}")
        return
        
    print("[*] Setting up portable Node.js...")
    url = "https://nodejs.org/dist/v20.11.1/node-v20.11.1-win-x64.zip"
    zip_path = os.path.abspath("node_temp.zip")
    extract_temp = os.path.abspath("node_extract_temp")
    
    try:
        # Download Node.js
        print(f"[*] Downloading Node.js from {url}...")
        urllib.request.urlretrieve(url, zip_path)
        print("[+] Download complete.")
        
        # Extract Node.js
        print("[*] Extracting Node.js zip...")
        if not os.path.exists(extract_temp):
            os.makedirs(extract_temp)
            
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_temp)
        print("[+] Extraction complete.")
        
        # Move files to .node
        extracted_folder_name = "node-v20.11.1-win-x64"
        source_folder = os.path.join(extract_temp, extracted_folder_name)
        
        if os.path.exists(target_dir):
            shutil.rmtree(target_dir)
            
        shutil.move(source_folder, target_dir)
        print(f"[+] Node.js portable installed successfully in {target_dir}")
        
    except Exception as e:
        print(f"[-] Error setting up Node.js: {e}")
        sys.exit(1)
        
    finally:
        # Cleanup temporary files
        if os.path.exists(zip_path):
            os.remove(zip_path)
        if os.path.exists(extract_temp):
            shutil.rmtree(extract_temp)

if __name__ == "__main__":
    main()
