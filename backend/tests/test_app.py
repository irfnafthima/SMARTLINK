import json
import pytest
from app.models import Url, ClickEvent

# ==============================================================================
# CREATE TESTS (1 - 4)
# ==============================================================================

def test_01_create_valid_url(client):
    """Test 1: Create a valid URL with HTTP/HTTPS."""
    res = client.post("/api/urls", json={"url": "https://www.northstar.studio/notes"})
    assert res.status_code == 201
    data = res.get_json()
    assert "id" in data
    assert data["original_url"] == "https://www.northstar.studio/notes"
    assert len(data["short_code"]) > 0
    assert "/s/" in data["short_url"]
    assert data["click_count"] == 0

def test_02_reject_invalid_url_schemes(client):
    """Test 2: Reject invalid URLs (ftp://, javascript:, missing domains)."""
    # Test non-HTTP scheme
    res_ftp = client.post("/api/urls", json={"url": "ftp://files.example.com/item.zip"})
    assert res_ftp.status_code == 400
    assert "Only HTTP and HTTPS" in res_ftp.get_json()["error"]

    # Test javascript injection
    res_js = client.post("/api/urls", json={"url": "javascript:alert('xss')"})
    assert res_js.status_code == 400

    # Test missing domain
    res_empty = client.post("/api/urls", json={"url": "https://"})
    assert res_empty.status_code == 400

    # Test empty payload
    res_none = client.post("/api/urls", json={})
    assert res_none.status_code == 400

def test_03_generate_unique_short_code(client):
    """Test 3: Automatically generate unique random short codes."""
    res1 = client.post("/api/urls", json={"url": "https://alpha.example.com"})
    res2 = client.post("/api/urls", json={"url": "https://beta.example.com"})
    assert res1.status_code == 201
    assert res2.status_code == 201
    code1 = res1.get_json()["short_code"]
    code2 = res2.get_json()["short_code"]
    assert code1 != code2
    assert len(code1) >= 6

def test_04_reject_duplicate_custom_alias(client):
    """Test 4: Reject duplicate custom aliases with HTTP 409 Conflict."""
    res1 = client.post("/api/urls", json={"url": "https://github.com", "custom_alias": "custom-slug"})
    assert res1.status_code == 201
    assert res1.get_json()["short_code"] == "custom-slug"

    # Attempt second link with same alias
    res2 = client.post("/api/urls", json={"url": "https://gitlab.com", "custom_alias": "custom-slug"})
    assert res2.status_code == 409
    assert "already in use" in res2.get_json()["error"]

# ==============================================================================
# READ TESTS (5 - 8)
# ==============================================================================

def test_05_read_all_urls(client):
    """Test 5: Retrieve all URLs and support query filtering."""
    client.post("/api/urls", json={"url": "https://design.com/item", "custom_alias": "design-link"})
    client.post("/api/urls", json={"url": "https://tech.com/article", "custom_alias": "tech-link"})

    res = client.get("/api/urls")
    assert res.status_code == 200
    links = res.get_json()
    assert len(links) >= 2

    # Test search filter
    search_res = client.get("/api/urls?q=design")
    assert search_res.status_code == 200
    search_links = search_res.get_json()
    assert len(search_links) == 1
    assert search_links[0]["short_code"] == "design-link"

def test_06_read_single_url_by_id(client):
    """Test 6: Retrieve one URL by its ID."""
    created = client.post("/api/urls", json={"url": "https://lookup.example.com"}).get_json()
    url_id = created["id"]

    res = client.get(f"/api/urls/{url_id}")
    assert res.status_code == 200
    data = res.get_json()
    assert data["id"] == url_id
    assert data["original_url"] == "https://lookup.example.com"

def test_07_read_nonexistent_url(client):
    """Test 7: Handle nonexistent record lookup with HTTP 404."""
    res = client.get("/api/urls/999999")
    assert res.status_code == 404
    assert "not found" in res.get_json()["error"].lower()

def test_08_verify_accurate_dashboard_statistics(client):
    """Test 8: Verify dashboard statistics reflect real database aggregations."""
    c1 = client.post("/api/urls", json={"url": "https://site-one.com"}).get_json()
    c2 = client.post("/api/urls", json={"url": "https://site-two.com"}).get_json()

    # Trigger clicks
    client.get(f"/s/{c1['short_code']}")
    client.get(f"/s/{c1['short_code']}")
    client.get(f"/s/{c2['short_code']}")

    stats_res = client.get("/api/dashboard/stats")
    assert stats_res.status_code == 200
    stats = stats_res.get_json()
    assert stats["total_links"] == 2
    assert stats["total_clicks"] == 3
    assert stats["active_links"] == 2
    assert stats["avg_clicks"] == 1.5

# ==============================================================================
# UPDATE TESTS (9 - 15)
# ==============================================================================

def test_09_update_original_url(client):
    """Test 9: Update original destination URL."""
    created = client.post("/api/urls", json={"url": "https://initial.example.com"}).get_json()
    url_id = created["id"]

    update_res = client.put(f"/api/urls/{url_id}", json={"url": "https://updated.example.com"})
    assert update_res.status_code == 200
    updated = update_res.get_json()
    assert updated["id"] == url_id
    assert updated["original_url"] == "https://updated.example.com"

def test_10_update_custom_short_code(client):
    """Test 10: Update custom short code."""
    created = client.post("/api/urls", json={"url": "https://site.example.com", "custom_alias": "old-code"}).get_json()
    url_id = created["id"]

    update_res = client.put(f"/api/urls/{url_id}", json={"short_code": "new-code"})
    assert update_res.status_code == 200
    updated = update_res.get_json()
    assert updated["short_code"] == "new-code"
    assert "/s/new-code" in updated["short_url"]

    # Old code now 404s, new code works
    assert client.get("/s/old-code", headers={"Accept": "application/json"}).status_code == 404
    assert client.get("/s/new-code").status_code == 302

def test_11_update_reject_duplicate_short_code(client):
    """Test 11: Reject updating short code to an existing alias held by another link."""
    link_a = client.post("/api/urls", json={"url": "https://a.com", "custom_alias": "code-a"}).get_json()
    link_b = client.post("/api/urls", json={"url": "https://b.com", "custom_alias": "code-b"}).get_json()

    # Try updating link_b to code-a
    res = client.put(f"/api/urls/{link_b['id']}", json={"short_code": "code-a"})
    assert res.status_code == 409
    assert "already in use" in res.get_json()["error"]

def test_12_update_reject_invalid_url(client):
    """Test 12: Reject invalid destination URL during update."""
    created = client.post("/api/urls", json={"url": "https://valid.example.com"}).get_json()
    res = client.put(f"/api/urls/{created['id']}", json={"url": "invalid-url-without-scheme"})
    assert res.status_code == 400

def test_13_update_nonexistent_url(client):
    """Test 13: Handle updating nonexistent record with HTTP 404."""
    res = client.put("/api/urls/999999", json={"url": "https://valid.example.com"})
    assert res.status_code == 404

def test_14_update_preserves_click_count(client):
    """Test 14: Updating a URL preserves click count."""
    created = client.post("/api/urls", json={"url": "https://preserve-clicks.com", "custom_alias": "count-test"}).get_json()
    url_id = created["id"]

    # Click 3 times
    client.get("/s/count-test")
    client.get("/s/count-test")
    client.get("/s/count-test")

    # Update destination and short code
    client.put(f"/api/urls/{url_id}", json={
        "url": "https://preserve-clicks.com/updated",
        "short_code": "count-test-2"
    })

    # Verify click_count is still 3
    url_info = client.get(f"/api/urls/{url_id}").get_json()
    assert url_info["click_count"] == 3

def test_15_update_preserves_click_history(client):
    """Test 15: Updating a URL preserves individual click events."""
    created = client.post("/api/urls", json={"url": "https://history-test.com", "custom_alias": "hist-slug"}).get_json()
    url_id = created["id"]

    client.get("/s/hist-slug", headers={"Referer": "https://twitter.com"})
    client.get("/s/hist-slug", headers={"Referer": "https://reddit.com"})

    # Update record
    client.put(f"/api/urls/{url_id}", json={"url": "https://history-test.com/new"})

    # Verify events
    analytics = client.get(f"/api/analytics/{url_id}").get_json()
    assert analytics["total_clicks"] == 2
    assert len(analytics["recent_events"]) == 2

# ==============================================================================
# DELETE TESTS (16 - 18)
# ==============================================================================

def test_16_delete_existing_url(client):
    """Test 16: Delete an existing URL record."""
    created = client.post("/api/urls", json={"url": "https://to-delete.com"}).get_json()
    url_id = created["id"]

    res = client.delete(f"/api/urls/{url_id}")
    assert res.status_code == 200
    assert "deleted" in res.get_json()["message"].lower()

    # Verify record is gone
    assert client.get(f"/api/urls/{url_id}").status_code == 404

def test_17_delete_nonexistent_url(client):
    """Test 17: Handle deleting nonexistent record with HTTP 404."""
    res = client.delete("/api/urls/999999")
    assert res.status_code == 404

def test_18_delete_cascades_click_events(client):
    """Test 18: Deleting a URL cascades and removes associated click events."""
    created = client.post("/api/urls", json={"url": "https://cascade-delete.com", "custom_alias": "cascade-slug"}).get_json()
    url_id = created["id"]

    client.get("/s/cascade-slug")
    client.get("/s/cascade-slug")

    # Delete URL
    res = client.delete(f"/api/urls/{url_id}")
    assert res.status_code == 200

    # Verify redirect 404s
    assert client.get("/s/cascade-slug", headers={"Accept": "application/json"}).status_code == 404

# ==============================================================================
# ADDITIONAL REDIRECTION & TELEMETRY TESTS (19 - 22)
# ==============================================================================

def test_19_url_redirection_workflow(client):
    """Test 19: HTTP 302 Redirection to target location."""
    created = client.post("/api/urls", json={"url": "https://destination.com/landing", "custom_alias": "target-dest"}).get_json()
    res = client.get("/s/target-dest")
    assert res.status_code == 302
    assert res.location == "https://destination.com/landing"

def test_20_redirection_increments_click_count(client):
    """Test 20: Every access increments click count atomically."""
    created = client.post("/api/urls", json={"url": "https://counter.com", "custom_alias": "counter-slug"}).get_json()
    url_id = created["id"]

    assert client.get(f"/api/urls/{url_id}").get_json()["click_count"] == 0
    client.get("/s/counter-slug")
    assert client.get(f"/api/urls/{url_id}").get_json()["click_count"] == 1
    client.get("/s/counter-slug")
    assert client.get(f"/api/urls/{url_id}").get_json()["click_count"] == 2

def test_21_redirection_stores_click_event_metadata(client):
    """Test 21: Redirection stores referrer and user agent in click_events."""
    created = client.post("/api/urls", json={"url": "https://telemetry.com", "custom_alias": "meta-slug"}).get_json()
    url_id = created["id"]

    client.get("/s/meta-slug", headers={
        "Referer": "https://news.ycombinator.com",
        "User-Agent": "SmartLinkTestBrowser/2.0"
    })

    analytics = client.get(f"/api/analytics/{url_id}").get_json()
    events = analytics["recent_events"]
    assert len(events) == 1
    assert events[0]["referrer"] == "https://news.ycombinator.com"
    assert events[0]["user_agent"] == "SmartLinkTestBrowser/2.0"

def test_22_invalid_short_code_returns_404(client):
    """Test 22: Accessing invalid or nonexistent short code returns HTTP 404."""
    res_json = client.get("/s/completely-invalid-slug", headers={"Accept": "application/json"})
    assert res_json.status_code == 404

    res_html = client.get("/s/completely-invalid-slug", headers={"Accept": "text/html"})
    assert res_html.status_code == 404
    assert b"Link Not Found" in res_html.data
