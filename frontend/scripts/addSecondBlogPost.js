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

const secondBlogPost = {
  slug: "predicting-post-radioiodine-azotemia-hyperthyroid-cats",
  title: "Can We Predict Post-Radioiodine Azotemia in Hyperthyroid Cats?",
  subtitle: "A Clinically Oriented Review of a 2025 JVIM Metabolomics Study",
  author: "Ruleout Team",
  authorEmail: "team@ruleout.com",
  date: Timestamp.fromDate(new Date("2025-11-18")),
  category: "Research",
  isFeatured: false,
  content: `# Can We Predict Post-Radioiodine Azotemia in Hyperthyroid Cats?

A Clinically Oriented Review of a 2025 JVIM Metabolomics Study

Hyperthyroidism is one of the most common endocrine diseases in senior cats—and radioiodine therapy (I-131) remains the gold-standard treatment.

But one major clinical concern persists:

**Which hyperthyroid cats will develop renal azotemia after treatment?**

Because hyperthyroidism can mask chronic kidney disease (CKD), identifying at-risk cats prior to radioiodine treatment is crucial. A new 2025 study published in the Journal of Veterinary Internal Medicine (JVIM) offers the strongest biomarker candidate to date:

**Urinary asymmetric dimethylarginine (ADMA)**

This blog breaks down the study's design, major findings, and how veterinarians can use this information to guide owner expectations and decision-making.


## Background: Why Predicting Post-I-131 Azotemia Matters

Hyperthyroidism increases:

- GFR
- Renal blood flow
- Muscle catabolism → lowering serum creatinine

This combination frequently hides underlying CKD. Once I-131 restores a euthyroid state, renal perfusion normalizes—unmasking renal insufficiency in susceptible cats.

### Clinically:

- Cats who become hypothyroid + azotemic after treatment have significantly shorter survival
- Owners often face unexpected post-treatment kidney disease, creating frustration and financial strain
- A reliable pre-treatment biomarker could meaningfully improve planning and case selection

The 2025 JVIM study investigated whether metabolomics could reveal early predictors of renal decline.


## Study Design at a Glance

- 31 hyperthyroid cats treated with radioactive iodine
- All cats non-azotemic before treatment
- Follow-up at 3, 6, and 12 months
- Cats categorized as:
  - Azotemic after I-131: 7 cats
  - Non-azotemic after I-131: 24 cats

All included cats were euthyroid after treatment, ensuring the study evaluated true renal azotemia, not hypothyroid-related changes.

### Targeted Metabolomics Approach

Using high-resolution UHPLC-Orbitrap mass spectrometry, the team profiled:

- 64 urinary metabolites + 36 ratios
- 79 serum metabolites + 45 ratios

Multivariate (LASSO) and univariate logistic regression determined the predictive power of each biomarker.


## Key Finding: Urinary ADMA Is a Strong Predictor of Post-I-131 Azotemia

Across analytical methods, urinary asymmetric dimethylarginine (ADMA) consistently outperformed all other metabolites and clinical parameters.

### Performance of Urinary ADMA (Univariate Model)

- AUC: 0.851
- Accuracy: 0.903
- Sensitivity: 0.714
- Specificity: 0.958

These values indicate excellent ability to identify cats who will remain non-azotemic and good ability to detect those who will decline.

The study even provides the logistic regression formula for clinical prediction, highlighting ADMA's robustness.

### A Four-Metabolite Urinary Panel Also Performed Well

LASSO selected a panel of:

- ADMA
- Adenine
- Ornithine
- 5-hydroxyindole-3-acetic acid

with a combined AUC of 0.865, very similar to ADMA alone.


## What About USG, SDMA, Creatinine, or Other Traditional Predictors?

### Urinary Specific Gravity

- USG <1.035 showed a moderate predictive value (AUC 0.661)
- Adding USG to multivariate models did not improve performance
- Cats with USG >1.035 could still become azotemic

### Serum SDMA

Previous studies suggested potential value, but sensitivity was poor (15–33%) and normalization after hyperthyroidism resolution complicates interpretation.

### Creatinine & T4

Not reliable due to:

- Hyperthyroid muscle wasting
- Masked kidney disease
- Physiologic increases in GFR

### Other biomarkers studied historically (UPC, CysC, VEGF, NAG, FGF-23)

Most lacked:

- Sensitivity
- Specificity
- Validation
- Clinical practicality

Urinary ADMA significantly outperformed all of them.


## Why Urinary ADMA May Be Biologically Meaningful

ADMA is a uremic toxin produced via protein methylation. Key features:

- Inhibits endothelial nitric oxide synthase (eNOS)
- Impairs renal blood flow regulation
- Increases oxidative stress
- Linked to kidney disease progression in humans and rodents

Unlike SDMA, ADMA is mostly metabolized (80–90%), not purely renally excreted.

### Study Observation

Cats who later developed azotemia showed:

- Significantly lower urinary ADMA levels
- Before I-131: p = 0.027
- After I-131: p = 0.003

This suggests early deficits in ADMA excretion/metabolism may signal impending renal compromise.


## Clinical Takeaways for Veterinarians

### ADMA is the strongest pre-I-131 risk marker identified to date

Its high specificity (0.958) makes it especially useful for identifying cats unlikely to develop azotemia—critical when counseling owners.

### A single urine sample may meaningfully guide treatment strategy

Helps discuss realistic expectations and supports decisions about:

- I-131 dosing
- Methimazole trial prior to therapy
- Pre-treatment renal workup
- Post-therapy monitoring intensity

### USG and SDMA add limited predictive value

They should not be relied upon alone.

### Metabolomics-based testing is not yet widely available

But findings lay the groundwork for future commercial assays—possibly ELISA-based urinary ADMA tests.


## Study Limitations

- Small sample size, especially the azotemic group (n=7)
- GFR measurement was not performed
- Potential inclusion of subclinical CKD in the non-azotemic group
- LC-MS–based assays are not yet clinically routine
- Minor medication differences (e.g., ACE inhibitors) may affect ADMA

Despite this, the findings remain scientifically sound and clinically compelling.


## Conclusion: Urinary ADMA Has Strong Potential as a Predictive Biomarker

This 2025 JVIM study provides the clearest evidence to date that:

**Urinary ADMA is a reliable, biologically relevant, and highly accurate predictor of post-radioiodine azotemia in hyperthyroid cats.**

While additional validation is needed and clinical assay development is still in progress, this biomarker may soon become an essential tool for:

- Risk assessment
- Treatment planning
- Managing owner expectations
- Early detection of renal deterioration

As feline medicine continues integrating metabolomics and precision diagnostics, urinary ADMA represents a promising step toward more personalized, evidence-based care.


## Primary Source

Vanden Broecke E, Stammeleer L, Stock E, De Paepe E, Daminet S.

*Efficacy of Urine Asymmetric Dimethylarginine Concentration to Predict Azotemia in Hyperthyroid Cats After Radio-Iodine Treatment.*

Journal of Veterinary Internal Medicine. 2025;39:e70096.`,
  tableOfContents: [
    { id: "background-why-predicting-post-i-131-azotemia-matters", title: "Background: Why Predicting Post-I-131 Azotemia Matters" },
    { id: "study-design-at-a-glance", title: "Study Design at a Glance" },
    { id: "key-finding-urinary-adma-is-a-strong-predictor-of-post-i-131-azotemia", title: "Key Finding: Urinary ADMA Is a Strong Predictor" },
    { id: "what-about-usg-sdma-creatinine-or-other-traditional-predictors", title: "What About USG, SDMA, Creatinine?" },
    { id: "why-urinary-adma-may-be-biologically-meaningful", title: "Why Urinary ADMA May Be Biologically Meaningful" },
    { id: "clinical-takeaways-for-veterinarians", title: "Clinical Takeaways for Veterinarians" },
    { id: "study-limitations", title: "Study Limitations" },
    { id: "conclusion-urinary-adma-has-strong-potential-as-a-predictive-biomarker", title: "Conclusion" },
    { id: "primary-source", title: "Primary Source" },
  ],
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

async function addBlogPost() {
  console.log("Creating second blog post in Firebase...");
  try {
    const docRef = await addDoc(collection(db, "blogPosts"), secondBlogPost);
    console.log("✅ Blog post created successfully!");
    console.log("Document ID:", docRef.id);
    console.log("Slug:", secondBlogPost.slug);
    console.log("\nYou can now view the blog at:");
    console.log(`http://localhost:3000/blog/${secondBlogPost.slug}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating blog post:", error);
    process.exit(1);
  }
}

addBlogPost();
