import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useQueryCache } from "react-query";

import * as auth from "./provider";
import useAsync from "../utils/use-async";

const bootstrap = async () => {
  let user = auth.getUser();

  if (!user || !Object.keys(user).length) {
    user = await auth.bootstrap();
  }

  return user;
};

const AuthContext = createContext();
AuthContext.displayName = "AuthContext";

const AuthProvider = (props) => {
  const {
    data: user,
    error,
    isLoading,
    isIdle,
    isError,
    isSuccess,
    run,
    setData,
    status,
  } = useAsync();
  const queryCache = useQueryCache();

  useEffect(() => {
    const bootstrapPromise = bootstrap();
    run(bootstrapPromise);
  }, [run]);

  const login = useCallback(
    (form) => auth.login(form).then((u) => setData(u)),
    [setData]
  );
  const register = useCallback(
    (form) => auth.register(form).then((u) => setData(u)),
    [setData]
  );
  const logout = useCallback(() => {
    auth.logout().then(() => {
      queryCache.clear();
      setData(null);
    });
  }, [queryCache, setData]);

  const value = useMemo(() => ({ user, login, logout, register }), [
    login,
    logout,
    register,
    user,
  ]);

  if (isLoading || isIdle) {
    return <h1>Loading...</h1>;
  }

  if (isError) {
    return <h1>Error: {error.message}</h1>;
  }

  if (isSuccess) {
    return <AuthContext.Provider value={value} {...props} />;
  }

  throw new Error(`Unhandled status: ${status}`);
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
