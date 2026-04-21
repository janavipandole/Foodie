import React from "react";
import "./ResourcesPage.css";

const resources = [
  {
    title: "Farming Tips",
    description: "Learn seasonal crop care, irrigation methods, and pest control techniques.",
    items: ["Seasonal crop care", "Water management", "Pest prevention"],
  },
  {
    title: "Articles",
    description: "Explore latest agriculture trends and government schemes.",
    items: ["Agriculture trends", "Govt. schemes", "Organic farming"],
  },
  {
    title: "Guides",
    description: "Step-by-step farming guides for better yield.",
    items: ["Soil testing guide", "Fertilizer usage", "Crop rotation"],
  },
];

export default function ResourcesPage() {
  return (
    <section className="resources-page">
      {/* Hero Section */}
      <div className="resources-hero">
        <h1>Learning Resources</h1>
        <p>Explore farming tips, guides, and articles to improve your agricultural knowledge.</p>
      </div>

      {/* Grid Section */}
      <div className="resources-grid">
        {resources.map((res, index) => (
          <div className="resource-card" key={index}>
            <h2>{res.title}</h2>
            <p>{res.description}</p>

            <ul>
              {res.items.map((item, i) => (
                <li key={i}>🌱 {item}</li>
              ))}
            </ul>

            <button className="read-btn">Read More</button>
          </div>
        ))}
      </div>
    </section>
  );
}