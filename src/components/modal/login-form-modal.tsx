// src/components/modal/login-form-modal.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

import Modal from '@/components/modal/modal';
import Button from '@/components/ui/button';
import { LoginFormValues, loginSchema } from '@/lib/validation/login';
import { useSignIn, useSignInWithGoogle } from '@/hooks/use-auth-actions';
import { useSendVerificationEmail } from '@/hooks/use-send-verification-email';
import { useSendPasswordReset } from '@/hooks/use-password-reset';
import GoogleIcon from '@/lib/icons/google-icon.svg';

interface Props {
  isOpen: boolean;
  onCloseAction: () => void;
}

export default function LoginFormModal({ isOpen, onCloseAction }: Props) {
  const signIn = useSignIn();
  const signInWithGoogle = useSignInWithGoogle();
  const sendVerification = useSendVerificationEmail();
  const sendPasswordReset = useSendPasswordReset();

  const [showEmailVerificationUI, setShowEmailVerificationUI] = useState(false);
  const [showForgotPasswordUI, setShowForgotPasswordUI] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const result = await signIn.mutateAsync({
        email: data.email,
        password: data.password,
      });

      // Перевіряємо, чи потрібна верифікація email
      if (result.needsEmailVerification) {
        setUserEmail(data.email);
        setShowEmailVerificationUI(true);
        return; // НЕ закриваємо модалку
      }

      // Якщо все ок, закриваємо модалку
      reset();
      onCloseAction();
    } catch (err) {
      console.error('Login error in component:', err);
      // toast removed — хуки вже показують повідомлення
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle.mutateAsync({ redirectPath: '/' });
      onCloseAction();
    } catch (err) {
      console.error('Google auth error in component:', err);
      // toast removed — хуки вже показують повідомлення
    }
  };

  const handleResendVerification = async () => {
    try {
      await sendVerification.mutateAsync();
    } catch (err) {
      console.error('Resend verification error:', err);
    }
  };

  const handleBackToLogin = () => {
    setShowEmailVerificationUI(false);
    setShowForgotPasswordUI(false);
    setUserEmail('');
  };

  const handleForgotPassword = () => {
    setShowForgotPasswordUI(true);
  };

  const handleSendPasswordReset = async (email: string) => {
    try {
      await sendPasswordReset.mutateAsync({ email });
    } catch (err) {
      console.error('Send password reset error:', err);
    }
  };

  const isSignInLoading = signIn.isPending;
  const isGoogleLoading = signInWithGoogle.isPending;
  const isResendLoading = sendVerification.isPending;
  const isPasswordResetLoading = sendPasswordReset.isPending;
  const isAnyLoading =
    isSignInLoading ||
    isGoogleLoading ||
    isResendLoading ||
    isPasswordResetLoading;

  // UI для відновлення паролю
  if (showForgotPasswordUI) {
    return (
      <Modal
        isOpen={isOpen}
        onCloseAction={onCloseAction}
        title="Reset Password"
      >
        <div className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>

          <div className="text-center">
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Reset Your Password
            </h3>
            <p className="text-shadow-gray-muted mb-4 leading-snug">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const email = formData.get('email') as string;
              handleSendPasswordReset(email);
            }}
            className="space-y-4"
          >
            <div>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                className="border-gray-muted w-full rounded-xl border p-4"
                disabled={isPasswordResetLoading}
              />
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={isPasswordResetLoading}
                className="w-full"
              >
                {isPasswordResetLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <Button
                type="button"
                onClick={handleBackToLogin}
                disabled={isAnyLoading}
                className="w-full bg-gray-500 hover:bg-gray-600"
              >
                Back to Login
              </Button>
            </div>
          </form>

          <div className="mt-4 text-center text-xs text-gray-500">
            <p>
              Remember your password?{' '}
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-blue-600 hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </Modal>
    );
  }

  // UI для повторної відправки верифікації
  if (showEmailVerificationUI) {
    return (
      <Modal
        isOpen={isOpen}
        onCloseAction={onCloseAction}
        title="Email Verification Required"
      >
        <div className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <svg
              className="h-8 w-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <div className="text-center">
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Email Verification Required
            </h3>
            <p className="text-shadow-gray-muted mb-4 leading-snug">
              Your email <strong>{userEmail}</strong> is not verified yet.
              Please check your inbox and click the verification link, or
              request a new one.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              onClick={handleResendVerification}
              disabled={isResendLoading}
              className="w-full"
            >
              {isResendLoading ? 'Sending...' : 'Resend Verification Email'}
            </Button>

            <Button
              type="button"
              onClick={handleBackToLogin}
              disabled={isAnyLoading}
              className="w-full bg-gray-500 hover:bg-gray-600"
            >
              Back to Login
            </Button>
          </div>

          <div className="mt-4 text-center text-xs text-gray-500">
            <p>
              Didn't receive the email? Check your spam folder or try resending.
            </p>
          </div>
        </div>
      </Modal>
    );
  }

  // Звичайний UI логіна
  return (
    <Modal isOpen={isOpen} onCloseAction={onCloseAction} title="Log In">
      <p className="text-shadow-gray-muted mb-5 leading-snug">
        Welcome back! Please enter your credentials to access your account and
        continue your search for a teacher.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-[18px]">
        <div>
          <input
            type="email"
            placeholder="Email"
            {...register('email')}
            className="border-gray-muted w-full rounded-xl border p-4"
            disabled={isAnyLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            {...register('password')}
            className="border-gray-muted w-full rounded-xl border p-4"
            disabled={isAnyLoading}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
          <div className="mt-2 text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="hover:text-yellow text-sm text-black hover:underline"
              disabled={isAnyLoading}
            >
              Forgot Password?
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isAnyLoading}
          className="w-full disabled:opacity-50"
        >
          {isSignInLoading ? 'Logging in…' : 'Log In'}
        </Button>

        <div className="my-4 flex items-center">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-500">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <Button
          type="button"
          onClick={handleGoogle}
          disabled={isAnyLoading}
          className="flex w-full items-center justify-center gap-2 disabled:opacity-50"
        >
          <GoogleIcon className="h-5 w-5" />
          {isGoogleLoading ? 'Signing in with Google…' : 'Sign In with Google'}
        </Button>
      </form>
    </Modal>
  );
}
