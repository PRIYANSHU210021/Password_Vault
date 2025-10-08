"use client";

import { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { useRouter } from "next/navigation";

export default function VaultPage() {
  
  const router = useRouter();

  const [vault, setVault] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({
    title: "",
    username: "",
    password: "",
    url: "",
    notes: "",
  });

  const [search, setSearch] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [genOptions, setGenOptions] = useState({
  length: 12,
  includeNumbers: true,
  includeSymbols: true,
  includeLetters: true,
  excludeLookalike: true,
});




  // 👇 Define helper functions AFTER all hooks
  const SECRET_KEY = "my_secret_key_123";

  const encrypt = (text: string) =>
    CryptoJS.AES.encrypt(text, SECRET_KEY).toString();

  const decrypt = (cipherText: string) => {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const handleAdd = async () => {
    if (!newItem.title || !newItem.username || !newItem.password) return;

    const encryptedData = encrypt(JSON.stringify(newItem));
    const iv = CryptoJS.lib.WordArray.random(16).toString();

    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ciphertext: encryptedData, iv }),
      });

      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();

      setVault([...vault, { ...newItem, _id: data.item._id }]);
      setNewItem({ title: "", username: "", password: "", url: "", notes: "" });
    } catch (error) {
      console.error("Add error:", error);
      alert("Error saving data to DB");
    }
  };

  const generatePassword = () => {
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+[]{}|;:,.<>?";

  let chars = "";
  if (genOptions.includeLetters) chars += letters;
  if (genOptions.includeNumbers) chars += numbers;
  if (genOptions.includeSymbols) chars += symbols;

  if (genOptions.excludeLookalike) {
    chars = chars.replace(/[O0Il1]/g, "");
  }

  let pw = "";
  for (let i = 0; i < genOptions.length; i++) {
    pw += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  setNewItem({ ...newItem, password: pw });
};



  // ❌ Delete item
  const handleDelete = (id: string) => {
    setVault(vault.filter((v) => v._id !== id));
  };

  // 📋 Copy password (auto clear after 10s)
  const handleCopy = (password: string) => {
    navigator.clipboard.writeText(password);
    setCopyStatus("Copied!");
    setTimeout(() => {
      navigator.clipboard.writeText(""); // clear clipboard
      setCopyStatus("");
    }, 10000);
  };

  // 🚪 Logout
 const handleLogout = async () => {
  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // 👈 ensures cookies are sent
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Logout failed");
    }

    alert("Logged out successfully!");
    router.push("/");
  } catch (error: any) {
    console.error("Logout error:", error);
    alert(error.message);
  }
};


  // 🔍 Search logic
  const filteredVault = vault.filter(
    (v) =>
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.username.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ All useEffects stay together here
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
        if (res.status === 401) {
          router.push("/");
        } else {
          setAuthorized(true);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/");
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchVault = async () => {
      try {
        const res = await fetch("/api/vault", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const decrypted = data.map((item: any) =>
            JSON.parse(decrypt(item.ciphertext))
          );
          setVault(decrypted);
        }
      } catch (err) {
        console.error("Failed to fetch vault:", err);
      }
    };
    fetchVault();
  }, []);


  return (
    <div className="min-h-screen bg-gray-100 p-6 items-center">
      {/* Header with Logout */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">Secure Vault</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="flex justify-center gap-2 ">
        {/* Password Generator */}
        <div className=" bg-white p-4 rounded-xl shadow h-60">
          <h2 className="text-lg font-semibold mb-3 text-black">
            Password Generator
          </h2>

          <label className="block mb-2 text-sm font-medium text-gray-700">
            Length: {genOptions.length}
          </label>
          <input
            type="range"
            min="6"
            max="32"
            value={genOptions.length}
            onChange={(e) =>
              setGenOptions({ ...genOptions, length: parseInt(e.target.value) })
            }
            className="w-full mb-3"
          />

          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-3">
            <label>
              <input
                type="checkbox"
                checked={genOptions.includeLetters}
                onChange={(e) =>
                  setGenOptions({ ...genOptions, includeLetters: e.target.checked })
                }
              />{" "}
              Include letters
            </label>
            <label>
              <input
                type="checkbox"
                checked={genOptions.includeNumbers}
                onChange={(e) =>
                  setGenOptions({ ...genOptions, includeNumbers: e.target.checked })
                }
              />{" "}
              Include numbers
            </label>
            <label>
              <input
                type="checkbox"
                checked={genOptions.includeSymbols}
                onChange={(e) =>
                  setGenOptions({ ...genOptions, includeSymbols: e.target.checked })
                }
              />{" "}
              Include symbols
            </label>
            <label>
              <input
                type="checkbox"
                checked={genOptions.excludeLookalike}
                onChange={(e) =>
                  setGenOptions({
                    ...genOptions,
                    excludeLookalike: e.target.checked,
                  })
                }
              />{" "}
              Exclude look-alikes
            </label>
          </div>

          <button
            onClick={generatePassword}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            Generate Password
          </button>
        </div>

        <div className="">
          {/* Add New Vault Item */}
          <div className="bg-white p-4 rounded-xl shadow mb-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-3 text-black">
              Add New Vault Item
            </h2>

            {["title", "username", "password", "url"].map((field) => (
              <input
                key={field}
                type="text"
                placeholder={field[0].toUpperCase() + field.slice(1)}
                value={(newItem as any)[field]}
                onChange={(e) =>
                  setNewItem({ ...newItem, [field]: e.target.value })
                }
                className="w-full border p-2 mb-2 rounded text-black"
              />
            ))}

            <textarea
              placeholder="Notes"
              value={newItem.notes}
              onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
              className="w-full border p-2 mb-2 rounded text-black"
            />

            <button
              onClick={handleAdd}
              className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
            >
              Add to Vault
            </button>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-4">
            <input
              type="text"
              placeholder="Search vault..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Vault Items */}
          <div className="max-w-md mx-auto space-y-4">
            {filteredVault.map((item) => (
              <div
                key={item._id}
                className="bg-white p-4 text-black rounded-xl shadow space-y-1"
              >
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-gray-600">UserName: {item.username}</p>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    className="text-sm text-indigo-600 underline"
                  >
                    Link: {item.url}
                  </a>
                )}
                {item.notes && (
                  <p className="text-sm text-gray-600">Notes: {item.notes}</p>
                )}
                <div className="flex justify-between items-center">
                  <button
                   onClick={() => handleCopy(item.password)} // ✅ just use it

                    className="text-indigo-600 hover:underline text-sm"
                  >
                    Copy Password
                  </button>
                  <button
             onClick={() => handleDelete(item._id)} // ✅ correct


                    className="text-red-500 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {filteredVault.length === 0 && (
              <p className="text-center text-gray-500">No items found</p>
            )}
          </div>
        </div>
      </div>

      {/* Copy status */}
      {copyStatus && (
        <div className="fixed bottom-4 right-4 bg-indigo-600 text-white px-3 py-2 rounded-lg shadow">
          {copyStatus}
        </div>
      )}
    </div>
  );
}
