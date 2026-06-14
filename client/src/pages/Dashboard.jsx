import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLastPlan } from "../Services/dietService";
import { fetchContactHistory, resolveContactRequest, sendContactMessage } from "../Services/contactService";
import { submitFeedback } from "../Services/feedbackService";
import { connectSocket, subscribe } from "../Services/socketService";
import { logoutUser } from "../Services/authService";
import QuickStatsCard from "../components/QuickStatsCard";
import {
  FaBell,
  FaCalendarAlt,
  FaChartLine,
  FaBookOpen,
  FaCheckCircle,
  FaFire,
  FaHeart,
  FaLeaf,
  FaPaperPlane,
  FaArrowUp,
  FaWeight,
} from "react-icons/fa";
import profile from "../assets/profile.png";
import "./dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [lastPlan, setLastPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [contactHistory, setContactHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const [messageText, setMessageText] = useState({});
  const [messageSending, setMessageSending] = useState({});
  const [ratingPayload, setRatingPayload] = useState({});
  const [ratingStatus, setRatingStatus] = useState({});
  const [resolveMessage, setResolveMessage] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const userName =
    localStorage.getItem("userName") ||
    localStorage.getItem("name") ||
    "User";

  const activePlanCount = lastPlan ? 1 : 0;
  const caloriesToday = lastPlan?.dailyCalories || 0;
  const planProgress = lastPlan ? 62 : 0;
  const storedWeight = localStorage.getItem("weight") || localStorage.getItem("userWeight");
  const weightProvided = localStorage.getItem("weightProvided") === "true";
  // Only accept a sensible numeric weight that was explicitly provided by the user; otherwise show NA.
  let userWeight = "NA";
  if (weightProvided && storedWeight !== null && storedWeight !== undefined && storedWeight !== "") {
    const parsed = Number(storedWeight);
    if (!Number.isNaN(parsed) && parsed > 0 && parsed < 500) {
      userWeight = parsed;
    } else {
      // clear invalid stored values and flag
      localStorage.removeItem("weight");
      localStorage.removeItem("weightProvided");
    }
  }

  useEffect(() => {
    const userName = localStorage.getItem("userName");
    if (showWelcome && userName) {
      const welcomed = sessionStorage.getItem("welcomeShown");
      if (!welcomed) {
        setTimeout(() => {
          alert(`Welcome ${userName}! 👋 Ready to reach your wellness goals?`);
          sessionStorage.setItem("welcomeShown", "true");
        }, 500);
      }
    }
  }, [showWelcome]);

  const loadContactHistory = async () => {
    try {
      const res = await fetchContactHistory();
      setContactHistory(res.data || []);
    } catch (err) {
      console.error("Failed to load contact history:", err);
      setHistoryError("Unable to load your nutritionist contact history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    const loadLastPlan = async () => {
      try {
        const plan = await getLastPlan();
        if (plan && !plan.message) {
          setLastPlan(plan);
        }
      } catch (err) {
        console.error("Failed to load last plan:", err);
        setError(err.message || "Unable to load your most recent plan.");
      } finally {
        setLoading(false);
      }
    };

    loadLastPlan();
    loadContactHistory();

    const socket = connectSocket();
    const handleSocketEvent = (event) => {
      if (!event || !event.type) return;
      if (event.type === 'notification' || event.type === 'contact_response' || event.type === 'chat_message') {
        loadContactHistory();
      }
    };

    const removeNotification = subscribe('notification', handleSocketEvent);
    const removeResponse = subscribe('contact_response', handleSocketEvent);
    const removeChat = subscribe('chat_message', handleSocketEvent);

    return () => {
      removeNotification();
      removeResponse();
      removeChat();
    };
  }, []);

  const handleResolve = async (requestId) => {
    try {
      const res = await resolveContactRequest(requestId);
      const updated = res.data.request;
      setContactHistory((prev) =>
        prev.map((item) => (item._id === requestId ? updated : item)),
      );
      setResolveMessage("Conversation closed. You can now leave a rating and review.");
    } catch (err) {
      console.error("Failed to resolve contact request:", err);
      setResolveMessage("Unable to close this conversation at the moment.");
    }
  };

  const handleSendMessage = async (requestId) => {
    const text = messageText[requestId]?.trim();
    if (!text) return;

    setMessageSending((prev) => ({
      ...prev,
      [requestId]: true,
    }));

    try {
      const res = await sendContactMessage(requestId, text);
      const updated = res.data.request;
      setContactHistory((prev) =>
        prev.map((item) => (item._id === requestId ? updated : item)),
      );
      setMessageText((prev) => ({
        ...prev,
        [requestId]: "",
      }));
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setMessageSending((prev) => ({
        ...prev,
        [requestId]: false,
      }));
    }
  };

  const handleRatingChange = (requestId, field, value) => {
    setRatingPayload((prev) => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        [field]: value,
      },
    }));
  };

  const handleSubmitRating = async (request) => {
    const payload = ratingPayload[request._id] || {};
    const rating = Number(payload.rating);
    const comment = payload.comment || "";

    if (!rating || rating < 1) {
      setRatingStatus((prev) => ({
        ...prev,
        [request._id]: "Please choose a rating before submitting.",
      }));
      return;
    }

    try {
      const nutritionistId = request.nutritionistId._id || request.nutritionistId;
      await submitFeedback(nutritionistId, rating, comment);
      setRatingStatus((prev) => ({
        ...prev,
        [request._id]: "Thank you! Your review has been submitted.",
      }));
      setRatingPayload((prev) => ({
        ...prev,
        [request._id]: { rating: 0, comment: "" },
      }));
    } catch (err) {
      console.error("Submit rating error:", err);
      setRatingStatus((prev) => ({
        ...prev,
        [request._id]: "Unable to submit review, please try again.",
      }));
    }
  };

  return (
    <div className="dashboard-page min-h-screen overflow-hidden bg-[#f5fcf5] text-slate-900">
      <div className="dashboard-decorations" aria-hidden="true">
        <span className="dashboard-circle circle-1" />
        <span className="dashboard-circle circle-2" />
        <span className="dashboard-circle circle-3" />
        <span className="dashboard-wave" />
        <span className="dashboard-grid-dot dot-1" />
        <span className="dashboard-grid-dot dot-2" />
        <span className="dashboard-network network-1" />
        <span className="dashboard-network network-2" />
        <span className="dashboard-float-icon icon-salad">🥗</span>
        <span className="dashboard-float-icon icon-apple">🍎</span>
        <span className="dashboard-float-icon icon-progress">📈</span>
        <span className="dashboard-float-icon icon-heartbeat">❤️</span>
        <span className="dashboard-float-icon icon-ai">🤖</span>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="hero-grid grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-center">
          <div className="space-y-6 animate-fade-in">
            <span className="inline-flex items-center rounded-full bg-emerald-100/90 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
              AI Nutrition Assistant
            </span>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Welcome back, {userName} <span>👋</span>
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Plan smarter, eat better, and achieve your health goals with personalized nutrition.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <button onClick={() => navigate("/generate-plan")} className="dashboard-primary-btn">
                Generate Plan
              </button>
              <button onClick={() => navigate("/my-plans")} className="dashboard-secondary-btn">
                View History
              </button>
            </div>
          </div>

          <div className="relative animate-fade-in">
            <div className="hero-profile-card relative overflow-visible rounded-full bg-transparent p-0 shadow-none border-0 mt-6">
              <span className="hero-profile-icon hero-frame-icon-salad">🥗</span>
              <span className="hero-profile-icon hero-frame-icon-apple">🍎</span>
              <span className="hero-profile-icon hero-frame-icon-progress">📈</span>
              <span className="hero-profile-icon hero-frame-icon-heartbeat">❤️</span>
              <span className="hero-profile-icon hero-frame-icon-ai">🤖</span>
              <div className="relative z-10 flex justify-center">
                <img src={profile} alt="Eating healthy" className="hero-profile-image rounded-full border-8 border-white shadow-2xl" />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Statistics Cards</h2>
              <p className="mt-2 text-sm text-slate-500">A quick overview of your active plan, calories, progress, and weight.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <QuickStatsCard
              icon={FaCalendarAlt}
              label="Active Plan"
              value={activePlanCount}
              unit=""
              color="bg-emerald-500"
              bgColor="bg-emerald-50"
            />
            <QuickStatsCard
              icon={FaFire}
              label="Calories Today"
              value={caloriesToday}
              unit="kcal"
              color="bg-orange-500"
              bgColor="bg-orange-50"
            />
            <QuickStatsCard
              icon={FaArrowUp}
              label="Progress"
              value={planProgress}
              unit="%"
              color="bg-sky-500"
              bgColor="bg-sky-50"
              percentage={planProgress}
            />
            <QuickStatsCard
              icon={FaWeight}
              label="Weight"
              value={userWeight}
              unit="kg"
              color="bg-fuchsia-500"
              bgColor="bg-fuchsia-50"
            />
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="feature-card animate-fade-in">
            <div className="feature-icon bg-emerald-50 text-emerald-700">
              <FaHeart />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Contact Nutritionist</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Connect with our certified nutritionist for personalized guidance and support.</p>
            </div>
            <button onClick={() => navigate("/nutritionist-directory")} className="feature-action">
              Connect Now
            </button>
          </div>
          <div className="feature-card animate-fade-in">
            <div className="feature-icon bg-emerald-50 text-emerald-700">
              <FaChartLine />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Improve Your Routine</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Get AI-powered tips and recommendations to improve your daily habits.</p>
            </div>
            <button onClick={() => navigate("/improvement")} className="feature-action">
              Improve Now
            </button>
          </div>
        </section>

        <section className="mt-10 rounded-[32px] border border-slate-200/90 bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Nutritionist Conversations</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Communicate with your nutritionists, continue conversations, and leave reviews when problems are resolved.</p>
            </div>
            {resolveMessage ? (
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{resolveMessage}</div>
            ) : null}
          </div>

          <div className="mt-6 space-y-6">
            {historyLoading ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">Loading conversations...</div>
            ) : historyError ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{historyError}</div>
            ) : contactHistory.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">No conversations yet. Start by contacting a nutritionist to get personalized support.</div>
            ) : (
              contactHistory.map((item) => {
                const nutritionist = item.nutritionistId || {};
                const isExpanded = expandedRequestId === item._id;

                return (
                  <div key={item._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{nutritionist.name || "Nutritionist"}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.message || "Review your last meal plan and request a follow-up."}</p>
                        <p className="mt-3 text-xs text-slate-500">{new Date(item.createdAt || item.timestamp).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => setExpandedRequestId(isExpanded ? null : item._id)}
                        className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        {isExpanded ? "Hide" : "Details"}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm text-slate-600">Continue the chat below and resolve the conversation when finished.</p>
                            <p className="mt-2 text-xs text-slate-500">Method: {item.contactMethod === 'call' ? 'Call' : 'Message'}</p>
                          </div>
                          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs text-slate-600">
                            {item.resolved ? 'Resolved' : item.status === 'answered' ? 'Answered' : 'Open'}
                          </div>
                        </div>

                        {item.messages && item.messages.length > 0 && (
                          <div className="mt-4 space-y-4">
                            <h4 className="text-sm font-semibold text-slate-900">Chat history</h4>
                            <div className="flex flex-col gap-3">
                              {item.messages.map((message, idx) => (
                                <div
                                  key={idx}
                                  className={
                                    message.sender === 'user'
                                      ? 'ml-auto flex justify-end'
                                      : 'flex justify-start'
                                  }
                                >
                                  <div className={
                                    `rounded-3xl p-4 text-sm shadow-sm ${
                                      message.sender === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-slate-100 text-slate-900'
                                    } max-w-[90%]`
                                  }>
                                    <p className="text-[11px] uppercase tracking-[0.2em] opacity-80">
                                      {message.sender === 'user' ? 'You' : 'Nutritionist'}
                                    </p>
                                    <p className="mt-2 whitespace-pre-wrap">{message.text}</p>
                                    <p className="mt-2 text-[11px] text-slate-400">
                                      {new Date(message.timestamp).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-6 space-y-4">
                          <textarea
                            value={messageText[item._id] || ''}
                            onChange={(e) =>
                              setMessageText((prev) => ({
                                ...prev,
                                [item._id]: e.target.value,
                              }))
                            }
                            placeholder="Write your next message to the nutritionist..."
                            className="w-full min-h-[120px] rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            disabled={item.resolved}
                          />
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex gap-3 flex-wrap">
                              <button
                                onClick={() => handleSendMessage(item._id)}
                                disabled={item.resolved || !messageText[item._id]?.trim()}
                                className="rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Send Message
                              </button>
                              {item.contactMethod === 'call' && (
                                <button
                                  onClick={() => navigate(`/call/${nutritionist._id || nutritionist.id}`)}
                                  className="rounded-3xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                                >
                                  Join Call
                                </button>
                              )}
                            </div>
                            <button
                              onClick={() => handleResolve(item._id)}
                              className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                            >
                              Resolve Conversation
                            </button>
                          </div>
                        </div>

                        {item.resolved && (
                          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <h4 className="text-sm font-semibold text-slate-900">Leave a rating and review</h4>
                            <div className="mt-4 flex items-center gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => handleRatingChange(item._id, 'rating', star)}
                                  className={
                                    `text-2xl ${
                                      (ratingPayload[item._id]?.rating || 0) >= star
                                        ? 'text-yellow-400'
                                        : 'text-slate-300'
                                    }`
                                  }
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                            <textarea
                              value={ratingPayload[item._id]?.comment || ''}
                              onChange={(e) => handleRatingChange(item._id, 'comment', e.target.value)}
                              placeholder="Write a short review for the nutritionist..."
                              className="mt-4 w-full min-h-[100px] rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            />
                            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <button
                                onClick={() => handleSubmitRating(item)}
                                className="rounded-3xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-400"
                              >
                                Submit Rating
                              </button>
                              {ratingStatus[item._id] && (
                                <p className="text-sm text-slate-700">{ratingStatus[item._id]}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="mt-10 rounded-[32px] border border-slate-200/90 bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Recent Plan Summary</h2>
              <p className="text-slate-600 mt-2">Your latest saved plan gives you a quick overview of calories, note warnings, and recommendations.</p>
            </div>
            <button onClick={() => navigate("/my-plans")} className="dashboard-secondary-btn">
              View My Plans
            </button>
          </div>

          {loading ? (
            <div className="mt-8 text-slate-600">Loading latest plan...</div>
          ) : error ? (
            <div className="mt-8 rounded-2xl bg-yellow-50 border border-yellow-200 p-6 text-yellow-700">{error}</div>
          ) : lastPlan ? (
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="bg-blue-50 rounded-2xl p-6">
                <p className="text-sm text-slate-600">Daily Calories</p>
                <p className="text-3xl font-bold text-blue-700">{lastPlan.dailyCalories}</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-6">
                <p className="text-sm text-slate-600">Recommended Foods</p>
                <p className="text-lg font-semibold text-emerald-700">{(lastPlan.prefer || []).slice(0, 2).join(", ") || "No data"}</p>
              </div>
              <div className="bg-rose-50 rounded-2xl p-6">
                <p className="text-sm text-slate-600">Avoid</p>
                <p className="text-lg font-semibold text-rose-700">{(lastPlan.avoid || []).slice(0, 2).join(", ") || "No data"}</p>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-slate-700">No recent plan found. Generate your first personalized plan to get started.</div>
          )}
        </section>
      </div>
    </div>
  );
}
