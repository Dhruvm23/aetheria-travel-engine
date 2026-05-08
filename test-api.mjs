import fetch from "node-fetch";

const reqBody = {
  destination: "Paris",
  startDate: "2026-05-10",
  endDate: "2026-05-15",
  budget: "moderate",
  interests: ["history"],
  groupSize: 2,
  accessibilityNeeds: {
    wheelchairRequired: false,
    limitedMobility: false,
    visualImpairment: false,
    hearingImpairment: false,
    elderlyTraveler: false,
  },
};

async function run() {
  console.log("Sending request...");
  try {
    const res = await fetch("http://localhost:3000/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody),
    });
    console.log("Status:", res.status);
    const data = await res.text();
    console.log("Response:", data.substring(0, 500));
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
