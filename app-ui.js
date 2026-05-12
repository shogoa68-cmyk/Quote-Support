// ========== UI・共通 (app-ui.js) ==========

  // ========== リマーク欄 ==========
  const PRESETS = [
    { label: '📅 有効期限',        text: '本見積もりの有効期限は発行日より30日間とします。' },
    { label: '💱 為替変動',        text: '外貨建て料金は見積もり時の為替レートを基準としており、船積み時のレートにより変動します。' },
    { label: '⛽ 燃油サーチャージ', text: '燃油サーチャージ（BAF/FAF）は市況により変動します。適用時点のレートを別途申し受けます。' },
    { label: '🚢 スペース確保',     text: '船腹・航空スペースの確保は保証できません。手配状況により変更となる場合があります。' },
    { label: '📦 重量・容積',      text: '運賃はW/Mの高い方を適用します（海上：1CBM＝1,000kg、航空：1CBM＝167kg）。' },
    { label: '🛃 通関費用',        text: '通関費用・関税・消費税等は本見積もりに含まれておりません。' },
    { label: '🛡️ 貨物保険',       text: '貨物保険料は含まれておりません。付保をご希望の場合は別途ご相談ください。' },
    { label: '⚓ 港湾混雑',        text: '港湾混雑・ストライキ・天災等による遅延・追加費用は含まれておりません。' },
    { label: '☣️ 危険品',         text: '危険品・温度管理貨物・特殊貨物については別途ご相談ください。条件が異なります。' },
    { label: '🔄 条件変更',        text: '貨物の内容・数量・仕向地等に変更が生じた場合は再見積となります。' },
    { label: '📋 書類締切',        text: 'B/L・AWB等の書類提出締め切りは船会社・航空会社の指定期日に従います。遅延の場合は追加費用が発生します。' },
    { label: '🏦 支払条件',        text: '支払いは請求書発行後30日以内とします。期日を超過した場合、年利○%の遅延損害金が発生します。' },
  ];


  // ----- ユーザー定義プリセット（localStorage） -----
  const USER_REMARK_PRESETS_KEY = 'quoteRemarkUserPresets_v1';
  function getUserRemarkPresets() {
    try { return JSON.parse(localStorage.getItem(USER_REMARK_PRESETS_KEY) || '[]'); }
    catch(e) { return []; }
  }
  function saveUserRemarkPresets(arr) {
    localStorage.setItem(USER_REMARK_PRESETS_KEY, JSON.stringify(arr));
  }

  // 全プリセット = 固定 + ユーザー定義
  function getAllRemarkPresets() {
    return [...PRESETS, ...getUserRemarkPresets().map(p => ({ ...p, _user: true }))];
  }

  function initRemarks() {
    renderRemarkPresets();
    document.getElementById('remarkTextarea').addEventListener('input', updateRemarkChar);
    updateRemarkChar();
  }

  function renderRemarkPresets() {
    const wrap = document.getElementById('presetBtns');
    if (!wrap) return;
    wrap.innerHTML = '';
    const all = getAllRemarkPresets();
    all.forEach((p, i) => {
      const btn = document.createElement('button');
      btn.className = 'preset-btn' + (p._user ? ' preset-btn-user' : '');
      btn.dataset.index = i;
      btn.title = p.text;
      const lbl = document.createElement('span');
      lbl.textContent = p.label;
      btn.appendChild(lbl);
      // ユーザー定義は削除ボタン付き
      if (p._user) {
        const xBtn = document.createElement('span');
        xBtn.className = 'preset-btn-del';
        xBtn.textContent = '✕';
        xBtn.title = 'このプリセットを削除';
        xBtn.onclick = (e) => {
          e.stopPropagation();
          deleteUserRemarkPreset(p.label);
        };
        btn.appendChild(xBtn);
      }
      btn.onclick = () => togglePreset(i, btn);
      wrap.appendChild(btn);
    });
    // 「＋ プリセットを追加」ボタン
    const addBtn = document.createElement('button');
    addBtn.className = 'preset-btn preset-btn-add';
    addBtn.textContent = '＋ プリセットを追加';
    addBtn.onclick = () => addUserRemarkPreset();
    wrap.appendChild(addBtn);
  }

  function addUserRemarkPreset() {
    const label = prompt('プリセットのラベル名を入力してください（例：📄 特別条件）');
    if (!label || !label.trim()) return;
    const text = prompt('プリセットの本文を入力してください');
    if (!text || !text.trim()) return;
    const arr = getUserRemarkPresets();
    if (arr.some(p => p.label === label.trim())) {
      showToast('⚠️ 同名のラベルが既にあります', 'warn');
      return;
    }
    arr.push({ label: label.trim(), text: text.trim() });
    saveUserRemarkPresets(arr);
    renderRemarkPresets();
    showToast(`✅ 「${label.trim()}」を追加しました`, 'success');
  }

  function deleteUserRemarkPreset(label) {
    if (!confirm(`「${label}」を削除しますか？`)) return;
    const arr = getUserRemarkPresets().filter(p => p.label !== label);
    saveUserRemarkPresets(arr);
    renderRemarkPresets();
    showToast(`🗑️ 「${label}」を削除しました`, 'info');
  }

  function togglePreset(i, btn) {
    const ta = document.getElementById('remarkTextarea');
    const all = getAllRemarkPresets();
    const text = all[i]?.text;
    if (!text) return;
    if (btn.classList.contains('active')) {
      ta.value = ta.value.split('\n').filter(l => l.trim() !== text.trim()).join('\n').replace(/^\n+|\n+$/g, '');
      btn.classList.remove('active');
    } else {
      const cur = ta.value.trim();
      ta.value = cur ? cur + '\n' + text : text;
      btn.classList.add('active');
    }
    updateRemarkChar();
  }

  function clearRemark() {
    if (!confirm('リマーク欄をクリアしますか？')) return;
    document.getElementById('remarkTextarea').value = '';
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    updateRemarkChar();
  }

  function updateRemarkChar() {
    document.getElementById('remarkChar').textContent =
      `${document.getElementById('remarkTextarea').value.length}文字`;
  }


  function getRemarkText() {
    return document.getElementById('remarkTextarea')?.value.trim() || '';
  }

  function csvEsc(v) {
    const s = String(v == null ? '' : v);
    return (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r'))
      ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function fmtRaw(n) {
    if (isNaN(n) || n === null) return '';
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
  }

  function escHtml(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ========== 初期化 ==========
  initRemarks();
  addCalcRow();  // サイズ計算：初期行
  addRow();      // 見積もり：初期行
  initFormulaInputs();    // フォーミュラ評価初期化
  // 自動保存の復元
  const savedAutoSave = localStorage.getItem('autoSaveEnabled');
  if (savedAutoSave === '1') {
    autoSaveEnabled = true;
    const chk = document.getElementById('autoSaveChk');
    if (chk) chk.checked = true;
  }
  // Tabで行追加 設定の復元（デフォルト ON）
  const savedTabAdd = localStorage.getItem('tabAddEnabled');
  if (savedTabAdd === '0') {
    tabAddEnabled = false;
    const chk = document.getElementById('tabAddChk');
    if (chk) chk.checked = false;
  }
  // 自動保存データがある場合、復元バナーを表示
  if (localStorage.getItem('quoteData')) {
    const bar = document.getElementById('autosave-restore-bar');
    if (bar) setTimeout(() => bar.classList.add('show'), 600);
  }

  // ========== トースト通知 ==========
  function showToast(msg, type = 'info', duration = 2800) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = msg;
    container.appendChild(el);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.add('visible'));
    });
    setTimeout(() => {
      el.classList.remove('visible');
      setTimeout(() => el.remove(), 320);
    }, duration);
  }

  // ========== コマンドパレット ==========
  const CMD_LIST = [
    { icon:'🗂️', label:'管理番号入力セクションへ',  sub:'REF # / 引き合い元 / 担当',     action:() => scrollToSection('section-ref')   },
    { icon:'🚢', label:'引き合い条件セクションへ',   sub:'作業範囲・ルート・インコタームズ', action:() => scrollToSection('section-cond')  },
    { icon:'📦', label:'貨物情報・サイズ計算セクションへ', sub:'貨物名・CBM・RT・CW 自動計算', action:() => scrollToSection('section-cargo') },
    { icon:'💴', label:'見積もり表セクションへ',      sub:'費用行の入力・集計',              action:() => scrollToSection('section-table') },
    { icon:'📋', label:'特記事項セクションへ',        sub:'フリーテキスト欄',               action:() => scrollToSection('section-free')  },
    { icon:'📝', label:'条件・リマークセクションへ',  sub:'プリセット文を挿入',             action:() => scrollToSection('section-remark')},
    { icon:'➕', label:'行を追加',                    sub:'見積もり表に新しい行を末尾に追加', action:() => { addRow(); showToast('✅ 行を追加しました', 'success'); } },
    { icon:'↕️', label:'カテゴリ順に並び替え',        sub:'カテゴリ種別でソート',            action:() => { sortByCategory(); showToast('✅ ソートしました', 'success'); } },
    { icon:'👁️', label:'プレビューを開く',            sub:'印刷・コピー用のプレビュー',      action: openPreview },
    { icon:'🗂️', label:'プリセット/一時保存',         sub:'入力パターンの保存・呼び出し・一時退避', action: openPresetMgr },
    { icon:'⬇',  label:'CSV ダウンロード',            sub:'見積もり行をCSVファイルとして保存', action: downloadCSV },
    { icon:'🔀', label:'カテゴリ順にソート',          sub:'カテゴリ種別でテーブルを並び替え', action: sortByCategory },
    { icon:'🗑️', label:'全行リセット',               sub:'見積もり表の全行を削除してリセット', action: resetAll },
  ];
  let _cmdActiveIdx = -1;
  let _cmdFiltered  = CMD_LIST;

  function openCmdPalette() {
    const pal = document.getElementById('cmdPalette');
    pal.classList.add('open');
    const inp = document.getElementById('cmdInput');
    inp.value = '';
    _cmdFiltered = CMD_LIST;
    _cmdActiveIdx = 0;
    renderCmdList();
    setTimeout(() => inp.focus(), 40);
  }

  function closeCmdPalette() {
    document.getElementById('cmdPalette').classList.remove('open');
    _cmdActiveIdx = -1;
  }

  function filterCmd() {
    const q = document.getElementById('cmdInput').value.toLowerCase().trim();
    _cmdFiltered = q
      ? CMD_LIST.filter(c =>
          c.label.toLowerCase().includes(q) ||
          (c.sub || '').toLowerCase().includes(q))
      : CMD_LIST;
    _cmdActiveIdx = _cmdFiltered.length ? 0 : -1;
    renderCmdList();
  }

  function renderCmdList() {
    const el = document.getElementById('cmdList');
    if (!_cmdFiltered.length) {
      el.innerHTML = '<div class="cmd-empty">コマンドが見つかりません</div>';
      return;
    }
    el.innerHTML = _cmdFiltered.map((c, i) => `
      <div class="cmd-item${i === _cmdActiveIdx ? ' active' : ''}"
           onclick="execCmdByFiltered(${i})">
        <span class="cmd-icon">${c.icon}</span>
        <div style="flex:1">
          <div class="cmd-label">${c.label}</div>
          ${c.sub ? `<div class="cmd-sub">${escHtml(c.sub)}</div>` : ''}
        </div>
      </div>`).join('');
  }

  function execCmdByFiltered(idx) {
    if (_cmdFiltered[idx]) {
      _cmdFiltered[idx].action();
      closeCmdPalette();
    }
  }

  function cmdKeydown(e) {
    const len = _cmdFiltered.length;
    if (!len) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      _cmdActiveIdx = (_cmdActiveIdx + 1) % len;
      renderCmdList();
      document.querySelectorAll('#cmdList .cmd-item')[_cmdActiveIdx]
        ?.scrollIntoView({ block:'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      _cmdActiveIdx = (_cmdActiveIdx - 1 + len) % len;
      renderCmdList();
      document.querySelectorAll('#cmdList .cmd-item')[_cmdActiveIdx]
        ?.scrollIntoView({ block:'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      execCmdByFiltered(_cmdActiveIdx);
    } else if (e.key === 'Escape') {
      closeCmdPalette();
    }
  }

  function scrollToSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (!el) return;
    el.scrollIntoView({ behavior:'smooth', block:'start' });
    const prev = el.style.outline;
    el.style.transition = 'outline .2s';
    el.style.outline = '2px solid #3498db';
    setTimeout(() => { el.style.outline = prev || ''; }, 1400);
  }

  // ========== フォーミュラ評価（ペースト時に計算式を自動評価） ==========
  function safeEvalExpr(expr) {
    try {
      const clean = String(expr).replace(/[^0-9+\-*/.() ]/g, '').trim();
      if (!clean || !/[+\-*/]/.test(clean)) return null;
      // eslint-disable-next-line no-new-func
      const result = Function('"use strict"; return (' + clean + ')')();
      return (typeof result === 'number' && isFinite(result)) ? result : null;
    } catch(e) { return null; }
  }

  function initFormulaInputs() {
    document.addEventListener('paste', function(e) {
      const el = e.target;
      if (el.type !== 'number') return;
      if (!el.closest('#tableBody, #calcBody')) return;
      const text = (e.clipboardData || window.clipboardData).getData('text').trim();
      const result = safeEvalExpr(text);
      if (result !== null) {
        e.preventDefault();
        el.value = parseFloat(result.toFixed(6));
        el.dispatchEvent(new Event('input', { bubbles: true }));
        showToast('🧮 ' + text + ' = ' + result.toLocaleString('ja-JP', {maximumFractionDigits:4}), 'info');
      }
    });
  }

  // ========== 処理済みマーク ==========
  function toggleDone(id) {
    const btn = document.getElementById('done-' + id);
    const tr  = document.getElementById('row-' + id);
    if (!btn || !tr) return;
    const isDone = btn.classList.toggle('done');
    tr.classList.toggle('row-done', isDone);
    showToast(isDone ? '✅ 処理済みにしました' : '↩ 未処理に戻しました',
              isDone ? 'success' : 'info', 1800);
  }

  // ========== プリセット管理 ==========
  const PRESET_KEY = 'quotePresets_v1';

  // 管理番号入力欄からデフォルトプリセット名を作る
  function _buildDefaultPresetName() {
    const ref      = (document.getElementById('qf-ref')?.value      || '').trim();
    const customer = (document.getElementById('qf-customer')?.value || '').trim();
    const person   = (document.getElementById('qf-person')?.value   || '').trim();
    const parts = [ref, customer, person].filter(Boolean);
    if (parts.length) return parts.join('_');
    // 全部空なら日付ベース
    return '一時保存_' + new Date().toISOString().slice(0,10).replace(/-/g, '');
  }

  function openPresetMgr() {
    renderPresetList();
    document.getElementById('presetMgrModal').classList.add('open');
    // 名前欄を管理番号入力欄から常に自動生成（管理番号の入力情報を優先反映）
    const input = document.getElementById('presetNameInput');
    if (input) {
      input.value = _buildDefaultPresetName();
    }
    setTimeout(() => { input?.focus(); input?.select(); }, 50);
  }

  function closePresetMgr() {
    document.getElementById('presetMgrModal').classList.remove('open');
  }

  function getPresets() {
    try { return JSON.parse(localStorage.getItem(PRESET_KEY) || '[]'); }
    catch(e) { return []; }
  }

  function savePresetsToStorage(presets) {
    localStorage.setItem(PRESET_KEY, JSON.stringify(presets));
  }

  function savePreset() {
    let name = document.getElementById('presetNameInput')?.value.trim();
    if (!name) {
      // 名前空なら自動生成
      name = _buildDefaultPresetName();
    }
    const presets = getPresets();
    const data    = gatherAllData();
    // 同名プリセットの確認 → 上書き
    const existingIdx = presets.findIndex(p => p.name === name);
    if (existingIdx >= 0) {
      if (!confirm(`「${name}」が既にあります。上書き保存しますか？`)) return;
      presets[existingIdx] = { name, data, ts: new Date().toISOString() };
      savePresetsToStorage(presets);
      document.getElementById('presetNameInput').value = '';
      renderPresetList();
      showToast(`💾 「${name}」を上書き保存しました`, 'success');
      return;
    }
    if (presets.length >= 10) {
      showToast('⚠️ プリセットは最大10件です（既存と同名にすると上書きできます）', 'warning');
      return;
    }
    presets.unshift({ name, data, ts: new Date().toISOString() });
    savePresetsToStorage(presets);
    document.getElementById('presetNameInput').value = '';
    renderPresetList();
    showToast(`💾 「${name}」を保存しました`, 'success');
  }

  function loadPreset(idx) {
    const presets = getPresets();
    const preset  = presets[idx];
    if (!preset) return;
    if (!confirm('「' + preset.name + '」を読み込みますか？\n現在の入力内容は上書きされます。')) return;
    // フォーム復元
    Object.entries(preset.data.fields || {}).forEach(([id, v]) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.type === 'checkbox') el.checked = v;
      else el.value = v;
    });
    document.getElementById('tableBody').innerHTML = '';
    rowCount = 0;
    (preset.data.rows || []).forEach(() => addRow());
    const trs = document.querySelectorAll('#tableBody tr');
    (preset.data.rows || []).forEach((cells, i) => {
      if (!trs[i]) return;
      const rowId = trs[i].id.replace('row-', '');
      trs[i].querySelectorAll('input, select, textarea').forEach((el, j) => {
        if (cells[j] !== undefined) el.value = cells[j];
      });
      // グレーアウト・カテゴリ色・計算を正しく反映
      checkUnfilled(rowId);
      onCatChange(rowId);
      onPay(rowId);
    });
    updateTotals();
    calcLiveUpdate();
    updateRouteModeIcon();
    closePresetMgr();
    showToast('📂 「' + preset.name + '」を読み込みました', 'success');
  }

  function deletePreset(idx) {
    const presets = getPresets();
    const name    = presets[idx]?.name || '';
    if (!confirm('「' + name + '」を削除しますか？')) return;
    presets.splice(idx, 1);
    savePresetsToStorage(presets);
    renderPresetList();
    showToast('🗑️ 「' + name + '」を削除しました', 'info');
  }

  function renderPresetList() {
    const presets = getPresets();
    const wrap    = document.getElementById('presetListWrap');
    if (!wrap) return;
    if (!presets.length) {
      wrap.innerHTML = '<div class="preset-empty">保存済みのプリセットはありません<br><small style="color:#bbb;">上のフォームから保存できます</small></div>';
      return;
    }
    wrap.innerHTML = presets.map((p, i) => {
      const ts = p.ts
        ? new Date(p.ts).toLocaleString('ja-JP', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' })
        : '';
      return '<div class="preset-list-item">' +
        '<span class="preset-list-name">' + escHtml(p.name) + '</span>' +
        '<span class="preset-list-ts">'   + ts + '</span>' +
        '<button class="btn-preset-load" onclick="loadPreset(' + i + ')">読み込む</button>' +
        '<button class="btn-preset-del"  onclick="deletePreset(' + i + ')" title="削除">✕</button>' +
        '</div>';
    }).join('');
  }

  // ========== ファイル出力・読込 ==========

  function exportToFile() {
    // 基本データ収集
    const base = gatherAllData();

    // doneボタン状態を収集（行ID → true/false）
    const doneStates = {};
    document.querySelectorAll('#tableBody tr').forEach(tr => {
      const btn = tr.querySelector('.done-btn');
      if (btn) {
        const id = btn.id.replace('done-', '');
        doneStates[id] = btn.classList.contains('done');
      }
    });

    // calc行データを収集（IDがなくクラスのみのため個別取得）
    const calcRows = [];
    document.querySelectorAll('#calcBody tr').forEach(tr => {
      calcRows.push({
        pcs: tr.querySelector('.calc-pcs')?.value ?? '',
        pkg: tr.querySelector('.calc-pkg')?.value ?? '',
        l:   tr.querySelector('.calc-l')?.value   ?? '',
        w:   tr.querySelector('.calc-w')?.value   ?? '',
        h:   tr.querySelector('.calc-h')?.value   ?? '',
        kg:  tr.querySelector('.calc-kg')?.value  ?? '',
        stack: tr.querySelector('.calc-stack')?.value ?? ''
      });
    });

    // ファイル名生成（REF_引き合い元_担当.json）
    const fname = buildFileName('json');

    const payload = {
      _version: 1,
      _app: '見積支援ツール',
      exportedAt: new Date().toISOString(),
      fields: base.fields,
      rows: base.rows,
      doneStates,
      calcRows
    };

    // ダウンロード
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = fname;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📤 ファイルを出力しました: ' + fname, 'success');
  }

  function importFromFile(event) {
    const file = event.target.files[0];
    event.target.value = ''; // 同じファイルの再選択を可能にする
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      showToast('⚠️ .json ファイルを選択してください', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      let data;
      try { data = JSON.parse(e.target.result); }
      catch(err) { alert('ファイルの読み込みに失敗しました。\n' + err.message); return; }

      if (!data._version || data._app !== '見積支援ツール') {
        if (!confirm('このファイルは見積支援ツール以外から作成された可能性があります。\n続行しますか？')) return;
      }

      const exportedAt = data.exportedAt
        ? new Date(data.exportedAt).toLocaleString('ja-JP')
        : '不明';
      if (!confirm('出力日時: ' + exportedAt + '\n\n現在のデータを上書きして読み込みますか？')) return;

      // ---- フォーム復元 ----
      Object.entries(data.fields || {}).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.type === 'checkbox') el.checked = val;
        else el.value = val;
      });

      // ---- 見積テーブル行復元 ----
      document.getElementById('tableBody').innerHTML = '';
      rowCount = 0;
      (data.rows || []).forEach(() => addRow());
      const trs = document.querySelectorAll('#tableBody tr');
      (data.rows || []).forEach((cells, i) => {
        if (!trs[i]) return;
        trs[i].querySelectorAll('input, select, textarea').forEach((el, j) => {
          if (cells[j] !== undefined) el.value = cells[j];
        });
      });

      // ---- doneボタン状態復元 ----
      Object.entries(data.doneStates || {}).forEach(([rowId, isDone]) => {
        const btn = document.getElementById('done-' + rowId);
        if (!btn) return;
        if (isDone) {
          btn.classList.add('done');
          btn.closest('tr')?.classList.add('row-done');
        } else {
          btn.classList.remove('done');
          btn.closest('tr')?.classList.remove('row-done');
        }
      });

      // ---- calc行復元 ----
      document.getElementById('calcBody').innerHTML = '';
      calcRowCount = 0;
      (data.calcRows || []).forEach(row => {
        addCalcRow();
        const tr = document.getElementById('calcBody').lastElementChild;
        if (!tr) return;
        if (row.pcs !== '') tr.querySelector('.calc-pcs').value   = row.pcs;
        if (row.pkg)        tr.querySelector('.calc-pkg').value   = row.pkg;
        if (row.l   !== '') tr.querySelector('.calc-l').value     = row.l;
        if (row.w   !== '') tr.querySelector('.calc-w').value     = row.w;
        if (row.h   !== '') tr.querySelector('.calc-h').value     = row.h;
        if (row.kg  !== '') tr.querySelector('.calc-kg').value    = row.kg;
        if (row.stack)      tr.querySelector('.calc-stack').value = row.stack;
      });

      // ---- グレーアウト状態更新 ----
      document.querySelectorAll('#tableBody tr').forEach(tr => {
        const nm = tr.querySelector('[data-field="nm"]');
        if (nm) checkUnfilled(nm.id.replace('nm-', ''));
      });
      // ---- UI更新 ----
      updateTotals();
      calcLiveUpdate();
      updateRouteModeIcon();
      showToast('📥 ファイルを読み込みました', 'success');
      showSaveStatus('📥 ファイル読込完了');
    };
    reader.readAsText(file, 'utf-8');
  }

  // ========== スコーププリセット ダイアログ ==========

  function openScopePresetDlg(scope) {
    _presetPendingScope = scope;
    const presets = SCOPE_PRESETS[scope] || [];
    const scopeLabels = {
      domestic: '🏠 国内のみ',
      export:   '📤 輸出',
      import:   '📥 輸入',
      dtd:      '🌐 Door to Door',
    };
    const title = document.getElementById('scopePresetTitle');
    if (title) title.textContent = '📋 ' + (scopeLabels[scope] || scope) + ' — プリセットを挿入しますか？';

    // プリセット内容リストを生成
    const itemsEl = document.getElementById('scopePresetItems');
    if (itemsEl) {
      itemsEl.innerHTML = presets.map((p, i) =>
        (i + 1) + '. ' + (CATEGORIES.find(c => c.value === p.cat)?.label || p.cat) + ' ／ ' + p.name +
        (p.note ? ' (' + p.note + ')' : '')
      ).join('<br>');
    }

    const modal = document.getElementById('scopePresetModal');
    if (modal) modal.classList.add('open');
  }

  function closeScopePresetDlg() {
    const modal = document.getElementById('scopePresetModal');
    if (modal) modal.classList.remove('open');
    _presetPendingScope = '';
  }

  function applyScopePreset(mode) {
    const scope = _presetPendingScope;
    const presets = SCOPE_PRESETS[scope];
    closeScopePresetDlg();
    if (!presets || presets.length === 0) return;

    if (mode === 'replace') {
      // テーブルをクリアして置換
      document.getElementById('tableBody').innerHTML = '';
      rowCount = 0;
    }

    // 最後の行の通貨を引き継ぐ（追加モード時）
    let lastCur = 'JPY';
    const lastSelect = document.querySelector('#tableBody tr:last-child [id^="pc-"]');
    if (lastSelect) lastCur = lastSelect.value || 'JPY';

    presets.forEach(item => {
      rowCount++;
      const id = rowCount;
      const tbody = document.getElementById('tableBody');
      const tr = document.createElement('tr');
      tr.id = 'row-' + id;
      tr.replaceChildren(buildRowHTML(id, item.cat, lastCur));
      tbody.appendChild(tr);

      // 品名・備考を設定
      const nmEl = document.getElementById('nm-' + id);
      if (nmEl) nmEl.value = item.name;
      const ntEl = document.getElementById('nt-' + id);
      if (ntEl) ntEl.value = item.note || '';

      // カテゴリ変更・計算を初期化
      if (typeof onCatChange === 'function') onCatChange(id);
      if (typeof onPay     === 'function') onPay(id);
      if (typeof initDrag  === 'function') initDrag(tr);
    });

    updateTotals();
    const modeLabel = mode === 'replace' ? '置換' : '追加';
    showToast('✅ プリセット' + modeLabel + '完了（' + presets.length + '行）', 'success');
  }

  // ========== キーボードショートカット ==========
  document.addEventListener('keydown', function(e) {
    // Ctrl+K / Cmd+K → コマンドパレット
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const pal = document.getElementById('cmdPalette');
      pal.classList.contains('open') ? closeCmdPalette() : openCmdPalette();
    }
    // Escape → 開いているモーダルをすべて閉じる
    if (e.key === 'Escape') {
      if (document.getElementById('cmdPalette')?.classList.contains('open'))     closeCmdPalette();
      if (document.getElementById('presetMgrModal')?.classList.contains('open')) closePresetMgr();
      if (document.getElementById('previewOverlay')?.classList.contains('open')) closePreview();
      if (document.getElementById('fbOverlay')?.classList.contains('open'))      closeFeedback();
    }
  });
