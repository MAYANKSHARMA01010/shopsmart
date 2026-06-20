import apiClient from "../../../lib/apiClient";

export interface Address {
  id: string;
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export type AddressFormData = Omit<Address, "id" | "isDefault"> & { isDefault?: boolean };

class AddressService {
  async getUserAddresses(): Promise<Address[]> {
    const res: any = await apiClient.get("/addresses");
    return res.data.addresses;
  }

  async getAddressById(id: string): Promise<Address> {
    const res: any = await apiClient.get(`/addresses/${id}`);
    return res.data.address;
  }

  async createAddress(data: AddressFormData): Promise<Address> {
    const res: any = await apiClient.post("/addresses", data);
    return res.data.address;
  }

  async updateAddress(id: string, data: Partial<AddressFormData>): Promise<Address> {
    const res: any = await apiClient.put(`/addresses/${id}`, data);
    return res.data.address;
  }

  async deleteAddress(id: string): Promise<void> {
    await apiClient.delete(`/addresses/${id}`);
  }
}

export const addressService = new AddressService();
