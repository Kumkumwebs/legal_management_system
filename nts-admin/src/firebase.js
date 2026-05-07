import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";


const firebaseConfig = {
    apiKey: "AIzaSyBK2i2bGadzQ-0n01jodkJXyZPi5Ug4MpA",
    authDomain: "nts-legal-pro.firebaseapp.com",
    projectId: "nts-legal-pro",
    storageBucket: "nts-legal-pro.firebasestorage.app",
    messagingSenderId: "395033126864",
    appId: "1:395033126864:web:06fec00aca462b66b53bd5"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestPermission = async () => {
    try {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            const token = await getToken(messaging, {
                vapidKey: "BEy2SG82dU6P8MQsFVQPPBZGy2ak8M9NOg3UeQDIpfWr8DntDEOSv-A4tlE27r5PXyJk8v1tdIwFFd0LpRfO_i8"
            });

            console.log("FCM TOKEN:", token);
            return token;
        } else {
            console.log("Permission denied");
        }
    } catch (error) {
        console.error("FCM ERROR:", error);
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });