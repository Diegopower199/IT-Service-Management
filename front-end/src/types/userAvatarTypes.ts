/**
 * Represents the metadata of a user's profile avatar.
 */
export interface UserAvatarResponse {
  idAvatar: number;
  userId: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}
