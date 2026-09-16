// const db = firebase.firestore();
// const auth = firebase.auth();
// const messaging = firebase.messaging();
messaging.onMessage((payload) => {
    console.log("Foreground notification received:", payload);

    const title = payload.notification?.title || "Ridezy";
    const body =
        payload.notification?.body ||
        "You have a new ride update.";

    if (Notification.permission === "granted") {
    navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
            body: body,
            icon: "/favicon.ico",
            badge: "/favicon.ico"
        });
    });
}
});

function createUserProfile(user) {
    const userRef = db.collection("users").doc(user.uid);

    return userRef.set({
        name: user.displayName || "",
        email: user.email || "",
        batch: getBatchFromEmail(user.email),
        phone: "",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
}


function getBatchFromEmail(email) {
    const batch = email.split(".")[1].split("@")[0];
    return batch.toUpperCase();
}

function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.log("This browser does not support notifications.");
        return;
    }

    Notification.requestPermission().then((permission) => {

        if (permission !== "granted") {
            console.log("Notification permission denied.");
            return;
        }

        console.log("Notification permission granted.");

        return messaging.getToken({
            vapidKey: "BEU1GjpsCkKprWol6S_NYub9lzibFN31PrjbRR20qRwCjj_wNIznUetGfb191haZFAEc1UAG_NXv0h_uZprRPck"

        });

    }).then((token) => {

        if (!token || !auth.currentUser) {
            return;
        }

        console.log("FCM token received:", token);

        return db.collection("users")
            .doc(auth.currentUser.uid)
            .set({
                fcmTokens: firebase.firestore.FieldValue.arrayUnion(token),
                notificationsEnabled: true,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

    }).then(() => {

        console.log("FCM token saved successfully.");

    }).catch((error) => {

        console.error(
            "Notification setup error:",
            error
        );

    });
}




function saveProfile() {

    const phone =
        document.getElementById("phoneNumber").value.trim();

    if (!/^[6-9]\d{9}$/.test(phone)) {
        alert("Please enter a valid 10-digit Indian mobile number.");
        return;
    }

    const user = auth.currentUser;

    if (!user) {
        alert("Please login first.");
        return;
    }

    db.collection("users")
        .doc(user.uid)
        .set({
            phone: phone,
            updatedAt:
                firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true })
        .then(() => {

            document
                .getElementById("profileSection")
                .classList.add("hidden");

            document
                .querySelector(".app")
                .classList.remove("hidden");

            console.log("Profile completed successfully.");

        })
        .catch((error) => {

            console.error("Profile update error:", error);

            alert(
                "Could not save your phone number: " +
                error.message
            );

        });
}


auth.onAuthStateChanged((user) => {

    const loginSection =
        document.getElementById("loginSection");

    const profileSection =
        document.getElementById("profileSection");

    const appSection =
        document.querySelector(".app");


    if (user) {

        loginSection.classList.add("hidden");

        db.collection("users")
            .doc(user.uid)
            .get()
            .then((doc) => {

                if (!doc.exists) {

                    return createUserProfile(user)
                        .then(() => {

                            profileSection
                                .classList.remove("hidden");

                            appSection
                                .classList.add("hidden");

                        });

                }


                const profile = doc.data();


                if (!profile.phone) {

                    profileSection
                        .classList.remove("hidden");

                    appSection
                        .classList.add("hidden");

                } else {

                    profileSection
                        .classList.add("hidden");

                    appSection
                        .classList.remove("hidden");

                    console.log(
                        "Logged in:",
                        user.email
                    );

                    requestNotificationPermission();

                }

            })
            .catch((error) => {

                console.error(
                    "Profile check error:",
                    error
                );

                alert(
                    "Could not load your profile."
                );

            });


    } else {

        loginSection.classList.remove("hidden");

        profileSection.classList.add("hidden");

        appSection.classList.add("hidden");

    }

});


// MICROSOFT LOGIN

const microsoftProvider =
    new firebase.auth.OAuthProvider("microsoft.com");


function loginWithMicrosoft() {

    microsoftProvider.setCustomParameters({
        tenant: "e387d883-3bb4-4855-b7a0-b15756f25f61"
    });

    auth.signInWithPopup(microsoftProvider)
        .then((result) => {

            console.log(
                "Microsoft login successful:",
                result.user.email
            );

        })
        .catch((error) => {

            console.error(
                "Microsoft login error:",
                error
            );

            alert(
                "Microsoft login failed: " +
                error.message
            );

        });
}


// EMAIL LOGIN

function loginWithEmail() {

    const email =
        document.getElementById("email")
            .value.trim()
            .toLowerCase();

    const password =
        document.getElementById("password").value;


    if (!email || !password) {

        alert(
            "Please enter email and password."
        );

        return;
    }


    auth.signInWithEmailAndPassword(
        email,
        password
    )

        .then((userCredential) => {

            const user =
                userCredential.user;

            return user.reload()
                .then(() => {

                    if (!user.emailVerified) {

                        return auth.signOut()
                            .then(() => {

                                throw new Error(
                                    "Please verify your IIM Shillong email before signing in."
                                );

                            });

                    }


                    console.log(
                        "Email login successful:",
                        user.email
                    );

                });

        })

        .catch((error) => {

            console.error(
                "Email login error:",
                error
            );

            alert(
                "Login failed: " +
                error.message
            );

        });
}


// RESEND VERIFICATION EMAIL

function resendVerificationEmail() {

    const email =
        document.getElementById("email")
            .value.trim()
            .toLowerCase();

    const password =
        document.getElementById("password").value;


    if (!email || !password) {

        alert(
            "Please enter your email and password first."
        );

        return;
    }


    auth.signInWithEmailAndPassword(
        email,
        password
    )

        .then((userCredential) => {

            const user =
                userCredential.user;


            if (user.emailVerified) {

                alert(
                    "Your email is already verified. You can sign in normally."
                );

                return auth.signOut();

            }


            return user.sendEmailVerification()
                .then(() => {

                    alert(
                        "Verification email sent. Please check your Inbox or Junk/Spam folder."
                    );

                    return auth.signOut();

                });

        })

        .catch((error) => {

            console.error(
                "Resend verification error:",
                error
            );

            alert(
                "Could not resend verification email: " +
                error.message
            );

        });
}


// SHOW SIGNUP

function showSignup() {

    document
        .getElementById("loginSection")
        .classList.add("hidden");

    document
        .getElementById("signupSection")
        .classList.remove("hidden");

}


// SHOW LOGIN

function showLogin() {

    document
        .getElementById("signupSection")
        .classList.add("hidden");

    document
        .getElementById("loginSection")
        .classList.remove("hidden");

}


// CREATE ACCOUNT

function createAccount() {

    const name =
        document.getElementById("signupName")
            .value.trim();

    const email =
        document.getElementById("signupEmail")
            .value.trim()
            .toLowerCase();

    const password =
        document.getElementById("signupPassword")
            .value;

    const confirmPassword =
        document.getElementById("signupConfirmPassword")
            .value;


    if (!name) {

        alert(
            "Please enter your full name."
        );

        return;
    }


    if (!email.endsWith("@iimshillong.ac.in")) {

        alert(
            "Please use your IIM Shillong institute email."
        );

        return;
    }


    if (password.length < 6) {

        alert(
            "Password must be at least 6 characters."
        );

        return;
    }


    if (password !== confirmPassword) {

        alert(
            "Passwords do not match."
        );

        return;
    }


    auth.createUserWithEmailAndPassword(
        email,
        password
    )

        .then((userCredential) => {

            const user =
                userCredential.user;


            return db.collection("users")
                .doc(user.uid)
                .set({

                    name: name.toUpperCase(),

                    email: email,

                    batch: getBatchFromEmail(email),

                    createdAt:
                        firebase.firestore.FieldValue.serverTimestamp(),

                    updatedAt:
                        firebase.firestore.FieldValue.serverTimestamp()

                }, { merge: true })

                .then(() =>
                    user.sendEmailVerification()
                );

        })

        .then(() => {

            alert(
                "Verification email sent. Please check your Inbox, Junk, or Spam folder."
            );

            auth.signOut();

            showLogin();

        })

        .catch((error) => {

            console.error(
                "Account creation error:",
                error
            );

            alert(
                "Could not create account: " +
                error.message
            );

        });

}


// RIDE VARIABLES

let rides = [];

let selectedRide = null;


// DESTINATION

const destinationSelect =
    document.getElementById("destination");

const otherDestinationInput =
    document.getElementById("otherDestination");


destinationSelect.addEventListener(
    "change",
    function () {

        if (
            destinationSelect.value === "Other"
        ) {

            otherDestinationInput
                .classList
                .remove("hidden");

            otherDestinationInput.focus();

        } else {

            otherDestinationInput
                .classList
                .add("hidden");

            otherDestinationInput.value = "";

        }

    }
);


// CREATE RIDE BUTTON

document
    .getElementById("createRideBtn")
    .addEventListener(
        "click",
        function () {

            document
                .getElementById("createSection")
                .classList
                .remove("hidden");

            document
                .getElementById("ridesSection")
                .classList
                .add("hidden");

        }
    );


// FIND RIDE BUTTON

document
    .getElementById("findRideBtn")
    .addEventListener(
        "click",
        function () {

            document
                .getElementById("ridesSection")
                .classList
                .remove("hidden");

            document
                .getElementById("createSection")
                .classList
                .add("hidden");

            displayRides();

        }
    );


// CREATE RIDE

document
    .getElementById("submitRide")
    .addEventListener(
        "click",
        function () {

            let destination =
                document
                    .getElementById("destination")
                    .value;


            if (destination === "Other") {

                destination =
                    document
                        .getElementById("otherDestination")
                        .value
                        .trim();


                if (!destination) {

                    alert(
                        "Please enter your destination."
                    );

                    return;
                }

            }


            const date =
                document
                    .getElementById("rideDate")
                    .value;


            const time =
                document
                    .getElementById("rideTime")
                    .value;


            const pickup =
                document
                    .getElementById("pickup")
                    .value;


            const seats =
                Number(
                    document
                        .getElementById("seats")
                        .value
                );


            if (
                !date ||
                !time ||
                !pickup ||
                !seats
            ) {

                alert(
                    "Please fill all the details."
                );

                return;
            }


            const user =
                auth.currentUser;


            if (!user) {

                alert(
                    "Please login first."
                );

                return;
            }


            db.collection("users")
                .doc(user.uid)
                .get()

                .then((userDoc) => {

                    if (!userDoc.exists) {

                        throw new Error(
                            "Student profile not found."
                        );

                    }


                    const profile =
                        userDoc.data();


                    const ride = {

                        destination:
                            destination,

                        date:
                            date,

                        time:
                            time,

                        pickup:
                            pickup,

                        totalSeats:
                            seats,

                        bookedSeats:
                            1,

                        creator:
                            profile.name ||
                            user.displayName ||
                            "",

                        creatorEmail:
                            profile.email ||
                            user.email ||
                            "",

                        creatorId:
                            user.uid,

                        batch:
                            profile.batch ||
                            "",

                        phone:
                            profile.phone ||
                            "",

                        status:
                            "active",

                        createdAt:
                            firebase.firestore.FieldValue.serverTimestamp()

                    };


                    return db
                        .collection("rides")
                        .add(ride);

                })

                .then(() => {

                    alert(
                        "Ride created successfully!"
                    );


                    document
                        .getElementById("createSection")
                        .classList
                        .add("hidden");


                    document
                        .getElementById("ridesSection")
                        .classList
                        .remove("hidden");


                    const container =
                        document
                            .getElementById("ridesContainer");


                    container.innerHTML =
                        "<p>🔄 Refreshing rides...</p>";


                    setTimeout(() => {

                        displayRides();

                    }, 500);

                })

                .catch((error) => {

                    console.error(
                        "Error creating ride:",
                        error
                    );

                    alert(
                        "Could not create ride: " +
                        error.message
                    );

                });

        }
    );


// DISPLAY RIDES

function displayRides() {

    const container =
        document.getElementById("ridesContainer");

    const rideCount =
        document.getElementById("rideCount");


    container.innerHTML =
        "<p>Loading rides...</p>";


    if (rideCount) {

        rideCount.textContent = "0";

    }


    db.collection("rides")
        .get()

        .then((snapshot) => {

            container.innerHTML = "";


            const activeRides = [];


            snapshot.forEach((doc) => {

                const ride = {

                    id: doc.id,

                    ...doc.data()

                };


                if (
                    ride.status !== "cancelled"
                ) {

                    activeRides.push(ride);

                }

            });


            // UPDATE RIDE COUNT

            if (rideCount) {

                rideCount.textContent =
                    activeRides.length;

            }


            // NO RIDES

            if (
                activeRides.length === 0
            ) {

                container.innerHTML =
                    "<p>No rides available right now.</p>";

                return;

            }


            // DISPLAY ACTIVE RIDES

            activeRides.forEach((ride) => {

                const card =
                    document.createElement("div");


                card.className =
                    "ride-card";


                card.innerHTML = `

                    <h3>🚕 ${ride.destination}</h3>

                    <p>📅 ${ride.date}</p>

                    <p>🕖 ${ride.time}</p>

                    <p>📍 ${ride.pickup}</p>

                    <p>💺 ${ride.bookedSeats}/${ride.totalSeats} seats booked</p>

                    <p>👤 Created by ${ride.creator}</p>

                    <p>🎓 ${ride.batch}</p>

                    <p>📞 ${ride.phone || "Phone not added"}</p>

                `;


                const currentUser =
                    auth.currentUser;


                // CREATOR

                if (
                    currentUser &&
                    ride.creatorId === currentUser.uid
                ) {

                    const cancelButton =
                        document.createElement("button");


                    cancelButton.textContent =
                        "Cancel Ride";


                    cancelButton.className =
                        "primary-btn";


                    cancelButton.addEventListener(
                        "click",
                        function () {

                            cancelRide(ride);

                        }
                    );


                    card.appendChild(
                        cancelButton
                    );

                }


                // OTHER USERS

                else if (currentUser) {

                    const joinerRef =
                        db.collection("rides")
                            .doc(ride.id)
                            .collection("joiners")
                            .doc(currentUser.uid);


                    joinerRef.get()

                        .then((joinerDoc) => {

                            // ALREADY JOINED

                            if (
                                joinerDoc.exists
                            ) {

                                const leaveButton =
                                    document.createElement(
                                        "button"
                                    );


                                leaveButton.textContent =
                                    "Leave Ride";


                                leaveButton.className =
                                    "secondary-btn";


                                leaveButton.addEventListener(
                                    "click",
                                    function () {

                                        leaveRide(ride);

                                    }
                                );


                                card.appendChild(
                                    leaveButton
                                );

                            }


                            // SEATS AVAILABLE

                            else if (
                                ride.bookedSeats <
                                ride.totalSeats
                            ) {

                                const joinButton =
                                    document.createElement(
                                        "button"
                                    );


                                joinButton.textContent =
                                    "Join Ride";


                                joinButton.className =
                                    "primary-btn";


                                joinButton.addEventListener(
                                    "click",
                                    function () {

                                        openJoinModal(
                                            ride
                                        );

                                    }
                                );


                                card.appendChild(
                                    joinButton
                                );

                            }


                            // FULL

                            else {

                                const fullText =
                                    document.createElement(
                                        "p"
                                    );


                                fullText.textContent =
                                    "🔴 Ride Full";


                                card.appendChild(
                                    fullText
                                );

                            }

                        })

                        .catch((error) => {

                            console.error(
                                "Error checking ride membership:",
                                error
                            );

                        });

                }


                container.appendChild(
                    card
                );

            });

        })

        .catch((error) => {

            console.error(
                "Error loading rides:",
                error
            );


            container.innerHTML =
                "<p>Could not load rides.</p>";

        });

}


// CANCEL RIDE

function cancelRide(ride) {

    const confirmCancel =
        confirm(
            "Are you sure you want to cancel this ride?"
        );


    if (!confirmCancel) {

        return;

    }


    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "Please login first."
        );

        return;

    }


    if (
        ride.creatorId !== user.uid
    ) {

        alert(
            "You can only cancel your own rides."
        );

        return;

    }


    db.collection("rides")
        .doc(ride.id)
        .update({

            status:
                "cancelled",

            cancelledAt:
                firebase.firestore.FieldValue.serverTimestamp()

        })

        .then(() => {

            alert(
                "Ride cancelled successfully!"
            );

            displayRides();

        })

        .catch((error) => {

            console.error(
                "Error cancelling ride:",
                error
            );

            alert(
                "Could not cancel ride: " +
                error.message
            );

        });

}


// LEAVE RIDE

function leaveRide(ride) {

    const confirmLeave =
        confirm(
            "Are you sure you want to leave this ride?"
        );


    if (!confirmLeave) {

        return;

    }


    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "Please login first."
        );

        return;

    }


    const rideRef =
        db
            .collection("rides")
            .doc(ride.id);


    const joinerRef =
        rideRef
            .collection("joiners")
            .doc(user.uid);


    db.runTransaction(
        (transaction) => {

            return transaction
                .get(joinerRef)

                .then((joinerDoc) => {

                    if (!joinerDoc.exists) {

                        throw new Error(
                            "You have not joined this ride."
                        );

                    }


                    return transaction.get(
                        rideRef
                    );

                })

                .then((rideDoc) => {

                    if (!rideDoc.exists) {

                        throw new Error(
                            "Ride no longer exists."
                        );

                    }


                    const currentRide =
                        rideDoc.data();


                    const newBookedSeats =
                        Math.max(
                            0,
                            currentRide.bookedSeats - 1
                        );


                    transaction.update(
                        rideRef,
                        {
                            bookedSeats:
                                newBookedSeats
                        }
                    );


                    transaction.delete(
                        joinerRef
                    );

                });

        }
    )

    .then(() => {

        alert(
            "You have left the ride."
        );

        displayRides();

    })

    .catch((error) => {

        console.error(
            "Error leaving ride:",
            error
        );

        alert(
            "Could not leave ride: " +
            error.message
        );

    });

}


// OPEN JOIN MODAL

function openJoinModal(ride) {

    selectedRide =
        ride;


    document
        .getElementById("joinModal")
        .classList
        .remove("hidden");

}


// CONFIRM JOIN

document
    .getElementById("confirmJoin")
    .addEventListener(
        "click",
        function () {

            if (!selectedRide) {

                return;

            }


            const user =
                auth.currentUser;


            if (!user) {

                alert(
                    "Please login first."
                );

                return;

            }


            const rideRef =
                db
                    .collection("rides")
                    .doc(selectedRide.id);


            const joinerRef =
                rideRef
                    .collection("joiners")
                    .doc(user.uid);


            db.runTransaction(
                (transaction) => {

                    return transaction
                        .get(joinerRef)

                        .then((joinerDoc) => {

                            if (joinerDoc.exists) {

                                throw new Error(
                                    "You have already joined this ride."
                                );

                            }


                            return transaction.get(
                                rideRef
                            );

                        })

                        .then((rideDoc) => {

                            if (!rideDoc.exists) {

                                throw new Error(
                                    "Ride no longer exists."
                                );

                            }


                            const ride =
                                rideDoc.data();


                            if (
                                ride.bookedSeats >=
                                ride.totalSeats
                            ) {

                                throw new Error(
                                    "This ride is already full."
                                );

                            }


                            transaction.update(
                                rideRef,
                                {
                                    bookedSeats:
                                        ride.bookedSeats + 1
                                }
                            );


                            transaction.set(
                                joinerRef,
                                {

                                    userId:
                                        user.uid,

                                    joinedAt:
                                        firebase.firestore.FieldValue.serverTimestamp()

                                }
                            );

                        });

                }
            )

            .then(() => {

                alert(
                    "You have successfully joined the ride!"
                );


                selectedRide =
                    null;


                document
                    .getElementById("joinModal")
                    .classList
                    .add("hidden");


                displayRides();

            })

            .catch((error) => {

                console.error(
                    "Error joining ride:",
                    error
                );

                alert(
                    "Could not join ride: " +
                    error.message
                );

            });

        }
    );


// CANCEL JOIN

document
    .getElementById("cancelJoin")
    .addEventListener(
        "click",
        function () {

            document
                .getElementById("joinModal")
                .classList
                .add("hidden");


            selectedRide =
                null;

        }
    );


// PASSWORD VISIBILITY

function togglePassword(
    inputId,
    button
) {

    const input =
        document.getElementById(
            inputId
        );


    if (
        input.type === "password"
    ) {

        input.type =
            "text";

        button.textContent =
            "🙈";

    } else {

        input.type =
            "password";

        button.textContent =
            "👁";

    }

}