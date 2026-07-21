import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 200,        // 100 virtual users
  duration: "30s" // Run for 30 seconds
};

export default function () {
  const res = http.get("http://localhost:8000/api/docs?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTU1ZDRmYTI0MGNiMmEyMmJmZDVlNDAiLCJpYXQiOjE3ODQwMDk5NzgsImV4cCI6MTc4NDA5NjM3OH0.o2Q55UWrBlxusxpw-Klcm9X9dEDhtaL0gefX-bJIx6A");

  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    "summary.json": JSON.stringify(data),
  };
}

// Run Test: k6 run load-test.js