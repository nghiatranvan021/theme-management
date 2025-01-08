import React from 'react';
import { FaGithub, FaLinkedin, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer>
      <div className="footer-content">
        <div className="social-links">
          <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer">
            <FaGithub />
          </a>
          <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer">
            <FaLinkedin />
          </a>
        </div>
        <p className="footer-text">
          Made with <FaHeart className="heart-icon" /> by nghiatv1 to all of FE team
        </p>
        <p className="copyright">&copy; 2025</p>
      </div>
    </footer>
  );
};

export default Footer; 