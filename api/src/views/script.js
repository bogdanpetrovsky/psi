let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let getToTop = document.getElementById("back-to-top");
let emailButtons = document.querySelectorAll("span.contact-email");
let copyAlert = document.getElementById("copy-info-container");
let nextPageButton = document.getElementById("next-page");
let prevPageButton = document.getElementById("prev-page");

text.value = searchValue;
let page = parseInt(pageNumber || 1);

emailButtons.forEach(btn => btn.addEventListener("click", (event) => {
  console.log(btn.lastChild.nodeValue);
  const selBox = document.createElement('textarea');
  selBox.style.position = 'fixed';
  selBox.style.left = '0';
  selBox.style.top = '0';
  selBox.style.opacity = '0';
  selBox.value = btn.lastChild.nodeValue;
  document.body.appendChild(selBox);

  selBox.focus();
  selBox.select();
  document.execCommand('copy');
  document.body.removeChild(selBox);

  copyAlert.style.visibility = 'unset';
  setTimeout(() => copyAlert.style.visibility = 'hidden', 2500);
}));

getToTop.addEventListener("click", () => {
  window.scroll({ left: 0, top: 0 });
});

send.addEventListener("click", (e) => {
  search();
});

text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    search();
    text.value = "";
  }
});

nextPageButton.addEventListener("click", () => {
  search(page + 1);
});
prevPageButton.addEventListener("click", () => {
  search(page - 1);
});

function search(page) {
  window.location.href = `/name:${text.value},page:${page || 1}`;
}
