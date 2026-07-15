import React from "react";
import "./ResumeRoleTemplates.css";

const roleTemplates = [
  {
    id: "software_engineer",
    title: "Software Engineer",
    icon: "💻",
    description: "Ideal for Full Stack, Backend, or Frontend developers. Focused on system design, performance, and APIs.",
    data: {
      personal: {
        name: "Alex Carter",
        email: "alex.carter@example.com",
        phone: "+1 (555) 019-2834",
        linkedin: "linkedin.com/in/alexcarter",
        role: "Senior Full Stack Engineer"
      },
      summary: "Dynamic Software Engineer with 5+ years of experience designing and implementing scalable web applications. Expert in React, Node.js, and cloud architectures. Proven success in improving page load speeds by 40% and migrating legacy monoliths to microservices.",
      experience: [
        {
          company: "Quantum Tech Systems",
          role: "Senior Software Engineer",
          duration: "2022 - Present",
          details: "Led a team of 4 engineers in redesigning the core customer portal using React and TypeScript, boosting conversion rate by 22%.\nArchitected serverless REST APIs on AWS Lambda, reducing backend latency by 30% and saving $15k/year in hosting costs.\nEstablished CI/CD pipelines using GitHub Actions, cutting deployment time from 45 minutes to under 8 minutes."
        },
        {
          company: "Apex Web Developers",
          role: "Software Developer",
          duration: "2020 - 2022",
          details: "Developed and optimized responsive web interfaces, improving SEO rankings and Lighthouse performance by 25 points.\nCollaborated with product teams to specify, design, and build new e-commerce checkout flows."
        }
      ],
      education: [
        {
          institution: "Institute of Technology",
          degree: "B.S. in Computer Science",
          duration: "2016 - 2020"
        }
      ],
      skills: ["React", "JavaScript", "TypeScript", "Node.js", "Express", "HTML5/CSS3", "AWS (S3, EC2, Lambda)", "Docker", "PostgreSQL", "REST APIs", "GraphQL", "CI/CD"],
      projects: [
        {
          name: "AI-Powered Query Optimizer",
          description: "Created a developer utility that parses PostgreSQL queries and suggests indexing strategies, reducing execution times by up to 50%."
        }
      ]
    }
  },
  {
    id: "data_scientist",
    title: "Data Scientist",
    icon: "📊",
    description: "Tailored for Data Scientists, ML Engineers, and Data Analysts. Emphasizes models, ML pipelines, and statistics.",
    data: {
      personal: {
        name: "Dr. Sarah Lin",
        email: "sarah.lin@example.com",
        phone: "+1 (555) 382-9471",
        linkedin: "linkedin.com/in/sarah-lin-data",
        role: "Lead Data Scientist & ML Engineer"
      },
      summary: "Analytical and detail-oriented Data Scientist with 4+ years of experience building machine learning models and data pipelines. Proficient in Python, TensorFlow, and SQL. Adept at turning complex datasets into actionable business intelligence.",
      experience: [
        {
          company: "DataCorp Analytics",
          role: "Lead Data Scientist",
          duration: "2023 - Present",
          details: "Developed and deployed a customer churn prediction model using PyTorch, reducing churn by 18% and retaining $2M in annual revenue.\nDesigned ETL pipelines in Apache Spark, processing over 10TB of daily user interaction data for business dashboards.\nSpearheaded a company-wide migration to MLOps pipelines using MLflow, reducing model deployment time by 60%."
        },
        {
          company: "Insight Solutions",
          role: "Data Analyst",
          duration: "2021 - 2023",
          details: "Performed statistical analysis and A/B testing on pricing models, resulting in a 7% increase in average order value.\nAutomated reporting tasks using Python and SQL, saving the finance team 12 hours per week."
        }
      ],
      education: [
        {
          institution: "Metropolitan University",
          degree: "M.S. in Data Science",
          duration: "2019 - 2021"
        }
      ],
      skills: ["Python", "SQL", "TensorFlow", "PyTorch", "Scikit-Learn", "Pandas", "NumPy", "Apache Spark", "Tableau", "MLOps", "A/B Testing", "AWS"],
      projects: [
        {
          name: "Real-time Fraud Detection Engine",
          description: "Built an anomaly detection model using XGBoost that analyzes transactions in real time, detecting fraudulent activities with a 99.2% accuracy rate."
        }
      ]
    }
  },
  {
    id: "product_manager",
    title: "Product Manager",
    icon: "🎯",
    description: "Great for SaaS Product Managers, Product Owners, and Growth Managers. Highlights roadmap, metrics, and leadership.",
    data: {
      personal: {
        name: "Marcus Vance",
        email: "marcus.v@example.com",
        phone: "+1 (555) 482-1928",
        linkedin: "linkedin.com/in/marcusvance-pm",
        role: "Senior Product Manager"
      },
      summary: "Strategic and user-centric Product Manager with 4 years of experience leading cross-functional teams to launch B2B SaaS products. Skilled in agile methodologies, product roadmap execution, and data-driven prioritization. Managed products generating $5M+ ARR.",
      experience: [
        {
          company: "SaaSify Global",
          role: "Product Manager (Growth)",
          duration: "2022 - Present",
          details: "Owned the onboarding product funnel, implementing interactive walk-throughs that increased user activation by 35%.\nCollaborated with engineering, design, and marketing teams to launch a new subscription tier, generating $1.2M in ARR within the first 6 months.\nConducted weekly user interviews and translated insights into a prioritized product backlog, improving Net Promoter Score (NPS) by 15 points."
        },
        {
          company: "Innovate Tech",
          role: "Associate Product Manager",
          duration: "2020 - 2022",
          details: "Gathered and analyzed user requirements for a mobile CRM application, managing the feature release cycle from concept to deployment.\nMonitored product analytics metrics (DAU/MAU) and compiled weekly performance reports for executive leadership."
        }
      ],
      education: [
        {
          institution: "State Business School",
          degree: "B.B.A. in Management Information Systems",
          duration: "2016 - 2020"
        }
      ],
      skills: ["Product Roadmap", "Agile/Scrum", "Jira", "User Research", "A/B Testing", "SQL", "Mixpanel", "Google Analytics", "Wireframing", "Stakeholder Management"],
      projects: [
        {
          name: "Internal Collaboration Dashboard",
          description: "Product-managed the development of an internal messaging tool for remote offices, improving inter-departmental communication efficiency by 40%."
        }
      ]
    }
  },
  {
    id: "ui_ux_designer",
    title: "UI/UX Designer",
    icon: "🎨",
    description: "Designed for designers, visual and product designers. Emphasizes design systems, wireframes, and prototypes.",
    data: {
      personal: {
        name: "Chloe Thorne",
        email: "chloe.designs@example.com",
        phone: "+1 (555) 739-1029",
        linkedin: "linkedin.com/in/chloethorne-design",
        role: "Senior UI/UX Designer"
      },
      summary: "Creative UI/UX Designer with 5 years of experience crafting intuitive, human-centered digital experiences across web and mobile platforms. Expert in Figma, user research, wireframing, and interactive prototyping. Passionate about beautiful interfaces and accessibility.",
      experience: [
        {
          company: "Pixel Perfect Studios",
          role: "Lead UI/UX Designer",
          duration: "2022 - Present",
          details: "Created and maintained a comprehensive multi-platform design system, accelerating development sprint velocities by 30%.\nRedesigned the checkout flow of a major retail application, resulting in a 45% reduction in cart abandonment rates.\nFacilitated 15+ usability testing sessions and integrated feedback to improve user task success rates by 25%."
        },
        {
          company: "Digital Creative Agency",
          role: "UI Designer",
          duration: "2019 - 2022",
          details: "Designed high-fidelity mockups and interactive prototypes for clients in healthcare, finance, and education sectors.\nWorked closely with frontend developers to ensure design files were translated accurately and responsive layouts functioned seamlessly."
        }
      ],
      education: [
        {
          institution: "Academy of Fine Arts",
          degree: "B.F.A. in Graphic & Interaction Design",
          duration: "2015 - 2019"
        }
      ],
      skills: ["Figma", "Adobe XD", "Sketch", "User Research", "Wireframing", "High-Fidelity Prototyping", "Design Systems", "Information Architecture", "Interaction Design", "HTML/CSS"],
      projects: [
        {
          name: "EcoTravel Mobile App",
          description: "End-to-end design of a mobile application helper for green traveling, featuring clean navigation and dark-mode optimization."
        }
      ]
    }
  },
  {
    id: "marketing_specialist",
    title: "Marketing Specialist",
    icon: "📈",
    description: "For Digital Marketers, Growth Specialists, and SEO specialists. Highlights conversion rates, SEO, and ROI metrics.",
    data: {
      personal: {
        name: "Ryan Murphy",
        email: "ryan.murphy@example.com",
        phone: "+1 (555) 912-8329",
        linkedin: "linkedin.com/in/ryanmurphy-marketing",
        role: "Digital Marketing Manager"
      },
      summary: "Results-driven Digital Marketing Specialist with 4+ years of experience managing paid acquisition, SEO, and content marketing campaigns. Managed budgets of $500k+ with a focus on maximizing ROI. Expert in search engine marketing and web analytics.",
      experience: [
        {
          company: "Growth Hackers Agency",
          role: "Digital Marketing Manager",
          duration: "2023 - Present",
          details: "Grew organic search traffic by 150% in 12 months through target keyword optimization, link-building campaigns, and content updates.\nManaged a monthly Google Ads budget of $50k, improving click-through rates (CTR) by 20% and reducing cost-per-acquisition (CPA) by 15%.\nImplemented an automated email nurture sequence in HubSpot, boosting lead-to-customer conversion by 12%."
        },
        {
          company: "Direct Sales Inc.",
          role: "Marketing Coordinator",
          duration: "2021 - 2023",
          details: "Curated social media content and managed organic channels, growing audience size by 45% and increasing engagement rates.\nCoordinated monthly newsletter campaigns and monitored analytics to optimize subject lines and layout elements."
        }
      ],
      education: [
        {
          institution: "University of Communications",
          degree: "B.A. in Marketing",
          duration: "2017 - 2021"
        }
      ],
      skills: ["SEO", "SEM (Google Ads)", "Facebook Ads Manager", "Content Marketing", "Google Analytics", "Email Marketing", "Copywriting", "A/B Testing", "HubSpot", "HTML/CSS"],
      projects: [
        {
          name: "SaaS Startup Launch Campaign",
          description: "Designed and executed a multi-channel digital launch strategy that generated 5,000+ sign-ups in 30 days."
        }
      ]
    }
  }
];

const ResumeRoleTemplates = ({ onSelectRole }) => {
  return (
    <section id="role-templates-section" className="role-templates-section">
      <div className="section-header">
        <span className="role-badge">⚡ INSTANT PRE-FILL</span>
        <h2 className="section-title">
          Job-Specific <span>Starter Profiles</span>
        </h2>
        <p className="section-subtitle">
          Select a role template to bootstrap your resume details with professional summaries, achievements, and technical skills tailored for recruiters.
        </p>
      </div>

      <div className="roles-grid">
        {roleTemplates.map((role) => (
          <div
            key={role.id}
            className="role-card"
            onClick={() => onSelectRole(role.data)}
          >
            <div className="role-card-icon">{role.icon}</div>
            <h3>{role.title}</h3>
            <p>{role.description}</p>
            <button className="load-role-btn">
              ⚡ Load Profile
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResumeRoleTemplates;
