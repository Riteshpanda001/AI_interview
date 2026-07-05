import React from "react";
import "./NailEveryAnswer.css";

import interviewImage from "../../assets/nail-answer.png";

const NailEveryAnswer = () => {

    return (

        <section className="nail-answer">

            <div className="nail-container">

                {/* Left Side */}

                <div className="nail-content">

                    <h2>
                        Nail Every Answer With
                        AI Mock Interview
                    </h2>

                    <p>
                        Experience realistic AI-powered mock interviews
                        that ask recruiter-level questions based on your
                        resume, job description, and target company.

                        Our AI interviewer analyzes every answer,
                        generates intelligent follow-up questions,
                        evaluates communication skills, and provides
                        detailed suggestions for improvement.
                    </p>

                    <div className="nail-features">

                        <div>✔ AI Mock Interview Simulator</div>

                        <div>✔ Improvement Tips & Results</div>

                        <div>✔ Industry Focused Preparation</div>

                        <div>✔ Online AI Interview Anytime, Anywhere</div>

                    </div>
                </div>

                {/* Right Side */}

                <div className="nail-image">

                    <img
                        src={interviewImage}
                        alt="AI Mock Interview"
                    />

                </div>

            </div>

        </section>

    );

};

export default NailEveryAnswer;