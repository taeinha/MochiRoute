import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CustomState } from "@/types";

const initialState: CustomState = {
  isDarkMode: false,
  SidebarWidth: 325,
  MiniSidebarWidth: 92,
  TopbarHeight: 70,
  isCollapse: false,
  isMobileSidebar: false,
};

export const customSlice = createSlice({
  name: "custom",
  initialState,
  reducers: {
    setActiveMode: (state: CustomState, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    setSidebarWidth: (state: CustomState, action: PayloadAction<number>) => {
      state.SidebarWidth = action.payload;
    },
    setMiniSidebarWidth: (
      state: CustomState,
      action: PayloadAction<number>,
    ) => {
      state.MiniSidebarWidth = action.payload;
    },
    setTopbarHeight: (state: CustomState, action: PayloadAction<number>) => {
      state.TopbarHeight = action.payload;
    },
    setIsCollapse: (state: CustomState, action: PayloadAction<boolean>) => {
      state.isCollapse = action.payload;
    },
    setIsMobileSidebar: (
      state: CustomState,
      action: PayloadAction<boolean>,
    ) => {
      state.isMobileSidebar = action.payload;
    },
  },
});

export const {
  setActiveMode,
  setSidebarWidth,
  setMiniSidebarWidth,
  setTopbarHeight,
  setIsCollapse,
  setIsMobileSidebar,
} = customSlice.actions;
