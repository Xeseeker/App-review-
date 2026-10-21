const publicAppFields = 'id,name,search_code,description,short_description,poster_url,play_store_url,developer_name,featured,created_at,updated_at,categories(id,name,slug)';
const adminAppFields = `${publicAppFields},status,category_id,created_by`;

module.exports = { publicAppFields, adminAppFields };
