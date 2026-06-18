"""
Tests for /api/posts/* — feed, create/delete, likes, comments.

Run with:  pytest tests/test_posts.py -v
"""


def test_create_post_success(client, auth_headers):
    """An authenticated user can create a post."""
    resp = client.post("/api/posts/", json={"content": "Hello DevConnect!"},
                       headers=auth_headers)

    assert resp.status_code == 201
    data = resp.json()
    assert data["content"] == "Hello DevConnect!"
    assert data["like_count"] == 0
    assert data["comment_count"] == 0
    assert data["liked_by_me"] is False
    assert data["author"]["name"] == "Test User"


def test_create_post_requires_auth(client):
    """Posting without a token is rejected."""
    resp = client.post("/api/posts/", json={"content": "No auth"})
    assert resp.status_code in (401, 403)


def test_create_post_empty_content_rejected(client, auth_headers):
    """Empty or whitespace-only content is rejected by validation."""
    resp = client.post("/api/posts/", json={"content": "   "}, headers=auth_headers)
    assert resp.status_code == 422


def test_create_post_too_long_rejected(client, auth_headers):
    """Content over 2000 characters is rejected."""
    resp = client.post("/api/posts/", json={"content": "x" * 2001}, headers=auth_headers)
    assert resp.status_code == 422


def test_feed_returns_posts_newest_first(client, auth_headers):
    """The feed returns posts ordered by created_at descending."""
    client.post("/api/posts/", json={"content": "First post"}, headers=auth_headers)
    client.post("/api/posts/", json={"content": "Second post"}, headers=auth_headers)

    resp = client.get("/api/posts/feed", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["total"] == 2
    assert data["posts"][0]["content"] == "Second post"  # newest first
    assert data["posts"][1]["content"] == "First post"


def test_feed_pagination(client, auth_headers):
    """has_more correctly reflects whether more pages exist."""
    for i in range(3):
        client.post("/api/posts/", json={"content": f"Post {i}"}, headers=auth_headers)

    resp = client.get("/api/posts/feed?page=1&per_page=2", headers=auth_headers)
    data = resp.json()

    assert len(data["posts"]) == 2
    assert data["has_more"] is True

    resp2 = client.get("/api/posts/feed?page=2&per_page=2", headers=auth_headers)
    data2 = resp2.json()
    assert len(data2["posts"]) == 1
    assert data2["has_more"] is False


def test_delete_own_post(client, auth_headers):
    """A user can delete their own post."""
    create = client.post("/api/posts/", json={"content": "Delete me"}, headers=auth_headers)
    post_id = create.json()["id"]

    resp = client.delete(f"/api/posts/{post_id}", headers=auth_headers)
    assert resp.status_code == 200

    feed = client.get("/api/posts/feed", headers=auth_headers)
    assert feed.json()["total"] == 0


def test_cannot_delete_others_post(client):
    """A user cannot delete another user's post (403 Forbidden)."""
    # User A creates a post
    a_signup = client.post("/api/auth/signup", json={
        "name": "Alice", "email": "alice@example.com", "password": "alicepass1",
    })
    a_headers = {"Authorization": f"Bearer {a_signup.json()['access_token']}"}
    post = client.post("/api/posts/", json={"content": "Alice's post"}, headers=a_headers)
    post_id = post.json()["id"]

    # User B tries to delete it
    b_signup = client.post("/api/auth/signup", json={
        "name": "Bob", "email": "bob@example.com", "password": "bobpassword1",
    })
    b_headers = {"Authorization": f"Bearer {b_signup.json()['access_token']}"}

    resp = client.delete(f"/api/posts/{post_id}", headers=b_headers)
    assert resp.status_code == 403


def test_delete_nonexistent_post_404(client, auth_headers):
    resp = client.delete("/api/posts/99999", headers=auth_headers)
    assert resp.status_code == 404


# ── Likes ───────────────────────────────────────────────────────────────────

def test_like_and_unlike_post(client, auth_headers):
    """Liking toggles on, liking again toggles off."""
    post = client.post("/api/posts/", json={"content": "Like this"}, headers=auth_headers)
    post_id = post.json()["id"]

    # First call → like
    like1 = client.post(f"/api/posts/{post_id}/like", headers=auth_headers)
    assert like1.status_code == 200
    assert like1.json() == {"liked": True, "like_count": 1}

    # Second call → unlike
    like2 = client.post(f"/api/posts/{post_id}/like", headers=auth_headers)
    assert like2.json() == {"liked": False, "like_count": 0}


def test_like_nonexistent_post_404(client, auth_headers):
    resp = client.post("/api/posts/99999/like", headers=auth_headers)
    assert resp.status_code == 404


def test_liked_by_me_reflects_in_feed(client, auth_headers):
    """After liking, liked_by_me is True in the feed response."""
    post = client.post("/api/posts/", json={"content": "Check like flag"}, headers=auth_headers)
    post_id = post.json()["id"]
    client.post(f"/api/posts/{post_id}/like", headers=auth_headers)

    feed = client.get("/api/posts/feed", headers=auth_headers)
    assert feed.json()["posts"][0]["liked_by_me"] is True
    assert feed.json()["posts"][0]["like_count"] == 1


# ── Comments ──────────────────────────────────────────────────────────────────

def test_add_and_get_comments(client, auth_headers):
    """Comments can be added and retrieved in chronological order."""
    post = client.post("/api/posts/", json={"content": "Comment on this"}, headers=auth_headers)
    post_id = post.json()["id"]

    c1 = client.post(f"/api/posts/{post_id}/comments", json={"content": "First!"}, headers=auth_headers)
    assert c1.status_code == 201
    assert c1.json()["content"] == "First!"
    assert c1.json()["author"]["name"] == "Test User"

    client.post(f"/api/posts/{post_id}/comments", json={"content": "Second!"}, headers=auth_headers)

    comments = client.get(f"/api/posts/{post_id}/comments", headers=auth_headers)
    assert comments.status_code == 200
    assert len(comments.json()) == 2
    assert comments.json()[0]["content"] == "First!"  # oldest first


def test_comment_on_nonexistent_post_404(client, auth_headers):
    resp = client.post("/api/posts/99999/comments", json={"content": "Hi"}, headers=auth_headers)
    assert resp.status_code == 404


def test_empty_comment_rejected(client, auth_headers):
    post = client.post("/api/posts/", json={"content": "Post"}, headers=auth_headers)
    post_id = post.json()["id"]

    resp = client.post(f"/api/posts/{post_id}/comments", json={"content": "  "}, headers=auth_headers)
    assert resp.status_code == 422


# ── Search ────────────────────────────────────────────────────────────────────

def test_search_posts_by_content(client, auth_headers):
    client.post("/api/posts/", json={"content": "Learning FastAPI is fun"}, headers=auth_headers)
    client.post("/api/posts/", json={"content": "React hooks are great"}, headers=auth_headers)

    resp = client.get("/api/posts/search/posts?q=FastAPI", headers=auth_headers)
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) == 1
    assert "FastAPI" in results[0]["content"]
