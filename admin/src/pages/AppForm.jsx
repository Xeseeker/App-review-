import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { messageFrom } from "../services/api";
const blank = {
  name: "",
  search_code: "",
  short_description: "",
  description: "",
  developer_name: "",
  category_id: "",
  play_store_url: "",
  status: "published",
  featured: false,
};
export default function AppForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(blank);
  const [categories, setCategories] = useState([]);
  const [poster, setPoster] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data.data));
    if (id)
      api
        .get(`/admin/apps/${id}`)
        .then((r) =>
          setForm({
            ...r.data.data,
            category_id: r.data.data.category_id || "",
          }),
        )
        .catch((reason) => setError(messageFrom(reason)));
  }, [id]);
  function update(key, value) {
    setForm({ ...form, [key]: value });
  }
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        category_id: form.category_id ? Number(form.category_id) : null,
        search_code: form.search_code.toUpperCase().trim(),
      };
      const response = id
        ? await api.put(`/admin/apps/${id}`, payload)
        : await api.post("/admin/apps", payload);
      const app = response.data.data;
      if (poster) {
        const upload = new FormData();
        upload.append("poster", poster);
        await api.post(`/admin/apps/${app.id}/poster`, upload);
      }
      navigate("/apps");
    } catch (reason) {
      setError(messageFrom(reason));
      setSaving(false);
    }
  }
  const field = (key, label, type = "text", required = false) => (
    <label className="label">
      {label}
      <input
        type={type}
        required={required}
        value={form[key] || ""}
        onChange={(event) => update(key, event.target.value)}
      />
    </label>
  );
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">
        {id ? "Edit app" : "Create app"}
      </h1>
      <form className="card max-w-3xl space-y-4" onSubmit={submit}>
        <div className="grid gap-4 md:grid-cols-2">
          {field("name", "App name", "text", true)}
          {field("search_code", "Unique search code", "text", true)}
        </div>
        {field("short_description", "Short description")}
        <label className="label">
          Full description
          <textarea
            required
            rows="6"
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          {field("developer_name", "Developer name")}
          <label className="label">
            Category
            <select
              value={form.category_id}
              onChange={(event) => update("category_id", event.target.value)}
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option value={category.id} key={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {field("play_store_url", "Official Google Play URL", "url", true)}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="label">
            Status
            <select
              value={form.status}
              onChange={(event) => update("status", event.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </label>
          <label className="label">
            Poster (JPEG, PNG, WebP; 5 MB max)
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => setPoster(event.target.files?.[0] || null)}
            />
          </label>
        </div>
        <label className="flex items-center gap-2">
          <input
            className="h-4 w-4"
            type="checkbox"
            checked={form.featured}
            onChange={(event) => update("featured", event.target.checked)}
          />{" "}
          Feature on mobile home
        </label>
        {error && <p className="error">{error}</p>}
        <button className="button" disabled={saving}>
          {saving ? "Saving…" : "Save app"}
        </button>
      </form>
    </>
  );
}
