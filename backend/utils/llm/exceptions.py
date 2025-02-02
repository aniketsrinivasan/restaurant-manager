class LLMError(Exception):
    """Base exception for LLM-related errors."""
    pass

class ConfigurationError(LLMError):
    """Raised when there's an issue with the configuration."""
    pass

class ModelError(LLMError):
    """Raised when there's an error with the LLM model."""
    pass

class MemoryError(LLMError):
    """Raised when there's an error with conversation memory."""
    pass

class PromptError(LLMError):
    """Raised when there's an error with prompt formatting."""
    pass 