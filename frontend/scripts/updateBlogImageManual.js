const { initializeApp } = require("firebase/app");
const { getFirestore, doc, updateDoc, Timestamp } = require("firebase/firestore");

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

async function updateBlogImage() {
  try {
    // The image URL you need to paste from Firebase Console
    // Go to Firebase Console > Storage > hyperthyroidism.jpg > Click to get download URL
    const imageUrl = process.argv[2];

    if (!imageUrl) {
      console.error("❌ Please provide the image URL as an argument");
      console.log("\nUsage: node updateBlogImageManual.js <IMAGE_URL>");
      console.log("\nTo get the URL:");
      console.log("1. Go to Firebase Console > Storage");
      console.log("2. Click on hyperthyroidism.jpg");
      console.log("3. Copy the download URL");
      console.log("4. Run: node scripts/updateBlogImageManual.js \"<paste URL here>\"");
      process.exit(1);
    }

    // Update the second blog post
    const docId = "ra11QDSFY4to4YGkXfPZ"; // Second blog post ID
    const docRef = doc(db, "blogPosts", docId);

    await updateDoc(docRef, {
      imageUrl: imageUrl,
      updatedAt: Timestamp.now()
    });

    console.log("✅ Blog post updated successfully with main image!");
    console.log("Image URL:", imageUrl);
    console.log("\nYou can now view the blog at:");
    console.log("http://localhost:3000/blog/predicting-post-radioiodine-azotemia-hyperthyroid-cats");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating blog post:", error);
    process.exit(1);
  }
}

updateBlogImage();
