import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { messageFrom } from "../services/api";

export default function ManageApps() {
  const [apps, setApps] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api
      .get("/admin/apps", { params: { search } })
      .then((response) => setApps(response.data.data))
      .catch((reason) => setError(messageFrom(reason)));
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(app) {
    try {
      await api.patch(`/admin/apps/${app.id}/status`, {
        status: app.status === "published" ? "unpublished" : "published",
      });
      load();
    } catch (reason) {
      setError(messageFrom(reason));
    }
  }

  async function remove(app) {
    if (!window.confirm(`Delete ${app.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/apps/${app.id}`);
      load();
    } catch (reason) {
      setError(messageFrom(reason));
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      published: "bg-green-100 text-green-700",
      draft: "bg-yellow-100 text-yellow-700",
      unpublished: "bg-slate-100 text-slate-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-slate-900">Manage apps</h1>
        <Link className="button" to="/apps/new">
          Add app
        </Link>
      </div>
      <div className="card">
        <div className="mb-4 flex gap-2">
          <input
            value={search}
            placeholder="Search by app name"
            onChange={(event) => setSearch(event.target.value)}
            className="flex-1"
          />
          <button className="button-secondary" onClick={load}>
            Search
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="p-3 text-sm font-semibold text-slate-700">App</th>
                <th className="p-3 text-sm font-semibold text-slate-700">Code</th>
                <th className="p-3 text-sm font-semibold text-slate-700">Category</th>
                <th className="p-3 text-sm font-semibold text-slate-700">Status</th>
                <th className="p-3 text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr className="border-b border-slate-100 hover:bg-slate-50" key={app.id}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {app.poster_url ? (
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={app.poster_url}
                          alt=""
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-slate-100" />
                      )}
                      <span className="font-medium text-slate-900">{app.name}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-sm text-slate-600">{app.search_code}</td>
                  <td className="p-3 text-sm text-slate-600">{app.categories?.name || "—"}</td>
                  <td className="p-3">{getStatusBadge(app.status)}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Link className="text-sm font-medium text-brand hover:text-indigo-700" to={`/apps/${app.id}`}>
                        Edit
                      </Link>
                      <button
                        className="text-sm font-medium text-brand hover:text-indigo-700"
                        onClick={() => changeStatus(app)}
                      >
                        {app.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                        onClick={() => remove(app)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!apps.length && (
          <p className="p-8 text-center text-slate-500">No apps match your search.</p>
        )}
      </div>
    </>
  );
}
