#!/usr/bin/env python3
"""
Frank E. Furter — Daily Lead Refresh
Fetches recent ADA Title III filings from CourtListener, scores them,
and writes updated public/seed.json for the static Next.js build.
"""
import urllib.request
import urllib.parse
import json
import sys
import re
from datetime import datetime, timedelta
from pathlib import Path
from collections import Counter

APP_ROOT = Path(__file__).resolve().parent.parent
SEED_PATH = APP_ROOT / "public" / "seed.json"
DAYS_BACK = 30
MAX_PAGES = 10

# --- Serial filer database ---
SERIAL_FILERS = {
    "Knowles": {
        "typicalTargets": "DTC ecommerce brands — food, supplements, hosiery",
        "courts": ["NYSD"],
    },
    "Espinal": {
        "typicalTargets": "Beauty, food products, specialty consumer brands",
        "courts": ["NYSD"],
    },
    "Alvear": {
        "typicalTargets": "Footwear retailers and food service brands",
        "courts": ["FLMD"],
    },
    "Sanchez Marquez": {
        "typicalTargets": "Enterprise national chains and franchise operations",
        "courts": ["FLSD"],
    },
    "Drummond": {
        "typicalTargets": "Major retail ecommerce operations",
        "courts": ["FLMD"],
    },
}

# Courts that score higher (high-volume ADA filing districts)
HIGH_VALUE_COURTS = {"nysd", "flsd", "flmd"}

# Enterprise detection patterns
ENTERPRISE_PATTERNS = [
    r"\bInc\.?\b",
    r"\bCorp(oration)?\.?\b",
    r"\bLLC\b",
    r"\bL\.?P\.?\b",
    r"\bGroup\b",
    r"\bHoldings?\b",
    r"\bBrands?\b",
    r"\bEnterprises?\b",
    r"\bInternational\b",
    r"\bGlobal\b",
    r"\bNational\b",
    r"\bParent\b",
    r"\bFranchisor\b",
]

# Known enterprise names (partial matches)
KNOWN_ENTERPRISE = [
    "staples", "new balance", "finish line", "auntie anne",
    "walmart", "target", "amazon", "nike", "adidas", "puma",
    "mcdonald", "burger king", "wendy", "subway", "domino",
    "walgreens", "cvs", "costco", "kroger", "home depot", "lowe",
]


def fetch_dockets():
    """Fetch recent ADA 446 filings from CourtListener search API."""
    filed_after = (datetime.now() - timedelta(days=DAYS_BACK)).strftime("%Y-%m-%d")
    print(f"Fetching ADA Title III filings since {filed_after}...")

    base = "https://www.courtlistener.com/api/rest/v4/search/"
    headers = {
        "User-Agent": "FrankEFurter/1.0 (zachr.boyd@gmail.com)",
        "Accept": "application/json",
    }
    params = {
        "type": "r",
        "nature_of_suit": "446",
        "filed_after": filed_after,
        "order_by": "dateFiled desc",
    }

    results = []
    next_url = base + "?" + urllib.parse.urlencode(params)

    for page_num in range(1, MAX_PAGES + 1):
        if not next_url:
            break
        print(f"  Page {page_num}...")
        req = urllib.request.Request(next_url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            print(f"HTTP {e.code}: {e.reason}")
            sys.exit(1)
        except Exception as e:
            print(f"ERROR: {type(e).__name__}: {e}")
            sys.exit(1)

        results.extend(data.get("results", []))
        next_url = data.get("next")

    print(f"Fetched {len(results)} records")
    return results


def extract_plaintiff(case_name):
    """Extract plaintiff surname from case name like 'Knowles v. Defendant'."""
    for sep in [" v. ", " v "]:
        if sep in case_name:
            plaintiff = case_name.split(sep, 1)[0].strip()
            # Take last word as surname
            parts = plaintiff.split()
            return parts[-1] if parts else plaintiff
    return "Unknown"


def extract_defendant(case_name):
    """Extract defendant name from case name."""
    for sep in [" v. ", " v "]:
        if sep in case_name:
            return case_name.split(sep, 1)[1].strip()
    return case_name


def is_serial_filer(plaintiff):
    """Check if plaintiff matches a known serial filer."""
    plaintiff_lower = plaintiff.lower()
    for filer_name in SERIAL_FILERS:
        if filer_name.lower() in plaintiff_lower:
            return filer_name
    return None


def guess_website(defendant):
    """Best-effort website guess from defendant name."""
    # Strip legal suffixes
    name = re.sub(r",?\s*(Inc\.?|LLC|Corp\.?|Ltd\.?|L\.?P\.?|Co\.?)$", "", defendant, flags=re.IGNORECASE).strip()
    # Lowercase, remove special chars, join
    slug = re.sub(r"[^a-z0-9]+", "", name.lower())
    if slug:
        return f"{slug}.com"
    return "N/A"


def guess_industry(defendant):
    """Simple industry guess from defendant name keywords."""
    d = defendant.lower()
    if any(w in d for w in ["food", "sauce", "kitchen", "gourmet", "fish", "fry", "nutrition", "vitamin"]):
        return "Food & Nutrition"
    if any(w in d for w in ["shoe", "footwear", "athletic", "balance", "hosiery", "apparel"]):
        return "Footwear & Apparel"
    if any(w in d for w in ["beauty", "cosmetic", "skincare"]):
        return "Beauty & Personal Care"
    if any(w in d for w in ["restaurant", "cafe", "pizza", "burger", "grill"]):
        return "Food Service"
    if any(w in d for w in ["tech", "software", "digital"]):
        return "Technology"
    return "Consumer Products"


def is_enterprise(defendant):
    """Check if defendant looks like an enterprise/large company."""
    d_lower = defendant.lower()
    if any(name in d_lower for name in KNOWN_ENTERPRISE):
        return True
    # Multiple enterprise pattern matches = likely large company
    matches = sum(1 for pat in ENTERPRISE_PATTERNS if re.search(pat, defendant, re.IGNORECASE))
    return matches >= 2


def score_record(record, filer_counts):
    """Score a CourtListener record. Returns (score, breakdown)."""
    score = 0
    reasons = []

    case_name = record.get("caseName", "")
    plaintiff = extract_plaintiff(case_name)
    court_id = record.get("court_id", "")
    date_filed = record.get("dateFiled", "")

    # Serial filer check (+50)
    filer = is_serial_filer(plaintiff)
    if filer:
        score += 50
        reasons.append(f"{filer} is a serial website-ADA filer")

    # ADA nature of suit (+25)
    nos = str(record.get("suitNature", ""))
    if "446" in nos:
        score += 25
        reasons.append("ADA Title III filing")

    # High-value court (+10)
    if court_id in HIGH_VALUE_COURTS:
        score += 10
        reasons.append(f"Filed in high-volume ADA court")

    # Recent filing (+10)
    if date_filed:
        try:
            filed_date = datetime.strptime(date_filed, "%Y-%m-%d")
            days_ago = (datetime.now() - filed_date).days
            if days_ago <= 7:
                score += 10
                reasons.append("Filed within the last 7 days")
        except ValueError:
            pass

    # Ecommerce plaintiff pattern (+5)
    cause = str(record.get("cause", "")).lower()
    case_lower = case_name.lower()
    if any(w in case_lower or w in cause for w in ["website", "digital", ".com", "online", "web accessibility"]):
        score += 5
        reasons.append("Website/digital accessibility pattern detected")

    return score, reasons


def generate_rationale(defendant, plaintiff, court_id, reasons, industry):
    """Generate a template-based whyItMatters rationale."""
    filer = is_serial_filer(plaintiff)
    court_name = {
        "nysd": "S.D. New York",
        "flsd": "S.D. Florida",
        "flmd": "M.D. Florida",
        "cacd": "C.D. California",
        "wied": "E.D. Wisconsin",
    }.get(court_id, court_id.upper())

    parts = [f"{industry} company sued for ADA website accessibility in {court_name}."]
    if filer:
        parts.append(f"{filer} is a known serial website-ADA filer.")
    else:
        parts.append(f"Filed by {plaintiff}.")

    return " ".join(parts)


def build_seed(records):
    """Score, filter, and build the seed.json structure."""
    # Count filings per plaintiff for serial filer stats
    plaintiff_counts = Counter()
    court_counts = Counter()

    for r in records:
        case_name = r.get("caseName", "")
        plaintiff = extract_plaintiff(case_name)
        court_id = r.get("court_id", "")
        plaintiff_counts[plaintiff] += 1
        court_counts[court_id] += 1

    # Score all records
    scored = []
    for r in records:
        score, reasons = score_record(r, plaintiff_counts)
        if score >= 85:
            scored.append((r, score, reasons))

    # Sort by score desc, then date desc
    scored.sort(key=lambda x: (-x[1], x[0].get("dateFiled", "")), reverse=False)
    scored.sort(key=lambda x: -x[1])

    # Build leads
    leads = []
    seen_defendants = set()
    for idx, (r, score, reasons) in enumerate(scored, start=1):
        case_name = r.get("caseName", "")
        defendant = extract_defendant(case_name)
        plaintiff = extract_plaintiff(case_name)
        court_id = r.get("court_id", "")
        date_filed = r.get("dateFiled", "")

        # Deduplicate by defendant name
        d_key = defendant.lower().strip()
        if d_key in seen_defendants:
            continue
        seen_defendants.add(d_key)

        website = guess_website(defendant)
        industry = guess_industry(defendant)
        enterprise = is_enterprise(defendant)
        rationale = generate_rationale(defendant, plaintiff, court_id, reasons, industry)

        # Build docket URL
        abs_url = r.get("absolute_url", "")
        if abs_url and not abs_url.startswith("http"):
            docket_url = "https://www.courtlistener.com" + abs_url
        elif abs_url:
            docket_url = abs_url
        else:
            docket_url = "https://www.courtlistener.com"

        court_name = {
            "nysd": "S.D. New York",
            "flsd": "S.D. Florida",
            "flmd": "M.D. Florida",
            "cacd": "C.D. California",
            "wied": "E.D. Wisconsin",
        }.get(court_id, court_id.upper())

        docket_number = r.get("docketNumber", "N/A")

        lead = {
            "id": idx,
            "defendant": defendant,
            "website": website,
            "industry": industry,
            "caseName": case_name,
            "plaintiff": plaintiff,
            "plaintiffFirm": "N/A",
            "court": court_name,
            "courtId": court_id,
            "docketNumber": docket_number,
            "dateFiled": date_filed,
            "docketUrl": docket_url,
            "confidenceScore": min(score, 99),
            "enterprise": enterprise,
            "verified": False,
            "hasIronyBadge": False,
            "whyItMatters": rationale,
            "coldOpen": "",
        }

        # Add briefTheAE for enterprise leads
        if enterprise:
            lead["briefTheAE"] = (
                f"{defendant} is being sued for website accessibility violations in {court_name}. "
                f"AE should reach out with a remediation timeline and compliance roadmap. "
                f"The buying trigger is live."
            )

        leads.append(lead)

    # Build serial filers stats
    serial_filers = []
    for filer_name, info in SERIAL_FILERS.items():
        count = plaintiff_counts.get(filer_name, 0)
        # Also check partial matches
        for p_name, p_count in plaintiff_counts.items():
            if filer_name.lower() in p_name.lower() and p_name != filer_name:
                count += p_count
        if count > 0:
            serial_filers.append({
                "name": filer_name,
                "casesThisMonth": count,
                "typicalTargets": info["typicalTargets"],
                "courts": info["courts"],
            })
    serial_filers.sort(key=lambda x: -x["casesThisMonth"])

    # Build district stats
    court_names = {
        "nysd": "S.D. New York",
        "flsd": "S.D. Florida",
        "flmd": "M.D. Florida",
        "cacd": "C.D. California",
        "wied": "E.D. Wisconsin",
    }
    district_stats = []
    for court_id, count in court_counts.most_common(10):
        district_stats.append({
            "court": court_names.get(court_id, court_id.upper()),
            "courtId": court_id,
            "cases": count,
        })

    seed = {
        "lastUpdated": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "leads": leads,
        "serialFilers": serial_filers,
        "districtStats": district_stats,
    }

    return seed


def main():
    records = fetch_dockets()
    if not records:
        print("No records fetched. Exiting without changes.")
        sys.exit(0)

    seed = build_seed(records)
    print(f"\nGenerated {len(seed['leads'])} leads (score >= 85)")
    print(f"Serial filers: {len(seed['serialFilers'])}")
    print(f"District stats: {len(seed['districtStats'])}")

    SEED_PATH.write_text(json.dumps(seed, indent=2, ensure_ascii=False) + "\n")
    print(f"\nWrote {SEED_PATH}")


if __name__ == "__main__":
    main()
