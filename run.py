import os
import subprocess
import sys
import time
import shutil

def run_command_in_path(args, cwd, env):
    """Run a command in a specific directory with updated PATH."""
    print(f"[*] Running command: {' '.join(args)} in {cwd}")
    process = subprocess.Popen(
        args,
        cwd=cwd,
        env=env,
        shell=True
    )
    return process

def main():
    workspace = os.path.abspath(os.path.dirname(__file__))
    node_dir = os.path.join(workspace, ".node")
    node_exe = os.path.join(node_dir, "node.exe")
    
    # Check node setup
    if not os.path.exists(node_exe):
        print("[*] Node.js not found. Running setup_node.py...")
        setup_script = os.path.join(workspace, "setup_node.py")
        subprocess.run([sys.executable, setup_script], check=True)
        
    if not os.path.exists(node_exe):
        print("[-] Node.js setup failed. Exiting.")
        sys.exit(1)
        
    # Add portable Node.js to PATH
    env = os.environ.copy()
    # Add both the node dir and the npm global module dir to PATH
    env["PATH"] = node_dir + os.pathsep + env.get("PATH", "")
    
    # Check node and npm
    try:
        node_version = subprocess.check_output(["node", "-v"], env=env, shell=True).decode().strip()
        npm_version = subprocess.check_output(["npm", "-v"], env=env, shell=True).decode().strip()
        print(f"[+] Node.js version: {node_version}")
        print(f"[+] NPM version: {npm_version}")
    except Exception as e:
        print(f"[-] Node/NPM check failed: {e}")
        sys.exit(1)
        
    # Step 1: Install Backend dependencies
    backend_dir = os.path.join(workspace, "backend")
    if os.path.exists(backend_dir):
        node_modules_backend = os.path.join(backend_dir, "node_modules")
        if not os.path.exists(node_modules_backend):
            print("[*] Installing backend dependencies...")
            subprocess.run(["npm", "install"], cwd=backend_dir, env=env, shell=True, check=True)
            print("[+] Backend dependencies installed.")
            
    # Step 2: Install Frontend dependencies
    frontend_dir = os.path.join(workspace, "frontend")
    if os.path.exists(frontend_dir):
        node_modules_frontend = os.path.join(frontend_dir, "node_modules")
        if not os.path.exists(node_modules_frontend):
            print("[*] Installing frontend dependencies...")
            # We run npm install. In frontend we also install tailwindcss, framer-motion, lucide-react, etc.
            subprocess.run(["npm", "install"], cwd=frontend_dir, env=env, shell=True, check=True)
            print("[+] Frontend dependencies installed.")

    # Step 3: Run servers concurrently
    processes = []
    try:
        # Start backend
        if os.path.exists(backend_dir):
            backend_process = run_command_in_path(
                ["node", "server.js"],
                cwd=backend_dir,
                env=env
            )
            processes.append(backend_process)
            
        # Wait a moment for backend to initialize
        time.sleep(2)
        
        # Start frontend
        if os.path.exists(frontend_dir):
            frontend_process = run_command_in_path(
                ["npm", "run", "dev"],
                cwd=frontend_dir,
                env=env
            )
            processes.append(frontend_process)
            
        print("[+] Servers are running. Press Ctrl+C to stop.")
        
        # Keep python running and monitor children
        while True:
            for p in processes:
                if p.poll() is not None:
                    print(f"[-] Process {p.pid} terminated unexpectedly.")
                    raise KeyboardInterrupt
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n[*] Shutting down servers...")
        for p in processes:
            if p.poll() is None:
                p.terminate()
                p.wait()
        print("[+] Cleanup complete. Exiting.")

if __name__ == "__main__":
    main()
