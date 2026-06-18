"""
Tests for /api/users/* — profiles, search, notifications.

Run with:  pytest tests/test_users.py -v
"""


def test_get_own_profile(client, auth_headers):
    """A user can fetch their own profile by ID."""
    me = client.get("/api/auth/me", headers=auth_headers).json()

    resp = client.get(f"/api/users/{me['id']}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "testuser@example.com"
    assert resp.json()["post_count"] == 0


def test_get_nonexistent_profile_404(client, auth_headers):
    resp = client.get("/api/users/99999", headers=auth_headers)
    assert resp.status_code == 404


def test_update_profile(client, auth_headers):
    """A user can update their bio and name."""
    resp = client.patch("/api/users/me/profile", json={
        "name": "Updated Name",
        "bio": "I love building things.",
    }, headers=auth_headers)

    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Updated Name"
    assert data["bio"] == "I love building things."


def test_get_user_posts(client, auth_headers):
    """A user's posts are returned newest-first."""
    me = client.get("/api/auth/me", headers=auth_headers).json()

    client.post("/api/posts/", json={"content": "My first post"}, headers=auth_headers)
    client.post("/api/posts/", json={"content": "My second post"}, headers=auth_headers)

    resp = client.get(f"/api/users/{me['id']}/posts", headers=auth_headers)
    assert resp.status_code == 200
    posts = resp.json()
    assert len(posts) == 2
    assert posts[0]["content"] == "My second post"


def test_search_users_by_name(client, auth_headers):
    """Searching by partial name returns matching users."""
    client.post("/api/auth/signup", json={
        "name": "Alice Wonderland", "email": "alice@example.com", "password": "alicepass1",
    })

    resp = client.get("/api/users/search?q=Alice", headers=auth_headers)
    assert resp.status_code == 200
    results = resp.json()
    assert any(u["name"] == "Alice Wonderland" for u in results)


# ── Notifications ──────────────────────────────────────────────────────────────

def test_like_creates_notification_for_post_owner(client):
    """When user B likes user A's post, A receives a notification."""
    # User A creates a post
    a = client.post("/api/auth/signup", json={
        "name": "Alice", "email": "alice2@example.com", "password": "alicepass1",
    })
    a_headers = {"Authorization": f"Bearer {a.json()['access_token']}"}
    post = client.post("/api/posts/", json={"content": "Notify me"}, headers=a_headers)
    post_id = post.json()["id"]

    # User B likes it
    b = client.post("/api/auth/signup", json={
        "name": "Bob", "email": "bob3@example.com", "password": "bobpassword1",
    })
    b_headers = {"Authorization": f"Bearer {b.json()['access_token']}"}
    client.post(f"/api/posts/{post_id}/like", headers=b_headers)

    # User A checks notifications
    notifs = client.get("/api/users/notifications", headers=a_headers)
    assert notifs.status_code == 200
    data = notifs.json()
    assert len(data) == 1
    assert data[0]["actor_name"] == "Bob"
    assert data[0]["action"] == "liked your post"
    assert data[0]["is_read"] is False


def test_liking_own_post_creates_no_notification(client, auth_headers):
    """Self-likes should not generate a notification."""
    post = client.post("/api/posts/", json={"content": "My own post"}, headers=auth_headers)
    post_id = post.json()["id"]

    client.post(f"/api/posts/{post_id}/like", headers=auth_headers)

    notifs = client.get("/api/users/notifications", headers=auth_headers)
    assert notifs.json() == []


def test_mark_notifications_read(client):
    """Marking notifications read sets is_read=True for all of them."""
    a = client.post("/api/auth/signup", json={
        "name": "Alice", "email": "alice3@example.com", "password": "alicepass1",
    })
    a_headers = {"Authorization": f"Bearer {a.json()['access_token']}"}
    post = client.post("/api/posts/", json={"content": "Read me"}, headers=a_headers)
    post_id = post.json()["id"]

    b = client.post("/api/auth/signup", json={
        "name": "Bob", "email": "bob4@example.com", "password": "bobpassword1",
    })
    b_headers = {"Authorization": f"Bearer {b.json()['access_token']}"}
    client.post(f"/api/posts/{post_id}/like", headers=b_headers)

    # Mark as read
    mark = client.post("/api/users/notifications/read", headers=a_headers)
    assert mark.status_code == 200

    notifs = client.get("/api/users/notifications", headers=a_headers)
    assert all(n["is_read"] is True for n in notifs.json())
