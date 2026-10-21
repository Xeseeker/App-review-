const { z } = require('zod');
module.exports = { eventInput: z.object({ event_type: z.enum(['search', 'detail_view', 'play_store_click']) }) };
