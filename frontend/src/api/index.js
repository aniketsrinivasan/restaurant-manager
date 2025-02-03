import { ProcessedData } from '../types/reservation';

export const fetchReservations = async () => {
  try {
    // Load from the processed reservations file
    const response = await fetch('/data/processed_output.json');
    if (!response.ok) {
      throw new Error('Failed to fetch reservations');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw error;
  }
}; 