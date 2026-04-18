const companies = [
  {
    id: "1",
    name: "FinTech Flow",
    domain: "fintechflow.io",
    description: "AI-driven cash flow forecasting for SaaS companies.",
    industry: "Fintech",
    location: "USA",
    growth_score: 85,
    signals: ["Hiring aggressively", "Recent Series B funding"],
    tech_stack: ["Stripe", "AWS", "React"],
    employee_count: "50-100"
  },
  {
    id: "2",
    name: "CyberShield AI",
    domain: "cybershield.ai",
    description: "Next-gen threat detection using behavioral analysis.",
    industry: "Cybersecurity",
    location: "USA",
    growth_score: 92,
    signals: ["Hiring VP Sales", "Exponential user growth"],
    tech_stack: ["Python", "TensorFlow", "Kubernetes"],
    employee_count: "20-50"
  },
  {
    id: "3",
    name: "SaaS Rocket",
    domain: "saasrocket.com",
    description: "Marketing automation for small businesses.",
    industry: "SaaS",
    location: "USA",
    growth_score: 45,
    signals: ["Flat growth", "Decreased hiring"],
    tech_stack: ["PHP", "Azure"],
    employee_count: "100-200"
  },
  {
    id: "4",
    name: "DataMeld",
    domain: "datameld.ai",
    description: "Data orchestration layer for modern data stacks.",
    industry: "AI SaaS",
    location: "USA",
    growth_score: 98,
    signals: ["Hiring for enterprise sales", "Series A funded by Top VCs"],
    tech_stack: ["Go", "Snowflake", "dbt"],
    employee_count: "10-20"
  }
];

const signals = {
  hiring: [
    { companyId: "1", role: "Account Executive", type: "Sales" },
    { companyId: "1", role: "Software Engineer", type: "Tech" },
    { companyId: "2", role: "VP Sales", type: "Sales" },
    { companyId: "4", role: "Head of Growth", type: "Marketing" }
  ],
  funding: [
    { companyId: "1", stage: "Series B", amount: "$20M", date: "2024-03-01" },
    { companyId: "4", stage: "Series A", amount: "$8M", date: "2024-01-15" }
  ]
};

const searchCompanies = (query) => {
  const q = query.toLowerCase();
  return companies.filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.industry.toLowerCase().includes(q) || 
    c.description.toLowerCase().includes(q)
  );
};

const getCompanySignals = (id) => {
  return {
    hiring: signals.hiring.filter(s => s.companyId === id),
    funding: signals.funding.find(s => s.companyId === id)
  };
};

module.exports = { searchCompanies, getCompanySignals, companies };
