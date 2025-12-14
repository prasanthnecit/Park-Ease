router.get("/advanced-events", getAdvancedEvents);
const { createEvent, getEvents, updateEvent, deleteEvent, getAdvancedEvents } = require("../controllers/eventController");