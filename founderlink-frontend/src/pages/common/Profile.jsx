import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { User, Mail, Shield } from 'lucide-react';
import Layout from '../../components/Layout';
import useAuth from '../../hooks/useAuth';
import { getMyProfile, updateProfile } from '../../api/userApi';

const Profile = () => {
  const { user, userId } = useAuth();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    if (userId) {
      getMyProfile(userId)
        .then(res => reset(res.data))
        .catch(() => {});
    }
  }, [userId, reset]);

  const onSubmit = async (data) => {
    try {
      await updateProfile(userId, { ...data, email: user?.email });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const roleLabel = user?.role?.replace('ROLE_', '') || 'User';
  const initial = user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User size={22} className="text-accent-light" /> My Profile
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage your public profile information</p>
        </div>

        <div className="card">
          {/* Avatar & info */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-dark-500">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-accent/20">
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Mail size={14} className="text-gray-500" />
                <p className="text-gray-200 font-medium">{user?.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-gray-500" />
                <span className="badge-blue">{roleLabel}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
              <input className="input-field" placeholder="Your full name" {...register('name')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Bio</label>
              <textarea
                rows={3}
                className="input-field"
                placeholder="Tell us about yourself..."
                {...register('bio')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Skills</label>
              <input
                className="input-field"
                placeholder="e.g. React, Java, Product Management"
                {...register('skills')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Experience</label>
              <textarea
                rows={2}
                className="input-field"
                placeholder="Your professional experience..."
                {...register('experience')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Portfolio / Links</label>
              <input
                className="input-field"
                placeholder="https://github.com/yourname"
                {...register('portfolioLinks')}
              />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
