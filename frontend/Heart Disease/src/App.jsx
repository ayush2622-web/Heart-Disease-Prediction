import { useMemo, useState } from "react";
import "./App.css";


function App() {
  // =========================
  // INITIAL FORM DATA
  // =========================

  const initialFormData = {
    age: "",
    sex: "",
    cp: "",
    trestbps: "",
    chol: "",
    fbs: "",
    restecg: "",
    thalach: "",
    exang: "",
    oldpeak: "",
    slope: "",
    ca: "",
    thal: "",
  };

  // =========================
  // STATE
  // =========================

  const [formData, setFormData] = useState(initialFormData);

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [darkMode, setDarkMode] = useState(false);

  const [activeSection, setActiveSection] = useState("home");

  // =========================
  // FIELD INFORMATION
  // =========================

  const fieldInfo = {
    age: {
      label: "Age",
      description: "Patient's age in years",
    },

    sex: {
      label: "Biological Sex",
      description:
        "Sex value used by the machine learning dataset",
    },

    cp: {
      label: "Chest Pain Type",
      description:
        "Classification of the patient's chest pain",
    },

    trestbps: {
      label: "Resting Blood Pressure",
      description:
        "Blood pressure measured while resting (mm Hg)",
    },

    chol: {
      label: "Serum Cholesterol",
      description:
        "Cholesterol level measured in mg/dL",
    },

    fbs: {
      label: "Fasting Blood Sugar",
      description:
        "Whether fasting blood sugar is above 120 mg/dL",
    },

    restecg: {
      label: "Resting ECG",
      description:
        "Results of the resting electrocardiogram",
    },

    thalach: {
      label: "Maximum Heart Rate",
      description:
        "Highest heart rate achieved during testing",
    },

    exang: {
      label: "Exercise Induced Angina",
      description:
        "Whether exercise causes chest pain",
    },

    oldpeak: {
      label: "ST Depression (Oldpeak)",
      description:
        "ST depression induced by exercise relative to rest",
    },

    slope: {
      label: "ST Segment Slope",
      description:
        "Slope of the peak exercise ST segment",
    },

    ca: {
      label: "Major Vessels",
      description:
        "Number of major vessels observed",
    },

    thal: {
      label: "Thalassemia",
      description:
        "Thalassemia-related test category",
    },
  };

  // =========================
  // FORM COMPLETION PROGRESS
  // =========================

  const completionPercentage = useMemo(() => {
    const values = Object.values(formData);

    const completedFields = values.filter(
      (value) => value !== ""
    ).length;

    return Math.round(
      (completedFields / values.length) * 100
    );
  }, [formData]);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setError("");

    if (result) {
      setResult(null);
    }
  };

  // =========================
  // RESET FORM
  // =========================

  const handleReset = () => {
    setFormData(initialFormData);

    setResult(null);

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // SAMPLE DATA
  // =========================

  const fillSampleData = () => {
    setFormData({
      age: "52",
      sex: "1",
      cp: "0",
      trestbps: "125",
      chol: "212",
      fbs: "0",
      restecg: "1",
      thalach: "168",
      exang: "0",
      oldpeak: "1.0",
      slope: "2",
      ca: "2",
      thal: "3",
    });

    setResult(null);

    setError("");
  };

  // =========================
  // VALIDATE FORM
  // =========================

  const validateForm = () => {
    const emptyField = Object.entries(formData).find(
      ([, value]) => value === ""
    );

    if (emptyField) {
      const fieldName = emptyField[0];

      setError(
        `Please complete the "${fieldInfo[fieldName].label}" field.`
      );

      return false;
    }

    const age = Number(formData.age);

    const bloodPressure = Number(formData.trestbps);

    const cholesterol = Number(formData.chol);

    const heartRate = Number(formData.thalach);

    const oldpeak = Number(formData.oldpeak);

    if (age < 1 || age > 120) {
      setError(
        "Please enter an age between 1 and 120 years."
      );

      return false;
    }

    if (
      bloodPressure < 50 ||
      bloodPressure > 250
    ) {
      setError(
        "Please enter a resting blood pressure between 50 and 250 mm Hg."
      );

      return false;
    }

    if (
      cholesterol < 50 ||
      cholesterol > 700
    ) {
      setError(
        "Please enter a cholesterol value between 50 and 700 mg/dL."
      );

      return false;
    }

    if (
      heartRate < 40 ||
      heartRate > 250
    ) {
      setError(
        "Please enter a maximum heart rate between 40 and 250 BPM."
      );

      return false;
    }

    if (
      oldpeak < 0 ||
      oldpeak > 10
    ) {
      setError(
        "Please enter an ST depression value between 0 and 10."
      );

      return false;
    }

    return true;
  };

  // =========================
  // SUBMIT PREDICTION
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    setError("");

    setResult(null);

    try {
      const requestData = Object.fromEntries(
        Object.entries(formData).map(
          ([key, value]) => [
            key,
            Number(value),
          ]
        )
      );

      const response = await fetch(
        "https://heart-disease-prediction-iibb.onrender.com",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(requestData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "The prediction could not be completed."
        );
      }

      setResult(data);

      setTimeout(() => {
        document
          .getElementById("prediction-result")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      }, 200);
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to connect to the prediction server. Make sure the Flask backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RISK INFORMATION
  // =========================

  const getRiskPercentage = () => {
    if (!result) {
      return 0;
    }

    if (
      result.probability !== undefined &&
      result.probability !== null
    ) {
      const probability =
        Number(result.probability);

      if (probability <= 1) {
        return Math.round(
          probability * 100
        );
      }

      return Math.round(probability);
    }

    return result.prediction === 1
      ? 75
      : 25;
  };

  const riskPercentage =
    getRiskPercentage();

  const getRiskLevel = () => {
    if (riskPercentage < 30) {
      return {
        level: "Low Risk",
        className: "low-risk",
        icon: "✓",
        message:
          "The model indicates a relatively lower likelihood of heart disease based on the submitted information.",
      };
    }

    if (riskPercentage < 60) {
      return {
        level: "Moderate Risk",
        className: "moderate-risk",
        icon: "!",
        message:
          "The model indicates a moderate risk pattern in the submitted health information.",
      };
    }

    return {
      level: "Higher Risk",
      className: "high-risk",
      icon: "!",
      message:
        "The model indicates a higher likelihood of heart disease based on the submitted health information.",
    };
  };

  const riskInformation =
    getRiskLevel();

  // =========================
  // PRINT REPORT
  // =========================

  const printReport = () => {
    window.print();
  };

  // =========================
  // SCROLL NAVIGATION
  // =========================

  const navigateTo = (sectionId) => {
    setActiveSection(sectionId);

    document
      .getElementById(sectionId)
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  // =========================
  // REUSABLE FIELD COMPONENT
  // =========================

  const FieldHeader = ({
    title,
    description,
  }) => {
    return (
      <div className="field-heading">
        <label>{title}</label>

        <span
          className="info-icon"
          title={description}
        >
          i
        </span>
      </div>
    );
  };

  // =========================
  // APPLICATION UI
  // =========================

  return (
    <div
      className={
        darkMode
          ? "app dark-mode"
          : "app"
      }
    >

      {/* =========================
          NAVIGATION BAR
      ========================= */}

      <nav className="navbar">

        <div
          className="logo"
          onClick={() =>
            navigateTo("home")
          }
        >

          <div className="logo-icon">
            ♥
          </div>

          <div className="logo-text">

            <strong>
              CardioPredict
            </strong>

            <span>
              AI Heart Analysis
            </span>

          </div>

        </div>


        <div className="nav-links">

          <button
            className={
              activeSection === "home"
                ? "active"
                : ""
            }
            onClick={() =>
              navigateTo("home")
            }
          >
            Home
          </button>


          <button
            className={
              activeSection ===
              "prediction"
                ? "active"
                : ""
            }
            onClick={() =>
              navigateTo("prediction")
            }
          >
            Prediction
          </button>


          <button
            className={
              activeSection === "model"
                ? "active"
                : ""
            }
            onClick={() =>
              navigateTo("model")
            }
          >
            Model
          </button>
          


          <button
            className="theme-toggle"
            onClick={() =>
              setDarkMode(
                !darkMode
              )
            }
            aria-label="Toggle theme"
          >

            {darkMode
              ? "☀"
              : "☾"}

          </button>

        </div>

      </nav>


      {/* =========================
          HERO SECTION
      ========================= */}

      <main>

        <section
          className="hero-section"
          id="home"
        >

          <div className="hero-background">

            <div className="background-circle circle-one"></div>

            <div className="background-circle circle-two"></div>

            <div className="background-circle circle-three"></div>

          </div>


          <div className="hero-content">

            <div className="hero-badge">

              <span className="badge-dot"></span>

              MACHINE LEARNING POWERED

            </div>


            <h1>

              Smarter Insights for

              <span>
                {" "}
                Better Heart Health
              </span>

            </h1>


            <p className="hero-description">

              Analyze key health indicators
              using a machine-learning model
              trained to identify patterns
              associated with heart disease.

            </p>


            <div className="hero-actions">

              <button
                className="primary-hero-button"
                onClick={() =>
                  navigateTo(
                    "prediction"
                  )
                }
              >

                Start Risk Assessment

                <span>→</span>

              </button>


              <button
                className="secondary-hero-button"
                onClick={() =>
                  navigateTo("model")
                }
              >

                Explore the Model

              </button>

            </div>


            <div className="hero-trust">

              <div className="trust-item">

                <span>✓</span>

                13 Clinical Features

              </div>


              <div className="trust-item">

                <span>✓</span>

                Instant ML Analysis

              </div>


              <div className="trust-item">

                <span>✓</span>

                Educational Project

              </div>

            </div>

          </div>


          <div className="hero-visual">

            <div className="heart-monitor-card">

              <div className="monitor-header">

                <div>

                  <span className="monitor-label">
                    AI HEALTH MONITOR
                  </span>

                  <h3>
                    Heart Analysis
                  </h3>

                </div>


                <div className="live-indicator">

                  <span></span>

                  ACTIVE

                </div>

              </div>


              <div className="heart-animation">

                <div className="heart-circle">

                  <span className="animated-heart">
                    ♥
                  </span>

                  <div className="pulse-wave pulse-one"></div>

                  <div className="pulse-wave pulse-two"></div>

                </div>

              </div>


              <div className="ecg-container">

                <div className="ecg-line">

                  <span></span>

                  <span></span>

                  <span></span>

                  <span></span>

                  <span></span>

                </div>

              </div>


              <div className="monitor-stats">

                <div>

                  <span>
                    MODEL
                  </span>

                  <strong>
                    Logistic Regression
                  </strong>

                </div>


                <div>

                  <span>
                    FEATURES
                  </span>

                  <strong>
                    13 Parameters
                  </strong>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =========================
            FEATURE STATISTICS
        ========================= */}

        <section className="feature-strip">

          <div className="feature-stat">

            <div className="stat-icon">
              13
            </div>

            <div>

              <strong>
                Clinical Features
              </strong>

              <span>
                Comprehensive analysis
              </span>

            </div>

          </div>


          <div className="feature-stat">

            <div className="stat-icon">
              AI
            </div>

            <div>

              <strong>
                Machine Learning
              </strong>

              <span>
                Data-driven prediction
              </span>

            </div>

          </div>


          <div className="feature-stat">

            <div className="stat-icon">
              ⚡
            </div>

            <div>

              <strong>
                Fast Analysis
              </strong>

              <span>
                Results in seconds
              </span>

            </div>

          </div>


          <div className="feature-stat">

            <div className="stat-icon">
              ✓
            </div>

            <div>

              <strong>
                Simple Interface
              </strong>

              <span>
                Easy health data entry
              </span>

            </div>

          </div>

        </section>


        {/* =========================
            PREDICTION SECTION
        ========================= */}

        <section
          className="prediction-section"
          id="prediction"
        >

          <div className="section-header">

            <span className="section-label">
              HEART RISK ASSESSMENT
            </span>

            <h2>
              Complete Your Health Profile
            </h2>

            <p>

              Enter the required health
              parameters below. All fields
              are required for the machine
              learning prediction.

            </p>

          </div>


          {/* FORM PROGRESS */}

          <div className="form-progress-card">

            <div className="progress-information">

              <div>

                <span>
                  Assessment Progress
                </span>

                <strong>

                  {completionPercentage}%
                  Complete

                </strong>

              </div>


              <span className="field-counter">

                {
                  Object.values(
                    formData
                  ).filter(
                    (value) =>
                      value !== ""
                  ).length
                }

                /13 fields completed

              </span>

            </div>


            <div className="completion-track">

              <div
                className="completion-fill"
                style={{
                  width: `${completionPercentage}%`,
                }}
              ></div>

            </div>

          </div>


          <div className="form-actions-top">

            <button
              type="button"
              className="sample-button"
              onClick={fillSampleData}
            >

              ⚡ Fill Sample Data

            </button>


            <button
              type="button"
              className="clear-button"
              onClick={handleReset}
            >

              ↻ Clear All

            </button>

          </div>


          {/* =========================
              FORM START
          ========================= */}

          <form
            className="advanced-form"
            onSubmit={handleSubmit}
          >

            {/* PERSONAL INFORMATION */}

            <div className="form-section-card">

              <div className="form-section-header">

                <div className="section-number">
                  01
                </div>

                <div>

                  <h3>
                    Personal Information
                  </h3>

                  <p>
                    Basic patient information
                    used by the prediction model.
                  </p>

                </div>

              </div>


              <div className="form-grid">


                <div className="input-group">

                  <FieldHeader
                    title="Age"
                    description={
                      fieldInfo.age
                        .description
                    }
                  />

                  <div className="input-wrapper">

                    <input
                      type="number"
                      name="age"
                      value={
                        formData.age
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter age"
                      min="1"
                      max="120"
                      required
                    />

                    <span className="input-unit">
                      years
                    </span>

                  </div>

                </div>


                <div className="input-group">

                  <FieldHeader
                    title="Biological Sex"
                    description={
                      fieldInfo.sex
                        .description
                    }
                  />

                  <select
                    name="sex"
                    value={
                      formData.sex
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Select an option
                    </option>

                    <option value="1">
                      Male
                    </option>

                    <option value="0">
                      Female
                    </option>

                  </select>

                </div>

              </div>

            </div>


            {/* CLINICAL MEASUREMENTS */}

            <div className="form-section-card">

              <div className="form-section-header">

                <div className="section-number">
                  02
                </div>

                <div>

                  <h3>
                    Clinical Measurements
                  </h3>

                  <p>
                    Enter key cardiovascular
                    measurements and test results.
                  </p>

                </div>

              </div>


              <div className="form-grid">


                <div className="input-group">

                  <FieldHeader
                    title="Resting Blood Pressure"
                    description={
                      fieldInfo.trestbps
                        .description
                    }
                  />

                  <div className="input-wrapper">

                    <input
                      type="number"
                      name="trestbps"
                      value={
                        formData.trestbps
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Example: 120"
                      min="50"
                      max="250"
                      required
                    />

                    <span className="input-unit">
                      mm Hg
                    </span>

                  </div>

                </div>


                <div className="input-group">

                  <FieldHeader
                    title="Serum Cholesterol"
                    description={
                      fieldInfo.chol
                        .description
                    }
                  />

                  <div className="input-wrapper">

                    <input
                      type="number"
                      name="chol"
                      value={
                        formData.chol
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Example: 220"
                      min="50"
                      max="700"
                      required
                    />

                    <span className="input-unit">
                      mg/dL
                    </span>

                  </div>

                </div>


                <div className="input-group">

                  <FieldHeader
                    title="Maximum Heart Rate"
                    description={
                      fieldInfo.thalach
                        .description
                    }
                  />

                  <div className="input-wrapper">

                    <input
                      type="number"
                      name="thalach"
                      value={
                        formData.thalach
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Example: 150"
                      min="40"
                      max="250"
                      required
                    />

                    <span className="input-unit">
                      BPM
                    </span>

                  </div>

                </div>


                <div className="input-group">

                  <FieldHeader
                    title="Fasting Blood Sugar"
                    description={
                      fieldInfo.fbs
                        .description
                    }
                  />

                  <select
                    name="fbs"
                    value={
                      formData.fbs
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Select result
                    </option>

                    <option value="0">
                      120 mg/dL or lower
                    </option>

                    <option value="1">
                      Greater than 120 mg/dL
                    </option>

                  </select>

                </div>

              </div>

            </div>
            {/* =========================
                HEART & ECG INFORMATION
            ========================= */}

            <div className="form-section-card">

              <div className="form-section-header">

                <div className="section-number">
                  03
                </div>

                <div>
                  <h3>
                    Heart & ECG Information
                  </h3>

                  <p>
                    Provide chest pain, ECG and exercise-related
                    cardiovascular information.
                  </p>
                </div>

              </div>


              <div className="form-grid">

                {/* CHEST PAIN TYPE */}

                <div className="input-group">

                  <FieldHeader
                    title="Chest Pain Type"
                    description={
                      fieldInfo.cp.description
                    }
                  />

                  <select
                    name="cp"
                    value={formData.cp}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select chest pain type
                    </option>

                    <option value="0">
                      Type 0
                    </option>

                    <option value="1">
                      Type 1
                    </option>

                    <option value="2">
                      Type 2
                    </option>

                    <option value="3">
                      Type 3
                    </option>

                  </select>

                </div>


                {/* RESTING ECG */}

                <div className="input-group">

                  <FieldHeader
                    title="Resting ECG Result"
                    description={
                      fieldInfo.restecg.description
                    }
                  />

                  <select
                    name="restecg"
                    value={formData.restecg}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select ECG result
                    </option>

                    <option value="0">
                      Normal
                    </option>

                    <option value="1">
                      ST-T Wave Abnormality
                    </option>

                    <option value="2">
                      Left Ventricular Hypertrophy
                    </option>

                  </select>

                </div>


                {/* EXERCISE ANGINA */}

                <div className="input-group">

                  <FieldHeader
                    title="Exercise Induced Angina"
                    description={
                      fieldInfo.exang.description
                    }
                  />

                  <select
                    name="exang"
                    value={formData.exang}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select an option
                    </option>

                    <option value="0">
                      No
                    </option>

                    <option value="1">
                      Yes
                    </option>

                  </select>

                </div>


                {/* OLDPEAK */}

                <div className="input-group">

                  <FieldHeader
                    title="ST Depression (Oldpeak)"
                    description={
                      fieldInfo.oldpeak.description
                    }
                  />

                  <input
                    type="number"
                    name="oldpeak"
                    value={formData.oldpeak}
                    onChange={handleChange}
                    placeholder="Example: 1.2"
                    min="0"
                    max="10"
                    step="0.1"
                    required
                  />

                </div>


                {/* ST SLOPE */}

                <div className="input-group">

                  <FieldHeader
                    title="ST Segment Slope"
                    description={
                      fieldInfo.slope.description
                    }
                  />

                  <select
                    name="slope"
                    value={formData.slope}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select ST slope
                    </option>

                    <option value="0">
                      Upsloping
                    </option>

                    <option value="1">
                      Flat
                    </option>

                    <option value="2">
                      Downsloping
                    </option>

                  </select>

                </div>

              </div>

            </div>


            {/* =========================
                ADVANCED CLINICAL DATA
            ========================= */}

            <div className="form-section-card">

              <div className="form-section-header">

                <div className="section-number">
                  04
                </div>

                <div>

                  <h3>
                    Advanced Clinical Data
                  </h3>

                  <p>
                    Complete the remaining clinical indicators
                    required by the prediction model.
                  </p>

                </div>

              </div>


              <div className="form-grid">

                {/* MAJOR VESSELS */}

                <div className="input-group">

                  <FieldHeader
                    title="Number of Major Vessels"
                    description={
                      fieldInfo.ca.description
                    }
                  />

                  <select
                    name="ca"
                    value={formData.ca}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select number of vessels
                    </option>

                    <option value="0">
                      0
                    </option>

                    <option value="1">
                      1
                    </option>

                    <option value="2">
                      2
                    </option>

                    <option value="3">
                      3
                    </option>

                    <option value="4">
                      4
                    </option>

                  </select>

                </div>


                {/* THALASSEMIA */}

                <div className="input-group">

                  <FieldHeader
                    title="Thalassemia"
                    description={
                      fieldInfo.thal.description
                    }
                  />

                  <select
                    name="thal"
                    value={formData.thal}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select test category
                    </option>

                    <option value="0">
                      Category 0
                    </option>

                    <option value="1">
                      Category 1
                    </option>

                    <option value="2">
                      Category 2
                    </option>

                    <option value="3">
                      Category 3
                    </option>

                  </select>

                </div>

              </div>

            </div>


            {/* =========================
                FORM ERROR
            ========================= */}

            {error && (

              <div className="form-error">

                <div className="error-icon">
                  !
                </div>

                <div>

                  <strong>
                    Unable to complete assessment
                  </strong>

                  <p>
                    {error}
                  </p>

                </div>

              </div>

            )}


            {/* =========================
                FORM SUBMISSION
            ========================= */}

            <div className="submission-card">

              <div className="submission-info">

                <div className="submission-icon">
                  ♥
                </div>

                <div>

                  <h3>
                    Ready for AI Analysis?
                  </h3>

                  <p>
                    Make sure all 13 health parameters
                    are completed before running the model.
                  </p>

                </div>

              </div>


              <div className="submission-actions">

                <button
                  type="button"
                  className="reset-form-button"
                  onClick={handleReset}
                >
                  Reset Form
                </button>


                <button
                  type="submit"
                  className="prediction-button"
                  disabled={
                    loading ||
                    completionPercentage < 100
                  }
                >

                  {loading ? (

                    <>
                      <span className="loading-spinner"></span>

                      Analyzing Health Data...
                    </>

                  ) : (

                    <>
                      Analyze Heart Risk

                      <span>
                        →
                      </span>
                    </>

                  )}

                </button>

              </div>

            </div>

          </form>


          {/* =========================
              PREDICTION RESULT
          ========================= */}

          {result && (

            <div
              id="prediction-result"
              className={`prediction-result-card ${riskInformation.className}`}
            >

              <div className="result-top-section">

                <div className="result-status">

                  <div className="result-icon-circle">

                    {riskInformation.icon}

                  </div>


                  <div>

                    <span className="result-label">
                      AI PREDICTION RESULT
                    </span>

                    <h2>
                      {riskInformation.level}
                    </h2>

                    <p>
                      {riskInformation.message}
                    </p>

                  </div>

                </div>


                <div className="risk-score-container">

                  <div
                    className="risk-score-circle"
                    style={{
                      "--risk-progress":
                        `${riskPercentage * 3.6}deg`,
                    }}
                  >

                    <div className="risk-score-inner">

                      <strong>
                        {riskPercentage}%
                      </strong>

                      <span>
                        Risk Score
                      </span>

                    </div>

                  </div>

                </div>

              </div>


              {/* RISK PROGRESS */}

              <div className="risk-analysis">

                <div className="risk-analysis-header">

                  <span>
                    Estimated Risk Level
                  </span>

                  <strong>
                    {riskInformation.level}
                  </strong>

                </div>


                <div className="risk-scale">

                  <div
                    className="risk-scale-progress"
                    style={{
                      width:
                        `${Math.min(
                          riskPercentage,
                          100
                        )}%`,
                    }}
                  ></div>

                </div>


                <div className="risk-scale-labels">

                  <span>
                    Low
                  </span>

                  <span>
                    Moderate
                  </span>

                  <span>
                    High
                  </span>

                </div>

              </div>


              {/* RESULT DETAILS */}

              <div className="result-insights">

                <div className="insight-card">

                  <div className="insight-icon">
                    AI
                  </div>

                  <div>

                    <h4>
                      Model Prediction
                    </h4>

                    <p>

                      The Logistic Regression
                      model classified this
                      assessment as

                      <strong>
                        {" "}
                        {result.prediction === 1
                          ? "positive for higher risk patterns."
                          : "negative for higher risk patterns."}
                      </strong>

                    </p>

                  </div>

                </div>


                <div className="insight-card">

                  <div className="insight-icon">
                    13
                  </div>

                  <div>

                    <h4>
                      Features Analyzed
                    </h4>

                    <p>
                      The prediction was generated
                      using all 13 submitted
                      health and clinical parameters.
                    </p>

                  </div>

                </div>


                <div className="insight-card">

                  <div className="insight-icon">
                    !
                  </div>

                  <div>

                    <h4>
                      Important Reminder
                    </h4>

                    <p>
                      This result is generated by
                      a machine-learning model and
                      should not be treated as a
                      clinical diagnosis.
                    </p>

                  </div>

                </div>

              </div>


              {/* REPORT ACTIONS */}

              <div className="result-actions">

                <button
                  className="print-button"
                  onClick={printReport}
                >
                  Print Assessment Report
                </button>


                <button
                  className="new-assessment-button"
                  onClick={() => {

                    setResult(null);

                    navigateTo(
                      "prediction"
                    );

                  }}
                >
                  New Assessment
                </button>

              </div>

            </div>

          )}

        </section>


        {/* =========================
            MODEL INFORMATION
        ========================= */}

        <section
          className="model-section"
          id="model"
        >

          <div className="section-header">

            <span className="section-label">
              BEHIND THE PREDICTION
            </span>

            <h2>
              Powered by Machine Learning
            </h2>

            <p>
              The application uses a trained
              Logistic Regression classification
              model to analyze cardiovascular
              health indicators.
            </p>

          </div>


          <div className="model-overview">

            <div className="model-main-card">

              <div className="model-card-header">

                <div className="model-icon">
                  AI
                </div>

                <div>

                  <span>
                    CLASSIFICATION MODEL
                  </span>

                  <h3>
                    Logistic Regression
                  </h3>

                </div>

              </div>


              <p className="model-description">

                Logistic Regression is a
                supervised machine-learning
                algorithm commonly used for
                binary classification. In this
                project, the model analyzes
                patient health parameters and
                predicts whether the submitted
                data shows patterns associated
                with heart disease.

              </p>


              <div className="model-tags">

                <span>
                  Binary Classification
                </span>

                <span>
                  Supervised Learning
                </span>

                <span>
                  Scikit-learn
                </span>

                <span>
                  Python
                </span>

              </div>

            </div>


            <div className="model-details-grid">

              <div className="model-detail-card">

                <span className="detail-number">
                  13
                </span>

                <h4>
                  Input Features
                </h4>

                <p>
                  Clinical parameters analyzed
                  for every prediction.
                </p>

              </div>


              <div className="model-detail-card">

                <span className="detail-number">
                  2
                </span>

                <h4>
                  Prediction Classes
                </h4>

                <p>
                  Lower and higher heart
                  disease risk patterns.
                </p>

              </div>


              <div className="model-detail-card">

                <span className="detail-number">
                  ML
                </span>

                <h4>
                  Prediction Engine
                </h4>

                <p>
                  A trained machine-learning
                  pipeline processes the data.
                </p>

              </div>

            </div>

          </div>


          {/* HOW IT WORKS */}

          <div className="workflow-section">

            <div className="workflow-heading">

              <span>
                PREDICTION PIPELINE
              </span>

              <h3>
                How CardioPredict Works
              </h3>

            </div>


            <div className="workflow-grid">

              <div className="workflow-card">

                <div className="workflow-number">
                  01
                </div>

                <div className="workflow-icon">
                  ◉
                </div>

                <h4>
                  Enter Health Data
                </h4>

                <p>
                  The user provides 13
                  cardiovascular and clinical
                  health parameters.
                </p>

              </div>


              <div className="workflow-connector">
                →
              </div>


              <div className="workflow-card">

                <div className="workflow-number">
                  02
                </div>

                <div className="workflow-icon"></div>
                <h4>
                  Data Processing
                </h4>

                <p>
                  The submitted values are
                  prepared and passed through
                  the trained prediction pipeline.
                </p>

              </div>


              <div className="workflow-connector">
                →
              </div>


              <div className="workflow-card">

                <div className="workflow-number">
                  03
                </div>

                <div className="workflow-icon">
                  AI
                </div>

                <h4>
                  ML Prediction
                </h4>

                <p>
                  Logistic Regression analyzes
                  the health indicators and
                  generates a prediction.
                </p>

              </div>


              <div className="workflow-connector">
                →
              </div>


              <div className="workflow-card">

                <div className="workflow-number">
                  04
                </div>

                <div className="workflow-icon">
                  ✓
                </div>

                <h4>
                  Risk Result
                </h4>

                <p>
                  The application presents the
                  predicted class and available
                  probability score.
                </p>

              </div>

            </div>

          </div>


          {/* FEATURES USED */}

          <div className="features-used">

            <div className="features-heading">

              <span>
                MODEL INPUTS
              </span>

              <h3>
                Health Parameters Analyzed
              </h3>

            </div>


            <div className="health-features-grid">

              {Object.entries(
                fieldInfo
              ).map(
                ([key, information], index) => (

                  <div
                    className="health-feature-card"
                    key={key}
                  >

                    <span className="feature-index">

                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}

                    </span>

                    <div>

                      <strong>
                        {
                          information.label
                        }
                      </strong>

                      <p>
                        {
                          information.description
                        }
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </section>


        {/* =========================
            DISCLAIMER
        ========================= */}

        <section className="disclaimer-section">

          <div className="disclaimer-icon">
            !
          </div>


          <div>

            <h3>
              Medical Disclaimer
            </h3>

            <p>
              CardioPredict  is an educational
              machine-learning project and is not
              a medical diagnostic tool. Predictions
              generated by this application should
              not be used to diagnose, treat, prevent,
              or make medical decisions about any
              health condition. Consult a qualified
              healthcare professional for medical
              evaluation and advice.
            </p>

          </div>

        </section>

      </main>


      {/* =========================
          FOOTER
      ========================= */}

      <footer className="footer">

        <div className="footer-main">

          <div className="footer-brand">

            <div className="footer-logo">

              <span>
                ♥
              </span>

              CardioPredict 

            </div>


            <p>
              A machine-learning based heart
              disease prediction project built
              using React, Flask, Python and
              Logistic Regression.
            </p>

          </div>


          <div className="footer-tech">

            <span>
              TECHNOLOGY STACK
            </span>

            <div className="tech-list">

              <span>
                React
              </span>

              <span>
                Flask
              </span>

              <span>
                Python
              </span>

              <span>
                Scikit-learn
              </span>

            </div>

          </div>

        </div>


        <div className="footer-bottom">

          <p>
            © 2026 CardioPredict AI —
            Educational Machine Learning Project
          </p>

          <button
            onClick={() =>
              navigateTo("home")
            }
          >
            Back to Top ↑
          </button>

        </div>

      </footer>

    </div>
  );
}

export default App;