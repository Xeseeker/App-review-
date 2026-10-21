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

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Manage apps</h1>
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
          />
          <button className="button-secondary" onClick={load}>
            Search
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b">
              <tr>
                <th className="p-2">App</th>
                <th className="p-2">Code</th>
                <th className="p-2">Category</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr className="border-b" key={app.id}>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      {app.poster_url && (
                        <img
                          className="h-9 w-9 rounded object-cover"
                          src={app.poster_url}
                          alt=""
                        />
                      )}
                      {app.name}
                    </div>
                  </td>
                  <td className="p-2 font-mono">{app.search_code}</td>
                  <td className="p-2">{app.categories?.name || "—"}</td>
                  <td className="p-2 capitalize">{app.status}</td>
                  <td className="space-x-2 p-2">
                    <Link className="text-brand" to={`/apps/${app.id}`}>
                      Edit
                    </Link>
                    <button
                      className="text-brand"
                      onClick={() => changeStatus(app)}
                    >
                      {app.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => remove(app)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!apps.length && (
          <p className="p-4 text-slate-500">No apps match your search.</p>
        )}
      </div>
    </>
  );
}
