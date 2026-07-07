import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState } from "@/types";

const initialState: AuthState = {
  isAuthenticated: false,
  email: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    logout: (state) => {
      state.email = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setEmail, setIsAuthenticated, logout } = authSlice.actions;
