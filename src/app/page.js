"use client"

import Link from "next/link"
import { auth } from "@/lib/firebase"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, signOut } from "firebase/auth"

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/login");
      else setUser(u);
    })
    return () => unsub();
  }, [])

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-2">
          Smart Issue Board
        </h1>

        <p className="text-gray-600 mb-4">
          Logged in as <span className="font-medium">{user.email}</span>
        </p>

        <div className="flex flex-col gap-3 mb-4">
          <Link
            href="/create-issue"
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Create Issue
          </Link>

          <Link
            href="/issues"
            className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            View Issues
          </Link>
        </div>

        <button
          onClick={() => signOut(auth)}
          className="text-sm text-red-600 hover:underline"
        >
          Logout
        </button>
      </div>
    </div>
  )
}