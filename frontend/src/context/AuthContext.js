import React, { createContext, useContext, useEffect, useState } from 'react';

const USERS_STORAGE_KEY = 'smartcampus_users';
const AUTH_STORAGE_KEY = 'smartcampus_auth_user';

const AuthContext = createContext(null);

const defaultUsers = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'user', password: 'user123', role: 'user' }
];

function readUsers() {
  const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);

  if (!storedUsers) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }

  try {
    const parsedUsers = JSON.parse(storedUsers);
    return Array.isArray(parsedUsers) && parsedUsers.length > 0 ? parsedUsers : defaultUsers;
  } catch (error) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
}

function readCurrentUser() {
  const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(readCurrentUser);

  useEffect(() => {
    readUsers();
  }, []);

  const register = ({ username, password, role }) => {
    const normalizedUsername = username.trim().toLowerCase();
    const users = readUsers();
    const existingUser = users.find((user) => user.username.toLowerCase() === normalizedUsername);

    if (existingUser) {
      return { success: false, message: 'Username already exists. Please choose another one.' };
    }

    const newUser = { username: username.trim(), password, role };
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([...users, newUser]));

    return { success: true };
  };

  const login = ({ username, password }) => {
    const users = readUsers();
    const matchedUser = users.find(
      (user) => user.username.toLowerCase() === username.trim().toLowerCase() && user.password === password
    );

    if (!matchedUser) {
      return { success: false, message: 'Invalid username or password.' };
    }

    const sessionUser = { username: matchedUser.username, role: matchedUser.role };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
    setCurrentUser(sessionUser);

    return { success: true, user: sessionUser };
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
