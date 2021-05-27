/**
 * Pageable data to return
 */
export interface DataToPaginate<T> {
  resources: T[];
  totalResources: number;
}
