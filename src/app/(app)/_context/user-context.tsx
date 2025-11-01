"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";
import type { SelectUserModel } from "@/db/schema/auth";

interface UserContextType {
  user: SelectUserModel | null;
  setUser: (user: SelectUserModel | null) => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);

export const UserProvider = ({
  user: initialUser,
  children,
}: {
  user: SelectUserModel | null;
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<SelectUserModel | null>(initialUser);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context.user;
};

export const useSetUser = () => {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("useSetUser must be used within a UserProvider");
  return context.setUser;
};
