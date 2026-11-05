import re
import secrets
import string
from urllib.parse import urlparse

RESERVED_WORDS = {
    "api", "s", "dashboard", "analytics", "health", "admin",
    "links", "create", "settings", "static", "login", "register"
}

def validate_url(url: str) -> tuple[bool, str]:
    if not url or not isinstance(url, str):
        return False, "URL is required"
    
    url = url.strip()
    if len(url) > 2048:
        return False, "URL exceeds maximum length of 2048 characters"
    
    try:
        parsed = urlparse(url)
    except Exception:
        return False, "Malformed URL format"
    
    if parsed.scheme.lower() not in ("http", "https"):
        return False, "Only HTTP and HTTPS URL schemes are permitted"
    
    if not parsed.netloc:
        return False, "URL must include a valid domain name"
    
    # Must have at least a dot in host name (or localhost)
    host = parsed.netloc.split(":")[0]
    if host.lower() != "localhost" and "." not in host:
        return False, "URL host must contain a valid top-level domain"
    
    return True, ""


def validate_custom_alias(alias: str) -> tuple[bool, str]:
    if not alias:
        return True, ""
    
    alias = alias.strip()
    if len(alias) < 3 or len(alias) > 30:
        return False, "Custom alias must be between 3 and 30 characters"
    
    if not re.match(r"^[a-zA-Z0-9_-]+$", alias):
        return False, "Custom alias can only contain alphanumeric characters, hyphens, and underscores"
    
    if alias.lower() in RESERVED_WORDS:
        return False, f"The alias '{alias}' is a reserved system keyword"
    
    return True, ""


def generate_short_code(length: int = 7) -> str:
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))
