import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DloadLogo from "../assets/DloadLogo.png";
import ManImage from "../assets/ManImage.png";

// UI Only - No API calls

// Validation Schema
const validationSchema = Yup.object().shape({
  otp0: Yup.string().required(''),
  otp1: Yup.string().required(''),
  otp2: Yup.string().required(''),
  otp3: Yup.string().required(''),
  otp4: Yup.string().required(''),
  otp5: Yup.string().required(''),
}).test('otpComplete', 'OTP must be 6 digits', function(values) {
  const otp = Array.from({ length: 6 }, (_, i) => values[`otp${i}`] || '').join('');
  return otp.length === 6 && /^\d+$/.test(otp);
});

const OTPVerify = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
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

    // Simulate API call delay for UI demonstration
    setTimeout(() => {
      setSuccess('OTP verified successfully! Redirecting to login...');
      setLoading(false);
      setSubmitting(false);
      
      // Navigate to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }, 1000);
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
              <h2 className="text-2xl font-medium mb-2 font-[Poppins]" style={{ color: '#003F8F' }}>Verify OTP</h2>
              <p className="text-base font-normal font-[Inter]" style={{ color: '#6C757D' }}>Enter the OTP sent to your email</p>
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
                otp5: ''
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
                        {loading ? 'Verifying...' : 'Verify OTP'}
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
            <h1 className="text-4xl font-bold mb-4 font-[Poppins]">Verify OTP</h1>
            <p className="text-xl font-normal font-[Inter]">
              Enter the OTP sent to your email
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

