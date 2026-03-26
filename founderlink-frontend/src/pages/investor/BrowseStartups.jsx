import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';
import StartupCard from '../../components/StartupCard';
import { getAllStartups } from '../../api/startupApi';

const STAGES = ['All', 'IDEA', 'MVP', 'EARLY_TRACTION', 'SCALING'];

const BrowseStartups = () => {
  const [startups, setStartups] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('All');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllStartups(0, 50)
      .then((res) => {
        const data = res.data?.content || [];
        setStartups(data);
        setFiltered(data);
      })
      .catch(() => toast.error('Failed to load startups'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = startups;
    if (search) {
      result = result.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.industry.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (stage !== 'All') {
      result = result.filter(s => s.stage === stage);
    }
    if (location) {
      result = result.filter(s => s.location?.toLowerCase().includes(location.toLowerCase()));
    }
    setFiltered(result);
  }, [search, stage, location, startups]);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Browse Startups</h1>
          <p className="text-gray-400 text-sm mt-1">
            {filtered.length} startup{filtered.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Search & filter bar */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={17} />
              <input
                className="input-field pl-10"
                placeholder="Search by name or industry..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={17} />
              <input
                className="input-field pl-10"
                placeholder="Filter by location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {STAGES.map((s) => (
              <button
                key={s}
                onClick={() => setStage(s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  stage === s
                    ? 'bg-accent text-white'
                    : 'bg-dark-700 text-gray-400 hover:text-gray-200 border border-dark-400'
                }`}
              >
                {s === 'EARLY_TRACTION' ? 'Early Traction' : s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-40 bg-dark-800 rounded-xl animate-pulse border border-dark-500" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-14">
            <Search size={36} className="mx-auto text-gray-600 mb-3" />
            <p className="text-gray-300 font-medium">No startups found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((s) => <StartupCard key={s.id} startup={s} />)}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BrowseStartups;
