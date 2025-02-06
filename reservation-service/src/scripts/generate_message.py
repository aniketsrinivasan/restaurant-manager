import sys
import json
import asyncio
from pathlib import Path
import os
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent.parent.parent / 'backend'
logger.info(f"Looking for backend directory at: {backend_dir}")

if not backend_dir.exists():
    logger.error(f"Backend directory not found at: {backend_dir}")
    sys.exit(1)

sys.path.append(str(backend_dir))

from utils.message_generator import MessageGenerator
from utils.llm.llm_wrapper import LanguageModelConfig

async def main():
    try:
        logger.info("Starting message generation...")
        # Parse input from Node.js
        input_data = json.loads(sys.argv[1])
        message = input_data['message']
        context = input_data['reservationContext']
        
        logger.info(f"Generating response for message: {message[:50]}...")
        # Initialize message generator
        generator = MessageGenerator()
        
        # Generate response
        response = await generator.generate_response(message, context)
        
        # Return response to Node.js
        print(json.dumps({ 'response': response }))
        
    except Exception as e:
        logger.error(f"Error in generate_message.py: {str(e)}")
        print(json.dumps({ 'error': str(e) }), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main()) 