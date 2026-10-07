/* ============================================================
   ZY 企业智能引擎 · 《新手入门到精通》手册脚本
   功能：侧边导航 / 页内目录 / 阅读进度 / 复制提问模板 / 上下页
   纯原生 JS，无依赖，file:// 直接打开可用
   ============================================================ */
(function () {
    "use strict";

    /* ---------- 全书章节表（唯一数据源，改这里即可全站生效） ---------- */
    var BOOK = [
        {
            group: "开始之前",
            items: [
                { f: "index.html", n: "首页", t: "学习地图 · 三条阅读路径", tag: "" },
                { f: "01-认识引擎.html", n: "01", t: "认识 ZY 企业智能引擎", tag: "必读" }
            ]
        },
        {
            group: "第一步：把公司开起来",
            items: [
                { f: "02-创建公司.html", n: "02", t: "注册与创建公司", tag: "必读" },
                { f: "03-创建项目.html", n: "03", t: "创建项目与信息影响", tag: "必读" },
                { f: "04-运行模式与预算.html", n: "04", t: "运行模式、自主级别与预算", tag: "重点" }
            ]
        },
        {
            group: "第二步：看懂界面",
            items: [
                { f: "05-界面导览-平台.html", n: "05", t: "界面导览（上）：平台侧页面", tag: "" },
                { f: "06-界面导览-项目.html", n: "06", t: "界面导览（下）：项目内页面", tag: "" },
                { f: "07-知识与资料导入.html", n: "07", t: "知识库与资料导入", tag: "重点" }
            ]
        },
        {
            group: "第三步：指挥 AI 干活",
            items: [
                { f: "08-智能体.html", n: "08", t: "智能体：创建、管理与自动扩编", tag: "重点" },
                { f: "09-自动运营.html", n: "09", t: "自动运营：任务、轮次与验收", tag: "核心" },
                { f: "10-软件功能开发与修改.html", n: "10", t: "软件功能的开发与修改", tag: "重点" },
                { f: "11-任务执行链路.html", n: "11", t: "发起任务后，系统做了什么", tag: "" },
                { f: "12-提问的艺术.html", n: "12", t: "提问的艺术（100+ 模板）", tag: "工具" }
            ]
        },
        {
            group: "第四步：当 CEO 看经营",
            items: [
                { f: "13-经营指标.html", n: "13", t: "该盯哪些指标", tag: "重点" },
                { f: "14-团队与治理.html", n: "14", t: "团队、权限与治理", tag: "" }
            ]
        },
        {
            group: "实战案例",
            items: [
                { f: "15-案例-跨境电商.html", n: "15", t: "案例：跨境电商独立站", tag: "案例" },
                { f: "16-案例-软件开发与网站设计.html", n: "16", t: "案例：软件产品与网站设计", tag: "案例" },
                { f: "17-案例-多行业合辑.html", n: "17", t: "案例：内容媒体 / 咨询 / 制造 / 本地服务", tag: "案例" }
            ]
        },
        {
            group: "随时查阅",
            items: [
                { f: "18-FAQ-100问.html", n: "18", t: "100 问 FAQ", tag: "工具" },
                { f: "19-故障排查与红线.html", n: "19", t: "故障自查、安全与红线", tag: "" },
                { f: "20-术语表与路线图.html", n: "20", t: "术语表 · 30/60/90 天路线图", tag: "" }
            ]
        }
    ];

    var BOOK_TITLE = "新手入门到精通";
    var BOOK_SUB = "ZY 企业智能引擎";

    /* ---------- 扁平化 ---------- */
    var flat = [];
    BOOK.forEach(function (g) {
        g.items.forEach(function (it) { flat.push({ g: g.group, f: it.f, n: it.n, t: it.t, tag: it.tag }); });
    });

    function currentFile() {
        var p = decodeURIComponent(location.pathname);
        var seg = p.split("/");
        var last = seg[seg.length - 1];
        return last === "" ? "index.html" : last;
    }

    var CUR = currentFile();
    var CUR_IDX = -1;
    for (var i = 0; i < flat.length; i++) { if (flat[i].f === CUR) { CUR_IDX = i; break; } }

    /* ---------- 顶部进度条 ---------- */
    var bar = document.createElement("div");
    bar.id = "zy-progress";
    document.body.insertBefore(bar, document.body.firstChild);

    /* ---------- 顶栏 ---------- */
    var isHome = CUR === "index.html";
    var top = document.createElement("header");
    top.className = "zy-topbar";
    top.innerHTML =
        '<a class="zy-brand" href="index.html"><i>ZY</i><span>' + BOOK_TITLE +
        '<br><small>' + BOOK_SUB + ' · 操作手册</small></span></a>' +
        '<span class="zy-spacer"></span>' +
        '<button class="zy-tb-btn" id="zy-nav-toggle" type="button">目录</button>' +
        '<a class="zy-tb-link" href="index.html">全书目录</a>' +
        '<a class="zy-tb-link" href="18-FAQ-100问.html">100 问 FAQ</a>' +
        '<button class="zy-tb-btn" id="zy-print" type="button">打印本页</button>' +
        '<button class="zy-tb-btn" id="zy-top" type="button">回到顶部</button>';
    document.body.insertBefore(top, bar.nextSibling);

    /* 首页不显示移动端目录按钮 */
    if (isHome) {
        var tg0 = document.getElementById("zy-nav-toggle");
        if (tg0) tg0.remove();
    }

    /* ---------- 侧栏 ---------- */
    var shell = document.createElement("div");
    shell.className = "zy-shell";

    var aside = document.createElement("nav");
    aside.className = "zy-side";
    aside.id = "zy-side";

    var html = '<div class="zy-side-title">目录</div>';
    BOOK.forEach(function (g) {
        html += '<div class="zy-side-group">' + esc(g.group) + '</div>';
        g.items.forEach(function (it) {
            var act = it.f === CUR ? " zy-active" : "";
            html += '<a class="' + act.trim() + '" href="' + it.f + '" data-file="' + it.f + '">' +
                '<b>' + esc(it.n) + '</b><span>' + esc(it.t) + '</span></a>';
        });
    });
    html += '<div id="zy-toc"><div class="zy-side-title">本页内容</div></div>';
    aside.innerHTML = html;

    /* ---------- 主区包裹 ---------- */
    var main = document.querySelector("main.zy-main") || document.querySelector("main");
    if (!main) {
        /* 兜底：正文若未包在 <main> 里，把既有节点搬进 main（脚本与顶栏除外） */
        main = document.createElement("main");
        main.className = "zy-main";
        var kids = [];
        for (var z = 0; z < document.body.childNodes.length; z++) {
            var nd = document.body.childNodes[z];
            if (nd.nodeType === 1 && (nd.tagName === "SCRIPT" || nd === bar || nd === top)) continue;
            kids.push(nd);
        }
        for (var y = 0; y < kids.length; y++) { main.appendChild(kids[y]); }
    }
    main.classList.add("zy-main");

    if (!isHome) {
        main.parentNode.insertBefore(shell, main);
        shell.appendChild(aside);
        shell.appendChild(main);
    } else {
        document.body.classList.add("zy-home");
        var wrap = document.createElement("div");
        wrap.className = "zy-shell zy-shell-home";
        wrap.style.gridTemplateColumns = "minmax(0, 1fr)";
        main.parentNode.insertBefore(wrap, main);
        wrap.appendChild(main);
    }

    /* ---------- 页内目录 ---------- */
    var tocBox = document.getElementById("zy-toc");
    var heads = main.querySelectorAll("h2, h3");
    if (tocBox && heads.length) {
        var th = "";
        for (var k = 0; k < heads.length; k++) {
            var h = heads[k];
            if (!h.id) {
                h.id = "sec-" + (k + 1) + "-" + (h.textContent || "").replace(/[^\u4e00-\u9fa5a-zA-Z0-9]+/g, "-").slice(0, 26);
            }
            th += '<a class="' + (h.tagName === "H3" ? "lv3" : "lv2") + '" href="#' + h.id + '">' +
                esc(h.textContent.trim()) + '</a>';
        }
        tocBox.innerHTML = '<div class="zy-side-title">本页内容</div>' + th;
    } else if (tocBox) {
        tocBox.style.display = "none";
    }

    /* ---------- 上下页 ---------- */
    if (!isHome && CUR_IDX >= 0) {
        var pager = document.createElement("div");
        pager.className = "zy-pager";
        var prev = CUR_IDX > 0 ? flat[CUR_IDX - 1] : null;
        var next = CUR_IDX < flat.length - 1 ? flat[CUR_IDX + 1] : null;
        pager.innerHTML =
            (prev ? '<a class="prev" href="' + prev.f + '"><span>← 上一章</span>' + esc(prev.n + " " + prev.t) + '</a>' : '<a class="prev" href="index.html"><span>← 返回</span>全书目录</a>') +
            (next ? '<a class="next" href="' + next.f + '"><span>下一章 →</span>' + esc(next.n + " " + next.t) + '</a>' : '<a class="next" href="index.html"><span>→ 结束</span>回到全书目录</a>');
        main.appendChild(pager);
    }

    /* ---------- 复制按钮 ---------- */
    var copies = main.querySelectorAll(".zy-copy");
    for (var c = 0; c < copies.length; c++) {
        (function (box) {
            var btn = document.createElement("button");
            btn.type = "button";
            btn.className = "zy-copy-btn";
            btn.textContent = "复制";
            btn.addEventListener("click", function () {
                var clone = box.cloneNode(true);
                var cb = clone.querySelector(".zy-copy-btn");
                if (cb) cb.remove();
                var txt = clone.textContent.replace(/^\s+|\s+$/g, "");
                var done = function () {
                    btn.textContent = "已复制";
                    btn.classList.add("done");
                    setTimeout(function () { btn.textContent = "复制"; btn.classList.remove("done"); }, 1600);
                };
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(txt).then(done, function () { fallback(txt, done); });
                } else {
                    fallback(txt, done);
                }
            });
            box.appendChild(btn);
        })(copies[c]);
    }

    function fallback(txt, done) {
        var ta = document.createElement("textarea");
        ta.value = txt;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (e) { }
        document.body.removeChild(ta);
    }

    /* ---------- 交互绑定 ---------- */
    var tg = document.getElementById("zy-nav-toggle");
    if (tg) {
        tg.addEventListener("click", function () { aside.classList.toggle("zy-open"); });
    }

    var pr = document.getElementById("zy-print");
    if (pr) { pr.addEventListener("click", function () { window.print(); }); }

    var tp = document.getElementById("zy-top");
    if (tp) { tp.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); }); }

    /* ---------- 进度条 + 页内目录高亮 ---------- */
    var tocLinks = tocBox ? tocBox.querySelectorAll("a") : [];
    var ticking = false;

    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
            var st = window.pageYOffset || document.documentElement.scrollTop;
            var hgt = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.width = (hgt > 0 ? Math.min(100, (st / hgt) * 100) : 0) + "%";

            if (heads.length) {
                var act = -1;
                for (var j = 0; j < heads.length; j++) {
                    if (heads[j].getBoundingClientRect().top <= 96) act = j; else break;
                }
                for (var m = 0; m < tocLinks.length; m++) {
                    tocLinks[m].classList.toggle("zy-active", m === act);
                }
            }
            ticking = false;
        });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---------- 工具 ---------- */
    function esc(s) {
        return String(s == null ? "" : s)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }
})();
