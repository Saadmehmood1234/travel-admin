export interface ContactFormType {
  name: string;
  email: string;
  phone?: string;
  destination?: string;
  travelDate?: string;
  flightRequired?: "Yes" | "No";
  adults?: number;
  children?: number;
  tripPlanningStatus?: string;
  timeToBook?: string;
  additionalDetails?: string;
}