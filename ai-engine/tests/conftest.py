import os
import pytest

# CRITICAL: These must execute BEFORE any other imports to protect the config
os.environ["ENVIRONMENT"] = "testing"
os.environ["AI_SERVICE_API_KEY"] = "reliefchain_test_secure_key_2026"

@pytest.fixture(autouse=True, scope="session")
def setup_test_env():
    """Session-wide test environment setup."""
    yield