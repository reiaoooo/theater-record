let accountCount = 0;
const maxAccounts = 20;
const accountsDiv = document.getElementById("accounts");

// 枠追加
function addAccount() {
  if (accountCount >= maxAccounts) return;

  accountCount++;

  accountsDiv.innerHTML += `
    <div class="account-block" id="acc${accountCount}">
      <label>電話番号</label>
      <input id="tel${accountCount}" placeholder="例：07012345678">

      <label>受付番号（複数行OK）</label>
      <textarea id="entries${accountCount}" placeholder="例：1234&#10;5678&#10;9012"></textarea>
    </div>
  `;
}

// 初期1枠
addAccount();

// ＋ボタン
document.getElementById("add").onclick = addAccount;


// 当落判定
async function checkOne(tel, receiptNo) {
  const url = "https://w1.onlineticket.jp/guestauth/member/guestAuth";

  const params = new URLSearchParams();
  params.append("telnum", tel);
  params.append("receiptNo", receiptNo);
  params.append("op", "commitGuestAuth");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });

  const html = await res.text();

  let result = "判定できません";
  if (html.includes("当選")) result = "当選";
  if (html.includes("落選")) result = "落選";

  let detail = null;

  if (result === "当選") {
    const detailUrlMatch = html.match(/href="([^"]*detail[^"]*)"/);
    if (detailUrlMatch) {
      const detailUrl = "https://w1.onlineticket.jp" + detailUrlMatch[1];
      const detailHtml = await fetch(detailUrl).then(r => r.text());
      detail = parseDetail(detailHtml);
    }
  }

  return { result, detail };
}

// 詳細解析
function parseDetail(html) {
  const datetime = html.match(/日時<\/td>\s*<td[^>]*>([^<]+)/)?.[1] || "-";
  const count = Number(html.match(/(\d+)枚/)?.[1] || 0);
  const price = Number((html.match(/([\d,]+)円/)?.[1] || "0").replace(/,/g, ""));
  const total = count * price;
  const paycode = html.match(/払込票番号<\/td>\s*<td[^>]*>([^<]+)/)?.[1] || "-";

  return { datetime, count, total, paycode };
}


// 実行
document.getElementById("run").onclick = async () => {
  let finalHtml = "";
  let grandTotal = 0;

  for (let i = 1; i <= accountCount; i++) {
    const tel = document.getElementById(`tel${i}`).value.trim();
    const entriesRaw = document.getElementById(`entries${i}`).value.trim();

    if (!tel || !entriesRaw) continue;

    const entries = entriesRaw.split("\n").map(v => v.trim()).filter(v => v);

    let html = `
      <div class="account-result">
      <table class="result-table">
        <tr>
          <th>受付番号</th>
          <th>結果</th>
          <th>日時</th>
          <th>枚数</th>
          <th>合計</th>
          <th>払込票番号</th>
        </tr>
    `;

    let accountTotal = 0;

    for (const receiptNo of entries) {
      const { result, detail } = await checkOne(tel, receiptNo);

      let rowColor = "";
      if (result === "当選") rowColor = "win";
      else if (result === "落選") rowColor = "lose";
      else rowColor = "unknown";

      html += `
        <tr class="${rowColor}">
          <td>${receiptNo}</td>
          <td>${result}</td>
          <td>${detail?.datetime || "-"}</td>
          <td>${detail?.count || "-"}</td>
          <td>${detail?.total ? detail.total + "円" : "-"}</td>
          <td>${detail?.paycode || "-"}</td>
        </tr>
      `;

      if (detail?.total) accountTotal += detail.total;
    }

    html += `</table>`;
    html += `<h3 class="total-sum">アカウント${i}合計：${accountTotal}円</h3>`;
    html += `</div>`;

    finalHtml += html;
    grandTotal += accountTotal;
  }

  finalHtml += `<h2 class="total-sum">全アカウント合計：${grandTotal}円</h2>`;

  document.getElementById("result").innerHTML = finalHtml;
};
