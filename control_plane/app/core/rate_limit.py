from slowapi import Limiter
from slowapi.util import get_remote_address

# Rate Limiter setup
limiter = Limiter(key_func=get_remote_address)
_rate_limit = limiter.limit
