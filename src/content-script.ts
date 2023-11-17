// Script that runs on the site
// attempt 4 times on user profile to get username. sometimes its not ready
let leafrAttempt = 0;
// No need to check for usernames on these paths
const ignorePaths = ['home', 'notifications', 'explore', 'messages', 'settings'];
window.addEventListener("load", () => {
  console.log("Page has finished loading!");
  // start looking for changes to location
  watchLocation();
  // fetch theme based doc background color
  fetchTheme();
  // look for username
  checkForUsername( document.location.pathname);
});

function checkForUsername(docPath: String) {
  console.log('docPath ', docPath);
  if (docPath) {
    const path = docPath.substring(1);
    console.log('path ', path);
    if (path && path.length > 0) {
      // check if it doesn't contain a subpath
      if (!(path.indexOf("/") >= 0)) {
        // check if it's not x related paths
        if (!ignorePaths.includes(path)) {
          console.log('fetching username on ', path);
          fetchUsername();
        }
      }
    }
  }
}

function watchLocation() {
  const observable = () => document.location.pathname;

  let oldValue = observable();
  const observer = new MutationObserver(() => {
    const newValue = observable();

    if (oldValue !== newValue) {
      console.log(`changed: ${oldValue} -> ${newValue}`);
      if (newValue) {
        checkForUsername(newValue);
        oldValue = newValue;
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function fetchUsername() {
  const timeLineElem = document.querySelector('div[aria-label ="Home timeline"]');
  console.log('timeLineElem ', timeLineElem);
  if (timeLineElem) {
    const userElement = document.querySelector('div[data-testid="UserName"] div div') as HTMLElement;
    console.log('userElement ', userElement);
    if (userElement) {
      leafrAttempt = 0;
      userElement.addEventListener("dblclick", (event) => {
        // The element with the specified data-attribute value was found
        console.log("Element found:", userElement);
        let nameElem =  userElement.querySelector('div:nth-child(1)') as HTMLElement;
        let name = nameElem.querySelector('span') as HTMLElement;
        console.log('got userName = ', name.innerText);
        let handleElem =  userElement.querySelector('div:nth-child(2)') as HTMLElement;
        let handle = handleElem.querySelector('span') as HTMLElement;
        console.log('got handle = ', handle.innerText);
        chrome.runtime.sendMessage({ type: 'member', handle: handle.innerText, name: name.innerText});
      });
    } else {
      console.log("Element not found.");
      if (leafrAttempt < 4) {
        setTimeout(fetchUsername, 500);
        leafrAttempt ++;
      }
    }
  }
}

function fetchTheme() {
  const bodyElem = document.querySelector('body') as HTMLElement;
  console.log('body color= ' + (bodyElem.style.backgroundColor == 'rgb(255, 255, 255)'));
  let isLight = (bodyElem.style.backgroundColor == 'rgb(255, 255, 255)');
  chrome.runtime.sendMessage({ type: 'theme', isDark: !isLight});
}
