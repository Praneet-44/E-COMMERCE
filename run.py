import os
import subprocess
import sys
import time

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
    npm_cmd = os.path.join(node_dir, "npm.cmd")
    
    # Check node setup
    if not os.path.exists(node_exe):
        print("[*] Portable Node.js not found. Running setup_node.py...")
        setup_script = os.path.join(workspace, "setup_node.py")
        subprocess.run([sys.executable, setup_script], check=True)
        
    if not os.path.exists(node_exe):
        print("[-] Node.js setup failed. Exiting.")
        sys.exit(1)
        
    # Environment with portable Node in PATH
    env = os.environ.copy()
    env["PATH"] = node_dir + os.pathsep + env.get("PATH", "")
    
    node_bin = node_exe if os.path.exists(node_exe) else "node"
    npm_bin = npm_cmd if os.path.exists(npm_cmd) else "npm"
    
    # Check node version
    try:
        res_node = subprocess.run([node_bin, "-v"], capture_output=True, text=True, env=env, timeout=10)
        print(f"[+] Node.js version: {res_node.stdout.strip()}")
    except Exception as e:
        print(f"[-] Node check failed: {e}")

    # Check npm version
    try:
        res_npm = subprocess.run([npm_bin, "-v"], capture_output=True, text=True, env=env, timeout=10, shell=True)
        print(f"[+] NPM version: {res_npm.stdout.strip()}")
    except Exception as e:
        print(f"[*] NPM version check skipped: {e}")
        
    # Step 1: Install Backend dependencies if missing
    backend_dir = os.path.join(workspace, "backend")
    if os.path.exists(backend_dir):
        node_modules_backend = os.path.join(backend_dir, "node_modules")
        if not os.path.exists(node_modules_backend):
            print("[*] Installing backend dependencies...")
            subprocess.run([npm_bin, "install"], cwd=backend_dir, env=env, shell=True, check=True)
            print("[+] Backend dependencies installed.")
            
    # Step 2: Install Frontend dependencies if missing
    frontend_dir = os.path.join(workspace, "frontend")
    if os.path.exists(frontend_dir):
        node_modules_frontend = os.path.join(frontend_dir, "node_modules")
        if not os.path.exists(node_modules_frontend):
            print("[*] Installing frontend dependencies...")
            subprocess.run([npm_bin, "install"], cwd=frontend_dir, env=env, shell=True, check=True)
            print("[+] Frontend dependencies installed.")

    # Step 3: Run servers concurrently
    processes = []
    try:
        # Start backend
        if os.path.exists(backend_dir):
            backend_process = run_command_in_path(
                [node_bin, "server.js"],
                cwd=backend_dir,
                env=env
            )
            processes.append(backend_process)
            
        # Wait a moment for backend to initialize
        time.sleep(2)
        
        # Start frontend
        if os.path.exists(frontend_dir):
            frontend_process = run_command_in_path(
                [npm_bin, "run", "dev"],
                cwd=frontend_dir,
                env=env
            )
            processes.append(frontend_process)
            
        print("\n[+] Servers are running!")
        print("  - Backend:  http://localhost:5000")
        print("  - Frontend: http://localhost:3000")
        print("Press Ctrl+C to stop.\n")
        
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
