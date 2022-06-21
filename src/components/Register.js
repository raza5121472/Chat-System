import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import { getDatabase, set, ref as dbref } from "firebase/database";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import "./../App.css";
import { firebaseConfig } from "./firebaseConfig";
export const Register = ({ onLogin }) => {
  initializeApp(firebaseConfig);
  const db = getDatabase();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  const uploadFile = async (e) => {
    const storage = getStorage();
    const metadata = {
      contentType: "image/jpeg",
    };
    const storageRef = ref(storage, "images/" + e.target.files[0].name);
    const uploadTask = uploadBytesResumable(
      storageRef,
      e.target.files[0],
      metadata
    );
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
          default:
            break;
        }
      },
      (error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case "storage/unauthorized":
            // User doesn't have permission to access the object
            break;
          case "storage/canceled":
            // User canceled the upload
            break;

          // ...

          case "storage/unknown":
            // Unknown error occurred, inspect error.serverResponse
            break;
          default:
            break;
        }
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImage(downloadURL);
        });
      }
    );
  };

  useEffect(() => {
    if (window.verifier) {
      window.verifier = null;
    }
  }, []);

  const sendOtpVerification = async (e, type) => {
    e.preventDefault();
    // setShowLoader(true);
    const auth = getAuth();
    if (!window.verifier || window.verifier?.destroyed) {
      window.verifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {},
        },
        auth
      );
    }
    window.verifier.verify();
    SignUpWithEmail(type);
  };

  const SignUpWithEmail = (type) => {
    const auth = getAuth();
    const appVerifier = window.verifier;
    signInWithPhoneNumber(auth, "+" + phone, appVerifier)
      .then((confirmationResult) => {
        const otp = prompt("Enter Otp");
        confirmationResult.confirm(otp).then((resp) => {
          if (type === "register") {
            set(dbref(db, "Users/" + resp.user.uid), {
              name: name,
              id: resp.user.uid,
              phoneNumber: "+" + phone,
              image: image,
              status: "offline",
            }).then(() => {
              updateProfile(auth.currentUser, {
                displayName: name,
                photoURL: image,
              });
              alert("Registered user successfully");
            });
          } else {
            localStorage.setItem("loggedIn", true);
            localStorage.setItem(
              "user",
              JSON.stringify({
                name: resp.user.displayName,
                id: resp.user.uid,
                phoneNumber: resp.user.phoneNumber,
              })
            );
            onLogin();
          }
        });
      })
      .catch((error) => {
        console.log(error);
        alert("Failed");
        // console.log(window.document.getElementsByName("form"))
      });
  };

  return (
    <div className="main register">
      <input type="checkbox" id="chk" aria-hidden="true" />
      <div className="signup">
        <form onSubmit={(e) => sendOtpVerification(e, "register")}>
          <label htmlFor="chk" aria-hidden="true">
            Sign up
          </label>
          <input
            type="text"
            className="form-control"
            name="txt"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="User name"
            required
          />
          <PhoneInput
            inputClass="input"
            value={phone}
            placeholder="Enter Mobile Number"
            onChange={(phone) => setPhone(phone)}
          />
          <input
            type="file"
            className="file"
            onChange={(e) => uploadFile(e)}
            placeholder="Select Picture"
          />
          <div id="recaptcha-container"></div>
          <button type="submit">Sign up</button>
        </form>
      </div>
      <div className="login">
        <form onSubmit={(e) => sendOtpVerification(e, "login")}>
          <label htmlFor="chk" aria-hidden="true">
            Login
          </label>
          <PhoneInput
            inputClass="input"
            value={phone}
            placeholder="Enter Mobile Number"
            onChange={(phone) => setPhone(phone)}
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};
