from dataclasses import dataclass
from typing import Optional, Type, Any, List
import os
import getpass
import time
import asyncio
import random
from langchain_openai import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel
from openai import RateLimitError, APIError, APITimeoutError

class RetrySettings:
    MAX_RETRIES = 3
    INITIAL_RETRY_DELAY = 1  # seconds
    MAX_RETRY_DELAY = 60  # seconds
    RATE_LIMIT_DELAY = 20  # seconds

@dataclass
class LanguageModelConfig:
    model: str = "openai"
    model_name: str = "gpt-4"
    temperature: float = 0
    max_tokens: Optional[int] = None
    timeout: Optional[float] = None
    max_retries: int = RetrySettings.MAX_RETRIES
    use_async: bool = False  # Flag to control async/sync operations

def calculate_backoff(attempt: int, initial_delay: float = RetrySettings.INITIAL_RETRY_DELAY) -> float:
    """Calculate exponential backoff time with jitter"""
    delay = min(initial_delay * (2 ** (attempt - 1)), RetrySettings.MAX_RETRY_DELAY)
    jitter = delay * 0.1 * random.random()  # Add 0-10% jitter
    return delay + jitter

class LanguageModel:
    def __init__(self, config: LanguageModelConfig, structured_output: Type[BaseModel] = None):
        self.config = config
        self.structured_output = structured_output
        self.output_parser = PydanticOutputParser(pydantic_object=structured_output) if structured_output else None
        self._last_request_time = 0
        self._request_count = 0
        self._RATE_LIMIT_REQUESTS = 50  # Requests per minute limit
        self._RATE_LIMIT_WINDOW = 60  # Window in seconds

        # Initialize the underlying LLM using LangChain
        _supported_models = ["openai"]
        assert self.config.model in _supported_models, f"Model {self.config.model} not yet supported."
        
        if self.config.model == "openai":
            if "OPENAI_API_KEY" not in os.environ:
                os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter your OpenAI API key: ")
            self.model = ChatOpenAI(
                model=config.model_name,
                temperature=config.temperature,
                max_tokens=config.max_tokens,
                timeout=config.timeout,
                max_retries=config.max_retries,
            )

    def _should_rate_limit(self) -> bool:
        """Check if we should self-impose rate limiting"""
        current_time = time.time()
        if current_time - self._last_request_time > self._RATE_LIMIT_WINDOW:
            self._request_count = 0
            self._last_request_time = current_time
        return self._request_count >= self._RATE_LIMIT_REQUESTS

    async def _handle_rate_limit(self):
        """Handle rate limiting with exponential backoff"""
        if self._should_rate_limit():
            delay = RetrySettings.RATE_LIMIT_DELAY
            print(f"Self-imposed rate limit reached. Waiting {delay} seconds...")
            await asyncio.sleep(delay)
            self._request_count = 0
            self._last_request_time = time.time()

    async def _make_request_with_retries(self, prompt: str) -> Any:
        """Make API request with retries and error handling"""
        for attempt in range(1, self.config.max_retries + 1):
            try:
                await self._handle_rate_limit()
                response = await self.model.ainvoke(prompt)
                self._request_count += 1
                return response
            except RateLimitError as e:
                if attempt == self.config.max_retries:
                    raise
                delay = calculate_backoff(attempt)
                print(f"Rate limit exceeded. Retrying in {delay} seconds...")
                await asyncio.sleep(delay)
            except (APIError, APITimeoutError) as e:
                if attempt == self.config.max_retries:
                    raise
                delay = calculate_backoff(attempt)
                print(f"API error: {str(e)}. Retrying in {delay} seconds...")
                await asyncio.sleep(delay)
            except Exception as e:
                print(f"Unexpected error: {str(e)}")
                raise

    def _should_rate_limit_sync(self) -> bool:
        """Synchronous version of rate limit check"""
        current_time = time.time()
        if current_time - self._last_request_time > self._RATE_LIMIT_WINDOW:
            self._request_count = 0
            self._last_request_time = current_time
        return self._request_count >= self._RATE_LIMIT_REQUESTS

    def _handle_rate_limit_sync(self):
        """Synchronous version of rate limit handling"""
        if self._should_rate_limit_sync():
            delay = RetrySettings.RATE_LIMIT_DELAY
            print(f"Self-imposed rate limit reached. Waiting {delay} seconds...")
            time.sleep(delay)
            self._request_count = 0
            self._last_request_time = time.time()

    def _make_request_with_retries_sync(self, prompt: str) -> Any:
        """Synchronous version of request with retries"""
        for attempt in range(1, self.config.max_retries + 1):
            try:
                self._handle_rate_limit_sync()
                response = self.model.invoke(prompt)
                self._request_count += 1
                return response
            except RateLimitError as e:
                if attempt == self.config.max_retries:
                    raise
                delay = calculate_backoff(attempt)
                print(f"Rate limit exceeded. Retrying in {delay} seconds...")
                time.sleep(delay)
            except (APIError, APITimeoutError) as e:
                if attempt == self.config.max_retries:
                    raise
                delay = calculate_backoff(attempt)
                print(f"API error: {str(e)}. Retrying in {delay} seconds...")
                time.sleep(delay)
            except Exception as e:
                print(f"Unexpected error: {str(e)}")
                raise

    def get_structured_response(self, system_prompt: str) -> Any:
        """
        Get structured response using either sync or async operation based on config
        """
        if not self.config.use_async:
            return self._get_structured_response_sync(system_prompt)
        return asyncio.run(self.a_get_structured_response(system_prompt))

    def _get_structured_response_sync(self, system_prompt: str) -> Any:
        """Synchronous version of getting structured response"""
        assert self.output_parser is not None, "Output parser has not been defined."
        
        format_instructions = self.output_parser.get_format_instructions()
        formatted_prompt = f"""
        {system_prompt}

        {format_instructions}
        """
        
        response = self._make_request_with_retries_sync(formatted_prompt)
        
        try:
            return self.output_parser.parse(response.content)
        except Exception as e:
            raise ValueError(f"Failed to parse LLM response into structured output: {str(e)}")

    async def a_get_structured_response(self, system_prompt: str) -> Any:
        """
        Async version of getting structured response
        """
        assert self.output_parser is not None, "Output parser has not been defined."
        
        # Add format instructions to the prompt
        format_instructions = self.output_parser.get_format_instructions()
        formatted_prompt = f"""
        {system_prompt}

        {format_instructions}
        """
        
        # Get response from LLM
        response = await self._make_request_with_retries(formatted_prompt)
        
        # Parse the response into the structured output
        try:
            return self.output_parser.parse(response.content)
        except Exception as e:
            raise ValueError(f"Failed to parse LLM response into structured output: {str(e)}")

# Export these classes
__all__ = ['LanguageModel', 'LanguageModelConfig']
