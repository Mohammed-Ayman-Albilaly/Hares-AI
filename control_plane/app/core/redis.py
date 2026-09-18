import redis
import os
from typing import Optional

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

class RedisClient:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RedisClient, cls).__new__(cls)
            cls._instance.client = redis.from_url(REDIS_URL, decode_responses=True)
        return cls._instance

    def get_client(self):
        return self.client

redis_client = RedisClient().get_client()
