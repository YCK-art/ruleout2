const { initializeApp } = require("firebase/app");
const { getFirestore, doc, updateDoc } = require("firebase/firestore");
const { getStorage, ref, getDownloadURL } = require("firebase/storage");

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
const storage = getStorage(app);

async function updateBlogImageUrl() {
  try {
    // Get the download URL for hyperthyroidism.jpg
    const imageRef = ref(storage, "hyperthyroidism.jpg");
    const imageUrl = await getDownloadURL(imageRef);

    console.log("✅ Image URL retrieved:", imageUrl);

    // Update the second blog post with the image URL
    const docId = "ra11QDSFY4to4YGkXfPZ"; // Second blog post ID
    const docRef = doc(db, "blogPosts", docId);

    await updateDoc(docRef, {
      imageUrl: imageUrl,
      updatedAt: new Date()
    });

    console.log("✅ Blog post updated successfully with main image!");
    console.log("Image URL:", imageUrl);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating blog post image:", error);
    process.exit(1);
  }
}

updateBlogImageUrl();
