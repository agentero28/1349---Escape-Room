const codes = ["2348", "3587", "9521"];

// Reset bij nieuw spel
if (!location.pathname.includes("fase")) {
    localStorage.removeItem("tijd");
    localStorage.removeItem("team");
}

let tijd = parseInt(localStorage.getItem("tijd")) || 3600;
let team = localStorage.getItem("team") || "";
const huidigeFase = location.pathname.includes("fase3") ? 2 : location.pathname.includes("fase2") ? 1 : 0;

// Achtergrond + overlay
const achtergronden = ["img/kamer.jpeg", "img/kaart.jpeg", "img/poortwachter.jpg"];
document.body.style.cssText = `background:url('${achtergronden[huidigeFase]}') center/cover no-repeat fixed !important;background-blend-mode:multiply;`;

const overlay = document.createElement("div");
overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);pointer-events:none;z-index:-1;";
document.body.appendChild(overlay);

// Timer weergeven
function updateTimer() {
    let m, s;
    if (tijd >= 0) {
        m = String(Math.floor(tijd / 60)).padStart(2, "0");
        s = String(tijd % 60).padStart(2, "0");
    } else {
        const neg = Math.abs(tijd);
        m = "-" + String(Math.floor(neg / 60)).padStart(2, "0");
        s = String(neg % 60).padStart(2, "0");
    }
    const el = document.getElementById("timer");
    if (el) el.textContent = m + ":" + s;
}

// Start timer + tipsysteem
function startTimer() {
    clearInterval(window.timerInterval);
    updateTimer();

    const alleTips = [
        ["De volgorde in de tekst is belangerijk", "Gebruik de puzzelstukken om de tafel te decoderen", "Oplossing sudoku: 2", "De code is 2348"],
        ["Zoek de verschillen", "Morsecode op het kerkgebouw", "Volgorde route op de kaart", "De code is 3587"],
        ["Kijk in de torens", "De poortwachter komt na de torens"]
    ];
    const tips = alleTips[huidigeFase];
    let tipIndex = 0;

    const tipContainer = document.createElement("div");
    tipContainer.style.cssText = "position:fixed;top:15px;right:15px;z-index:9999;width:340px;background:rgba(20,0,0,0.9);padding:18px;font-size:1.4em;border:3px double #8b6914;border-radius:14px;box-shadow:0 0 35px #300;color:#ffeb3b;line-height:1.7em;";
    tipContainer.innerHTML = "<strong>Beschikbare tips:</strong>";
    document.body.appendChild(tipContainer);

    const gebruikteLijst = document.createElement("div");
    gebruikteLijst.style.cssText = "position:fixed;bottom:25px;left:25px;z-index:9998;width:320px;font-size:1.4em;background:rgba(0,0,0,0.9);color:#ffeb3b;padding:14px;border:3px double #8b6914;border-radius:12px;line-height:1.7em;";
    gebruikteLijst.innerHTML = "<strong>Gebruikte tips:</strong><br><em>Nog geen</em>";
    document.body.appendChild(gebruikteLijst);

    const voegTipKnopToe = (i) => {
        const isAntwoord = (huidigeFase < 2 && i === 3);
        const knop = document.createElement("button");
        knop.textContent = isAntwoord ? "ANTWOORD (−30 sec)" : `Tip ${i+1}/${tips.length} (−30 sec)`;
        knop.style.cssText = `display:block;width:100%;margin:12px 0;padding:14px;font-size:1.1em;font-weight:bold;border-radius:10px;cursor:pointer;background:${isAntwoord?"#004400":"#440000"};color:${isAntwoord?"#00ff00":"#ff9999"};border:3px solid ${isAntwoord?"#00ff00":"#ff6666"};box-shadow:0 0 15px ${isAntwoord?"#0f0":"#800"};`;
        knop.onclick = () => {
            tijd = Math.max(0, tijd - 30);
            localStorage.setItem("tijd", tijd);
            updateTimer();
            let html = gebruikteLijst.innerHTML;
            if (html.includes("Nog geen")) html = "<strong>Gebruikte tips:</strong><br>";
            gebruikteLijst.innerHTML = html + `• ${tips[i]}<br>`;
            knop.remove();
        };
        tipContainer.appendChild(knop);
    };

    let verstrekenStart = 3600 - tijd;
    const eersteTipNa = Math.ceil((verstrekenStart + 1) / 300) * 300;

    window.timerInterval = setInterval(() => {
        tijd--;
        localStorage.setItem("tijd", tijd);
        updateTimer();
        const verstreken = 3600 - tijd;
        if (verstreken >= eersteTipNa + (tipIndex * 300) && tipIndex < tips.length) {
            voegTipKnopToe(tipIndex++);
        }
        if (tijd <= 0) eindig(false);
    }, 1000);
}

// Code controleren
document.getElementById("check")?.addEventListener("click", () => {
    const invoer = (document.getElementById("code")?.value || "").replace(/\D/g, "").slice(0,4);
    if (invoer === codes[huidigeFase]) {
        localStorage.setItem("tijd", tijd);
        if (huidigeFase === 2) eindig(true);
        else location.href = huidigeFase === 0 ? "fase2.html" : "fase3.html";
    } else {
        alert("Verkeerde code – 30 seconden straf!");
        tijd = Math.max(0, tijd - 30);
        updateTimer();
    }
});
document.getElementById("code")?.addEventListener("input", e => e.target.value = e.target.value.replace(/\D/g,""));

// Startknop fase 1
if (document.getElementById("startknop")) {
    document.getElementById("startknop").onclick = () => {
        team = document.getElementById("teamnaam").value.trim() || "Team X";
        localStorage.setItem("team", team);
        document.getElementById("start").style.display = "none";
        document.getElementById("spel").classList.remove("hidden");
        document.getElementById("teamweergave").textContent = team;
        startTimer();
    };
}

// Direct starten in fase 2/3
if (location.pathname.includes("fase")) {
    document.getElementById("teamweergave").textContent = team;
    startTimer();
}

// Eindscherm
function eindig(win) {
    clearInterval(window.timerInterval);
    localStorage.removeItem("tijd");

    const verstreken = 3600 - tijd;
    let sb = JSON.parse(localStorage.getItem("pest1349_sb") || "[]");

    if (!sb.some(s => s.team === team)) sb.push({team, tijd: verstreken});
    vasteTeams.forEach(vt => { if (!sb.some(s => s.team === vt.team)) sb.push(vt); });

    sb.sort((a,b) => a.tijd - b.tijd);
    localStorage.setItem("pest1349_sb", JSON.stringify(sb));

    const lijst = sb.map((s,i) => 
        `<div style="font-size:2.5em;margin:15px;padding:20px;background:${s.team===team?'rgba(0,255,0,0.4)':'rgba(139,105,20,0.2)'};border-radius:12px;">
            ${i+1}. <strong>${s.team}</strong> – ${Math.floor(s.tijd/60)}:${String(s.tijd%60).padStart(2,"0")}
        </div>`).join("");

    document.body.innerHTML = `
    <div class="container" style="text-align:center;">
        <h1 style="font-size:6em;color:${win?'#b8860b':'#ff3333'};text-shadow:0 0 30px ${win?'#ff6600':'#ff0000'}">
            ${win?"ONTSNAPT!":"TIJD OP"}
        </h1>
        ${win ? `
        <div style="font-size:2.2em;line-height:1.6em;max-width:800px;margin:50px auto;padding:30px;background:rgba(20,10,0,0.7);border:3px double #8b6914;border-radius:15px;color:#d4af37;">
            <strong>Proficiat!!!</strong><br><br>
            Jullie hebben het gezin Ketteler kunnen helpen om weg te komen uit de stad!<br><br>
            Ze staan nog steeds voor een hele hoop uitdagingen… Zo moeten ze nu op zoek naar een plek waar ze een nieuw leven kunnen beginnen en dat is niet zo makkelijk als ze de pest willen blijven ontwijken.<br><br>
            Maar dat is een verhaal voor een andere keer ;)
        </div>` : `
        <div style="font-size:2.1em;line-height:1.6em;max-width:800px;margin:50px auto;padding:30px;background:rgba(80,0,0,0.7);border:3px double #880000;border-radius:15px;color:#ff6666;">
            <strong>Oh nee!</strong><br><br>
            Jullie waren net niet snel genoeg!<br>
            De Baljuw had het plan door… Hij heeft het gezin betrapt en stuurt hen terug naar het huisje.<br><br>
            De tijd is echt op – probeer het opnieuw en wees sneller!
        </div>`}
        <p style="font-size:3.5em;margin:40px"><strong>${team}</strong><br>${Math.floor(verstreken/60)}:${String(verstreken%60).padStart(2,"0")}</p>
        <h2 style="font-size:3em;margin:60px 0">Scorebord</h2>
        <div style="max-width:700px;margin:0 auto">${lijst}</div>
        <button onclick="location.href='index.html'" style="font-size:2.8em;padding:30px 100px;margin:50px;background:#440000;color:#ffeb3b;border:4px double #8b6914;border-radius:15px;cursor:pointer;box-shadow:0 0 30px #800;">
            Opnieuw proberen
        </button>
    </div>`;
}

// Vaste teams
const vasteTeams = [{team: "De Grotmensen", tijd: 46*60 + 12}];

// Eenmalig vaste teams toevoegen
if (localStorage.getItem("pest1349_sb_fixed") !== "ja") {
    let sb = JSON.parse(localStorage.getItem("pest1349_sb") || "[]");
    vasteTeams.forEach(vt => { if (!sb.some(s => s.team === vt.team)) sb.push(vt); });
    sb.sort((a,b) => a.tijd - b.tijd);
    localStorage.setItem("pest1349_sb", JSON.stringify(sb));
    localStorage.setItem("pest1349_sb_fixed", "ja");
}

// Testknop: 3× snel op timer klikken → 5 seconden
let klikCount = 0;
document.getElementById("timer")?.addEventListener("click", () => {
    klikCount++;
    if (klikCount === 3) {
        tijd = 5;
        localStorage.setItem("tijd", tijd);
        updateTimer();
        alert("⏰ TEST: tijd op 5 seconden gezet!");
        klikCount = 0;
    }
    setTimeout(() => klikCount = 0, 2000);
});

// Wis alleen test-teams (?clear-test)
if (location.search.includes("clear-test")) {
    if (confirm("Alle test-teams verwijderen? Vaste teams blijven staan.")) {
        let sb = JSON.parse(localStorage.getItem("pest1349_sb") || "[]");
        sb = sb.filter(s => vasteTeams.some(vt => vt.team === s.team));
        localStorage.setItem("pest1349_sb", JSON.stringify(sb));
        alert("✅ Test-teams verwijderd!");
        location.href = location.pathname;
    }
}