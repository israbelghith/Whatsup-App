// Import the functions you need from the SDKs you need
import app from "firebase/compat/app";
import {createClient} from "@supabase/supabase-js";
import "firebase/compat/auth";
import "firebase/compat/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2WVs22b7g70dwnwhSbhyFzcB6ri9FlLQ",
  authDomain: "whatsup-belghithisraa.firebaseapp.com",
  projectId: "whatsup-belghithisraa",
  storageBucket: "whatsup-belghithisraa.firebasestorage.app",
  messagingSenderId: "1009672648924",
  appId: "1:1009672648924:web:57f1ac830e023a14e41c19",
  measurementId: "G-LSZKK88SY1"
};

// Initialize Firebase
const firebase = app.initializeApp(firebaseConfig);
export default firebase;

const supabaseUrl="https://qfrgnrejwroogulrlnfm.supabase.co";
const supabaseKey="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmcmducmVqd3Jvb2d1bHJsbmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODMzNzYsImV4cCI6MjA2MTA1OTM3Nn0.SK3uAIc6u67urBzCZRTlQyLKiCTMST8QWF4XpyT6oPE";
const supabase= createClient(supabaseUrl,supabaseKey);

export {supabase};