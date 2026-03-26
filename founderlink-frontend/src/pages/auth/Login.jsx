import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';
import { setCredentials } from '../../store/slices/authSlice';
import { login } from '../../api/authApi';

const Login = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await login(data);
      const { token, userId, role, email } = res.data.data;
      dispatch(setCredentials({ token, userId, role, email }));
      toast.success('Welcome back!');
      if (role === 'ROLE_FOUNDER') navigate('/founder/dashboard');
      else if (role === 'ROLE_INVESTOR') navigate('/investor/dashboard');
      else if (role === 'ROLE_COFOUNDER') navigate('/cofounder/dashboard');
      else if (role === 'ROLE_ADMIN') navigate('/admin/dashboard');
      else navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex">

      {/* ─── LEFT PANEL — image background, no haze ─── */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 sticky top-0 h-screen overflow-hidden relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        {/* Dark overlay — clean, sharp */}
        <div className="absolute inset-0 bg-dark-900/75" />
        {/* Subtle bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-dark-900/50 to-transparent" />

        {/* Logo */}
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/40">
              <span className="text-white font-bold text-sm">FL</span>
            </div>
            <span className="text-xl font-bold text-white">FounderLink</span>
          </div>
        </div>

        {/* Middle content */}
        <div className="relative z-10 px-10 pb-4">
          <h2 className="text-4xl font-bold text-white leading-snug mb-4">
            Connect with the<br />
            right people to<br />
            <span className="text-accent-light">build your vision</span>
          </h2>
          <p className="text-white/60 text-base mb-8 leading-relaxed">
            Join founders, investors, and co-founders on one platform.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Founders',     value: '2,400+' },
              { label: 'Investors',    value: '800+' },
              { label: 'Deals Closed', value: '340+' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/8 border border-white/12 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-xl font-bold text-accent-light">{stat.value}</p>
                <p className="text-white/50 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 mx-10 mb-10 bg-white/8 border border-white/12 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-white/85 text-sm font-medium leading-relaxed">
            "FounderLink helped me find the perfect investor match in under 2 weeks."
          </p>
          <p className="text-white/45 text-xs mt-2">— Priya Sharma, Founder at NexaBot</p>
        </div>

        {/* Footer */}
        <p className="relative z-10 px-10 pb-6 text-white/30 text-xs">© 2025 FounderLink. All rights reserved.</p>
      </div>

      {/* ─── RIGHT PANEL — vertically centered ─── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-dark-900">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10 justify-center">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-white font-bold text-xs">FL</span>
            </div>
            <span className="text-xl font-bold text-white">FounderLink</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-1.5">Welcome back</h1>
          <p className="text-gray-400 text-sm mb-8">Enter your credentials to access your account.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Signing in...' : <><span>Sign In</span> <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent-light font-medium hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Login;
