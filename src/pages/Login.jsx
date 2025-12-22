import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DloadLogo from "../assets/DloadLogo.png";
import ManImage from "../assets/ManImage.png";

// Use API URL from .env file only
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

// Cookie utility functions
const setCookie = (name, value, days = 30) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Validation Schema
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: Yup.string()
    .required('Password is required')
    .min(5, 'Password must be at least 5 characters'),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load remembered email and password from cookie on component mount
  const [initialEmail, setInitialEmail] = useState('');
  const [initialPassword, setInitialPassword] = useState('');

  useEffect(() => {
    const rememberedEmail = getCookie('rememberedEmail');
    const rememberedPassword = getCookie('rememberedPassword');
    if (rememberedEmail) {
      setRememberMe(true);
      setInitialEmail(rememberedEmail);
      if (rememberedPassword) {
        setInitialPassword(rememberedPassword);
        console.log('✓ Remembered email and password loaded from cookie');
      } else {
        console.log('✓ Remembered email loaded from cookie');
      }
    }
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    setLoading(true);

    try {
      // Ensure API_BASE_URL doesn't have trailing slash
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const apiUrl = `${baseUrl}/login/`;

      console.log('API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session-based auth
        body: JSON.stringify({
          email: values.email,
          password: values.password
        }),
      });

      // Check response headers for token (some APIs return token in headers)
      const authHeader = response.headers.get('Authorization') ||
        response.headers.get('X-Auth-Token') ||
        response.headers.get('X-Token');

      if (authHeader) {
        const token = authHeader.replace('Bearer ', '').replace('Token ', '');
        console.log('Token found in response headers:', token.substring(0, 20) + '...');
        localStorage.setItem('token', token);
        localStorage.setItem('access_token', token);
      }

      let result;
      try {
        const responseText = await response.text();
        console.log('Response status:', response.status);
        console.log('Response text:', responseText);

        if (responseText) {
          result = JSON.parse(responseText);
        } else {
          result = {};
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        if (response.status === 400) {
          setError('Invalid email or password. Please check your credentials.');
        } else if (response.status === 401) {
          setError('Invalid email or password.');
        } else if (response.status === 0 || response.status >= 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(`Request failed with status ${response.status}. Please try again.`);
        }
        setLoading(false);
        return;
      }

      if (response.ok) {
        // Handle Remember Me functionality
        if (rememberMe) {
          // Save email and password to cookies for 30 days
          setCookie('rememberedEmail', values.email, 30);
          setCookie('rememberedPassword', values.password, 30);
          console.log('✓ Email and password saved to cookie (Remember Me enabled)');
        } else {
          // Remove cookies if Remember Me is unchecked
          deleteCookie('rememberedEmail');
          deleteCookie('rememberedPassword');
          console.log('✓ Email and password cookies removed (Remember Me disabled)');
        }

        // Store user data in localStorage
        console.log('Login response:', result);

        const responseData = result.data || result.user || result;
        const userData = {
          id: responseData?.id,
          email: responseData?.email || values.email,
          fullname: responseData?.fullname || responseData?.name,
          role: responseData?.role,
          ...responseData
        };

        // Ensure role is present
        if (!userData.role) {
          console.error('Role not found in response:', result);
          setError('Login successful but role information is missing. Please contact support.');
          setLoading(false);
          return;
        }

        // Store token if present in response - check all possible locations
        // Priority: tokens.access (JWT format) > token > access_token > etc.
        const authToken = result.tokens?.access ||  // JWT tokens.access format
          result.tokens?.access_token ||
          result.token ||
          result.access_token ||
          result.accessToken ||
          result.access ||
          result.data?.token ||
          result.data?.access_token ||
          result.data?.accessToken ||
          result.data?.access ||
          responseData?.token ||
          responseData?.access_token ||
          responseData?.accessToken ||
          responseData?.access;

        // Also store refresh token if available
        const refreshToken = result.tokens?.refresh ||
          result.tokens?.refresh_token ||
          result.refresh_token ||
          result.refresh;

        if (authToken) {
          userData.token = authToken;
          // Also store token separately for easy access
          localStorage.setItem('token', authToken);
          localStorage.setItem('access_token', authToken);
          console.log('✓ Access token stored:', authToken.substring(0, 30) + '...');

          // Store refresh token if available
          if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
            console.log('✓ Refresh token stored');
          }
        } else {
          console.warn('⚠ No token found in login response. API might use session-based auth.');
          console.log('Full login response:', JSON.stringify(result, null, 2));
          // If no token, API uses session-based auth with cookies
          // This is fine - credentials: 'include' will send cookies
        }

        localStorage.setItem('user', JSON.stringify(userData));
        console.log('User logged in:', { ...userData, token: authToken ? '***' : 'none' });

        // Trigger AuthContext update by dispatching custom event
        window.dispatchEvent(new Event('userUpdated'));

        // Normalize role to lowercase for comparison
        const userRole = userData.role?.toLowerCase();

        // Redirect based on role (client, coach, admin)
        if (userRole === 'client') {
          navigate('/client/dashboard', { replace: true });
        } else if (userRole === 'coach') {
          navigate('/coach/dashboard', { replace: true });
        } else if (userRole === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          console.error('Unknown role:', userData.role);
          setError(`Unknown user role: ${userData.role}. Please contact support.`);
        }
      } else {
        // Handle different error formats
        let errorMessage = 'Login failed. Please try again.';

        // Check for nested errors structure: { message: "...", errors: { non_field_errors: [...] } }
        if (result.errors?.non_field_errors) {
          errorMessage = Array.isArray(result.errors.non_field_errors)
            ? result.errors.non_field_errors[0]
            : result.errors.non_field_errors;
        } 
        // Check for direct non_field_errors
        else if (result.non_field_errors) {
          errorMessage = Array.isArray(result.non_field_errors)
            ? result.non_field_errors[0]
            : result.non_field_errors;
        }
        // Check for message (but prefer nested errors if available)
        else if (result.message) {
          errorMessage = result.message;
        } 
        // Other error formats
        else if (result.error) {
          errorMessage = result.error;
        } else if (result.detail) {
          errorMessage = result.detail;
        }

        setError(errorMessage);
        console.error('API Error Response:', result);
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });

      // Handle CORS and network errors
      if (err.name === 'TypeError' && (err.message.includes('fetch') || err.message.includes('Failed to fetch'))) {
        setError('Network/CORS Error: Unable to connect to the server. This could be due to:\n1. CORS issue - Backend needs to allow requests from http://localhost:5173\n2. Server is down or unreachable\n3. Network connectivity issue\n\nPlease check the API URL in .env file and ensure the backend server is running and configured for CORS.');
      } else if (err.message) {
        setError(`Error: ${err.message}`);
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* Logo at top-left corner */}
      <img src={DloadLogo} alt="Deload Logo" className="w-24 absolute top-8 left-8 z-10" />

      <div className="flex">
        {/* Left Form Section */}
        <div className="w-1/2 flex flex-col items-center bg-[#F7F7F7] p-12 pt-48 min-h-screen">
          <div
            className="w-full max-w-md bg-white p-8 rounded-lg "
            style={{
              border: '1px solid #C7C7C7CC',
              backdropFilter: 'blur(65px)'
            }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-medium mb-2 font-[Poppins]" style={{ color: '#003F8F' }}>Welcome back</h2>
              <p className="text-base font-normal font-[Inter]" style={{ color: '#6C757D' }}>Login to continue...</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm whitespace-pre-line">
                {error}
              </div>
            )}

            <Formik
              initialValues={{
                email: initialEmail,
                password: initialPassword
              }}
              validationSchema={validationSchema}
              enableReinitialize={true}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium font-[Poppins]" style={{ color: '#003F8F' }}>Email</label>
                    <Field
                      type="email"
                      name="email"
                      id="email"
                      placeholder="Enter your email"
                      className={`mt-1 block w-full rounded-md px-3 py-2 focus:outline-none inter-placeholder ${
                        errors.email && touched.email ? 'border-red-500' : ''
                      }`}
                      style={{
                        border: errors.email && touched.email ? '1px solid #EF4444' : '1px solid #003F8F',
                        fontFamily: 'Inter'
                      }}
                    />
                    <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1 font-[Inter]" />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium font-[Poppins]" style={{ color: '#003F8F' }}>Password</label>
                    <div className="relative mt-1">
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="password"
                        placeholder="Enter your password"
                        className={`block w-full rounded-md px-3 py-2 pr-10 focus:outline-none inter-placeholder ${
                          errors.password && touched.password ? 'border-red-500' : ''
                        }`}
                        style={{
                          border: errors.password && touched.password ? '1px solid #EF4444' : '1px solid #003F8F',
                          fontFamily: 'Inter'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#6B7280">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#6B7280">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1 font-[Inter]" />
                  </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between h-full">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setRememberMe(isChecked);
                      // If unchecking, remove the cookies immediately
                      if (!isChecked) {
                        deleteCookie('rememberedEmail');
                        deleteCookie('rememberedPassword');
                        console.log('✓ Remember Me unchecked - email and password cookies removed');
                      }
                    }}
                    className="h-4 w-4 rounded font-[Inter] cursor-pointer"
                    style={{
                      border: '1px solid #003F8F',
                      accentColor: '#003F8F'
                    }}
                  />
                  <label
                    htmlFor="rememberMe"
                    className="ml-2 text-sm font-normal font-[Inter]"
                    style={{
                      color: '#333333',
                    }}
                  >
                    Remember Me
                  </label>
                </div>
                <Link
                  to="#"
                  className="text-sm font-normal font-[Inter] cursor-pointer"
                  style={{
                    color: '#333333',
                  }}
                >
                  Forgot Password?
                </Link>
              </div>

                  {/* Login Button */}
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={loading || isSubmitting}
                      className="w-full py-3 rounded-lg font-[Inter] font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      style={{
                        backgroundColor: '#003F8F',
                      }}
                    >
                      {loading ? 'Logging in...' : 'Login'}
                    </button>
                  </div>

                  {/* Sign up Link */}
                  <div className="flex justify-center mt-6">
                    <p className="text-sm font-[Inter]" style={{ color: '#6C757D' }}>
                      Don't have an account?{' '}
                      <Link
                        to="/register"
                        className="underline hover:no-underline transition-all font-[Inter] cursor-pointer"
                        style={{ color: '#003F8F' }}
                      >
                        Sign up
                      </Link>
                    </p>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>

        {/* Right Info Section */}
        <div className="w-1/2 bg-[linear-gradient(146.13deg,#003F8F_0%,#467EC6_30.29%,#74A8EA_50.48%,#3C75BE_74.52%,#003F8F_100%)] text-white flex flex-col relative min-h-screen">
          <div className="pl-10 pt-20">
            <h1 className="text-4xl font-bold mb-4 font-[Poppins]">Welcome back</h1>
            <p className="text-xl font-normal font-[Inter]">
              Login to continue...
            </p>
          </div>

          {/* Image positioned at bottom-right corner */}
          <img
            src={ManImage}
            alt="Welcome Preview"
            className="absolute bottom-0 right-0"
            style={{
              height: '70vh',
              width: 'auto',
              objectFit: 'cover',
              objectPosition: 'right bottom',
              maxWidth: '100%',
              zIndex: 1,
              paddingLeft: '80px',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;

