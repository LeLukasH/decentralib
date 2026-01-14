document.addEventListener("DOMContentLoaded", () => {
    // --- Logika pre Modal (Legenda) ---
    const modal = document.getElementById("legend-modal");
    const btn = document.getElementById("open-legend-btn");
    const span = document.querySelector(".close-modal");

    btn.onclick = () => modal.style.display = "block";
    span.onclick = () => modal.style.display = "none";
   
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});