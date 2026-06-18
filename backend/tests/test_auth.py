"""
Tests for /api/auth/* — signup, login, and /me.

Run with:  pytest tests/test_auth.py -v
"""


def test_signup_success(client):
    """A new user can sign up and receives a valid JWT."""
    resp = client.post("/api/auth/signup", json={
        "name": "Jane Dev",
        "email": "jane@college.edu",
        "password": "securepass123",
    })

    assert resp.status_code == 201
    data = resp.json()

    # Token + user object returned
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["name"] == "Jane Dev"
    assert data["user"]["email"] == "jane@college.edu"
    assert data["user"]["post_count"] == 0

    # Password must NEVER appear in the response
    assert "password" not in data["user"]
    assert "password_hash" not in data["user"]


def test_signup_duplicate_email_rejected(client):
    """Signing up twice with the same email returns 409 Conflict."""
    payload = {"name": "Jane", "email": "dupe@example.com", "password": "password1"}

    first = client.post("/api/auth/signup", json=payload)
    assert first.status_code == 201

    second = client.post("/api/auth/signup", json=payload)
    assert second.status_code == 409
    assert "already exists" in second.json()["detail"].lower()


def test_signup_short_password_rejected(client):
    """Passwords under 6 characters are rejected by Pydantic validation."""
    resp = client.post("/api/auth/signup", json={
        "name": "Jane",
        "email": "shortpw@example.com",
        "password": "123",
    })
    assert resp.status_code == 422  # Pydantic validation error


def test_signup_invalid_email_rejected(client):
    """Malformed emails are rejected by EmailStr validation."""
    resp = client.post("/api/auth/signup", json={
        "name": "Jane",
        "email": "not-an-email",
        "password": "password123",
    })
    assert resp.status_code == 422


def test_login_success(client):
    """A registered user can log in with correct credentials."""
    client.post("/api/auth/signup", json={
        "name": "Bob", "email": "bob@example.com", "password": "mypassword1",
    })

    resp = client.post("/api/auth/login", json={
        "email": "bob@example.com", "password": "mypassword1",
    })

    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == "bob@example.com"


def test_login_wrong_password_rejected(client):
    """Logging in with the wrong password returns 401."""
    client.post("/api/auth/signup", json={
        "name": "Bob", "email": "bob2@example.com", "password": "correctpass",
    })

    resp = client.post("/api/auth/login", json={
        "email": "bob2@example.com", "password": "wrongpass",
    })

    assert resp.status_code == 401
    assert "invalid" in resp.json()["detail"].lower()


def test_login_nonexistent_user_rejected(client):
    """Logging in with an email that was never registered returns 401."""
    resp = client.post("/api/auth/login", json={
        "email": "ghost@example.com", "password": "whatever123",
    })
    assert resp.status_code == 401


def test_me_requires_token(client):
    """GET /me without a token returns 401/403 (no credentials provided)."""
    resp = client.get("/api/auth/me")
    assert resp.status_code in (401, 403)


def test_me_returns_current_user(client, auth_headers):
    """GET /me with a valid token returns the logged-in user's data."""
    resp = client.get("/api/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "testuser@example.com"


def test_me_rejects_invalid_token(client):
    """A malformed/garbage token is rejected with 401."""
    resp = client.get("/api/auth/me", headers={"Authorization": "Bearer not-a-real-token"})
    assert resp.status_code == 401


def test_password_is_hashed_not_stored_plain(client, db_session):
    """The stored password_hash must never equal the plain password."""
    from app.models.models import User

    client.post("/api/auth/signup", json={
        "name": "Secure User", "email": "secure@example.com", "password": "plaintext123",
    })

    user = db_session.query(User).filter(User.email == "secure@example.com").first()
    assert user is not None
    assert user.password_hash != "plaintext123"
    assert user.password_hash.startswith("$2b$")  # bcrypt hash prefix
