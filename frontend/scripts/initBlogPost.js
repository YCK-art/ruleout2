const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, Timestamp } = require("firebase/firestore");

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDH71kJvmJRhDqueiT8oqt9HzBV56lSOIE",
  authDomain: "medical-8c169.firebaseapp.com",
  projectId: "medical-8c169",
  storageBucket: "medical-8c169.firebasestorage.app",
  messagingSenderId: "141392207317",
  appId: "1:141392207317:web:206b97972e40a2bc77b15c",
  measurementId: "G-ZPSY1G6NNY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const firstBlogPost = {
  slug: "enteropathogenic-bacteria-diarrhea-multicat-households",
  title: "Are Enteropathogenic Bacteria Really Causing Diarrhea in Multicat Households?",
  subtitle: "A Rule-Out–Based Interpretation of a 2025 JVIM Study",
  author: "Ruleout Team",
  authorEmail: "team@ruleout.com",
  date: Timestamp.fromDate(new Date("2025-11-17")),
  category: "Research",
  isFeatured: true,
  content: `# Are Enteropathogenic Bacteria Really Causing Diarrhea in Multicat Households?
A Rule-Out–Based Interpretation of a 2025 JVIM Study

**Author: Ruleout Team**
**Date: November 17, 2025**

## Introduction

Diarrhea is one of the most common clinical complaints in cats. In multicat households, it often prompts concern about infectious causes, leading many clinicians to order fecal PCR panels without a full diagnostic context.

A 2025 study published in the Journal of Veterinary Internal Medicine analyzed 234 cats and found **no significant association** between several commonly suspected bacteria and diarrhea. This challenges long-standing assumptions surrounding PCR interpretation.

This article summarizes the study findings in a clinically meaningful way to help veterinarians and educated pet owners understand what fecal PCR truly indicates.

## Study Overview

### Study Population

- 234 cats from 37 breeding catteries
- Diarrhea defined as Purina fecal score 4 or higher
- Only 9.8 percent of cats had diarrhea

### PCR Targets

- Escherichia coli
- Clostridium perfringens (cpa and cpe genes)
- Clostridioides difficile
- Campylobacter jejuni and C. coli
- Salmonella enterica

### Key Finding

None of these organisms showed a significant correlation with diarrhea after correction for multiple comparisons. This suggests that most positive PCR results reflect **normal flora, environmental exposure, or incidental colonization**, not disease.


## Findings for Each Bacterium

### Escherichia coli

E. coli was present in 100 percent of samples, with no difference between diarrheic and non-diarrheic cats.

**Interpretation:**
E. coli is a normal gut organism in cats, and PCR detection alone has no diagnostic value.

### Clostridium perfringens (cpa and cpe)

#### cpa gene

- Found in more than 80 percent of cats
- No significant association with diarrhea
- Higher median levels in diarrheic cats, but broad overlap

This pattern suggests dysbiosis rather than infection.

#### cpe gene

- Detected in 7.7 percent of cats
- Present only in cats without diarrhea

**Interpretation:**
cpa and cpe PCR results should not lead directly to antimicrobial treatment without evidence of active toxin production or compatible clinical signs.

### Campylobacter jejuni and Campylobacter coli

- Detected in a small percentage of cats
- No link to diarrhea

**Interpretation:**
Campylobacter is commonly incidental in cats and should not be over-interpreted unless clear risk factors, such as raw food diets, are present.

### Clostridioides difficile

- Detected in 2.3 percent of cats
- All positive cats had normal stool
- Many isolates in cats are non-toxigenic

**Interpretation:**
PCR detects DNA, not toxin activity. True C. difficile infection in cats is uncommon.

### Salmonella enterica

- Found in one diarrheic and one non-diarrheic cat

**Interpretation:**
Healthy cats may shed Salmonella intermittently, especially those fed raw diets. PCR positivity alone does not confirm disease.


## Environmental and Husbandry Factors

Several variables influenced bacterial detection but did not correlate with diarrhea.

- Larger cat populations increased cpa detection
- Raw diets increased both cpa and cpe detection
- Extra litter boxes slightly increased cpe positivity
- More space per cat unexpectedly correlated with higher cpa levels

These patterns indicate that environmental exposure, population density, and diet shape PCR results more than clinical illness.


## Clinical Implications

### Use PCR Results Carefully

PCR is highly sensitive and can detect harmless or incidental organisms. Positive results should always be interpreted in context.

### Avoid Antibiotics Based Only on PCR

Unnecessary antimicrobial therapy can cause:

- Microbiome disruption
- Antimicrobial resistance
- Worsening or prolonged gastrointestinal signs

Treatment decisions must consider the full clinical picture.

### Perform a Comprehensive Diagnostic Work-Up

Meaningful evaluation should include:

- Dietary history
- Parasite screening
- Assessment for systemic disease
- Environmental and stress factors
- Dysbiosis vs infection considerations
- Imaging or biopsy for chronic or severe cases

PCR should be supplemental, not the sole diagnostic.

### Appropriate Uses for PCR

- Screening fecal donors
- Assessing zoonotic risk
- Investigating true outbreaks among symptomatic cats

Even in these cases, clinical relevance must be judged carefully.


## Key Clinical Message

**Detection does not equal disease.**

Most bacteria identified by fecal PCR in cats living in multicat environments represent normal flora or incidental findings. Clinical signs, diet, environment, and diagnostic context must guide interpretation.


## Primary Source

Bogedale K, Klein-Richers U, Felten S, et al.
*Presence of Potential Enteropathogenic Bacteria in Cats and Association With Diarrhea in Multicat Households.*
Journal of Veterinary Internal Medicine. 2025;39:e70138.
doi: 10.1111/jvim.70138.`,
  tableOfContents: [
    { id: "introduction", title: "Introduction" },
    { id: "study-overview", title: "Study Overview" },
    { id: "findings-for-each-bacterium", title: "Findings for Each Bacterium" },
    { id: "environmental-and-husbandry-factors", title: "Environmental and Husbandry Factors" },
    { id: "clinical-implications", title: "Clinical Implications" },
    { id: "key-clinical-message", title: "Key Clinical Message" },
    { id: "primary-source", title: "Primary Source" },
  ],
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

async function initializeBlogPost() {
  console.log("Creating first blog post in Firebase...");
  try {
    const docRef = await addDoc(collection(db, "blogPosts"), firstBlogPost);
    console.log("✅ Blog post created successfully!");
    console.log("Document ID:", docRef.id);
    console.log("Slug:", firstBlogPost.slug);
    console.log("\nYou can now view the blog at:");
    console.log(`http://localhost:3000/blog/${firstBlogPost.slug}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating blog post:", error);
    process.exit(1);
  }
}

initializeBlogPost();
