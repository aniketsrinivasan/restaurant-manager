import asyncio
from utils.llm.config import ChainConfig, LLMConfig, PromptConfig
from utils.llm.chat_manager import RestaurantChatManager
from utils.llm.prompts import RESTAURANT_SYSTEM_PROMPTS

async def main():
    # Create custom configuration
    config = ChainConfig(
        llm_config=LLMConfig(
            model_name="gpt-3.5-turbo",
            temperature=0.7
        ),
        prompt_config=PromptConfig(
            system_message=RESTAURANT_SYSTEM_PROMPTS["reservation"]
        ),
        memory_type="buffer_window",
        memory_k=5
    )
    
    # Initialize chat manager
    chat_manager = RestaurantChatManager(config)
    
    # Example context
    reservation_context = {
        "date": "2024-05-20",
        "time": "19:00",
        "guests": 4,
        "special_requests": "Window seat",
        "dietary_restrictions": ["gluten-free", "nut allergy"]
    }
    
    # Process a message
    response = await chat_manager.process_message(
        "Can you help me modify my reservation?",
        context=reservation_context
    )
    print(response)

if __name__ == "__main__":
    asyncio.run(main()) 