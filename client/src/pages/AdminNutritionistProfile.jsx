import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchNutritionistDetails } from '../Services/adminService';

export default function AdminNutritionistProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [patients, setPatients] = useState([]);
  const [expandedPatient, setExpandedPatient] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetchNutritionistDetails(id);
        setProfile(res.data.nutritionist);
        setFeedbacks(res.data.feedbacks || []);
        setPatients(res.data.patients || []);
      } catch (err) {
        console.error('loadProfile error', err.response?.data || err.message);
        setMsg(err.response?.data?.message || 'Failed to load nutritionist profile');
      }
    };

    loadProfile();
  }, [id]);

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="mb-6 inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          ← Back to Admin Dashboard
        </button>

        <h1 className="text-4xl font-bold mb-4 text-blue-800">Nutritionist Profile</h1>
        {msg && <p className="text-red-500 mb-4">{msg}</p>}

        {profile ? (
          <>
            <div className="grid gap-6 lg:grid-cols-4 mb-8">
              <div className="bg-white rounded-3xl p-6 shadow-md">
                <h2 className="text-lg font-semibold text-gray-700">Name</h2>
                <p className="mt-2 text-xl font-bold text-gray-900">{profile.name}</p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-md">
                <h2 className="text-lg font-semibold text-gray-700">Email</h2>
                <p className="mt-2 text-xl text-gray-900">{profile.email}</p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-md">
                <h2 className="text-lg font-semibold text-gray-700">Average Rating</h2>
                <p className="mt-2 text-3xl font-bold text-indigo-600">{profile.averageRating || 'N/A'}</p>
                <p className="text-sm text-gray-500">Based on {profile.totalFeedbacks} feedbacks</p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-md">
                <h2 className="text-lg font-semibold text-gray-700">Patients</h2>
                <p className="mt-2 text-3xl font-bold text-green-600">{profile.totalPatients}</p>
                <p className="text-sm text-gray-500">Assigned or engaged patients</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              <div className="bg-white rounded-3xl p-6 shadow-md">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Recent Feedback</h2>
                {feedbacks.length === 0 ? (
                  <p className="text-gray-600">No feedback available yet.</p>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.map((feedback) => (
                      <div key={feedback.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-gray-900">{feedback.clientName || 'Unknown client'}</p>
                            <p className="text-sm text-gray-500">{feedback.clientEmail || 'No email'}</p>
                          </div>
                          <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                            {feedback.rating}/5
                          </span>
                        </div>
                        <p className="mt-3 text-gray-700">{feedback.comment || 'No comment provided'}</p>
                        <p className="mt-2 text-xs text-gray-500">{new Date(feedback.timestamp).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-md">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Admin Summary</h2>
                <p className="text-gray-700 mb-2">Joined on: <span className="font-semibold text-gray-900">{new Date(profile.joinedAt).toLocaleDateString()}</span></p>
                <p className="text-gray-700 mb-2">Total contact requests: <span className="font-semibold text-gray-900">{profile.totalContacts}</span></p>
                <p className="text-gray-700">Total patients engaged: <span className="font-semibold text-gray-900">{profile.totalPatients}</span></p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Patient Details & Diet Plans</h2>
                <p className="text-sm text-gray-500">Click a patient to expand recent diet summaries.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Patient</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Contact Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Plans</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Latest Plan</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <React.Fragment key={patient.id}>
                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{patient.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{patient.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 capitalize">{patient.contactStatus || 'unknown'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{patient.planCount}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{patient.latestPlanAt ? new Date(patient.latestPlanAt).toLocaleDateString() : 'No plans'}</td>
                          <td className="px-4 py-3 text-sm text-blue-600 hover:underline">
                            <button type="button" onClick={() => setExpandedPatient(expandedPatient === patient.id ? null : patient.id)}>
                              {expandedPatient === patient.id ? 'Hide' : 'Show'} history
                            </button>
                          </td>
                        </tr>
                        {expandedPatient === patient.id && (
                          <tr className="bg-gray-50">
                            <td colSpan="6" className="px-4 py-4">
                              {patient.recentPlans.length === 0 ? (
                                <p className="text-gray-600">No diet plans found for this patient.</p>
                              ) : (
                                <div className="space-y-4">
                                  {patient.recentPlans.map((plan) => (
                                    <div key={plan.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                                      <div className="flex flex-wrap items-start justify-between gap-4 sm:items-center">
                                        <div>
                                          <p className="font-semibold text-gray-900">Plan created on {new Date(plan.createdAt).toLocaleDateString()}</p>
                                          <p className="text-sm text-gray-500">Calories: {plan.dailyCalories || 'N/A'}</p>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          <p>Notes: {plan.notes.length}</p>
                                          <p>Avoid: {plan.avoid.length}</p>
                                          <p>Prefer: {plan.prefer.length}</p>
                                        </div>
                                      </div>
                                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                        {plan.weekly.slice(0, 2).map((day, index) => (
                                          <div key={`${plan.id}-${index}`} className="rounded-2xl bg-gray-50 p-3">
                                            <p className="text-sm font-semibold text-gray-800">{day.day || `Day ${index + 1}`}</p>
                                            <p className="text-sm text-gray-700">Breakfast: {day.meals?.breakfast || '—'}</p>
                                            <p className="text-sm text-gray-700">Lunch: {day.meals?.lunch || '—'}</p>
                                            <p className="text-sm text-gray-700">Dinner: {day.meals?.dinner || '—'}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-600">Loading nutritionist profile...</p>
        )}
      </div>
    </div>
  );
}
