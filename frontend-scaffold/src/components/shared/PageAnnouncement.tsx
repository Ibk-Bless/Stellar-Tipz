import React from "react";
import { useLocation } from "react-router-dom";

const routeLabels: Record<string, string> = {
  "/": "Home",
  "/dashboard": "Dashboard",
  "/leaderboard": "Leaderboard",
  "/profile": "Profile",
  "/profile/edit": "Edit profile",
  "/register": "Register profile",
  "/receipt": "Tip receipt",
  "/settings": "Settings",
  "/transactions": "Transactions",
};

function readablePath(pathname: string) {
  if (routeLabels[pathname]) return routeLabels[pathname];
  if (pathname.startsWith("/@")) {
    return `Creator profile ${pathname.slice(2)}`;
  }

  return pathname
    .split("/")
    .filter(Boolean)
    .map((part) => part.replace(/-/g, " "))
    .join(" ") || "Home";
}

const PageAnnouncement: React.FC = () => {
  const location = useLocation();
  const [announcement, setAnnouncement] = React.useState("");

  React.useEffect(() => {
    const title = document.title.replace(/\s*\|\s*Stellar Tipz\s*$/i, "").trim();
    const pageName = title || readablePath(location.pathname);
    setAnnouncement(`Navigated to ${pageName}`);
  }, [location.pathname]);

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
  );
};

export default PageAnnouncement;
