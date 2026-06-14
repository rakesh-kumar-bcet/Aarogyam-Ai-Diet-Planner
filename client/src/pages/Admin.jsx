import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchLoginLogs,
  fetchUserCounts,
  fetchNutritionistSummary,
  fetchPatientDirectory,
  fetchAdminFeedback
} from '../Services/adminService';

export default function Admin() {
  const [logs, setLogs] = useState([]);
  const [counts, setCounts] = useState({ totalUsers: 0, totalNutrenists: 0, totalAdmins: 0 });
  const [nutritionists, setNutritionists] = useState([]);
  const [patients, setPatients] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadCounts();
    loadLogs();
    loadNutritionists();
    loadPatients();
    loadFeedbacks();
  }, []);

  const loadLogs = async () => {
    try {
      const res = await fetchLoginLogs();
      setLogs(res.data);
    } catch (err) {
      console.error('loadLogs error', err.response?.data || err.message);
      setMsg(err.response?.data?.message || 'Failed to load login logs');
    }
  };

  const loadCounts = async () => {
    try {
      const res = await fetchUserCounts();
      setCounts(res.data);
    } catch (err) {
      console.error('loadCounts error', err.response?.data || err.message);
      setMsg(err.response?.data?.message || 'Failed to load user counts');
    }
  };

  const loadNutritionists = async () => {
    try {
      const res = await fetchNutritionistSummary();
      setNutritionists(res.data);
    } catch (err) {
      console.error('loadNutritionists error', err.response?.data || err.message);
      setMsg(err.response?.data?.message || 'Failed to load nutritionist summary');
    }
  };

  const loadPatients = async () => {
    try {
      const res = await fetchPatientDirectory();
      setPatients(res.data);
    } catch (err) {
      console.error('loadPatients error', err.response?.data || err.message);
      setMsg(err.response?.data?.message || 'Failed to load patient directory');
    }
  };

  const loadFeedbacks = async () => {
    try {
      const res = await fetchAdminFeedback();
      setFeedbacks(res.data);
    } catch (err) {
      console.error('loadFeedbacks error', err.response?.data || err.message);
      setMsg(err.response?.data?.message || 'Failed to load nutritionist feedback');
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-800">Hospital Admin Dashboard</h1>
      {msg && <p className="text-red-500 mb-4 text-center">{msg}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-lg rounded-lg p-6 text-center border-l-4 border-green-500">
          <h2 className="text-2xl font-semibold text-gray-700">Total Clients</h2>
          <p className="text-4xl font-bold text-green-600 mt-2">{counts.totalUsers}</p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6 text-center border-l-4 border-blue-500">
          <h2 className="text-2xl font-semibold text-gray-700">Total Nutritionists</h2>
          <p className="text-4xl font-bold text-blue-600 mt-2">{counts.totalNutrenists}</p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6 text-center border-l-4 border-purple-500">
          <h2 className="text-2xl font-semibold text-gray-700">Total Admins</h2>
          <p className="text-4xl font-bold text-purple-600 mt-2">{counts.totalAdmins}</p>
        </div>
      </div>

      <div className="grid gap-6 mb-8 lg:grid-cols-2">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Nutritionist Directory</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Rating</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Feedbacks</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Clients</th>
                </tr>
              </thead>
              <tbody>
                {nutritionists.map((nut) => (
                  <tr key={nut.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{nut.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{nut.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{nut.averageRating || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{nut.totalFeedbacks}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{nut.patientCount}</td>
                    <td className="px-4 py-3 text-sm text-blue-600 hover:underline">
                      <Link to={`/admin/nutritionist/${nut.id}`}>View profile</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Patient Directory</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Diet Plan</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Joined</th>
                </tr>
              </thead>
              <tbody>
                {patients.slice(0, 10).map((patient) => (
                  <tr key={patient.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{patient.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{patient.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {patient.hasDietPlan ? (
                        <span className="text-green-600 font-semibold">Yes</span>
                      ) : (
                        <span className="text-yellow-600">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{new Date(patient.joinedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {patients.length > 10 && (
            <p className="mt-4 text-sm text-gray-500">Showing the first 10 patients. Use the backend data for full reporting.</p>
          )}
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Latest Nutritionist Feedback</h2>
        <div className="space-y-4">
          {feedbacks.slice(0, 8).map((feedback) => (
            <div key={feedback._id} className="rounded-xl border border-gray-200 p-4 bg-gray-50">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="font-semibold text-gray-800">{feedback.nutritionistId?.name || 'Nutritionist'}</span>
                <span className="text-sm text-gray-500">{feedback.rating}/5</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{feedback.comment || 'No comment provided'}</p>
              <div className="text-xs text-gray-500 flex flex-wrap gap-3">
                <span>Client: {feedback.userId?.name || 'Unknown'}</span>
                <span>{new Date(feedback.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
          {feedbacks.length === 0 && <p className="text-gray-600">No feedback data is available yet.</p>}
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6 mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Login Activity Logs</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Timestamp</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">IP Address</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">User Agent</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{log.userId ? `${log.userId.name} (${log.userId.email})` : 'Unknown'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{log.action}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{log.ip}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-xs">{log.userAgent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}