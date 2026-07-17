"use client";
import { motion } from "motion/react";
import { FaFacebookF } from "react-icons/fa";
import { IoLogoInstagram } from "react-icons/io5";
import { FaTwitter } from "react-icons/fa";
import { FiLinkedin } from "react-icons/fi";

const Footer = () => {
  return (
    <div className="w-full bg-black text-white">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6 py-16"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h2 className="text-2xl font-bold tracking-wide">RYDEX</h2>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed">
              Book any vehicle — from bikes to trucks. Trusted owners.
              Transparent pricing.
            </p>
            <div className="flex gap-4 items-center mt-6">
              {[FaFacebookF, IoLogoInstagram, FaTwitter, FiLinkedin].map(
                (Icon, i) => (
                  <motion.a
                    key={i}
                    whileHover={{ y: -3 }}
                    href="#"
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 hover:bg-white hover:text-black transition cursor-pointer"
                  >
                    <Icon size={18} />
                  </motion.a>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8">
          <div className="max-w-7xl mx-auto p-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-4">
            <p>© {new Date().getFullYear()} RYDEX. ALl rights reserved.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Footer;
