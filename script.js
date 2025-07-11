const appId = "58b21cd6";
const appKey = "19d61a8074f64b75148780fdeaaef55e";

function updateLevels() {
  const disease = document.getElementById("diseaseInput").value;
  const level = document.getElementById("conditionLevel");
  level.style.display = disease ? "inline-block" : "none";

  level.innerHTML = ""; // clear previous

  if (disease === "liver") {
    ["Fatty", "Fibrosis", "Cirrhosis"].forEach(lvl =>
      level.add(new Option(lvl, lvl.toLowerCase())));
  } else if (disease === "diabetes") {
    ["Low Risk", "Medium Risk", "High Risk"].forEach(lvl =>
      level.add(new Option(lvl, lvl.toLowerCase())));
  } else if (disease === "weight loss") {
    ["Very High Weight", "Medium High Weight", "Low High Weight"].forEach(lvl =>
      level.add(new Option(lvl, lvl.toLowerCase())));
  }
}

async function checkFood() {
  const food = document.getElementById("foodInput").value.trim();
  const amount = document.getElementById("amountValue").value.trim();
  const unit = document.getElementById("amountUnit").value;
  const condition = document.getElementById("diseaseInput").value.toLowerCase();
  const level = document.getElementById("conditionLevel").value;
  const resultDiv = document.getElementById("result");

  if (!food || !amount) {
    resultDiv.innerHTML = "Please enter food and amount.";
    return;
  }

  const fullQuery = `${amount} ${unit} ${food}`;
  resultDiv.innerHTML = "Checking...";

  try {
    const response = await fetch("https://trackapi.nutritionix.com/v2/natural/nutrients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-id": appId,
        "x-app-key": appKey
      },
      body: JSON.stringify({ query: fullQuery })
    });

    const data = await response.json();
    const item = data.foods?.[0];

    if (!item) {
      resultDiv.innerHTML = "Food not found.";
      return;
    }

    const { food_name, nf_calories, nf_total_fat, nf_sugars, nf_sodium, nf_protein } = item;
    let verdict = "Not Healthy";
    let tips = "";
    let color = "red";

    // Check if "masala" is in name and liver condition
    if (food.toLowerCase().includes("masala") && condition === "liver") {
      verdict = "Not Healthy";
      tips = "Masala items are usually oily/spicy and harmful for liver.";
    } else if (condition === "liver") {
      if (level === "fatty" && nf_sodium < 200 && nf_total_fat < 10 && nf_sugars < 10) {
        verdict = "Healthy";
        tips = "Suitable for fatty liver if not masala/spicy.";
      } else if (level === "fibrosis" && nf_sodium < 150 && nf_total_fat < 7 && nf_sugars < 8) {
        verdict = "Healthy";
        tips = "Good for liver fibrosis if low sodium and fat.";
      } else if (level === "cirrhosis" && nf_sodium < 120 && nf_total_fat < 5 && nf_sugars < 5) {
        verdict = "Healthy";
        tips = "Safe for cirrhosis only if very light and bland.";
      } else {
        verdict = "Not Healthy";
        tips = "Too high in sodium, fat or sugar for liver condition.";
      }
    } else if (condition === "diabetes") {
      const sugarLimit = level === "low risk" ? 15 : level === "medium risk" ? 10 : 5;
      if (nf_sugars <= sugarLimit && nf_total_fat < 15) {
        verdict = "Healthy";
        tips = "Okay for your diabetes level.";
      } else {
        verdict = "Not Healthy";
        tips = "Too sugary or fatty for diabetes.";
      }
    } else if (condition === "weight loss") {
      const calorieLimit = level === "very high weight" ? 600 : level === "medium high weight" ? 500 : 400;
      if (nf_calories <= calorieLimit && nf_total_fat < 10) {
        verdict = "Healthy";
        tips = "Supports your weight loss stage.";
      } else {
        verdict = "Not Healthy";
        tips = "Avoid high-calorie and high-fat foods.";
      }
    } else {
      // No condition
      if (nf_calories < 500 && nf_total_fat < 15 && nf_sugars < 15) {
        verdict = "Healthy";
        tips = "Balanced for general health.";
      }
    }

    color = verdict === "Healthy" ? "green" : "red";

    resultDiv.innerHTML = `
      <h3>${food_name.toUpperCase()} (${amount} ${unit})</h3>
      <p><strong>Calories:</strong> ${nf_calories}</p>
      <p><strong>Total Fat:</strong> ${nf_total_fat} g</p>
      <p><strong>Sugar:</strong> ${nf_sugars} g</p>
      <p><strong>Sodium:</strong> ${nf_sodium} mg</p>
      <p><strong>Protein:</strong> ${nf_protein} g</p>
      <h2 style="color:${color};">${verdict}</h2>
      <p style="color:#555;">${tips}</p>
    `;
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "Something went wrong. Please try again.";
  }
}



