const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, deleteDoc, doc } = require("firebase/firestore");

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

async function cleanupBlogPosts() {
  console.log("Fetching all blog posts...");
  try {
    const querySnapshot = await getDocs(collection(db, "blogPosts"));

    console.log(`\nFound ${querySnapshot.size} blog posts:\n`);

    querySnapshot.forEach((document) => {
      const data = document.data();
      console.log(`ID: ${document.id}`);
      console.log(`Title: ${data.title}`);
      console.log(`Slug: ${data.slug}`);
      console.log(`Created: ${data.createdAt?.toDate()}`);
      console.log('---');
    });

    // Delete all posts
    console.log('\nDeleting all blog posts...');
    const deletePromises = [];
    querySnapshot.forEach((document) => {
      deletePromises.push(deleteDoc(doc(db, "blogPosts", document.id)));
    });

    await Promise.all(deletePromises);
    console.log('\n✅ All blog posts deleted successfully!');
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

cleanupBlogPosts();
