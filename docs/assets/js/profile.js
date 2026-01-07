import { USERS, REVIEWS } from "./api/allData.js"; // lokálna kópia alebo Firestore fetch
import { db } from "./firebase.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

async function getUserIdFromUrlOrCurrent() {
    const urlParams = new URLSearchParams(window.location.search);
    const userIdParam = urlParams.get("user_id");
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (userIdParam) return Number(userIdParam);
    if (currentUser) return currentUser.id;
    return null;
}

async function getUserById(id) {
    return USERS.find(u => u.id === id) || null;
}

async function getReviewsByUserId(userId) {
    return REVIEWS.filter(r => r.user_id === userId);
}

async function renderProfile() {
    const userId = await getUserIdFromUrlOrCurrent();
    const profileContainer = document.getElementById("profileContainer");
    const noUserMessage = document.getElementById("noUserMessage");

    if (!userId) {
        profileContainer.classList.add("hidden");
        noUserMessage.classList.remove("hidden");
        return;
    }

    const user = await getUserById(userId);
    if (!user) {
        profileContainer.classList.add("hidden");
        noUserMessage.classList.remove("hidden");
        return;
    }

    noUserMessage.classList.add("hidden");
    profileContainer.classList.remove("hidden");

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const isEditable = currentUser && currentUser.id === user.id;

      const profileInfo = document.querySelector(".profile-info");
    if (!isEditable) {
        profileInfo.classList.add("no-edit");
    } else {
        profileInfo.classList.remove("no-edit");
    }

    // PROFILOVÉ INFORMÁCIE
    document.getElementById("profilePic").src = user.profile_pic || "https://picsum.photos/seed/user/200";

    if (isEditable) {
        // Editable inputs
        document.getElementById("profileName").innerHTML = `
          <div class="info-row">
            <div class="icon"></div>
            <input type="text" id="inputFirstName" placeholder="Meno" value="${user.first_name}">
          </div>

          <div class="info-row">
            <div class="icon"></div>
            <input type="text" id="inputLastName" placeholder="Priezvisko" value="${user.last_name}">
          </div>
            
        `;
        document.getElementById("profileNick").innerHTML = `<input type="text" id="inputNick" placeholder="Nick" value="${user.nick || ''}">`;
        document.getElementById("profileLocation").innerHTML = `<input type="text" id="inputLocation" placeholder="Lokácia" value="${user.location || ''}">`;

        const editButton = document.getElementById("editProfile");
        editButton.classList.remove("hidden");
        editButton.textContent = "Uložiť zmeny";

        editButton.onclick = async () => {
            const updatedData = {
                first_name: document.getElementById("inputFirstName").value,
                last_name: document.getElementById("inputLastName").value,
                nick: document.getElementById("inputNick").value,
                location: document.getElementById("inputLocation").value
            };

            // update Firestore
            try {
                const userRef = doc(db, "users", user.email); // db document musí existovať
                await updateDoc(userRef, updatedData);

                // update lokálnu kópiu USERS pre demo účely
                Object.assign(user, updatedData);

                // zmena textu tlačidla
                const editButton = document.getElementById("editProfile");
                const originalText = editButton.textContent;
                editButton.textContent = "✅ Uložené";
                editButton.disabled = true; // voliteľné, nech sa nedá kliknúť počas animácie

                // po 1,5 sekundy vrátiť späť
                setTimeout(() => {
                    editButton.textContent = originalText;
                    editButton.disabled = false;
                    renderProfile();
                }, 1500);

                 // refresh zobrazenia
            } catch (err) {
                console.error(err);
                alert("Chyba pri ukladaní profilu ❌");
            }
        };
    } else {
        document.getElementById("profileName").textContent = `${user.first_name} ${user.last_name}`;
        document.getElementById("profileNick").textContent = `${user.nick || "-"}`;
        document.getElementById("profileLocation").textContent = `${user.location || "-"}`;

        document.getElementById("editProfile").classList.add("hidden");
    }

    // REPUTÁCIA
    document.getElementById("profileEmail").textContent = `${user.email || '-'}`;
    document.getElementById("profileReputation").textContent = `${user.reputation || "0"} (${user.reviews_count || 0} recenzií)`;

    // RECENZIE
    const reviewsContainer = document.getElementById("reviewsContainer");
    const reviews = await getReviewsByUserId(user.id);

    if (!reviews.length) {
        reviewsContainer.innerHTML = "<p>Používateľ zatiaľ nemá žiadne recenzie.</p>";
        return;
    }

    reviewsContainer.innerHTML = "";
    reviews.forEach(r => {
        const reviewer = USERS.find(u => u.id === r.reviewer_id);
        const div = document.createElement("div");
        div.className = "review-item";
        div.innerHTML = `
            <strong>${reviewer ? reviewer.first_name + " " + reviewer.last_name : "Neznámy hodnotiteľ"}</strong>
            <span> | Hodnotenie: ${r.rating}/5</span>
            <p>${r.text || ""}</p>
        `;
        reviewsContainer.appendChild(div);
    });
}

renderProfile();
