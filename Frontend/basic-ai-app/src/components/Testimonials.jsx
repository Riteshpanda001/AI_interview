import React from "react";
import "./Testimonials.css";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Ruturaj Biswal",
      role: "Software Engineer",
      rating: "★★★★★",
      review:
        "PrepNova AI helped me improve my communication skills and crack my TCS Digital interview. The AI feedback was incredibly accurate.",
    },
    {
      name: "Jyotiraj Panda",
      role: "Frontend Developer",
      rating: "★★★★★",
      review:
        "The ATS Resume Analyzer increased my resume score from 68% to 94%. I started receiving more interview calls immediately.",
    },
    {
      name: "Baidyanath Sahu",
      role: "Generative AI",
      rating: "★★★★★",
      review:
        "The mock interview feature felt like a real interview. It helped me gain confidence and prepare for technical rounds.",
    },
  ];

  return (
    <section className="testimonials-section">

      <div className="testimonials-header">
        <span className="testimonial-tag">
          ⭐ Testimonials
        </span>

        <h2>
          What Our
          <span> Users Say</span>
        </h2>

        <p>
          Thousands of candidates trust PrepNova AI to prepare
          for interviews and improve their career opportunities.
        </p>
      </div>

      <div className="testimonial-grid">
        {testimonials.map((item, index) => (
          <div className="testimonial-card" key={index}>

            <div className="rating">
              {item.rating}
            </div>

            <p className="review">
              "{item.review}"
            </p>

            <div className="user-info">
              <div className="avatar">
                {item.name.charAt(0)}
              </div>

              <div>
                <h4>{item.name}</h4>
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