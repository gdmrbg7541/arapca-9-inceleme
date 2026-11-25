/* ============================================================
   ARAYÜZ ARAKOM (24.10.2026)
   Öğretmen: "sonradan eklediklerimizde arakom yazısı olmayan yazıları
   var, onları klasördeki arakom tipiyle görelim". Kitap sitenin içinde
   (kidefarapca.com/kitap/…) açılınca sitenin arakom-arayuz.css'i yüklenir:
   araç çubuğu, paneller, pencereler, kalem takımı, deneme hakları Arakom;
   kitap sayfaları (.sahne) kendi yazı tipinde kalır. Bilgisayara
   indirilmiş kopyada (file://) değişiklik yok.
   ============================================================ */
(function () {
  'use strict';
  if (location.protocol === 'file:' || window.KITAP_INCELEME || document.getElementById('arakomArayuz')) return;
  var yol = location.pathname, i = yol.indexOf('/kitap/');
  if (i < 0) return;
  var l = document.createElement('link');
  l.id = 'arakomArayuz';
  l.rel = 'stylesheet';
  l.href = yol.slice(0, i + 1) + 'arakom-arayuz.css?v=06c07a30';
  (document.head || document.documentElement).appendChild(l);
})();

/* ============================================================
   YAN ARAÇ ÇUBUĞU — üstteki şeridi sola taşır              02.10.2026
   Öğretmen: "kitap iki sayfa açıkken çok küçük duruyor, yukardaki tüm
   araç çubukları sola alalım kitap seçme kısmının altına, açılıp
   kapanabilir olsun."

   Biçimin tamamı kitapyan.css'te; burada yalnız üç iş var:
     1) <html>'e "yanli" sınıfı — CSS devreye girer (yalnız ≥760 px'te),
     2) alttaki şeridin içi (ünite/ders bilgisi, ilerleme çizgisi, sayaç,
        "sayfaya git") yan çubuğun altına taşınır, alt şerit kalkar;
        yakınlaştırma üçlüsü bir kutuya girer, yazısız düğmelere
        aria-label'dan yazı eklenir,
     3) en alta aç/kapat düğmesi (Y tuşu da yapar), seçim hatırlanır.
   Dört kitapta da aynı sınıf adları kullanıldığı için tek dosya yetiyor.
   ============================================================ */
(function () {
  'use strict';
  var ANAHTAR = 'kitap_yanDar';

  var IK_KAPAT = '<svg viewBox="0 0 24 24"><path d="M14.5 7.5 10 12l4.5 4.5"/>' +
    '<path d="M4 4v16"/></svg>';

  function yaz(el, metin) {
    var s = document.createElement('span');
    s.className = 'yan-et';
    s.textContent = metin;
    el.appendChild(s);
  }

  /* aria-label'ı uzun olan birkaç düğme için kısa ad (yan çubuğa sığsın) */
  var KISA = {
    tIpucu: 'Düğmeler', tTamEkran: 'Tam ekran', tUzaklas: 'Uzaklaş', tYaklas: 'Yaklaş',
    tYardim: 'Yardım', tNasil: 'Nasıl kullanılır'
  };

  /* title'daki "(I)" gibi kısayol ekini at: "İçindekiler (I)" → "İçindekiler" */
  function etiket(b) {
    if (b.id && KISA[b.id]) return KISA[b.id];
    var t = b.getAttribute('aria-label') || b.getAttribute('title') || '';
    t = t.replace(/\s*\([^)]*\)\s*$/, '').trim();
    return t.length > 17 ? t.split(/[\/,]/)[0].trim() : t;   /* "Düğmeleri göster/gizle" gibi */
  }

  function kur() {
    var ust = document.querySelector('.ust');
    var araclar = ust && ust.querySelector('.araclar');
    if (!ust || !araclar || ust.dataset.yanli) return;
    ust.dataset.yanli = '1';
    document.documentElement.classList.add('yanli');

    /* 1 — alt şeridin içi yan çubuğa: ünite/ders, ilerleme çizgisi, sayfaya git
           (öğretmen: "aşağıdaki ilerleme çizgisini de sola alalım daha kısa olsun")
           Alt şerit boşalınca CSS onu kaldırıyor, kitap o 44 px'i de kazanıyor.
           DAR EKRANDA (telefon) yan çubuk yok: parçalar eski yerine döner,
           yoksa üst şeride sığmayıp taşıyorlar. */
    var alt = document.querySelector('.alt');
    var ilerleme = document.createElement('div');
    ilerleme.className = 'yan-ilerleme';
    ust.appendChild(ilerleme);

    var tasinir = [];                       /* {el, anne, komsu} — eski yeri */
    ['.konum', '.kaydirac', '.git'].forEach(function (se) {
      var n = (ust.querySelector(se) || (alt && alt.querySelector(se)));
      if (n) tasinir.push({ el: n, anne: n.parentNode, komsu: n.nextSibling });
    });

    function yerlestir(yan) {
      tasinir.forEach(function (k) {
        if (yan) {
          if (k.el.parentNode !== ilerleme) ilerleme.appendChild(k.el);
        } else if (k.el.parentNode !== k.anne) {
          k.anne.insertBefore(k.el, k.komsu);
        }
      });
      if (alt) alt.classList.toggle('yan-bos', !!yan && !!ilerleme.children.length);
    }

    var genis = window.matchMedia('(min-width: 760px)');
    yerlestir(genis.matches);
    var dinle = function (e) { yerlestir(e.matches); window.dispatchEvent(new Event('resize')); };
    if (genis.addEventListener) genis.addEventListener('change', dinle);
    else genis.addListener(dinle);

    /* 2 — yakınlaştırma üçlüsü tek kutuda kalsın */
    var eksi = araclar.querySelector('#tUzaklas'),
        olcu = araclar.querySelector('#zoomEt'),
        arti = araclar.querySelector('#tYaklas');
    if (eksi && arti) {
      var kutu = document.createElement('div');
      kutu.className = 'yan-zoom';
      araclar.insertBefore(kutu, eksi);
      kutu.appendChild(eksi);
      if (olcu) kutu.appendChild(olcu);
      kutu.appendChild(arti);
    }

    /* 3 — yazısız düğmelere yazı */
    araclar.querySelectorAll('.tus').forEach(function (b) {
      if (b.querySelector('span')) return;
      var t = etiket(b);
      if (t) yaz(b, t);
    });

    /* 4 — aç/kapat */
    var d = document.createElement('button');
    d.type = 'button';
    d.className = 'yan-kapat';
    d.innerHTML = IK_KAPAT + '<span>Daralt</span>';
    ust.appendChild(d);

    function uygula(dar, kaydet) {
      document.documentElement.classList.toggle('dar', dar);
      d.title = (dar ? 'Araç çubuğunu genişlet' : 'Araç çubuğunu daralt') + ' (Y)';
      d.setAttribute('aria-label', d.title);
      d.lastChild.textContent = 'Daralt';
      if (kaydet) { try { localStorage.setItem(ANAHTAR, dar ? '1' : '0'); } catch (e) {} }
      /* kitap yeni ene göre yeniden ölçeklensin */
      window.dispatchEvent(new Event('resize'));
    }

    var basla = false;
    try { basla = localStorage.getItem(ANAHTAR) === '1'; } catch (e) {}
    uygula(basla, false);

    d.addEventListener('click', function () {
      uygula(!document.documentElement.classList.contains('dar'), true);
    });

    /* Y: daralt/genişlet — yazı kutusundayken karışmasın */
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var h = document.activeElement;
      if (h && (h.tagName === 'INPUT' || h.tagName === 'TEXTAREA' || h.isContentEditable)) return;
      if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault();
        uygula(!document.documentElement.classList.contains('dar'), true);
      }
    });
  }

  /* ---------- panellerde iki parmakla kaydırma yedeği ----------
     Bazı tarayıcılarda (Safari) panel gövdesi tekerlek/iki parmak
     olayına yanıt vermiyor. Burada olay sonrası bir kare beklenip
     kutunun GERÇEKTEN kayıp kaymadığına bakılıyor; kaymadıysa o kutu
     bundan sonra elle kaydırılıyor. Çalışan tarayıcıda hiçbir şey
     değişmez, momentum bozulmaz. */
  var KUTULAR = '.panel .pgovde, .panel .cevap-alan, .ks-panel .ks-govde, .ust';

  function kaydirabilir(g, d) {
    if (d > 0) return g.scrollTop + g.clientHeight < g.scrollHeight - 1;
    if (d < 0) return g.scrollTop > 1;
    return false;
  }

  function piksel(e) {
    if (e.deltaMode === 1) return e.deltaY * 16;        /* satır */
    if (e.deltaMode === 2) return e.deltaY * 400;       /* sayfa */
    return e.deltaY;
  }

  function kutuKur(g) {
    if (g.dataset.kaydirmaYedegi) return;
    g.dataset.kaydirmaYedegi = '1';
    var elle = false;
    g.addEventListener('wheel', function (e) {
      var d = piksel(e);
      if (!kaydirabilir(g, d)) return;                  /* kenardayız: sayfaya bırak */
      if (elle) {
        e.preventDefault();
        g.scrollTop += d;
        return;
      }
      var onceki = g.scrollTop;
      /* İKİ kare: Safari kaydırmayı kendi katmanında yaptığı için bir kare
         sonra scrollTop henüz değişmemiş olabiliyordu (02.10.2026). */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          if (g.scrollTop === onceki) {                 /* tarayıcı kaydırmadı */
            elle = true;
            g.scrollTop = onceki + d;
          }
        });
      });
    }, { passive: false });
  }

  /* Parmak gövdenin dışındayken (başlık, kenar boşluğu) de gövde kaysın */
  function panelKur(pa) {
    if (pa.dataset.kaydirmaPanel) return;
    pa.dataset.kaydirmaPanel = '1';
    pa.addEventListener('wheel', function (e) {
      var g = pa.querySelector('.pgovde, .cevap-alan, .ks-govde');
      if (!g || g === e.target || g.contains(e.target)) return;   /* gövde kendi dinler */
      var d = piksel(e);
      if (!kaydirabilir(g, d)) return;
      e.preventDefault();
      g.scrollTop += d;
    }, { passive: false });
  }

  function kaydirmaYedegi() {
    document.querySelectorAll(KUTULAR).forEach(kutuKur);
    document.querySelectorAll('.panel, .ks-panel').forEach(panelKur);
  }

  /* paneller sonradan da açılabiliyor (kitap seçici gibi): gözle */
  function gozle() {
    kaydirmaYedegi();
    if (!window.MutationObserver) return;
    new MutationObserver(function () { kaydirmaYedegi(); })
      .observe(document.body, { childList: true, subtree: true });
  }

  /* ---------- ileri/geri oklarının ikizi sol kenarda ----------
     Öğretmen: "ileri geri tuşu sol tarafta da olsun."
     Düğme çoğaltılmıyor, kopyalanıyor: tıklama aslına iletiliyor, pasif
     durumu aslını izliyor. Sayfa çevirme mantığına dokunulmuyor. */
  function okIkizle() {
    if (document.querySelector('.ok.ikiz')) return;
    var ana = document.querySelectorAll('.ok.sol, .ok.sag');
    for (var n = 0; n < ana.length; n++) {
      (function (o) {
        if (o.classList.contains('ikiz')) return;
        var i = o.cloneNode(true);
        i.removeAttribute('id');
        i.classList.add('ikiz');
        i.disabled = o.disabled;
        i.addEventListener('click', function (e) { e.preventDefault(); o.click(); });
        o.parentNode.insertBefore(i, o.nextSibling);
        if (window.MutationObserver) {
          new MutationObserver(function () { i.disabled = o.disabled; })
            .observe(o, { attributes: true, attributeFilter: ['disabled'] });
        }
      })(ana[n]);
    }
  }

  /* ---------- eşler birlikte vurgulansın ----------
     Öğretmen: "bi ileri tuşuna basınca diğerine de basmış gibi vurgu olsun."
     Aynı işi yapan oklar (ileri ↔ ileri, geri ↔ geri) birbirinin
     üzerine gelme/basılma durumunu paylaşıyor. */
  function okEslestir() {
    var hepsi = document.querySelectorAll('.ok.sol, .ok.sag');
    function esleri(o) {
      var tur = o.classList.contains('sag') ? 'sag' : 'sol';
      var d = [];
      for (var i = 0; i < hepsi.length; i++) {
        if (hepsi[i] !== o && hepsi[i].classList.contains(tur)) d.push(hepsi[i]);
      }
      return d;
    }
    function isaret(o, sinif, var_) {
      var d = esleri(o);
      for (var i = 0; i < d.length; i++) d[i].classList[var_ ? 'add' : 'remove'](sinif);
    }
    for (var n = 0; n < hepsi.length; n++) {
      (function (o) {
        if (o.dataset.esli) return;
        o.dataset.esli = '1';
        o.addEventListener('pointerenter', function () { isaret(o, 'es-vurgu', 1); });
        o.addEventListener('focus', function () { isaret(o, 'es-vurgu', 1); });
        ['pointerleave', 'pointercancel', 'blur'].forEach(function (e) {
          o.addEventListener(e, function () { isaret(o, 'es-vurgu', 0); isaret(o, 'es-basili', 0); });
        });
        o.addEventListener('pointerdown', function () { isaret(o, 'es-basili', 1); });
        ['pointerup', 'pointercancel'].forEach(function (e) {
          o.addEventListener(e, function () {
            setTimeout(function () { isaret(o, 'es-basili', 0); }, 130);
          });
        });
      })(hepsi[n]);
    }
  }

  function basla() { kur(); gozle(); okIkizle(); okEslestir(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', basla);
  } else {
    basla();
  }
})();

/* ============================================================
   İNDİR YALNIZ GİRİŞ YAPANLARA                            17.10.2026
   Öğretmen: "flipbooklardaki indir özelliğine siteye giriş yapanlar
   sahip olsun" · 18.10.2026: "siteye giriş yapmayanlara 5-10 arası
   kitapları flipbookları indirme seçeneği görünmesin flipbook
   motorunda".

   Kitap sitenin içinde (kidefarapca.com/kitap/…) açıldığında, siteye
   giriş yapılmamışsa "İndir" düğmesi (flaş/bilgisayar paketi) ve
   Kaynaklar listesindeki tek tek "İndir" bağlantıları HİÇ GÖRÜNMEZ.
   Giriş anlaşılana kadar da gizli durur (bir an görünüp kaybolmaz);
   girişliyse belirir. Giriş yapıp bu sekmeye dönünce kendiliğinden
   görünür. Kitabı okumak, sesleri ve videoları açmak herkese açık.

   Giriş nereden anlaşılıyor: site Firebase'le giriş yapıyor; Firebase
   oturumu aynı sitedeki tarayıcı deposunda tutuyor (IndexedDB
   "firebaseLocalStorageDb", oturumluk girişte sessionStorage). Kitap
   sayfası Firebase'i yüklemeden yalnız orayı okur; misafir (anonim)
   kimlik giriş sayılmaz. Depo yoksa hiçbir şey OLUŞTURULMAZ.
   Bilgisayardan (file://) açılan indirilmiş kopyada gizleme yok.
   KALEM DE YALNIZ GİRİŞ YAPANLARA (24.10.2026) — öğretmen: "flipbooklarda
   öğretmen veya herhangi bi giriş yapmayınca da kalemle yazma özelliği kapalı
   olacaktı": girişsizken Kalem düğmesi görünmez, P kısayolu çalışmaz, açık
   kalem kapanır. Sınıf Ekranı kumandanın kalemini yine gösterir.
   GİRİŞSİZKEN DE DÜĞME, TIKLAYINCA DESTEK (24.10.2026) — öğretmen:
   "flipbooklarda kalem ve indir seçeneği giriş yapılmasada tuş olarak
   görünsün ama giriş yapmayanlar için tıklayınca destek istensin": Kalem ve
   İndir düğmeleri herkese görünür; girişsiz basınca (P de) iş yapılmaz,
   sitenin destek penceresi açılır (sistem/hak.js girisIste: «Giriş yap,
   destek ol», destek isteğe bağlı). Kaynaklardaki tek tek «İndir»
   bağlantıları girişsizken yine gizli.
   ============================================================ */
(function () {
  'use strict';
  if (location.protocol === 'file:' || window.KITAP_INCELEME) return;
  var kok = document.documentElement;
  var izin = null;                                    /* null: henüz bilinmiyor */
  /* başta gizli: giriş anlaşılınca açılır */
  try {
    var st = document.createElement('style');
    st.id = 'ikStil';
    /* 24.10.2026: Kalem ve İndir düğmeleri girişsizken de görünür (basınca destek penceresi) */
    st.textContent = 'html.ik-girissiz a[download]:not([href^="blob:"]):not([href^="data:"]){display:none !important}';
    (document.head || kok).appendChild(st);
  } catch (e) { }
  kok.classList.add('ik-girissiz');

  function depodaVar(depo) {
    try {
      for (var i = 0; i < depo.length; i++) {
        var k = depo.key(i);
        if (k && k.indexOf('firebase:authUser:') === 0) {
          var v = JSON.parse(depo.getItem(k) || 'null');
          if (v && v.uid && !v.isAnonymous) return true;
        }
      }
    } catch (e) { }
    return false;
  }
  function girisVarMi() {
    return new Promise(function (bitir) {
      var oldu = false;
      function son(v) { if (!oldu) { oldu = true; bitir(v); } }
      try { if (depodaVar(window.localStorage) || depodaVar(window.sessionStorage)) return son(true); } catch (e) { }
      if (!window.indexedDB) return son(false);
      setTimeout(function () { son(false); }, 3000);
      var r;
      try { r = indexedDB.open('firebaseLocalStorageDb'); } catch (e) { return son(false); }
      /* depo yoksa açmak onu oluşturur — oluşturmadan vazgeç */
      r.onupgradeneeded = function () { try { r.transaction.abort(); } catch (e) { } };
      r.onerror = function (e) { try { e.preventDefault(); } catch (x) { } son(false); };
      r.onblocked = function () { son(false); };
      r.onsuccess = function () {
        var db = r.result;
        try {
          if (!db.objectStoreNames.contains('firebaseLocalStorage')) { db.close(); return son(false); }
          var c = db.transaction('firebaseLocalStorage', 'readonly').objectStore('firebaseLocalStorage').openCursor();
          c.onsuccess = function () {
            var k = c.result;
            if (!k) { db.close(); return son(false); }
            var x = k.value || {}, v = x.value;
            if (String(x.fbase_key || k.key || '').indexOf('firebase:authUser:') === 0 && v && v.uid && !v.isAnonymous) {
              db.close(); return son(true);
            }
            k.continue();
          };
          c.onerror = function () { db.close(); son(false); };
        } catch (e) { try { db.close(); } catch (x) { } son(false); }
      };
    });
  }

  /* girişsiz: İndir düğmesi ve paketleri iş yapmaz, destek penceresi açılır
     (24.10.2026); kaynaklardaki gizli «İndir» bağlantıları sessizce durur */
  document.addEventListener('click', function (e) {
    if (izin === true || !e.target || !e.target.closest) return;
    var a = e.target.closest('a[download]');
    if (a && /^(blob|data):/i.test(a.getAttribute('href') || '')) a = null;   /* hazırlanan ZIP'in kendisi */
    var d = e.target.closest('#tIndir, #pIndir [data-p]');
    if (d || a) {
      e.preventDefault(); e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      if (d && e.isTrusted) destekIste('kitapIndir');
    }
  }, true);

  /* kalem: girişsizken açılmaz; basınca (P de) destek penceresi (24.10.2026) */
  document.addEventListener('click', function (e) {
    if (izin === true || !e.isTrusted || !e.target || !e.target.closest) return;
    if (e.target.closest('#tKalem, .kk-tus')) {
      e.preventDefault(); e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      destekIste('kitapKalem');
    }
  }, true);
  window.addEventListener('keydown', function (e) {
    if (izin === true || !e.isTrusted || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key !== 'p' && e.key !== 'P') return;
    var h = e.target || {};
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(h.tagName || '') || h.isContentEditable) return;
    e.preventDefault(); e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    if (!e.repeat) destekIste('kitapKalem');
  }, true);
  /* girişsiz basışta sitenin destek penceresi (sistem/hak.js girisIste).
     Giriş henüz anlaşılmadıysa önce o beklenir: girişliyse pencere çıkmaz,
     ikinci basışta düğme her zamanki gibi çalışır. */
  function destekIste(oz) {
    function ac() {
      var H = window.KidefHak;
      if (H && typeof H.girisIste === 'function') { H.girisIste(oz); return; }
      var y = location.pathname, i = y.indexOf('/kitap/');
      try { window.open((i >= 0 ? y.slice(0, i + 1) : '/') + 'index.html#destek', '_blank'); } catch (x) { }
    }
    if (izin === false) { ac(); return; }
    girisVarMi().then(function (v) { izin = v; kok.classList.toggle('ik-girissiz', !v); if (!v) ac(); });
  }
  function kalemKapat() {
    var k = document.getElementById('tKalem');
    if (k && k.getAttribute('aria-pressed') === 'true') { try { k.click(); } catch (x) { } }
  }
  function tazele() {
    girisVarMi().then(function (v) {
      izin = v;
      if (!v) kalemKapat();
      kok.classList.toggle('ik-girissiz', !v);
    });
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) tazele(); });
  window.addEventListener('focus', tazele);
  window.addEventListener('pageshow', tazele);
  tazele();
})();

/* ============================================================
   DENEME HAKLARI (24.10.2026)
   Öğretmen: "kitap flipbook indirme ve kalem kullanma ... bunlarda hak
   verilsin öğretmenlere denemeleri için". Kitap sitenin içinde
   (kidefarapca.com/kitap/…) açıldığında sitenin sistem/hak.js'i yüklenir:
   destek vermeyen öğretmene İndir panelindeki paketlerde ve Kalem'de
   haftada 5 deneme hakkı (düğmede küçük sayı, basınca 5 → 4). Kimin
   girişli olduğu sitenin oturum deposundan okunur (Firebase yüklenmez);
   girişli değilse hiçbir şey sınırlanmaz. Bilgisayara indirilmiş kopyada
   (file://) yok.
   ============================================================ */
(function () {
  'use strict';
  if (location.protocol === 'file:' || window.KITAP_INCELEME) return;
  var yol = location.pathname, i = yol.indexOf('/kitap/');
  if (i < 0) return;
  var kok = yol.slice(0, i + 1);
  function depodan(depo) {
    try {
      for (var j = 0; j < depo.length; j++) {
        var k = depo.key(j);
        if (k && k.indexOf('firebase:authUser:') === 0) {
          var v = JSON.parse(depo.getItem(k) || 'null');
          if (v && v.uid && !v.isAnonymous) return v.uid;
        }
      }
    } catch (e) { }
    return '';
  }
  function hesap() {
    return new Promise(function (bitir) {
      var oldu = false;
      function son(v) { if (!oldu) { oldu = true; bitir(v || ''); } }
      var y = '';
      try { y = depodan(window.localStorage) || depodan(window.sessionStorage); } catch (e) { }
      if (y) return son(y);
      if (!window.indexedDB) return son('');
      setTimeout(function () { son(''); }, 3000);
      var r;
      try { r = indexedDB.open('firebaseLocalStorageDb'); } catch (e) { return son(''); }
      r.onupgradeneeded = function () { try { r.transaction.abort(); } catch (e) { } };
      r.onerror = function (e) { try { e.preventDefault(); } catch (x) { } son(''); };
      r.onblocked = function () { son(''); };
      r.onsuccess = function () {
        var db = r.result;
        try {
          if (!db.objectStoreNames.contains('firebaseLocalStorage')) { db.close(); return son(''); }
          var c = db.transaction('firebaseLocalStorage', 'readonly').objectStore('firebaseLocalStorage').openCursor();
          c.onsuccess = function () {
            var k = c.result;
            if (!k) { db.close(); return son(''); }
            var x = k.value || {}, v = x.value;
            if (String(x.fbase_key || k.key || '').indexOf('firebase:authUser:') === 0 && v && v.uid && !v.isAnonymous) { db.close(); return son(v.uid); }
            k.continue();
          };
          c.onerror = function () { db.close(); son(''); };
        } catch (e) { try { db.close(); } catch (x) { } son(''); }
      };
    });
  }
  function bildir() {
    if (!window.KidefHak) return;
    hesap().then(function (u) { window.KidefHak.uid(u); });
  }
  function hazir() {
    if (!window.KidefHak) return;
    window.KidefHak.destekAdresi(kok + 'index.html#destek');
    bildir();
    document.addEventListener('visibilitychange', function () { if (!document.hidden) bildir(); });
    window.addEventListener('pageshow', bildir);
  }
  if (window.KidefHak) { hazir(); return; }
  var s = document.createElement('script');
  var d = new Date();
  s.src = kok + 'sistem/hak.js?t=' + d.getFullYear() + (d.getMonth() + 1) + d.getDate();
  s.async = true;
  s.onload = hazir;
  (document.head || document.documentElement).appendChild(s);
})();

/* ============================================================
   VİDEO · ETKİNLİK: TAM EKRAN VE YENİ SEKME                 22.10.2026
   Öğretmen: "FLİPBOOK MOTORUNDA VİDEO VE ETKİNLİKLERDE TAM EKRAN VE AYRI
   SEKMEDE ÖZELLİĞİ YOK MU". Video ve etkinlik pencerelerinin başlığına:
     · «Tam ekran» — video kendi tam ekranında (iPhone'da da), etkinlik
       başlığıyla birlikte ekranı kaplar; yeniden basınca «Küçült». Tarayıcı
       izin vermezse (ör. tahtaya kumandadan gelen dokunuşta) pencere ekranı
       kaplar. Pencere kapanınca tam ekrandan çıkılır.
     · «Yeni sekmede» — video sitenin izleme sayfasında (kitap/izle.html,
       adres çubuğunda kidefarapca.com) kaldığı saniyeden açılır, penceredeki
       durur; bilgisayara indirilmiş kitapta video dosyasının kendisi açılır.
       Etkinlik kendi sayfasıyla açılır (zaten «Yeni sekmede aç» bağlantısı
       olan kitaplarda o kullanılır, ikincisi eklenmez).
   Bütün kitaplarda aynı (ortak dosya; Kidef 2. baskı dahil).
   ============================================================ */
(function () {
  'use strict';
  var pV = document.getElementById('pVideo'), pE = document.getElementById('pEtkinlik');
  if ((!pV && !pE) || window.__kitapMedyaTus) return;
  window.__kitapMedyaTus = true;

  var IK_TAM = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
  var IK_KUC = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>';
  var IK_SEK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9"/>' +
               '<path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
  var IK_INDIR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>';

  var st = document.createElement('style');
  st.textContent =
    '.km-dug{display:inline-flex;align-items:center;gap:6px;flex-shrink:0;padding:6px 12px;border-radius:99px;cursor:pointer;' +
    'font-size:12px;font-weight:700;line-height:1.2;font-family:inherit;white-space:nowrap;text-decoration:none;' +
    'border:1.5px solid var(--line,#E3E8F0);background:#fff;color:var(--ink2,#2B3A55);transition:.15s}' +
    '.km-dug:hover{border-color:var(--gold,#E3A02A);color:var(--ink,#122040)}' +
    '.km-dug svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}' +
    '@media (max-width:560px){.km-dug span{display:none}.km-dug{padding:8px}}' +
    '@media (pointer:coarse){.km-dug{padding:9px 14px;font-size:13.5px}}' +
    '.panel.km-tam{position:fixed!important;left:0!important;top:0!important;right:0!important;bottom:0!important;' +
    'width:100vw!important;height:100vh!important;height:100dvh!important;max-width:none!important;max-height:none!important;' +
    'transform:none!important;border-radius:0!important;z-index:2147483000!important;opacity:1!important}' +
    '.panel:fullscreen{width:100vw!important;height:100vh!important;max-width:none!important;max-height:none!important;' +
    'transform:none!important;border-radius:0!important;opacity:1!important}' +
    '.panel:-webkit-full-screen{width:100vw!important;height:100vh!important;max-width:none!important;max-height:none!important;' +
    '-webkit-transform:none!important;transform:none!important;border-radius:0!important;opacity:1!important}';
  document.head.appendChild(st);

  function tamEleman() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
  function tamMi(p) {
    var f = tamEleman();
    return !!((f && (f === p || p.contains(f))) || p.classList.contains('km-tam'));
  }
  function yedekTam(p, ac) { p.classList.toggle('km-tam', !!ac); tazele(); }
  function tamAc(p, hedef) {
    var el = hedef || p, iste = el.requestFullscreen || el.webkitRequestFullscreen;
    if (iste) {
      try {
        var s = iste.call(el);
        if (s && s.then) s.then(tazele, function () { yedekTam(p, true); });
        else setTimeout(function () { if (!tamEleman()) yedekTam(p, true); else tazele(); }, 400);
        return;
      } catch (e) { }
    }
    if (hedef && hedef.webkitEnterFullscreen) {                    /* iPhone: videonun kendi tam ekranı */
      try { hedef.webkitEnterFullscreen(); return; } catch (e) { }
    }
    yedekTam(p, true);
  }
  function tamKapat(p) {
    if (tamEleman()) {
      try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) { }
    }
    yedekTam(p, false);
  }

  function dugme(ad, ik, yazi, ipucu) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'km-dug'; b.setAttribute('data-km', ad);
    b.title = ipucu; b.setAttribute('aria-label', ipucu);
    b.innerHTML = ik + '<span>' + yazi + '</span>';
    return b;
  }
  /* başlıktaki eski bağlantılar (İndir, Yeni sekmede aç) yeni düğmelerle aynı görünsün */
  function susle(a, ik) {
    if (!a || a.querySelector('svg')) return;
    var yazi = (a.textContent || '').trim();
    a.classList.add('km-dug');
    a.textContent = '';
    a.insertAdjacentHTML('afterbegin', ik);
    var sp = document.createElement('span'); sp.textContent = yazi; a.appendChild(sp);
    if (!a.getAttribute('aria-label')) a.setAttribute('aria-label', yazi);
  }
  function yerlestir(p, dugmeler) {
    var bas = p.querySelector('.pbas');
    if (!bas) return;
    var kapat = bas.querySelector('[data-kapat]');
    dugmeler.forEach(function (b) { if (kapat) bas.insertBefore(b, kapat); else bas.appendChild(b); });
  }
  function tamDugTazele(p) {
    var b = p && p.querySelector('[data-km="tam"]');
    if (!b) return;
    var t = tamMi(p);
    b.innerHTML = (t ? IK_KUC : IK_TAM) + '<span>' + (t ? 'Küçült' : 'Tam ekran') + '</span>';
    b.title = t ? 'Tam ekrandan çık' : 'Tam ekranda göster';
    b.setAttribute('aria-label', b.title);
  }
  function tazele() { tamDugTazele(pV); tamDugTazele(pE); }

  /* indirilmiş (bilgisayardan açılan) kitapta site sayfası yok: dosyanın kendisi */
  function siteMi() { return /^https?:$/.test(location.protocol); }
  function sitePath(u) {                                          /* materyal deposu → site yolu */
    var m = /^https:\/\/gdmrbg7541\.github\.io(\/kidefarapca-materyal-[^\/]+\/.+)$/i.exec(u);
    if (m) return m[1];
    try { var x = new URL(u, location.href); if (x.origin === location.origin) return x.pathname + x.search; } catch (e) { }
    return u;
  }
  function yeniSekme(adres) {
    var w = null;
    try { w = window.open(adres, '_blank', 'noopener'); } catch (e) { w = null; }
    if (!w) {                                                     /* açılır pencere engeli: aynı adres bağlantıyla */
      var a = document.createElement('a');
      a.href = adres; a.target = '_blank'; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
    }
  }

  if (pV) {
    var v = document.getElementById('videoOyn');
    var vTam = dugme('tam', IK_TAM, 'Tam ekran', 'Tam ekranda göster');
    var vYeni = dugme('yeni', IK_SEK, 'Yeni sekmede', 'Videoyu yeni sekmede aç');
    yerlestir(pV, [vTam, vYeni]);
    susle(document.getElementById('videoIndir'), IK_INDIR);
    vTam.addEventListener('click', function () {
      if (tamMi(pV)) { tamKapat(pV); return; }
      tamAc(pV, v || null);
    });
    vYeni.addEventListener('click', function () {
      if (!v) return;
      var src = v.currentSrc || v.getAttribute('src') || '';
      if (!src) return;
      var t = Math.floor(v.currentTime || 0);
      try { v.pause(); } catch (e) { }
      if (!siteMi()) { yeniSekme(src + (t ? '#t=' + t : '')); return; }
      var b = ((document.getElementById('videoBaslik') || {}).textContent || '').trim();
      var izle = new URL('../izle.html', location.href);
      izle.search = '?v=' + encodeURIComponent(sitePath(src)) + (b ? '&b=' + encodeURIComponent(b.slice(0, 140)) : '') + (t ? '&t=' + t : '');
      yeniSekme(izle.href);
    });
  }

  if (pE) {
    var fr = document.getElementById('etkinlikCerceve');
    var eTam = dugme('tam', IK_TAM, 'Tam ekran', 'Tam ekranda göster');
    var ekle = [eTam];
    if (!document.getElementById('etkinlikYeni')) {                /* Kidef: bağlantı yoksa düğme */
      var eYeni = dugme('yeni', IK_SEK, 'Yeni sekmede', 'Yeni sekmede aç');
      eYeni.addEventListener('click', function () {
        var s = fr && fr.getAttribute('src');
        if (!s || /^about:/i.test(s)) return;
        yeniSekme(new URL(s, location.href).href);
      });
      ekle.push(eYeni);
    }
    yerlestir(pE, ekle);
    susle(document.getElementById('etkinlikYeni'), IK_SEK);
    eTam.addEventListener('click', function () {
      if (tamMi(pE)) { tamKapat(pE); return; }
      tamAc(pE, null);
    });
  }

  ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (ev) {
    document.addEventListener(ev, function () {
      [pV, pE].forEach(function (p) { if (p && !tamEleman() && !p.classList.contains('acik')) yedekTam(p, false); });
      tazele();
    });
  });
  /* pencere kapanınca (her yoldan: ×, perde, Esc, başka pencere) tam ekrandan çık */
  if (window.MutationObserver) {
    [pV, pE].forEach(function (p) {
      if (!p) return;
      new MutationObserver(function () {
        if (!p.classList.contains('acik') && tamMi(p)) tamKapat(p);
      }).observe(p, { attributes: true, attributeFilter: ['class'] });
    });
  }
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.key === 'Esc') && !tamEleman()) {
      [pV, pE].forEach(function (p) { if (p && p.classList.contains('km-tam')) yedekTam(p, false); });
    }
  });
  tazele();
})();

/* KİTAP KENARLARI (25.11.2026) — öğretmen: "sağ ve sol taraftaki fazla sayfa tasarımını daha profesyonel olsun, bu tasarımlar
   tüm flipbooklarda ortak olacak motora ekleyelim". Açık kitabın iki yanında sayfa destesi: okunan sayfalar bir yanda,
   kalanlar öbür yanda (sağdan sola kitapta okunan sağda). Kapakta / arka kapakta / tek sayfa görünümünde yok. */
(function () {
  if (window.__kitapKenar) return; window.__kitapKenar = 1;
  var bekle = 0;
  function kur() {
    var k = document.querySelector('.kitap'), r = document.getElementById('kaydiracInput');
    if (!k || !r) return;
    var el = {};
    ['sol', 'sag'].forEach(function (y) {
      var e = k.querySelector(':scope > .kk-kenar.' + y);
      if (!e) { e = document.createElement('div'); e.className = 'kk-kenar ' + y; e.setAttribute('aria-hidden', 'true'); e.innerHTML = '<i></i>'; k.appendChild(e); }
      el[y] = e;
    });
    var mn = +r.min || 1, mx = +r.max || 1, v = +r.value || mn, n = Math.max(1, mx - mn);
    var o = Math.max(0, Math.min(1, (v - mn) / n));
    var M = Math.round(Math.max(6, Math.min(18, 4 + (mx - mn + 1) / 16)));   /* kalın kitap kalın deste */
    var rtl = (r.getAttribute('dir') || getComputedStyle(r).direction) === 'rtl';
    var kapak = v <= mn || v >= mx, tek = k.classList.contains('tekli');
    k.classList.toggle('kk-kapakta', kapak && !tek);                 /* KAPAKTA GÖLGE YOK (25.11.2026) */
    var okunan = kapak || tek ? 0 : Math.max(2, Math.round(M * o)), kalan = kapak || tek ? 0 : Math.max(2, Math.round(M * (1 - o)));
    el[rtl ? 'sag' : 'sol'].style.setProperty('--kw', okunan + 'px');
    el[rtl ? 'sol' : 'sag'].style.setProperty('--kw', kalan + 'px');
  }
  function sonra() { clearTimeout(bekle); bekle = setTimeout(kur, 60); }
  function bagla() {
    var r = document.getElementById('kaydiracInput'), s = document.getElementById('sayfaEt');
    if (!r || !document.querySelector('.kitap')) { setTimeout(bagla, 300); return; }
    r.addEventListener('input', sonra); r.addEventListener('change', sonra);
    try { if (s) new MutationObserver(sonra).observe(s, { childList: true, characterData: true, subtree: true }); } catch (e) { }
    try { new MutationObserver(sonra).observe(document.querySelector('.kitap'), { attributes: true, attributeFilter: ['class'] }); } catch (e) { }
    window.addEventListener('resize', sonra);
    kur(); setTimeout(kur, 600);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bagla); else bagla();
})();

/* VİDEO OYNATICI (25.11.2026) — öğretmen: "videolarda scroll yapılabiliyor, çok saçma tüm video görünsün, ayrıca yeni sekmede
   açma özelliği olmasın, özel bi tuş vs özellikleri ekle, hatta videolar için ayar kısmı olsun". Video paneli kaymaz, video
   bütünüyle görünür; İndir / yeni sekme yok; kendi düğmeleri (oynat, ±10 sn, ilerleme, ses, hız, ayarlar, tam ekran) ve
   ayarlar (hız, tekrar oynat, otomatik başlat, kaldığı yerden devam, sığdır / doldur); tuşlar: boşluk, ←/→, ↑/↓, F, M. */
(function () {
  if (window.__kzVideo) return; window.__kzVideo = 1;
  var AN = 'kitap_video', YER = 'kitap_videoYer';
  function ayarOku() { var a = { hiz: 1, dongu: 0, oto: 1, devam: 1, dol: 0, ses: 1, sessiz: 0 }; try { var t = JSON.parse(localStorage.getItem(AN) || '{}'); for (var k in t) a[k] = t[k]; } catch (e) { } return a; }
  function ayarYaz(a) { try { localStorage.setItem(AN, JSON.stringify(a)); } catch (e) { } }
  function ik(d) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>'; }
  var I = {
    oyn: ik('<path d="M8 5.5v13l10.5-6.5z" class="kv-dolu"/>'), dur: ik('<path d="M8 5v14M16 5v14"/>'),
    g10: ik('<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4 4v4.5h4.5"/><text x="12.2" y="15.2" text-anchor="middle">10</text>'),
    i10: ik('<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M20 4v4.5h-4.5"/><text x="11.8" y="15.2" text-anchor="middle">10</text>'),
    ses: ik('<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" class="kv-dolu"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11"/>'),
    sessiz: ik('<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" class="kv-dolu"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>'),
    ayar: ik('<path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>'),
    tam: ik('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'), cik: ik('<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>')
  };
  function sure(s) { s = Math.max(0, Math.floor(s || 0)); var d = Math.floor(s / 60), n = s % 60; return d + ':' + (n < 10 ? '0' : '') + n; }
  function kur() {
    var P = document.getElementById('pVideo'), v = document.getElementById('videoOyn');
    if (!P || !v) return;
    var A = v.parentNode; if (!A || A.querySelector('.kv-bar')) return;
    var S = ayarOku();
    P.classList.add('kv-p');
    v.controls = false; v.removeAttribute('controls');
    v.setAttribute('disablepictureinpicture', ''); v.setAttribute('controlslist', 'nodownload noremoteplayback noplaybackrate');
    v.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    var ind = document.getElementById('videoIndir'); if (ind) ind.setAttribute('aria-hidden', 'true');
    var H = '<button type="button" class="kv-buyuk" aria-label="Oynat">' + I.oyn + '</button>' +
      '<div class="kv-ayar" role="dialog" aria-label="Video ayarları" hidden>' +
        '<div class="kv-ay-bas"><b>Video ayarları</b></div>' +
        '<div class="kv-ay-sat"><span>Hız</span><span class="kv-cipler" data-ay="hiz">' + [0.5, 0.75, 1, 1.25, 1.5, 2].map(function (h) { return '<button type="button" data-d="' + h + '">' + String(h).replace('.', ',') + '×</button>'; }).join('') + '</span></div>' +
        '<div class="kv-ay-sat"><span>Görüntü</span><span class="kv-cipler" data-ay="dol"><button type="button" data-d="0">Sığdır</button><button type="button" data-d="1">Doldur</button></span></div>' +
        '<button type="button" class="kv-ay-sw" data-ay="dongu" role="switch"><span>Tekrar oynat<small>Bitince baştan başlar</small></span><i></i></button>' +
        '<button type="button" class="kv-ay-sw" data-ay="oto" role="switch"><span>Otomatik başlat<small>Açılınca kendiliğinden oynar</small></span><i></i></button>' +
        '<button type="button" class="kv-ay-sw" data-ay="devam" role="switch"><span>Kaldığı yerden devam<small>Videoyu yine açınca</small></span><i></i></button>' +
      '</div>' +
      '<div class="kv-bar">' +
        '<input type="range" class="kv-ilerle" min="0" max="1000" step="1" value="0" aria-label="Videoda ilerle">' +
        '<div class="kv-tuslar">' +
          '<button type="button" class="kv-t" data-kv="g10" title="10 sn geri (←)" aria-label="10 saniye geri">' + I.g10 + '</button>' +
          '<button type="button" class="kv-t kv-ana" data-kv="oyn" title="Oynat / duraklat (boşluk)" aria-label="Oynat">' + I.oyn + '</button>' +
          '<button type="button" class="kv-t" data-kv="i10" title="10 sn ileri (→)" aria-label="10 saniye ileri">' + I.i10 + '</button>' +
          '<span class="kv-sure">0:00 / 0:00</span><span class="kv-bosluk"></span>' +
          '<button type="button" class="kv-t" data-kv="ses" title="Sesi kapat / aç (M)" aria-label="Ses">' + I.ses + '</button>' +
          '<input type="range" class="kv-ses-r" min="0" max="1" step="0.05" aria-label="Ses düzeyi">' +
          '<button type="button" class="kv-t kv-hiz" data-kv="hiz" title="Hız" aria-label="Hız">1×</button>' +
          '<button type="button" class="kv-t" data-kv="ayar" title="Video ayarları" aria-label="Video ayarları">' + I.ayar + '</button>' +
          '<button type="button" class="kv-t" data-kv="tam" title="Tam ekran (F)" aria-label="Tam ekran">' + I.tam + '</button>' +
        '</div>' +
      '</div>';
    A.insertAdjacentHTML('beforeend', H);
    var bar = A.querySelector('.kv-bar'), ilr = A.querySelector('.kv-ilerle'), sr = A.querySelector('.kv-ses-r'), su = A.querySelector('.kv-sure'),
        oyn = A.querySelector('[data-kv="oyn"]'), byk = A.querySelector('.kv-buyuk'), hz = A.querySelector('[data-kv="hiz"]'), sesb = A.querySelector('[data-kv="ses"]'),
        ay = A.querySelector('.kv-ayar'), tamb = A.querySelector('[data-kv="tam"]'), surukle = false, gz = 0, ysak = 0;
    function uygula() {
      v.playbackRate = +S.hiz || 1; v.defaultPlaybackRate = +S.hiz || 1; v.loop = !!S.dongu; v.volume = Math.max(0, Math.min(1, +S.ses)); v.muted = !!S.sessiz;
      P.classList.toggle('kv-doldur', !!+S.dol);
      hz.textContent = String(+S.hiz || 1).replace('.', ',') + '×';
      [].forEach.call(ay.querySelectorAll('.kv-cipler'), function (c) { var k = c.getAttribute('data-ay'); [].forEach.call(c.children, function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-d') === +S[k] ? 'true' : 'false'); }); });
      [].forEach.call(ay.querySelectorAll('.kv-ay-sw'), function (b) { b.setAttribute('aria-checked', S[b.getAttribute('data-ay')] ? 'true' : 'false'); });
      sr.value = v.muted ? 0 : v.volume; sesb.innerHTML = (v.muted || v.volume === 0) ? I.sessiz : I.ses;
    }
    function durum() {
      var d = v.duration || 0, c = v.currentTime || 0;
      if (!surukle) ilr.value = d ? Math.round(c / d * 1000) : 0;
      ilr.style.setProperty('--dolu', (d ? c / d * 100 : 0) + '%');
      su.textContent = sure(c) + ' / ' + sure(d);
      var dur = v.paused || v.ended;
      oyn.innerHTML = dur ? I.oyn : I.dur; oyn.setAttribute('aria-label', dur ? 'Oynat' : 'Duraklat');
      P.classList.toggle('kv-durdu', dur);
    }
    function goster() { P.classList.remove('kv-gizle'); clearTimeout(gz); gz = setTimeout(function () { if (!v.paused && ay.hidden) P.classList.add('kv-gizle'); }, 2600); }
    function oynat() { if (v.paused || v.ended) { var p = v.play(); if (p && p.catch) p.catch(function () { }); } else v.pause(); goster(); }
    function atla(s) { if (v.duration) v.currentTime = Math.max(0, Math.min(v.duration - 0.1, v.currentTime + s)); goster(); }
    function tamMi() { return (document.fullscreenElement || document.webkitFullscreenElement) === A; }
    function tamEkran() {
      try {
        if (tamMi()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        else if (A.requestFullscreen) A.requestFullscreen(); else if (A.webkitRequestFullscreen) A.webkitRequestFullscreen(); else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
      } catch (e) { }
    }
    function yerYaz() {
      if (!S.devam || !v.currentSrc || !v.duration) return;
      try { var M = JSON.parse(localStorage.getItem(YER) || '{}'); var c = v.currentTime; if (c > 5 && c < v.duration - 5) M[v.currentSrc] = Math.round(c); else delete M[v.currentSrc]; localStorage.setItem(YER, JSON.stringify(M)); } catch (e) { }
    }
    A.addEventListener('click', function (e) {
      var b = e.target.closest('button'); 
      if (!b) { if (e.target === v) { if (!ay.hidden) { ay.hidden = true; return; } oynat(); } return; }
      e.stopPropagation();
      if (b === byk) return oynat();
      var k = b.getAttribute('data-kv');
      if (k === 'oyn') oynat(); else if (k === 'g10') atla(-10); else if (k === 'i10') atla(10);
      else if (k === 'ses') { S.sessiz = v.muted || v.volume === 0 ? 0 : 1; if (!S.sessiz && !(+S.ses)) S.ses = 0.8; ayarYaz(S); uygula(); }
      else if (k === 'hiz') { var L = [0.5, 0.75, 1, 1.25, 1.5, 2], i = L.indexOf(+S.hiz); S.hiz = L[(i + 1) % L.length]; ayarYaz(S); uygula(); }
      else if (k === 'ayar') { ay.hidden = !ay.hidden; goster(); }
      else if (k === 'tam') tamEkran();
      else if (b.parentNode && b.parentNode.classList.contains('kv-cipler')) { S[b.parentNode.getAttribute('data-ay')] = +b.getAttribute('data-d'); ayarYaz(S); uygula(); }
      else if (b.classList.contains('kv-ay-sw')) { var a = b.getAttribute('data-ay'); S[a] = S[a] ? 0 : 1; ayarYaz(S); uygula(); if (a === 'devam' && !S.devam) try { localStorage.removeItem(YER); } catch (x) { } }
    });
    ilr.addEventListener('input', function () { surukle = true; if (v.duration) { v.currentTime = ilr.value / 1000 * v.duration; } durum(); goster(); });
    ilr.addEventListener('change', function () { surukle = false; });
    sr.addEventListener('input', function () { S.ses = +sr.value; S.sessiz = +sr.value === 0 ? 1 : 0; ayarYaz(S); uygula(); goster(); });
    ['play', 'pause', 'ended', 'timeupdate', 'durationchange', 'loadedmetadata'].forEach(function (o) { v.addEventListener(o, durum); });
    v.addEventListener('play', goster); v.addEventListener('pause', function () { goster(); yerYaz(); });
    v.addEventListener('timeupdate', function () { var t = Date.now(); if (t - ysak > 4000) { ysak = t; yerYaz(); } });
    v.addEventListener('ratechange', function () { if (Math.abs(v.playbackRate - (+S.hiz || 1)) > 0.01) { v.playbackRate = +S.hiz || 1; } });
    v.addEventListener('loadedmetadata', function () {
      uygula();
      if (S.devam) try { var M = JSON.parse(localStorage.getItem(YER) || '{}'), c = M[v.currentSrc]; if (c > 5 && c < v.duration - 5) v.currentTime = c; } catch (e) { }
      if (S.oto) { var p = v.play(); if (p && p.catch) p.catch(function () { }); }
      durum(); goster();
    });
    v.addEventListener('emptied', function () { ay.hidden = true; durum(); });
    A.addEventListener('pointermove', goster); A.addEventListener('pointerdown', goster);
    document.addEventListener('fullscreenchange', function () { tamb.innerHTML = tamMi() ? I.cik : I.tam; P.classList.toggle('kv-tamda', tamMi()); });
    document.addEventListener('webkitfullscreenchange', function () { tamb.innerHTML = tamMi() ? I.cik : I.tam; });
    window.addEventListener('keydown', function (e) {
      if (!P.classList.contains('acik') || e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target; if (t && (t.tagName === 'INPUT' && t.type !== 'range' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      var k = e.key, ok = true;
      if (k === ' ' || k === 'k' || k === 'K') oynat();
      else if (k === 'ArrowLeft') atla(-5); else if (k === 'ArrowRight') atla(5);
      else if (k === 'ArrowUp') { S.ses = Math.min(1, (+S.ses || 0) + 0.1); S.sessiz = 0; ayarYaz(S); uygula(); goster(); }
      else if (k === 'ArrowDown') { S.ses = Math.max(0, (+S.ses || 0) - 0.1); ayarYaz(S); uygula(); goster(); }
      else if (k === 'f' || k === 'F') tamEkran();
      else if (k === 'm' || k === 'M') { S.sessiz = S.sessiz ? 0 : 1; ayarYaz(S); uygula(); }
      else ok = false;
      if (ok) { e.preventDefault(); e.stopImmediatePropagation(); }
    }, true);
    uygula(); durum();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kur); else kur();
})();
