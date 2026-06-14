import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { connectSocket, sendSocket, subscribe } from "../Services/socketService";

const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

export default function CallRoom() {
  const { targetId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Initializing call...");
  const [error, setError] = useState("");
  const [callActive, setCallActive] = useState(false);
  const [isRequester, setIsRequester] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [remoteName, setRemoteName] = useState("");
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketUnsubscribeRef = useRef(null);
  const [hasMedia, setHasMedia] = useState(false);

  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("userName") || localStorage.getItem("name") || "You";

  useEffect(() => {
    if (!targetId) {
      setError("Missing call target.");
      setStatus("Unable to start call.");
      return;
    }

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setHasMedia(true);
        setStatus("Media access granted. Waiting for call setup...");
      } catch (err) {
        console.error("Media error:", err);
        setError("Camera and microphone access is required for this call.");
        setStatus("Please allow camera and microphone access.");
      }
    };

    initMedia();

    const socket = connectSocket();
    const handleSocketEvent = async (event) => {
      if (!event?.type || !event.payload) return;

      if (event.type === "call.offer" && event.payload.fromUserId !== userId) {
        setIncomingOffer(event.payload);
        setRemoteName(event.payload.fromName || "Nutritionist");
        setStatus("Incoming call... accept to join.");
      }

      if (event.type === "call.answer" && event.payload.fromUserId !== userId) {
        setStatus("Call answered. Connecting...");
        await handleRemoteAnswer(event.payload.answer);
      }

      if (event.type === "call.ice" && event.payload.fromUserId !== userId) {
        await handleRemoteIce(event.payload.candidate);
      }

      if (event.type === "call.end" && event.payload.fromUserId !== userId) {
        setStatus("The other user ended the call.");
        closeCall();
      }
    };

    const cleanupOffer = subscribe("call.offer", handleSocketEvent);
    const cleanupAnswer = subscribe("call.answer", handleSocketEvent);
    const cleanupIce = subscribe("call.ice", handleSocketEvent);
    const cleanupEnd = subscribe("call.end", handleSocketEvent);

    return () => {
      cleanupOffer();
      cleanupAnswer();
      cleanupIce();
      cleanupEnd();
      closeCall();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [targetId, userId]);

  const closeCall = () => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    setCallActive(false);
  };

  const createPeerConnection = () => {
    if (peerRef.current) return peerRef.current;

    const peer = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        sendSocket("call.ice", {
          targetUserId: targetId,
          candidate: event.candidate,
          fromUserId: userId,
        });
      }
    };

    peer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => peer.addTrack(track, localStreamRef.current));
    }

    peerRef.current = peer;
    return peer;
  };

  const createOffer = async () => {
    try {
      const peer = createPeerConnection();
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      sendSocket("call.offer", {
        targetUserId: targetId,
        offer,
        fromUserId: userId,
        fromName: userName,
      });
      setIsRequester(true);
      setStatus("Call request sent. Waiting for answer...");
    } catch (err) {
      console.error("Offer creation failed:", err);
      setError("Unable to create offer.");
      setStatus("Call setup failed.");
    }
  };

  const handleRemoteAnswer = async (answer) => {
    try {
      const peer = createPeerConnection();
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
      setCallActive(true);
      setStatus("Call connected.");
    } catch (err) {
      console.error("Remote answer handling failed:", err);
      setError("Could not establish call.");
    }
  };

  const handleRemoteIce = async (candidate) => {
    try {
      const peer = createPeerConnection();
      if (candidate) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      console.error("ICE candidate error:", err);
    }
  };

  const acceptCall = async () => {
    if (!incomingOffer) return;
    try {
      const peer = createPeerConnection();
      await peer.setRemoteDescription(new RTCSessionDescription(incomingOffer.offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      sendSocket("call.answer", {
        targetUserId: incomingOffer.fromUserId,
        answer,
        fromUserId: userId,
        fromName: userName,
      });
      setCallActive(true);
      setStatus("Call connected.");
    } catch (err) {
      console.error("Accept call failed:", err);
      setError("Unable to accept call.");
    }
  };

  const endCall = () => {
    sendSocket("call.end", {
      targetUserId: targetId,
      fromUserId: userId,
    });
    closeCall();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Live Call Room</p>
            <h1 className="text-3xl font-semibold text-slate-900">Audio / Video Call</h1>
            <p className="mt-2 text-sm text-slate-600">Connect with your nutritionist using browser audio/video over websocket signaling.</p>
          </div>
          <div className="inline-flex items-center gap-3">
            <span className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white">{status}</span>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-100 p-4">
            <p className="text-sm font-semibold text-slate-700">Your camera</p>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="mt-4 h-72 w-full rounded-3xl bg-black object-cover"
            />
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-100 p-4">
            <p className="text-sm font-semibold text-slate-700">Remote camera</p>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="mt-4 h-72 w-full rounded-3xl bg-black object-cover"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          {role === 'user' && !isRequester && hasMedia && (
            <button
              onClick={createOffer}
              className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700"
            >
              Request Call
            </button>
          )}
          {incomingOffer && !callActive && (
            <button
              onClick={acceptCall}
              className="rounded-3xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-green-700"
            >
              Accept Call from {remoteName}
            </button>
          )}
          <button
            onClick={endCall}
            className="rounded-3xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-rose-700"
          >
            End Call
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-3xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 shadow hover:bg-slate-200"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p>Call results are powered by browser media and websocket signaling. If you do not see video, check camera/microphone permissions.</p>
        </div>
      </div>
    </div>
  );
}
