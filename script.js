/* =====================================================
   観劇記録アプリ（改造版）
   - 作品削除機能追加
   - 作品名・公演名 → 画像自動設定
   - 選択時・登録時に画像モーション
===================================================== */


/* =====================================================
   画像マッピング
===================================================== */

function getWorkImage(name) {
  if (name === "テニスの王子様") return "images/tennis.png";
  return "";
}

function getPerformanceImage(name) {
  if (name === "全国立海公演") return "images/rikkai.png";
  return "";
}


/* =====================================================
   データ
===================================================== */

let works =
  JSON.parse(
    localStorage.getItem("theaterWorks") || "[]"
  );

let performances =
  JSON.parse(
    localStorage.getItem("theaterPerformances") || "[]"
  );

let theaters =
  JSON.parse(
    localStorage.getItem("theaterTheaters") || "[]"
  );

let records =
  JSON.parse(
    localStorage.getItem("theaterRecords") || "[]"
  );


/* =====================================================
   保存
===================================================== */

function saveData() {

  localStorage.setItem(
    "theaterWorks",
    JSON.stringify(works)
  );

  localStorage.setItem(
    "theaterPerformances",
    JSON.stringify(performances)
  );

  localStorage.setItem(
    "theaterTheaters",
    JSON.stringify(theaters)
  );

  localStorage.setItem(
    "theaterRecords",
    JSON.stringify(records)
  );

}


/* =====================================================
   ID作成
===================================================== */

function createId() {

  return (
    Date.now().toString() +
    Math.random()
      .toString(16)
      .slice(2)
  );

}


/* =====================================================
   画面
===================================================== */

const homeScreen =
  document.getElementById("homeScreen");

const addScreen =
  document.getElementById("addScreen");

const workScreen =
  document.getElementById("workScreen");

const performanceScreen =
  document.getElementById("performanceScreen");

const theaterScreen =
  document.getElementById("theaterScreen");

const detailScreen =
  document.getElementById("detailScreen");

const theaterDetailScreen =
  document.getElementById("theaterDetailScreen");

const recordDetailScreen =
  document.getElementById("recordDetailScreen");


/* =====================================================
   初期表示
===================================================== */

renderHome();


/* =====================================================
   ホーム表示
===================================================== */

function renderHome() {

  document.getElementById(
    "workCount"
  ).textContent =
    works.length;

  document.getElementById(
    "recordCount"
  ).textContent =
    records.length;

  const totalPrice =
    records.reduce(
      (sum, record) => {
        return (
          sum +
          Number(record.price || 0)
        );
      },
      0
    );

  document.getElementById(
    "totalPrice"
  ).textContent =
    "¥" +
    totalPrice.toLocaleString();

  renderWorkList();
  renderTheaterList();
  renderRecentRecords();

}
/* =====================================================
   作品一覧
===================================================== */

function renderWorkList() {

  const container =
    document.getElementById("workList");

  container.innerHTML = "";

  if (works.length === 0) {
    container.innerHTML = `
      <div class="empty">
        まだ作品が登録されていません
      </div>
    `;
    return;
  }

  works.forEach(work => {

    const workRecords =
      records.filter(record => record.workId === work.id);

    const totalPrice =
      workRecords.reduce(
        (sum, record) => sum + Number(record.price || 0),
        0
      );

    const card = document.createElement("div");
    card.className = "work-card";

    const imageHTML =
      work.image
        ? `
            <img
              class="work-image"
              src="${escapeHTML(work.image)}"
              alt=""
            >
          `
        : `
            <div class="work-image"></div>
          `;

    card.innerHTML = `
      ${imageHTML}

      <div class="work-info">

        <div class="work-name">
          ${escapeHTML(work.name)}
        </div>

        <div class="work-meta">
          ${workRecords.length}回 ／ ¥${totalPrice.toLocaleString()}
        </div>

      </div>

      <div class="work-arrow">›</div>
    `;

    card.addEventListener("click", () => {
      openWorkDetail(work.id);
    });

    container.appendChild(card);

  });

}


/* =====================================================
   劇場一覧
===================================================== */

function renderTheaterList() {

  const container =
    document.getElementById("theaterList");

  container.innerHTML = "";

  if (theaters.length === 0) {
    container.innerHTML = `
      <div class="empty">
        まだ劇場が登録されていません
      </div>
    `;
    return;
  }

  theaters.forEach(theater => {

    const theaterRecords =
      records.filter(record => record.theaterId === theater.id);

    const card = document.createElement("div");
    card.className = "theater-card";

    card.innerHTML = `
      <div class="theater-info">

        <div class="theater-name">
          ${escapeHTML(theater.name)}
        </div>

        <div class="theater-meta">
          ${theaterRecords.length}回
        </div>

      </div>

      <div class="theater-arrow">›</div>
    `;

    card.addEventListener("click", () => {
      openTheaterDetail(theater.id);
    });

    container.appendChild(card);

  });

}


/* =====================================================
   最近の観劇
===================================================== */

function renderRecentRecords() {

  const container =
    document.getElementById("recentList");

  container.innerHTML = "";

  if (records.length === 0) {
    container.innerHTML = `
      <div class="empty">
        まだ観劇記録がありません
      </div>
    `;
    return;
  }

  const sortedRecords =
    [...records]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

  sortedRecords.forEach(record => {

    const work =
      works.find(work => work.id === record.workId);

    const performance =
      performances.find(p => p.id === record.performanceId);

    const theater =
      theaters.find(t => t.id === record.theaterId);

    const card = document.createElement("div");
    card.className = "recent-card";

    card.innerHTML = `
      <div class="recent-title">
        ${escapeHTML(work?.name || "作品不明")}
      </div>

      <div class="recent-info">
        ${escapeHTML(performance?.name || "公演不明")}
        ／
        ${escapeHTML(record.date || "")}
        ${theater ? "／ " + escapeHTML(theater.name) : ""}
      </div>
    `;

    card.addEventListener("click", () => {
      openRecordDetail(record.id);
    });

    container.appendChild(card);

  });

}


/* =====================================================
   観劇記録画面
===================================================== */

document.getElementById("addButton").addEventListener("click", () => {
  openRecordScreen();
});


function openRecordScreen(record = null) {

  hideAllScreens();
  addScreen.style.display = "block";

  document.getElementById("recordForm").reset();
  document.getElementById("editingRecordId").value = "";

  populateWorkSelect();
  populateTheaterSelect();

  if (!record) {
    document.getElementById("recordScreenTitle").textContent = "観劇を記録";
    return;
  }

  document.getElementById("recordScreenTitle").textContent = "観劇記録を編集";

  document.getElementById("editingRecordId").value = record.id;

  document.getElementById("recordWork").value = record.workId;
  populatePerformanceSelect(record.workId);

  document.getElementById("recordPerformance").value = record.performanceId;
  document.getElementById("recordDate").value = record.date || "";
  document.getElementById("recordTheater").value = record.theaterId || "";
  document.getElementById("recordSeat").value = record.seat || "";
  document.getElementById("recordSeatRating").value = record.seatRating || "";
  document.getElementById("recordSeatImpression").value = record.seatImpression || "";
  document.getElementById("recordPrice").value = record.price || "";
  document.getElementById("recordImpression").value = record.impression || "";

}
/* =====================================================
   戻る
===================================================== */

document.getElementById("backButton").addEventListener("click", () => {
  hideAllScreens();
  homeScreen.style.display = "block";
  renderHome();
});


/* =====================================================
   作品セレクト
===================================================== */

function populateWorkSelect() {

  const select = document.getElementById("recordWork");

  select.innerHTML = `
    <option value="">
      作品を選択
    </option>
  `;

  works.forEach(work => {
    const option = document.createElement("option");
    option.value = work.id;
    option.textContent = work.name;
    select.appendChild(option);
  });

}


/* =====================================================
   公演セレクト
===================================================== */

function populatePerformanceSelect(workId) {

  const select = document.getElementById("recordPerformance");

  select.innerHTML = `
    <option value="">
      公演を選択
    </option>
  `;

  if (!workId) return;

  performances
    .filter(performance => performance.workId === workId)
    .forEach(performance => {
      const option = document.createElement("option");
      option.value = performance.id;
      option.textContent = performance.name;
      select.appendChild(option);
    });

}


/* =====================================================
   劇場セレクト
===================================================== */

function populateTheaterSelect() {

  const select = document.getElementById("recordTheater");

  select.innerHTML = `
    <option value="">
      劇場を選択
    </option>
  `;

  theaters.forEach(theater => {
    const option = document.createElement("option");
    option.value = theater.id;
    option.textContent = theater.name;
    select.appendChild(option);
  });

}


/* =====================================================
   作品選択変更（画像モーション対応）
===================================================== */

document.getElementById("recordWork").addEventListener("change", event => {

  const workId = event.target.value;

  populatePerformanceSelect(workId);

  const selectedWork = works.find(work => work.id === workId);

  if (selectedWork) {
    const imagePath = selectedWork.image || getWorkImage(selectedWork.name);
    if (imagePath) showImageEffect(imagePath);
  }

});


/* =====================================================
   公演選択変更（画像モーション対応）
===================================================== */

document.getElementById("recordPerformance").addEventListener("change", event => {

  const performanceId = event.target.value;

  const performance = performances.find(p => p.id === performanceId);

  if (performance) {
    const imagePath = performance.image || getPerformanceImage(performance.name);
    if (imagePath) showImageEffect(imagePath);
  }

});


/* =====================================================
   作品登録画面
===================================================== */

document.getElementById("openWorkButton").addEventListener("click", () => {
  openWorkScreen();
});

document.getElementById("recordNewWorkButton").addEventListener("click", () => {
  openWorkScreen();
});


function openWorkScreen() {
  document.getElementById("workForm").reset();
  workScreen.style.display = "block";
}


/* =====================================================
   作品登録画面を閉じる
===================================================== */

document.getElementById("closeWorkButton").addEventListener("click", () => {
  workScreen.style.display = "none";
});


/* =====================================================
   作品登録（画像自動設定＋モーション対応）
===================================================== */

document.getElementById("workForm").addEventListener("submit", event => {

  event.preventDefault();

  const name = document.getElementById("workName").value.trim();
  if (!name) return;

  const existing = works.find(work => work.name === name);
  if (existing) {
    alert("この作品はすでに登録されています。");
    return;
  }

  const newWork = {
    id: createId(),
    name: name,
    image: getWorkImage(name)
  };

  works.push(newWork);
  saveData();

  workScreen.style.display = "none";

  if (addScreen.style.display === "block") {
    populateWorkSelect();
    document.getElementById("recordWork").value = newWork.id;
    populatePerformanceSelect(newWork.id);
  }

  renderHome();

  if (newWork.image) {
    showImageEffect(newWork.image);
  }

});


/* =====================================================
   画像演出（既存のまま）
===================================================== */

function showImageEffect(imagePath) {

  const effect = document.getElementById("imageEffect");
  const image = document.getElementById("effectImage");

  image.src = imagePath;

  effect.classList.remove("show");

  void effect.offsetWidth;

  effect.classList.add("show");

  setTimeout(() => {
    effect.classList.remove("show");
  }, 1900);

}


/* =====================================================
   公演登録画面
===================================================== */

document.getElementById("recordNewPerformanceButton").addEventListener("click", () => {
  openPerformanceScreen();
});


function openPerformanceScreen() {

  const currentWork = document.getElementById("recordWork").value;

  const select = document.getElementById("performanceWork");

  select.innerHTML = `
    <option value="">
      作品を選択
    </option>
  `;

  works.forEach(work => {
    const option = document.createElement("option");
    option.value = work.id;
    option.textContent = work.name;
    select.appendChild(option);
  });

  if (currentWork) {
    select.value = currentWork;
  }

  document.getElementById("performanceName").value = "";

  performanceScreen.style.display = "block";

}


/* =====================================================
   公演登録画面を閉じる
===================================================== */

document.getElementById("closePerformanceButton").addEventListener("click", () => {
  performanceScreen.style.display = "none";
});


/* =====================================================
   公演登録（画像自動設定＋モーション対応）
===================================================== */

document.getElementById("performanceForm").addEventListener("submit", event => {

  event.preventDefault();

  const workId = document.getElementById("performanceWork").value;
  const name = document.getElementById("performanceName").value.trim();

  if (!workId || !name) return;

  const existing = performances.find(
    p => p.workId === workId && p.name === name
  );

  if (existing) {
    alert("この公演はすでに登録されています。");
    return;
  }

  const newPerformance = {
    id: createId(),
    workId: workId,
    name: name,
    image: getPerformanceImage(name)
  };

  performances.push(newPerformance);
  saveData();

  performanceScreen.style.display = "none";

  if (addScreen.style.display === "block") {
    populateWorkSelect();
    document.getElementById("recordWork").value = workId;
    populatePerformanceSelect(workId);
    document.getElementById("recordPerformance").value = newPerformance.id;
  }

  if (newPerformance.image) {
    showImageEffect(newPerformance.image);
  }

});
/* =====================================================
   劇場登録画面
===================================================== */

document.getElementById("openTheaterButton").addEventListener("click", () => {
  openTheaterScreen();
});

document.getElementById("recordNewTheaterButton").addEventListener("click", () => {
  openTheaterScreen();
});


function openTheaterScreen() {
  document.getElementById("theaterForm").reset();
  theaterScreen.style.display = "block";
}


/* =====================================================
   劇場登録画面を閉じる
===================================================== */

document.getElementById("closeTheaterButton").addEventListener("click", () => {
  theaterScreen.style.display = "none";
});


/* =====================================================
   劇場登録
===================================================== */

document.getElementById("theaterForm").addEventListener("submit", event => {

  event.preventDefault();

  const name = document.getElementById("theaterName").value.trim();
  if (!name) return;

  const existing = theaters.find(theater => theater.name === name);
  if (existing) {
    alert("この劇場はすでに登録されています。");
    return;
  }

  const newTheater = {
    id: createId(),
    name: name
  };

  theaters.push(newTheater);
  saveData();

  theaterScreen.style.display = "none";

  if (addScreen.style.display === "block") {
    populateTheaterSelect();
    document.getElementById("recordTheater").value = newTheater.id;
  }

  renderHome();

});


/* =====================================================
   観劇記録保存
===================================================== */

document.getElementById("recordForm").addEventListener("submit", event => {

  event.preventDefault();

  const editingId = document.getElementById("editingRecordId").value;

  const recordData = {

    workId: document.getElementById("recordWork").value,
    performanceId: document.getElementById("recordPerformance").value,
    date: document.getElementById("recordDate").value,
    theaterId: document.getElementById("recordTheater").value,

    seat: document.getElementById("recordSeat").value.trim(),
    seatRating: document.getElementById("recordSeatRating").value,

    seatImpression: document.getElementById("recordSeatImpression").value,
    price: document.getElementById("recordPrice").value,

    impression: document.getElementById("recordImpression").value
  };

  if (editingId) {

    const index = records.findIndex(record => record.id === editingId);

    if (index !== -1) {
      records[index] = {
        ...records[index],
        ...recordData
      };
    }

  } else {

    records.push({
      id: createId(),
      ...recordData
    });

  }

  saveData();

  hideAllScreens();
  homeScreen.style.display = "block";
  renderHome();

});


/* =====================================================
   作品詳細（作品削除機能追加）
===================================================== */

function openWorkDetail(workId) {

  hideAllScreens();
  detailScreen.style.display = "block";

  const work = works.find(w => w.id === workId);
  if (!work) return;

  const workRecords = records.filter(r => r.workId === workId);

  const totalPrice =
    workRecords.reduce((sum, r) => sum + Number(r.price || 0), 0);

  const workPerformances =
    performances.filter(p => p.workId === workId);

  let html = `
    <div class="detail-header">

      ${
        work.image
          ? `<img class="detail-work-image" src="${escapeHTML(work.image)}" alt="">`
          : ""
      }

      <h2>${escapeHTML(work.name)}</h2>

      <div class="detail-summary">
        観劇回数：${workRecords.length}回<br>
        累計金額：¥${totalPrice.toLocaleString()}
      </div>

    </div>
  `;

  workPerformances.forEach(performance => {

    const performanceRecords =
      workRecords.filter(r => r.performanceId === performance.id);

    const performancePrice =
      performanceRecords.reduce((sum, r) => sum + Number(r.price || 0), 0);

html += `
  <div class="performance-block">

    <div class="performance-title" style="display:flex; align-items:center; gap:10px;">

      ${
        performance.image
          ? `<img src="${escapeHTML(performance.image)}" 
                 alt="" 
                 style="width:80px; height:80px; border-radius:12px; object-fit:cover;">`
          : ""
      }

      ${escapeHTML(performance.name)}

    </div>

    <div class="performance-summary">
      ${performanceRecords.length}回 ／ ¥${performancePrice.toLocaleString()}
    </div>
`;


    if (performanceRecords.length === 0) {
      html += `
        <div class="empty">
          まだ観劇記録がありません
        </div>
      `;
    }

    performanceRecords
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .forEach(record => {
        html += createRecordCardHTML(record);
      });

    html += `</div>`;

  });

  const unknownRecords =
    workRecords.filter(record => {
      return !workPerformances.some(p => p.id === record.performanceId);
    });

  if (unknownRecords.length > 0) {

    html += `
      <div class="performance-block">

        <div class="performance-title">その他</div>
    `;

    unknownRecords.forEach(record => {
      html += createRecordCardHTML(record);
    });

    html += `</div>`;
  }

  /* =====================================================
     作品削除ボタン追加
  ===================================================== */

  html += `
    <div class="record-actions">
      <button class="delete-button" id="workDeleteButton">
        作品を削除
      </button>
    </div>
  `;

  document.getElementById("detailContent").innerHTML = html;

  attachRecordCardEvents();

  const deleteButton = document.getElementById("workDeleteButton");

  if (deleteButton) {
    deleteButton.addEventListener("click", () => {

      const ok = confirm("この作品と紐づく公演・観劇記録をすべて削除しますか？");
      if (!ok) return;

      works = works.filter(w => w.id !== workId);

      const removedPerformanceIds =
        performances.filter(p => p.workId === workId).map(p => p.id);

      performances =
        performances.filter(p => p.workId !== workId);

      records =
        records.filter(r =>
          r.workId !== workId &&
          !removedPerformanceIds.includes(r.performanceId)
        );

      saveData();

      hideAllScreens();
      homeScreen.style.display = "block";
      renderHome();

    });
  }

}


/* =====================================================
   劇場詳細
===================================================== */

function openTheaterDetail(theaterId) {

  hideAllScreens();
  theaterDetailScreen.style.display = "block";

  const theater = theaters.find(t => t.id === theaterId);
  if (!theater) return;

  const theaterRecords =
    records
      .filter(r => r.theaterId === theaterId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalPrice =
    theaterRecords.reduce((sum, r) => sum + Number(r.price || 0), 0);

  let html = `
    <div class="detail-header">

      <h2>${escapeHTML(theater.name)}</h2>

      <div class="detail-summary">
        観劇回数：${theaterRecords.length}回<br>
        累計金額：¥${totalPrice.toLocaleString()}
      </div>

    </div>
  `;

  theaterRecords.forEach(record => {
    html += createRecordCardHTML(record);
  });

  document.getElementById("theaterDetailContent").innerHTML = html;

  attachRecordCardEvents();

}


/* =====================================================
   観劇記録詳細
===================================================== */

function openRecordDetail(recordId) {

  hideAllScreens();
  recordDetailScreen.style.display = "block";

  const record = records.find(r => r.id === recordId);
  if (!record) return;

  const work = works.find(w => w.id === record.workId);
  const performance = performances.find(p => p.id === record.performanceId);
  const theater = theaters.find(t => t.id === record.theaterId);

  let html = `
    <div class="record-detail-card">

      <div class="record-detail-title">
        ${escapeHTML(work?.name || "作品不明")}
      </div>

      <div class="record-detail-row">
        <div class="record-detail-label">公演</div>
        ${escapeHTML(performance?.name || "公演不明")}
      </div>

      <div class="record-detail-row">
        <div class="record-detail-label">観劇日</div>
        ${escapeHTML(record.date || "")}
      </div>

      <div class="record-detail-row">
        <div class="record-detail-label">劇場</div>
        ${escapeHTML(theater?.name || "")}
      </div>

      <div class="record-detail-row">
        <div class="record-detail-label">座席</div>
        ${escapeHTML(record.seat || "")}
      </div>

      <div class="record-detail-row">
        <div class="record-detail-label">座席の見やすさ</div>
        ${record.seatRating ? "★".repeat(record.seatRating) : ""}
      </div>

      <div class="record-detail-row">
        <div class="record-detail-label">チケット代</div>
        ¥${Number(record.price || 0).toLocaleString()}
      </div>

      <div class="record-detail-row">
        <div class="record-detail-label">座席の感想</div>
        <p class="impression-text">${escapeHTML(record.seatImpression || "")}</p>
      </div>

      <div class="record-detail-row">
        <div class="record-detail-label">作品の感想</div>
        <p class="impression-text">${escapeHTML(record.impression || "")}</p>
      </div>

      <div class="record-actions">
        <button class="edit-button" id="recordEditButton">編集</button>
        <button class="delete-button" id="recordDeleteButton">削除</button>
      </div>

    </div>
  `;

  document.getElementById("recordDetailContent").innerHTML = html;

  document.getElementById("recordEditButton").addEventListener("click", () => {
    openRecordScreen(record);
  });

  document.getElementById("recordDeleteButton").addEventListener("click", () => {

    const ok = confirm("この観劇記録を削除しますか？");
    if (!ok) return;

    records = records.filter(r => r.id !== recordId);
    saveData();

    hideAllScreens();
    homeScreen.style.display = "block";
    renderHome();

  });

}


/* =====================================================
   共通：画面非表示
===================================================== */

function hideAllScreens() {
  homeScreen.style.display = "none";
  addScreen.style.display = "none";
  workScreen.style.display = "none";
  performanceScreen.style.display = "none";
  theaterScreen.style.display = "none";
  detailScreen.style.display = "none";
  theaterDetailScreen.style.display = "none";
  recordDetailScreen.style.display = "none";
}


/* =====================================================
   HTMLエスケープ
===================================================== */

function escapeHTML(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}


/* =====================================================
   観劇記録カードHTML生成
===================================================== */

function createRecordCardHTML(record) {

  const theater = theaters.find(t => t.id === record.theaterId);

  return `
    <div class="record-card" data-id="${record.id}">

      <div class="record-date">
        ${escapeHTML(record.date || "")}
      </div>

      <div class="record-theater">
        ${escapeHTML(theater?.name || "")}
      </div>

      <div class="record-seat">
        ${escapeHTML(record.seat || "")}
      </div>

      ${
        record.seatRating
          ? `<div class="seat-rating">★${record.seatRating}</div>`
          : ""
      }

      <div class="record-price">
        ¥${Number(record.price || 0).toLocaleString()}
      </div>

    </div>
  `;
}


/* =====================================================
   観劇記録カードイベント付与
===================================================== */

function attachRecordCardEvents() {

  document.querySelectorAll(".record-card").forEach(card => {

    card.addEventListener("click", () => {
      const id = card.getAttribute("data-id");
      openRecordDetail(id);
    });

  });

}
/* =====================================================
   戻るボタン（詳細画面用）
===================================================== */

document.getElementById("detailBackButton").addEventListener("click", () => {
  hideAllScreens();
  homeScreen.style.display = "block";
  renderHome();
});

document.getElementById("theaterDetailBackButton").addEventListener("click", () => {
  hideAllScreens();
  homeScreen.style.display = "block";
  renderHome();
});

document.getElementById("recordDetailBackButton").addEventListener("click", () => {
  hideAllScreens();
  homeScreen.style.display = "block";
  renderHome();
});

