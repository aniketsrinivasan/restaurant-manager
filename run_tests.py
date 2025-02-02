import asyncio
from backend.examples.test_llm_engine import main as test_engine
from backend.examples.test_specific_cases import test_specific_cases

async def run_all_tests():
    print("Running LLM Engine Tests...")
    await test_engine()
    
    print("\nRunning Specific Cases...")
    await test_specific_cases()

if __name__ == "__main__":
    asyncio.run(run_all_tests()) 