import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function FloatingMotes() {
  const motes = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => ({
        id: index,
        left: `${10 + index * 8}%`,
        top: `${12 + ((index * 11) % 64)}%`,
        delay: index * 0.18,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {motes.map((mote) => (
        <motion.span
          key={mote.id}
          className="absolute h-2 w-2 rounded-full bg-[#c89f62]/35"
          style={{ left: mote.left, top: mote.top }}
          animate={{ y: [0, -16, 0], opacity: [0.2, 0.75, 0.2] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: mote.delay }}
        />
      ))}
    </div>
  );
}

function ArtworkPanel({ mode }) {
  const quote =
    mode === "login"
      ? '"Mỗi độc giả trở lại đều mở tiếp một trang dang dở trong bộ sưu tập của riêng mình."'
      : '"Mọi hành trình đọc sách đều bắt đầu bằng một lần ghi tên thật chỉnh chu vào sổ lưu trữ."';

  const label = mode === "login" ? "Cánh cổng trở về" : "Khởi tạo hồ sơ đọc";
  const imageUrl =
    mode === "login"
      ? "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80"
      : "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="relative h-full min-h-full overflow-hidden bg-[#2d1a18]">
      <img src={imageUrl} alt="Không gian sách" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#2d1512]/90 via-[#3d231d]/45 to-[#5a3525]/18" />
      <div className="absolute inset-0 border border-white/10" />
      <div className="relative z-10 flex h-full items-end p-7 text-[#fff8ef] lg:p-8">
        <div className="w-full">
          <div className="mb-6 h-px w-16 bg-[#d6b784]/80" />
          <p className="font-[Newsreader] text-[2.15rem] italic leading-tight tracking-tight lg:text-[2.65rem]">
            {quote}
          </p>
          <div className="mt-8 flex items-end justify-between text-[#f3e5cf]/78">
            <span className="font-[Work_Sans] text-[10px] uppercase tracking-[0.35em]">{label}</span>
            <span className="font-[Work_Sans] text-[10px] uppercase tracking-[0.22em]">BookEco</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthFormPanel({
  isLogin,
  title,
  subtitle,
  switchCopy,
  register,
  handleSubmit,
  errors,
  showPassword,
  setShowPassword,
  isSubmitting,
  isGoogleLoading,
  onSubmit,
  handleGoogleSignIn,
}) {
  return (
    <div className="h-full bg-[#fffdf8]">
      <div className="flex h-full min-h-full flex-col justify-between p-5 sm:p-6 lg:p-7">
        <div>
          <div className="mb-6 flex items-center gap-3 text-[#775a19]">
            <span className="font-[Work_Sans] text-[10px] uppercase tracking-[0.35em]">The Archivist&apos;s Sanctum</span>
          </div>

          <div className="mb-5 space-y-3">
            <h1 className="max-w-[18ch] font-[Newsreader] text-[1.95rem] italic leading-[1.06] tracking-tight text-[#420409] lg:text-[2.25rem]">
              {title}
            </h1>
            <p className="max-w-[40ch] font-[Noto_Serif] text-[13px] italic leading-6 text-[#6d5d58]">
              {subtitle}
            </p>
          </div>

          <div className="mb-5 h-px w-full bg-gradient-to-r from-transparent via-[#b98f57] to-transparent" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isLogin ? (
              <div className="space-y-2">
                <label className="font-[Work_Sans] text-[10px] uppercase tracking-[0.28em] text-[#420409]">Email</label>
                <input
                  {...register("email", {
                    required: "Vui lòng nhập email.",
                    pattern: {
                      value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                      message: "Email không hợp lệ.",
                    },
                  })}
                  type="email"
                  placeholder="ban@example.com"
                  className="w-full border-0 border-b border-[#d9cdbf] bg-transparent px-0 py-2.5 font-[Noto_Serif] text-[16px] text-[#2a211e] placeholder:text-[#b3a59a] placeholder:italic focus:border-[#775a19] focus:ring-0"
                />
                {errors.email ? <p className="text-sm text-[#9c3022]">{errors.email.message}</p> : null}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 md:gap-5">
                <div className="space-y-2">
                  <label className="font-[Work_Sans] text-[10px] uppercase tracking-[0.28em] text-[#420409]">Họ và tên</label>
                  <input
                    {...register("fullName", { required: "Vui lòng nhập họ và tên." })}
                    type="text"
                    placeholder="Ví dụ: Nguyễn Minh Anh"
                    className="w-full border-0 border-b border-[#d9cdbf] bg-transparent px-0 py-2.5 font-[Noto_Serif] text-[16px] text-[#2a211e] placeholder:text-[#b3a59a] placeholder:italic focus:border-[#775a19] focus:ring-0"
                  />
                  {errors.fullName ? <p className="text-sm text-[#9c3022]">{errors.fullName.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className="font-[Work_Sans] text-[10px] uppercase tracking-[0.28em] text-[#420409]">Email</label>
                  <input
                    {...register("email", {
                      required: "Vui lòng nhập email.",
                      pattern: {
                        value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                        message: "Email không hợp lệ.",
                      },
                    })}
                    type="email"
                    placeholder="ban@example.com"
                    className="w-full border-0 border-b border-[#d9cdbf] bg-transparent px-0 py-2.5 font-[Noto_Serif] text-[16px] text-[#2a211e] placeholder:text-[#b3a59a] placeholder:italic focus:border-[#775a19] focus:ring-0"
                  />
                  {errors.email ? <p className="text-sm text-[#9c3022]">{errors.email.message}</p> : null}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="font-[Work_Sans] text-[10px] uppercase tracking-[0.28em] text-[#420409]">Mật khẩu</label>
              <div className="flex items-center border-b border-[#d9cdbf]">
                <input
                  {...register("password", {
                    required: "Vui lòng nhập mật khẩu.",
                    minLength: {
                      value: 6,
                      message: "Mật khẩu cần ít nhất 6 ký tự.",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  placeholder={isLogin ? "Nhập mật khẩu của bạn" : "Tạo mật khẩu an toàn"}
                  className="w-full border-0 bg-transparent px-0 py-2.5 font-[Noto_Serif] text-[16px] text-[#2a211e] placeholder:text-[#b3a59a] placeholder:italic focus:ring-0"
                />
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="pb-1 text-[#7e6b62] transition hover:text-[#420409]">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password ? <p className="text-sm text-[#9c3022]">{errors.password.message}</p> : null}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative mt-2 w-full bg-[#420409] px-6 py-2.5 font-[Work_Sans] text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-[#5f1a1c] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="relative z-10">
                {isSubmitting ? (isLogin ? "Đang đăng nhập..." : "Đang tạo tài khoản...") : isLogin ? "Tiếp tục vào kho sách" : "Khởi tạo hồ sơ"}
              </span>
              <span className="absolute inset-0 translate-x-1 translate-y-1 border border-[#d1a45c] opacity-0 transition group-hover:opacity-100" />
            </button>

            <div className="relative py-2">
              <div className="h-px w-full bg-[#e6dccf]" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fffdf8] px-4 font-[Work_Sans] text-[10px] uppercase tracking-[0.24em] text-[#8e7c76]">Hoặc</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full border border-[#d7c8b5] bg-white px-6 py-2.5 font-[Work_Sans] text-[11px] font-semibold uppercase tracking-[0.22em] text-[#420409] transition hover:border-[#b98f57] hover:bg-[#fff7ec] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isGoogleLoading ? "Đang kết nối Google..." : "Tiếp tục với Google"}
            </button>
          </form>
        </div>

        <footer className="mt-6 flex items-center justify-between gap-4 border-t border-[#eee2d5] pt-4">
          <Link to="/" className="font-[Work_Sans] text-[10px] uppercase tracking-[0.25em] text-[#775a19] transition hover:text-[#420409]">
            Quay về trang chủ
          </Link>
          <p className="text-right font-[Noto_Serif] text-sm italic text-[#6d5d58]">
            {switchCopy.prompt}{" "}
            <Link to={switchCopy.to} className="font-[Work_Sans] text-[11px] uppercase tracking-[0.2em] text-[#420409]">
              {switchCopy.cta}
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function AuthPortal({ mode = "login" }) {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const { registerUser, loginUser, signInWithGoogle, updateUserProfile, completeFirebaseAuth } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const title = isLogin ? "Đăng nhập tài khoản" : "Tạo tài khoản mới";
  const subtitle = isLogin
    ? "Tiếp tục hành trình đọc, quản lý đơn hàng và lưu lại những đầu sách bạn yêu thích."
    : "Khởi tạo hồ sơ để lưu wishlist, theo dõi đơn hàng và nhận gợi ý sách phù hợp hơn.";

  const switchCopy = isLogin
    ? { prompt: "Chưa có tài khoản?", cta: "Đăng ký ngay", to: "/register" }
    : { prompt: "Đã có tài khoản?", cta: "Đăng nhập", to: "/login" };

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      if (isLogin) {
        const result = await loginUser(values.email, values.password);
        await completeFirebaseAuth(result.user);
        toast.success("Đăng nhập thành công");
        navigate("/");
      } else {
        const result = await registerUser(values.email, values.password);
        await updateUserProfile(values.fullName, result.user.photoURL || null);
        await completeFirebaseAuth(result.user, { fullName: values.fullName });
        toast.success("Đăng ký thành công");
        navigate("/profile");
      }
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email này đã được đăng ký.");
      } else if (error.code === "auth/user-not-found") {
        toast.error("Email chưa được đăng ký.");
      } else if (error.code === "auth/wrong-password") {
        toast.error("Mật khẩu không đúng.");
      } else if (error.code === "auth/invalid-credential" || error.code === "auth/invalid-login-credentials") {
        toast.error("Email hoặc mật khẩu không đúng.");
      } else if (error.code === "auth/weak-password") {
        toast.error("Mật khẩu còn quá yếu.");
      } else {
        toast.error(error.message || "Không thể hoàn tất xác thực lúc này.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      await completeFirebaseAuth(result.user);
      toast.success("Xác thực Google thành công");
      navigate(isLogin ? "/" : "/profile");
    } catch (error) {
      toast.error(error.message || "Không thể đăng nhập với Google.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <section className="relative isolate min-h-[calc(100vh-10rem)] overflow-hidden bg-white px-4 py-8 sm:px-6 lg:px-10">
      <FloatingMotes />

      <div className="mx-auto flex max-w-7xl items-center justify-center">
        <div className="w-full max-w-[900px] border border-[#e6d9ca] bg-[#fffdf8] shadow-[0_28px_60px_rgba(47,24,18,0.12)]">
          <div className="grid min-h-[470px] grid-cols-1 items-stretch md:grid-cols-[0.94fr_1.06fr]">
            {isLogin ? (
              <>
                <motion.div
                  key="form-login"
                  className="h-full"
                  initial={{ x: -80, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                >
                  <AuthFormPanel
                    isLogin={isLogin}
                    title={title}
                    subtitle={subtitle}
                    switchCopy={switchCopy}
                    register={register}
                    handleSubmit={handleSubmit}
                    errors={errors}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    isSubmitting={isSubmitting}
                    isGoogleLoading={isGoogleLoading}
                    onSubmit={onSubmit}
                    handleGoogleSignIn={handleGoogleSignIn}
                  />
                </motion.div>
                <motion.div
                  key="art-login"
                  className="hidden h-full md:block"
                  initial={{ x: 80, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ArtworkPanel mode={mode} />
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  key="art-register"
                  className="hidden h-full md:block"
                  initial={{ x: -80, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ArtworkPanel mode={mode} />
                </motion.div>
                <motion.div
                  key="form-register"
                  className="h-full"
                  initial={{ x: 80, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                >
                  <AuthFormPanel
                    isLogin={isLogin}
                    title={title}
                    subtitle={subtitle}
                    switchCopy={switchCopy}
                    register={register}
                    handleSubmit={handleSubmit}
                    errors={errors}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    isSubmitting={isSubmitting}
                    isGoogleLoading={isGoogleLoading}
                    onSubmit={onSubmit}
                    handleGoogleSignIn={handleGoogleSignIn}
                  />
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
