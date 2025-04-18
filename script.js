// script.js

const menuButtons = document.querySelectorAll(".menu-button");
const formContainers = document.querySelectorAll(".form-container");
const resultFrame = document.getElementById("result-frame");
const videoPreview = document.getElementById("video-preview");

// Set active menu and show relevant form
menuButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetForm = button.getAttribute("data-target");

    // Toggle active button
    menuButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    // Show corresponding form
    formContainers.forEach((container) => {
      container.classList.remove("active");
    });
    document.getElementById(targetForm).classList.add("active");

    // Reset result area
    resultFrame.innerHTML = "<p>Đợi kết quả trả về...</p>";
  });
});

// Handle form submission
const allForms = document.querySelectorAll("form");
allForms.forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const channel = form.getAttribute("data-channel");
    const webhook = channel === "tiny"
      ? "https://hook.us2.make.com/your-tiny-channel-hook"
      : "https://hook.us2.make.com/your-adam-channel-hook";

    // Send data to MAKE Webhook
    await fetch(webhook, {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData)),
      headers: {
        "Content-Type": "application/json",
      },
    });

    resultFrame.innerHTML = "<p>Đang tạo video...</p>";

    // Poll result from Google Sheets via API (using Apps Script or Backend)
    pollForResult(formData.get("title"));
  });
});

// Polling logic
async function pollForResult(title) {
  const maxTries = 30;
  let attempts = 0;

  const interval = setInterval(async () => {
    attempts++;

    try {
      const res = await fetch(
        `https://your-backend-or-apps-script.com/get-video-link?title=${encodeURIComponent(
          title
        )}`
      );
      const data = await res.json();

      if (data.link) {
        clearInterval(interval);
        videoPreview.src = data.link;
        resultFrame.innerHTML = "<video controls autoplay src='" + data.link + "'></video>";
      } else if (attempts >= maxTries) {
        clearInterval(interval);
        resultFrame.innerHTML = "<p>Không tìm thấy kết quả sau thời gian chờ!</p>";
      }
    } catch (error) {
      console.error("Lỗi khi lấy kết quả:", error);
    }
  }, 5000);
}
