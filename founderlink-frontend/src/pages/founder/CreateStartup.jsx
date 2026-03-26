import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Rocket } from 'lucide-react';
import Layout from '../../components/Layout';
import { createStartup } from '../../api/startupApi';

const CreateStartup = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await createStartup({ ...data, fundingGoal: parseFloat(data.fundingGoal) });
      toast.success('Startup created successfully!');
      navigate('/founder/startups');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create startup');
    }
  };

  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5';
  const errorClass = 'text-red-400 text-xs mt-1';

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Rocket size={22} className="text-accent-light" /> Create New Startup
          </h1>
          <p className="text-gray-400 text-sm mt-1">Fill in the details below to submit your startup for review</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Startup Name</label>
                <input className="input-field" placeholder="e.g. GreenTech" {...register('name', { required: 'Required' })} />
                {errors.name && <p className={errorClass}>{errors.name.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Industry</label>
                <input className="input-field" placeholder="e.g. CleanTech" {...register('industry', { required: 'Required' })} />
                {errors.industry && <p className={errorClass}>{errors.industry.message}</p>}
              </div>
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                rows={3}
                className="input-field"
                placeholder="Describe your startup in a few sentences..."
                {...register('description', { required: 'Required' })}
              />
              {errors.description && <p className={errorClass}>{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Problem Statement</label>
                <textarea
                  rows={3}
                  className="input-field"
                  placeholder="What problem are you solving?"
                  {...register('problemStatement', { required: 'Required' })}
                />
                {errors.problemStatement && <p className={errorClass}>{errors.problemStatement.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Your Solution</label>
                <textarea
                  rows={3}
                  className="input-field"
                  placeholder="How do you solve it?"
                  {...register('solution', { required: 'Required' })}
                />
                {errors.solution && <p className={errorClass}>{errors.solution.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Funding Goal ($)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="500000"
                  {...register('fundingGoal', { required: 'Required', min: 1 })}
                />
                {errors.fundingGoal && <p className={errorClass}>{errors.fundingGoal.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Stage</label>
                <select className="input-field" {...register('stage', { required: 'Required' })}>
                  <option value="">Select stage</option>
                  <option value="IDEA">Idea</option>
                  <option value="MVP">MVP</option>
                  <option value="EARLY_TRACTION">Early Traction</option>
                  <option value="SCALING">Scaling</option>
                </select>
                {errors.stage && <p className={errorClass}>{errors.stage.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <input className="input-field" placeholder="e.g. Berlin" {...register('location')} />
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-dark-500">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Creating...' : 'Create Startup'}
              </button>
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateStartup;
