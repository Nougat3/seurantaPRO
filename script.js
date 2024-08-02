document.getElementById('patient-form').addEventListener('submit', function(event) {
    event.preventDefault();
    calculateResults();
});

function calculateResults() {
    const finnrisk = document.getElementById('finnrisk').value;
    const diabetes = document.getElementById('diabetes').value;
    const egfr = document.getElementById('egfr').value;
    const albKrea = document.getElementById('alb-krea').value;
    const currentLDL = parseFloat(document.getElementById('ldl').value);
    const arteryDisease = document.getElementById('artery-disease').value;
    const cardioEvent = document.getElementById('cardio-event').value;

    // Määritetään tavoiteverenpaine
    let targetBP = '135/85';
    if (finnrisk === '10_to_14.9' || finnrisk === '15_and_above' || diabetes === 'yes' || egfr !== 'above_60' || albKrea === 'yes') {
        targetBP = '125/80';
    }

    // Määritetään LDL-tavoite
    let targetLDL = 3.0;
    if (finnrisk === '2_to_9.9') {
        targetLDL = 2.6;
    } else if (finnrisk === '10_to_14.9' || diabetes === 'yes') {
        targetLDL = 1.8;
    } else if (finnrisk === '15_and_above' || arteryDisease === 'yes' || cardioEvent === 'yes') {
        targetLDL = 1.4;
    }

    // Lasketaan verenpainemittausten keskiarvot
    const measurements = document.querySelectorAll('.measurement');
    let systolicMorningTotal = 0, diastolicMorningTotal = 0, pulseMorningTotal = 0, countMorning = 0;
    let systolicEveningTotal = 0, diastolicEveningTotal = 0, pulseEveningTotal = 0, countEvening = 0;

    measurements.forEach((measurement, index) => {
        const bpValues = measurement.querySelector('.bp').value.split('/');
        const systolic = parseInt(bpValues[0]);
        const diastolic = parseInt(bpValues[1]);
        const pulse = parseInt(bpValues[2]);

        if (!isNaN(systolic) && !isNaN(diastolic) && !isNaN(pulse)) {
            if (index % 4 < 2) { // Morning measurements (index 0 and 1)
                systolicMorningTotal += systolic;
                diastolicMorningTotal += diastolic;
                pulseMorningTotal += pulse;
                countMorning++;
            } else { // Evening measurements (index 2 and 3)
                systolicEveningTotal += systolic;
                diastolicEveningTotal += diastolic;
                pulseEveningTotal += pulse;
                countEvening++;
            }
        }
    });

    const avgSystolicMorning = Math.round(systolicMorningTotal / countMorning);
    const avgDiastolicMorning = Math.round(diastolicMorningTotal / countMorning);
    const avgPulseMorning = Math.round(pulseMorningTotal / countMorning);

    const avgSystolicEvening = Math.round(systolicEveningTotal / countEvening);
    const avgDiastolicEvening = Math.round(diastolicEveningTotal / countEvening);
    const avgPulseEvening = Math.round(pulseEveningTotal / countEvening);

    const avgSystolic = Math.round((systolicMorningTotal + systolicEveningTotal) / (countMorning + countEvening));
    const avgDiastolic = Math.round((diastolicMorningTotal + diastolicEveningTotal) / (countMorning + countEvening));
    const avgPulse = Math.round((pulseMorningTotal + pulseEveningTotal) / (countMorning + countEvening));

    // Vertaillaan tavoite- ja nykytilannetta
    const targetSystolic = parseInt(targetBP.split('/')[0]);
    const targetDiastolic = parseInt(targetBP.split('/')[1]);

    let bpComparison = "Verenpaine on tavoitteessa.";
    if (avgSystolic > targetSystolic || avgDiastolic > targetDiastolic) {
        const systolicDiff = avgSystolic - targetSystolic;
        const diastolicDiff = avgDiastolic - targetDiastolic;
        bpComparison = `Verenpaine ei ole tavoitteessa. Verenpainetta tulisi laskea ${systolicDiff > 0 ? systolicDiff : 0}/${diastolicDiff > 0 ? diastolicDiff : 0} mmHg.`;
    }

    let ldlComparison = "LDL on tavoitteessa.";
    if (currentLDL > targetLDL) {
        ldlComparison = `LDL ei ole tavoitteessa. LDL-arvoa tulisi laskea ${currentLDL - targetLDL} mmol/l.`;
    }

    // Näytetään tulokset
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <h2>Tulokset</h2>
        <ul>
            <li>Tavoiteverenpaine: ${targetBP}</li>
            <li>Nykyinen aamuverenpaine: ${avgSystolicMorning}/${avgDiastolicMorning}</li>
            <li>Nykyinen iltaverenpaine: ${avgSystolicEvening}/${avgDiastolicEvening}</li>
            <li>Nykyinen kokonaisverenpaine: ${avgSystolic}/${avgDiastolic}</li>
            <li>${bpComparison}</li>
            <li>Tavoite LDL-arvo: < ${targetLDL} mmol/l</li>
            <li>Nykyinen LDL-arvo: ${currentLDL} mmol/l</li>
            <li>${ldlComparison}</li>
        </ul>
    `;
}

function createMeasurementInputs() {
    const measurementsDiv = document.getElementById('measurements');
    measurementsDiv.innerHTML = '';

    for (let day = 1; day <= 4; day++) {
        measurementsDiv.innerHTML += `<h3>Päivä ${day}</h3><div class="measurement-row">`;
        for (let time = 1; time <= 2; time++) {
            const timeOfDay = time === 1 ? 'Aamu' : 'Ilta';
            measurementsDiv.innerHTML += `
                <div class="measurement">
                    <div class="form-group">
                        <label for="bp-${day}-${time}-1">${timeOfDay} mittaus 1 (systolinen/diastolinen/syke):</label>
                        <input type="text" class="bp" id="bp-${day}-${time}-1" required pattern="\\d{2,3}/\\d{2,3}/\\d{2,3}" placeholder="esim. 140/80/70">
                    </div>
                    <div class="form-group">
                        <label for="bp-${day}-${time}-2">${timeOfDay} mittaus 2 (systolinen/diastolinen/syke):</label>
                        <input type="text" class="bp" id="bp-${day}-${time}-2" required pattern="\\d{2,3}/\\d{2,3}/\\d{2,3}" placeholder="esim. 140/80/70">
                    </div>
                </div>
            `;
        }
        measurementsDiv.innerHTML += `</div>`;
    }
}

function copySummary() {
    const resultsDiv = document.getElementById('results');
    const range = document.createRange();
    range.selectNode(resultsDiv);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    alert('Yhteenveto kopioitu leikepöydälle');
}

createMeasurementInputs();
