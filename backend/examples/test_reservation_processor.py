import asyncio
import os
from dotenv import load_dotenv
from pathlib import Path

from backend.utils.reservation_processor import ReservationProcessor
from backend.utils.llm.llm_wrapper import LanguageModelConfig

async def main():
    # Load environment variables
    load_dotenv()
    
    if not os.getenv("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY not found in environment variables")
        return
    
    # Initialize processor
    config = LanguageModelConfig(
        model="openai",
        model_name="gpt-4",
        temperature=0,
        max_retries=2
    )
    
    processor = ReservationProcessor(config)
    
    # Process sample file
    await processor.process_reservation_file(
        input_file='data/sample_reservations.json',
        output_file='data/processed_reservations.json'
    )

if __name__ == "__main__":
    asyncio.run(main()) 