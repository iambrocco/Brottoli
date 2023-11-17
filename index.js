let moveArr = document.getElementsByClassName("move");
let widgetsElem = document.getElementsByClassName("widget");
let parentWidgetsElem = document.getElementsByClassName("widgets")[0];
let currentIndex = 2;
let autoscroll = true;

moveArr.item(0).onclick = () => {
  autoscroll = false;
  handleMove(-1);
};

moveArr.item(1).onclick = () => {
  autoscroll = false;
  handleMove(1);
};

function handleMove(direction) {
  widgetsElem.item(currentIndex).classList.remove("main");
  currentIndex =
    (currentIndex + direction + widgetsElem.length) % widgetsElem.length;
  widgetsElem.item(currentIndex).classList.add("main");

  setTimeout(() => {
    autoscroll = true;
  }, 3000);
}

setInterval(() => {
  if (autoscroll) {
    handleMove(1);
  }
}, 2500);
