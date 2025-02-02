import json
from datetime import datetime
from typing import List, Dict, Any

def load_reservation_data(file_path: str) -> Dict[str, Any]:
    """Load the JSON data from file."""
    with open(file_path, 'r') as file:
        return json.load(file)

def get_client_reviews(data: Dict[str, Any], client_name: str = None) -> List[Dict[str, Any]]:
    """
    Extract reviews for a specific client or all reviews.
    
    Args:
        data: The loaded JSON data
        client_name: Optional; if provided, returns reviews only for this client
        
    Returns:
        List of review dictionaries
    """
    reviews = []
    for diner in data['diners']:
        if client_name and diner['name'] != client_name:
            continue
        for review in diner['reviews']:
            review['client_name'] = diner['name']  # Add client name to review
            reviews.append(review)
    return reviews

def get_client_reservations(data: Dict[str, Any], client_name: str = None) -> List[Dict[str, Any]]:
    """
    Extract reservations for a specific client or all reservations.
    
    Args:
        data: The loaded JSON data
        client_name: Optional; if provided, returns reservations only for this client
        
    Returns:
        List of reservation dictionaries
    """
    reservations = []
    for diner in data['diners']:
        if client_name and diner['name'] != client_name:
            continue
        for reservation in diner['reservations']:
            # Add client information to reservation
            reservation['client_name'] = diner['name']
            reservation['client_emails'] = diner['emails']
            reservations.append(reservation)
    return reservations

def get_reservations_by_date(data: Dict[str, Any], target_date: str) -> List[Dict[str, Any]]:
    """
    Get all reservations for a specific date.
    
    Args:
        data: The loaded JSON data
        target_date: Date string in format 'YYYY-MM-DD'
        
    Returns:
        List of reservation dictionaries for that date
    """
    reservations = []
    target_datetime = datetime.strptime(target_date, '%Y-%m-%d')
    
    for diner in data['diners']:
        for reservation in diner['reservations']:
            reservation_date = datetime.strptime(reservation['date'], '%Y-%m-%d')
            if reservation_date.date() == target_datetime.date():
                # Add client information to reservation
                reservation['client_name'] = diner['name']
                reservation['client_emails'] = diner['emails']
                reservations.append(reservation)
    
    # Sort by time if available
    return sorted(reservations, key=lambda x: x.get('time', '00:00'))
