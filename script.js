// =========================
// 要素を取得
// =========================

const homeScreen =
  document.getElementById("homeScreen");

const addScreen =
  document.getElementById("addScreen");

const detailScreen =
  document.getElementById("detailScreen");

const workDetailScreen =
  document.getElementById("workDetailScreen");

const theaterDetailScreen =
  document.getElementById("theaterDetailScreen");


const addButton =
  document.getElementById("addButton");

const backButton =
  document.getElementById("backButton");

const detailBackButton =
  document.getElementById("detailBackButton");

const workDetailBackButton =
  document.getElementById("workDetailBackButton");

const theaterDetailBackButton =
  document.getElementById(
    "theaterDetailBackButton"
  );


const recordForm =
  document.getElementById("recordForm");


const formTitle =
  document.getElementById("formTitle");


// =========================
// データ
// =========================

let records =
  JSON.parse(
    localStorage.getItem("theaterRecords")
  ) || [];


// 編集中の記録

let editingId = null;


// =========================
// 画面切り替え
// =========================

function hideAllScreens() {

  homeScreen.style.display = "none";

  addScreen.style.display = "none";

  detailScreen.style.display = "none";

  workDetailScreen.style.display = "none";

  theaterDetailScreen.style.display = "none";

}


// =========================
// ホーム画面
// =========================

function showHomeScreen() {

  hideAllScreens();

  homeScreen.style.display = "block";

  displayRecords();

  displayWorks();

  displayTheaters();

  updateSummary();

}


// =========================
// 新規登録画面
// =========================

function showNewRecordScreen() {

  editingId = null;

  formTitle.textContent =
    "観劇を記録";

  recordForm.reset();

  hideAllScreens();

  addScreen.style.display = "block";

}


// =========================
// 編集画面
// =========================

function showEditScreen(record) {

  editingId = record.id;

  formTitle.textContent =
    "記録を編集";


  document.getElementById("title").value =
    record.title;

  document.getElementById("performance").value =
    record.performance;

  document.getElementById("date").value =
    record.date;

  document.getElementById("theater").value =
    record.theater;

  document.getElementById("seat").value =
    record.seat || "";

  document.getElementById("price").value =
    record.price || "";

  document.getElementById("seatRating").value =
    record.seatRating || 5;

  document.getElementById("seatImpression").value =
    record.seatImpression || "";

  document.getElementById("workImpression").value =
    record.workImpression || "";


  hideAllScreens();

  addScreen.style.display = "block";

}


// =========================
// 詳細画面
// =========================

function showDetailScreen(record) {

  hideAllScreens();

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


      <div class="detail-row">
        <span>劇場</span>

        <strong>
          ${escapeHTML(record.theater)}
        </strong>
      </div>


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


      <!-- 座席について -->

      <div class="detail-section">

        <h3>
          座席
        </h3>


        <div class="rating">
          ${getStars(record.seatRating)}
        </div>


        ${
          record.seatImpression
          ? `
            <p class="impression">
              ${escapeHTML(
                record.seatImpression
              )}
            </p>
          `
          : `
            <p class="no-content">
              座席の感想はありません
            </p>
          `
        }

      </div>


      <!-- 作品について -->

      <div class="detail-section">

        <h3>
          作品の感想
        </h3>


        ${
          record.workImpression
          ? `
            <p class="impression">
              ${escapeHTML(
                record.workImpression
              )}
            </p>
          `
          : `
            <p class="no-content">
              作品の感想はありません
            </p>
          `
        }

      </div>


      <!-- ボタン -->

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
    .addEventListener(
      "click",
      () => {

        showEditScreen(record);

      }
    );


  document
    .getElementById("deleteButton")
    .addEventListener(
      "click",
      () => {

        deleteRecord(record.id);

      }
    );

}


// =========================
// 作品詳細
// =========================

function showWorkDetailScreen(title) {

  hideAllScreens();

  workDetailScreen.style.display = "block";


  const workRecords =
    records.filter(
      record =>
        record.title === title
    );


  const performances = {};


  workRecords.forEach(record => {

    if (!performances[record.performance]) {

      performances[record.performance] = [];

    }

    performances[record.performance]
      .push(record);

  });


  const totalPrice =
    workRecords.reduce(
      (sum, record) =>
        sum + (Number(record.price) || 0),
      0
    );


  let performanceHTML = "";


  Object.keys(performances)
    .forEach(performance => {

      const performanceRecords =
        performances[performance];


      const price =
        performanceRecords.reduce(
          (sum, record) =>
            sum +
            (Number(record.price) || 0),
          0
        );


      performanceHTML += `

        <div
          class="performance-item"
          data-performance="${escapeHTML(
            performance
          )}"
        >

          <div class="performance-name">
            ${escapeHTML(performance)}
          </div>


          <div class="performance-data">

            <span>
              ${performanceRecords.length}回
            </span>

            <span>
              ${price.toLocaleString()}円
            </span>

          </div>

        </div>

      `;

    });


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


      <h3>
        公演
      </h3>


      <div class="performance-list">

        ${performanceHTML}

      </div>

    </div>

  `;


  document
    .querySelectorAll(
      ".performance-item"
    )
    .forEach(item => {

      item.addEventListener(
        "click",
        () => {

          const performance =
            item.dataset.performance;


          const record =
            workRecords.find(
              record =>
                record.performance ===
                performance
            );


          if (record) {

            showDetailScreen(record);

          }

        }
      );

    });

}


// =========================
// 劇場一覧
// =========================

function displayTheaters() {

  const theaterList =
    document.getElementById(
      "theaterList"
    );


  theaterList.innerHTML = "";


  const theaters = {};


  records.forEach(record => {

    if (!record.theater) {

      return;

    }


    if (!theaters[record.theater]) {

      theaters[record.theater] = [];

    }


    theaters[record.theater]
      .push(record);

  });


  Object.keys(theaters)
    .forEach(theater => {

      const theaterItem =
        document.createElement("div");


      theaterItem.className =
        "theater-item";


      theaterItem.innerHTML = `

        <div class="theater-name">
          ${escapeHTML(theater)}
        </div>


        <div class="theater-data">

          <span>
            ${theaters[theater].length}件
          </span>

        </div>

      `;


      theaterItem.addEventListener(
        "click",
        () => {

          showTheaterDetailScreen(
            theater
          );

        }
      );


      theaterList.appendChild(
        theaterItem
      );

    });

}


// =========================
// 劇場詳細
// =========================

function showTheaterDetailScreen(
  theater
) {

  hideAllScreens();

  theaterDetailScreen.style.display =
    "block";


  const theaterRecords =
    records.filter(
      record =>
        record.theater === theater
    );


  theaterRecords.sort(
    (a, b) =>
      new Date(b.date) -
      new Date(a.date)
  );


  let seatHTML = "";


  theaterRecords.forEach(record => {

    seatHTML += `

      <div
        class="seat-record"
        data-id="${record.id}"
      >

        <div class="seat-record-top">

          <div class="seat-position">

            ${
              record.seat
              ? escapeHTML(record.seat)
              : "座席未登録"
            }

          </div>


          <div class="rating">
            ${getStars(record.seatRating)}
          </div>

        </div>


        <div class="seat-record-info">

          ${formatDate(record.date)}
          ｜
          ${escapeHTML(record.title)}

        </div>


        ${
          record.seatImpression
          ? `
            <p class="seat-record-impression">
              ${escapeHTML(
                record.seatImpression
              )}
            </p>
          `
          : ""
        }

      </div>

    `;

  });


  theaterDetailContent.innerHTML = `

    <div class="theater-detail-card">

      <h2>
        ${escapeHTML(theater)}
      </h2>


      <p class="theater-count">
        ${theaterRecords.length}件の座席記録
      </p>


      <h3>
        座席記録
      </h3>


      <div class="seat-record-list">

        ${seatHTML}

      </div>

    </div>

  `;


  document
    .querySelectorAll(".seat-record")
    .forEach(item => {

      item.addEventListener(
        "click",
        () => {

          const id =
            Number(item.dataset.id);


          const record =
            records.find(
              record =>
                record.id === id
            );


          if (record) {

            showDetailScreen(record);

          }

        }
      );

    });

}


// =========================
// 最近の観劇
// =========================

function displayRecords() {

  const recentRecords =
    document.getElementById(
      "recentRecords"
    );


  if (records.length === 0) {

    recentRecords.innerHTML = `

      <div class="empty">
        まだ観劇記録がありません
      </div>

    `;

    return;

  }


  const sortedRecords =
    [...records].sort(
      (a, b) =>
        new Date(b.date) -
        new Date(a.date)
    );


  recentRecords.innerHTML = "";


  sortedRecords
    .slice(0, 5)
    .forEach(record => {

      const item =
        document.createElement("div");


      item.className =
        "record-item";


      item.innerHTML = `

        <div class="record-title">
          ${escapeHTML(record.title)}
        </div>


        <div class="record-performance">
          ${escapeHTML(
            record.performance
          )}
        </div>


        <div class="record-info">
          ${formatDate(record.date)}
          ｜
          ${escapeHTML(record.theater)}
        </div>


        ${
          record.seat
          ? `
            <div class="record-info">
              座席：
              ${escapeHTML(record.seat)}
            </div>
          `
          : ""
        }


        <div class="record-price">
          ${formatPrice(record.price)}
        </div>

      `;


      item.addEventListener(
        "click",
        () => {

          showDetailScreen(record);

        }
      );


      recentRecords.appendChild(item);

    });

}


// =========================
// 作品一覧
// =========================

function displayWorks() {

  const workList =
    document.getElementById(
      "workList"
    );


  workList.innerHTML = "";


  const works = {};


  records.forEach(record => {

    if (!works[record.title]) {

      works[record.title] = [];

    }


    works[record.title]
      .push(record);

  });


  Object.keys(works)
    .forEach(title => {

      const workRecords =
        works[title];


      const performances =
        new Set(
          workRecords.map(
            record =>
              record.performance
          )
        );


      const totalPrice =
        workRecords.reduce(
          (sum, record) =>
            sum +
            (Number(record.price) || 0),
          0
        );


      const item =
        document.createElement("div");


      item.className =
        "work-item";


      item.innerHTML = `

        <div class="work-title">
          ${escapeHTML(title)}
        </div>


        <div class="work-data">

          <span>
            ${performances.size}公演
          </span>

          <span>
            ${workRecords.length}回
          </span>

          <span>
            ${totalPrice.toLocaleString()}円
          </span>

        </div>

      `;


      item.addEventListener(
        "click",
        () => {

          showWorkDetailScreen(title);

        }
      );


      workList.appendChild(item);

    });

}


// =========================
// 保存
// =========================

recordForm.addEventListener(
  "submit",
  event => {

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
        document
          .getElementById("price")
          .value
      ) || 0;


    const seatRating =
      Number(
        document
          .getElementById("seatRating")
          .value
      );


    const seatImpression =
      document
        .getElementById(
          "seatImpression"
        )
        .value
        .trim();


    const workImpression =
      document
        .getElementById(
          "workImpression"
        )
        .value
        .trim();


    // =========================
    // 編集
    // =========================

    if (editingId !== null) {

      const record =
        records.find(
          record =>
            record.id === editingId
        );


      if (record) {

        record.title =
          title;

        record.performance =
          performance;

        record.date =
          date;

        record.theater =
          theater;

        record.seat =
          seat;

        record.price =
          price;

        record.seatRating =
          seatRating;

        record.seatImpression =
          seatImpression;

        record.workImpression =
          workImpression;

      }

    }


    // =========================
    // 新規登録
    // =========================

    else {

      records.push({

        id: Date.now(),

        title: title,

        performance: performance,

        date: date,

        theater: theater,

        seat: seat,

        price: price,

        seatRating: seatRating,

        seatImpression:
          seatImpression,

        workImpression:
          workImpression

      });

    }


    // =========================
    // 保存
    // =========================

    localStorage.setItem(
      "theaterRecords",
      JSON.stringify(records)
    );


    editingId = null;

    recordForm.reset();


    showHomeScreen();

  }
);


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
      record =>
        record.id !== id
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

  const workCount =
    new Set(
      records.map(
        record =>
          record.title
      )
    ).size;


  const performanceCount =
    records.length;


  const totalPrice =
    records.reduce(
      (sum, record) =>
        sum +
        (Number(record.price) || 0),
      0
    );


  document.getElementById(
    "workCount"
  ).textContent =
    workCount;


  document.getElementById(
    "performanceCount"
  ).textContent =
    performanceCount;


  document.getElementById(
    "totalPrice"
  ).textContent =
    `${totalPrice.toLocaleString()}円`;

}


// =========================
// 星
// =========================

function getStars(rating) {

  const value =
    Number(rating) || 0;


  return (
    "★".repeat(value) +
    "☆".repeat(5 - value)
  );

}


// =========================
// 日付
// =========================

function formatDate(date) {

  if (!date) {

    return "";

  }


  const parts =
    date.split("-");


  return `
    ${parts[0]}年
    ${parts[1]}月
    ${parts[2]}日
  `;

}


// =========================
// 金額
// =========================

function formatPrice(price) {

  return `${
    Number(price || 0)
      .toLocaleString()
  }円`;

}


// =========================
// HTMLエスケープ
// =========================

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


// =========================
// 戻るボタン
// =========================

backButton.addEventListener(
  "click",
  showHomeScreen
);


detailBackButton.addEventListener(
  "click",
  showHomeScreen
);


workDetailBackButton.addEventListener(
  "click",
  showHomeScreen
);


theaterDetailBackButton.addEventListener(
  "click",
  showHomeScreen
);


// =========================
// 追加ボタン
// =========================

addButton.addEventListener(
  "click",
  showNewRecordScreen
);


// =========================
// 初期表示
// =========================

showHomeScreen();