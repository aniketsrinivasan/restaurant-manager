export interface FoodOrder {
  item: string;
  quantity: number;
  dietary_tags: string[];
  price: number;
}

export interface Reservation {
  client_name: string;
  number_of_guests: number;
  date: string;
  time?: string;
  food_ordered: FoodOrder[];
  is_vip: boolean;
  special_requests: string[];
  preferences: string[];
  avatar?: string;
  email?: string;
  phone?: string;
  message?: string;
  status?: string;
  deposit?: number;
  totalCost?: number;
}

export interface ProcessedData {
  metadata: {
    processed_at: string;
    input_file: string;
  };
  reservations: Reservation[];
} 