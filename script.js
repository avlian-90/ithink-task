const generateBtn = document.getElementById("generate-btn");
const quoteText = document.getElementById("quote-text");
const quoteAuthor = document.getElementById("quote-author");
const shareBtn = document.getElementById("share-btn");
const notificationBTn = document.getElementById("notification-btn");
const quoteForm = document.getElementById("quote-form");
const categoryCheckboxes = document.querySelectorAll("input[type=checkbox]");
const languageSelect = document.getElementById("language");

let shownQuotes = new Set();
let userCategories = JSON.parse(localStorage.getItem("categories")) || [];
let customQuotes = JSON.parse(localStorage.getItem("customQuotes")) || [];
let lastDisplayedQuote = null; 

languageSelect.addEventListener("change", async (e) => {
  const lang = e.target.value;
  const originalText = lastDisplayedQuote?.content || quoteText.textContent;

  if (lang !== "en") {
    const encodedURL = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(originalText)}&langpair=en|${lang}`;
    const proxyURL = `https://api.allorigins.win/get?url=${encodeURIComponent(encodedURL)}`;

    try {
      const res = await fetch(proxyURL);
      const data = await res.json();
      const parsed = JSON.parse(data.contents);
      quoteText.textContent = parsed.responseData.translatedText;
    } catch (err) {
      console.error("Translation failed:", err);
      quoteText.textContent = originalText; 
    }
  } else {
    quoteText.textContent = originalText;
  }
});

categoryCheckboxes.forEach(cb => {
  cb.checked = userCategories.includes(cb.value);
  cb.addEventListener("change", () => {
    userCategories = Array.from(document.querySelectorAll("input[type=checkbox]:checked")).map(cb => cb.value);
    localStorage.setItem("categories", JSON.stringify(userCategories));
  });
});

generateBtn.addEventListener("click", async () => {
  if (userCategories.length === 0) {
    alert("Please select at least one category.");
    return;
  }

  const category = userCategories[Math.floor(Math.random() * userCategories.length)];

  try {
    const res = await fetch(`http://api.quotable.io/random?tags=${category}`);
    const data = await res.json();

    const quoteKey = `${data.content}-${data.author}`;
    if (shownQuotes.has(quoteKey)) {
      generateBtn.click(); 
      return;
    }

    shownQuotes.add(quoteKey);

    quoteText.textContent = `"${data.content}"`;
    quoteAuthor.textContent = `– ${data.author}`;
  } catch (err) {
    quoteText.textContent = "Failed to fetch a quote. Try again.";
    quoteAuthor.textContent = "";
  }
});

shareBtn.addEventListener("click", () => {
  const text = `${quoteText.textContent} ${quoteAuthor.textContent}`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
});

notificationBTn.addEventListener("click", () => {
  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      setInterval(() => {
        fetchQuote();
        new Notification("Daily Quote", {
          body: `${quoteText.textContent} ${quoteAuthor.textContent}`
        });
      }, 86400000); // 24 hours
    }
  });
});

quoteForm.addEventListener("submit", e => {
  e.preventDefault();
  const text = document.getElementById("custom-quote").value.trim();
  const author = document.getElementById('custom-author').value.trim() || "Anonymous";
  
  if (text) {
    customQuotes.push({ content: text, author });
    localStorage.setItem("customQuotes", JSON.stringify(customQuotes));
    alert("Quote added!");
    e.target.reset();
  }
});

