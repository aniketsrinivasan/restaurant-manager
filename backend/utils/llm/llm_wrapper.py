from dataclasses import dataclass
from typing import Optional, Type, Any, List
import os
import getpass
from langchain_openai import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel

@dataclass
class LanguageModelConfig:
    model: str = "openai"
    model_name: str = "gpt-4"
    temperature: float = 0
    max_tokens: Optional[int] = None
    timeout: Optional[float] = None
    max_retries: int = 1


class LanguageModel:
    def __init__(self, config: LanguageModelConfig, structured_output: Type[BaseModel] = None):
        self.config = config
        self.structured_output = structured_output
        self.output_parser = PydanticOutputParser(pydantic_object=structured_output) if structured_output else None

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

    def get_structured_response(self, system_prompt: str) -> Any:
        """
        Invokes the LLM and parses the output into the specified structure.
        """
        assert self.output_parser is not None, "Output parser has not been defined."
        
        # Add format instructions to the prompt
        format_instructions = self.output_parser.get_format_instructions()
        formatted_prompt = f"""
        {system_prompt}

        {format_instructions}
        """
        
        # Get response from LLM
        response = self.model.invoke(formatted_prompt)
        
        # Parse the response into the structured output
        try:
            return self.output_parser.parse(response.content)
        except Exception as e:
            raise ValueError(f"Failed to parse LLM response into structured output: {str(e)}")

# Export these classes
__all__ = ['LanguageModel', 'LanguageModelConfig']
