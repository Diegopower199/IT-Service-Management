import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, expect, it, vi } from "vitest";

import ProfileInformation from "@/app/modules/profile/information/ProfileInformation";
import AppHeader from "@/layouts/AppHeader";
import type { UserResponse } from "@/types/userTypes";
import commonMessages from "../../../messages/en/common.json";
import navigationMessages from "../../../messages/en/navigation.json";
import profileMessages from "../../../messages/en/profile.json";

const avatarService = vi.hoisted(() => ({
  getUserAvatar: vi.fn(),
  uploadUserAvatar: vi.fn(),
  deleteUserAvatar: vi.fn(),
}));

vi.mock("@/app/modules/users/services/userAvatarService", () => avatarService);
vi.mock("@/components/ui/LanguageSelector", () => ({ default: () => null }));
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { userId: demoProfile.idUser, username: demoProfile.username, role: demoProfile.role.name },
    signOut: vi.fn(),
  }),
}));

const demoProfile: UserResponse = {
  idUser: 5,
  username: "technician_demo",
  email: "technician@example.test",
  firstName: "Demo",
  lastName: "Technician",
  enabled: true,
  role: { idRole: 2, name: "TECHNICIAN" },
  department: { idDepartment: 1, name: "IT", active: true },
};

afterEach(() => vi.unstubAllGlobals());

it("updates the profile and header avatars after a demo account uploads and deletes its photo", async () => {
  let storedPhoto: Blob | null = null;
  avatarService.getUserAvatar.mockImplementation(async () => storedPhoto);
  avatarService.uploadUserAvatar.mockImplementation(async (photo: File) => {
    storedPhoto = photo;
  });
  avatarService.deleteUserAvatar.mockImplementation(async () => {
    storedPhoto = null;
  });
  vi.stubGlobal("URL", class extends URL {
    static createObjectURL = vi.fn(() => "blob:demo-avatar");
    static revokeObjectURL = vi.fn();
  });

  const user = userEvent.setup();
  const { container } = render(
    <NextIntlClientProvider
      locale="en"
      timeZone="UTC"
      messages={{ Common: commonMessages, Navigation: navigationMessages, Profile: profileMessages }}
    >
      <AppHeader />
      <ProfileInformation profile={demoProfile} readOnly onSubmitSuccess={vi.fn()} />
    </NextIntlClientProvider>,
  );

  expect(screen.getByRole("button", { name: "Edit Profile" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Upload photo" })).toBeEnabled();

  const input = container.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error("Missing photo upload input");
  const photo = new File(["image"], "photo.png", { type: "image/png" });
  await user.upload(input, photo);

  expect(await screen.findByRole("status")).toHaveTextContent("Profile photo updated successfully.");
  expect(avatarService.uploadUserAvatar).toHaveBeenCalledWith(photo);
  expect(screen.getByRole("button", { name: "Change photo" })).toBeEnabled();
  await waitFor(() => expect(container.querySelectorAll('img[src="blob:demo-avatar"]')).toHaveLength(2));

  const deleteButton = screen.getByRole("button", { name: "Delete photo" });
  expect(deleteButton).toBeEnabled();
  const readsBeforeDeletion = avatarService.getUserAvatar.mock.calls.length;
  await user.click(deleteButton);

  expect(await screen.findByRole("status")).toHaveTextContent("Profile photo deleted successfully.");
  expect(avatarService.deleteUserAvatar).toHaveBeenCalledOnce();
  await waitFor(() => {
    expect(avatarService.getUserAvatar.mock.calls.slice(readsBeforeDeletion)).toEqual([[demoProfile.idUser], [demoProfile.idUser]]);
    expect(container.querySelectorAll(".MuiAvatar-fallback")).toHaveLength(2);
    expect(container.querySelector('img[src="blob:demo-avatar"]')).not.toBeInTheDocument();
  });
  expect(screen.getByRole("button", { name: "Upload photo" })).toBeEnabled();
  expect(screen.queryByRole("button", { name: "Delete photo" })).not.toBeInTheDocument();
});
