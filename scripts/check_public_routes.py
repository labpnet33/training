#!/usr/bin/env python3
"""Check a deployed CONFIG replica for route and public-asset regressions.

Examples:
  python3 scripts/check_public_routes.py --base-url http://127.0.0.1:8789
  python3 scripts/check_public_routes.py --base-url https://your-site.vercel.app --json report.json
  python3 scripts/check_public_routes.py --base-url https://your-site.vercel.app --check-external

The checker intentionally treats third-party URLs as informational unless
--check-external is supplied. It never sends credentials or mutating requests.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass
from pathlib import Path

DYNAMIC_EXAMPLES = {
    "/track/:id": "/track/ccna",
    "/module/:id": "/module/ccna-ospf",
    "/lab/:module/:lab": "/lab/ccna-ospf/ospf-build",
    "/experience/ticket/:id": "/experience/ticket/INC0010432",
    "/experience/certificate/:id": "/experience/certificate/demo",
    "/project/:id": "/project/demo",
    "/exam/result/:id": "/exam/result/demo",
    "/ccie-mock/:id": "/ccie-mock/demo",
    "/ccie-dc-mock/:id": "/ccie-dc-mock/demo",
    "/ccie-sec-mock/:id": "/ccie-sec-mock/demo",
    "/ccie-trial/:mod": "/ccie-trial/ccie-intro",
}

LOCAL_ATTR_RE = re.compile(r"(?:src|href)=[\"']([^\"']+)[\"']", re.I)
CSS_URL_RE = re.compile(r"url\(\s*['\"]?([^)'\"]+)", re.I)
IMPORT_RE = re.compile(r"`\./([^`]+?\.js)`")

@dataclass
class Check:
    kind: str
    url: str
    status: int | None
    ok: bool
    detail: str = ""


def get(url: str, timeout: float) -> tuple[int, str, str]:
    req = urllib.request.Request(url, headers={"User-Agent": "config-public-route-checker/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            body = r.read()
            return r.status, r.headers.get_content_type(), body.decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, "", ""
    except Exception as e:
        return 0, "", str(e)


def absolute(base: str, value: str) -> str | None:
    if not value or value.startswith(("#", "data:", "blob:", "javascript:", "mailto:", "tel:")):
        return None
    return urllib.parse.urljoin(base.rstrip("/") + "/", value)


def same_origin(a: str, b: str) -> bool:
    x, y = urllib.parse.urlparse(a), urllib.parse.urlparse(b)
    return (x.scheme, x.netloc) == (y.scheme, y.netloc)


def load_manifest(base: str, timeout: float) -> tuple[list[str], list[Check]]:
    url = absolute(base, "/manus-routes.json")
    status, _, text = get(url, timeout)
    if status != 200:
        return [], [Check("manifest", url, status, False, "manifest unavailable")]
    try:
        routes = [x["path"] for x in json.loads(text)["routes"]]
        return routes, [Check("manifest", url, status, True, f"{len(routes)} routes")]
    except Exception as e:
        return [], [Check("manifest", url, status, False, f"invalid JSON: {e}")]


def route_path(pattern: str) -> str:
    if pattern in DYNAMIC_EXAMPLES:
        return DYNAMIC_EXAMPLES[pattern]
    return re.sub(r":[^/]+", "sample", pattern)


def discover_asset_urls(page_url: str, text: str) -> set[str]:
    found = set()
    for raw in LOCAL_ATTR_RE.findall(text):
        url = absolute(page_url, raw)
        if url:
            found.add(url)
    for raw in CSS_URL_RE.findall(text):
        url = absolute(page_url, raw)
        if url:
            found.add(url)
    return found


def check_one(url: str, kind: str, timeout: float) -> Check:
    status, content_type, body = get(url, timeout)
    ok = 200 <= status < 400
    detail = content_type or body[:100].replace("\n", " ")
    return Check(kind, url, status or None, ok, detail)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--base-url", required=True, help="deployed site URL")
    ap.add_argument("--manifest", default="", help="optional local manifest path")
    ap.add_argument("--timeout", type=float, default=15)
    ap.add_argument("--workers", type=int, default=16)
    ap.add_argument("--check-external", action="store_true", help="also request third-party URLs")
    ap.add_argument("--json", dest="json_path", help="write machine-readable report")
    args = ap.parse_args()
    base = args.base_url.rstrip("/")

    if args.manifest:
        data = json.loads(Path(args.manifest).read_text())
        routes = [x["path"] for x in data["routes"]]
        checks = [Check("manifest", args.manifest, 200, True, f"{len(routes)} routes")]
    else:
        routes, checks = load_manifest(base, args.timeout)
    if not routes:
        print("No routes found; aborting.", file=sys.stderr)
        return 2

    route_urls = {absolute(base, route_path(r)): r for r in routes}
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        route_checks = list(pool.map(lambda item: check_one(item[0], "route", args.timeout), route_urls.items()))
    checks.extend(route_checks)

    pages = []
    for c in route_checks:
        if c.ok:
            pages.append(c.url)
    assets: set[str] = set()
    for page in pages:
        status, _, text = get(page, args.timeout)
        if status == 200:
            assets.update(discover_asset_urls(page, text))

    # The application shell may load the core bundle; inspect it for all lazy chunks.
    core = next((u for u in assets if "/assets/index-" in urllib.parse.urlparse(u).path and urllib.parse.urlparse(u).path.endswith(".js")), None)
    if core:
        status, _, text = get(core, args.timeout)
        if status == 200:
            for chunk in IMPORT_RE.findall(text):
                assets.add(absolute(core, "./" + chunk))

    asset_list = sorted(assets)
    check_targets = [u for u in asset_list if args.check_external or same_origin(u, base)]
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        asset_checks = list(pool.map(lambda u: check_one(u, "asset", args.timeout), check_targets))
    checks.extend(asset_checks)

    failed = [c for c in checks if not c.ok]
    route_failed = [c for c in route_checks if not c.ok]
    asset_failed = [c for c in asset_checks if not c.ok]
    print(f"Routes: {len(route_checks)} checked, {len(route_failed)} failed")
    print(f"Assets: {len(asset_checks)} checked, {len(asset_failed)} failed")
    print(f"External assets skipped: {len(asset_list) - len(check_targets)}")
    if failed:
        print("\nFailures:")
        for c in failed:
            print(f"- [{c.kind}] {c.status or 'ERR'} {c.url} {c.detail}")
    if args.json_path:
        Path(args.json_path).write_text(json.dumps({"base_url": base, "checks": [asdict(c) for c in checks]}, indent=2) + "\n")
        print(f"Report: {args.json_path}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
