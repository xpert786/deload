import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  otp0: Yup.string().required(''),
  otp1: Yup.string().required(''),
  otp2: Yup.string().required(''),
  otp3: Yup.string().required(''),
  otp4: Yup.string().required(''),
  otp5: Yup.string().required(''),
  new_password: Yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters'),
}).test('otpComplete', 'OTP must be 6 digits', function(values) {
  const otp = Array.from({ length: 6 }, (_, i) => values[`otp${i}`] || '').join('');
  return otp.length === 6 && /^\d+$/.test(otp);
});

const OTPVerify = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const otpInputRefs = useRef([]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
  }, []);

  const handleOTPChange = (e, index, setFieldValue) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return;
    }

    setFieldValue(`otp${index}`, value);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (e, index, setFieldValue) => {
    // Handle backspace
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
      setFieldValue(`otp${index - 1}`, '');
    }
  };

  const handlePaste = (e, setFieldValue) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      digits.forEach((digit, index) => {
        if (index < 6) {
          setFieldValue(`otp${index}`, digit);
        }
      });
      otpInputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    setSuccess('');
    setLoading(true);

    // Combine OTP digits
    const otp = Array.from({ length: 6 }, (_, i) => values[`otp${i}`] || '').join('');

    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      setLoading(false);
      setSubmitting(false);
      return;
    }

    try {
      // Ensure API_BASE_URL doesn't have trailing slash
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      // Check if baseUrl already includes /api, if not add it
      const apiUrl = baseUrl.includes('/api')
        ? `${baseUrl}/auth/verify-otp-reset-password/`
        : `${baseUrl}/api/auth/verify-otp-reset-password/`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otp,
          new_password: values.new_password
        }),
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
        setSuccess(result.message || 'Password reset successfully! Redirecting to login...');
        setLoading(false);
        setSubmitting(false);
        
        // Navigate to login after a delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const errorMessage = result.message || result.error || result.detail || 'Invalid OTP. Please try again.';
        setError(errorMessage);
        setLoading(false);
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError(err.message || 'Failed to verify OTP. Please try again.');
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
              <h2 className="text-2xl font-medium mb-2 font-[Poppins]" style={{ color: '#003F8F' }}>Reset Password</h2>
              <p className="text-base font-normal font-[Inter]" style={{ color: '#6C757D' }}>Enter the OTP and your new password</p>
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
                otp0: '',
                otp1: '',
                otp2: '',
                otp3: '',
                otp4: '',
                otp5: '',
                new_password: ''
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched, setFieldValue, values }) => {
                // Combine OTP values for validation
                const otp = Array.from({ length: 6 }, (_, i) => values[`otp${i}`] || '').join('');
                const otpError = errors.otp0 || errors.otp1 || errors.otp2 || errors.otp3 || errors.otp4 || errors.otp5 || errors.otpComplete;
                const hasOTPError = otpError && (touched.otp0 || touched.otp1 || touched.otp2 || touched.otp3 || touched.otp4 || touched.otp5);

                return (
                  <Form className="space-y-4">
                    {/* OTP Input */}
                    <div>
                      <label className="block text-sm font-medium font-[Poppins] mb-2" style={{ color: '#003F8F' }}>OTP</label>
                      <div className="flex gap-2 justify-between">
                        {Array.from({ length: 6 }, (_, i) => (
                          <Field
                            key={i}
                            innerRef={(el) => (otpInputRefs.current[i] = el)}
                            type="text"
                            name={`otp${i}`}
                            maxLength="1"
                            className={`w-12 h-12 text-center text-lg rounded-md focus:outline-none font-[Inter] ${
                              hasOTPError ? 'border-red-500' : ''
                            }`}
                            style={{
                              border: hasOTPError ? '1px solid #EF4444' : '1px solid #003F8F',
                              fontFamily: 'Inter'
                            }}
                            onChange={(e) => handleOTPChange(e, i, setFieldValue)}
                            onKeyDown={(e) => handleOTPKeyDown(e, i, setFieldValue)}
                            onPaste={(e) => handlePaste(e, setFieldValue)}
                          />
                        ))}
                      </div>
                      {hasOTPError && (
                        <div className="text-red-500 text-xs mt-1 font-[Inter]">
                          {errors.otpComplete || 'OTP must be 6 digits'}
                        </div>
                      )}
                    </div>

                    {/* New Password */}
                    <div>
                      <label htmlFor="new_password" className="block text-sm font-medium font-[Poppins]" style={{ color: '#003F8F' }}>New Password</label>
                      <div className="relative mt-1">
                        <Field
                          type={showPassword ? "text" : "password"}
                          name="new_password"
                          id="new_password"
                          placeholder="Enter new password"
                          className={`block w-full rounded-md px-3 py-2 pr-10 focus:outline-none inter-placeholder ${
                            errors.new_password && touched.new_password ? 'border-red-500' : ''
                          }`}
                          style={{
                            border: errors.new_password && touched.new_password ? '1px solid #EF4444' : '1px solid #003F8F',
                            fontFamily: 'Inter'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                        >
                          {showPassword ? (
                            <svg className="h-5 w-5" style={{ color: '#003F8F' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" style={{ color: '#003F8F' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <ErrorMessage name="new_password" component="div" className="text-red-500 text-xs mt-1 font-[Inter]" />
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
                        {loading ? 'Resetting Password...' : 'Reset Password'}
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
                );
              }}
            </Formik>
          </div>
        </div>

        {/* Right Info Section */}
        <div className="w-1/2 bg-[linear-gradient(146.13deg,#003F8F_0%,#467EC6_30.29%,#74A8EA_50.48%,#3C75BE_74.52%,#003F8F_100%)] text-white flex flex-col relative min-h-screen">
          <div className="pl-10 pt-20">
            <h1 className="text-4xl font-bold mb-4 font-[Poppins]">Reset Password</h1>
            <p className="text-xl font-normal font-[Inter]">
              Enter the OTP and your new password
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

export default OTPVerify;

