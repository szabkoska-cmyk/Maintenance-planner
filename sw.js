let fleet = JSON.parse(localStorage.getItem('fleet')) || [];
let activeAircaftIndex = null;

function toggleEngineInputs() {
    const count = document.getElementById('engineCount').value;
    document.getElementById('e2Time').style.display = (count == "2") ? "block" : "none";
}

function openModal(id, index = null) {
    document.getElementById('overlay').style.display = 'block';
    document.getElementById(id).style.display = 'block';
    if(index !== null) {
        activeAircaftIndex = index;
        document.getElementById('targetTail').innerText = `Updating: ${fleet[index].tailNum}`;
    }
}

function closeModals() {
    document.querySelectorAll('.modal, .overlay').forEach(el => el.style.display = 'none');
}

function addAircraft() {
    const aircraft = {
        tailNum: document.getElementById('tailNum').value,
        airframe: parseFloat(document.getElementById('afTime').value),
        engineCount: parseInt(document.getElementById('engineCount').value),
        e1: parseFloat(document.getElementById('e1Time').value),
        e2: parseFloat(document.getElementById('e2Time').value) || 0,
        fuelMax: parseFloat(document.getElementById('fuelMax').value),
        fuelCurrent: parseFloat(document.getElementById('fuelMax').value), // Starts full
        burnRate: parseFloat(document.getElementById('burnRate').value)
    };

    fleet.push(aircraft);
    saveAndRender();
    closeModals();
}

function processFlight() {
    const hours = parseFloat(document.getElementById('hoursFlown').value);
    const ac = fleet[activeAircaftIndex];

    // Update Times
    ac.airframe += hours;
    ac.e1 += hours;
    if(ac.engineCount === 2) ac.e2 += hours;

    // Update Fuel
    const fuelUsed = hours * ac.burnRate;
    ac.fuelCurrent = Math.max(0, ac.fuelCurrent - fuelUsed);

    saveAndRender();
    closeModals();
}

function refuel(index) {
    const amount = prompt("How much fuel did you add? (Type 'full' to top off)");
    if (amount === null) return;
    
    if (amount.toLowerCase() === 'full') {
        fleet[index].fuelCurrent = fleet[index].fuelMax;
    } else {
        const added = parseFloat(amount);
        fleet[index].fuelCurrent = Math.min(fleet[index].fuelMax, fleet[index].fuelCurrent + added);
    }
    saveAndRender();
}

function getMaintenanceStatus(engineTime) {
    const hoursSinceLast = engineTime % 50;
    const remaining = (50 - hoursSinceLast).toFixed(1);
    return remaining <= 5 ? `⚠️ 50-Hr Due in ${remaining}h` : `Next 50-Hr in: ${remaining}h`;
}

function saveAndRender() {
    localStorage.setItem('fleet', JSON.stringify(fleet));
    const list = document.getElementById('hangar-list');
    list.innerHTML = '';

    fleet.forEach((ac, index) => {
        const fuelPct = (ac.fuelCurrent / ac.fuelMax) * 100;
        
        list.innerHTML += `
            <div class="aircraft-card">
                <h2>${ac.tailNum}</h2>
                <p>Airframe: ${ac.airframe.toFixed(1)} hrs</p>
                <p class="engine-stat">Engine 1: ${ac.e1.toFixed(1)} hrs <br> 
                   <small>${getMaintenanceStatus(ac.e1)}</small></p>
                ${ac.engineCount === 2 ? `<p class="engine-stat">Engine 2: ${ac.e2.toFixed(1)} hrs <br> 
                   <small>${getMaintenanceStatus(ac.e2)}</small></p>` : ''}
                
                <div class="fuel-section">
                    <strong>Fuel: ${ac.fuelCurrent.toFixed(1)} / ${ac.fuelMax}</strong>
                    <div class="fuel-bar"><div class="fuel-fill" style="width: ${fuelPct}%"></div></div>
                </div>
                <br>
                <button onclick="openModal('updateFlightModal', ${index})">Log Flight</button>
                <button onclick="refuel(${index})">⛽ Refuel</button>
                <button onclick="deleteAc(${index})" style="background:#ff7675; border:none; color:white; padding:5px; margin-left:10px;">Delete</button>
            </div>
        `;
    });
}

function deleteAc(index) {
    if(confirm("Remove this aircraft?")) {
        fleet.splice(index, 1);
        saveAndRender();
    }
}

// Initial Load
saveAndRender();
