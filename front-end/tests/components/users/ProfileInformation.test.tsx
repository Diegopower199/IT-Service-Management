import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { expect, it, vi } from "vitest";

import ProfileInformation from "@/app/modules/profile/information/ProfileInformation";
import { uploadUserAvatar } from "@/app/modules/users/services/userAvatarService";
import type { UserResponse } from "@/types/userTypes";
import commonMessages from "../../../messages/en/common.json";
import profileMessages from "../../../messages/en/profile.json";

vi.mock("@/app/modules/users/components/avatar/UserAvatar", () => ({ default: () => null }));
vi.mock("@/app/modules/users/services/userAvatarService", () => ({
  uploadUserAvatar: vi.fn(),
  deleteUserAvatar: vi.fn(),
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

it("allows uploading a photo while profile edits and photo deletion are disabled", async () => {
  const user = userEvent.setup();
  const { container } = render(
    <NextIntlClientProvider locale="en" timeZone="UTC" messages={{ Common: commonMessages, Profile: profileMessages }}>
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
  expect(uploadUserAvatar).toHaveBeenCalledWith(photo);
  expect(screen.getByRole("button", { name: "Change photo" })).toBeEnabled();
  expect(screen.getByRole("button", { name: "Delete photo" })).toBeDisabled();
});
