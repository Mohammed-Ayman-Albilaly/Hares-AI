from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from control_plane.app.core.redis import redis_client

# Configuration - In production, these would be in .env
SECRET_KEY = "hares_ai_super_secret_key_change_this_in_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthHandler:
    @staticmethod
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def decode_access_token(token: str) -> Optional[dict]:
        try:
            # Check if token is blacklisted in Redis
            if redis_client.exists(f"blacklist:{token}"):
                return None
            
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload if payload.get("sub") else None
        except JWTError:
            return None

    @staticmethod
    def blacklist_token(token: str, expires_in: Optional[timedelta] = None) -> None:
        # Calculate remaining TTL for the token
        # If expires_in is not provided, we'll use the default token expiry
        ttl = int(expires_in.total_seconds()) if expires_in else ACCESS_TOKEN_EXPIRE_MINUTES * 60
        redis_client.setex(f"blacklist:{token}", ttl, "true")
