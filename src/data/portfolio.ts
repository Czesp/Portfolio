export type AttachmentType = "image" | "presentation" | "stl" | "cad" | "pdf";

export interface PortfolioAttachment {
  label: string;
  url: string;
  type: AttachmentType;
}

export interface PortfolioEntry {
  slug: string;
  title: string;
  organization: string;
  period: string;
  category: string;
  summary: string;
  details: string[];
  skills: string[];
  attachments: PortfolioAttachment[];
}

export type Experience = PortfolioEntry;
export type Project = PortfolioEntry;

// Resume-sourced content. Add a real headshot and LinkedIn URL when available.
// Attachments can point to files in /public or to externally hosted documents.
export const profile = {
  name: "Prashant Bhattarai",
  firstName: "Prashant",
  lastName: "Bhattarai",
  role: "Mechanical Engineering Student",
  tagline: "Engineering motion. Building what comes next.",
  summary:
    "A mechanical engineering student at Mississippi State University working at the intersection of vehicle systems, robotics, and advanced manufacturing. From CAD assemblies to autonomous platforms, I connect mechanical design with intelligent systems.",
  location: "Starkville, Mississippi",
  email: "prashantbhattarai224@gmail.com",
  phone: "+1 662 518 1958",
  github: "https://github.com/prashant-bhattarai",
  linkedin: "https://www.linkedin.com/in/prashant-bhattarai2005",
  headshot: "/Portfolio/portrait.jpeg",
  resume: "/Portfolio/resume_Bhattarai_Prashant.pdf",
  education: {
    institution: "Mississippi State University",
    degree: "B.S. in Mechanical Engineering",
    gpa: "4.00 / 4.00",
    graduation: "May 2028",
    coursework: [
      "Modeling & Manufacturing",
      "Engineering Mechanics",
      "Circuits",
      "Fluid Mechanics",
      "Thermodynamics",
    ],
  },
};

export const experiences: Experience[] = [
  {
    slug: "ecocar-vehicle-integration",
    title: "Co-Lead, Vehicle Hardware Integration",
    organization: "EcoCAR Innovation Challenge · Mississippi State University",
    period: "Aug 2026 — Present",
    category: "Vehicle integration",
    summary:
      "Engineering vehicle system integrations and a collaborative CAD workflow for the EcoCAR Innovation Challenge.",
    details: [
      "Engineer EcoCAR vehicle system integrations in Siemens NX.",
      "Deploy a custom GitLab version control workflow to manage shared CAD assemblies across the university’s high-performance computing environment.",
    ],
    skills: ["Siemens NX", "Vehicle Systems", "GitLab", "CAD Assembly"],
    attachments: [],
  },
  {
    slug: "cavs-autonomous-vehicles",
    title: "Undergraduate Researcher",
    organization: "Center for Advanced Vehicular Systems · Mississippi State University",
    period: "Jan 2026 — Present",
    category: "Robotics & autonomy",
    summary:
      "Developing autonomous vehicle research from simulation to Jetson-powered hardware, with a focus on perception, navigation, and mechanical integration.",
    details: [
      "Lead UAV-assisted map recovery research for autonomous ground vehicles, achieving an 80% success rate across 50 MAVS simulation trials before deploying hardware on a Jetson-powered RC car platform using Nav2 and DLIO LiDAR-IMU SLAM.",
      "Engineer a perception-based leader-follower architecture for off-road convoys with minimal vehicle-to-vehicle communication. Use camera-LiDAR fusion and advance from ArUco to machine-learning vehicle detection while maintaining independent local autonomy.",
      "Design mechanical sensor mounts and server heat exhausts for military-grade autonomous vehicles in SolidWorks. Execute embedded hardware integration of Jetson, LiDAR, camera, and IMU on 1/8-scale RC platforms using design-for-manufacturing principles.",
      "Benchmark centralized and decentralized multi-agent navigation using CBS path planning, MAVS, and the NATURE stack.",
    ],
    skills: ["ROS2", "Nav2", "LiDAR / IMU", "NVIDIA Jetson", "SolidWorks", "MAVS"],
    attachments: [],
  },
  {
    slug: "additive-manufacturing-research",
    title: "Undergraduate Research Assistant",
    organization: "Industrial & Systems Engineering · Mississippi State University",
    period: "Aug 2025 — Nov 2025",
    category: "Advanced manufacturing",
    summary:
      "Designing structural lattice components across FDM, resin, and metal additive manufacturing to support ceramic nanocomposite research.",
    details: [
      "Design structural lattice components using FDM, resin, and metal additive manufacturing to directly support BCM research on improving ceramic nanocomposite fracture toughness.",
      "Manage lab procurement and technical additive manufacturing workshops alongside research activities.",
    ],
    skills: ["Lattice Design", "FDM", "Resin Printing", "Metal Additive Manufacturing"],
    attachments: [],
  },
  {
    slug: "usda-product-design",
    title: "Product Design Research Intern",
    organization: "USDA REEU — AI2F Summer Research Program · Mississippi State University",
    period: "Jun 2025 — Aug 2025",
    category: "Product design",
    summary:
      "Taking a modular, AI-enabled field device from concept to a fully integrated hardware prototype.",
    details: [
      "Engineer a modular, AI-enabled field device from concept to deployment using SolidWorks.",
      "Deliver a fully integrated hardware prototype for downstream PhD research and present findings at an undergraduate symposium.",
    ],
    skills: ["SolidWorks", "Product Design", "Hardware Prototyping", "Research"],
    attachments: [],
  },
  {
    slug: "istvs-localization-research",
    title: "Undergraduate Research Assistant",
    organization: "ISTVS Student Chapter · Mississippi State University",
    period: "Feb 2025 — Apr 2025",
    category: "Vehicle localization",
    summary:
      "Evaluating localization performance on a Polaris MRZR in off-road environments.",
    details: [
      "Benchmark GPS-only and GPS/IMU sensor-fusion localization on a Polaris MRZR in off-road environments.",
    ],
    skills: ["GPS", "IMU", "Sensor Fusion", "Off-Road Vehicles"],
    attachments: [],
  },
];

export const projects: Project[] = [
  {
    slug: "robotics-perception",
    title: "Computer Vision & Robotics Perception",
    organization: "Engineering project",
    period: "",
    category: "Perception systems",
    summary:
      "Real-time pose estimation for autonomous mobile robot docking, paired with a vision-based safety interlock.",
    details: [
      "Develop a C++ perception pipeline for AMR docking using OpenCV’s solvePnP on multi-marker ArUco grids for real-time 6-DoF pose estimation under heavy occlusion.",
      "Fuse pose estimates with a 6-state Kalman filter to eliminate tracking jitter.",
      "Build a vision-based safety interlock using MOG2 background subtraction and centroid tracking, cutting the processed pixel area by over 60%.",
    ],
    skills: ["C++", "OpenCV", "ArUco", "Kalman Filtering", "Pose Estimation"],
    attachments: [],
  },
  {
    slug: "synthetic-data-object-detection",
    title: "Synthetic Data & Object Detection",
    organization: "Engineering project",
    period: "Ongoing",
    category: "Simulation to reality",
    summary:
      "Building a synthetic-data pipeline and object detector for fallen boxes, with a ROS2 inference node in development.",
    details: [
      "Build a synthetic-data pipeline in NVIDIA Isaac Sim Replicator and train a YOLO11s detector for fallen boxes, reaching 0.99 validation mAP50–95.",
      "Diagnose a simulation-to-real-world gap and iterate on the dataset while building a ROS2 inference node.",
    ],
    skills: ["NVIDIA Isaac Sim", "YOLO11", "Python", "ROS2", "Synthetic Data"],
    attachments: [],
  },
  {
    slug: "nonlinear-model-predictive-control",
    title: "Nonlinear Model Predictive Control",
    organization: "Engineering project",
    period: "Ongoing",
    category: "Dynamics & control",
    summary:
      "Modeling an inverted pendulum from first principles and developing a constrained nonlinear controller for hardware deployment.",
    details: [
      "Derive nonlinear state-space dynamics for an inverted pendulum from first-principles mechanics and build a custom RK4 physics simulation engine.",
      "Formulate a discrete-time nonlinear model predictive controller in CasADi to solve constrained real-time optimization problems.",
      "Enforce state and input limits in preparation for hardware deployment.",
    ],
    skills: ["Python", "NumPy", "CasADi", "RK4", "Nonlinear Control"],
    attachments: [],
  },
];

export const leadership: PortfolioEntry[] = [
  {
    slug: "advanced-manufacturing-society",
    title: "Chief of Additive Manufacturing",
    organization: "Advanced Manufacturing Society",
    period: "Feb 2025 — Present",
    category: "Leadership & education",
    summary:
      "Leading hands-on technical workshops and introducing 250+ students to advanced fabrication opportunities.",
    details: [
      "Lead hands-on workshops in applied engineering, additive manufacturing, 3D modeling, and manual/CNC machining.",
      "Expose 250+ students to advanced industry fabrication opportunities and SolidWorks certification training.",
    ],
    skills: ["Technical Workshops", "Additive Manufacturing", "CNC", "SolidWorks"],
    attachments: [],
  },
  {
    slug: "istvs-vice-president",
    title: "Vice President",
    organization: "International Society for Terrain-Vehicle Systems",
    period: "Apr 2025 — Present",
    category: "Leadership & terramechanics",
    summary:
      "Co-organizing the first ISTVS competition and exploring wheel performance through design and simulation.",
    details: [
      "Co-organize the first ISTVS competition with Virginia Tech and Pretoria.",
      "Model wheel designs in SolidWorks and execute YADE DEM simulations to analyze rolling resistance and optimal angular velocity for maximum drawbar pull.",
    ],
    skills: ["SolidWorks", "YADE DEM", "Wheel Design", "Terramechanics"],
    attachments: [],
  },
];

export const skillGroups = [
  {
    title: "Mechanical & Manufacturing",
    skills: ["SolidWorks (CSWP)", "Siemens NX", "YADE DEM", "FEA", "GD&T", "DFM", "CNC", "Rapid Prototyping"],
  },
  {
    title: "Robotics & Autonomy",
    skills: ["ROS2", "NATURE", "Nav2", "MAVS", "Sensor Fusion", "Hardware Integration", "Path Planning", "SLAM"],
  },
  {
    title: "Programming & Software",
    skills: ["Python", "C / C++", "Linux", "Docker / Podman", "Git", "OpenCV", "NumPy", "CasADi", "Embedded Systems"],
  },
];
