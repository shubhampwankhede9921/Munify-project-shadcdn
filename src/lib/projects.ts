export interface Project {
  id: number
  name: string
  municipality: string
  state: string
  image: string
  fundRequired: number
  currentFunding: number
  timeline: string
  category: string
  status: string
  description: string
  progress: number
  investors: number
  daysLeft: number
  creditRating?: string
  riskLevel?: string
  documents?: Array<{
    name: string
    type: string
    size: string
  }>
  media?: Array<{
    type: string
    title: string
    duration?: string
    count?: number
  }>
  qa?: Array<{
    id: number
    question: string
    answer: string
    askedBy: string
    answeredBy: string
    date: string
  }>
  updates?: Array<{
    id: number
    title: string
    description: string
    date: string
    type: string
  }>
}

export const mockProjects: Project[] = [
  {
    id: 1,
    name: "Smart Water Management System",
    municipality: "Mumbai Municipal Corporation",
    state: "Maharashtra",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=200&fit=crop&crop=center",
    fundRequired: 50000000,
    currentFunding: 35000000,
    timeline: "6 months",
    category: "Infrastructure",
    status: "Live",
    description: "Implementation of IoT-based water monitoring and management system across the city to improve water distribution efficiency and reduce wastage.",
    progress: 70,
    investors: 15,
    daysLeft: 45,
    creditRating: "AA+",
    riskLevel: "Low",
    documents: [
      { name: "Project Proposal", type: "PDF", size: "2.3 MB" },
      { name: "Financial Projections", type: "Excel", size: "1.1 MB" },
      { name: "Technical Specifications", type: "PDF", size: "4.2 MB" },
      { name: "Environmental Impact Assessment", type: "PDF", size: "3.1 MB" }
    ],
    media: [
      { type: "video", title: "Project Overview", duration: "5:30" },
      { type: "image", title: "Site Photos", count: 12 },
      { type: "audio", title: "Municipal Commissioner Interview", duration: "8:45" }
    ],
    qa: [
      {
        id: 1,
        question: "What is the expected ROI for this project?",
        answer: "The project is expected to generate 15-20% annual returns through improved water efficiency and reduced operational costs.",
        askedBy: "Investment Fund Manager",
        answeredBy: "Municipal Commissioner",
        date: "2 days ago"
      },
      {
        id: 2,
        question: "What are the environmental benefits?",
        answer: "The system will reduce water wastage by 30% and improve monitoring of water quality in real-time.",
        askedBy: "Environmental Consultant",
        answeredBy: "Project Director",
        date: "1 week ago"
      }
    ],
    updates: [
      {
        id: 1,
        title: "Site Survey Completed",
        description: "Initial site survey and feasibility study completed successfully.",
        date: "1 week ago",
        type: "progress"
      },
      {
        id: 2,
        title: "New Funding Commitment",
        description: "Green Energy Fund committed ₹5Cr to the project.",
        date: "3 days ago",
        type: "funding"
      }
    ]
  },
  {
    id: 2,
    name: "Solar Street Lighting Project",
    municipality: "Delhi Municipal Corporation",
    state: "Delhi",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=200&fit=crop&crop=center",
    fundRequired: 25000000,
    currentFunding: 18000000,
    timeline: "4 months",
    category: "Renewable Energy",
    status: "Live",
    description: "Installation of solar-powered street lights in residential areas to improve safety and reduce energy costs.",
    progress: 72,
    investors: 8,
    daysLeft: 30,
    creditRating: "A+",
    riskLevel: "Low",
    documents: [
      { name: "Project Proposal", type: "PDF", size: "1.8 MB" },
      { name: "Financial Projections", type: "Excel", size: "0.9 MB" },
      { name: "Technical Specifications", type: "PDF", size: "3.2 MB" }
    ],
    media: [
      { type: "video", title: "Project Overview", duration: "4:15" },
      { type: "image", title: "Site Photos", count: 8 }
    ],
    qa: [
      {
        id: 1,
        question: "What is the maintenance cost for solar lights?",
        answer: "Annual maintenance cost is approximately 5% of the initial investment, significantly lower than traditional street lights.",
        askedBy: "City Planner",
        answeredBy: "Project Director",
        date: "3 days ago"
      }
    ],
    updates: [
      {
        id: 1,
        title: "Pilot Installation Complete",
        description: "Successfully installed 50 solar street lights in Phase 1 area.",
        date: "2 weeks ago",
        type: "progress"
      }
    ]
  },
  {
    id: 3,
    name: "Waste Management Modernization",
    municipality: "Bangalore City Corporation",
    state: "Karnataka",
    image: "https://images.unsplash.com/photo-1581578731548-c6a0c3f2f4c1?w=400&h=200&fit=crop&crop=center",
    fundRequired: 75000000,
    currentFunding: 45000000,
    timeline: "8 months",
    category: "Environment",
    status: "Live",
    description: "Modern waste collection and processing facilities with recycling units to improve city cleanliness and sustainability.",
    progress: 60,
    investors: 22,
    daysLeft: 60,
    creditRating: "AA",
    riskLevel: "Medium",
    documents: [
      { name: "Project Proposal", type: "PDF", size: "3.1 MB" },
      { name: "Financial Projections", type: "Excel", size: "1.5 MB" },
      { name: "Technical Specifications", type: "PDF", size: "5.2 MB" },
      { name: "Environmental Impact Assessment", type: "PDF", size: "4.1 MB" }
    ],
    media: [
      { type: "video", title: "Project Overview", duration: "6:45" },
      { type: "image", title: "Site Photos", count: 15 },
      { type: "audio", title: "Mayor Interview", duration: "12:30" }
    ],
    qa: [
      {
        id: 1,
        question: "How will this project impact local employment?",
        answer: "The project will create 200+ direct jobs and 500+ indirect employment opportunities in waste management and recycling sectors.",
        askedBy: "Local Business Owner",
        answeredBy: "Mayor",
        date: "1 week ago"
      }
    ],
    updates: [
      {
        id: 1,
        title: "Land Acquisition Complete",
        description: "Successfully acquired 10 acres of land for the waste processing facility.",
        date: "2 weeks ago",
        type: "progress"
      }
    ]
  },
  // Funded Projects
  {
    id: 4,
    name: "Smart Traffic Management System",
    municipality: "Delhi Municipal Corporation",
    state: "Delhi",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&crop=center",
    fundRequired: 75000000,
    currentFunding: 75000000,
    timeline: "8 months",
    category: "Infrastructure",
    status: "Completed",
    description: "AI-powered traffic management system with real-time monitoring and optimization to reduce congestion and improve traffic flow.",
    progress: 100,
    investors: 25,
    daysLeft: 0,
    creditRating: "AA+",
    riskLevel: "Low",
    documents: [
      { name: "Project Completion Report", type: "PDF", size: "3.2 MB" },
      { name: "Performance Analysis", type: "Excel", size: "1.8 MB" },
      { name: "ROI Analysis", type: "PDF", size: "2.1 MB" },
      { name: "Impact Assessment", type: "PDF", size: "2.8 MB" }
    ],
    media: [
      { type: "video", title: "Project Completion Video", duration: "7:20" },
      { type: "image", title: "Before/After Photos", count: 20 },
      { type: "audio", title: "Traffic Commissioner Interview", duration: "10:15" }
    ],
    qa: [
      {
        id: 1,
        question: "What was the actual ROI achieved?",
        answer: "The project achieved an 18.5% ROI, exceeding the projected 15% target through improved traffic flow and reduced fuel consumption.",
        askedBy: "Investment Analyst",
        answeredBy: "Traffic Commissioner",
        date: "1 month ago"
      }
    ],
    updates: [
      {
        id: 1,
        title: "Project Successfully Completed",
        description: "All traffic management systems are now operational and showing 35% reduction in congestion.",
        date: "2 months ago",
        type: "progress"
      }
    ]
  },
  {
    id: 5,
    name: "Green Energy Initiative",
    municipality: "Bangalore City Corporation",
    state: "Karnataka",
    image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=400&h=200&fit=crop&crop=center",
    fundRequired: 50000000,
    currentFunding: 50000000,
    timeline: "6 months",
    category: "Renewable Energy",
    status: "Completed",
    description: "Solar panel installation across municipal buildings and street lighting to reduce carbon footprint and energy costs.",
    progress: 100,
    investors: 18,
    daysLeft: 0,
    creditRating: "A+",
    riskLevel: "Low",
    documents: [
      { name: "Project Completion Report", type: "PDF", size: "2.8 MB" },
      { name: "Energy Generation Report", type: "Excel", size: "1.5 MB" },
      { name: "Environmental Impact", type: "PDF", size: "2.3 MB" }
    ],
    media: [
      { type: "video", title: "Solar Installation Process", duration: "5:45" },
      { type: "image", title: "Installation Photos", count: 15 }
    ],
    qa: [
      {
        id: 1,
        question: "How much clean energy is being generated?",
        answer: "The project is generating 2.5MW of clean energy, powering 15 municipal buildings and 500 street lights.",
        askedBy: "Environmental Consultant",
        answeredBy: "Energy Director",
        date: "2 months ago"
      }
    ],
    updates: [
      {
        id: 1,
        title: "Solar Installation Complete",
        description: "All solar panels installed and connected to the grid, generating 2.5MW clean energy.",
        date: "3 months ago",
        type: "progress"
      }
    ]
  },
  {
    id: 6,
    name: "Digital Governance Platform",
    municipality: "Mumbai Municipal Corporation",
    state: "Maharashtra",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop&crop=center",
    fundRequired: 30000000,
    currentFunding: 30000000,
    timeline: "4 months",
    category: "Technology",
    status: "Completed",
    description: "Digital platform for citizen services and municipal operations to improve efficiency and citizen satisfaction.",
    progress: 100,
    investors: 12,
    daysLeft: 0,
    creditRating: "AA",
    riskLevel: "Low",
    documents: [
      { name: "Platform Documentation", type: "PDF", size: "4.1 MB" },
      { name: "User Adoption Report", type: "Excel", size: "1.2 MB" },
      { name: "Performance Metrics", type: "PDF", size: "2.5 MB" }
    ],
    media: [
      { type: "video", title: "Platform Demo", duration: "6:30" },
      { type: "image", title: "Interface Screenshots", count: 10 }
    ],
    qa: [
      {
        id: 1,
        question: "What is the user adoption rate?",
        answer: "The platform has achieved 85% user adoption among citizens, with 40% improvement in service delivery efficiency.",
        askedBy: "Digital Transformation Expert",
        answeredBy: "IT Director",
        date: "1 month ago"
      }
    ],
    updates: [
      {
        id: 1,
        title: "Platform Live and Operational",
        description: "Digital governance platform is now live with 85% citizen adoption rate.",
        date: "2 months ago",
        type: "progress"
      }
    ]
  },
  {
    id: 7,
    name: "Water Treatment Plant",
    municipality: "Chennai Corporation",
    state: "Tamil Nadu",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=200&fit=crop&crop=center",
    fundRequired: 120000000,
    currentFunding: 120000000,
    timeline: "12 months",
    category: "Water Management",
    status: "Completed",
    description: "Advanced water treatment facility with capacity for 50MLD to provide clean drinking water to residents.",
    progress: 100,
    investors: 35,
    daysLeft: 0,
    creditRating: "AA+",
    riskLevel: "Low",
    documents: [
      { name: "Plant Commissioning Report", type: "PDF", size: "5.2 MB" },
      { name: "Water Quality Analysis", type: "Excel", size: "2.1 MB" },
      { name: "Capacity Utilization", type: "PDF", size: "3.4 MB" }
    ],
    media: [
      { type: "video", title: "Plant Tour", duration: "8:15" },
      { type: "image", title: "Plant Photos", count: 25 },
      { type: "audio", title: "Plant Manager Interview", duration: "12:45" }
    ],
    qa: [
      {
        id: 1,
        question: "How many residents are benefiting?",
        answer: "The plant is providing clean water to 200,000 residents daily, meeting all quality standards.",
        askedBy: "Public Health Expert",
        answeredBy: "Plant Manager",
        date: "2 months ago"
      }
    ],
    updates: [
      {
        id: 1,
        title: "Water Treatment Plant Operational",
        description: "Plant is now fully operational, providing clean water to 200,000 residents.",
        date: "4 months ago",
        type: "progress"
      }
    ]
  }
]

export const getProjectById = (id: number): Project | undefined => {
  return mockProjects.find(project => project.id === id)
}
