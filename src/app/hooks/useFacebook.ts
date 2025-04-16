'use client';

// Declare the Facebook SDK types
interface FacebookLoginStatusResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
    expiresIn: string;
    signedRequest: string;
    userID: string;
  };
}

// Response type for FB.api calls like /me
interface FacebookApiResponse {
  id?: string;
  name?: string;
  email?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // For other fields that might be returned
}

interface FacebookSDK {
  getLoginStatus(callback: (response: FacebookLoginStatusResponse) => void): void;
  login(callback: (response: FacebookLoginStatusResponse) => void): void;
  logout(callback: (response: FacebookLoginStatusResponse) => void): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  api(path: string, params: Record<string, string | null>, callback: (response: FacebookApiResponse) => void): void;
  // Add other FB SDK methods as needed
}

// Extend the Window interface
declare global {
  interface Window {
    FB: FacebookSDK;
  }
}

import { useCallback, useState } from 'react';
import { useEffect } from 'react';

export const useFacebook = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFBLoaded, setIsFBLoaded] = useState(false);

  useEffect(() => {
    const facebookAccessToken = localStorage.getItem('facebookAccessToken');
    console.log('facebookAccessToken', facebookAccessToken);
    if (facebookAccessToken) {
      localStorage.setItem('facebookAccessToken', facebookAccessToken);
      setIsLoggedIn(true);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.FB) {
      setIsFBLoaded(true);
      return;
    }
    const checkFBLoaded = setInterval(() => {
      if (window.FB) {
        setIsFBLoaded(true);
        clearInterval(checkFBLoaded);
      }
    }, 100);
    return () => clearInterval(checkFBLoaded);
  }, []);

  const getFacebookLoginStatus = useCallback(() => {
    return new Promise<FacebookLoginStatusResponse>((resolve) => {
      window.FB.getLoginStatus(
        (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          response: any,
        ) => {
          resolve(response);
        },
      );
    });
  }, []);

  const login = () => {
    return new Promise<FacebookLoginStatusResponse>((resolve) => {
      window.FB.login((response) => {
        resolve(response);
        setIsLoggedIn(true);
        checkLoginStatus();
      });
    });
  };

  const logout = useCallback(() => {
    return new Promise<FacebookLoginStatusResponse>((resolve) => {
      window.FB.logout((response) => {
        resolve(response);
        localStorage.removeItem('facebookAccessToken');
        setIsLoggedIn(false);
      });
    });
  }, []);

  const checkLoginStatus = useCallback(async () => {
    console.log('checkLoginStatus invoked');
    try {
      const response = await getFacebookLoginStatus();
      console.log('checkLoginStatus response', response);
      if (response.status === 'connected') {
        if (response.authResponse) {
          localStorage.setItem('facebookAccessToken', response.authResponse.accessToken);
          setIsLoggedIn(true);
        }
      } else {
        logout();
        setIsLoggedIn(false);
      }
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: any
    ) {
      console.error('Error checking Facebook login status:', error);
    }
  }, [getFacebookLoginStatus, logout]);

  useEffect(() => {
    if (!isFBLoaded) return;

    checkLoginStatus();
  }, [isFBLoaded, checkLoginStatus]);

  return { isLoggedIn, login, isFBLoaded, logout };
};
