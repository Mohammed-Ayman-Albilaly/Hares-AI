import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.main import app, get_db
from app.models import Base, User, Role, Department
from app.auth import AuthHandler

# DB Configuration
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/hares_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

client = TestClient(app)

def seed_test_data():
    db = SessionLocal()
    try:
        # Ensure Department exists
        dept = db.query(Department).filter(Department.name == "Engineering").first()
        if not dept:
            dept = Department(name="Engineering")
            db.add(dept)
            db.commit()
            db.refresh(dept)
        
        # Ensure Role exists
        role = db.query(Role).filter(Role.name == "Admin").first()
        if not role:
            role = Role(name="Admin", permissions="all")
            db.add(role)
            db.commit()
            db.refresh(role)
        
        # Ensure User exists and has the correct password
        test_email = "test@hares.ai"
        user = db.query(User).filter(User.email == test_email).first()
        hashed_pw = AuthHandler.get_password_hash("password123")
        
        if not user:
            user = User(
                email=test_email,
                password_hash=hashed_pw,
                full_name="Test User",
                dept_id=dept.id,
                role_id=role.id
            )
            db.add(user)
            db.commit()
        else:
            # Update password just in case it was different
            user.password_hash = hashed_pw
            db.commit()
            
        print(f"Seeded/Verified test user: {test_email}")
    except Exception as e:
        print(f"Seeding error: {e}")
    finally:
        db.close()

def test_auth_flow():
    print("\n--- Starting Auth Flow Verification ---")
    
    # 1. Test Login
    print("Testing /api/v1/auth/login...")
    login_data = {
        "username": "test@hares.ai",
        "password": "password123"
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    
    assert response.status_code == 200, f"Login failed: {response.text}"
    token = response.json().get("access_token")
    assert token is not None, "No access token returned"
    print("OK: Login successful, token generated.")

    # 2. Test Validation
    print("Testing /api/v1/auth/validate...")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/auth/validate", headers=headers)
    
    assert response.status_code == 200, f"Validation failed: {response.text}"
    user_data = response.json()
    assert user_data["email"] == "test@hares.ai", "User identity mismatch"
    assert user_data["full_name"] == "Test User", "User data mismatch"
    print("OK: Token validation successful, user identity matched.")

    # 3. Test Invalid Token
    print("Testing /api/v1/auth/validate with invalid token...")
    headers_invalid = {"Authorization": "Bearer invalid_token_123"}
    response = client.get("/api/v1/auth/validate", headers=headers_invalid)
    assert response.status_code == 401, "Invalid token should return 401"
    print("OK: Invalid token correctly rejected.")

    # 4. Test Wrong Credentials
    print("Testing /api/v1/auth/login with wrong password...")
    wrong_login = {"username": "test@hares.ai", "password": "wrongpassword"}
    response = client.post("/api/v1/auth/login", data=wrong_login)
    assert response.status_code == 401, "Wrong password should return 401"
    print("OK: Wrong credentials correctly rejected.")

    print("\n--- All Auth Verification Tests Passed! ---")

if __name__ == "__main__":
    seed_test_data()
    try:
        test_auth_flow()
    except AssertionError as e:
        print(f"TEST FAILED: {e}")
        exit(1)
    except Exception as e:
        print(f"UNEXPECTED ERROR: {e}")
        exit(1)
