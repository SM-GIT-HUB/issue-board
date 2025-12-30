"use client"

import Link from "next/link"
import { auth, db } from "@/lib/firebase"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore"

export default function IssuesPage() {
  const [user, setUser] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const router = useRouter();

  // Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/login");
      else setUser(u);
    })
    return () => unsub();
  }, [])

  // Fetch issues
  useEffect(() => {
    if (!user) return;

    const fetchIssues = async () => {
      const q = query(
        collection(db, "issues"),
        orderBy("createdAt", "desc")
      )

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))

      setIssues(data);
      setLoading(false);
    }

    fetchIssues();
  }, [user])

  const handleStatusChange = async (issue, nextStatus) => {
    if (issue.status === "Open" && nextStatus === "Done") {
      alert("An issue must be moved to In Progress before being marked Done");
      return;
    }

    try {
        await updateDoc(doc(db, "issues", issue.id), {
        status: nextStatus,
      })

      setIssues(prev =>
        prev.map(i =>
          i.id === issue.id ? { ...i, status: nextStatus } : i
        )
      )
    } catch (err) {
      console.error(err);
    }
  }


  if (!user || loading) return null;

  // Apply filters (client-side)
  const filteredIssues = issues.filter(issue => {
    const statusMatch =
      statusFilter === "All" || issue.status === statusFilter;

    const priorityMatch =
      priorityFilter === "All" || issue.priority === priorityFilter;

    return statusMatch && priorityMatch;
  })

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Link
        href="/"
        className="inline-block mb-4 text-sm text-blue-600 hover:underline"
      >
        ← Back to Home
      </Link>

      <h1 className="text-2xl font-semibold mb-4">Issue Board</h1>

      <div className="flex gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="All">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="All">All Priority</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {filteredIssues.length === 0 && (
        <p className="text-gray-600">No issues match the selected filters.</p>
      )}

      <div className="space-y-4">
        {filteredIssues.map(issue => (
          <div
            key={issue.id}
            className="bg-white p-4 rounded shadow"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">{issue.title}</h2>
              <span className="text-sm px-2 py-1 rounded bg-gray-200">
                {issue.priority}
              </span>
            </div>

            <p className="text-gray-700 mb-2">{issue.description}</p>

            <div className="text-sm text-gray-600 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span>Status:</span>
                <select
                  value={issue.status}
                  onChange={(e) => handleStatusChange(issue, e.target.value)}
                  className="border rounded p-1 text-sm"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <span>Assigned To: {issue.assignedTo || "—"}</span>
              <span>Created By: {issue.createdBy}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}