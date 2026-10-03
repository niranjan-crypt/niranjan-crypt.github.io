// Projects Data Store for Niranjan Krishnakumar (niranjan-crypt)
// Real projects fetched from GitHub & academic research

window.PORTFOLIO_PROJECTS = [
  {
    id: "hyperspectral-face-xai",
    title: "Hyperspectral Face Identification & Explainable AI",
    shortTitle: "Hyperspectral Face XAI",
    category: "vision",
    categoryName: "Computer Vision & DL",
    badge: "B.Tech Capstone Project",
    status: "Featured Research",
    tagline: "End-to-end 1200+ band spectral-spatial feature fusion with unit hyperspherical metric learning and dual-domain XAI.",
    description: "Resolves fundamental vulnerabilities of RGB biometrics (deepfakes, 2D/3D spoofing, illumination shifts) by capturing subsurface biological tissue reflectance across 400-1000 nm. Features metaheuristic band selection reducing 1200+ bands to 5-20 optimal channels, a 3D-CNN with residual spatial attention, and unit hyperspherical metric embeddings (UISM-Net on S^127) optimized with ArcFace angular margin loss. Explainability is delivered via Spectral SHAP and spatial Grad-CAM++/LIME.",
    repoUrl: "https://github.com/niranjan-crypt/Hyperspectral-Face-Identification-XAI",
    stars: 0,
    language: "Python / Jupyter",
    tags: ["Hyperspectral Imaging", "3D-CNN", "ArcFace (S^127)", "Explainable AI (XAI)", "Spectral SHAP", "Grad-CAM++", "Raspberry Pi 4", "TensorFlow"],
    metrics: [
      { label: "Spectral Bands", value: "1200+ (400-1000nm)" },
      { label: "Optimal Subset", value: "5 - 20 Bands" },
      { label: "Embedding Space", value: "Unit Sphere S^127" },
      { label: "Edge Target", value: "Raspberry Pi 4 (INT8)" }
    ],
    mathFormula: "\\mathcal{L}_{ArcFace} = -\\frac{1}{N}\\sum_{i=1}^N \\log \\frac{e^{s\\cos(\\theta_{y_i} + m)}}{e^{s\\cos(\\theta_{y_i} + m)} + \\sum_{j \\neq y_i} e^{s\\cos \\theta_j}}",
    highlights: [
      "Metaheuristic band selection (PSO, GA, GWO) driven by 6-component multi-objective fitness formulation.",
      "UISM-Net architecture prevents catastrophic feature collapse in small-sample biometric regimes.",
      "Dual-domain XAI: Spectral band attribution (SHAP) + Spatial facial landmark saliency (Grad-CAM++).",
      "Post-training FP16 & INT8 quantization achieving sub-second latency on Raspberry Pi 4 Model B."
    ]
  },
  {
    id: "mri-otsu-pso-ga",
    title: "Hybrid PSO-GA Multilevel Otsu MRI Segmentation",
    shortTitle: "Hybrid PSO-GA MRI Segmentation",
    category: "vision",
    categoryName: "Computer Vision & Optimization",
    badge: "Bio-Inspired Metaheuristics",
    status: "Benchmarked",
    tagline: "Synergistic PSO-GA metaheuristic framework solving exponential complexity in multilevel Otsu brain MRI segmentation.",
    description: "Addresses the exponential O(L^K) combinatorial explosion of exhaustive Otsu threshold search on brain MRI scans. Combines the rapid directional exploitation of Particle Swarm Optimization with the diversity-preserving recombination and mutation operators of Genetic Algorithms. Extracted tissue partitions are subjected to morphological and Gray-Level Co-occurrence Matrix (GLCM) feature extraction, followed by downstream Random Forest validation for clinical tumor/tissue classification.",
    repoUrl: "https://github.com/niranjan-crypt/Hybrid-PSO-GA-Based-Multilevel-Otsu-MRI-Segmentation-with-Machine-Learning-Validation",
    stars: 0,
    language: "Python",
    tags: ["Otsu Thresholding", "Particle Swarm (PSO)", "Genetic Algorithm (GA)", "GLCM Texture", "Differential Evolution", "Random Forest", "Scikit-Learn"],
    metrics: [
      { label: "Complexity", value: "O(L^K) -> Linear Epochs" },
      { label: "Heuristics", value: "PSO + GA + DE" },
      { label: "Validation", value: "Random Forest" },
      { label: "Descriptors", value: "GLCM + Morphological" }
    ],
    mathFormula: "\\sigma_B^2(t_1, \\dots, t_K) = \\sum_{k=0}^{K} \\omega_k (\\mu_k - \\mu_T)^2, \\quad V_i^{(t+1)} = w V_i^{(t)} + c_1 r_1 (P_{best} - X_i) + c_2 r_2 (G_{best} - X_i)",
    highlights: [
      "Two-stage interleaved hybrid architecture prevents premature local optima stagnation.",
      "Multi-run quantitative benchmarking against standalone PSO, GA, and Differential Evolution.",
      "Downstream clinical validation utilizing GLCM contrast, dissimilarity, homogeneity, and energy.",
      "Rigorous statistical evaluation across multi-slice whole-brain MRI datasets."
    ]
  },
  {
    id: "intellipq-grid-ai",
    title: "IntelliPQ: AI-Based Power Quality Monitoring & Fault Detection",
    shortTitle: "IntelliPQ Power Quality AI",
    category: "energy",
    categoryName: "Smart Grid & Energy AI",
    badge: "Smart Grid Intelligence",
    status: "Neuro-Symbolic Platform",
    tagline: "Neuro-symbolic arbitration combining DSP, IEEE standards, and 1D-CNN + BiLSTM deep learning for real-time grid diagnostics.",
    description: "Smart grid monitoring platform that arbitrates between physics-based deterministic rules (IEEE 1159 & IEEE 519) and deep learning (1D-CNN + Bidirectional LSTM). Built with an interactive waveform synthesizer, drag-and-drop CSV ingestion, FFT amplitude spectrum isolation, real-time THD and Crest Factor calculation, and an automated audit certificate generator with actionable engineering remedies.",
    repoUrl: "https://github.com/niranjan-crypt/IntelliPQ-AI-Based-Power-Quality-Monitoring-Fault-Detection",
    stars: 0,
    language: "Python / Streamlit",
    tags: ["Smart Grid", "1D-CNN + BiLSTM", "DSP / FFT", "IEEE 1159 / 519", "Neuro-Symbolic AI", "TensorFlow", "Streamlit", "Fault Detection"],
    metrics: [
      { label: "Standards", value: "IEEE 1159 & IEEE 519" },
      { label: "Neural Model", value: "1D-CNN + BiLSTM" },
      { label: "DSP Metrics", value: "THD, Crest, RMS, FFT" },
      { label: "Interface", value: "Real-time Streamlit HUD" }
    ],
    mathFormula: "THD = \\frac{\\sqrt{\\sum_{h=2}^{\\infty} V_h^2}}{V_1} \\times 100\\%, \\quad Crest = \\frac{V_{peak}}{V_{RMS}}",
    highlights: [
      "Neuro-symbolic arbitration layer resolves model conflict through consensus and critical parameter override.",
      "DSP engine with Fast Fourier Transform spectrum isolation and harmonic distortion tracking.",
      "Classifies sags, swells, harmonic distortion, interruptions, flickers, and transients.",
      "Generates prescriptive utility procedures and downloadable formal diagnostic audit certificates."
    ]
  },
  {
    id: "kinosync-smart-glove",
    title: "KinoSync: Cyber-Physical Smart Glove & 3D Digital Twin",
    shortTitle: "KinoSync 3D Digital Twin",
    category: "iot",
    categoryName: "Cyber-Physical Systems & IoT",
    badge: "Embedded Silicon & Teleop",
    status: "Hardware + 3D Twin",
    tagline: "Real-time BLE 5.0 kinematic telemetry dashboard with continuous 5-finger articulation and 3D skeletal digital twin.",
    description: "Cyber-physical teleoperation and physical therapy platform connecting wirelessly over Bluetooth Low Energy (BLE 5.0) to an ESP32-powered sensor glove (SDV Glove). Renders a real-time interactive 3D digital twin hand mapped to live finger articulation, calculates continuous joint flexion (0-90 deg), filters jitter via +12% threshold hysteresis, visualizes PPG pulse rate, and records clinical progress sessions.",
    repoUrl: "https://github.com/niranjan-crypt/KinoSync-Cyber-Physical-Smart-Glove-Telemetry-3D-Digital-Twin-System",
    stars: 0,
    language: "Dart / Flutter / C++",
    tags: ["Cyber-Physical Systems", "ESP32", "BLE 5.0 GATT", "3D Digital Twin", "Flutter", "Kinematics", "PPG Sensor", "Biomechanical Telemetry"],
    metrics: [
      { label: "Microcontroller", value: "ESP32 (FreeRTOS)" },
      { label: "Protocol", value: "BLE 5.0 GATT Notify" },
      { label: "Kinematic Dials", value: "5 Fingers (0°-90°)" },
      { label: "Digital Twin", value: "Interactive 3D Skeletal" }
    ],
    mathFormula: "\\theta_k = \\text{flexPercent}_k \\times 0.9 \\quad (0\\% \\to 0^\\circ, \\, 100\\% \\to 90^\\circ)",
    highlights: [
      "Low-latency BLE GATT data streaming with dynamic packet serialization.",
      "Interactive 3D skeletal hand animation synchronized with continuous joint flexion.",
      "Dominant-finger detection incorporating +12% hysteresis to eliminate biological sensor jitter.",
      "Integrated PPG photoplethysmography pulse sensor with rhythmic cardiac visualizer."
    ]
  },
  {
    id: "pinn-mppt-solar",
    title: "Physics-Informed ANN & Markov Chain MPPT for Solar PV",
    shortTitle: "Physics-Informed MPPT",
    category: "energy",
    categoryName: "Physics-Informed DL & Energy",
    badge: "PINN & Power Electronics",
    status: "Simulink & MATLAB",
    tagline: "Semiconductor physics embedded into deep neural features with 2D Markov chain stochastic weather simulation.",
    description: "Next-generation Maximum Power Point Tracking (MPPT) framework that solves steady-state power oscillations and sluggish tracking in traditional P&O/InC algorithms. Constructs 6 physically derived semiconductor features based on diode logarithmic behavior and thermal derating. Prevents data leakage with group-based cross-validation, validates generalization via Bayesian Regularization and Cohen's d tests, and stress-tests controllers using a 300-state 2D Markov chain weather generator.",
    repoUrl: "https://github.com/niranjan-crypt/Physics-Informed-ANN-Based-MPPT-with-Markov-Chain-Based-Dynamic-Validation-for-Photovoltaic-Systems",
    stars: 0,
    language: "MATLAB / Simulink",
    tags: ["Physics-Informed Neural Nets", "MPPT", "Photovoltaics", "Markov Chain", "Bayesian Regularization", "Simulink", "Statistical Validation"],
    metrics: [
      { label: "Physics Features", value: "6 Formulated Dimensions" },
      { label: "Weather States", value: "300 Markov States" },
      { label: "Effect Size", value: "Cohen's d < 0.20" },
      { label: "Simulation", value: "Single-Diode Newton-Raphson" }
    ],
    mathFormula: "\\mathbf{X} = \\left[ G, T, \\ln(G), \\sqrt{G}, (T - T_{\\text{ref}})^2, \\frac{G}{G_{\\text{ref}}}(T - T_{\\text{ref}}) \\right]",
    highlights: [
      "Direct environmental-to-operating mapping (G, T) -> (Vmpp, Impp) for instantaneous zero-oscillation tracking.",
      "Incorporates diode equation physics: open-circuit voltage logarithmic scaling and temperature derating.",
      "Group-based cross-validation ensuring zero data contamination between augmented clusters.",
      "Full Simulink co-simulation benchmarking against Perturb & Observe, Incremental Conductance, and FLC."
    ]
  },
  {
    id: "ieee-congestion-management",
    title: "Hybrid Optimization for Congestion Management in Deregulated Power Systems",
    shortTitle: "IEEE EPREC-2026 Paper",
    category: "energy",
    categoryName: "Optimization & Grid Systems",
    badge: "IEEE Published Paper",
    status: "Published Author",
    tagline: "Tri-hybrid metaheuristic (OOA + KHA + SHO) with PTDF sensitivity modeling presented at IEEE EPREC-2026.",
    description: "Published research addressing transmission line congestion in modern open-access deregulated grids. Leverages the Power Transfer Distribution Factor (PTDF) sensitivity matrix to model DC power flow dynamics. Formulates a hierarchical multi-objective penalty function prioritizing grid security, minimizing costly load shedding, reducing generator schedule disruption, and cutting rescheduling expenses through an adaptive tri-hybrid metaheuristic optimizer (Orcas, Krill Herd, and Spotted Hyena).",
    repoUrl: "https://github.com/niranjan-crypt/Hybrid-Optimization-for-Congestion-Management-in-Deregulated-Power-Systems",
    doiUrl: "https://doi.org/10.1109/EPREC66546.2026.11412040",
    conference: "6th IEEE International Conference on Electric Power and Renewable Energy (EPREC-2026), IIT Bhilai",
    stars: 0,
    language: "Python / Jupyter",
    tags: ["IEEE EPREC-2026", "PTDF Sensitivity", "Congestion Management", "Metaheuristics (OOA, KHA, SHO)", "Deregulated Power", "IEEE 14/30 Bus"],
    metrics: [
      { label: "Publication", value: "IEEE EPREC-2026" },
      { label: "DOI", value: "10.1109/EPREC66546..." },
      { label: "Formulation", value: "PTDF Sensitivity C = A·B" },
      { label: "Metaheuristics", value: "OOA + KHA + SHO Tri-Hybrid" }
    ],
    mathFormula: "\\mathbf{C} = \\mathbf{A} \\cdot \\mathbf{B}, \\quad \\min J = 10^7 \\sum (P_{Li} - P_{Li}^{\\text{init}})^2 + 10^5 \\sum |\\Delta P_{Gi}| + 0.1 \\sum C_i |\\Delta P_{Gi}| + \\text{Penalties}",
    highlights: [
      "Presented and published at IEEE EPREC-2026 organized by IIT Bhilai.",
      "PTDF sensitivity modeling captures transmission line active power flows under dynamic generator redispatch.",
      "Novel tri-hybrid coupling OOA (Orcas), KHA (Krill Herd), and SHO (Spotted Hyena) with adaptive transition probabilities.",
      "Validated on standard IEEE 14-bus and IEEE 30-bus test systems with thermal line limit enforcement."
    ]
  },
  {
    id: "power-transmission-fault-cv",
    title: "Hybrid CV & Deep Learning for Power Transmission Fault Detection",
    shortTitle: "Power Transmission Fault CV",
    category: "vision",
    categoryName: "Computer Vision & DL",
    badge: "Infrastructure Diagnostics",
    status: "Benchmarked",
    tagline: "Automated aerial inspection for power transmission grids combining Hough transforms, GLCM/HOG, and 4 deep CNNs.",
    description: "Automated diagnostic system inspecting high-voltage transmission infrastructure for missing/broken glass insulator discs, rust corrosion on metallic hardware, and foreign objects (bird nests). Benchmarks classical feature engineering (Hough circle transforms, HSV morphology, GLCM, LBP, and HOG with SVM/Random Forest) alongside deep transfer learning architectures (AlexNet from scratch, VGG16, InceptionV3, ResNet50).",
    repoUrl: "https://github.com/niranjan-crypt/Hybrid-Computer-Vision-and-Deep-Learning-for-Automated-Power-Transmission-Fault-Detection",
    stars: 0,
    language: "Python / OpenCV",
    tags: ["Computer Vision", "Deep Learning", "Transmission Lines", "Hough Circles", "GLCM / LBP / HOG", "ResNet50 / VGG16", "Defect Detection"],
    metrics: [
      { label: "Fault Types", value: "Broken Discs, Rust, Nests" },
      { label: "CNN Architectures", value: "AlexNet, VGG16, ResNet50, Inception" },
      { label: "Classical Descriptors", value: "Hough, HSV, GLCM, LBP, HOG" },
      { label: "Classifiers", value: "SVM, RF, KNN, Softmax" }
    ],
    mathFormula: "\\text{GLCM: } P(i,j | d, \\theta) = \\frac{\\#\\{((x,y), (x+\\Delta x, y+\\Delta y)) : I(x,y)=i, I=j\\}}{\\text{Total Pairs}}",
    highlights: [
      "Domain-specific defect segmentation: Hough Circles for glass discs, HSV mask filtering for rust corrosion.",
      "Head-to-head empirical benchmark between handcrafted spatial/texture descriptors and deep CNN representations.",
      "Comparative classification metrics across AlexNet, VGG16, GoogLeNet, and ResNet50.",
      "Engineered for integration with UAV autonomous aerial transmission line inspection."
    ]
  },
  {
    id: "toc-av-formal-verification",
    title: "TOC-AV: Formal Safety Verification System for Autonomous Vehicles",
    shortTitle: "TOC-AV Formal Verification",
    category: "systems",
    categoryName: "Core Systems & Automata",
    badge: "Theoretical Computer Science",
    status: "Interactive Verification",
    tagline: "Safety-critical autonomous vehicle parking verification modeling DFA, NFA, Timed Automata, CFG, and Pushdown Automata.",
    description: "Demonstrates how core theoretical computer science and formal automata theory are applied to verify safety-critical loops in autonomous driving. Models autonomous parking maneuvers and emergency obstacle braking through Deterministic Finite Automata (DFA), NFA with epsilon-transitions, Subset Construction equivalence, Timed Automata for latency deadlines, and Context-Free Grammars in Chomsky Normal Form (CNF) for command sequence parsing.",
    repoUrl: "https://github.com/niranjan-crypt/Computation-and-Compiler-design",
    stars: 0,
    language: "JavaScript / HTML5",
    tags: ["Theory of Computation", "Formal Verification", "Autonomous Vehicles", "DFA / NFA", "Pushdown Automata", "Timed Automata", "CFG in CNF"],
    metrics: [
      { label: "State Machines", value: "DFA + NFA + Timed" },
      { label: "Language Parsing", value: "CFG in CNF" },
      { label: "Memory Model", value: "Pushdown Automata Stack" },
      { label: "Application", value: "Safety Critical AV Maneuvers" }
    ],
    mathFormula: "M = (Q, \\Sigma, \\delta, q_0, F), \\quad \\text{Sequence: } \\text{SEARCH}^+ \\to \\text{STOP} \\to \\text{REVERSE} \\to \\text{ALIGN} \\to \\text{PARK}",
    highlights: [
      "Formal proof of crash-free safety properties under bounded reaction times using Timed Automata.",
      "Interactive visualizer mapping epsilon-transitions to deterministic state sets via Subset Construction.",
      "Grammar validation for self-parking maneuver pipelines using CNF syntax verification.",
      "Pushdown stack model proving state reversibility and obstacle avoidance guarantees."
    ]
  }
];

window.PORTFOLIO_SKILLS = [
  {
    category: "Computer Vision & Image Processing",
    icon: "eye",
    skills: [
      { name: "Hyperspectral Imaging (400-1000nm)", level: 95 },
      { name: "3D-CNN & Spectral-Spatial Fusion", level: 92 },
      { name: "Metric Learning (ArcFace on S^127)", level: 90 },
      { name: "Explainable AI (Spectral SHAP, Grad-CAM++)", level: 92 },
      { name: "Classical Feature Extraction (GLCM, LBP, HOG)", level: 96 },
      { name: "Morphology & Hough Transforms", level: 94 }
    ]
  },
  {
    category: "Deep Learning & Neural Architectures",
    icon: "cpu",
    skills: [
      { name: "Physics-Informed Neural Networks (PINNs)", level: 90 },
      { name: "1D-CNN + Bidirectional LSTM Models", level: 92 },
      { name: "Convolutional Networks (ResNet, VGG, MobileNet)", level: 94 },
      { name: "Bayesian Regularization & Overfit Verification", level: 88 },
      { name: "Edge Quantization (FP16 / INT8)", level: 86 },
      { name: "TensorFlow, Keras & Scikit-Learn", level: 95 }
    ]
  },
  {
    category: "Cyber-Physical & Embedded Silicon",
    icon: "radio",
    skills: [
      { name: "ESP32 Firmware & FreeRTOS", level: 90 },
      { name: "Bluetooth Low Energy 5.0 GATT Profiles", level: 92 },
      { name: "Kinematic Angle Calculation & Hysteresis", level: 94 },
      { name: "Photoplethysmography (PPG) Vital Telemetry", level: 88 },
      { name: "3D Digital Twins (glTF / WebGL / Three.js)", level: 87 },
      { name: "Flutter & Cross-Platform Teleop Dashboards", level: 88 }
    ]
  },
  {
    category: "Mathematical Optimization & Power Systems",
    icon: "activity",
    skills: [
      { name: "Nature-Inspired Metaheuristics (PSO, GA, DE, GWO)", level: 95 },
      { name: "Novel Tri-Hybrid Algorithms (OOA, KHA, SHO)", level: 94 },
      { name: "PTDF Transmission Sensitivity Modeling", level: 92 },
      { name: "DSP Analytics (FFT, THD %, RMS, Crest Factor)", level: 93 },
      { name: "Markov Chain Stochastic Weather Generation", level: 90 },
      { name: "MATLAB & Simulink Dynamic Modeling", level: 92 }
    ]
  },
  {
    category: "Core Computer Science & Systems",
    icon: "code",
    skills: [
      { name: "Formal Automata (DFA, NFA, Timed Automata)", level: 94 },
      { name: "Context-Free Grammars & Pushdown Automata", level: 90 },
      { name: "Compiler Design & Chomsky Normal Form (CNF)", level: 88 },
      { name: "Vectorized Scientific Computing (NumPy, SciPy)", level: 96 },
      { name: "Linux / POSIX Systems & Git Versioning", level: 92 }
    ]
  }
];
