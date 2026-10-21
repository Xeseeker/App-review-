const { supabase } = require('../config/supabase');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const recordEvent = asyncHandler(async (request, response) => {
  const { data: app, error: appError } = await supabase.from('apps').select('id').eq('id', request.params.id).eq('status', 'published').maybeSingle();
  if (appError) throw appError;
  if (!app) throw new AppError(404, 'App not found.');
  const { error } = await supabase.from('app_events').insert({ app_id: app.id, event_type: request.body.event_type });
  if (error) throw error;
  response.status(201).json({ data: { recorded: true } });
});

const dashboard = asyncHandler(async (request, response) => {
  const [appsResult, publishedResult, draftResult, searchResult, clicksResult, viewsResult] = await Promise.all([
    supabase.from('apps').select('*', { count: 'exact', head: true }),
    supabase.from('apps').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('apps').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('app_events').select('*', { count: 'exact', head: true }).eq('event_type', 'search'),
    supabase.from('app_events').select('*', { count: 'exact', head: true }).eq('event_type', 'play_store_click'),
    supabase.from('app_events').select('app_id', { count: 'exact' }).eq('event_type', 'detail_view').not('app_id', 'is', null)
  ]);
  for (const result of [appsResult, publishedResult, draftResult, searchResult, clicksResult, viewsResult]) if (result.error) throw result.error;
  const viewCounts = (viewsResult.data || []).reduce((counts, event) => ({ ...counts, [event.app_id]: (counts[event.app_id] || 0) + 1 }), {});
  const ids = Object.entries(viewCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id);
  let popularApps = [];
  if (ids.length) {
    const { data, error } = await supabase.from('apps').select('id,name,search_code,poster_url').in('id', ids);
    if (error) throw error;
    popularApps = ids.map((id) => ({ ...data.find((app) => app.id === id), detail_views: viewCounts[id] }));
  }
  response.json({ data: { total_apps: appsResult.count || 0, published_apps: publishedResult.count || 0, draft_apps: draftResult.count || 0, searches: searchResult.count || 0, play_store_clicks: clicksResult.count || 0, popular_apps: popularApps } });
});

const analytics = asyncHandler(async (request, response) => {
  const from = request.query.from || new Date(Date.now() - 30 * 86400000).toISOString();
  const to = request.query.to || new Date().toISOString();
  const { data, error } = await supabase.from('app_events').select('id,app_id,event_type,created_at,apps(name,search_code)').gte('created_at', from).lte('created_at', to).order('created_at');
  if (error) throw error;
  const totals = { search: 0, detail_view: 0, play_store_click: 0 };
  const daily = {};
  (data || []).forEach((event) => {
    totals[event.event_type] += 1;
    const day = event.created_at.slice(0, 10);
    daily[day] ||= { date: day, search: 0, detail_view: 0, play_store_click: 0 };
    daily[day][event.event_type] += 1;
  });
  response.json({ data: { totals, daily: Object.values(daily), events: data || [] } });
});

module.exports = { recordEvent, dashboard, analytics };
