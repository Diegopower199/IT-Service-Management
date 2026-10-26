"use client";

import { useEffect, useState } from "react";

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

import { createUser, updateUser } from "../../services/userService";
import { getAllActiveRoles } from "@/app/modules/roles/services/rolesService";
import { getAllActiveDepartments } from "@/app/modules/departments/services/departmentService";
import { getApiError } from "@/utils/apiErrorUtils";

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
  rolId: number;
  departmentId: number;
  enabled: boolean;
}

const INITIAL_FORM_DATA: UserFormData = {
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  password: "",
  rolId: 0,
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
      rolId: selectedUser.rol.idRol,
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

  const fetchRolesOptions = async (): Promise<boolean> => {
    try {
      const rolesResponse = await getAllActiveRoles();

      setRolesOptions(rolesResponse);

      return true;
    } catch (error) {
      console.error("Error loading roles:", error);

      setErrorMessage("Error loading roles.");

      return false;
    }
  };

  const fetchDepartmentsOptions = async (): Promise<boolean> => {
    try {
      const departmentsResponse = await getAllActiveDepartments();

      setDepartmentsOptions(departmentsResponse);

      return true;
    } catch (error) {
      console.error("Error loading departments:", error);

      setErrorMessage("Error loading departments.");

      return false;
    }
  };

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
  }, []);

  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]:
        type === "checkbox"
          ? (event.target as HTMLInputElement).checked
          : name === "rolId" || name === "departmentId"
            ? Number(value)
            : value,
    }));

    setRequiredFieldsIncomplete((previousErrors) => ({
      ...previousErrors,
      [name]: undefined,
    }));
  };

  const validateRequiredFields = () => {
    const errorMissingFields: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.username.trim()) {
      errorMissingFields.username = "Please enter a username.";
    }

    if (!formData.email.trim()) {
      errorMissingFields.email = "Please enter an email.";
    }

    if (!formData.firstName.trim()) {
      errorMissingFields.firstName = "Please enter a first name.";
    }

    if (!formData.lastName.trim()) {
      errorMissingFields.lastName = "Please enter a last name.";
    }

    if (!formData.rolId) {
      errorMissingFields.rolId = "Please select a role.";
    }

    if (!formData.departmentId) {
      errorMissingFields.departmentId = "Please select a department.";
    }

    if (formMode === FORM_MODES.CREATE && !formData.password.trim()) {
      errorMissingFields.password = "Please enter a password.";
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
          rolId: formData.rolId,
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
          rolId: formData.rolId,
          departmentId: formData.departmentId,
          enabled: formData.enabled,
        });
      }

      onSubmitSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);

      const apiError = getApiError(error);

      if (apiError?.errors) {
        setRequiredFieldsIncomplete(apiError.errors);

        return;
      }

      setErrorMessage(
        apiError?.message ??
          (formMode === FORM_MODES.CREATE
            ? "Error creating user."
            : "Error updating user."),
      );
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (formMode === FORM_MODES.CREATE) {
      return "Create User";
    }

    if (formMode === FORM_MODES.VIEW) {
      return "User Details";
    }

    return "Edit User";
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h4" component="h1" gutterBottom>
        {getTitle()}
      </Typography>

      <Stack spacing={3}>
        <TextField
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.username)}
          helperText={requiredFieldsIncomplete.username}
          disabled={formMode === FORM_MODES.VIEW}
          fullWidth
        />

        <TextField
          label="Email"
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
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.firstName)}
          helperText={requiredFieldsIncomplete.firstName}
          disabled={formMode === FORM_MODES.VIEW}
          fullWidth
        />

        <TextField
          label="Last Name"
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
          label="Role"
          name="rolId"
          value={
            rolesOptions.some((role) => role.idRol === formData.rolId)
              ? formData.rolId
              : 0
          }
          onChange={handleFormChange}
          error={Boolean(requiredFieldsIncomplete.rolId)}
          helperText={requiredFieldsIncomplete.rolId}
          disabled={formMode === FORM_MODES.VIEW}
          fullWidth
        >
          <MenuItem value={0} disabled>
            Select a role
          </MenuItem>

          {rolesOptions.length === 0 ? (
            <MenuItem disabled>No roles available</MenuItem>
          ) : (
            rolesOptions.map((role) => (
              <MenuItem key={role.idRol} value={role.idRol}>
                {role.name}
              </MenuItem>
            ))
          )}
        </TextField>

        <TextField
          select
          label="Department"
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
            Select a department
          </MenuItem>

          {departmentsOptions.length === 0 ? (
            <MenuItem disabled>No departments available</MenuItem>
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
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleFormChange}
            error={Boolean(requiredFieldsIncomplete.password)}
            helperText={requiredFieldsIncomplete.password}
            fullWidth
          />
        )}

        <FormControlLabel
          control={
            <Checkbox
              name="enabled"
              checked={formData.enabled}
              onChange={handleFormChange}
              disabled={formMode === FORM_MODES.VIEW}
            />
          }
          label="Enabled"
        />

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Stack spacing={3} direction="row">
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            {formMode === FORM_MODES.VIEW ? "Back" : "Cancel"}
          </Button>

          {formMode !== FORM_MODES.VIEW && (
            <Button type="submit" variant="contained" disabled={loading}>
              {loading
                ? "Saving..."
                : formMode === FORM_MODES.CREATE
                  ? "Create User"
                  : "Save Changes"}
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
