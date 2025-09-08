export interface Customer {
    _id: string;
    name: string;
    citizen_id: string;
    created_at: string;
    updated_at: string;
    bond_status?: { status?: string };
    company: string;
    email: string;
    phone: string;
  }
  