// pages/PostJob.jsx — customer posts a new detail request.

import { useNavigate } from 'react-router-dom';
import JobForm from '../components/JobForm.jsx';
import * as jobService from '../services/jobService.js';

function PostJob() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    await jobService.createJob(data);
    navigate('/customer/jobs');
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-white">Post a detail request</h1>
      <p className="mb-8 text-zinc-400">Tell detailers what you need — the more detail, the better the match.</p>
      <JobForm onSubmit={handleSubmit} />
    </main>
  );
}

export default PostJob;
