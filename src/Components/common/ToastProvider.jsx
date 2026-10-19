"use client";

import { ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";

/** Below fixed navbar (top-4 + h-16 + gap). */
const TOAST_TOP_OFFSET = "5.5rem";

const toastLayerStyle = {
  top: TOAST_TOP_OFFSET,
  zIndex: 10000,
};

export default function ToastProvider() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        style={toastLayerStyle}
      />
      <Toaster
        position="top-right"
        containerStyle={toastLayerStyle}
        toastOptions={{ duration: 4000 }}
      />
    </>
  );
}