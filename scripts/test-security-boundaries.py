from pathlib import Path
import shutil
import subprocess
import tempfile
import uuid

repo = Path(__file__).resolve().parent.parent
image = "node:22-bookworm-slim"
subprocess.run(["docker", "pull", image], check=True, timeout=120)
container = "skill-security-" + uuid.uuid4().hex[:12]
with tempfile.TemporaryDirectory(prefix="skill-security-") as temporary:
    source = Path(temporary)
    source.chmod(0o755)
    for relative in ["packages/hyperframes", "scripts/expense-sync", "tests"]:
        shutil.copytree(repo / relative, source / relative, symlinks=True, ignore=shutil.ignore_patterns(".git", "node_modules", ".env", ".env.*"))
    command = [
        "docker", "run", "--name", container, "--network", "none", "--ipc", "none",
        "--read-only", "--user", "65534:65534", "--cap-drop", "ALL",
        "--security-opt", "no-new-privileges", "--pids-limit", "64",
        "--memory", "512m", "--memory-swap", "512m", "--cpus", "1",
        "--ulimit", "cpu=20:20", "--ulimit", "nproc=64:64",
        "--ulimit", "nofile=128:128", "--ulimit", "fsize=131072:131072",
        "--log-driver", "none", "--tmpfs", "/scratch:rw,noexec,nosuid,nodev,size=64m,mode=1777",
        "--mount", f"type=bind,src={source},dst=/src,readonly",
        "--workdir", "/scratch", "--entrypoint", "/usr/bin/env", image,
        "-i", "HOME=/scratch", "TMPDIR=/scratch", "PATH=/usr/local/bin:/usr/bin:/bin",
        "DO_NOT_TRACK=1", "node", "--experimental-strip-types", "--test",
        "/src/tests/security-boundaries.test.mjs",
    ]
    try:
        subprocess.run(command, check=True, timeout=50)
    finally:
        subprocess.run(["docker", "rm", "-f", container], check=True, stdout=subprocess.DEVNULL, timeout=15)
