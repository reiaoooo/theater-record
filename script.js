/* =====================================================
   観劇記録アプリ
===================================================== */


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
   ID
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
   画面取得
===================================================== */

const homeScreen =
  document.getElementById(
    "homeScreen"
  );


const addScreen =
  document.getElementById(
    "addScreen"
  );


const workScreen =
  document.getElementById(
    "workScreen"
  );


const performanceScreen =
  document.getElementById(
    "performanceScreen"
  );


const theaterScreen =
  document.getElementById(
    "theaterScreen"
  );


const detailScreen =
  document.getElementById(
    "detailScreen"
  );


/* =====================================================
   初期表示
===================================================== */

renderHome();


/* =====================================================
   ホーム表示
===================================================== */

function renderHome() {

  /*
   * 作品数
   */

  document.getElementById(
    "workCount"
  ).textContent =
    works.length;


  /*
   * 観劇回数
   */

  document.getElementById(
    "recordCount"
  ).textContent =
    records.length;


  /*
   * 合計金額
   */

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

  renderRecentRecords();

}


/* =====================================================
   作品一覧
===================================================== */

function renderWorkList() {

  const container =
    document.getElementById(
      "workList"
    );


  container.innerHTML = "";


  if (works.length === 0) {

    container.innerHTML = `
      <div class="empty">まだ作品が登録されていません</div>
    `;

    return;

  }


  works.forEach(
    work => {

      const workRecords =
        records.filter(
          record =>
            record.workId ===
            work.id
        );


      const totalPrice =
        workRecords.reduce(
          (sum, record) => {

            return (
              sum +
              Number(record.price || 0)
            );

          },
          0
        );


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "work-card";


      const imageHTML =
        work.image
          ? `
            <img
              class="work-image"
              src="${work.image}"
              alt=""
            >
          `
          : `
            <div class="work-image"></div>
          `;


      card.innerHTML = `
        ${imageHTML}

        <div class="work-info">

          <div class="work-name">${escapeHTML(work.name)}</div>

          <div class="work-meta">
            ${workRecords.length}回
            ／
            ¥${totalPrice.toLocaleString()}
          </div>

        </div>

        <div class="work-arrow">
          ›
        </div>
      `;


      card.addEventListener(
        "click",
        () => {

          openWorkDetail(
            work.id
          );

        }
      );


      container.appendChild(
        card
      );

    }
  );

}


/* =====================================================
   最近の観劇
===================================================== */

function renderRecentRecords() {

  const container =
    document.getElementById(
      "recentList"
    );


  container.innerHTML = "";


  if (records.length === 0) {

    container.innerHTML = `
      <div class="empty">まだ観劇記録がありません</div>
    `;

    return;

  }


  const sortedRecords =
    [...records]
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      )
      .slice(0, 5);


  sortedRecords.forEach(
    record => {

      const work =
        works.find(
          work =>
            work.id ===
            record.workId
        );


      const performance =
        performances.find(
          performance =>
            performance.id ===
            record.performanceId
        );


      const theater =
        theaters.find(
          theater =>
            theater.id ===
            record.theaterId
        );


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "recent-card";


      card.innerHTML = `
        <div class="recent-title">
          ${escapeHTML(
            work?.name ||
            "作品不明"
          )}
        </div>

        <div class="recent-info">
          ${escapeHTML(
            performance?.name ||
            "公演不明"
          )}
          ／
          ${escapeHTML(
            record.date || ""
          )}
          ${
            theater
              ? "／ " +
                escapeHTML(
                  theater.name
                )
              : ""
          }
        </div>
      `;


      container.appendChild(
        card
      );

    }
  );

}


/* =====================================================
   観劇記録画面を開く
===================================================== */

document
  .getElementById("addButton")
  .addEventListener(
    "click",
    () => {

      openRecordScreen();

    }
  );


function openRecordScreen(
  record = null
) {

  homeScreen.style.display =
    "none";


  detailScreen.style.display =
    "none";


  addScreen.style.display =
    "block";


  document
    .getElementById("recordForm")
    .reset();


  document.getElementById(
    "editingRecordId"
  ).value = "";


  populateWorkSelect();

  populateTheaterSelect();


  /*
   * 新規
   */

  if (!record) {

    document.getElementById(
      "recordScreenTitle"
    ).textContent =
      "観劇を記録";

    return;

  }


  /*
   * 編集
   */

  document.getElementById(
    "recordScreenTitle"
  ).textContent =
    "観劇記録を編集";


  document.getElementById(
    "editingRecordId"
  ).value =
    record.id;


  document.getElementById(
    "recordWork"
  ).value =
    record.workId;


  populatePerformanceSelect(
    record.workId
  );


  document.getElementById(
    "recordPerformance"
  ).value =
    record.performanceId;


  document.getElementById(
    "recordDate"
  ).value =
    record.date || "";


  document.getElementById(
    "recordTheater"
  ).value =
    record.theaterId || "";


  document.getElementById(
    "recordSeat"
  ).value =
    record.seat || "";


  document.getElementById(
    "recordSeatRating"
  ).value =
    record.seatRating || "";


  document.getElementById(
    "recordSeatImpression"
  ).value =
    record.seatImpression || "";


  document.getElementById(
    "recordPrice"
  ).value =
    record.price || "";


  document.getElementById(
    "recordImpression"
  ).value =
    record.impression || "";

}


/* =====================================================
   戻る
===================================================== */

document
  .getElementById("backButton")
  .addEventListener(
    "click",
    () => {

      addScreen.style.display =
        "none";


      homeScreen.style.display =
        "block";


      renderHome();

    }
  );


/* =====================================================
   作品セレクト
===================================================== */

function populateWorkSelect() {

  const select =
    document.getElementById(
      "recordWork"
    );


  select.innerHTML = `
    <option value="">
      作品を選択
    </option>
  `;


  works.forEach(
    work => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        work.id;


      option.textContent =
        work.name;


      select.appendChild(
        option
      );

    }
  );

}


/* =====================================================
   公演セレクト
===================================================== */

function populatePerformanceSelect(
  workId
) {

  const select =
    document.getElementById(
      "recordPerformance"
    );


  select.innerHTML = `
    <option value="">
      公演を選択
    </option>
  `;


  if (!workId) {

    return;

  }


  performances
    .filter(
      performance =>
        performance.workId ===
        workId
    )
    .forEach(
      performance => {

        const option =
          document.createElement(
            "option"
          );


        option.value =
          performance.id;


        option.textContent =
          performance.name;


        select.appendChild(
          option
        );

      }
    );

}


/* =====================================================
   劇場セレクト
===================================================== */

function populateTheaterSelect() {

  const select =
    document.getElementById(
      "recordTheater"
    );


  select.innerHTML = `
    <option value="">
      劇場を選択
    </option>
  `;


  theaters.forEach(
    theater => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        theater.id;


      option.textContent =
        theater.name;


      select.appendChild(
        option
      );

    }
  );

}


/* =====================================================
   作品変更
===================================================== */

document
  .getElementById("recordWork")
  .addEventListener(
    "change",
    event => {

      populatePerformanceSelect(
        event.target.value
      );

    }
  );


/* =====================================================
   作品登録画面
===================================================== */

document
  .getElementById(
    "openWorkButton"
  )
  .addEventListener(
    "click",
    () => {

      openWorkScreen();

    }
  );


function openWorkScreen() {

  document
    .getElementById("workForm")
    .reset();


  workScreen.style.display =
    "block";

}


/* =====================================================
   作品登録画面を閉じる
===================================================== */

document
  .getElementById(
    "closeWorkButton"
  )
  .addEventListener(
    "click",
    () => {

      workScreen.style.display =
        "none";

    }
  );


/* =====================================================
   記録画面から作品登録
===================================================== */

document
  .getElementById(
    "recordNewWorkButton"
  )
  .addEventListener(
    "click",
    () => {

      openWorkScreen();

    }
  );


/* =====================================================
   作品登録
===================================================== */

document
  .getElementById("workForm")
  .addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const name =
        document
          .getElementById(
            "workName"
          )
          .value
          .trim();


      if (!name) {

        return;

      }


      /*
       * 画像設定
       */

      const newWork = {

        id: createId(),

        name: name,

        image:
          name === "テニスの王子様"
            ? "images/tennis.png"
            : ""

      };


      works.push(
        newWork
      );


      saveData();


      workScreen.style.display =
        "none";


      renderHome();


      /*
       * テニスの王子様
       */

      if (
        name ===
        "テニスの王子様"
      ) {

        showImageEffect(
          "images/tennis.png"
        );

      }


      /*
       * 記録画面から登録した場合
       */

      if (
        addScreen.style.display ===
        "block"
      ) {

        populateWorkSelect();


        document.getElementById(
          "recordWork"
        ).value =
          newWork.id;


        populatePerformanceSelect(
          newWork.id
        );

      }

    }
  );


/* =====================================================
   画像演出
===================================================== */

function showImageEffect(
  imagePath
) {

  const effect =
    document.getElementById(
      "imageEffect"
    );


  const image =
    document.getElementById(
      "effectImage"
    );


  image.src =
    imagePath;


  effect.classList.remove(
    "show"
  );


  void effect.offsetWidth;


  effect.classList.add(
    "show"
  );


  setTimeout(
    () => {

      effect.classList.remove(
        "show"
      );

    },
    1900
  );

}


/* =====================================================
   公演登録
===================================================== */

document
  .getElementById(
    "recordNewPerformanceButton"
  )
  .addEventListener(
    "click",
    () => {

      openPerformanceScreen();

    }
  );


function openPerformanceScreen() {

  const select =
    document.getElementById(
      "performanceWork"
    );


  select.innerHTML = `
    <option value="">
      作品を選択
    </option>
  `;


  works.forEach(
    work => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        work.id;


      option.textContent =
        work.name;


      select.appendChild(
        option
      );

    }
  );


  const currentWork =
    document.getElementById(
      "recordWork"
    ).value;


  document
    .getElementById(
      "performanceForm"
    )
    .reset();


  /*
   * reset後に作品を入れ直す
   */

  select.innerHTML = `
    <option value="">
      作品を選択
    </option>
  `;


  works.forEach(
    work => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        work.id;


      option.textContent =
        work.name;


      select.appendChild(
        option
      );

    }
  );


  if (currentWork) {

    select.value =
      currentWork;

  }


  performanceScreen.style.display =
    "block";

}


/* =====================================================
   公演登録画面を閉じる
===================================================== */

document
  .getElementById(
    "closePerformanceButton"
  )
  .addEventListener(
    "click",
    () => {

      performanceScreen.style.display =
        "none";

    }
  );


/* =====================================================
   公演登録
===================================================== */

document
  .getElementById(
    "performanceForm"
  )
  .addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const workId =
        document.getElementById(
          "performanceWork"
        ).value;


      const name =
        document.getElementById(
          "performanceName"
        ).value
        .trim();


      if (!workId || !name) {

        return;

      }


      const newPerformance = {

        id: createId(),

        workId: workId,

        name: name

      };


      performances.push(
        newPerformance
      );


      saveData();


      performanceScreen.style.display =
        "none";


      /*
       * 記録画面からの場合
       */

      if (
        addScreen.style.display ===
        "block"
      ) {

        populateWorkSelect();


        document.getElementById(
          "recordWork"
        ).value =
          workId;


        populatePerformanceSelect(
          workId
        );


        document.getElementById(
          "recordPerformance"
        ).value =
          newPerformance.id;

      }

    }
  );


/* =====================================================
   劇場登録画面
===================================================== */

document
  .getElementById(
    "recordNewTheaterButton"
  )
  .addEventListener(
    "click",
    () => {

      openTheaterScreen();

    }
  );


function openTheaterScreen() {

  document
    .getElementById(
      "theaterForm"
    )
    .reset();


  theaterScreen.style.display =
    "block";

}


/* =====================================================
   劇場登録画面を閉じる
===================================================== */

document
  .getElementById(
    "closeTheaterButton"
  )
  .addEventListener(
    "click",
    () => {

      theaterScreen.style.display =
        "none";

    }
  );


/* =====================================================
   劇場登録
===================================================== */

document
  .getElementById(
    "theaterForm"
  )
  .addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const name =
        document
          .getElementById(
            "theaterName"
          )
          .value
          .trim();


      if (!name) {

        return;

      }


      /*
       * 同じ名前がある場合
       */

      const existing =
        theaters.find(
          theater =>
            theater.name ===
            name
        );


      if (existing) {

        alert(
          "この劇場はすでに登録されています。"
        );

        return;

      }


      const newTheater = {

        id: createId(),

        name: name

      };


      theaters.push(
        newTheater
      );


      saveData();


      theaterScreen.style.display =
        "none";


      /*
       * 記録画面から登録した場合
       */

      if (
        addScreen.style.display ===
        "block"
      ) {

        populateTheaterSelect();


        document.getElementById(
          "recordTheater"
        ).value =
          newTheater.id;

      }

    }
  );


/* =====================================================
   観劇記録保存
===================================================== */

document
  .getElementById("recordForm")
  .addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const editingId =
        document.getElementById(
          "editingRecordId"
        ).value;


      const recordData = {

        workId:
          document.getElementById(
            "recordWork"
          ).value,


        performanceId:
          document.getElementById(
            "recordPerformance"
          ).value,


        date:
          document.getElementById(
            "recordDate"
          ).value,


        theaterId:
          document.getElementById(
            "recordTheater"
          ).value,


        seat:
          document.getElementById(
            "recordSeat"
          ).value
          .trim(),


        seatRating:
          document.getElementById(
            "recordSeatRating"
          ).value,


        /*
         * 改行をそのまま保存
         */

        seatImpression:
          document.getElementById(
            "recordSeatImpression"
          ).value,


        price:
          document.getElementById(
            "recordPrice"
          ).value,


        /*
         * 改行をそのまま保存
         */

        impression:
          document.getElementById(
            "recordImpression"
          ).value

      };


      /*
       * 編集
       */

      if (editingId) {

        const index =
          records.findIndex(
            record =>
              record.id ===
              editingId
          );


        if (index !== -1) {

          records[index] = {

            ...records[index],

            ...recordData

          };

        }

      }


      /*
       * 新規
       */

      else {

        records.push({

          id: createId(),

          ...recordData

        });

      }


      saveData();


      addScreen.style.display =
        "none";


      homeScreen.style.display =
        "block";


      renderHome();

    }
  );


/* =====================================================
   作品詳細
===================================================== */

function openWorkDetail(
  workId
) {

  homeScreen.style.display =
    "none";


  detailScreen.style.display =
    "block";


  const work =
    works.find(
      work =>
        work.id === workId
    );


  if (!work) {

    return;

  }


  const workRecords =
    records.filter(
      record =>
        record.workId ===
        workId
    );


  const totalPrice =
    workRecords.reduce(
      (sum, record) => {

        return (
          sum +
          Number(record.price || 0)
        );

      },
      0
    );


  const workPerformances =
    performances.filter(
      performance =>
        performance.workId ===
        workId
    );


  let html = `
    <div class="detail-header">

      ${
        work.image
          ? `
            <img
              class="detail-work-image"
              src="${work.image}"
              alt=""
            >
          `
          : ""
      }

      <h2>${escapeHTML(work.name)}</h2>

      <div class="detail-summary">
        観劇回数：${workRecords.length}回<br>
        累計金額：¥${totalPrice.toLocaleString()}
      </div>

    </div>
  `;


  /*
   * 公演ごと
   */

  workPerformances.forEach(
    performance => {

      const performanceRecords =
        workRecords.filter(
          record =>
            record.performanceId ===
            performance.id
        );


      const performancePrice =
        performanceRecords.reduce(
          (sum, record) => {

            return (
              sum +
              Number(record.price || 0)
            );

          },
          0
        );


      html += `
        <div class="performance-block">

          <div class="performance-title">
            ${escapeHTML(
              performance.name
            )}
          </div>

          <div class="performance-summary">
            ${performanceRecords.length}回
            ／
            ¥${performancePrice.toLocaleString()}
          </div>
      `;


      if (
        performanceRecords.length ===
        0
      ) {

        html += `
          <div class="empty">
            まだ観劇記録がありません
          </div>
        `;

      }


      performanceRecords
        .sort(
          (a, b) =>
            new Date(b.date) -
            new Date(a.date)
        )
        .forEach(
          record => {

            html +=
              createRecordHTML(
                record
              );

          }
        );


      html += `
        </div>
      `;

    }
  );


  /*
   * 公演登録されていない記録
   */

  const unknownRecords =
    workRecords.filter(
      record => {

        return !workPerformances.some(
          performance =>
            performance.id ===
            record.performanceId
        );

      }
    );


  if (
    unknownRecords.length > 0
  ) {

    html += `
      <div class="performance-block">

        <div class="performance-title">
          その他
        </div>
    `;


    unknownRecords.forEach(
      record => {

        html +=
          createRecordHTML(
            record
          );

      }
    );


    html += `
      </div>
    `;

  }


  document.getElementById(
    "detailContent"
  ).innerHTML =
    html;


  /*
   * 編集
   */

  document
    .querySelectorAll(
      ".edit-button"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const id =
              button.dataset.id;


            const record =
              records.find(
                record =>
                  record.id ===
                  id
              );


            if (record) {

              openRecordScreen(
                record
              );

            }

          }
        );

      }
    );


  /*
   * 削除
   */

  document
    .querySelectorAll(
      ".delete-button"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const id =
              button.dataset.id;


            const shouldDelete =
              confirm(
                "この観劇記録を削除しますか？"
              );


            if (!shouldDelete) {

              return;

            }


            records =
              records.filter(
                record =>
                  record.id !==
                  id
              );


            saveData();


            openWorkDetail(
              workId
            );

          }
        );

      }
    );

}


/* =====================================================
   観劇記録HTML
===================================================== */

function createRecordHTML(
  record
) {

  let seatStars = "";


  if (
    record.seatRating
  ) {

    const rating =
      Number(
        record.seatRating
      );


    seatStars =
      "★".repeat(rating) +
      "☆".repeat(5 - rating);

  }


  /*
   * 劇場名を取得
   */

  const theater =
    theaters.find(
      theater =>
        theater.id ===
        record.theaterId
    );


  let html = `
    <div class="record-card">

      <div class="record-date">${escapeHTML(record.date || "")}</div>
  `;


  /*
   * 劇場
   */

  if (theater) {

    html += `
      <div class="record-theater">
        ${escapeHTML(theater.name)}
      </div>
    `;

  }


  /*
   * 座席
   */

  if (record.seat) {

    html += `
      <div class="record-seat">
        席：${escapeHTML(record.seat)}
      </div>
    `;

  }


  /*
   * 座席評価
   */

  if (seatStars) {

    html += `
      <div class="seat-rating">
        ${seatStars}
      </div>
    `;

  }


  /*
   * 座席の感想
   */

  if (record.seatImpression) {

    html += `
      <div class="impression-box">

        <div class="impression-title">
          座席について
        </div>

        <div class="impression-text">${escapeHTML(record.seatImpression)}</div>

      </div>
    `;

  }


  /*
   * チケット代
   */

  if (record.price) {

    html += `
      <div class="record-price">
        チケット代：
        ¥${Number(
          record.price
        ).toLocaleString()}
      </div>
    `;

  }


  /*
   * 作品の感想
   */

  if (record.impression) {

    html += `
      <div class="impression-box">

        <div class="impression-title">
          作品について
        </div>

        <div class="impression-text">${escapeHTML(record.impression)}</div>

      </div>
    `;

  }


  /*
   * 編集・削除
   */

  html += `
      <div class="record-actions">

        <button
          class="edit-button"
          data-id="${record.id}"
        >
          編集
        </button>

        <button
          class="delete-button"
          data-id="${record.id}"
        >
          削除
        </button>

      </div>

    </div>
  `;


  return html;

}


/* =====================================================
   詳細画面から戻る
===================================================== */

document
  .getElementById(
    "detailBackButton"
  )
  .addEventListener(
    "click",
    () => {

      detailScreen.style.display =
        "none";


      homeScreen.style.display =
        "block";


      renderHome();

    }
  );


/* =====================================================
   HTMLエスケープ
===================================================== */

function escapeHTML(
  value
) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
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