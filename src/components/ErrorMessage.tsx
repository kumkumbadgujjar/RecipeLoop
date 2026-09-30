import React from 'react';

interface ErrorMessageProps {
  errorMessage: string | null;
  onRetry: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  errorMessage,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full px-6 py-12 text-center">
      <p className="text-base font-semibold text-[#FF5722] mb-6 max-w-md">
        {errorMessage || 'An unexpected error occurred'}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="w-full max-w-xs py-3 px-6 rounded-xl bg-white border border-neutral-300 text-neutral-800 font-bold text-base shadow-sm hover:bg-neutral-50 active:scale-[0.98] transition cursor-pointer"
      >
        Retry
      </button>
    </div>
  );
};
