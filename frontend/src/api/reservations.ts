import { ProcessedData } from '../types/reservation';

export async function fetchReservations(): Promise<ProcessedData> {
  try {
    const response = await fetch('/data/processed_output.json');
    if (!response.ok) {
      throw new Error('Failed to fetch reservations');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw error;
  }
} 