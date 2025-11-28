const { initializeApp } = require("firebase/app");
const { getFirestore, doc, updateDoc } = require("firebase/firestore");

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

async function updateTableOfContents() {
  try {
    const docId = "ra11QDSFY4to4YGkXfPZ"; // Second blog post ID
    const docRef = doc(db, "blogPosts", docId);

    const updatedTOC = [
      { id: "introduction", title: "Introduction" },
      { id: "background-why-predicting-post-i-131-azotemia-matters", title: "Background: Why Predicting Post-I-131 Azotemia Matters" },
      { id: "study-design-at-a-glance", title: "Study Design at a Glance" },
      { id: "key-finding-urinary-adma-is-a-strong-predictor-of-post-i-131-azotemia", title: "Key Finding: Urinary ADMA Is a Strong Predictor" },
      { id: "what-about-usg-sdma-creatinine-or-other-traditional-predictors", title: "What About USG, SDMA, Creatinine?" },
      { id: "why-urinary-adma-may-be-biologically-meaningful", title: "Why Urinary ADMA May Be Biologically Meaningful" },
      { id: "clinical-takeaways-for-veterinarians", title: "Clinical Takeaways for Veterinarians" },
      { id: "study-limitations", title: "Study Limitations" },
      { id: "conclusion-urinary-adma-has-strong-potential-as-a-predictive-biomarker", title: "Conclusion" },
      { id: "primary-source", title: "Primary Source" },
    ];

    await updateDoc(docRef, {
      tableOfContents: updatedTOC
    });

    console.log("✅ Table of Contents updated successfully!");
    console.log("Updated TOC:", updatedTOC);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating table of contents:", error);
    process.exit(1);
  }
}

updateTableOfContents();
