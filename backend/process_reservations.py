import asyncio
import json
from pathlib import Path
import logging
from utils.reservation_processor import ReservationProcessor
from utils.llm.llm_wrapper import LanguageModelConfig
import shutil

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def main():
    try:
        # Initialize processor
        processor = ReservationProcessor()
        
        # Process reservations
        input_file = "backend/data/sample_reservations.json"
        processed_file = "backend/data/processed_output.json"
        frontend_file = "frontend/public/data/processed_output.json"
        
        await processor.process_reservation_file(input_file, processed_file)
        
        # Copy to frontend
        Path(frontend_file).parent.mkdir(parents=True, exist_ok=True)
        Path(frontend_file).write_text(Path(processed_file).read_text())
        
        logger.info("Processing pipeline complete")
        logger.info(f"Backend copy saved to: {processed_file}")
        logger.info(f"Frontend copy saved to: {frontend_file}")
        
    except Exception as e:
        logger.error(f"Error in processing pipeline: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Processing interrupted by user")
    except Exception as e:
        logger.error(f"Processing failed: {str(e)}")
        raise 