/** Editable guest data used by profile, checkout, delivery, and reservations. */
export interface GuestProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  dietary: string;
  deliveryAddress: string;
  marketingOptIn: boolean;
}
