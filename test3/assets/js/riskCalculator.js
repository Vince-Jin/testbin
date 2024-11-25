let betaCoefficients_30year = []; // Array to store beta coefficients
let betaCoefficients2_30year = []; // Array to store the second set of beta coefficients
let s0_30year = []; // Base survival function (s0)
let s0_2_30year = []; // Second base survival function (s0_2)
let timePoints_30year = []; // Time points for the survival function
let timePoints2_30year = []; // Second set of time points for the survival function

// Function to load model-specific data (model1 or model2) for beta coefficients
async function loadModelData(modelName) {
    try {
        const modelFilePath = modelName === 'model1'
            ? 'https://raw.githubusercontent.com/Vince-Jin/testbin/refs/heads/main/test3/assets/csv/model1.csv'
            : 'https://raw.githubusercontent.com/Vince-Jin/testbin/refs/heads/main/test3/assets/csv/model2.csv';

        const data = await fetchCSV(modelFilePath);

        if (data.length === 0) {
            console.error(`Error: No data found in ${modelFilePath}`);
            return;
        }

        const [header, ...rows] = data;

        // Use the 4th column for beta coefficients
        betaCoefficients_30year = rows.map(row => {
            const cols = row.split(',');
            return parseFloat(cols[3]); // Use the 4th column
        });

        console.log(`Loaded ${modelName} Beta Coefficients:`, betaCoefficients_30year);

        // Load the second set of beta coefficients (betaCoefficient2)
        await loadSecondBetaCoefficients(modelName); // Call function to load betaCoefficient2

        // Load survival function data (s0) and time points from s0.csv
        await loadSurvivalData(modelName); // Call function to load s0.csv

        // Load the second set of time points (timePoints2) and s0 (s0_2)
        await loadSecondSurvivalData(modelName); // Call function to load s0_2 and timePoints2
    } catch (error) {
        console.error(`Error loading model data from ${modelName}:`, error);
    }
}

// Function to load second set of beta coefficients
async function loadSecondBetaCoefficients(modelName) {
    try {
        const betaFilePath = modelName === 'model1'
            ? 'https://raw.githubusercontent.com/Vince-Jin/testbin/refs/heads/main/test3/assets/csv/don_beta1.csv'
            : 'https://raw.githubusercontent.com/Vince-Jin/testbin/refs/heads/main/test3/assets/csv/don_beta2.csv';

        const data = await fetchCSV(betaFilePath);

        if (data.length === 0) {
            console.error(`Error: No data found in ${betaFilePath}`);
            return;
        }

        const [header, ...rows] = data;

        // Use the 2nd column for betaCoefficient2
        betaCoefficients2_30year = rows.map(row => {
            const cols = row.split(',');
            return parseFloat(cols[1]); // Use the 2nd column
        });

        console.log(`Loaded ${modelName} Beta Coefficients 2:`, betaCoefficients2_30year);
    } catch (error) {
        console.error(`Error loading second beta coefficients from ${modelName}:`, error);
    }
}

// Function to load survival data from s0.csv for s0 and timePoints
async function loadSurvivalData(modelName) {
    try {
        const survivalFilePath = modelName === 'model1'
            ? 'https://raw.githubusercontent.com/Vince-Jin/testbin/refs/heads/main/test3/assets/csv/s0_1.csv'
            : 'https://raw.githubusercontent.com/Vince-Jin/testbin/refs/heads/main/test3/assets/csv/s0_2.csv';
        
        const data = await fetchCSV(survivalFilePath);

        if (data.length === 0) {
            console.error(`Error: No data found in ${survivalFilePath}`);
            return;
        }

        const [header, ...rows] = data;

        // Use the 1st column for timePoints and 2nd column for s0
        timePoints_30year = rows.map(row => parseFloat(row.split(',')[0])); // Use the 1st column
        s0_30year = rows.map(row => parseFloat(row.split(',')[1])); // Use the 2nd column

        console.log('Loaded survival data:', { timePoints_30year, s0_30year });
    } catch (error) {
        console.error(`Error loading survival data from ${survivalFilePath}:`, error);
    }
}

// Function to load second set of survival data from don_s0.csv for timePoints2 and s0_2
async function loadSecondSurvivalData(modelName) {
    try {
        const survivalFilePath = 'https://raw.githubusercontent.com/Vince-Jin/testbin/refs/heads/main/test3/assets/csv/don_s0.csv';

        const data = await fetchCSV(survivalFilePath);

        if (data.length === 0) {
            console.error(`Error: No data found in ${survivalFilePath}`);
            return;
        }

        const [header, ...rows] = data;

        // Use the 2nd column for timePoints2 and 3rd column for s0_2
        timePoints2_30year = rows.map(row => parseFloat(row.split(',')[1])); // Use the 2nd column for timePoints2
        s0_2_30year = rows.map(row => parseFloat(row.split(',')[2])); // Use the 3rd column for s0_2

        console.log('Loaded second survival data:', { timePoints2_30year, s0_2_30year });
    } catch (error) {
        console.error(`Error loading second survival data from ${survivalFilePath}:`, error);
    }
}

// Function to calculate risk using the scenario vector
function calculateRisk() {
    // Calculate log hazard ratio (logHR) using the dot product of scenarioVector and betaCoefficients
    console.log('Beta Coefficients:', betaCoefficients_30year);
    console.log('Beta Coefficients 2:', betaCoefficients2_30year);
    console.log('senarioVector:', scenarioVector_30year);
    console.log('senarioVector2:', scenarioVector2_30year);
    const logHR_30year = scenarioVector_30year.reduce((acc, value, index) => acc + value * betaCoefficients_30year[index], 0);
    const logHR2_30year = scenarioVector2_30year.reduce((acc, value, index) => acc + value * betaCoefficients2_30year[index], 0);
    console.log('Log Hazard Ratio (logHR):', logHR_30year);
    console.log('Log Hazard Ratio 2 (logHR2):', logHR2_30year);

    // Adjust f0 by the logHR to calculate the risk
    const f0_30year = s0_30year.map(s => (1 - s)); // Convert survival probability to mortality risk
    const f1help_30year = f0_30year.map((f, index) => Math.min(f * Math.exp(logHR_30year), 100)); // Apply logHR to adjust risk
    const f1_30year = f1help_30year.map((f, index) => f * 10000); // Apply logHR to adjust risk
    const f0_2_30year = s0_2_30year.map(s => (1 - s)); // Convert survival probability to mortality risk
    const f1help2_30year = f0_2_30year.map((f, index) => Math.min(f * Math.exp(logHR2_30year), 100)); // Apply logHR to adjust risk
    const f1_2_30year = f1help2_30year.map((f, index) => f * 10000); // Apply logHR to adjust risk

    const sortedData_30year = timePoints_30year.map((time, index) => ({ time, risk: f1_30year[index] }))
        .sort((a, b) => a.time - b.time); // Sort by time

    const sortedTimePoints_30year = sortedData_30year.map(item => item.time);
    const sortedF1_30year = sortedData_30year.map(item => item.risk);
    
    const sortedData2_30year = timePoints2_30year.map((time, index) => ({ time, risk: f1_2_30year[index] }))
        .sort((a, b) => a.time - b.time); // Sort by time

    const sortedTimePoints2_30year = sortedData2_30year.map(item => item.time);
    const sortedF1_2_30year = sortedData2_30year.map(item => item.risk);

    // Use Plotly.js to create the plot
    const data_30year = [
        {
            x: sortedTimePoints_30year,
            y: sortedF1_30year,
            mode: 'lines',
            line: { color: 'navy' },
            name: 'General Population Mortality Risk'
        },
        {
            x: sortedTimePoints2_30year,
            y: sortedF1_2_30year,
            mode: 'lines',
            line: { color: 'maroon' },
            name: 'Donor Mortality Risk'
        }
    ];

    const layout_30year = {
        title: 'Mortality Risk Over Time',
        xaxis: {
            title: 'Time (days)',
            showgrid: true,
            dtick: 10 // Set tick interval to every 10 units
        },
        yaxis: {
            title: 'Mortality Risk (per 10,000)',
            range: [0, ],
            showgrid: true
        }
    };

    // Plotly rendering with error handling
    Plotly.newPlot('mortality-risk-graph', data_30year, layout_30year).catch(error => {
        console.error('Plotly Error:', error);
    });

    // Display updated scenario vector
    // displayScenarioVector();
}

// Example fetchCSV utility to load the CSV file
async function fetchCSV(filePath) {
    try {
        const response = await fetch(filePath);
        const text = await response.text();
        return text.trim().split('\n');
    } catch (error) {
        console.error(`Error fetching CSV from ${filePath}:`, error);
        return [];
    }
}

// Ensure that model data and survival data are loaded when the page loads
window.onload = function () {
    const modelName = currentModel_30year === 'model1' ? 'model1' : 'model2'; // Ensure correct model name without .csv extension
    loadModelData(modelName); // Load model-specific data for beta coefficients
};
