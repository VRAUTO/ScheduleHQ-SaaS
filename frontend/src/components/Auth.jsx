import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

const Auth = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const switchToSignup = () => setIsLoginMode(false);
  const switchToLogin = () => setIsLoginMode(true);

  return (
    <>
      {isLoginMode ? (
        <Login onSwitchToSignup={switchToSignup} />
      ) : (
        <Signup onSwitchToLogin={switchToLogin} />
      )}
    </>
  );
};

export default Auth;
