import { useCallback, useEffect, useState } from "react";
import api, { messageFrom } from "../services/api";

const blank = { name: "", slug: "", description: "" };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api
      .get("/categories")
      .then((r) => setCategories(r.data.data))
      .catch((reason) => setError(messageFrom(reason)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(event) {
    event.preventDefault();
    try {
      await api.post("/admin/categories", form);
      setForm(blank);
      load();
    } catch (reason) {
      setError(messageFrom(reason));
    }
  }

  async function remove(category) {
    if (!window.confirm(`Delete ${category.name}?`)) return;
    try {
      await api.delete(`/admin/categories/${category.id}`);
      load();
    } catch (reason) {
      setError(messageFrom(reason));
    }
  }

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">Categories</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <form className="card space-y-3" onSubmit={submit}>
          <h2 className="text-lg font-semibold">Add category</h2>
          <label className="label">
            Name
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value,
                  slug:
                    form.slug ||
                    event.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, ""),
                })
              }
            />
          </label>
          <label className="label">
            Slug
            <input
              required
              value={form.slug}
              onChange={(event) =>
                setForm({ ...form, slug: event.target.value })
              }
            />
          </label>
          <label className="label">
            Description
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="button">Add category</button>
        </form>

        <div className="card">
          <h2 className="mb-3 text-lg font-semibold">Existing categories</h2>
          {categories.map((category) => (
            <div
              className="flex items-center justify-between border-b py-3"
              key={category.id}
            >
              <div>
                <p className="font-medium">{category.name}</p>
                <p className="text-sm text-slate-500">{category.slug}</p>
              </div>
              <button className="text-red-600" onClick={() => remove(category)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
