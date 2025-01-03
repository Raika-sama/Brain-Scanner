// src/pages/ProfilePage/components.js
import React from 'react';
import { motion } from 'framer-motion';
import { Component } from 'lucide-react';

export const Section = ({ icon, title, children }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <div className="flex items-center space-x-4 mb-6">
      <div className="p-3 bg-blue-100 rounded-full">
        {React.cloneElement(icon, { className: "w-6 h-6 text-blue-600" })}
      </div>
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
    </div>
    {children}
  </div>
);

export const InfoField = ({ icon, label, value }) => (
  <div className="flex items-center space-x-3">
    {icon && (
      <div className="text-gray-400">
        {React.cloneElement(icon, { className: "w-4 h-4" })}
      </div>
    )}
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-base font-medium text-gray-900">{value || '-'}</div>
    </div>
  </div>
);

export const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <motion.div
      className="w-16 h-16 border-4 border-blue-200 rounded-full"
      style={{ borderTopColor: '#60A5FA' }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

export const ErrorMessage = ({ message }) => (
  <div className="text-center text-red-500 p-4">
    {message}
  </div>
);

