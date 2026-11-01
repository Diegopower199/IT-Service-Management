"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import type { UserResponse } from "@/types/userTypes";
import type { RoleResponse } from "@/types/roleTypes";
import type { DepartmentResponse } from "@/types/departmentTypes";

import { FORM_MODES, type FormMode } from "@/utils/constans";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import { createUser, updateUser } from "../../services/userService";
import { getAllActiveDepartments } from "@/app/modules/departments/services/departmentService";
import { getAllRoles } from "@/app/modules/roles/services/rolesService";

interface UserFormProps {
  formMode: FormMode;
  selectedUser: UserResponse | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

interface UserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleId: number;
  departmentId: number;
  enabled: boolean;
}

const INITIAL_FORM_DATA: UserFormData = {
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  password: "",
  roleId: 0,
  departmentId: 0,
  enabled: true,
};

const getInitialFormData = (
  formMode: FormMode,
  selectedUser: UserResponse | null,
): UserFormData => {
  if (
    (formMode === FORM_MODES.EDIT || formMode === FORM_MODES.VIEW) &&
    selectedUser
  ) {
    return {
      username: selectedUser.username,
      email: selectedUser.email,
      firstName: selectedUser.firstName,
      lastName: selectedUser.lastName,
      password: "",
      roleId: selectedUser.role.idRole,
      departmentId: selectedUser.department?.idDepartment ?? 0,
      enabled: selectedUser.enabled,
    };
  }

  return { ...INITIAL_FORM_DATA };
};

export default function UserForm({
  formMode,
  selectedUser,
  onClose,
  onSubmitSuccess,
}: UserFormProps) {
  const t = useTranslations("Users.Form");
  const tRoles = useTranslations("Common.Roles");

  const [formData, setFormData] = useState<UserFormData>(
    getInitialFormData(formMode, selectedUser),
  );

  const [rolesOptions, setRolesOptions] = useState<RoleResponse[]>([]);

  const [departmentsOptions, setDepartmentsOptions] = useState<
    DepartmentResponse[]
  >([]);

  const [loading, setLoading] = useState(false);

  const [requiredFieldsIncomplete, setRequiredFieldsIncomplete] = useState<
    Partial<Record<keyof UserFormData, string>>
  >({});

  const [errorMessage, setErrorMessage] = useState("");

  const fetchRolesOptions = useCallback(async (): Promise<boolean> => {
    try {
      const rolesResponse = await getAllRoles();

      setRolesOptions(rolesResponse);

      return true;
    } catch (error) {
      logger.error("Failed to load user roles", error, {
        component: "UserForm",
        action: "fetchRolesOptions",
      });

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? t("rolesLoadError"));

      return false;
    }
  }, [t]);

  const fetchDepartmentsOptions = useCallback(async (): Promise<boolean> => {
    try {
      const departmentsResponse = await getAllActiveDepartments();

      setDepartmentsOptions(departmentsResponse);

      return true;
    } catch (error) {
      logger.error("Failed to load user departments", error, {
        component: "UserForm",
        action: "fetchDepartmentsOptions",
      });

      const apiError = getApiError(error);

      setErrorMessage(apiError?.message ?? t("departmentsLoadError"));

      return false;
    }
  }, [t]);

  useEffect(() => {
    const fetchFormOptions = async () => {
      setErrorMessage("");

      const rolesLoaded = await fetchRolesOptions();

      if (!rolesLoaded) {
        return;
      }

      const departmentsLoaded = await fetchDepartmentsOptions();

      if (!departmentsLoaded) {
        return;
      }
    };

    fetchFormOptions();
  }, [fetchRolesOptions, fetchDepartmentsOptions]);

  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]:
        type === "checkbox"
          ? (event.target as HTMLInputElement).checked
          : name === "roleId" || name === "departmentId"
            ? Number(value)
            : value,
    }));

    setRequiredFieldsIncomplete((previousErrors) => ({
      ...previousErrors,
      [name]: undefined,
    }));

    setErrorMessage("");
  };

  const validateRequiredFields = () => {
    const errorMissingFields: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.username.trim()) {
      errorMissingFields.username = t("usernameRequired");
    }

    if (!formData.email.trim()) {
      errorMissingFields.email = t("emailRequired");
    }

    if (!formData.firstName.trim()) {
      errorMissingFields.firstName = t("firstNameRequired");
    }

    if (!formData.lastName.trim()) {
      errorMissingFields.lastName = t("lastNameRequired");
    }

    if (!formData.roleId) {
      errorMissingFields.roleId = t("roleRequired");
    }

    if (!formData.departmentId) {
      errorMissingFields.departmentId = t("departmentRequired");
    }

    if (formMode === FORM_MODES.CREATE && !formData.password.trim()) {
      errorMissingFields.password = t("passwordRequired");
    }

    setRequiredFieldsIncomplete(errorMissingFields);

    return Object.keys(errorMissingFields).length !== 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formMode === FORM_MODES.VIEW) {
      return;
    }

    const requiredFieldsError = validateRequiredFields();

    if (requiredFieldsError) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setRequiredFieldsIncomplete({});

      if (formMode === FORM_MODES.CREATE) {
        await createUser({
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
          roleId: formData.roleId,
          departmentId: formData.departmentId,
          enabled: formData.enabled,
        });
      }

      if (formMode === FORM_MODES.EDIT && selectedUser) {
        await updateUser(selectedUser.idUser, {
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          roleId: formData.roleId,
          departmentId: formData.departmentId,
          enabled: formData.enabled,
        });
      }

      onSubmitSuccess();
      onClose();
    } catch (error) {
      const apiError = getApiError(error);

      if (apiError?.errors) {
        setRequiredFieldsIncomplete(apiError.errors);

        return;
      }

      logger.error(
        formMode === FORM_MODES.CREATE
          ? "Failed to create user"
          : "Failed to update user",
        error,
        {
          component: "UserForm",
          action: "handleSubmit",
          formMode,
          ...(selectedUser && {
            userId: selectedUser.idUser,
          }),
        },
      );

      setErrorMessage(
        apiError?.message ??
          (formMode === FORM_MODES.CREATE
            ? t("createError")
            : t("updateError")),
      );
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (formMode === FORM_MODES.CREATE) {
      return t("createTitle");
    }

    if (formMode === FORM_MODES.VIEW) {
      return t("viewTitle");
    }

    return t("editTitle");
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h4" component="h1" gutterBottom>
        {getTitle()}
      </Typography>

      <Stack spacing={3}>
        <TextField
          label={t("username")}
          name="username"
          value={formData.username}
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.username)}
          helperText={requiredFieldsIncomplete.username}
          disabled={formMode === FORM_MODES.VIEW}
          fullWidth
        />

        <TextField
          label={t("email")}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.email)}
          helperText={requiredFieldsIncomplete.email}
          disabled={formMode === FORM_MODES.VIEW}
          fullWidth
        />

        <TextField
          label={t("firstName")}
          name="firstName"
          value={formData.firstName}
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.firstName)}
          helperText={requiredFieldsIncomplete.firstName}
          disabled={formMode === FORM_MODES.VIEW}
          fullWidth
        />

        <TextField
          label={t("lastName")}
          name="lastName"
          value={formData.lastName}
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.lastName)}
          helperText={requiredFieldsIncomplete.lastName}
          disabled={formMode === FORM_MODES.VIEW}
          fullWidth
        />

        <TextField
          select
          label={t("role")}
          name="roleId"
          value={
            rolesOptions.some((role) => role.idRole === formData.roleId)
              ? formData.roleId
              : 0
          }
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.roleId)}
          helperText={requiredFieldsIncomplete.roleId}
          disabled={formMode === FORM_MODES.VIEW}
          fullWidth
        >
          <MenuItem value={0} disabled>
            {t("selectRole")}
          </MenuItem>

          {rolesOptions.length === 0 ? (
            <MenuItem disabled>{t("noRolesAvailable")}</MenuItem>
          ) : (
            rolesOptions.map((role) => (
              <MenuItem key={role.idRole} value={role.idRole}>
                {tRoles(role.name)}
              </MenuItem>
            ))
          )}
        </TextField>

        <TextField
          select
          label={t("department")}
          name="departmentId"
          value={
            departmentsOptions.some(
              (department) => department.idDepartment === formData.departmentId,
            )
              ? formData.departmentId
              : 0
          }
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.departmentId)}
          helperText={requiredFieldsIncomplete.departmentId}
          disabled={formMode === FORM_MODES.VIEW}
          fullWidth
        >
          <MenuItem value={0} disabled>
            {t("selectDepartment")}
          </MenuItem>

          {departmentsOptions.length === 0 ? (
            <MenuItem disabled>{t("noDepartmentsAvailable")}</MenuItem>
          ) : (
            departmentsOptions.map((department) => (
              <MenuItem
                key={department.idDepartment}
                value={department.idDepartment}
              >
                {department.name}
              </MenuItem>
            ))
          )}
        </TextField>

        {formMode === FORM_MODES.CREATE && (
          <TextField
            label={t("password")}
            name="password"
            type="password"
            value={formData.password}
            onChange={handleFormChange}
            error={Boolean(requiredFieldsIncomplete.password)}
            helperText={requiredFieldsIncomplete.password}
            disabled={loading}
            fullWidth
          />
        )}

        <FormControlLabel
          control={
            <Checkbox
              name="enabled"
              checked={formData.enabled}
              onChange={handleFormChange}
              disabled={formMode === FORM_MODES.VIEW || loading}
            />
          }
          label={t("enabled")}
        />

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Stack spacing={3} direction="row">
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            {formMode === FORM_MODES.VIEW ? t("back") : t("cancel")}
          </Button>

          {formMode !== FORM_MODES.VIEW && (
            <Button type="submit" variant="contained" disabled={loading}>
              {loading
                ? t("saving")
                : formMode === FORM_MODES.CREATE
                  ? t("createUser")
                  : t("saveChanges")}
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
