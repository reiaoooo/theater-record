// =========================
// 要素を取得
// =========================

const addButton =
  document.getElementById("addButton");

const backButton =
  document.getElementById("backButton");

const detailBackButton =
  document.getElementById("detailBackButton");

const workDetailBackButton =
  document.getElementById("workDetailBackButton");

const saveForm =
  document.getElementById("recordForm");

const homeScreen =
  document.getElementById("homeScreen");

const addScreen =
  document.getElementById("addScreen");

const detailScreen =
  document.getElementById("detailScreen");

const workDetailScreen =
  document.getElementById("workDetailScreen");

const detailContent =
  document.getElementById("detailContent");

const workDetailContent =
  document.getElementById("workDetailContent");

const formTitle =
  document.getElementById("formTitle");


// =========================
// 観劇記録
// =========================

let records =
  JSON.parse(localStorage.getItem("theaterRecords")) || [];


// 編集中の記録ID

let editingId = null;


// =========================
// トップ画面
// =========================

function showHomeScreen() {

  homeScreen.style.display = "block";

  addScreen.style.display = "none";

  detailScreen.style.display = "none";

  workDetailScreen.style.display = "none";


  displayRecords();

  updateSummary();

  displayWorks();

}


// =========================
// 追加・編集画面
// =========================

function showAddScreen() {

  homeScreen.style.display = "none";

  addScreen.style.display = "block";

  detailScreen.style.display = "none";

  workDetailScreen.style.display = "none";

}


// =========================
// 新規登録
// =========================

function showNewRecordScreen() {

  editingId = null;

  formTitle.textContent = "観劇を記録";

  saveForm.reset();

  showAddScreen();

}


// =========================
// 編集画面
// =========================

function showEditScreen(record) {

  editingId = record.id;

  formTitle.textContent = "記録を編集";


  document.getElementById("title").value =
    record.title;

  document.getElementById("performance").value =
    record.performance || "";

  document.getElementById("date").value =
    record.date;

  document.getElementById("theater").value =
    record.theater || "";

  document.getElementById("seat").value =
    record.seat || "";

  document.getElementById("price").value =
    record.price || "";

  document.getElementById("impression").value =
    record.impression || "";


  showAddScreen();

}


// =========================
// 観劇詳細画面
// =========================

function showDetailScreen(record) {

  homeScreen.style.display = "none";

  addScreen.style.display = "none";

  workDetailScreen.style.display = "none";

  detailScreen.style.display = "block";


  detailContent.innerHTML = `

    <div class="detail-card">

      <div class="detail-work-name">
        ${escapeHTML(record.title)}
      </div>

      <h2>
        ${escapeHTML(record.performance)}
      </h2>


      <div class="detail-row">
        <span>観劇日</span>

        <strong>
          ${formatDate(record.date)}
        </strong>
      </div>


      ${
        record.theater
          ? `
            <div class="detail-row">
              <span>劇場</span>

              <strong>
                ${escapeHTML(record.theater)}
              </strong>
            </div>
          `
          : ""
      }


      ${
        record.seat
          ? `
            <div class="detail-row">
              <span>座席</span>

              <strong>
                ${escapeHTML(record.seat)}
              </strong>
            </div>
          `
          : ""
      }


      <div class="detail-row">
        <span>チケット代</span>

        <strong>
          ${formatPrice(record.price)}
        </strong>
      </div>


      ${
        record.impression
          ? `
            <div class="detail-impression">

              <span>感想</span>

              <p>
                ${escapeHTML(record.impression)}
              </p>

            </div>
          `
          : ""
      }


      <div class="detail-buttons">

        <button
          class="edit-button"
          id="editButton"
        >
          編集
        </button>

        <button
          class="delete-button"
          id="deleteButton"
        >
          削除
        </button>

      </div>

    </div>

  `;


  document
    .getElementById("editButton")
    .addEventListener("click", () => {

      showEditScreen(record);

    });


  document
    .getElementById("deleteButton")
    .addEventListener("click", () => {

      deleteRecord(record.id);

    });

}


// =========================
// 作品詳細画面
// =========================

function showWorkDetailScreen(title) {

  homeScreen.style.display = "none";

  addScreen.style.display = "none";

  detailScreen.style.display = "none";

  workDetailScreen.style.display = "block";


  const workRecords =
    records.filter((record) => {

      return record.title === title;

    });


  const totalPrice =
    workRecords.reduce((sum, record) => {

      return sum +
        (Number(record.price) || 0);

    }, 0);


  // 公演ごとにまとめる

  const performances = {};


  workRecords.forEach((record) => {

    if (!performances[record.performance]) {

      performances[record.performance] = {

        count: 0,

        totalPrice: 0

      };

    }


    performances[record.performance].count++;

    performances[record.performance].totalPrice +=
      Number(record.price) || 0;

  });


  let performanceHTML = "";


  Object.keys(performances).forEach(
    (performance) => {

      const data =
        performances[performance];


      performanceHTML += `

        <div
          class="performance-item"
          data-performance="${escapeHTML(performance)}"
        >

          <div class="performance-name">
            ${escapeHTML(performance)}
          </div>

          <div class="performance-data">

            <span>
              ${data.count}回
            </span>

            <span>
              ${data.totalPrice.toLocaleString()}円
            </span>

          </div>

        </div>

      `;

    }
  );


  workDetailContent.innerHTML = `

    <div class="work-detail-card">

      <h2>
        ${escapeHTML(title)}
      </h2>


      <div class="work-summary">

        <div>
          <span>公演数</span>
          <strong>
            ${Object.keys(performances).length}
          </strong>
        </div>


        <div>
          <span>観劇回数</span>
          <strong>
            ${workRecords.length}
          </strong>
        </div>


        <div>
          <span>累計</span>
          <strong>
            ${totalPrice.toLocaleString()}円
          </strong>
        </div>

      </div>


      <h3>公演</h3>

      <div class="performance-list">

        ${performanceHTML}

      </div>

    </div>

  `;


  // 公演をクリック

  document
    .querySelectorAll(".performance-item")
    .forEach((item) => {

      item.addEventListener("click", () => {

        const performance =
          item.dataset.performance;


        const record =
          workRecords.find(
            (record) =>
              record.performance === performance
          );


        if (record) {

          showDetailScreen(record);

        }

      });

    });

}


// =========================
// 新規登録ボタン
// =========================

addButton.addEventListener("click", () => {

  showNewRecordScreen();

});


// =========================
// 戻る
// =========================

backButton.addEventListener("click", () => {

  showHomeScreen();

});


detailBackButton.addEventListener("click", () => {

  showHomeScreen();

});


workDetailBackButton.addEventListener(
  "click",
  () => {

    showHomeScreen();

  }
);


// =========================
// 保存
// =========================

saveForm.addEventListener(
  "submit",
  (event) => {

    event.preventDefault();


    const title =
      document
        .getElementById("title")
        .value
        .trim();


    const performance =
      document
        .getElementById("performance")
        .value
        .trim();


    const date =
      document.getElementById("date").value;


    const theater =
      document
        .getElementById("theater")
        .value
        .trim();


    const seat =
      document
        .getElementById("seat")
        .value
        .trim();


    const price =
      Number(
        document.getElementById("price").value
      ) || 0;


    const impression =
      document
        .getElementById("impression")
        .value
        .trim();


    // =========================
    // 編集
    // =========================

    if (editingId !== null) {

      const record =
        records.find(
          (record) =>
            record.id === editingId
        );


      if (record) {

        record.title = title;

        record.performance = performance;

        record.date = date;

        record.theater = theater;

        record.seat = seat;

        record.price = price;

        record.impression = impression;

      }

    }


    // =========================
    // 新規登録
    // =========================

    else {

      const record = {

        id: Date.now(),

        title: title,

        performance: performance,

        date: date,

        theater: theater,

        seat: seat,

        price: price,

        impression: impression

      };


      records.push(record);

    }


    localStorage.setItem(
      "theaterRecords",
      JSON.stringify(records)
    );


    editingId = null;

    saveForm.reset();

    showHomeScreen();

  }
);


// =========================
// 最近の観劇
// =========================

function displayRecords() {

  const empty =
    document.querySelector(".empty");


  if (records.length === 0) {

    empty.innerHTML =
      "まだ観劇記録がありません";

    return;

  }


  const sortedRecords =
    [...records].sort((a, b) => {

      return new Date(b.date) -
        new Date(a.date);

    });


  empty.innerHTML = "";


  sortedRecords.forEach((record) => {

    const recordItem =
      document.createElement("div");


    recordItem.className =
      "record-item";


    recordItem.innerHTML = `

      <div class="record-title">
        ${escapeHTML(record.title)}
      </div>


      <div class="record-performance">
        ${escapeHTML(record.performance)}
      </div>


      <div class="record-info">
        ${formatDate(record.date)}

        ${
          record.theater
            ? `｜${escapeHTML(record.theater)}`
            : ""
        }
      </div>


      ${
        record.seat
          ? `
            <div class="record-info">
              座席：${escapeHTML(record.seat)}
            </div>
          `
          : ""
      }


      <div class="record-price">
        ${formatPrice(record.price)}
      </div>

    `;


    recordItem.addEventListener(
      "click",
      () => {

        showDetailScreen(record);

      }
    );


    empty.appendChild(recordItem);

  });

}


// =========================
// 作品一覧
// =========================

function displayWorks() {

  const workList =
    document.getElementById("workList");


  workList.innerHTML = "";


  if (records.length === 0) {

    return;

  }


  const works = {};


  records.forEach((record) => {

    if (!works[record.title]) {

      works[record.title] = {

        count: 0,

        totalPrice: 0,

        performances: new Set()

      };

    }


    works[record.title].count++;

    works[record.title].totalPrice +=
      Number(record.price) || 0;

    works[record.title].performances.add(
      record.performance
    );

  });


  Object.keys(works).forEach((title) => {

    const work =
      works[title];


    const workItem =
      document.createElement("div");


    workItem.className =
      "work-item";


    workItem.innerHTML = `

      <div class="work-title">
        ${escapeHTML(title)}
      </div>


      <div class="work-data">

        <span>
          ${work.performances.size}公演
        </span>

        <span>
          ${work.count}回
        </span>

        <span>
          ${work.totalPrice.toLocaleString()}円
        </span>

      </div>

    `;


    workItem.addEventListener(
      "click",
      () => {

        showWorkDetailScreen(title);

      }
    );


    workList.appendChild(workItem);

  });

}


// =========================
// 削除
// =========================

function deleteRecord(id) {

  const confirmed =
    confirm(
      "この観劇記録を削除しますか？"
    );


  if (!confirmed) {

    return;

  }


  records =
    records.filter(
      (record) => record.id !== id
    );


  localStorage.setItem(
    "theaterRecords",
    JSON.stringify(records)
  );


  showHomeScreen();

}


// =========================
// 集計
// =========================

function updateSummary() {

  const summaryNumbers =
    document.querySelectorAll(
      ".summary-box strong"
    );


  const uniqueTitles =
    new Set(
      records.map(
        (record) => record.title
      )
    );


  summaryNumbers[0].textContent =
    uniqueTitles.size;


  summaryNumbers[1].textContent =
    records.length;


  const totalPrice =
    records.reduce(
      (sum, record) => {

        return sum +
          (Number(record.price) || 0);

      },
      0
    );


  summaryNumbers[2].textContent =
    `${totalPrice.toLocaleString()}円`;

}


// =========================
// 日付
// =========================

function formatDate(date) {

  if (!date) {

    return "";

  }


  const [year, month, day] =
    date.split("-");


  return `${year}年${month}月${day}日`;

}


// =========================
// 金額
// =========================

function formatPrice(price) {

  return `${Number(price || 0).toLocaleString()}円`;

}


// =========================
// HTMLを安全に表示
// =========================

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


// =========================
// 最初に表示
// =========================

showHomeScreen();