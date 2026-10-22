"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";

import { useAuth } from "@/hooks/useAuth";
import type { ApiErrorResponse } from "@/types/apiTypes";

import { login } from "../services/authService";
import type { LoginRequest } from "../types/authTypes";

interface RequiredFieldsErrors {
  username?: string;
  password?: string;
}

export default function LoginForm() {
  const router = useRouter();
  const { setAuthentication } = useAuth();

  const [formData, setFormData] = useState<LoginRequest>({
    username: "",
    password: "",
  });

  const [requiredFieldsIncomplete, setRequiredFieldsIncomplete] =
    useState<RequiredFieldsErrors>({});

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateRequiredFields = () => {
    const errorMissingFields: RequiredFieldsErrors = {};

    if (!formData.username.trim()) {
      errorMissingFields.username = "Please enter a username";
    }

    if (!formData.password.trim()) {
      errorMissingFields.password = "Please enter a password";
    }

    setRequiredFieldsIncomplete(errorMissingFields);

    return Object.keys(errorMissingFields).length !== 0;
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setError("");

    if (validateRequiredFields()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await login(formData);

      console.log("response: ", response);

      setAuthentication(response.token, response.username, response.rol);

      router.replace("/dashboard");
    } catch (error) {
      // Checks if the error comes from Axios and types the API error response.
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        if (error.response?.status === 403) {
          setError("Invalid username or password");
          return;
        }

        setError(
          error.response?.data.message ?? "Unable to connect to the server",
        );
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="username">Username</Label>

        <Input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleFormChange}
        />

        {requiredFieldsIncomplete.username && (
          <p>{requiredFieldsIncomplete.username}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>

        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleFormChange}
        />

        {requiredFieldsIncomplete.password && (
          <p>{requiredFieldsIncomplete.password}</p>
        )}
      </div>

      {error && <p>{error}</p>}

      <Button type="submit" variant="login" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </Button>

      <Button
        onClick={() => setFormData({ username: "admin", password: "123456" })}
      >
        ADMIN
      </Button>

      <Button
        onClick={() =>
          setFormData({ username: "technician", password: "123456" })
        }
      >
        TECHINICIAN
      </Button>

      <Button
        onClick={() => setFormData({ username: "user", password: "123456" })}
      >
        USER
      </Button>
    </form>
  );
}
