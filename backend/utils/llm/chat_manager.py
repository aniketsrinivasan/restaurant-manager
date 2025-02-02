from langchain.chat_models import ChatOpenAI
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory, ConversationBufferWindowMemory
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import SystemMessage, HumanMessage
from typing import Optional, Dict, Any, List
import logging
import os
import json
from datetime import datetime

from .config import ChainConfig, LLMConfig, PromptConfig
from .exceptions import ConfigurationError, ModelError, MemoryError, PromptError

# Setup logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Create handlers
console_handler = logging.StreamHandler()
file_handler = logging.FileHandler('restaurant_chat.log')

# Create formatters and add it to handlers
log_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console_handler.setFormatter(log_format)
file_handler.setFormatter(log_format)

# Add handlers to the logger
logger.addHandler(console_handler)
logger.addHandler(file_handler)

class RestaurantChatManager:
    """Manager for restaurant-specific chat interactions using LangChain."""
    
    def __init__(self, config: Optional[ChainConfig] = None):
        try:
            logger.info("Initializing RestaurantChatManager")
            self.config = config or ChainConfig()
            self.llm = self._setup_llm()
            self.memory = self._setup_memory()
            self.chain = self._setup_chain()
            logger.info("RestaurantChatManager initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize RestaurantChatManager: {str(e)}")
            raise ConfigurationError(f"Failed to initialize chat manager: {str(e)}")
        
    def _setup_llm(self) -> ChatOpenAI:
        """Initialize the language model."""
        try:
            logger.debug(f"Setting up LLM with config: {self.config.llm_config}")
            if not os.getenv("OPENAI_API_KEY"):
                raise ConfigurationError("OPENAI_API_KEY environment variable not set")
            
            return ChatOpenAI(
                model_name=self.config.llm_config.model_name,
                temperature=self.config.llm_config.temperature,
                max_tokens=self.config.llm_config.max_tokens,
                top_p=self.config.llm_config.top_p,
                presence_penalty=self.config.llm_config.presence_penalty,
                frequency_penalty=self.config.llm_config.frequency_penalty,
            )
        except Exception as e:
            logger.error(f"Failed to setup LLM: {str(e)}")
            raise ModelError(f"Failed to initialize language model: {str(e)}")
    
    def _setup_memory(self):
        """Initialize conversation memory."""
        try:
            logger.debug(f"Setting up memory with type: {self.config.memory_type}")
            if self.config.memory_type == "buffer_window":
                return ConversationBufferWindowMemory(
                    k=self.config.memory_k,
                    return_messages=True
                )
            return ConversationBufferMemory(return_messages=True)
        except Exception as e:
            logger.error(f"Failed to setup memory: {str(e)}")
            raise MemoryError(f"Failed to initialize conversation memory: {str(e)}")
    
    def _setup_chain(self) -> ConversationChain:
        """Initialize the conversation chain."""
        try:
            logger.debug("Setting up conversation chain")
            prompt = ChatPromptTemplate.from_messages([
                SystemMessage(content=self.config.prompt_config.system_message),
                MessagesPlaceholder(variable_name="history"),
                ("human", "{input}")
            ])
            
            return ConversationChain(
                llm=self.llm,
                memory=self.memory,
                prompt=prompt,
                verbose=True
            )
        except Exception as e:
            logger.error(f"Failed to setup conversation chain: {str(e)}")
            raise PromptError(f"Failed to initialize conversation chain: {str(e)}")
    
    async def process_message(self, message: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Process a message with optional context."""
        try:
            logger.info(f"Processing message: {message[:50]}...")
            if context:
                logger.debug(f"Context provided: {json.dumps(context)}")
                formatted_message = f"Context: {context}\nUser message: {message}"
            else:
                formatted_message = message
            
            logger.debug(f"Sending formatted message to LLM: {formatted_message[:100]}...")
            response = await self.chain.apredict(input=formatted_message)
            logger.info("Message processed successfully")
            
            # Log the interaction
            self._log_interaction(message, response, context)
            
            return response
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            raise ModelError(f"Failed to process message: {str(e)}")
    
    def _log_interaction(self, message: str, response: str, context: Optional[Dict[str, Any]] = None):
        """Log the interaction details."""
        interaction = {
            'timestamp': datetime.now().isoformat(),
            'message': message,
            'response': response,
            'context': context
        }
        logger.debug(f"Interaction logged: {json.dumps(interaction)}")
    
    def get_conversation_history(self) -> List[Dict[str, str]]:
        """Get the conversation history."""
        try:
            logger.debug("Retrieving conversation history")
            return self.memory.chat_memory.messages
        except Exception as e:
            logger.error(f"Failed to retrieve conversation history: {str(e)}")
            raise MemoryError(f"Failed to get conversation history: {str(e)}")
    
    def clear_memory(self):
        """Clear the conversation memory."""
        try:
            logger.info("Clearing conversation memory")
            self.memory.clear()
            logger.debug("Memory cleared successfully")
        except Exception as e:
            logger.error(f"Failed to clear memory: {str(e)}")
            raise MemoryError(f"Failed to clear conversation memory: {str(e)}") 