'use client';

import { useFacebook } from './hooks/useFacebook';

export default function Home() {
  const { login, isLoggedIn, logout } = useFacebook();

  const getMe = () => {
    window.FB.api(
      '/me',
      {
        access_token: localStorage.getItem('facebookAccessToken'),
      },
      (response) => {
        console.log('response', response);
      },
    );
  };

  return (
    <div className='text-black p-10 bg-white'>
      <div className='flex flex-row justify-around items-center'>
        <div
          className='fb-login-button'
          data-width='400'
          data-size=''
          data-button-type=''
          data-layout=''
          data-auto-logout-link='true'
          data-use-continue-as='true'
        ></div>
        <div>
          {isLoggedIn ? (
            <button className='button' onClick={logout}>
              Logout
            </button>
          ) : (
            <button className='button' onClick={login}>
              Login
            </button>
          )}
        </div>
        <button onClick={getMe}>Get Me</button>
      </div>
    </div>
  );
}
