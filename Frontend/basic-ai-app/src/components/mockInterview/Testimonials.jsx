import React from "react";
import "./Testimonials.css";

const testimonials = [
  {
    id: 1,
    image: "https://i.pravatar.cc/100?img=11",
    name: "Rahul Sharma",
    role: "Software Engineer • Google",
    review:
      "PrepNova AI asked almost the same technical questions that I faced in my real interview. The instant AI feedback improved my confidence and helped me crack Google.",
  },
  {
    id: 2,
    image: "https://i.pravatar.cc/100?img=32",
    name: "Priya Patel",
    role: "SDE • Amazon",
    review:
      "The company-specific interview mode is amazing. It generated Amazon leadership questions exactly like my interview.",
  },
  {
    id: 3,
    image: "https://i.pravatar.cc/100?img=18",
    name: "Aman Verma",
    role: "Backend Developer",
    review:
      "The AI follow-up questions felt like a real interviewer. It greatly improved my communication skills.",
  },
  {
    id: 4,
    image: "https://i.pravatar.cc/100?img=48",
    name: "Sneha Reddy",
    role: "Final Year Student",
    review:
      "I had zero interview confidence. After one week of practicing with PrepNova AI, I cleared my campus placement interview.",
  },
  {
    id: 5,
    image: "https://i.pravatar.cc/100?img=26",
    name: "Rohit Kumar",
    role: "Full Stack Developer",
    review:
      "The performance report clearly showed my weak areas. My confidence score increased from 60% to 92%.",
  },
  {
    id: 6,
    image: "https://i.pravatar.cc/100?img=45",
    name: "Ananya Singh",
    role: "Software Engineer",
    review:
      "Resume-based interview questions were my favorite feature. Every question matched my resume perfectly.",
  },
];

const Testimonials = () => {
  return (
    <section className="testimonial-section">

      <div className="testimonial-heading">

        <span>⭐ Student Success Stories</span>

        <h2>
          Trusted By Thousands Of
          <br />
          <span>Interview Candidates</span>
        </h2>

        <p>
          Read how students improved their interview skills and
          landed jobs at top companies using PrepNova AI.
        </p>

      </div>

      <div className="testimonial-grid">

        {testimonials.map((item) => (
          <div className="testimonial-card" key={item.id}>

            <p className="review">
              "{item.review}"
            </p>

            <div className="stars">
              ⭐⭐⭐⭐⭐
            </div>

            <div className="user-info">

              <img
                src={item.image}
                alt={item.name}
              />

              <div>

                <h3>{item.name}</h3>

                <span>{item.role}</span>

              </div>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
};

export default Testimonials;