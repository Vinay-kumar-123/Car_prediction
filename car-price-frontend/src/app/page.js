"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    year: "",
    kms_driven: "",
    fuel_type: ""
  });

  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [companies, setCompanies] = useState([]);
  const [cars, setCars] = useState([]);
  const [years, setYears] = useState([]);
  const [fuels, setFuels] = useState([]);

  // Load dropdown data
  useEffect(() => {
    fetch("https://car-prediction-jtsa.onrender.com/options")
      .then(res => res.json())
      .then(data => {
        setCompanies(data.companies);
        setCars(data.cars);
        setYears(data.years);
        setFuels(data.fuel_types);
      })
      .catch(() => setError("Failed to load options"));
  }, []);

  // Company → Car filter
  const handleCompanyChange = async (e) => {
    const company = e.target.value;
    setForm({ ...form, company, name: "" });

    try {
      const res = await fetch(`https://car-prediction-jtsa.onrender.com/cars/${company}`);
      const data = await res.json();
      setCars(data);
    } catch {
      setError("Failed to load cars");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const predictPrice = async () => {
    setLoading(true);
    setError("");
    setPrice(null);

    try {
      const res = await fetch("https://car-prediction-jtsa.onrender.com/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          year: Number(form.year),
          kms_driven: Number(form.kms_driven)
        })
      });

      const data = await res.json();
      setPrice(data.predicted_price);
    } catch {
      setError("Prediction failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">

        <h1 className="text-2xl font-bold mb-6 text-center">
          🚗 Smart Car Price Predictor
        </h1>

        {/* Error */}
        {error && (
          <div className="bg-red-500 text-white p-2 mb-3 rounded">
            {error}
          </div>
        )}

        {/* Company */}
        <select
          name="company"
          onChange={handleCompanyChange}
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
        >
          <option value="">Select Company</option>
          {companies.map(c => <option key={c}>{c}</option>)}
        </select>

        {/* Car */}
        <select
          name="name"
          onChange={handleChange}
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
        >
          <option value="">Select Car</option>
          {cars.map(car => <option key={car}>{car}</option>)}
        </select>

        {/* Year */}
        <select
          name="year"
          onChange={handleChange}
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
        >
          <option value="">Select Year</option>
          {years.map(y => <option key={y}>{y}</option>)}
        </select>

        {/* KM */}
        <input
          type="number"
          name="kms_driven"
          placeholder="Enter KMs Driven"
          onChange={handleChange}
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
        />

        {/* Fuel */}
        <select
          name="fuel_type"
          onChange={handleChange}
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
        >
          <option value="">Select Fuel</option>
          {fuels.map(f => <option key={f}>{f}</option>)}
        </select>

        {/* Button */}
        <button
          onClick={predictPrice}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 mt-4 rounded-lg transition"
        >
          {loading ? "Predicting..." : "Predict Price"}
        </button>

        {/* Result */}
        {price && (
          <div className="mt-6 text-center text-xl font-semibold text-green-400">
            ₹ {Math.round(price)}
          </div>
        )}
      </div>
    </div>
  );
}