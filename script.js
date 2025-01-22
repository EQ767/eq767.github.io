let minimalist = false;
let searchModeInternal = true;
const appContainer = document.getElementById("app-container");
const searchModeToggle = document.getElementById("searchModeToggle");
const dailyQuoteElement = document.getElementById("dailyQuote");

// 获取右键菜单元素
const contextMenu = document.getElementById("customContextMenu");

// 获取已删除的标签
const deletedApps = JSON.parse(localStorage.getItem("deletedApps")) || [];

// 初始化应用列表
let initialApps = [];
let customApps = [];

// 从so.json加载应用列表
fetch('so.json')
  .then(response => response.json())
  .then(data => {
    initialApps = data.map(app => ({
      name: app.name,
      link: app.link,
      img: app.img
    }));

    // 初始化customApps
    customApps = JSON.parse(localStorage.getItem("customApps")) || initialApps;

    // 加载应用列表
    loadApps();
  })
  .catch(error => {
    console.error('Error loading so.json:', error);
    // 如果加载失败，使用空数组
    initialApps = [];
    customApps = JSON.parse(localStorage.getItem("customApps")) || initialApps;
    loadApps();
  });

// 加载应用列表，排除已删除的应用
function loadApps() {
  appContainer.innerHTML = ''; // 清空现有应用
  customApps.forEach((app, index) => {
    if (!deletedApps.includes(app.name)) {
      const appElement = document.createElement("a");
      appElement.href = app.link;
      appElement.className = "app-icon";
      appElement.setAttribute("data-name", app.name);
      appElement.setAttribute("draggable", "true");
      appElement.setAttribute("data-index", index);
      appElement.target = "_blank";
      appElement.innerHTML = `<img src="${app.img}" alt="${app.name}">${app.name}`;

      // 拖动事件
      appElement.addEventListener("dragstart", dragStart);
      appElement.addEventListener("dragover", dragOver);
      appElement.addEventListener("drop", drop);
      appElement.addEventListener("dragend", dragEnd);

      // 添加右键删除功能
      appElement.addEventListener("contextmenu", function(e) {
        e.preventDefault();
        showContextMenu(e.pageX, e.pageY, [
          { text: "删除标签", action: () => deleteApp(app.name) }
        ]);
      });
      appContainer.appendChild(appElement);
    }
  });
  // 添加"添加标签"按钮
  const addTag = document.createElement("a");
  addTag.href = "#";
  addTag.className = "app-icon";
  addTag.setAttribute("data-name", "添加标签");
  addTag.id = "addTag";
  addTag.innerHTML = `<i class="fas fa-plus"></i><span>添加标签</span>`;
  // 添加右键菜单给添加标签按钮
  addTag.addEventListener("contextmenu", function(e) {
    e.preventDefault();
    showContextMenu(e.pageX, e.pageY, [
      { text: "更换背景", action: changeBackground },
      { text: "添加标签", action: addTagFunc }
    ]);
  });
  // 点击添加标签按钮
  addTag.addEventListener("click", function(e) {
    e.preventDefault();
    addTagFunc();
  });
  appContainer.appendChild(addTag);
}

function dragStart(e) {
  e.currentTarget.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", e.currentTarget.getAttribute("data-index"));
}

function dragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

function drop(e) {
  e.preventDefault();
  const fromIndex = e.dataTransfer.getData("text/plain");
  const toIndex = e.currentTarget.getAttribute("data-index");
  if (fromIndex === null || toIndex === null) return;
  // 交换数组中的位置
  [customApps[fromIndex], customApps[toIndex]] = [customApps[toIndex], customApps[fromIndex]];
  localStorage.setItem("customApps", JSON.stringify(customApps));
  loadApps();
}

function dragEnd(e) {
  e.currentTarget.classList.remove("dragging");
}

function deleteApp(appName) {
  // 从已删除列表中添加
  deletedApps.push(appName);
  localStorage.setItem("deletedApps", JSON.stringify(deletedApps));

  // 从自定义应用中移除
  customApps = customApps.filter(app => app.name !== appName);
  localStorage.setItem("customApps", JSON.stringify(customApps));

  loadApps();
  hideContextMenu();
  alert(`已删除标签：${appName}`);
}

function addTagFunc() {
  const tabName = prompt("请输入新标签的名称：");
  if (tabName) {
    // 检查是否已经存在
    const exists = customApps.some(app => app.name === tabName) || tabName === "添加标签";
    if (exists) {
      alert("标签名称已存在，请选择其他名称。");
      return;
    }
    const tabLink = prompt("请输入新标签的链接地址（可选）：");
    const newApp = {
      name: tabName,
      link: tabLink ? tabLink : "#",
      img: "https://tse2-mm.cn.bing.net/th/id/OIP-C.s3FHxaLA7w4d0H2pDsdH4gHaHa" // 默认图标
    };
    customApps.push(newApp);
    localStorage.setItem("customApps", JSON.stringify(customApps));
    loadApps();
  }
}

function changeBackground() {
  const colors = ["#ff0050", "#f9f059", "#00c14e", "#00b7ff", "#000000", "#ff7f50", "#6a5acd", "#ffa500"];
  const color1 = colors[Math.floor(Math.random() * colors.length)];
  const color2 = colors[Math.floor(Math.random() * colors.length)];
  document.body.style.backgroundImage = `linear-gradient(to bottom right, ${color1}, ${color2})`;
}

function clearCache() {
  if (confirm("确定清除缓存并重置所有设置吗？")) {
    localStorage.clear();
    location.reload();
  }
}

function showContextMenu(x, y, options) {
  contextMenu.innerHTML = '';
  options.forEach(option => {
    const div = document.createElement("div");
    div.textContent = option.text;
    div.onclick = () => {
      option.action();
      hideContextMenu();
    };
    contextMenu.appendChild(div);
  });
  if (!options.some(opt => opt.text === "清除缓存")) {
    const clearCacheOption = document.createElement("div");
    clearCacheOption.textContent = "清除缓存";
    clearCacheOption.onclick = clearCache;
    contextMenu.appendChild(clearCacheOption);
  }
  contextMenu.style.left = x + 'px';
  contextMenu.style.top = y + 'px';
  contextMenu.style.display = 'block';
}

function hideContextMenu() {
  contextMenu.style.display = 'none';
}

document.addEventListener("click", function() {
  hideContextMenu();
});

document.addEventListener("contextmenu", function(e) {
  if(e.target.closest(".app-icon")) return;
  e.preventDefault();
  showContextMenu(e.pageX, e.pageY, [
    { text: "更换背景", action: changeBackground },
    { text: "添加标签", action: addTagFunc }
  ]);
});

document.getElementById("createTab").addEventListener("click", function() {
  addTagFunc();
});

document.getElementById("changeWallpaper").addEventListener("click", function() {
  changeBackground();
});

document.getElementById("deleteTab").addEventListener("click", function() {
  const availableApps = customApps.filter(app => !deletedApps.includes(app.name));
  if (availableApps.length === 0) {
    alert("没有可删除的标签。");
    return;
  }
  const appNames = availableApps.map(app => app.name).join("\n");
  const tabToDelete = prompt("请输入要删除的标签名称：\n" + appNames);
  if (tabToDelete) {
    const appExists = availableApps.some(app => app.name === tabToDelete);
    if (appExists) {
      deleteApp(tabToDelete);
    } else {
      alert("未找到指定的标签名称。");
    }
  }
});

document.getElementById("addTag")?.addEventListener("click", function(e) {
  e.preventDefault();
  addTagFunc();
});

function performSearch() {
  const query = document.getElementById("search").value.trim();
  if (query === "") {
    console.log("请输入搜索内容。");
    return;
  }
  if (searchModeInternal) {
    filterApps(query);
  } else {
    window.open('https://bing.com/search?q=' + encodeURIComponent(query), '_blank');
  }
}

function filterApps(query) {
  const lowerQuery = query.toLowerCase();
  const apps = document.querySelectorAll(".app-icon");
  apps.forEach(function(app) {
    const name = app.getAttribute("data-name").toLowerCase();
    if (app.getAttribute("data-name") === "添加标签") {
      app.style.display = "flex";
      return;
    }
    if (name.indexOf(lowerQuery) === -1) {
      app.style.display = "none";
    } else {
      app.style.display = "flex";
    }
  });
}

function toggleSearchMode() {
  searchModeInternal = !searchModeInternal;
  searchModeToggle.textContent = searchModeInternal ? "站内搜" : "站外搜";
  document.getElementById("search").value = "";
  const apps = document.querySelectorAll(".app-icon");
  apps.forEach(function(app) {
    app.style.display = "flex";
  });
}

function handleSearch(event) {
  if (event.key === "Enter") {
    performSearch();
  }
}

document.getElementById("leaf-icon").addEventListener("click", function(event) {
  event.stopPropagation();
  minimalist = !minimalist;
  if (minimalist) {
    document.body.classList.add("minimalist-mode");
    fetchDailyQuote();
  } else {
    document.body.classList.remove("minimalist-mode");
  }
});

function exitMinimalistMode() {
  if (minimalist) {
    minimalist = false;
    document.body.classList.remove("minimalist-mode");
  }
}

document.addEventListener("keydown", function(event) {
  exitMinimalistMode();
});

document.addEventListener("click", function(event) {
  const leafIcon = document.getElementById("leaf-icon");
  if (!leafIcon.contains(event.target)) {
    exitMinimalistMode();
  }
});

function updateTime() {
  const timeElement = document.getElementById("time");
  const dateElement = document.getElementById("date");
  const now = new Date();
  timeElement.textContent = now.toLocaleTimeString();
  dateElement.textContent = now.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', weekday: 'short' });
}

function fetchDailyQuote() {
  fetch('https://v1.hitokoto.cn/')
    .then(response => response.json())
    .then(data => {
      dailyQuoteElement.innerHTML = `"${data.hitokoto}"<br/>— ${data.from}${data.from_who ? ' · ' + data.from_who : ''}<br/>创作者: ${data.creator}`;
    })
    .catch(err => {
      dailyQuoteElement.textContent = "无法获取每日一言";
    });
}

setInterval(updateTime, 1000);
updateTime();

document.getElementById("desktop-toggle").addEventListener("click", toggleDesktopStyle);

function toggleDesktopStyle() {
  document.body.classList.toggle('desktop-style');
  appContainer.classList.toggle('desktop-style');
  const appIcons = document.querySelectorAll('.app-icon');
  appIcons.forEach(icon => icon.classList.toggle('desktop-style'));
  document.querySelector('.top-bar').classList.toggle('desktop-style');
  document.querySelector('.bottom-bar').classList.toggle('desktop-style');
  document.querySelector('.search-bar').classList.toggle('desktop-style');
  document.querySelector('.footer-links').classList.toggle('desktop-style');
}
