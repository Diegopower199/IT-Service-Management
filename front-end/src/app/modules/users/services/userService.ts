import api from "@/config/axios";
import type { UserSummaryResponse } from "@/types/userTypes";

export const getAllTechnicians = async (): Promise<UserSummaryResponse[]> => {
  const response = await api.get<UserSummaryResponse[]>("/users/technicians");

  return response.data;
};
