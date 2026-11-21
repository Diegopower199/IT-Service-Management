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
  TextField,
} from "@mui/material";
import EditOutlined from "@mui/icons-material/EditOutlined";
import PersonAddAltOutlined from "@mui/icons-material/PersonAddAltOutlined";

import type { UserResponse } from "@/types/userTypes";
import type { RoleResponse } from "@/types/roleTypes";
import type { DepartmentResponse } from "@/types/departmentTypes";

import { FORM_MODES, type FormMode } from "@/utils/constans";

import { getApiError } from "@/utils/apiErrorUtils";
import { logger } from "@/utils/logger";

import { createUser, updateUser } from "../../services/userService";
import { getAllActiveDepartments } from "@/app/modules/departments/services/departmentService";
import { getAllRoles } from "@/app/modules/roles/services/rolesService";
import UserDetails from "../details/UserDetails";
import sharedStyles from "@/app/modules/tickets/styles/tickets.module.css";
import styles from "../../styles/users.module.css";

interface UserFormProps {
  formMode: FormMode;
  selectedUser: UserResponse | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

type EditorMode = Exclude<FormMode, typeof FORM_MODES.VIEW>;

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
  formMode: EditorMode,
  selectedUser: UserResponse | null,
): UserFormData => {
  if (formMode === FORM_MODES.EDIT && selectedUser) {
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

export default function UserForm({ formMode, selectedUser, ...props }: UserFormProps) {
  if (formMode === FORM_MODES.VIEW) {
    return selectedUser ? <UserDetails user={selectedUser} onClose={props.onClose} /> : null;
  }

  return <UserEditor {...props} formMode={formMode} selectedUser={selectedUser} />;
}

function UserEditor({
  formMode,
  selectedUser,
  onClose,
  onSubmitSuccess,
}: UserFormProps & { formMode: EditorMode }) {
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

  const isCreate = formMode === FORM_MODES.CREATE;
  const headingId = isCreate ? "create-user-heading" : "edit-user-heading";

  const fields = (
    <>
      <TextField
        label={t("username")}
        name="username"
        value={formData.username}
        onChange={handleFormChange}
        error={Boolean(requiredFieldsIncomplete.username)}
        helperText={requiredFieldsIncomplete.username}
        disabled={loading}
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
        disabled={loading}
        fullWidth
      />

      <TextField
        label={t("firstName")}
        name="firstName"
        value={formData.firstName}
        onChange={handleFormChange}
        error={Boolean(requiredFieldsIncomplete.firstName)}
        helperText={requiredFieldsIncomplete.firstName}
        disabled={loading}
        fullWidth
      />

      <TextField
        label={t("lastName")}
        name="lastName"
        value={formData.lastName}
        onChange={handleFormChange}
        error={Boolean(requiredFieldsIncomplete.lastName)}
        helperText={requiredFieldsIncomplete.lastName}
        disabled={loading}
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
        disabled={loading}
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
        disabled={loading}
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

      {isCreate && (
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
        className={styles.enabledControl}
        control={
          <Checkbox
            name="enabled"
            checked={formData.enabled}
            onChange={handleFormChange}
            disabled={loading}
          />
        }
        label={t("enabled")}
      />
    </>
  );

  return (
    <Box
      component="form"
      className={sharedStyles.formPanel}
      aria-labelledby={headingId}
      aria-busy={loading}
      onSubmit={handleSubmit}
    >
      <header className={sharedStyles.formHeader}>
        <div className={sharedStyles.heading}>
          <span className={sharedStyles.headingIcon} aria-hidden="true">
            {isCreate ? <PersonAddAltOutlined /> : <EditOutlined />}
          </span>
          <h1 id={headingId}>{t(isCreate ? "createTitle" : "editTitle")}</h1>
        </div>
      </header>

      <div className={sharedStyles.formFields}>{fields}</div>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <div className={sharedStyles.formActions}>
        <Button
          type="button"
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          className={sharedStyles.secondaryButton}
        >
          {t("cancel")}
        </Button>
        <Button
          type="submit"
          variant="contained"
          disableElevation
          disabled={loading}
          className={sharedStyles.primaryButton}
        >
          {loading ? t("saving") : t(isCreate ? "createUser" : "saveChanges")}
        </Button>
      </div>
    </Box>
  );
}
