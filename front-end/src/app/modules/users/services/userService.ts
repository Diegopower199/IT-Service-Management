import api from "@/config/axios";
import { UserSummaryResponse } from "@/types/userTypes";

export const getUserOptions = async (): Promise<UserSummaryResponse[]> => {
  const response = await api.get<UserSummaryResponse[]>("/users/options");

  return response.data;
};
