import fs from "fs";
import path from "path";
import { pipeline } from "@huggingface/transformers";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// Automatically load .env and .env.local if present
for (const file of [".env.local", ".env"]) {
  const envPath = path.join(process.cwd(), file);
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([A-Za-z_0-9]+)\s*=\s*(.*)?\s*$/);
      if (match && !process.env[match[1]]) {
        let val = (match[2] || "").trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        process.env[match[1]] = val;
      }
    }
  }
}

interface RawPage {
  pageNumber: number;
  text: string;
  sectionTitle?: string;
}

interface ChunkRecord {
  chunkId: string;
  pageNumber: number;
  sectionTitle?: string;
  text: string;
  embeddings: {
    offline: number[];
    online?: number[];
  };
}

// Token chunking configurations
const TARGET_WORDS_PER_CHUNK = 300; // ~400-500 tokens
const OVERLAP_WORDS = 45; // ~15% overlap

/**
 * Splits page text into overlapping chunks (~500-800 tokens with ~15% overlap).
 */
function chunkPageText(pages: RawPage[]): Array<{ pageNumber: number; sectionTitle?: string; text: string }> {
  const result: Array<{ pageNumber: number; sectionTitle?: string; text: string }> = [];

  for (const page of pages) {
    const words = page.text.trim().split(/\s+/);
    if (words.length <= TARGET_WORDS_PER_CHUNK) {
      if (page.text.trim().length > 30) {
        result.push({
          pageNumber: page.pageNumber,
          sectionTitle: page.sectionTitle,
          text: page.text.trim(),
        });
      }
      continue;
    }

    let start = 0;
    while (start < words.length) {
      const end = Math.min(start + TARGET_WORDS_PER_CHUNK, words.length);
      const chunkText = words.slice(start, end).join(" ").trim();
      if (chunkText.length > 30) {
        result.push({
          pageNumber: page.pageNumber,
          sectionTitle: page.sectionTitle,
          text: chunkText,
        });
      }
      if (end >= words.length) break;
      start += TARGET_WORDS_PER_CHUNK - OVERLAP_WORDS;
    }
  }

  return result;
}

/**
 * Parses a PDF file page by page.
 */
async function parsePdf(filePath: string): Promise<RawPage[]> {
  const { PDFParse } = await import("pdf-parse");
  const dataBuffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: dataBuffer });
  const textResult = await parser.getText();

  const pages: RawPage[] = textResult.pages.map((p, idx) => {
    const lines = p.text.split("\n").map((l) => l.trim()).filter(Boolean);
    const sectionTitle =
      lines.length > 1 ? lines.slice(0, 2).join(" - ") : lines[0] || `Page ${idx + 1}`;
    return {
      pageNumber: p.num || idx + 1,
      sectionTitle,
      text: p.text.trim(),
    };
  });

  return pages;
}

/**
 * If no PDF is provided, generates a comprehensive 300-page Dumroo K-12 STEM Curriculum Textbook.
 * Covers Biology, Physics, Chemistry, Earth Science, and Mathematics with realistic academic chapters.
 */
function generateCurriculumBookPages(): RawPage[] {
  const chapters = [
    {
      title: "Chapter 1: The Cellular Basis of Life & Organelles",
      startPage: 1,
      endPage: 25,
      sections: [
        {
          name: "1.1 Discovery and Theory of Cells",
          content:
            "The cell theory represents one of the foundational unifying principles of modern biology. Developed by Matthias Schleiden, Theodor Schwann, and Rudolf Virchow in the mid-19th century, it asserts three tenets: all living organisms are composed of one or more cells, the cell is the most fundamental unit of structure and function in living systems, and all cells arise exclusively from pre-existing cells via cellular division. Cells are generally categorized into two evolutionary domains: prokaryotes and eukaryotes. Prokaryotic cells, which include bacteria and archaea, lack a membrane-bound nucleus and specialized cytoplasmic organelles. In contrast, eukaryotic cells feature complex compartmentalization, allowing incompatible biochemical pathways to occur simultaneously in membrane-bound structures such as lysosomes, the endoplasmic reticulum, and the Golgi apparatus.",
        },
        {
          name: "1.2 The Structure and Fluidity of the Cell Membrane",
          content:
            "The plasma membrane separates the internal cellular cytoplasm from the external milieu, maintaining homeostasis through selective permeability. In 1972, S.J. Singer and Garth L. Nicolson introduced the Fluid Mosaic Model to describe membrane architecture. The membrane consists of a phospholipid bilayer whose amphipathic nature features hydrophilic phosphate head groups facing aqueous environments and hydrophobic fatty acid tails nestled inward. Integral membrane proteins span the bilayer, serving as channels, carrier proteins, and signal transducers, while peripheral proteins adhere transiently to the membrane surface. Cholesterol molecules interspersed among the hydrophobic tails act as fluidity buffers: preventing overly tight packing at low temperatures and restricting excessive fluidity at elevated temperatures. Transport mechanisms include passive diffusion, facilitated diffusion via aquaporins or ion channels, and primary active transport powered by ATP hydrolysis, such as the sodium-potassium pump (Na+/K+-ATPase) which extrudes three Na+ ions while importing two K+ ions.",
        },
        {
          name: "1.3 Mitochondria and Cellular Respiration",
          content:
            "Mitochondria are double-membraned organelles frequently hailed as the powerhouses of eukaryotic cells. According to the endosymbiotic hypothesis advanced by Lynn Margulis, mitochondria originated from primitive aerobic proteobacteria that were engulfed by ancestral anaerobic eukaryotic hosts. Mitochondria contain their own circular mitochondrial DNA (mtDNA) and 70S ribosomes. Cellular respiration unfolds across four primary phases: glycolysis in the cytosol, pyruvate oxidation in the mitochondrial matrix, the citric acid (Krebs) cycle in the matrix, and oxidative phosphorylation along the inner mitochondrial cristae. During oxidative phosphorylation, high-energy electrons transferred from NADH and FADH2 traverse protein complexes I through IV of the electron transport chain, pumping protons into the intermembrane space to generate an electrochemical proton motive force. The dissipation of this gradient through ATP synthase drives the phosphorylation of ADP to produce approximately 30 to 32 ATP molecules per oxidized glucose molecule, yielding water and carbon dioxide as byproducts.",
        },
      ],
    },
    {
      title: "Chapter 2: Photosynthesis & Plant Physiology",
      startPage: 26,
      endPage: 50,
      sections: [
        {
          name: "2.1 Chloroplast Structure and Pigments",
          content:
            "Photosynthesis is the fundamental biological process that converts solar photon energy into chemical energy stored in carbohydrates. In eukaryotic photosynthetic autotrophs, this occurs inside chloroplasts, which are specialized plastids possessing an outer membrane, an inner membrane, and an extensive internal network of disc-like thylakoid sacs stacked into structures termed grana. The surrounding fluid-filled matrix is known as the stroma. The thylakoid membranes embed photosynthetic pigments, predominantly chlorophyll a and chlorophyll b, alongside accessory carotenoids. Chlorophyll absorbs photon wavelengths strongly in the blue (430-450 nm) and red (640-660 nm) spectra while reflecting green light (500-550 nm). When a photon strikes a pigment molecule within light-harvesting antenna complexes, resonance energy transfers toward the reaction center chlorophyll (P680 in Photosystem II and P700 in Photosystem I), exciting electrons to a higher orbital.",
        },
        {
          name: "2.2 Light Reactions and the Calvin-Benson Cycle",
          content:
            "Photosynthesis consists of two coordinated stages: the light-dependent reactions within thylakoids and the light-independent Calvin cycle within the stroma. In the light-dependent reactions, photolysis of water molecules at Photosystem II produces molecular oxygen, electrons, and protons (2H2O -> O2 + 4H+ + 4e-). The excited electrons travel along an electron transport chain involving plastoquinone, cytochrome b6f complex, and plastocyanin, creating a proton gradient across the thylakoid lumen that powers ATP synthesis via photophosphorylation. Simultaneously, Photosystem I re-energizes electrons to reduce NADP+ to NADPH catalyzed by ferredoxin-NADP+ reductase. In the stroma, the Calvin cycle fixes atmospheric CO2 onto ribulose-1,5-bisphosphate (RuBP) using the enzyme RuBisCO (ribulose-1,5-bisphosphate carboxylase/oxygenase). The resulting 3-phosphoglycerate is phosphorylated and reduced into glyceraldehyde-3-phosphate (G3P), which is utilized to synthesize glucose, starch, and sucrose.",
        },
      ],
    },
    {
      title: "Chapter 3: Genetics, DNA Replication & Gene Expression",
      startPage: 51,
      endPage: 80,
      sections: [
        {
          name: "3.1 DNA Double Helix and Semiconservative Replication",
          content:
            "Deoxyribonucleic acid (DNA) is the molecular repository of hereditary information across all living taxa. Elucidated by James Watson and Francis Crick in 1953 using Rosalind Franklin's X-ray diffraction data, DNA exhibits a double-helical architecture composed of two antiparallel polynucleotide strands. Nucleotides comprise a 2-deoxyribose sugar, a phosphate group, and one of four nitrogenous bases: adenine (A), thymine (T), cytosine (C), or guanine (G). Base-pairing specificity follows Chargaff's rules: adenine pairs with thymine via two hydrogen bonds, and guanine pairs with cytosine via three hydrogen bonds. DNA replication is semiconservative, as demonstrated by Matthew Meselson and Franklin Stahl in 1958. During S-phase, DNA helicase unzips the parental duplex at replication origins, single-stranded binding proteins stabilize single strands, and DNA primase synthesizes RNA primers. DNA polymerase III extends DNA in the 5' to 3' direction, creating a continuous leading strand and a discontinuous lagging strand comprised of Okazaki fragments subsequently sealed by DNA ligase.",
        },
        {
          name: "3.2 Transcription, RNA Processing and Translation",
          content:
            "The central dogma of molecular biology articulates the sequential directional flow of genetic information: DNA is transcribed into messenger RNA (mRNA), which is subsequently translated into polypeptides. During transcription, RNA polymerase binds to promoter regions (such as the TATA box) and transcribes the template DNA strand into pre-mRNA. In eukaryotes, nascent pre-mRNA undergoes three essential post-transcriptional modifications: the addition of a 7-methylguanosine cap at the 5' terminus, the addition of a polyadenylation (poly-A) tail at the 3' terminus, and the splicing out of non-coding introns by spliceosomes while joining expressed exons. The mature mRNA traverses nuclear pores into the cytoplasm. In translation, ribosome complexes (composed of ribosomal RNA and proteins) read mRNA in triplet codons. Transfer RNA (tRNA) molecules matching specific anticodons deliver corresponding amino acids. Translation occurs in three stages: initiation at the AUG start codon (methionine), elongation with peptide bond formation catalyzed by peptidyl transferase, and termination when encountering stop codons (UAA, UAG, UGA).",
        },
      ],
    },
    {
      title: "Chapter 4: Classical Mechanics & Newton's Laws of Motion",
      startPage: 81,
      endPage: 115,
      sections: [
        {
          name: "4.1 Kinematics and Newton's Three Laws of Motion",
          content:
            "Classical mechanics describes the motion of macroscopic bodies under the influence of forces. Kinematics quantitatively parameterizes motion in terms of displacement (s), velocity (v = ds/dt), and acceleration (a = dv/dt = d2s/dt2). Sir Isaac Newton formalized classical dynamics in his 1687 Philosophiæ Naturalis Principia Mathematica through three fundamental laws. Newton's First Law (Law of Inertia) posits that an object remains at rest or in uniform rectilinear motion unless acted upon by a net external force. Newton's Second Law quantifies the relationship between force, mass, and acceleration: net Force equals the time rate of change of linear momentum (F = dp/dt = d(mv)/dt); for invariant mass, this simplifies to F = ma. Newton's Third Law (Action-Reaction) establishes that whenever body A exerts a force on body B, body B simultaneously exerts an equal in magnitude and opposite in direction force on body A (F_AB = -F_BA). These action-reaction pairs act on different objects and therefore never cancel each other out.",
        },
        {
          name: "4.2 Conservation of Energy and Momentum",
          content:
            "The law of conservation of energy dictates that the total mechanical energy in an isolated system subject only to conservative forces remains invariant over time. Mechanical energy is the sum of kinetic energy (K = 1/2 m v^2) and potential energy (U). In a uniform gravitational field near Earth's surface, gravitational potential energy is defined as U = mgh, where g is the gravitational acceleration (approx 9.81 m/s^2). The work-energy theorem asserts that the net work performed by all forces on a particle equals the change in its kinetic energy (W_net = Delta K). Linear momentum (p = mv) is conserved in any closed system devoid of external impulses: total initial momentum equals total final momentum (Sigma p_i = Sigma p_f). In elastic collisions, both total momentum and total kinetic energy are preserved, whereas in inelastic collisions, kinetic energy is partially converted into internal thermal energy, sound, or permanent deformation, while total linear momentum remains conserved.",
        },
      ],
    },
    {
      title: "Chapter 5: Thermodynamics & Heat Transfer",
      startPage: 116,
      endPage: 145,
      sections: [
        {
          name: "5.1 The Laws of Thermodynamics",
          content:
            "Thermodynamics governs energy transformations and macroscopic thermal equilibrium. The Zeroth Law establishes thermal equilibrium as an equivalence relation: if systems A and B are each in thermal equilibrium with system C, then A and B are in equilibrium with each other, defining temperature. The First Law of Thermodynamics is the thermodynamic formulation of conservation of energy: the change in internal energy of a closed system equals the heat added to the system minus the work done by the system (Delta U = Q - W). The Second Law introduces the state function entropy (S). Rudolf Clausius formulated that heat cannot spontaneously flow from a colder reservoir to a hotter reservoir without external work, while Lord Kelvin stated that no cyclic engine can convert absorbed heat entirely into mechanical work with 100% efficiency. The Second Law mandates that the total entropy of an isolated system must never decrease over time (Delta S_total >= 0). The Third Law states that as temperature approaches absolute zero (0 Kelvin or -273.15 deg C), the entropy of a perfect crystalline substance approaches a constant minimum value.",
        },
        {
          name: "5.2 Mechanisms of Heat Transfer",
          content:
            "Heat transfer occurs via three distinct physical modalities: conduction, convection, and radiation. Thermal conduction is the transfer of internal kinetic energy through molecular collisions and free electron movement without macroscopic displacement of matter, mathematically described by Fourier's Law: q = -k A (dT/dx), where k represents material thermal conductivity. Convection involves the macroscopic transport of thermal energy within fluids (liquids or gases) driven by density differentials in buoyant convective currents, governed by Newton's Law of Cooling: q = h A (T_s - T_inf). Thermal radiation is electromagnetic energy emission resulting from thermal excitation of charged particles, occurring across vacua without physical media. Radiation emissions follow the Stefan-Boltzmann Law: E = epsilon sigma A T^4, where sigma is the Stefan-Boltzmann constant (5.67 x 10^-8 W/m^2 K^4) and epsilon is emissivity.",
        },
      ],
    },
    {
      title: "Chapter 6: Chemical Bonding & Molecular Structure",
      startPage: 146,
      endPage: 180,
      sections: [
        {
          name: "6.1 Ionic, Covalent and Metallic Bonds",
          content:
            "Chemical bonding drives atoms toward lower energy configurations by achieving stable valence electron octets. Ionic bonding occurs between atoms with large electronegativity differentials (Delta EN > 2.0), typically metals and nonmetals. Valence electrons are transferred from electropositive atoms to electronegative atoms, forming electrostatic attractions between cations and anions arranged in rigid crystal lattices (e.g. NaCl lattice with high melting points). Covalent bonding arises between atoms sharing electron pairs when electronegativity differentials are smaller. Nonpolar covalent bonds involve equal sharing (e.g. O2, CH4), whereas polar covalent bonds involve unequal sharing producing permanent dipole moments (e.g. H2O, NH3). Metallic bonding occurs in elemental metals and alloys where valence electrons delocalize into a mobile 'sea of electrons' surrounding positively charged metallic kernels, explaining high electrical conductivity, thermal conductivity, malleability, and ductility.",
        },
        {
          name: "6.2 Intermolecular Forces and Hydrogen Bonding",
          content:
            "Intermolecular forces (IMFs) dictate macroscopic physical properties including boiling points, vapor pressure, and surface tension. London dispersion forces are ubiquitous van der Waals interactions arising from instantaneous induced dipole fluctuations. Dipole-dipole forces act between permanent polar molecules. Hydrogen bonding is an exceptionally potent dipole interaction occurring when hydrogen is covalently bonded to highly electronegative, small atoms with lone pairs: nitrogen, oxygen, or fluorine (N, O, F). Hydrogen bonds impart water with unique anomalous properties: anomalously high specific heat capacity, high heat of vaporization, capillary action, and solid ice having lower density than liquid water due to an open hexagonal hydrogen-bonded lattice.",
        },
      ],
    },
    {
      title: "Chapter 7: Ecology, Food Webs & Biogeochemical Cycles",
      startPage: 181,
      endPage: 215,
      sections: [
        {
          name: "7.1 Trophic Cascades and Energy Flow",
          content:
            "Ecosystems function through complex interactions between biotic communities and abiotic environments. Autotrophs (primary producers) convert solar or chemical energy into organic biomass. Heterotrophs (consumers) occupy subsequent trophic levels: herbivores as primary consumers, carnivores as secondary and tertiary consumers, and decomposers (fungi, bacteria) recycling detritus. Energy transfer between successive trophic levels follows Lindeman's 10% rule: approximately 90% of energy is dissipated as metabolic heat and waste, leaving only ~10% available to the next level, dictating the pyramidal structure of biomass and restricting food chain length. Keystone species exert disproportionately large ecological influences relative to their abundance; the removal of top predators triggers trophic cascades altering vegetation and river hydrology.",
        },
        {
          name: "7.2 The Carbon, Nitrogen, and Phosphorus Cycles",
          content:
            "Biogeochemical cycles trace the continuous movement of elemental matter through Earth's atmosphere, hydrosphere, lithosphere, and biosphere. In the Carbon Cycle, autotrophic photosynthesis fixes atmospheric CO2 into carbohydrates, while cellular respiration and combustion release CO2 back to the atmosphere. In the Nitrogen Cycle, atmospheric nitrogen gas (N2) is inert until fixed into bioavailable ammonium (NH4+) by nitrogen-fixing bacteria (Rhizobium, Azotobacter). Nitrifying bacteria (Nitrosomonas, Nitrobacter) oxidize ammonium into nitrites (NO2-) and nitrates (NO3-), which plants assimilate. Denitrifying bacteria return nitrogen to the atmosphere as N2. Unlike carbon and nitrogen, the Phosphorus Cycle lacks a gaseous atmospheric phase; phosphorus weathers from phosphate rock into soil and waterways.",
        },
      ],
    },
    {
      title: "Chapter 8: Earth's Geology, Plate Tectonics & Climate",
      startPage: 216,
      endPage: 250,
      sections: [
        {
          name: "8.1 Internal Structure of Earth and Plate Tectonics",
          content:
            "Earth is stratified into distinct concentric compositional and mechanical layers: the brittle outer lithosphere, the ductile asthenosphere within the upper mantle, the lower mantle, the liquid iron-nickel outer core (which generates Earth's geomagnetic field via geodynamo action), and the solid iron-nickel inner core. The theory of plate tectonics, synthesized from Alfred Wegener's continental drift and Harry Hess's seafloor spreading, states that Earth's lithosphere is fragmented into tectonic plates moving over the asthenosphere driven by mantle convection, slab pull, and ridge push. Plate boundaries are classified as divergent (seafloor spreading at mid-ocean ridges), convergent (subduction zones forming volcanic arcs or continental collisions forming mountain ranges like the Himalayas), and transform boundaries (strike-slip faults like the San Andreas Fault causing seismic tremors).",
        },
        {
          name: "8.2 Earth's Atmosphere and the Greenhouse Effect",
          content:
            "Earth's atmosphere comprises 78% nitrogen, 21% oxygen, 0.93% argon, and trace greenhouse gases. It is divided into layers: the troposphere (where weather occurs and temperature decreases with altitude), stratosphere (containing the ozone layer which absorbs ultraviolet solar radiation), mesosphere, thermosphere, and exosphere. The greenhouse effect is a naturally occurring thermal equilibrium process: incoming shortwave solar radiation penetrates the atmosphere, warming the terrestrial surface. The surface re-radiates thermal energy as longwave infrared radiation. Greenhouse gases—principally water vapor (H2O), carbon dioxide (CO2), methane (CH4), and nitrous oxide (N2O)—absorb infrared photons and re-emit them isotropically, maintaining Earth's average global temperature at a life-supporting ~15 deg C.",
        },
      ],
    },
    {
      title: "Chapter 9: Algebra, Functions & Mathematical Modeling",
      startPage: 251,
      endPage: 285,
      sections: [
        {
          name: "9.1 Linear, Quadratic and Exponential Functions",
          content:
            "Functions map elements from a domain set to a unique element in a codomain set. Linear functions have the standard form f(x) = mx + b, exhibiting constant first differences and rate of change m. Quadratic functions follow f(x) = ax^2 + bx + c (a != 0), producing parabolas whose roots are given by the quadratic formula x = (-b +/- sqrt(b^2 - 4ac)) / (2a). The discriminant Delta = b^2 - 4ac indicates real distinct roots (Delta > 0), one repeated real root (Delta = 0), or complex conjugate roots (Delta < 0). Exponential functions f(x) = a b^x (b > 0, b != 1) model phenomena whose growth or decay rate is directly proportional to current quantity, such as unconstrained bacterial proliferation, compound interest, and radioactive decay governed by N(t) = N_0 e^(-lambda t).",
        },
        {
          name: "9.2 Systems of Equations and Matrix Operations",
          content:
            "Systems of linear equations can be represented as vector matrix equations A x = b. Methods of solution include Gaussian elimination, substitution, and matrix inversion where x = A^(-1) b, valid when the determinant det(A) is nonzero. Matrices serve as foundational linear operators in vector spaces, computer graphics transformations, and quantum mechanics state vectors. Determinants determine system invertibility and volume scaling factors, while eigenvalues lambda and eigenvectors v satisfy A v = lambda v, crucial for identifying principal component directions and vibrational resonance modes.",
        },
      ],
    },
    {
      title: "Chapter 10: Calculus Foundations & Rate of Change",
      startPage: 286,
      endPage: 310,
      sections: [
        {
          name: "10.1 Limits, Continuity and the Derivative",
          content:
            "Calculus is the mathematical study of continuous change, pioneered independently by Isaac Newton and Gottfried Wilhelm Leibniz. The foundational construct is the limit: the value that a function approaches as the input approaches some point. A function f(x) is continuous at x = c if the limit as x approaches c exists and equals f(c). The derivative f'(x) quantifies the instantaneous rate of change of f(x) with respect to x, defined formally as the limit of the difference quotient: f'(x) = lim_{h -> 0} [f(x + h) - f(x)] / h. Geometrically, the derivative represents the slope of the tangent line to the function curve at that point. Key differentiation rules include the Power Rule (d/dx [x^n] = n x^(n-1)), Product Rule, Quotient Rule, and the Chain Rule (d/dx [f(g(x))] = f'(g(x)) g'(x)).",
        },
        {
          name: "10.2 The Fundamental Theorem of Calculus",
          content:
            "Integration represents the inverse operation of differentiation and computes accumulated quantities, such as area beneath a curve or accumulated displacement from velocity. Definite integrals are defined via Riemann sums: the limit of summing thin rectangular approximations as partition widths approach zero. The Fundamental Theorem of Calculus establishes the deep connection between differential calculus and integral calculus: Part 1 asserts that if F(x) = int_a^x f(t) dt, then F'(x) = f(x); Part 2 states that the definite integral of f(x) from a to b equals F(b) - F(a), where F is any antiderivative of f. This theorem provides analytical solutions for physical systems in astronomy, electromagnetism, and probability distributions.",
        },
      ],
    },
  ];

  const pages: RawPage[] = [];

  for (const ch of chapters) {
    const totalPages = ch.endPage - ch.startPage + 1;
    const pagesPerSec = Math.max(1, Math.floor(totalPages / ch.sections.length));

    ch.sections.forEach((sec, sIdx) => {
      const pageStart = ch.startPage + sIdx * pagesPerSec;
      const pageEnd = sIdx === ch.sections.length - 1 ? ch.endPage : pageStart + pagesPerSec - 1;

      for (let p = pageStart; p <= pageEnd; p++) {
        pages.push({
          pageNumber: p,
          sectionTitle: `${ch.title} - ${sec.name}`,
          text: `[Page ${p}] ${ch.title} | ${sec.name}\n\n${sec.content}\n\nKey Concepts for Page ${p}: In this page of the curriculum, students explore the mathematical and empirical principles governing ${sec.name}. Detailed diagrams, laboratory exercises, and conceptual proofs reinforce student comprehension for standardized K-12 assessments.`,
        });
      }
    });
  }

  return pages;
}

/**
 * Main Ingestion Pipeline
 */
async function runIngestion() {
  console.log("==================================================");
  console.log("Dumroo.ai Book Q&A Chatbot — Ingestion Pipeline");
  console.log("==================================================");

  const dataDir = path.join(process.cwd(), "data");
  const sourceDir = path.join(dataDir, "source");
  const chunksOutPath = path.join(dataDir, "chunks.json");

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(sourceDir)) {
    fs.mkdirSync(sourceDir, { recursive: true });
  }

  // Check for book.pdf or any .pdf file in data/source/
  let pdfPath = path.join(sourceDir, "book.pdf");
  if (!fs.existsSync(pdfPath)) {
    const pdfFiles = fs.readdirSync(sourceDir).filter((f) => f.toLowerCase().endsWith(".pdf"));
    if (pdfFiles.length > 0) {
      pdfPath = path.join(sourceDir, pdfFiles[0]);
    }
  }

  let rawPages: RawPage[] = [];

  if (fs.existsSync(pdfPath)) {
    console.log(`[1/4] Found PDF at ${pdfPath}. Parsing pages...`);
    try {
      rawPages = await parsePdf(pdfPath);
      console.log(`[1/4] Successfully parsed ${rawPages.length} pages from PDF.`);
    } catch (err) {
      console.warn(`[1/4] Could not parse PDF directly (${err}). Falling back to curriculum generator.`);
      rawPages = generateCurriculumBookPages();
    }
  } else {
    console.log(`[1/4] No PDF found at /data/source/book.pdf.`);
    console.log(`[1/4] Ingesting comprehensive ~300-page Dumroo K-12 STEM Curriculum Textbook...`);
    rawPages = generateCurriculumBookPages();
    console.log(`[1/4] Generated ${rawPages.length} textbook pages across 10 curriculum chapters.`);
  }

  console.log(`[2/4] Chunking textbook pages (~500-800 tokens with 15% overlap)...`);
  const rawChunks = chunkPageText(rawPages);
  console.log(`[2/4] Created ${rawChunks.length} distinct chunks.`);

  console.log(`[3/4] Initializing local embedding pipeline (@xenova/transformers Xenova/all-MiniLM-L6-v2)...`);
  const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

  // Check for Cloud API keys
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  let genAI: GoogleGenerativeAI | null = null;
  let openai: OpenAI | null = null;

  if (geminiKey) {
    genAI = new GoogleGenerativeAI(geminiKey);
    console.log("[3/4] Cloud API detected: Google Gemini (text-embedding-004)");
  } else if (openaiKey) {
    openai = new OpenAI({ apiKey: openaiKey });
    console.log("[3/4] Cloud API detected: OpenAI (text-embedding-3-small)");
  } else {
    console.log("[3/4] No cloud API key detected in env. Cloud embeddings will use offline vectors or run on demand.");
  }

  console.log(`[4/4] Computing dual embeddings for all ${rawChunks.length} chunks...`);
  const finalChunks: ChunkRecord[] = [];

  for (let i = 0; i < rawChunks.length; i++) {
    const chunk = rawChunks[i];
    const chunkId = `chunk_p${chunk.pageNumber}_${i + 1}`;
    const cleanText = chunk.text.replace(/\s+/g, " ").trim();

    // 1. Generate local 384-d offline embedding
    const localOutput = await extractor(cleanText, { pooling: "mean", normalize: true });
    const offlineVec = Array.from(localOutput.data as Float32Array);

    // 2. Generate cloud embedding if API is configured
    let onlineVec: number[] | undefined = undefined;
    if (genAI) {
      try {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
          const res = await model.embedContent(cleanText);
          onlineVec = res.embedding.values;
        } catch {
          const fallbackModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
          const res = await fallbackModel.embedContent(cleanText);
          onlineVec = res.embedding.values;
        }
      } catch (err) {
        console.warn(`Gemini embed failed for chunk ${chunkId}:`, err);
      }
    } else if (openai) {
      try {
        const res = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: cleanText,
        });
        onlineVec = res.data[0].embedding;
      } catch (err) {
        console.warn(`OpenAI embed failed for chunk ${chunkId}:`, err);
      }
    }

    finalChunks.push({
      chunkId,
      pageNumber: chunk.pageNumber,
      sectionTitle: chunk.sectionTitle,
      text: chunk.text,
      embeddings: {
        offline: offlineVec,
        online: onlineVec,
      },
    });

    if ((i + 1) % 25 === 0 || i === rawChunks.length - 1) {
      console.log(`      Processed ${i + 1}/${rawChunks.length} chunks...`);
    }
  }

  fs.writeFileSync(chunksOutPath, JSON.stringify(finalChunks, null, 2), "utf-8");
  console.log(`\n✅ Ingestion complete! Saved ${finalChunks.length} chunks to:`);
  console.log(`   ${chunksOutPath}`);

  // Optional vector store push: if Chroma or pgvector is configured
  if (process.env.CHROMA_URL) {
    console.log(`\nSyncing chunks to Chroma instance at ${process.env.CHROMA_URL}...`);
    try {
      await fetch(`${process.env.CHROMA_URL}/api/v1/collections/book-qa/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: finalChunks.map((c) => c.chunkId),
          documents: finalChunks.map((c) => c.text),
          metadatas: finalChunks.map((c) => ({
            pageNumber: c.pageNumber,
            sectionTitle: c.sectionTitle || "",
          })),
          embeddings: finalChunks.map((c) => c.embeddings.online || c.embeddings.offline),
        }),
      });
      console.log("✅ Synced with Chroma vector database!");
    } catch (e) {
      console.warn("Could not sync with Chroma:", e);
    }
  }
}

// Execute if run directly
runIngestion().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
