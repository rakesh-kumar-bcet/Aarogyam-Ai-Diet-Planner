const DEFAULT_REMOTE_API = "https://aarogyam-ai-diet-planner.onrender.com";
const LOCAL_DEV_API = "http://localhost:5003";

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (isLocalhost ? LOCAL_DEV_API : DEFAULT_REMOTE_API);

const WS_BASE_URL = API_BASE_URL.replace(/^http/, "ws");

export default API_BASE_URL;
export { WS_BASE_URL };