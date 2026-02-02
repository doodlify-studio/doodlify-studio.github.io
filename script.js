console.log("script loaded");

/* ======================
   PRICES
====================== */

const PRICES = {
  model: {
    "12_coloured": 34.99,
    "12_white": 29.99,
    "16_coloured": 49.99,
    "16_white": 44.99,
    "20_coloured": 64.99,
    "20_white": 59.99
  },
  keychain: 9.99,
  led: 12.0
};

const SIZE_LABELS = {
  "12": { cm: "12 cm", inch: '4.7"' },
  "16": { cm: "16 cm", inch: '6.3"' },
  "20": { cm: "20 cm", inch: '7.9"' }
};

/* ======================
   STATE
====================== */

let orderType = "model"; // model | keychain
let selectedModel = null;
let keychainSelected = false;
let ledSelected = false;
let drawingUploaded = false;

/* ======================
   ELEMENTS
====================== */

const startBtn = document.getElementById("startBtn");
const landing = document.getElementById("landing");
const createFlow = document.getElementById("createFlow");
const continueBtn = document.getElementById("continueBtn");
const totalPriceEl = document.getElementById("totalPrice");

const uploadInput = document.getElementById("drawingUpload");
const previewWrapper = document.getElementById("previewWrapper");
const previewImg = document.getElementById("drawingPreview");

/* Order summary */
const orderSummary = document.getElementById("orderSummary");
const summaryProduct = document.getElementById("summaryProduct");
const summaryExtras = document.getElementById("summaryExtras");
const summaryTotal = document.getElementById("summaryTotal");
const summaryImage = document.getElementById("summaryImage");
const summaryKeychainImage = document.getElementById("summaryKeychainImage");

const approveCheckbox = document.getElementById("approveCheckbox");
const customerEmail = document.getElementById("customerEmail");
const submitOrderBtn = document.getElementById("submitOrderBtn");
const backToEditBtn = document.getElementById("backToEditBtn");

/* ======================
   LANDING
====================== */

startBtn.addEventListener("click", () => {
  landing.classList.add("hidden");
  createFlow.classList.remove("hidden");
});

/* ======================
   UPLOAD
====================== */

uploadInput.addEventListener("change", () => {
  const file = uploadInput.files[0];

  if (!file) {
    drawingUploaded = false;
    previewWrapper.classList.add("hidden");
    updateContinueState();
    return;
  }

  drawingUploaded = true;

  const reader = new FileReader();
  reader.onload = e => {
    previewImg.src = e.target.result;
    previewWrapper.classList.remove("hidden");
  };
  reader.readAsDataURL(file);

  updateContinueState();
});

/* ======================
   PRODUCT SELECTION
====================== */

document.querySelectorAll("input[name='orderType']").forEach(radio => {
  radio.addEventListener("change", () => {
    orderType = radio.value;
    calculateTotal();
  });
});

document.querySelectorAll("input[name='model']").forEach(radio => {
  radio.addEventListener("change", () => {
    selectedModel = radio.value;
    calculateTotal();
  });
});

document.getElementById("keychainCheckbox").addEventListener("change", e => {
  keychainSelected = e.target.checked;
  calculateTotal();
});

document.getElementById("ledCheckbox").addEventListener("change", e => {
  ledSelected = e.target.checked;
  calculateTotal();
});

/* ======================
   PRICE LOGIC
====================== */

function calculateTotal() {
  let total = 0;

  if (orderType === "model" && selectedModel) {
    total += PRICES.model[selectedModel];
  }

  if (orderType === "keychain") {
    total += PRICES.keychain;
  }

  if (keychainSelected) total += PRICES.keychain;
  if (ledSelected) total += PRICES.led;

  // Bundle discount: model + keychain
  if (orderType === "model" && keychainSelected) {
    total *= 0.95;
    document.getElementById("bundleNote").classList.remove("hidden");
  } else {
    document.getElementById("bundleNote").classList.add("hidden");
  }

  totalPriceEl.textContent = total.toFixed(2);
  updateContinueState();
}

function updateContinueState() {
  continueBtn.disabled = !(drawingUploaded && (selectedModel || orderType === "keychain"));
}

/* ======================
   CONTINUE → SUMMARY
====================== */

continueBtn.addEventListener("click", () => {

  if (orderType === "model" && !selectedModel) {
    alert("Please select a 3D model");
    return;
  }

  createFlow.classList.add("hidden");
  orderSummary.classList.remove("hidden");

  // Product text + image
  if (orderType === "keychain" && !selectedModel) {
    summaryProduct.textContent = "Keychain only";
    summaryImage.src = "images/keychain.jpg";
    summaryKeychainImage.classList.add("hidden");
  } else {
    const [size, finish] = selectedModel.split("_");
    const label = SIZE_LABELS[size];

    summaryProduct.textContent =
      `3D model – ${label.cm} (${label.inch}) – ${finish}`;

    summaryImage.src =
      finish === "white"
        ? "images/white-3d.jpg"
        : "images/coloured-3d.jpg";

    if (keychainSelected) {
      summaryKeychainImage.src = "images/keychain.jpg";
      summaryKeychainImage.classList.remove("hidden");
    } else {
      summaryKeychainImage.classList.add("hidden");
    }
  }

  // Extras
  let extras = [];
  if (keychainSelected) extras.push("Keychain");
  if (ledSelected) extras.push("LED stand");
  summaryExtras.textContent = extras.length ? extras.join(", ") : "None";

  summaryTotal.textContent = totalPriceEl.textContent;
});

/* ======================
   BACK TO EDIT
====================== */

backToEditBtn.addEventListener("click", () => {
  orderSummary.classList.add("hidden");
  createFlow.classList.remove("hidden");
});

/* ======================
   SUBMIT VALIDATION
====================== */

function validateSubmit() {
  submitOrderBtn.disabled = !(
    approveCheckbox.checked &&
    customerEmail.value.trim() !== ""
  );
}

approveCheckbox.addEventListener("change", validateSubmit);
customerEmail.addEventListener("input", validateSubmit);

const formProduct = document.getElementById("formProduct");
const formExtras = document.getElementById("formExtras");
const formTotal = document.getElementById("formTotal");

submitOrderBtn.addEventListener("click", () => {
  formProduct.value = summaryProduct.textContent;
  formExtras.value = summaryExtras.textContent;
  formTotal.value = "£" + summaryTotal.textContent;
});

