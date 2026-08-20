/* =========================================================
   OVERTIME CALCULATOR
   Secure Client-Side Calculation
========================================================= */

"use strict";


/* =========================================================
   DOM ELEMENTS
========================================================= */

const salaryInput = document.getElementById("salary");
const workingDaysInput = document.getElementById("workingDays");
const standardHoursInput = document.getElementById("standardHours");
const otHoursInput = document.getElementById("otHours");
const otMultiplierInput = document.getElementById("otMultiplier");
const calculateBtn = document.getElementById("calculateBtn");

const dailySalaryOutput = document.getElementById("dailySalary");
const hourlyRateOutput = document.getElementById("hourlyRate");
const otHourlyRateOutput = document.getElementById("otHourlyRate");
const otEarningsOutput = document.getElementById("otEarnings");
const totalEarningsOutput = document.getElementById("totalEarnings");


/* =========================================================
   CONSTANTS
========================================================= */

const MIN_SALARY = 0;
const MAX_SALARY = 100000000;

const MIN_WORKING_DAYS = 1;
const MAX_WORKING_DAYS = 31;

const MIN_STANDARD_HOURS = 6;
const MAX_STANDARD_HOURS = 12;

const MIN_OT_HOURS = 0;
const MAX_OT_HOURS = 240;

const ALLOWED_MULTIPLIERS = Object.freeze([
    0.5,
    1,
    1.5,
    2
]);


/* =========================================================
   NUMBER VALIDATION
========================================================= */

/**
 * Safely converts an input value into a finite number.
 */
function getSafeNumber(input) {

    if (!input) {
        throw new Error("Input element not found.");
    }

    const value = Number(input.value);

    if (!Number.isFinite(value)) {
        throw new Error("Invalid number.");
    }

    return value;
}


/**
 * Checks whether a number is within the allowed range.
 */
function validateRange(value, min, max) {

    if (!Number.isFinite(value)) {
        return false;
    }

    return value >= min && value <= max;
}


/* =========================================================
   OT MULTIPLIER VALIDATION
========================================================= */

function getSafeMultiplier() {

    if (!otMultiplierInput) {
        throw new Error("OT multiplier input not found.");
    }

    const multiplier = Number(otMultiplierInput.value);

    if (!Number.isFinite(multiplier)) {
        throw new Error("Invalid overtime multiplier.");
    }

    if (!ALLOWED_MULTIPLIERS.includes(multiplier)) {
        throw new Error("Invalid overtime multiplier.");
    }

    return multiplier;
}


/* =========================================================
   CURRENCY FORMATTER
========================================================= */

function formatCurrency(value) {

    if (!Number.isFinite(value)) {
        return "₹0.00";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}


/* =========================================================
   RESET RESULTS
========================================================= */

function resetResults() {

    if (dailySalaryOutput) {
        dailySalaryOutput.textContent = "₹0.00";
    }

    if (hourlyRateOutput) {
        hourlyRateOutput.textContent = "₹0.00";
    }

    if (otHourlyRateOutput) {
        otHourlyRateOutput.textContent = "₹0.00";
    }

    if (otEarningsOutput) {
        otEarningsOutput.textContent = "₹0.00";
    }

    if (totalEarningsOutput) {
        totalEarningsOutput.textContent = "₹0.00";
    }
}


/* =========================================================
   ERROR HANDLING
========================================================= */

function showError(message) {

    resetResults();

    alert(message);
}


/* =========================================================
   MAIN OVERTIME CALCULATION
========================================================= */

function calculateOvertime() {

    try {

        /* -------------------------------------------------
           CHECK REQUIRED ELEMENTS
        ------------------------------------------------- */

        if (
            !salaryInput ||
            !workingDaysInput ||
            !standardHoursInput ||
            !otHoursInput ||
            !otMultiplierInput ||
            !dailySalaryOutput ||
            !hourlyRateOutput ||
            !otHourlyRateOutput ||
            !otEarningsOutput ||
            !totalEarningsOutput
        ) {
            throw new Error(
                "Calculator elements are missing from the page."
            );
        }


        /* -------------------------------------------------
           READ INPUT VALUES
        ------------------------------------------------- */

        const salary = getSafeNumber(salaryInput);

        const workingDays =
            getSafeNumber(workingDaysInput);

        const standardHours =
            getSafeNumber(standardHoursInput);

        const otHours =
            getSafeNumber(otHoursInput);

        const otMultiplier =
            getSafeMultiplier();


        /* -------------------------------------------------
           VALIDATE SALARY
        ------------------------------------------------- */

        if (
            !validateRange(
                salary,
                MIN_SALARY,
                MAX_SALARY
            )
        ) {
            throw new Error(
                "Please enter a valid monthly salary."
            );
        }


        /* -------------------------------------------------
           VALIDATE WORKING DAYS
        ------------------------------------------------- */

        if (
            !validateRange(
                workingDays,
                MIN_WORKING_DAYS,
                MAX_WORKING_DAYS
            )
        ) {
            throw new Error(
                "Working days must be between 1 and 31."
            );
        }


        /* -------------------------------------------------
           VALIDATE STANDARD HOURS
        ------------------------------------------------- */

        if (
            !validateRange(
                standardHours,
                MIN_STANDARD_HOURS,
                MAX_STANDARD_HOURS
            )
        ) {
            throw new Error(
                "Standard working hours must be between 6 and 12."
            );
        }


        /* -------------------------------------------------
           VALIDATE OVERTIME HOURS
        ------------------------------------------------- */

        if (
            !validateRange(
                otHours,
                MIN_OT_HOURS,
                MAX_OT_HOURS
            )
        ) {
            throw new Error(
                "Please enter a valid overtime value."
            );
        }


        /* =================================================
           CALCULATIONS
        ================================================= */


        /* -------------------------------------------------
           DAILY SALARY
        ------------------------------------------------- */

        const dailySalary =
            salary / workingDays;


        /* -------------------------------------------------
           NORMAL HOURLY RATE
        ------------------------------------------------- */

        const hourlyRate =
            dailySalary / standardHours;


        /* -------------------------------------------------
           OT HOURLY RATE
        ------------------------------------------------- */

        const otHourlyRate =
            hourlyRate * otMultiplier;


        /* -------------------------------------------------
           OT EARNINGS
        ------------------------------------------------- */

        const otEarnings =
            otHourlyRate * otHours;


        /* -------------------------------------------------
           TOTAL EARNINGS
        ------------------------------------------------- */

        const totalEarnings =
            salary + otEarnings;


        /* =================================================
           FINAL CALCULATION SAFETY CHECK
        ================================================= */

        const results = [
            dailySalary,
            hourlyRate,
            otHourlyRate,
            otEarnings,
            totalEarnings
        ];

        if (
            results.some(
                value => !Number.isFinite(value)
            )
        ) {
            throw new Error(
                "Calculation resulted in an invalid value."
            );
        }


        /* =================================================
           DISPLAY RESULTS
        ================================================= */

        dailySalaryOutput.textContent =
            formatCurrency(dailySalary);

        hourlyRateOutput.textContent =
            formatCurrency(hourlyRate);

        otHourlyRateOutput.textContent =
            formatCurrency(otHourlyRate);

        otEarningsOutput.textContent =
            formatCurrency(otEarnings);

        totalEarningsOutput.textContent =
            formatCurrency(totalEarnings);

    } catch (error) {

        console.error(
            "Overtime calculation error:",
            error
        );

        showError(
            error instanceof Error
                ? error.message
                : "Unable to calculate overtime."
        );
    }
}


/* =========================================================
   CALCULATE BUTTON
========================================================= */

if (calculateBtn) {

    calculateBtn.addEventListener(
        "click",
        calculateOvertime
    );

} else {

    console.error(
        "Calculate button not found."
    );
}


/* =========================================================
   PREVENT INVALID KEYBOARD CHARACTERS
========================================================= */

function preventInvalidCharacters(event) {

    const blockedCharacters = [
        "e",
        "E",
        "+",
        "-"
    ];

    if (
        event.key &&
        blockedCharacters.includes(event.key)
    ) {
        event.preventDefault();
    }
}


/* =========================================================
   APPLY KEYBOARD VALIDATION
========================================================= */

[
    salaryInput,
    workingDaysInput,
    standardHoursInput,
    otHoursInput
].forEach(input => {

    if (input) {

        input.addEventListener(
            "keydown",
            preventInvalidCharacters
        );

    }

});


/* =========================================================
   INITIAL STATE
========================================================= */

resetResults();