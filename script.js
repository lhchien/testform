// ========================
// Element References
// ========================
const menuButtons = document.querySelectorAll(".menu button");
const forms = document.querySelectorAll(".form-wrapper");
const videoFrame = document.getElementById("video-frame");
const videoStatus = document.getElementById("video-status");

// ========================
// State
// ========================
let activeForm = "tiny";

// ========================
// Menu Switching
// ========================
menuButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Toggle active button
    menuButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // Show relevant form
    const target = btn.getAttribute("data-form");
    activeForm = target;
    forms.forEach((form) => {
      if (form.id === `${target}-form`) {
        form.style.display = "block";
      } else {
        form.style.display = "none";
      }
    });
  });
});

// ========================
// Submit Handler
// ========================
function handleSubmit(event, webhookUrl) {
  event.preventDefault();

  const form = event.target;
  const story = form.querySelector("textarea[name='story']").value;
  const character = form.querySelector("input[name='character']").value;
  const style = form.querySelector("input[name='style']").value;
  const length = form.querySelector("input[name='length']").value;

  const data = {
    story,
    character,
    style,
    length,
  };

  videoStatus.textContent = "Đang xử lý...";
  videoFrame.innerHTML = "";

  fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then(() => pollForResult(data.story))
    .catch(() => {
      videoStatus.textContent = "Đã xảy ra lỗi khi gửi dữ liệu.";
    });
}

// ========================
// Polling Google Sheet (Giả lập)
// ========================
function pollForResult(storyKey) {
  const sheetApiUrl = "https://script.google.com/macros/s/AKfycbw.../exec?key=" + encodeURIComponent(storyKey);

  let attempts = 0;
  const maxAttempts = 20;
  const interval = setInterval(() => {
    fetch(sheetApiUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data.videoUrl) {
          clearInterval(interval);
          videoStatus.textContent = "Video đã sẵn sàng!";
          videoFrame.innerHTML = `<video src="${data.videoUrl}" controls></video>`;
        }
      });

    attempts++;
    if (attempts >= maxAttempts) {
      clearInterval(interval);
      videoStatus.textContent = "Hết thời gian chờ video.";
    }
  }, 3000);
}

// ========================
// Gán sự kiện cho các form
// ========================
document.getElementById("tiny-form").addEventListener("submit", (e) => {
  handleSubmit(e, "https://hook.us1.make.com/tiny-channel-hidden-url");
});

document.getElementById("adam-form").addEventListener("submit", (e) => {
  handleSubmit(e, "https://hook.us1.make.com/adam-channel-hidden-url");
});
