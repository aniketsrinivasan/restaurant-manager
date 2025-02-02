from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class LLMConfig(BaseModel):
    """Configuration for the LLM model."""
    model_name: str = Field(default="gpt-3.5-turbo", description="The model to use")
    temperature: float = Field(default=0.7, ge=0, le=1, description="Sampling temperature")
    max_tokens: Optional[int] = Field(default=None, description="Max tokens to generate")
    top_p: float = Field(default=1.0, description="Nucleus sampling parameter")
    presence_penalty: float = Field(default=0.0, description="Presence penalty")
    frequency_penalty: float = Field(default=0.0, description="Frequency penalty")
    
class PromptConfig(BaseModel):
    """Configuration for prompts."""
    system_message: str = Field(
        default="You are a helpful restaurant management assistant.",
        description="System message to set context"
    )
    template: Optional[str] = Field(default=None, description="Template for formatting prompts")
    input_variables: List[str] = Field(default_factory=list, description="Variables for template")

class ChainConfig(BaseModel):
    """Configuration for the LangChain setup."""
    llm_config: LLMConfig = Field(default_factory=LLMConfig)
    prompt_config: PromptConfig = Field(default_factory=PromptConfig)
    memory_type: Optional[str] = Field(default="buffer", description="Type of memory to use")
    memory_k: int = Field(default=5, description="Number of messages to keep in memory") 