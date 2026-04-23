import React, { createContext, useContext, useEffect, useState } from 'react';

const USERS_STORAGE_KEY = 'smartcampus_users';
const AUTH_STORAGE_KEY = 'smartcampus_auth_user';

const AuthContext = createContext(null);

const defaultUsers = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
  { id: 2, username: 'user', password: 'user123', role: 'user' }
];

function normalizeUsers(users) {
  return users.map((user, index) => ({
    id: user.id ?? index + 1,
    username: user.username,
    password: user.password,
    role: user.role
  }));
}

function readUsers() {
  const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);

  if (!storedUsers) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }

  try {
    const parsedUsers = JSON.parse(storedUsers);

    if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
      const normalizedUsers = normalizeUsers(parsedUsers);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(normalizedUsers));
      return normalizedUsers;
    }

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
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
    const users = readUsers();

    if (currentUser && currentUser.id == null) {
      const matchedUser = users.find((user) => user.username === currentUser.username && user.role === currentUser.role);

      if (matchedUser) {
        const normalizedSessionUser = {
          id: matchedUser.id,
          username: matchedUser.username,
          role: matchedUser.role
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalizedSessionUser));
        setCurrentUser(normalizedSessionUser);
      }
    }
  }, [currentUser]);

  const register = ({ username, password, role }) => {
    const normalizedUsername = username.trim().toLowerCase();
    const users = readUsers();
    const existingUser = users.find((user) => user.username.toLowerCase() === normalizedUsername);

    if (existingUser) {
      return { success: false, message: 'Username already exists. Please choose another one.' };
    }

    const nextId = users.reduce((maxId, user) => Math.max(maxId, user.id || 0), 0) + 1;
    const newUser = { id: nextId, username: username.trim(), password, role };
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

    const sessionUser = { id: matchedUser.id, username: matchedUser.username, role: matchedUser.role };
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
