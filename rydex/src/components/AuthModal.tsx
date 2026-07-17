"use client";
import axios from "axios";
import { AlertCircle, CircleDashed, Lock, Mail, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

type propType = {
  open: boolean;
  onClose: () => void;
};
type stepType = "login" | "signup" | "otp";

const AuthModal = ({ open, onClose }: propType) => {
  const [step, setStep] = useState<stepType>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleSignUp = async () => {
    setLoading(true);
    try {
      await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });

      setErr("");
      setLoading(false);
      setStep("otp");
    } catch (error: any) {
      setLoading(false);
      setErr(error.response.data.message || "Something went wrong");
    }
  };

  const handleVerifyEmail = async () => {
    setLoading(true);
    try {
      await axios.post("/api/auth/verify-email", {
        email,
        otp: otp.join(""),
      });

      setOtp(["", "", "", "", "", ""]);
      setErr("");
      setLoading(false);
      setStep("login");
    } catch (error: any) {
      setLoading(false);
      setErr(error.response.data.message || "Something went wrong");
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    await signIn("credentials", {
      email: email,
      password: password,
      redirect: false,
    });
    setLoading(false);
    onClose();
    setEmail("");
    setPassword("");
  };

  const handleGoogleLogin = async () => {
    await signIn("google");
  };

  const handleChangeOtp = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
    if (!value && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-90 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="fixed inset-0 z-100 flex items-center justify-center px-4"
              onClick={onClose}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-[0_40px_100px_rgba(0,0,0,0.35)] p-6 sm:p-8 text-black"
              >
                <div
                  className="absolute right-4 top-4 text-gray-600 hover:text-black transition cursor-pointer"
                  onClick={onClose}
                >
                  <X />
                </div>

                <div className="mb-6 text-center">
                  <h1 className="text-3xl font-extrabold tracking-widest">
                    RYDEX
                  </h1>
                  <p className="mt-1 text-xs text-gray-700">
                    Premium Vehicle Booking
                  </p>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  className="w-full h-11 rounded-xl border border-black/20 flex items-center justify-center gap-3 text-sm font-semibold hover:bg-black hover:text-white transition cursor-pointer"
                >
                  <Image
                    src={"/google.png"}
                    alt="google"
                    height={25}
                    width={25}
                  />
                  Continue with Google
                </button>

                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-black/30" />
                  <div className="text-xs text-gray-600">OR</div>
                  <div className="flex-1 h-px bg-black/30" />
                </div>

                <div>
                  {step == "login" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <h1 className="text-xl font-semibold">Welcome back</h1>
                      <div className="mt-5 space-y-4">
                        <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                          <Mail size={18} className="text-gray-600" />
                          <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full bg-transparent outline-none text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                          <Lock size={18} className="text-gray-600" />
                          <input
                            type="password"
                            placeholder="Enter your password"
                            className="w-full bg-transparent outline-none text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>

                        <button
                          className="cursor-pointer w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition flex justify-center items-center"
                          disabled={loading}
                          onClick={handleLogin}
                        >
                          {loading ? (
                            <CircleDashed
                              size={20}
                              color="white"
                              className="animate-spin"
                            />
                          ) : (
                            "Login"
                          )}
                        </button>
                      </div>
                      <div className="mt-6 text-center text-sm text-gray-600">
                        Don&apos;t have an account?{" "}
                        <div
                          className="text-black font-medium hover:underline cursor-pointer"
                          onClick={() => setStep("signup")}
                        >
                          Sign Up
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step == "signup" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <h1 className="text-xl font-semibold">Create Account</h1>
                      <div className="mt-5 space-y-4">
                        <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                          <User size={18} className="text-gray-600" />
                          <input
                            type="text"
                            placeholder="Enter your full Name"
                            className="w-full bg-transparent outline-none text-sm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                          <Mail size={18} className="text-gray-600" />
                          <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full bg-transparent outline-none text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                          <Lock size={18} className="text-gray-600" />
                          <input
                            type="password"
                            placeholder="Enter your password"
                            className="w-full bg-transparent outline-none text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>

                        {err && (
                          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <p className="text-red-800 text-sm">{err}</p>
                          </div>
                        )}

                        <button
                          className="cursor-pointer w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition flex justify-center items-center"
                          onClick={handleSignUp}
                          disabled={loading}
                        >
                          {loading ? (
                            <CircleDashed
                              size={20}
                              color="white"
                              className="animate-spin"
                            />
                          ) : (
                            "Send OTP"
                          )}
                        </button>
                      </div>
                      <div className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <div
                          className="text-black font-medium hover:underline cursor-pointer"
                          onClick={() => setStep("login")}
                        >
                          Login
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step == "otp" && (
                    <motion.div
                      key="otp"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h2 className="text-xl font-semibold">Verify Email</h2>
                      <div className="mt-6 flex justify-between gap-2">
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            id={`otp-${i}`}
                            value={digit}
                            maxLength={1}
                            className="w-10 h-12 sm:w-12 text-center text-lg font-semibold rounded-xl bg-white border border-black/20 outline-none"
                            onChange={(e) => handleChangeOtp(i, e.target.value)}
                          />
                        ))}
                      </div>

                      {err && (
                        <div className="my-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                          <p className="text-red-800 text-sm">{err}</p>
                        </div>
                      )}

                      <button
                        className="mt-6 w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition cursor-pointer flex justify-center items-center"
                        onClick={handleVerifyEmail}
                        disabled={loading}
                      >
                        {loading ? (
                          <CircleDashed
                            size={20}
                            color="white"
                            className="animate-spin"
                          />
                        ) : (
                          "Verify and Create Account"
                        )}
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
