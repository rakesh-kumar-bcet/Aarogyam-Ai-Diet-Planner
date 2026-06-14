import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchDietFollowers,
  fetchFeedback,
  fetchContactRequests,
  respondToContactRequest,
} from "../Services/nutrenistService";
import { connectSocket, subscribe } from "../Services/socketService";
import UserHeader from "../components/UserHeader";
import {
  FaExclamationTriangle,
  FaStar,
  FaUsers,
  FaComments,
} from "react-icons/fa";

export default function Nutrenist() {
  const navigate = useNavigate();
  const [dietFollowers, setDietFollowers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestMsg, setRequestMsg] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const userName = localStorage.getItem("userName");
    if (userName) {
      const welcomed = sessionStorage.getItem("nutritionistWelcomeShown");
      if (!welcomed) {
        setTimeout(() => {
          alert(
            `Welcome ${userName}! 👋 You're now logged in as a Nutritionist.`,
          );
          sessionStorage.setItem("nutritionistWelcomeShown", "true");
        }, 500);
      }
    }
    loadDietFollowers();
    loadFeedback();
    loadContactRequests();

    const socket = connectSocket();
    const handleSocketEvent = (event) => {
      if (!event || !event.type) return;
      if (event.type === 'notification' || event.type === 'new_contact_request' || event.type === 'chat_message') {
        loadContactRequests();
        setRequestMsg('New patient message or contact request received.');
      }
    };

    const cleanupNotification = subscribe('notification', handleSocketEvent);
    const cleanupNewContact = subscribe('new_contact_request', handleSocketEvent);
    const cleanupChat = subscribe('chat_message', handleSocketEvent);

    return () => {
      cleanupNotification();
      cleanupNewContact();
      cleanupChat();
    };
  }, []);

  const loadContactRequests = async () => {
    try {
      const res = await fetchContactRequests();
      setContactRequests(res.data);
    } catch (err) {
      console.error(
        "loadContactRequests error",
        err.response?.data || err.message,
      );
      setMsg(err.response?.data?.message || "Failed to load contact requests");
    }
  };

  const handleResponseSubmit = async (requestId, resolve = false) => {
    if (!currentResponse.trim()) {
      alert("Please type a response before submitting.");
      return;
    }

    try {
      const res = await respondToContactRequest(requestId, currentResponse, resolve);
      setRequestMsg(res.data?.message || "Response submitted successfully.");
      setCurrentResponse("");
      setSelectedRequest(null);
      loadContactRequests();
    } catch (err) {
      console.error(
        "response submit error",
        err.response?.data || err.message,
      );
      setMsg(err.response?.data?.message || "Failed to submit response");
    }
  };

  const loadDietFollowers = async () => {
    try {
      const res = await fetchDietFollowers();
      setDietFollowers(res.data);
    } catch (err) {
      console.error(
        "loadDietFollowers error",
        err.response?.data || err.message,
      );
      setMsg(err.response?.data?.message || "Failed to load patient contacts");
    }
  };

  const loadFeedback = async () => {
    try {
      const res = await fetchFeedback();
      setFeedbacks(res.data);
    } catch (err) {
      console.error("loadFeedback error", err.response?.data || err.message);
      setMsg(err.response?.data?.message || "Failed to load feedback");
    }
  };

  const averageRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((sum, r) => sum + (r.rating || 0), 0) / feedbacks.length
        ).toFixed(1)
      : 0;

  const uniqueContactPatientIds = new Set(
    contactRequests
      .map((request) => request.user?._id?.toString())
      .filter(Boolean),
  );
  const totalContactPatients = uniqueContactPatientIds.size;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <UserHeader />
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 mt-12">
          Nutritionist Dashboard
        </h2>
        <p className="text-gray-600 mb-8">
          Manage your patients, guidelines, and professional interactions
        </p>

        {msg && (
          <p className="bg-red-100 text-red-700 p-4 rounded mb-6">{msg}</p>
        )}

        {/* Nutritionist Guidelines Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-red-500">
          <div className="flex items-center gap-3 mb-4">
            <FaExclamationTriangle className="text-red-500 text-xl" />
            <h3 className="text-2xl font-bold text-gray-800">
              Professional Guidelines & Rules
            </h3>
          </div>
          <div className="bg-red-50 p-4 rounded text-gray-800 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-red-600 font-bold">⚠️</span>
              <p>
                <strong>No Personal Interactions:</strong> Maintain strict
                professional boundaries. Do not engage in personal
                conversations, dating, socializing, or any non-professional
                interactions with patients.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-600 font-bold">⚠️</span>
              <p>
                <strong>No Private Messaging:</strong> Avoid private chats
                outside the platform. All patient communications should be
                conducted through the official app channels for transparency and
                safety.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-600 font-bold">⚠️</span>
              <p>
                <strong>Professional Conduct Only:</strong> All discussions must
                be nutrition and health-related. Keep interactions focused on
                diet plans, health improvements, and wellness guidance.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-600 font-bold">⚠️</span>
              <p>
                <strong>Respectful Communication:</strong> Treat all patients
                with respect and courtesy. Any violations of professional
                conduct may result in account suspension or termination.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">
                  Patients Contacted
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalContactPatients}
                </p>
              </div>
              <FaUsers className="text-blue-500 text-3xl opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">
                  Feedback Received
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {feedbacks.length}
                </p>
              </div>
              <FaComments className="text-green-500 text-3xl opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">
                  Average Rating
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {averageRating} ⭐
                </p>
              </div>
              <FaStar className="text-yellow-500 text-3xl opacity-20" />
            </div>
          </div>
        </div>

        {/* Patient Contact Requests */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaComments className="text-green-500" /> Patient Contact Requests
          </h3>
          {contactRequests.length === 0 ? (
            <p className="text-gray-500">No user support requests at the moment.</p>
          ) : (
            <div className="space-y-4">
              {contactRequests.map((request) => {
                const requestId = request._id || request.id;
                return (
                  <div
                    key={requestId}
                    className="border border-gray-200 rounded-3xl p-5 hover:bg-gray-50 transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">{request.user?.name || 'Anonymous User'}</p>
                        <p className="text-sm text-gray-500">{request.user?.email}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>
                          <strong>Method:</strong> {request.contactMethod === 'call' ? 'Call' : 'Message'}
                        </p>
                        <p>
                          <strong>Status:</strong>{' '}
                          {request.resolved ? 'Resolved' : request.status === 'answered' ? 'Answered' : 'Pending'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 text-gray-700">
                      <p className="font-medium">User problem:</p>
                      <p className="mt-2 whitespace-pre-wrap">{request.message}</p>
                    </div>
                    {request.messages && request.messages.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900">Conversation history</h4>
                        {request.messages.map((message, index) => (
                          <div key={index} className={`rounded-2xl p-3 text-sm ${message.sender === 'user' ? 'bg-blue-50 text-blue-900' : 'bg-green-50 text-green-900'}`}>
                            <p className="font-semibold">{message.senderName || (message.sender === 'user' ? 'Patient' : 'Nutritionist')}</p>
                            <p className="mt-1 whitespace-pre-wrap">{message.text}</p>
                            <p className="mt-2 text-xs text-gray-500">{new Date(message.timestamp).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {request.response && (
                      <div className="mt-4 rounded-2xl bg-green-50 border border-green-200 p-4">
                        <p className="font-medium text-green-700">Your response:</p>
                        <p className="mt-2 text-gray-700 whitespace-pre-wrap">{request.response}</p>
                        <p className="mt-2 text-xs text-gray-500">Responded on {new Date(request.responseAt).toLocaleString()}</p>
                      </div>
                    )}
                    {!request.resolved && (
                      <div className="mt-4">
                        <textarea
                          value={selectedRequest === requestId ? currentResponse : ''}
                          onChange={(e) => {
                            setSelectedRequest(requestId);
                            setCurrentResponse(e.target.value);
                          }}
                          placeholder="Type your professional response here..."
                          className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="mt-3 flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => handleResponseSubmit(requestId, false)}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                          >
                            Answer & keep open
                          </button>
                          <button
                            onClick={() => handleResponseSubmit(requestId, true)}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg"
                          >
                            Answer & resolve
                          </button>
                          {request.contactMethod === 'call' && request.user?._id && (
                            <button
                              onClick={() => navigate(`/call/${request.user._id}`)}
                              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg"
                            >
                              Join Call
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {requestMsg && (
            <div className="mt-4 rounded-3xl bg-blue-50 border border-blue-200 p-4 text-blue-900">
              {requestMsg}
            </div>
          )}
        </div>

        {/* Patient Contact History */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaUsers className="text-blue-500" /> Patient Contact History
          </h3>
          {dietFollowers.length === 0 && (
            <p className="text-gray-500">No patients have contacted you yet.</p>
          )}
          {dietFollowers.map((user) => (
            <div
              key={user._id}
              className="border-b border-gray-200 py-4 last:border-b-0 hover:bg-gray-50 p-4 rounded transition"
            >
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-gray-600 text-sm">{user.email}</p>
              <p className="text-xs text-gray-500 mt-2">
                Status:{" "}
                {user.hasDietPlan
                  ? "✅ Following Diet Plan"
                  : "⏳ Awaiting Plan"}
              </p>
            </div>
          ))}
        </div>

        {/* Patient Ratings & Feedback */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaStar className="text-yellow-500" /> Patient Ratings & Reviews
          </h3>
          {feedbacks.length === 0 ? (
            <p className="text-gray-500">
              No patient reviews yet. Encourage patients to leave feedback after support.
            </p>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback._id}
                  className="border-b border-gray-200 py-4 last:border-b-0 hover:bg-gray-50 p-4 rounded transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {feedback.patientName || "Anonymous Patient"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {feedback.patientEmail || "No email provided"}
                      </p>
                      <p className="mt-2 text-yellow-500 text-sm">
                        {"⭐".repeat(Math.max(0, Math.min(5, Math.round(feedback.rating))))} {feedback.rating}/5
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(feedback.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="mt-3 text-gray-700">
                    {feedback.comment || "No comment provided."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
