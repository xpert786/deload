import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DloadLogo from "../assets/DloadLogo.png";
import ManImage from "../assets/ManImage.png";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

// Validation Schema
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .required('Email is required')
    .email('Please enter a valid email address'),
});

const ForgotPassword = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Ensure API_BASE_URL doesn't have trailing slash
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      // Check if baseUrl already includes /api, if not add it
      const apiUrl = baseUrl.includes('/api')
        ? `${baseUrl}/auth/request-password-reset/`
        : `${baseUrl}/api/auth/request-password-reset/`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email }),
      });

      let result;
      try {
        const responseText = await response.text();
        if (responseText) {
          result = JSON.parse(responseText);
        } else {
          result = {};
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Failed to parse server response');
      }

      if (response.ok) {
        setSuccess(result.message || 'Password reset link has been sent to your email. Please check your inbox.');
        setLoading(false);
        setSubmitting(false);
        
        // Navigate to OTP page after a delay
        setTimeout(() => {
          navigate('/otp-verify', { state: { email: values.email } });
        }, 2000);
      } else {
        const errorMessage = result.message || result.error || result.detail || 'Failed to send password reset email';
        setError(errorMessage);
        setLoading(false);
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Error sending password reset email:', err);
      setError(err.message || 'Failed to send password reset email. Please try again.');
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
              <h2 className="text-2xl font-medium mb-2 font-[Poppins]" style={{ color: '#003F8F' }}>Forgot Password</h2>
              <p className="text-base font-normal font-[Inter]" style={{ color: '#6C757D' }}>Enter your email to reset your password</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm whitespace-pre-line">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm whitespace-pre-line">
                {success}
              </div>
            )}

            <Formik
              initialValues={{
                email: ''
              }}
              validationSchema={validationSchema}
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

                  {/* Submit Button */}
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={loading || isSubmitting}
                      className="w-full py-3 rounded-lg font-[Inter] font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      style={{
                        backgroundColor: '#003F8F',
                      }}
                    >
                      {loading ? 'Sending...' : 'Send code'}
                    </button>
                  </div>

                  {/* Back to Login Link */}
                  <div className="flex justify-center mt-6">
                    <p className="text-sm font-[Inter]" style={{ color: '#6C757D' }}>
                      Remember your password?{' '}
                      <Link
                        to="/login"
                        className="underline hover:no-underline transition-all font-[Inter] cursor-pointer"
                        style={{ color: '#003F8F' }}
                      >
                        Login
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
            <h1 className="text-4xl font-bold mb-4 font-[Poppins]">Forgot Password</h1>
            <p className="text-xl font-normal font-[Inter]">
              Enter your email to reset your password
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

export default ForgotPassword;

