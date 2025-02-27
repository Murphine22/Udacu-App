import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-4 text-center text-gray-600 dark:text-gray-400 border-t dark:border-gray-700">
      <p>© {new Date().getFullYear()} Udacu-DIGC App</p>
    </footer>
  );
};

export default Footer;