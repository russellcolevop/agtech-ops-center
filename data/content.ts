// =============================================================================
// AGTECH FOUNDER OPS CENTER — Content Data
// Edit this file to update content across the app, or manage via Supabase CMS.
// =============================================================================

export const globalStats = [
  {
    value: "4.8B ha",
    label: "Global Agricultural Land",
    source: "FAO Data",
    color: "green",
  },
  {
    value: "608M+",
    label: "Farms Worldwide",
    source: "Global Census",
    color: "blue",
  },
  {
    value: "$2.28T",
    label: "Global Agri-Food Exports",
    source: "2024",
    color: "amber",
  },
  {
    value: "$21.7–32.8B",
    label: "AgTech Market Value",
    source: "2025 Est.",
    color: "teal",
  },
];

export const innovationHotspots = [
  {
    country: "United States",
    flag: "🇺🇸",
    description: "Silicon Valley, Midwest autonomy, precision ag leaders",
    badge: "Top VC Hub",
    badgeColor: "blue",
  },
  {
    country: "Netherlands",
    flag: "🇳🇱",
    description: "Vertical farming, greenhouse automation, precision horticulture",
    badge: "CEA Leader",
    badgeColor: "green",
  },
  {
    country: "Israel",
    flag: "🇮🇱",
    description: "Irrigation tech, water management, desert agriculture",
    badge: "Water Tech",
    badgeColor: "cyan",
  },
  {
    country: "Canada",
    flag: "🇨🇦",
    description: "Grain tech, crop protection, climate adaptation",
    badge: "Grain Focus",
    badgeColor: "amber",
  },
  {
    country: "Brazil",
    flag: "🇧🇷",
    description: "Tropical ag, soy innovation, sugarcane tech",
    badge: "Tropical Leader",
    badgeColor: "green",
  },
  {
    country: "Australia",
    flag: "🇦🇺",
    description: "Livestock tech, ranching automation, drought solutions",
    badge: "Livestock Tech",
    badgeColor: "orange",
  },
  {
    country: "Singapore",
    flag: "🇸🇬",
    description: "Urban farming, food security, vertical systems",
    badge: "Urban Ag",
    badgeColor: "purple",
  },
  {
    country: "European Union",
    flag: "🇪🇺",
    description: "Sustainability focus, organic tech, regenerative systems",
    badge: "ESG Focus",
    badgeColor: "teal",
  },
];

export const investmentByStage = [
  { stage: "Seed & Early Stage", amount: "$8.2B", percentage: 21 },
  { stage: "Series A & B", amount: "$12.4B", percentage: 32 },
  { stage: "Late Stage & Growth", amount: "$18.7B", percentage: 47 },
];

export const topVCFirms = [
  { name: "Anterra Capital", focus: "Global AgTech & Food" },
  { name: "AgFunder", focus: "Agrifood Tech Investments" },
  { name: "Finistere Ventures", focus: "AgBio & AgTech" },
  { name: "Acre Venture Partners", focus: "Sustainable Food Systems" },
  { name: "Astanor Ventures", focus: "Impact AgTech" },
];

export const emergingSectors = [
  {
    title: "Alternative Proteins",
    description: "Plant-based, cultivated meat, precision fermentation",
    icon: "🧬",
    growth: "High",
  },
  {
    title: "Carbon & Regenerative Agriculture",
    description: "Carbon credits, soil health monitoring, regen practices",
    icon: "🌱",
    growth: "Very High",
  },
  {
    title: "AI & Computer Vision",
    description: "Crop disease detection, yield prediction, robotic guidance",
    icon: "🤖",
    growth: "Explosive",
  },
  {
    title: "Supply Chain Transparency",
    description: "Blockchain, traceability, food safety systems",
    icon: "🔗",
    growth: "High",
  },
];

export const agTechTrends = [
  {
    title: "AI in Agronomy",
    description: "Machine learning for crop management, pest prediction, and yield optimization",
    status: "Mainstream Adoption",
    statusColor: "green",
  },
  {
    title: "Autonomous Robotics",
    description: "Field robots, harvesting automation, and autonomous tractors",
    status: "Growing Fast",
    statusColor: "blue",
  },
  {
    title: "Biological Inputs",
    description: "Biofertilizers, biopesticides, and microbial solutions",
    status: "Early Majority",
    statusColor: "amber",
  },
  {
    title: "Farm Data Platforms",
    description: "Integrated management systems, data analytics, and decision support",
    status: "Mainstream",
    statusColor: "green",
  },
  {
    title: "Carbon Markets",
    description: "Carbon credit generation, verification, and trading platforms",
    status: "Emerging",
    statusColor: "purple",
  },
  {
    title: "Vertical Farming",
    description: "Urban CEA, leafy greens production, food security solutions",
    status: "Growing",
    statusColor: "teal",
  },
];

export const founderOpportunities = [
  {
    region: "North America",
    flag: "🌎",
    opportunities: [
      "Large-scale precision agriculture and autonomous equipment",
      "Carbon sequestration and regenerative agriculture platforms",
      "Supply chain traceability and food safety solutions",
    ],
  },
  {
    region: "Europe",
    flag: "🌍",
    opportunities: [
      "Organic farming technologies and sustainability tools",
      "Precision horticulture and greenhouse automation",
      "Alternative protein and novel food ingredients",
    ],
  },
  {
    region: "Asia-Pacific",
    flag: "🌏",
    opportunities: [
      "Vertical farming and urban agriculture systems",
      "Smallholder farmer support and mobile-first solutions",
      "Aquaculture technology and fish farming innovation",
    ],
  },
  {
    region: "Latin America / Africa",
    flag: "🌍",
    opportunities: [
      "Climate adaptation and drought-resistant crop solutions",
      "Post-harvest loss reduction and storage technologies",
      "Water management and irrigation efficiency systems",
    ],
  },
];

export const startupChallenges = [
  {
    category: "Market & Customer Challenges",
    icon: "🎯",
    challenges: [
      {
        title: "Long Sales Cycles",
        description: "Farmers are risk-averse. Build trust with pilot programs, case studies, and ROI calculators before expecting broad adoption.",
        solution: "Offer no-risk trials, co-develop with early adopters, and prove ROI within one growing season.",
      },
      {
        title: "Fragmented Customer Base",
        description: "Agriculture is extremely diverse — smallholders vs enterprise farms, varied crops, different climates.",
        solution: "Start hyper-niche: one crop, one region, one problem. Expand from proven traction.",
      },
      {
        title: "Low Digital Literacy",
        description: "Many farmers are not tech-savvy, making adoption of complex software or hardware difficult.",
        solution: "Prioritize UX ruthlessly. Use WhatsApp, SMS, or voice interfaces. Train local agronomists as resellers.",
      },
      {
        title: "Seasonality of Revenue",
        description: "Agricultural cycles mean revenue is lumpy and cash flow can be difficult to manage.",
        solution: "Build subscription or data-as-a-service models that smooth revenue across seasons.",
      },
    ],
  },
  {
    category: "Technical & Development Challenges",
    icon: "⚙️",
    challenges: [
      {
        title: "Connectivity in Rural Areas",
        description: "Many farms have limited or no internet access, making cloud-based solutions unreliable.",
        solution: "Design offline-first with edge computing. Use Bluetooth, LoRa, or satellite connectivity as fallback.",
      },
      {
        title: "Data Quality & Availability",
        description: "Agricultural data is scarce, inconsistent, and often in proprietary formats.",
        solution: "Partner with co-ops and universities for data access. Build data collection into your product from day one.",
      },
      {
        title: "Hardware Durability",
        description: "Agricultural environments are harsh — dust, moisture, extreme temperatures, UV exposure.",
        solution: "Over-engineer for IP67+ ratings. Partner with established hardware manufacturers rather than building from scratch.",
      },
      {
        title: "Integration with Legacy Systems",
        description: "Farm management software, ERP systems, and equipment are often decades old with poor APIs.",
        solution: "Build an integration layer or use middleware like Granular or Conservis. Offer manual CSV import as a bridge.",
      },
    ],
  },
  {
    category: "Regulatory & Compliance Challenges",
    icon: "📋",
    challenges: [
      {
        title: "Crop Protection Registration",
        description: "Biological and chemical inputs require lengthy registration processes that can take years and millions of dollars.",
        solution: "Partner with established ag companies for distribution. Focus on data/software layers that don't require registration.",
      },
      {
        title: "Data Privacy & Ownership",
        description: "Farmers are increasingly wary of who owns their farm data and how it's used.",
        solution: "Adopt transparent data agreements. Position yourself as farmer-first. Never sell individual farm data.",
      },
      {
        title: "Drone & Autonomous Vehicle Regulations",
        description: "UAV and autonomous equipment regulations vary dramatically by country and are rapidly evolving.",
        solution: "Hire a regulatory specialist. Build compliance into the product. Join industry associations that lobby for sensible rules.",
      },
      {
        title: "Organic & Sustainability Certifications",
        description: "Certification bodies have strict requirements that limit what technologies can be used.",
        solution: "Work with certifying bodies early. Build your product to be certification-compatible from day one.",
      },
    ],
  },
  {
    category: "Business Model & Scaling Challenges",
    icon: "📈",
    challenges: [
      {
        title: "Unit Economics at Farm Scale",
        description: "AgTech products often need to be priced low enough for farmers but are expensive to build and support.",
        solution: "Target high-value crops first (cannabis, berries, specialty produce) where farmers can absorb higher costs.",
      },
      {
        title: "Distribution & Last-Mile Reach",
        description: "Reaching individual farms efficiently is expensive and logistically complex.",
        solution: "Partner with co-ops, input retailers, and ag banks. Use agronomists and crop consultants as channel partners.",
      },
      {
        title: "Fundraising Timelines vs Agricultural Cycles",
        description: "VC timelines (3-5 yr exit) don't always align with ag adoption cycles (5-10 yr)",
        solution: "Target ag-focused VCs who understand the pace. Explore government grants and impact funds with patient capital.",
      },
      {
        title: "International Expansion Complexity",
        description: "Each market has unique crops, regulations, languages, and farming practices.",
        solution: "Expand to one new market at a time. Find strong local partners. Build a configurable product, not a custom one.",
      },
    ],
  },
];

// ============================================================
// FOUNDER'S JOURNEY
// ============================================================
export const foundersJourneyStages = [
  {
    stage: "01",
    title: "Identify the Problem",
    subtitle: "0–3 months",
    color: "green",
    description: "Spend time in the field. Talk to 50+ farmers, agronomists, and ag industry professionals before writing a single line of code.",
    actions: [
      "Conduct 50+ farmer interviews",
      "Map the pain point with first-principles thinking",
      "Identify who loses money when this problem exists",
      "Validate that existing solutions are inadequate",
    ],
    resources: ["The Mom Test (book)", "YC Interview Guide", "FAO Open Data"],
    milestone: "Clear problem statement with validated customer pain",
  },
  {
    stage: "02",
    title: "Validate the Opportunity",
    subtitle: "3–6 months",
    color: "blue",
    description: "Confirm that the problem is big enough, frequent enough, and that people will pay to solve it.",
    actions: [
      "Size the market (TAM/SAM/SOM)",
      "Identify 3–5 willing early adopter farms",
      "Create a landing page and collect emails",
      "Run a pre-sell or LOI campaign",
    ],
    resources: ["AgFunder Market Reports", "Pitchbook AgTech Data", "USDA NASS"],
    milestone: "5+ signed Letters of Intent or pre-paid pilots",
  },
  {
    stage: "03",
    title: "Build MVP",
    subtitle: "6–12 months",
    color: "amber",
    description: "Build the minimum product that delivers the core value. Resist the urge to build features. Ship, learn, iterate.",
    actions: [
      "Define the single core use case",
      "Build with no-code/low-code if possible first",
      "Deploy on 2–3 pilot farms this season",
      "Instrument everything for data collection",
    ],
    resources: ["Figma (prototyping)", "Vercel (deployment)", "Supabase (backend)"],
    milestone: "Working MVP running on real farms",
  },
  {
    stage: "04",
    title: "Find Product-Market Fit",
    subtitle: "12–24 months",
    color: "purple",
    description: "PMF in AgTech means farmers actively recommend you, renew without prompting, and your churn is under 5% annually.",
    actions: [
      "Track NPS religiously",
      "Monitor retention through crop cycles",
      "Identify your 'super users' and clone them",
      "Achieve $10K+ MRR or 20+ paying customers",
    ],
    resources: ["Superhuman PMF Survey", "Recurly Churn Analysis", "Mixpanel"],
    milestone: "40%+ of users would be 'very disappointed' without your product",
  },
  {
    stage: "05",
    title: "Scale Distribution",
    subtitle: "24–48 months",
    color: "teal",
    description: "Once you have PMF, it's time to pour fuel on the fire. Build the sales motion that can scale without you.",
    actions: [
      "Hire a VP of Sales or Head of Partnerships",
      "Build a co-op and retailer channel program",
      "Launch a referral or affiliate program",
      "Expand to second crop or geography",
    ],
    resources: ["AgriForce Distribution Platform", "Co-op directories by country"],
    milestone: "$100K MRR and repeatable sales process",
  },
  {
    stage: "06",
    title: "Raise Growth Capital",
    subtitle: "36–60 months",
    color: "red",
    description: "With proven unit economics and growth, approach institutional investors for Series A or beyond.",
    actions: [
      "Prepare 12-month financial model",
      "Build relationships with AgTech VCs 6+ months early",
      "Create a compelling data room",
      "Target $3–10M Series A",
    ],
    resources: ["AgFunder VC Database", "Anterra Capital", "Finistere Ventures", "Astanor Ventures"],
    milestone: "Term sheet from a leading AgTech VC",
  },
];

// ============================================================
// GLOSSARY
// ============================================================
export const glossaryTerms = [
  { term: "AgTech", definition: "Agricultural Technology — the use of technology to improve the efficiency, profitability, and sustainability of farming and food production." },
  { term: "Precision Agriculture", definition: "Farm management that uses data, sensors, and technology to optimize inputs (water, fertilizer, chemicals) at a fine-grained level for each part of a field." },
  { term: "CEA", definition: "Controlled Environment Agriculture — growing crops in enclosed, climate-controlled facilities such as greenhouses or vertical farms." },
  { term: "Vertical Farming", definition: "Growing crops in stacked layers in a controlled indoor environment, often with LED lighting and hydroponic or aeroponic systems." },
  { term: "Hydroponics", definition: "A method of growing plants without soil, using mineral nutrient solutions in a water solvent." },
  { term: "Aeroponics", definition: "Growing plants in an air or mist environment without the use of soil or an aggregate medium." },
  { term: "Digital Twin", definition: "A virtual replica of a physical farm, field, or crop system used to simulate, predict, and optimize performance." },
  { term: "Remote Sensing", definition: "The use of satellite or drone imagery to monitor crop health, soil conditions, and field variability from a distance." },
  { term: "NDVI", definition: "Normalized Difference Vegetation Index — a satellite/drone metric used to assess live green vegetation coverage and crop health." },
  { term: "TAM", definition: "Total Addressable Market — the total revenue opportunity available for a product or service if it achieved 100% market share." },
  { term: "SAM", definition: "Serviceable Addressable Market — the portion of TAM that you can realistically target given your business model and geography." },
  { term: "MRR", definition: "Monthly Recurring Revenue — the predictable revenue a business can expect to receive every month." },
  { term: "ARR", definition: "Annual Recurring Revenue — the value of recurring revenue on an annualized basis." },
  { term: "Churn", definition: "The rate at which customers cancel or don't renew their subscription over a given period." },
  { term: "CAC", definition: "Customer Acquisition Cost — the total cost of sales and marketing divided by the number of new customers acquired." },
  { term: "LTV", definition: "Lifetime Value — the total revenue a business can expect from a single customer account over the course of the relationship." },
  { term: "NPS", definition: "Net Promoter Score — a metric that measures customer loyalty and satisfaction based on the question 'How likely are you to recommend us?'" },
  { term: "SaaS", definition: "Software as a Service — a software distribution model where applications are hosted in the cloud and provided to users over the internet." },
  { term: "LOI", definition: "Letter of Intent — a document declaring a preliminary commitment to enter into a business agreement, often used to validate demand." },
  { term: "Term Sheet", definition: "A non-binding document outlining the basic terms and conditions of an investment deal." },
  { term: "Biostimulants", definition: "Substances or microorganisms that enhance plant nutrition, stress tolerance, and/or crop quality independent of the nutrient content." },
  { term: "Biopesticides", definition: "Pesticides derived from natural materials including animals, plants, bacteria, and certain minerals." },
  { term: "Regenerative Agriculture", definition: "Farming practices that restore soil health, increase biodiversity, and improve water cycles — often linked to carbon sequestration." },
  { term: "Carbon Credit", definition: "A tradeable certificate representing the right to emit one tonne of CO2 or equivalent greenhouse gas." },
  { term: "LoRaWAN", definition: "Long Range Wide Area Network — a low-power, long-range wireless protocol used for IoT sensors in agriculture." },
  { term: "Edge Computing", definition: "Processing data near the source (e.g., on a farm device) rather than in the cloud, enabling offline functionality." },
  { term: "API", definition: "Application Programming Interface — a set of protocols that allows different software applications to communicate with each other." },
  { term: "IoT", definition: "Internet of Things — a network of physical devices embedded with sensors and software to collect and exchange data." },
  { term: "Series A", definition: "The first significant round of venture capital financing, typically after a startup has shown early traction and product-market fit." },
  { term: "Pivot", definition: "A structured course correction in a startup's strategy, product, or business model based on learnings from the market." },
];

// ============================================================
// MEDIA & INFLUENCERS
// ============================================================
export const agTechMedia = [
  {
    category: "Podcasts",
    icon: "🎙️",
    items: [
      { name: "The Future of Agriculture", host: "Tim Hammerich", description: "Weekly conversations with ag innovators, founders, and industry leaders.", url: "https://futureofag.com" },
      { name: "AgTech So What", host: "AgTech So What Team", description: "Cutting through the hype to find what actually works in ag technology.", url: "#" },
      { name: "Upstream Ag Insights", host: "Shane Thomas", description: "Deep dives into ag industry dynamics, startups, and investments.", url: "#" },
      { name: "The Precision Ag Podcast", host: "John Fulton", description: "Academic and practitioner perspectives on precision agriculture.", url: "#" },
    ],
  },
  {
    category: "Newsletters",
    icon: "📰",
    items: [
      { name: "AgFunder News", host: "AgFunder", description: "Daily coverage of agrifood tech investment, innovation, and policy.", url: "https://agfundernews.com" },
      { name: "The Spoon", host: "The Spoon Team", description: "Food and ag tech news with a focus on the future of food systems.", url: "https://thespoon.tech" },
      { name: "Herd on the Street", host: "Tenacious Ventures", description: "Australian AgTech investment insights with global relevance.", url: "#" },
      { name: "Upstream Ag Insights", host: "Shane Thomas", description: "Weekly newsletter on ag industry trends, startups, and deals.", url: "#" },
    ],
  },
  {
    category: "Key Influencers",
    icon: "👤",
    items: [
      { name: "Louisa Burwood-Taylor", host: "AgFunder", description: "Head of Research at AgFunder — the go-to source for AgTech investment data.", url: "#" },
      { name: "Shane Thomas", host: "Upstream Ag", description: "One of the most respected independent voices in AgTech and ag input industries.", url: "#" },
      { name: "Tim Hammerich", host: "Future of Ag", description: "Agricultural communicator and storyteller connecting the ag innovation community.", url: "#" },
      { name: "Michael Dykes", host: "IDFA", description: "Industry leader bridging policy, innovation, and dairy/food systems.", url: "#" },
    ],
  },
  {
    category: "Reports & Research",
    icon: "📊",
    items: [
      { name: "AgFunder AgriFood Tech Report", host: "AgFunder", description: "Annual report on global AgTech investment — the industry standard.", url: "https://agfunder.com/research" },
      { name: "FAO State of Food & Agriculture", host: "FAO", description: "Authoritative UN report on global food systems, agriculture, and food security.", url: "https://fao.org" },
      { name: "McKinsey AgTech Report", host: "McKinsey", description: "Strategic perspectives on AgTech market opportunities and challenges.", url: "https://mckinsey.com" },
      { name: "Pitchbook AgTech Data", host: "Pitchbook", description: "Comprehensive VC deal data, valuations, and market intelligence.", url: "https://pitchbook.com" },
    ],
  },
];

// ============================================================
// REGION DATA (default: Canada)
// ============================================================
export const regions = [
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "EU", name: "European Union", flag: "🇪🇺" },
];

export const regionData: Record<string, {
  ecosystem: {
    overview: string;
    marketSize: string;
    startups: string;
    investment: string;
    keyPlayers: { name: string; focus: string }[];
    accelerators: { name: string; location: string; focus: string }[];
  };
  segments: { name: string; description: string; opportunity: string; maturity: string }[];
  crops: { name: string; area: string; value: string; techOpportunity: string }[];
  resources: { category: string; items: { name: string; description: string; url: string }[] }[];
}> = {
  CA: {
    ecosystem: {
      overview: "Canada is a global leader in grain and oilseed production with a rapidly growing AgTech ecosystem centered in Saskatoon (Ag-Tech), Guelph, and British Columbia. Government programs like Sustainable Canadian Agricultural Partnership provide strong tailwinds.",
      marketSize: "$2.1B",
      startups: "400+",
      investment: "$450M (2023)",
      keyPlayers: [
        { name: "Croptimistic Technology", focus: "Soil Variability Mapping" },
        { name: "Decisive Farming", focus: "Farm Management Software" },
        { name: "Semios", focus: "Pest & Disease Monitoring" },
        { name: "BioHELIX", focus: "Biological Crop Protection" },
        { name: "Terramera", focus: "Biopesticides" },
      ],
      accelerators: [
        { name: "Ag-West Bio", location: "Saskatoon, SK", focus: "Ag Biotech" },
        { name: "Innovate AgriFood", location: "BC", focus: "Food & Ag Innovation" },
        { name: "Spark Centre", location: "Durham, ON", focus: "General Tech" },
        { name: "CABI AgriVetBio", location: "National", focus: "Ag Bio Research" },
      ],
    },
    segments: [
      { name: "Precision Grain Farming", description: "Variable rate application, yield mapping, and field intelligence for canola, wheat, and pulse crops.", opportunity: "Very High", maturity: "Early Majority" },
      { name: "Crop Protection Tech", description: "Biological inputs and precision spray technology to reduce chemical use and improve efficacy.", opportunity: "High", maturity: "Growing" },
      { name: "AgData & Connectivity", description: "Farm data platforms, connectivity infrastructure, and analytics for data-driven farm management.", opportunity: "High", maturity: "Mainstream" },
      { name: "Carbon & Sustainability", description: "Carbon credit programs for Canadian farmers adopting regenerative practices on vast prairie acreage.", opportunity: "Very High", maturity: "Emerging" },
      { name: "Livestock Tech", description: "Cattle and dairy management systems including health monitoring, feed optimization, and traceability.", opportunity: "Medium", maturity: "Early Majority" },
    ],
    crops: [
      { name: "Canola", area: "8.7M ha", value: "$26B", techOpportunity: "Precision application, disease monitoring, harvest optimization" },
      { name: "Wheat", area: "9.4M ha", value: "$15B", techOpportunity: "Yield prediction, quality grading, supply chain traceability" },
      { name: "Soybeans", area: "2.3M ha", value: "$4B", techOpportunity: "Field mapping, biological inoculants, market connectivity" },
      { name: "Corn", area: "1.4M ha", value: "$3.2B", techOpportunity: "Irrigation management, automated harvest, feed optimization" },
      { name: "Pulses (Lentil/Pea)", area: "4.2M ha", value: "$6B", techOpportunity: "Export market platforms, precision seeding, protein valorization" },
    ],
    resources: [
      {
        category: "Government Programs",
        items: [
          { name: "Sustainable Canadian Agricultural Partnership", description: "Federal-provincial cost-share programs for ag innovation and adoption.", url: "https://agriculture.canada.ca" },
          { name: "AAFC AgriInnovate", description: "Up to $10M grants for commercializing ag innovations.", url: "https://agriculture.canada.ca" },
          { name: "SR&ED Tax Credits", description: "Federal R&D tax incentives for AgTech development.", url: "https://cra-arc.gc.ca" },
          { name: "FCC Ag Innovation", description: "Farm Credit Canada financing for ag startups.", url: "https://fcc.ca" },
        ],
      },
      {
        category: "Key Organizations",
        items: [
          { name: "Protein Industries Canada", description: "Supercluster supporting Canadian plant protein innovation.", url: "https://proteinindustriescanada.ca" },
          { name: "Ag-West Bio", description: "Saskatchewan's agricultural and food biotech industry association.", url: "https://agwest.sk.ca" },
          { name: "Canadian Agri-Food Automation and Intelligence Network", description: "CAAIN — funding for automation and AI in ag.", url: "https://caain.ca" },
          { name: "GrainDiscovery", description: "Grain marketplace and digital trading platform for Canadian farmers.", url: "https://graindiscovery.com" },
        ],
      },
    ],
  },
  US: {
    ecosystem: {
      overview: "The United States leads global AgTech investment with major hubs in the Midwest, California's Central Valley, and Silicon Valley. The US has the deepest VC ecosystem for AgTech and the world's largest single agricultural market.",
      marketSize: "$9.8B",
      startups: "1,200+",
      investment: "$2.1B (2023)",
      keyPlayers: [
        { name: "Climate Corporation", focus: "Digital Agronomy Platform" },
        { name: "John Deere Operations Center", focus: "Connected Equipment" },
        { name: "Indigo Agriculture", focus: "Microbiology & Carbon" },
        { name: "AppHarvest", focus: "Indoor Agriculture" },
        { name: "Farmers Business Network", focus: "Farmer Marketplace" },
      ],
      accelerators: [
        { name: "Ag Startup Engine", location: "Davis, CA", focus: "Early-Stage AgTech" },
        { name: "Bayer Crop Science G4A", location: "Multiple", focus: "Crop Science Innovation" },
        { name: "RootED", location: "Kansas City, MO", focus: "Food & Ag Systems" },
        { name: "AgLaunch", location: "Memphis, TN", focus: "Mid-South Agriculture" },
      ],
    },
    segments: [
      { name: "Autonomous Field Equipment", description: "Self-driving tractors, planters, and harvesters for large-scale corn and soybean operations.", opportunity: "Very High", maturity: "Growing Fast" },
      { name: "Digital Agronomy", description: "AI-powered crop advisory, field scouting, and precision input management platforms.", opportunity: "Very High", maturity: "Mainstream" },
      { name: "Alternative Proteins", description: "Plant-based, fermentation-derived, and cultivated meat products targeting the $1.4T US food market.", opportunity: "Explosive", maturity: "Early Majority" },
      { name: "Carbon & Regen Ag", description: "Carbon credit programs and regenerative practice platforms for US row crop farmers.", opportunity: "Very High", maturity: "Emerging" },
      { name: "Controlled Environment Ag", description: "Indoor and vertical farming serving fresh produce to urban markets and reducing supply chain distance.", opportunity: "High", maturity: "Growing" },
    ],
    crops: [
      { name: "Corn", area: "35.1M ha", value: "$82B", techOpportunity: "Autonomy, precision application, yield prediction" },
      { name: "Soybeans", area: "34.4M ha", value: "$56B", techOpportunity: "Biologicals, carbon sequestration, export traceability" },
      { name: "Wheat", area: "15.0M ha", value: "$18B", techOpportunity: "Disease prediction, satellite monitoring, quality sorting" },
      { name: "Cotton", area: "4.3M ha", value: "$9B", techOpportunity: "Harvest automation, pest monitoring, traceability" },
      { name: "Fruits & Vegetables", area: "2.1M ha", value: "$67B", techOpportunity: "Harvest robotics, vertical farming, cold chain tech" },
    ],
    resources: [
      {
        category: "Government Programs",
        items: [
          { name: "USDA SBIR/STTR", description: "Small Business Innovation Research grants for agricultural tech.", url: "https://nifa.usda.gov/sbir" },
          { name: "USDA Conservation Programs", description: "EQIP and CSP programs funding sustainable ag technology adoption.", url: "https://www.nrcs.usda.gov" },
          { name: "NSF Agriculture Grants", description: "National Science Foundation funding for ag technology research.", url: "https://nsf.gov" },
          { name: "ARPA-E OPEN", description: "DOE advanced research for energy-efficient agricultural systems.", url: "https://arpa-e.energy.gov" },
        ],
      },
      {
        category: "Key Organizations",
        items: [
          { name: "American Farm Bureau", description: "Largest US farm organization with broad market access.", url: "https://fb.org" },
          { name: "AgFunder", description: "AgTech media and investment platform with US focus.", url: "https://agfunder.com" },
          { name: "Farm Journal AgTech", description: "Leading US media and events for AgTech founders.", url: "https://farmjournal.com" },
          { name: "Ag Innovation Showcase", description: "Premier US event connecting AgTech startups with investors.", url: "#" },
        ],
      },
    ],
  },
};

// Fill remaining regions with placeholder structure
["AU", "NL", "IL", "BR", "SG", "EU"].forEach((code) => {
  if (!regionData[code]) {
    regionData[code] = {
      ecosystem: {
        overview: `Region-specific data for ${code} is being compiled. Check back soon for detailed ecosystem insights.`,
        marketSize: "Coming soon",
        startups: "Coming soon",
        investment: "Coming soon",
        keyPlayers: [],
        accelerators: [],
      },
      segments: [],
      crops: [],
      resources: [],
    };
  }
});
