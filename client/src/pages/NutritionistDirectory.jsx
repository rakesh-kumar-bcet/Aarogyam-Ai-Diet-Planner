import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api";

const BASE_URL = `${API_BASE_URL}/api/admin`;

export default function NutritionistDirectory() {
  const navigate = useNavigate();
  const [nutritionists, setNutritionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNutritionist, setSelectedNutritionist] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMethod, setContactMethod] = useState("message");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchNutritionists();
  }, []);

  const getAvailableContactMethods = (nutritionist) => {
    const methods = Array.from(new Set(nutritionist.contactPreference || []));
    const simplified = methods
      .map((method) => (method === "chat" ? "message" : method))
      .filter((method) => ["message", "call"].includes(method));
    const unique = Array.from(new Set(simplified));
    return unique.length > 0 ? unique : ["message"];
  };

  const getContactLabel = (method) =>
    method === "call" ? "Call" : "Message";

  const fetchNutritionists = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/nutritionists-available`);
      setNutritionists(res.data);
    } catch (err) {
      console.error("Error fetching nutritionists:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNutritionists = nutritionists.filter(
    (nut) =>
      nut.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (nut.specialization &&
        nut.specialization.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleContactNutritionist = (nutritionist) => {
    setSelectedNutritionist(nutritionist);
    const availableMethods = getAvailableContactMethods(nutritionist);
    setContactMethod(availableMethods.includes("call") ? "call" : "message");
    setMessage("");
    setShowContactModal(true);
  };

  const handleSendMessage = async () => {
    if (contactMethod === "message" && !message.trim()) {
      alert("Please enter a message before sending.");
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const payloadMessage =
        contactMethod === "call"
          ? message.trim() || "Please call me at your earliest convenience."
          : message.trim();

      const result = await axios.post(
        `${BASE_URL}/contact-nutritionist`,
        {
          userId,
          nutritionistId: selectedNutritionist.id,
          message: payloadMessage,
          contactMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const successText =
        contactMethod === "call"
          ? `Call request has been sent. Nutritionist ${selectedNutritionist.name} can be reached at ${selectedNutritionist.phone}.`
          : `Message sent`; 

      setStatusMessage(result.data?.message || successText);
      setMessage("");
      if (contactMethod === "call") {
        navigate(`/call/${selectedNutritionist.id}`);
      } else {
        setShowContactModal(false);
        setSelectedNutritionist(null);
      }
    } catch (err) {
      console.error("Error contacting nutritionist:", err);
      setStatusMessage("Unable to send request. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading nutritionists...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Find a Nutritionist
          </h1>
          <p className="text-gray-600 mb-6">
            Connect with qualified nutrition experts
          </p>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Nutritionists Grid */}
        {filteredNutritionists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No nutritionists found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNutritionists.map((nutritionist) => (
              <div
                key={nutritionist.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white text-2xl">
                      🩺
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-xl font-bold text-gray-800">
                        {nutritionist.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {nutritionist.degree}
                      </p>
                    </div>
                  </div>

                  {/* Specialization */}
                  {nutritionist.specialization && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        <strong>Specialization:</strong>{" "}
                        {nutritionist.specialization}
                      </p>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="mb-4 flex items-center">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < Math.round(nutritionist.averageRating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {nutritionist.averageRating} ({nutritionist.totalRatings}{" "}
                      ratings)
                    </span>
                  </div>

                  {/* Patient Contact Summary */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      <strong>Patients contacted:</strong>{" "}
                      {nutritionist.totalContacts ?? nutritionist.patientCount ?? 0}
                    </p>
                    <p className="text-sm text-gray-600">
                      Available to answer your nutrition questions.
                    </p>
                  </div>

                  {/* Contact Methods */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Preferred contact:</strong>
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {(nutritionist.contactPreference.includes("chat") ||
                        nutritionist.contactPreference.includes("message")) && (
                        <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                          📧 Message
                        </span>
                      )}
                      {nutritionist.contactPreference.includes("call") && (
                        <span className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full">
                          📞 Call
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Phone (partially hidden for privacy) */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>Contact:</strong> {nutritionist.phone.slice(0, 3)}
                      ****{nutritionist.phone.slice(-3)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleContactNutritionist(nutritionist)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition"
                    >
                      Contact Now
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/nutritionist/${nutritionist.id}`)
                      }
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 rounded-lg transition"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            ← Go Back
          </button>
        </div>
        {statusMessage && (
          <div className="mt-6 rounded-3xl bg-green-50 border border-green-200 p-5 text-green-800">
            {statusMessage}
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showContactModal && selectedNutritionist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Contact {selectedNutritionist.name}
            </h2>
            <p className="text-gray-600 mb-6">
              Choose your preferred contact method and send a message
            </p>

            {/* Contact Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Contact Method
              </label>
              <div className="space-y-2">
                {getAvailableContactMethods(selectedNutritionist).map((method) => (
                  <label key={method} className="flex items-center">
                    <input
                      type="radio"
                      name="contactMethod"
                      value={method}
                      checked={contactMethod === method}
                      onChange={(e) => setContactMethod(e.target.value)}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="ml-2 text-gray-700 capitalize">
                      {method === "message" && "📧 Message"}
                      {method === "call" && "📞 Call"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {contactMethod === "message" ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message to the nutritionist..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                />
              </div>
            ) : (
              <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-gray-700">
                  A call request will be sent to this nutritionist. Use the phone number below to contact them directly.
                </p>
                <p className="mt-4 text-xl font-semibold text-gray-900">
                  {selectedNutritionist.phone || "Phone number unavailable"}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowContactModal(false);
                  setSelectedNutritionist(null);
                  setMessage("");
                }}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition"
              >
                {contactMethod === "call" ? "Send Call Request" : "Send Message"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
