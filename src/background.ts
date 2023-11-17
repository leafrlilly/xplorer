// storage to use
const storage = chrome.storage.sync;

// listen for theme and member messages from the web page
chrome.runtime.onMessage.addListener((message) => {
  console.log('is Dark theme ', message.type, message.isDark);
  if (!(message && message.type)) return;
  if (message.type == 'theme') {
    const theme = {
      isDark: message.isDark,
    };
    storage.set({ theme }, function() {
      console.log("theme stored successfully.");
    });
  }
  if (message.type == 'member') {
    console.log('got member message', message);
    const member = {
      handle: message.handle,
      name: message.name
    };
    storage.get(["members"], function(result) {
      const memList = result['members'] || [];
      console.log("Member list retrieved successfully:", memList);
      const exist = Array.from(memList).find((m:any) => m.handle === member.handle);
      if (!exist) {
        const updatedMemList = [...memList, member];
        storage.set({ members: updatedMemList }, function() {
          console.log("Updated mem list stored successfully.");
        });
      }
    });
  }
});
