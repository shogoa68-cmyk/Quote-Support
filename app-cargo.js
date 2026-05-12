// ========== サイズ計算 (app-cargo.js) ==========

  // ========== サイズ計算（calcRowCountはapp-constants.jsで宣言済み） ==========

  function addCalcRow() {
    calcRowCount++;
    const n  = calcRowCount;
    const tr = document.createElement('tr');
    tr.id    = `calc-row-${n}`;
    tr.innerHTML = `
      <td><input type="number" class="calc-pcs" min="1"  value="1" oninput="calcLiveUpdate()" /></td>
      <td>
        <select class="calc-pkg" title="荷姿">
          <option value="">—</option>
          <option>カートン</option>
          <option>パレット</option>
          <option>木枠</option>
          <option>ドラム</option>
          <option>バルク</option>
          <option>ベール</option>
          <option>その他</option>
        </select>
      </td>
      <td><input type="number" class="calc-l"   min="0"  value="" placeholder="0" oninput="calcLiveUpdate()" /></td>
      <td><input type="number" class="calc-w"   min="0"  value="" placeholder="0" oninput="calcLiveUpdate()" /></td>
      <td><input type="number" class="calc-h"   min="0"  value="" placeholder="0" oninput="calcLiveUpdate()" /></td>
      <td class="cbm-result" id="cbm-sub-${n}">—</td>
      <td><input type="number" class="calc-kg"  min="0"  value="" placeholder="0" oninput="calcLiveUpdate()" title="1個あたりの重量（kg）" /></td>
      <td class="kg-total-result" id="kg-total-${n}">—</td>
      <td>
        <select class="calc-stack" title="段積みできるか">
          <option value="">—</option>
          <option>可</option>
          <option>不可</option>
        </select>
      </td>
      <td><button class="btn-calc-row-del" onclick="delCalcRow(${n})" title="削除">✕</button></td>
    `;
    document.getElementById('calcBody').appendChild(tr);
  }

  function delCalcRow(n) {
    document.getElementById(`calc-row-${n}`)?.remove();
    calcLiveUpdate();
  }

  function calcLiveUpdate() {
    document.querySelectorAll('#calcBody tr').forEach(tr => {
      const pcs = parseFloat(tr.querySelector('.calc-pcs')?.value) || 0;
      const l   = parseFloat(tr.querySelector('.calc-l')?.value)   || 0;
      const w   = parseFloat(tr.querySelector('.calc-w')?.value)   || 0;
      const h   = parseFloat(tr.querySelector('.calc-h')?.value)   || 0;
      const kg  = parseFloat(tr.querySelector('.calc-kg')?.value)  || 0;
      const sub = tr.querySelector('.cbm-result');
      const kgTot = tr.querySelector('.kg-total-result');
      if (sub) sub.textContent = (l && w && h) ? (pcs * l * w * h / 1_000_000).toFixed(4) : '—';
      if (kgTot) kgTot.textContent = (kg && pcs) ? (kg * pcs).toLocaleString('ja-JP', {maximumFractionDigits: 2}) : '—';
    });
  }

  function suggestContainers(cbm, kg) {
    if (cbm === 0 && kg === 0) return '—';
    const specs = [
      { name: "20'GP", cbm: 25,  kg: 21500 },
      { name: "40'GP", cbm: 57,  kg: 26500 },
      { name: "40'HQ", cbm: 67,  kg: 26500 },
    ];
    return specs.map(s => {
      const n = Math.max(cbm > 0 ? Math.ceil(cbm / s.cbm) : 0,
                         kg  > 0 ? Math.ceil(kg  / s.kg)  : 0);
      return `${s.name} × ${n}`;
    }).join(' &nbsp;/&nbsp; ');
  }

  // サイズ計算の最新結果（_lastCalcResultはapp-constants.jsで宣言済み）

  function runCalc() {
    const rows = document.querySelectorAll('#calcBody tr');
    if (!rows.length) { alert('荷物の行を追加してください。'); return; }
    let totalCBM = 0, totalKg = 0, totalPcs = 0;
    rows.forEach(tr => {
      const pcs = parseFloat(tr.querySelector('.calc-pcs')?.value) || 0;
      const l   = parseFloat(tr.querySelector('.calc-l')?.value)   || 0;
      const w   = parseFloat(tr.querySelector('.calc-w')?.value)   || 0;
      const h   = parseFloat(tr.querySelector('.calc-h')?.value)   || 0;
      const kg  = parseFloat(tr.querySelector('.calc-kg')?.value)  || 0;  // 1個あたり
      totalCBM += pcs * l * w * h / 1_000_000;
      totalKg  += kg * pcs;  // 単重量 × 個数 = この行の総重量
      totalPcs += pcs;
    });

    // RT: max(W/1000, CBM)  / CW: max(実重量, CBM×167)
    const rt = Math.max(totalKg / 1000, totalCBM);
    const cw = Math.max(totalKg, totalCBM * 167);

    // 最新結果を保持
    _lastCalcResult = { totalCBM, totalKg, totalPcs, rt, cw };

    // 貨物情報に空のときだけ自動反映（明示的な上書きは reflectToCargoInfo() で行う）
    const wEl = document.getElementById('cond-weight');
    const vEl = document.getElementById('cond-volume');
    if (wEl && !wEl.value) wEl.value = `${totalKg.toLocaleString()} kg`;
    if (vEl && !vEl.value) vEl.value = `${totalCBM.toFixed(3)} CBM`;

    document.getElementById('calcResultsGrid').innerHTML = `
      <div class="calc-result-item">
        <span class="calc-r-lbl">総個数</span>
        <span class="calc-r-val">${totalPcs.toLocaleString()} pcs</span>
      </div>
      <div class="calc-result-item">
        <span class="calc-r-lbl">総 CBM</span>
        <span class="calc-r-val hl-blue">${totalCBM.toFixed(4)} CBM</span>
      </div>
      <div class="calc-result-item">
        <span class="calc-r-lbl">総重量</span>
        <span class="calc-r-val">${totalKg.toLocaleString()} kg</span>
      </div>
      <div class="calc-result-item">
        <span class="calc-r-lbl">RT（海上）</span>
        <span class="calc-r-val hl-blue">${rt.toFixed(4)} R/T</span>
      </div>
      <div class="calc-result-item">
        <span class="calc-r-lbl">CW（航空）</span>
        <span class="calc-r-val hl-green">${Math.ceil(cw).toLocaleString()} kg</span>
      </div>
      <div class="calc-result-item">
        <span class="calc-r-lbl">コンテナ目安</span>
        <span class="calc-r-val hl-orange" style="font-size:12px;">${suggestContainers(totalCBM, totalKg)}</span>
      </div>
    `;

    buildReflectSelects(rt, cw, totalCBM, totalKg, totalPcs);
    document.getElementById('calcResultsPanel').style.display = 'block';
  }

  function buildReflectSelects(rt, cw, cbm, kg, pcs) {
    const quoteRows = document.querySelectorAll('#tableBody tr');
    const opts = quoteRows.length
      ? Array.from(quoteRows).map(tr => {
          const id = tr.id.replace('row-', '');
          const nm = document.getElementById(`nm-${id}`)?.value || '（名前なし）';
          return `<option value="${id}">${escHtml(nm)}</option>`;
        }).join('')
      : '';

    if (!opts) {
      document.getElementById('calcReflectRows').innerHTML =
        '<p style="font-size:11px;color:#aaa;margin:4px 0;">見積もり行がありません</p>';
      return;
    }

    const mkRow = (label, value, unit, key) => `
      <div class="calc-reflect-row">
        <span class="calc-reflect-lbl">${label}：<strong>${value} ${unit}</strong></span>
        <select class="calc-row-select" id="refl-sel-${key}">
          <option value="">— 行を選択 —</option>${opts}
        </select>
        <button class="btn-do-reflect" onclick="doReflect('${key}', ${value})">反映</button>
      </div>`;

    document.getElementById('calcReflectRows').innerHTML =
      mkRow('RT（海上）',  rt.toFixed(4),          'R/T', 'rt')  +
      mkRow('CW（航空）',  Math.ceil(cw),           'kg',  'cw')  +
      mkRow('CBM',         cbm.toFixed(4),          'CBM', 'cbm') +
      mkRow('総重量',       Math.round(kg),          'kg',  'kg')  +
      mkRow('個数',         pcs,                    'pcs', 'pcs');
  }

  function doReflect(key, value) {
    const sel   = document.getElementById(`refl-sel-${key}`);
    const rowId = sel?.value;
    if (!rowId) { alert('反映先の行を選択してください'); return; }
    const qtyEl = document.getElementById(`pq-${rowId}`);
    if (qtyEl) {
      qtyEl.value = value;
      onPay(parseInt(rowId));
      sel.value = '';
      qtyEl.classList.add('flash-reflect');
      setTimeout(() => qtyEl.classList.remove('flash-reflect'), 900);
    }
  }

  // 計算結果を「貨物情報」の重量・容積に上書き反映
  function reflectToCargoInfo() {
    if (!_lastCalcResult) {
      showToast('⚠️ まず「📐 計算する」を実行してください', 'warn');
      return;
    }
    const { totalCBM, totalKg } = _lastCalcResult;
    const wEl = document.getElementById('cond-weight');
    const vEl = document.getElementById('cond-volume');
    if (wEl) {
      wEl.value = `${totalKg.toLocaleString()} kg`;
      wEl.classList.add('flash-reflect');
      setTimeout(() => wEl.classList.remove('flash-reflect'), 900);
    }
    if (vEl) {
      vEl.value = `${totalCBM.toFixed(3)} CBM`;
      vEl.classList.add('flash-reflect');
      setTimeout(() => vEl.classList.remove('flash-reflect'), 900);
    }
    showToast('📦 貨物情報の重量・容積を更新しました', 'success');
  }
