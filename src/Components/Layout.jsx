// // Layout.js
// import React from "react";
// import NavBar from "./NavBar";
// import Footer from "./Footer";
// import ScrollToTop from "./ScrollToTop";
// import PageMetaInjector from "../Hooks/PageMetaInjector";
// import { Outlet } from "next/navigation";

// const Layout = () => {
//   return (
//     <>
//       <ScrollToTop />
//       {/* <PageMetaInjector /> */}
//       <NavBar />
//       <Outlet />
//       <Footer />
//     </>
//   );
// };

// export default Layout;

// app/layout.js
import NavBar from "./NavBar";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";

export default function Layout({ children }) {
  return (
    <>
      <ScrollToTop />
      <NavBar />
      {children}
      <Footer />
    </>
  );
}