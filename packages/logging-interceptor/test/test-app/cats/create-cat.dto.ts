/**
 * Dto to create a new cat
 */
export interface CreateCatDto {
  name: string;
  birthdate?: string;
  address?: { country: string; city: string };
  enemies?: string[];
  interests?: { description: string; level: 'HIGH' | 'MEDIUM' | 'LOW' }[];
}
