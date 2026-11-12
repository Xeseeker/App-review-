import { useEffect, useState } from 'react';
import api, { messageFrom } from '../services/api';

const labels = [
  ['total_apps', 'Total listings'],
  ['published_apps', 'Published'],
  ['draft_apps', 'Drafts'],
  ['searches', 'Searches'],
  ['play_store_clicks', 'Play Store clicks']
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((response) => setData(response.data.data))
      .catch((reason) => setError(messageFrom(reason)));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="text-slate-500">Loading dashboard…</p>;

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {labels.map(([key, label]) => (
          <div className="card hover:shadow-md transition-shadow" key={key}>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{data[key]}</p>
          </div>
        ))}
      </div>
      <section className="card mt-6">
        <h2 className="text-lg font-semibold text-slate-900">Most viewed listings</h2>
        {data.popular_apps.length ? (
          <div className="mt-4 space-y-3">
            {data.popular_apps.map((app) => (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg" key={app.id}>
                <div className="flex items-center gap-3">
                  {app.poster_url && (
                    <img
                      className="h-10 w-10 rounded-lg object-cover"
                      src={app.poster_url}
                      alt=""
                    />
                  )}
                  <span className="font-medium text-slate-900">{app.name}</span>
                  <span className="text-slate-500">({app.search_code})</span>
                </div>
                <strong className="text-brand">{app.detail_views} views</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-slate-500">No detail views have been recorded yet.</p>
        )}
      </section>
    </>
  );
}
