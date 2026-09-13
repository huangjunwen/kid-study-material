(function(){
  var P = window.PAGE;
  var S = 0, N = P.steps.length;
  var dotsEl = document.getElementById('dots');
  for (var i = 0; i < N; i++) {
    var d = document.createElement('div'); d.className = 'dot'; dotsEl.appendChild(d);
  }
  var dots = dotsEl.children;
  var barsEl = document.getElementById('bars');
  var rows = [];
  P.bars.forEach(function(row){
    var wrap = document.createElement('div'); wrap.className = 'barrow';
    var nm = document.createElement('div'); nm.className = 'barname'; nm.textContent = row.name;
    var bar = document.createElement('div'); bar.className = 'bar';
    var segList = [];
    (row.segs || []).forEach(function(seg){
      var el = document.createElement('div');
      el.className = 'seg ' + (seg.cls || 'c-blue');
      if (seg.label) el.title = seg.label;
      bar.appendChild(el);
      segList.push({ el: el, seg: seg });
    });
    wrap.appendChild(nm); wrap.appendChild(bar); barsEl.appendChild(wrap);
    rows.push({ row: row, wrap: wrap, segs: segList });
  });
  var groupsEl = document.getElementById('groups');
  if (P.groups) {
    P.groups.forEach(function(g){
      var c = document.createElement('div'); c.className = 'gchip ' + g.cls;
      c.textContent = g.name; groupsEl.appendChild(c);
    });
  } else { groupsEl.style.display = 'none'; }
  function render(){
    document.getElementById('stepbadge').textContent = '第 ' + (S + 1) + ' / ' + N + ' 步';
    for (var i = 0; i < N; i++) dots[i].classList.toggle('on', i <= S);
    var st = P.steps[S];
    var html = '';
    st.eq.forEach(function(l){ html += '<div class="eqline">' + l + '</div>'; });
    if (st.note) html += '<div class="eqnote">' + st.note + '</div>';
    document.getElementById('eq').innerHTML = html;
    rows.forEach(function(r){
      var rf = r.row.from || 0, rt = (r.row.to == null ? 1e9 : r.row.to);
      var rowVis = S >= rf && S <= rt;
      r.wrap.style.display = rowVis ? '' : 'none';
      if (!rowVis) return;
      function isMark(seg){ return /c-dash|c-cut/.test(seg.cls); }
      var plainThin = r.segs.some(function(o){ return !isMark(o.seg) && o.seg.w < 42; });
      r.segs.forEach(function(o){
        var seg = o.seg;
        var f = seg.from || 0, t = (seg.to == null ? 1e9 : seg.to);
        var vis = S >= f && S <= t;
        o.el.style.width = vis ? seg.w + 'px' : '0px';
        o.el.style.opacity = vis ? 1 : 0;
        var txt = seg.label || '';
        if (seg.alt && S >= seg.alt.from) txt = seg.alt.text;
        var sink = isMark(seg) || plainThin;
        if (vis && txt && sink) {
          o.el.classList.add('thin');
          o.el.innerHTML = '<span class="slbl">' + txt + '</span>';
          var bg = getComputedStyle(o.el).backgroundColor;
          o.el.firstChild.style.color = (bg === 'rgb(255, 255, 255)' || bg === 'rgba(0, 0, 0, 0)') ? '#e53935' : bg;
        } else {
          o.el.classList.remove('thin');
          o.el.textContent = vis ? txt : '';
        }
      });
    });
    var ans = document.getElementById('ans');
    if (P.answer) {
      ans.classList.toggle('on', S === N - 1);
      ans.innerHTML = '<span class="abtn">🎉 ' + P.answer + '</span>';
    }
    document.getElementById('prev').disabled = S === 0;
    document.getElementById('next').disabled = S === N - 1;
    document.getElementById('next').innerHTML = S === N - 1
      ? '<span class="btx">完成</span><span class="bic">✓</span>'
      : '<span class="btx">下一步</span><span class="bic">▶</span>';
  }
  document.getElementById('next').onclick = function(){ if (S < N - 1) { S++; render(); } };
  document.getElementById('prev').onclick = function(){ if (S > 0) { S--; render(); } };
  document.addEventListener('keydown', function(e){
    if (e.key === 'ArrowRight' && S < N - 1) { S++; render(); }
    if (e.key === 'ArrowLeft' && S > 0) { S--; render(); }
  });
  render();
})();
