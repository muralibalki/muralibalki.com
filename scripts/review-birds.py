"""Run alongside the local site preview to enable the bird gallery editor."""
import fcntl
import hashlib
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FINAL = ROOT / "app/birds/review.json"
DRAFT = ROOT / "work/bird-gallery/review-draft.json"
ORIGIN = "http://127.0.0.1:4178"


def current():
    data = (DRAFT if DRAFT.exists() else FINAL).read_bytes()
    return json.loads(data), hashlib.sha256(data).hexdigest()


class Handler(BaseHTTPRequestHandler):
    def respond(self, status, data):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Access-Control-Allow-Origin", ORIGIN)
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.respond(200, {})

    def do_GET(self):
        review, version = current()
        self.respond(200, dict(review=review, version=version))

    def do_POST(self):
        if self.headers.get("Origin") != ORIGIN or self.headers.get("Host") != "127.0.0.1:4179":
            return self.respond(403, "Local preview required")
        lock = DRAFT.parent / "gallery.lock"
        lock.parent.mkdir(parents=True, exist_ok=True)
        with lock.open("a") as stream:
            fcntl.flock(stream, fcntl.LOCK_EX)
            self.save_review()

    def save_review(self):
        try:
            length = int(self.headers["Content-Length"])
            if not 0 < length <= 4_000_000:
                raise ValueError("Invalid size")
            data = json.loads(self.rfile.read(length))
            if data["version"] != current()[1]:
                return self.respond(409, "Another tab saved edits. Reload before editing.")
            review = data["review"]
            if not all(isinstance(review[k], str) for k in ("title", "description")) or not review["title"].strip():
                raise ValueError("A title is required")
            for edit in review["edits"].values():
                if not all(isinstance(edit[k], str) for k in ("common", "scientific")) or not edit["common"].strip():
                    raise ValueError("A bird name is required")
            if self.path not in ("/draft", "/finalize"):
                return self.respond(404, "Unknown action")
            target = FINAL if self.path == "/finalize" else DRAFT
            target.parent.mkdir(parents=True, exist_ok=True)
            tmp = target.with_suffix(".tmp")
            tmp.write_text(json.dumps(review, indent=2) + "\n")
            tmp.replace(target)
            if target == FINAL:
                DRAFT.unlink(missing_ok=True)
            self.do_GET()
        except (ValueError, TypeError, KeyError, AttributeError) as error:
            self.respond(400, str(error))


HTTPServer(("127.0.0.1", 4179), Handler).serve_forever()
