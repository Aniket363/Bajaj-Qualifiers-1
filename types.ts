export interface BFHLRequest {
  data: string[];
}

export interface BFHLResponse {
  is_success: boolean;
  user_id: string;
  email: string;
  roll_number: string;
  numbers: string[];
  alphabets: string[];
  highest_alphabet: string[];
}

export interface FilterOption {
  value: keyof Pick<BFHLResponse, 'numbers' | 'alphabets' | 'highest_alphabet'>;
  label: string;
}