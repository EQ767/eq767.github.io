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
const initialApps = [
  { name: "所有功能", link: "https://eq767.github.io/all.html", img: "https://pic3.zhimg.com/v2-77569c657f821f099205db9d7784b8c2_r.jpg?source=1940ef5c" },
  { name: "爱奇艺", link: "https://www.iqiyi.com/", img: "https://tse1-mm.cn.bing.net/th/id/OIP-C.uVkpoZS2S1EXJHtyWRI07AAAAA" },
  { name: "腾讯视频", link: "https://v.qq.com/", img: "https://favicon.qqsuu.cn/https://v.qq.com/" },
  { name: "优酷视频", link: "https://www.youku.com/", img: "https://img.alicdn.com/imgextra/i2/O1CN01H566QS1ytLD8jtxZt_!!6000000006636-0-tps-200-200.jpg"},
  { name: "追剧影视", link: "https://zjuys.com/", img: "https://favicon.qqsuu.cn/https://zjuys.com/" },
  { name: "Bilibili", link: "https://www.bilibili.com/", img: "https://favicon.qqsuu.cn/https://www.bilibili.com/" },
  { name: "抖音", link: "https://www.douyin.com/?is_from_mobile_home=1&recommend=1", img: "https://favicon.qqsuu.cn/https://www.douyin.com/" },
  { name: "快手", link: "https://kuaishou.cn/?isHome=1", img: "https://favicon.qqsuu.cn/https://kuaishou.cn/" },
  { name: "网易云音乐", link: "https://music.163.com/", img: "https://favicon.qqsuu.cn/https://music.163.com/" },
  { name: "QQ音乐", link: "https://y.qq.com/", img: "https://tse4-mm.cn.bing.net/th/id/OIP-C.aEaXBKK-yY0RIZ5jh1I4rgHaHa" },
  { name: "漫画站", link: "https://www.manhuazhan.com/", img: "https://favicon.qqsuu.cn/https://www.manhuazhan.com/" },
  { name: "笔趣阁", link: "https://www.bqg128.com/", img: "https://favicon.qqsuu.cn/https://www.bqg128.com/" },
  { name: "微博", link: "https://www.weibo.com/", img: "https://h5.sinaimg.cn/m/weibo-lite/img/pwalogo.417d1674.svg" },
  { name: "壁纸", link: "https://haowallpaper.com/", img: "https://favicon.qqsuu.cn/https://haowallpaper.com/" },
  { name: "GPT Free", link: "https://site.eqing.tech/", img: "https://tse2-mm.cn.bing.net/th/id/OIP-C.RPe0ThRMPmKnvybT7Z28JQHaHa?rs=1&pid=ImgDetMain" }
];

// 用于当前拖动排序的数据存储
let customApps = JSON.parse(localStorage.getItem("customApps")) || initialApps;

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
  // 添加“添加标签”按钮
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

  // 清除与该应用相关的缓存数据（如果有其他缓存，需在此处清理）
  // 例如，如果有存储特定于应用的数据，可以在此删除
  // 这里假设只有localStorage中的数据需要删除

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

// 新增：清除缓存功能
function clearCache() {
  if (confirm("确定清除缓存并重置所有设置吗？")) {
    localStorage.clear();
    location.reload();
  }
}

// 修改右键菜单：现在可以显示清除缓存选项
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
  // 添加“清除缓存”选项到全局右键菜单（如果还没有添加）
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

// 全局右键事件（如果在app-icon上未处理）
document.addEventListener("contextmenu", function(e) {
  if(e.target.closest(".app-icon")) return;
  e.preventDefault();
  showContextMenu(e.pageX, e.pageY, [
    { text: "更换背景", action: changeBackground },
    { text: "添加标签", action: addTagFunc }
  ]);
});

// 底部按钮功能
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

// 添加标签功能点击事件（如果单独点击添加标签按钮）
document.getElementById("addTag")?.addEventListener("click", function(e) {
  e.preventDefault();
  addTagFunc();
});

// 搜索功能
function performSearch() {
  const query = document.getElementById("search").value.trim();
  if (query === "") {
    console.log("请输入搜索内容。");
    return;
  }
  if (searchModeInternal) {
    // 站内搜：过滤应用图标
    filterApps(query);
  } else {
    // 站外搜：跳转到 Bing 搜索结果页
    window.open('https://bing.com/search?q=' + encodeURIComponent(query), '_blank');
  }
}

function filterApps(query) {
  const lowerQuery = query.toLowerCase();
  const apps = document.querySelectorAll(".app-icon");
  apps.forEach(function(app) {
    const name = app.getAttribute("data-name").toLowerCase();
    if (app.getAttribute("data-name") === "添加标签") {
      app.style.display = "flex"; // 始终显示“添加标签”按钮
      return;
    }
    if (name.indexOf(lowerQuery) === -1) {
      app.style.display = "none";
    } else {
      app.style.display = "flex";
    }
  });
}

// 切换搜索模式
function toggleSearchMode() {
  searchModeInternal = !searchModeInternal;
  searchModeToggle.textContent = searchModeInternal ? "站内搜" : "站外搜";
  // 清空搜索框并重置显示
  document.getElementById("search").value = "";
  const apps = document.querySelectorAll(".app-icon");
  apps.forEach(function(app) {
    app.style.display = "flex";
  });
}

// 新增：处理输入框键盘事件（例如按下 Enter 键时执行搜索）
function handleSearch(event) {
  if (event.key === "Enter") {
    performSearch();
  }
}

// 叶子图标点击切换极简模式
document.getElementById("leaf-icon").addEventListener("click", function(event) {
  event.stopPropagation(); // 防止事件冒泡
  minimalist = !minimalist;
  if (minimalist) {
    document.body.classList.add("minimalist-mode");
    fetchDailyQuote();
  } else {
    document.body.classList.remove("minimalist-mode");
  }
});

// 在极简模式下，点击任意键或点击空白处退出极简模式
function exitMinimalistMode() {
  if (minimalist) {
    minimalist = false;
    document.body.classList.remove("minimalist-mode");
  }
}

// 监听键盘按键
document.addEventListener("keydown", function(event) {
  exitMinimalistMode();
});

// 监听空白处点击
document.addEventListener("click", function(event) {
  const leafIcon = document.getElementById("leaf-icon");
  if (!leafIcon.contains(event.target)) {
    exitMinimalistMode();
  }
});

// 动态更新时间与日期
function updateTime() {
  const timeElement = document.getElementById("time");
  const dateElement = document.getElementById("date");
  const now = new Date();
  timeElement.textContent = now.toLocaleTimeString();
  dateElement.textContent = now.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', weekday: 'short' });
}

// 获取每日一言
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

// 每秒更新时间
setInterval(updateTime, 1000);
updateTime();
loadApps();

// 新增：绑定新添加的“切换桌面风格”按钮点击事件
document.getElementById("desktop-toggle").addEventListener("click", toggleDesktopStyle);

// 切换桌面风格函数（原有实现保持不变）
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

