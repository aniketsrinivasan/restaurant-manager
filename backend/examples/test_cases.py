import asyncio
import os
from dotenv import load_dotenv
from pathlib import Path
import json

from backend.utils.reservation_processor import ReservationProcessor
from backend.utils.llm.llm_wrapper import LanguageModelConfig

# Test case with direct input
SINGLE_TEST_CASE = {
    "name": "Michael Chang",
    "reviews": [
        {
            "restaurant_name": "French Laudure",
            "date": "2024-01-15",
            "rating": 5,
            "content": "Always love the quiet corner table. The sommelier's recommendations are spot on."
        }
    ],
    "reservations": [
        {
            "date": "2024-06-10",
            "number_of_people": 2,
            "orders": [
                {
                    "item": "Wagyu Steak",
                    "dietary_tags": [],
                    "price": 120.0
                }
            ]
        }
    ],
    "emails": [
        {
            "date": "2024-06-01",
            "subject": "Anniversary Dinner",
            "combined_thread": "Planning to celebrate our anniversary. Would love the same corner table as last time. Also interested in the wine pairing menu."
        }
    ]
}

async def test_single_client():
    """Test processing a single client directly."""
    print("\n=== Testing Single Client Processing ===")
    
    config = LanguageModelConfig(
        model="openai",
        model_name="gpt-4",
        temperature=0,
        max_retries=2
    )
    
    processor = ReservationProcessor(config)
    
    try:
        result = await processor.process_client(SINGLE_TEST_CASE)
        print("\nProcessed Result:")
        print(json.dumps(result.dict(), indent=2))
    except Exception as e:
        print(f"Error: {str(e)}")

async def test_file_processing():
    """Test processing from file."""
    print("\n=== Testing File Processing ===")
    
    config = LanguageModelConfig(
        model="openai",
        model_name="gpt-4",
        temperature=0,
        max_retries=2
    )
    
    processor = ReservationProcessor(config)
    
    try:
        await processor.process_reservation_file(
            input_file='backend/data/sample_reservations.json',
            output_file='backend/data/processed_output.json'
        )
        
        # Read and display results
        with open('backend/data/processed_output.json', 'r') as f:
            result = json.load(f)
            print("\nProcessed Results:")
            print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"Error: {str(e)}")

async def main():
    # Load environment variables
    load_dotenv()
    
    if not os.getenv("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY not found in environment variables")
        return
    
    # Run tests
    await test_single_client()
    await test_file_processing()

if __name__ == "__main__":
    asyncio.run(main()) 