import api from "@/config/axios";

import type { UserAvatarResponse } from "@/types/userAvatarTypes";

/**
 * Retrieves the avatar metadata associated with a user.
 */
export const getUserAvatarMetadata = async (
  userId: number,
): Promise<UserAvatarResponse> => {
  const response = await api.get<UserAvatarResponse>(
    `/users/${userId}/avatar/metadata`,
  );

  return response.data;
};

/**
 * Retrieves the avatar image associated with a user.
 *
 * Returns null when the user has no avatar.
 */
export const getUserAvatar = async (userId: number): Promise<Blob | null> => {
  const response = await api.get<Blob>(`/users/${userId}/avatar`, {
    responseType: "blob",
  });

  if (response.status === 204) {
    return null;
  }

  return response.data;
};

/**
 * Uploads or replaces the authenticated user's avatar.
 */
export const uploadUserAvatar = async (
  file: File,
): Promise<UserAvatarResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.put<UserAvatarResponse>(
    "/users/me/avatar",
    formData,
  );

  return response.data;
};

/**
 * Deletes the authenticated user's avatar.
 */
export const deleteUserAvatar = async (): Promise<void> => {
  await api.delete("/users/me/avatar");
};
