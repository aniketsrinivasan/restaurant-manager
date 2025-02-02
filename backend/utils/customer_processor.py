import json
from typing import Dict, Any, List
import logging
from datetime import datetime
from pathlib import Path

from .reservation_helpers import load_reservation_data, get_client_reviews, get_client_reservations
from .llm.chat_manager import RestaurantChatManager
from .llm.config import ChainConfig, PromptConfig
from .llm.prompts import RESTAURANT_SYSTEM_PROMPTS

# Setup logging
logger = logging.getLogger(__name__)

class CustomerProcessor:
    """Process customer information using LLM and manage data storage."""
    
    def __init__(self, input_file: str, output_file: str, chat_manager: RestaurantChatManager = None):
        """
        Initialize the processor.
        
        Args:
            input_file: Path to input JSON file
            output_file: Path to output JSON file
            chat_manager: Optional preconfigured chat manager
        """
        self.input_file = input_file
        self.output_file = output_file
        self.chat_manager = chat_manager or self._setup_chat_manager()
        self.processed_data = {'diners': []}
        self.raw_data = None
        
    def _setup_chat_manager(self) -> RestaurantChatManager:
        """Create a chat manager with customer processing configuration."""
        config = ChainConfig(
            prompt_config=PromptConfig(
                system_message="""You are a restaurant customer service AI that processes customer information.
                Analyze customer reviews, messages, and preferences to provide personalized service.
                
                You must return a JSON response with exactly these fields:
                {
                    "customer_name": str,
                    "number_of_guests": int,
                    "date": str (YYYY-MM-DD format),
                    "food_ordered": [
                        {
                            "item": str,
                            "quantity": int
                        }
                    ],
                    "dietary_restrictions": [str],
                    "is_vip": boolean,
                    "special_requests": [str]
                }
                
                Base your analysis on:
                - Previous dining experiences and reviews
                - Recent communications
                - Existing reservation details
                - Dietary preferences mentioned in reviews
                """
            )
        )
        return RestaurantChatManager(config)
    
    def _analyze_reviews(self, reviews: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Extract key insights from customer reviews."""
        preferences = {
            'dietary_preferences': set(),
            'service_preferences': set(),
            'ambiance_preferences': set(),
            'common_complaints': set(),
            'positive_experiences': set(),
            'average_rating': 0
        }
        
        if not reviews:
            return preferences
        
        total_rating = 0
        for review in reviews:
            rating = review.get('rating', 0)
            content = review.get('content', '').lower()
            
            # Track rating
            total_rating += rating
            
            # Dietary preferences
            if any(word in content for word in ['gluten', 'vegan', 'vegetarian', 'allergy', 'dairy']):
                for pref in ['gluten-free', 'vegan', 'vegetarian', 'dairy-free']:
                    if pref in content:
                        preferences['dietary_preferences'].add(pref)
            
            # Service preferences
            if 'service' in content:
                if any(word in content for word in ['quick', 'fast', 'prompt']):
                    preferences['service_preferences'].add('values prompt service')
                if any(word in content for word in ['attentive', 'attention']):
                    preferences['service_preferences'].add('prefers attentive service')
            
            # Ambiance preferences
            if any(word in content for word in ['quiet', 'private', 'romantic']):
                preferences['ambiance_preferences'].add('prefers quiet/private seating')
            if 'window' in content:
                preferences['ambiance_preferences'].add('prefers window seating')
                
            # Track issues and positives
            if rating <= 3:
                for issue in ['slow', 'cold', 'noisy', 'crowded']:
                    if issue in content:
                        preferences['common_complaints'].add(issue)
            if rating >= 4:
                for positive in ['excellent', 'amazing', 'perfect', 'wonderful']:
                    if positive in content:
                        preferences['positive_experiences'].add(positive)
        
        # Calculate average rating
        preferences['average_rating'] = total_rating / len(reviews)
        
        # Convert sets to lists for JSON serialization
        for key in preferences:
            if isinstance(preferences[key], set):
                preferences[key] = list(preferences[key])
        
        return preferences
    
    def _validate_response(self, data: Dict[str, Any]) -> bool:
        """Validate the structure of the LLM response."""
        required_fields = {
            'customer_name': str,
            'number_of_guests': int,
            'date': str,
            'food_ordered': list,
            'dietary_restrictions': list,
            'is_vip': bool,
            'special_requests': list
        }
        
        try:
            for field, field_type in required_fields.items():
                if field not in data:
                    logger.error(f"Missing required field: {field}")
                    return False
                if not isinstance(data[field], field_type):
                    logger.error(f"Invalid type for field {field}: expected {field_type}, got {type(data[field])}")
                    return False
            
            # Validate food_ordered structure
            for item in data['food_ordered']:
                if not isinstance(item, dict) or 'item' not in item or 'quantity' not in item:
                    logger.error("Invalid food_ordered structure")
                    return False
                if not isinstance(item['quantity'], int):
                    logger.error("Food quantity must be an integer")
                    return False
            
            # Validate date format
            try:
                datetime.strptime(data['date'], '%Y-%m-%d')
            except ValueError:
                logger.error("Invalid date format")
                return False
                
            return True
        except Exception as e:
            logger.error(f"Validation error: {str(e)}")
            return False

    async def process_customer(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a single customer's information through the LLM.
        
        Args:
            customer_data: Raw customer data dictionary
            
        Returns:
            Processed customer data dictionary
        """
        try:
            logger.info(f"Processing customer: {customer_data.get('name', 'Unknown')}")
            
            # Get customer reviews and analyze them
            reviews = customer_data.get('reviews', [])
            review_analysis = self._analyze_reviews(reviews)
            
            # Extract relevant information for the LLM
            context = {
                'name': customer_data.get('name'),
                'reservations': customer_data.get('reservations', []),
                'emails': customer_data.get('emails', []),
                'review_analysis': review_analysis,
                'reviews': reviews
            }
            
            # Create a prompt for the LLM
            prompt = f"""
            Please analyze this customer's information and provide a reservation summary.
            
            Customer Name: {context['name']}
            
            Review Analysis:
            {json.dumps(review_analysis, indent=2)}
            
            Previous Reviews:
            {json.dumps(reviews, indent=2)}
            
            Current Reservations:
            {json.dumps(context['reservations'], indent=2)}
            
            Recent Communications:
            {json.dumps(context['emails'], indent=2)}
            
            Return a JSON object with exactly these fields:
            {{
                "customer_name": str,
                "number_of_guests": int,
                "date": str (YYYY-MM-DD format),
                "food_ordered": [
                    {{
                        "item": str,
                        "quantity": int
                    }}
                ],
                "dietary_restrictions": [str],
                "is_vip": boolean,
                "special_requests": [str]
            }}
            """
            
            # Process through LLM
            response = await self.chat_manager.process_message(prompt)
            
            try:
                # Parse the LLM's response
                processed_data = json.loads(response)
                if not self._validate_response(processed_data):
                    logger.error("Invalid response structure from LLM")
                    raise ValueError("Invalid response structure")
                
                logger.info(f"Successfully processed customer: {context['name']}")
                return {
                    'name': context['name'],
                    'processed_reservations': processed_data.get('updated_reservation_details', {}),
                    'service_recommendations': processed_data.get('service_recommendations', {}),
                    'special_considerations': processed_data.get('special_considerations', {}),
                    'review_analysis': review_analysis,
                    'original_data': customer_data
                }
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse LLM response: {str(e)}")
                raise
            
        except Exception as e:
            logger.error(f"Error processing customer {customer_data.get('name', 'Unknown')}: {str(e)}")
            raise
    
    async def process_all_customers(self):
        """Process all customers from the input file and save to output file."""
        try:
            # Load data
            raw_data = load_reservation_data(self.input_file)
            
            # Process each customer
            for customer in raw_data['diners']:
                processed_customer = await self.process_customer(customer)
                self.processed_data['diners'].append(processed_customer)
            
            # Save processed data
            self.save_processed_data()
            
            logger.info(f"Successfully processed {len(self.processed_data['diners'])} customers")
            
        except Exception as e:
            logger.error(f"Error processing customers: {str(e)}")
            raise
    
    def save_processed_data(self):
        """Save processed data to output file."""
        try:
            # Create output directory if it doesn't exist
            output_path = Path(self.output_file)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Add metadata
            output_data = {
                'metadata': {
                    'processed_at': datetime.now().isoformat(),
                    'input_file': self.input_file,
                    'total_customers': len(self.processed_data['diners'])
                },
                'data': self.processed_data
            }
            
            # Save to file
            with open(self.output_file, 'w') as f:
                json.dump(output_data, f, indent=2)
            
            logger.info(f"Successfully saved processed data to {self.output_file}")
            
        except Exception as e:
            logger.error(f"Error saving processed data: {str(e)}")
            raise 