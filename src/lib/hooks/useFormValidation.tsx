import { useState } from "react";
import { FieldStatus } from "../types/types";

export const useFormValidation = () => {
  const [emailStatus, setEmailStatus] = useState<FieldStatus>("initial");
  const [passwordStatus, setPasswordStatus] = useState<FieldStatus>("initial");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z]).{8,}$/;

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setEmailStatus("invalid");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailStatus("invalid");
      return false;
    }
    setEmailStatus("valid");
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password.trim()) {
      setPasswordStatus("invalid");
      return false;
    }
    if (!passwordRegex.test(password)) {
      setPasswordStatus("invalid");
      return false;
    }
    setPasswordStatus("valid");
    return true;
  };

  const validateForm = (email: string, password: string): boolean => {
    const emailValid = validateEmail(email);
    const passwordValid = validatePassword(password);
    return emailValid && passwordValid;
  };

  return {
    emailStatus,
    passwordStatus,
    validateEmail,
    validatePassword,
    validateForm,
  };
};
