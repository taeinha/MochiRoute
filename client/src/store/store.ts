import { configureStore } from "@reduxjs/toolkit";
import {
  useDispatch as useAppDispatch,
  useSelector as useAppSelector,
} from "react-redux";
import { authSlice } from "./slices";
import { customSlice } from "./slices/customSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    custom: customSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const { dispatch } = store;
export const useDispatch = () => useAppDispatch<AppDispatch>();
export const useSelector = <T>(selector: (state: RootState) => T) =>
  useAppSelector(selector);

export default store;
