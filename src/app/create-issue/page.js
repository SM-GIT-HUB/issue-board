"use client"

import Link from "next/link"
import { auth, db } from "@/lib/firebase"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { addDoc, getDocs, query, orderBy, collection, serverTimestamp } from "firebase/firestore"

export default function CreateIssuePage() {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");
  const [assignedTo, setAssignedTo] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const [showConfirm, setShowConfirm] = useState(false);
  const [similarIssues, setSimilarIssues] = useState([]);

  const findSimilarIssues = async () => {
    const q = query(
      collection(db, "issues"),
      orderBy("createdAt", "desc")
    )

    const snapshot = await getDocs(q);
    const existingIssues = snapshot.docs.map(doc => doc.data());

    const words = title.toLowerCase().split(/\s+/).filter(Boolean);

    const matches = existingIssues.filter(issue => {
      const issueWords = issue.title.toLowerCase().split(/\s+/).filter(Boolean);

      let common = 0;

      for (const w of words) {
        if (issueWords.includes(w)) {
          common++;
        }
      }

      return common >= 1;
    })

    return matches;
  }

  // Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/login");
      else setUser(u);
    })
    return () => unsub();
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!showConfirm) {
      const matches = await findSimilarIssues();

      if (matches.length > 0) {
        setSimilarIssues(matches);
        setShowConfirm(true);
        return;
      }
    }

    try {
      await addDoc(collection(db, "issues"), {
        title,
        description,
        priority,
        status: "Open",
        assignedTo,
        createdBy: user.email,
        createdAt: serverTimestamp()
      })

      router.push("/");
    } catch (err) {
      setError(err.message);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded-lg shadow"
      >
        <Link
          href="/"
          className="inline-block mb-4 text-sm text-blue-600 hover:underline"
        >
          ← Back to Home
        </Link>


        <h2 className="text-2xl font-semibold mb-4 text-center">
          Create Issue
        </h2>

        <input
          placeholder="Title"
          className="w-full mb-3 p-2 border rounded"
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Description"
          className="w-full mb-3 p-2 border rounded"
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <select
          className="w-full mb-3 p-2 border rounded"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <input
          placeholder="Assigned To (email or name)"
          className="w-full mb-3 p-2 border rounded"
          onChange={(e) => setAssignedTo(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {showConfirm && (
          <div className="mb-4 p-3 border rounded bg-yellow-50">
            <p className="text-sm font-medium mb-2">
              Similar issues found:
            </p>

            <ul className="text-sm text-gray-700 mb-2 list-disc list-inside">
              {similarIssues.slice(0, 3).map((issue, idx) => (
                <li key={idx}>
                  {issue.title} ({issue.status})
                </li>
              ))}
            </ul>

            <p className="text-sm text-gray-600">
              You can still create this issue if it’s different.
            </p>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 cursor-pointer"
        >
          Create Issue
        </button>
      </form>
    </div>
  )
}