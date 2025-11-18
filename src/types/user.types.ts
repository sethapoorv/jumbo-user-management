export type Address = {
  street: string;
  suite?: string;
  city: string;
  zipcode: string;
};

export type Company = {
  name: string;
  catchPhrase?: string;
  bs?: string;
};

export type ApiUser = {
  id: number;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  website?: string;
  address?: Address;
  company?: Company;
};
