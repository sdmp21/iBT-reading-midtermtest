// ============================================================
// iBT Reading Mock Test - test engine
// Reads settings from config.js and questions from data.js.
// You normally do not need to edit this file.
// ============================================================
(function () {
  "use strict";

  const CFG = Object.assign(
    { TEST_TITLE: "iBT Reading Mock Entry Test", GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxx9L2tauvqF_7FG9IrH03NoAyuwZxndHB84JJYtspsYeJxLI7G-NLehQkCybmNiraKUw/exec", LISTENING_SECTION_URL: "https://www.classmarker.com/online-test/start/?quiz=dev6ae69e572d40f" },
    window.APP_CONFIG || {}
  );
  const LETTERS = ["A", "B", "C", "D"];
  const root = document.getElementById("app");
  document.title = CFG.TEST_TITLE;

  // ----------------------------------------------------------
  // Small helpers
  // ----------------------------------------------------------
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v === null || v === undefined || v === false) return;
      if (k === "class") node.className = v;
      else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
      else if (k === "checked" || k === "disabled") node[k] = true;
      else node.setAttribute(k, v === true ? "" : v);
    });
    [].concat(children === undefined ? [] : children).forEach((c) => {
      if (c === null || c === undefined || c === false) return;
      node.append(c instanceof Node ? c : document.createTextNode(String(c)));
    });
    return node;
  }

  function fmtTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return m + ":" + s;
  }

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  // ----------------------------------------------------------
  // Turn data.js into steps (one screen each) and a question list
  // ----------------------------------------------------------
  function parseComplete(text, firstQ) {
    const segs = [];
    const re = /([A-Za-z'’-]*)\{([A-Za-z]+)\}([.,;:!?)]*)/g;
    let last = 0, q = firstQ, m;
    while ((m = re.exec(text))) {
      if (m.index > last) segs.push({ t: text.slice(last, m.index) });
      segs.push({ q: q++, prefix: m[1], ans: m[2], suffix: m[3] });
      last = re.lastIndex;
    }
    if (last < text.length) segs.push({ t: text.slice(last) });
    return segs;
  }

  function buildModule(mod, index) {
    const steps = [];
    const questions = [];
    mod.sections.forEach((sec) => {
      if (sec.type === "complete") {
        const segs = parseComplete(sec.text, sec.firstQ);
        const blanks = segs.filter((s) => s.q !== undefined);
        const first = blanks[0].q, last = blanks[blanks.length - 1].q;
        const stepIndex = steps.length;
        steps.push({ kind: "complete", sec, segs, label: "Questions " + first + "–" + last });
        blanks.forEach((b) =>
          questions.push({ n: b.q, scored: sec.scored !== false, kind: "blank", prefix: b.prefix, answer: b.ans, step: stepIndex })
        );
      } else {
        sec.questions.forEach((q) => {
          const isInsert = q.type === "insert";
          const options = isInsert ? LETTERS.map((L) => "Location " + L) : q.options;
          const stepIndex = steps.length;
          steps.push({ kind: "mc", sec, q, isInsert, options });
          questions.push({ n: q.n, scored: sec.scored !== false, kind: "mc", answer: q.answer, step: stepIndex });
        });
      }
    });
    steps.push({ kind: "review" });
    return { id: mod.id, label: mod.label, minutes: mod.minutes, steps, questions, index };
  }

  const MODULES = TEST_DATA.modules.map(buildModule);

  // ----------------------------------------------------------
  // State
  // ----------------------------------------------------------
  const state = {
    phase: "start", // start | intro | testing | done | check
    name: "",
    email: "",
    mi: 0, // current module index
    si: 0, // current step index
    resp: [],
    timeLeft: 0,
    deadline: 0,
    moduleStart: 0,
    timerId: null,
    secondsUsed: [0, 0],
    scrollPos: {},
    note: "",
    submissionId: uuid(),
    payload: null
  };

  function resetResponses() {
    state.resp = MODULES.map(() => ({ fill: {}, mc: {} }));
  }

  // ----------------------------------------------------------
  // Timer (separate countdown for each module)
  // ----------------------------------------------------------
  function updateTimer() {
    const t = document.getElementById("timer");
    if (!t) return;
    t.textContent = fmtTime(state.timeLeft);
    t.classList.toggle("low", state.timeLeft <= 60);
  }

  function stopTimer() {
    clearInterval(state.timerId);
    state.timerId = null;
  }

  function startTimer(mi) {
    stopTimer();
    const total = MODULES[mi].minutes * 60;
    state.moduleStart = Date.now();
    state.deadline = state.moduleStart + total * 1000;
    state.timeLeft = total;
    state.timerId = setInterval(() => {
      state.timeLeft = Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000));
      updateTimer();
      if (state.timeLeft <= 0) finishModule(mi, true);
    }, 250);
  }

  // ----------------------------------------------------------
  // Shared page pieces
  // ----------------------------------------------------------
  function examBar(label, showTimer) {
    return el("header", { class: "examBar" }, [
      el("div", { class: "brand" }, CFG.TEST_TITLE),
      el("div", { class: "moduleLabel" }, label || ""),
      el("div", { class: "timer" + (showTimer ? "" : " hidden"), id: "timer", role: "timer" }, "--:--")
    ]);
  }

  function navBar(opts) {
    return el("nav", { class: "navBar", "aria-label": "Test navigation" }, [
      el("button", { type: "button", class: "navBtn secondary", disabled: opts.backDisabled, onclick: opts.onBack }, "Back"),
      el("div", { class: "progress" }, opts.progress),
      el("button", { type: "button", class: "navBtn", onclick: opts.onNext }, opts.nextLabel)
    ]);
  }

  function show(label, showTimer, stage, nav) {
    root.innerHTML = "";
    root.append(examBar(label, showTimer), stage);
    if (nav) root.append(nav);
    updateTimer();
    window.scrollTo(0, 0);
  }

  // ----------------------------------------------------------
  // Start page
  // ----------------------------------------------------------
  function renderStart() {
    state.phase = "start";
    const nameInput = el("input", { type: "text", id: "nameInput", placeholder: "e.g. Alex Kim", autocomplete: "name" });
    const emailInput = el("input", { type: "email", id: "emailInput", placeholder: "e.g. alex@example.com", autocomplete: "email" });
    const err = el("div", { class: "fieldError", role: "alert" }, "");

    const form = el("form", { novalidate: "" }, [
      el("div", { class: "field" }, [el("label", { for: "nameInput" }, "Your name"), nameInput]),
      el("div", { class: "field" }, [el("label", { for: "emailInput" }, "Email (optional)"), emailInput]),
      err,
      el("button", { type: "submit", class: "navBtn" }, "Begin Test")
    ]);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      nameInput.classList.remove("invalid");
      emailInput.classList.remove("invalid");
      if (!name) {
        nameInput.classList.add("invalid");
        err.textContent = "Enter your name to begin.";
        nameInput.focus();
        return;
      }
      if (email && !/^\S+@\S+\.\S+$/.test(email)) {
        emailInput.classList.add("invalid");
        err.textContent = "Check your email address, or leave it blank.";
        emailInput.focus();
        return;
      }
      state.name = name;
      state.email = email;
      state.submissionId = uuid();
      resetResponses();
      state.mi = 0;
      state.note = "";
      renderIntro();
    });

    const table = el("table", { class: "taskTable" }, [
      el("tr", {}, [el("th", {}, "Module"), el("th", {}, "Tasks"), el("th", {}, "Questions"), el("th", {}, "Time")]),
      ...MODULES.map((m) => {
        const hasDailyLife = m.steps.some((s) => s.kind === "mc" && s.sec.type !== "passage");
        return el("tr", {}, [
          el("td", {}, m.label),
          el("td", {}, hasDailyLife ? "Complete the Words, Daily Life Texts, Academic Passages" : "Complete the Words, Academic Passage"),
          el("td", {}, String(m.questions.length)),
          el("td", {}, "about " + m.minutes + " minutes")
        ]);
      })
    ]);

    const stage = el("main", { class: "stage" }, [
      el("div", { class: "centerCard" }, [
        el("h1", {}, "Reading Section"),
        el("p", {}, "This section has two modules, and each module has its own timer. You may review and revise your answers in a module as long as time remains. Once you continue to the next module, you cannot return to the previous one."),
        table,
        form
      ])
    ]);
    show("Welcome", false, stage);
    nameInput.focus();
  }

  // ----------------------------------------------------------
  // Module intro page
  // ----------------------------------------------------------
  function renderIntro() {
    state.phase = "intro";
    const mod = MODULES[state.mi];
    const isFirst = state.mi === 0;
    const stage = el("main", { class: "stage" }, [
      el("div", { class: "centerCard" }, [
        el("h1", {}, mod.label),
        state.note ? el("div", { class: "notice", role: "status" }, state.note) : null,
        el("p", {}, "You will have about " + mod.minutes + " minutes to answer " + mod.questions.length + " questions in " + mod.label + ". The timer starts when you select Start Module."),
        el("p", {}, "Use Back and Next to move between questions. At the end of the module you can review your answers before you continue."),
        el("p", {}, isFirst
          ? "After you continue to Module 2, you will not be able to return to Module 1."
          : "You cannot return to the previous module."),
        el("div", { class: "actions" }, [
          el("button", { type: "button", class: "navBtn", onclick: () => startModule(state.mi) }, "Start Module")
        ])
      ])
    ]);
    show(mod.label, false, stage);
  }

  function startModule(mi) {
    state.mi = mi;
    state.si = 0;
    state.phase = "testing";
    state.note = "";
    startTimer(mi);
    renderStep();
  }

  function finishModule(mi, timedOut) {
    if (state.phase !== "testing" || state.mi !== mi) return; // already finished
    stopTimer();
    const total = MODULES[mi].minutes * 60;
    state.secondsUsed[mi] = Math.min(total, Math.round((Date.now() - state.moduleStart) / 1000));
    if (mi < MODULES.length - 1) {
      state.mi = mi + 1;
      state.note = timedOut ? "Time is up for " + MODULES[mi].label + ". Your answers were saved." : "";
      renderIntro();
    } else {
      renderThanks();
    }
  }

  // ----------------------------------------------------------
  // Moving between steps
  // ----------------------------------------------------------
  let currentSecId = null;

  function saveScroll() {
    const p = document.querySelector(".passagePanel");
    if (p && currentSecId) state.scrollPos[currentSecId] = p.scrollTop;
  }

  function goTo(si) {
    saveScroll();
    state.si = si;
    renderStep();
  }

  function renderStep() {
    const mod = MODULES[state.mi];
    const step = mod.steps[state.si];
    if (step.kind === "review") return renderReview();

    const isFirst = state.si === 0;
    const content = step.kind === "complete" ? buildCompleteStep(step) : buildMcStep(step, mod);
    const stage = el("main", { class: "stage", tabindex: "-1" }, content);
    const progress = step.kind === "complete"
      ? step.label + " of " + mod.questions.length
      : "Question " + step.q.n + " of " + mod.questions.length;

    currentSecId = step.sec.id;
    show(mod.label, true, stage, navBar({
      backDisabled: isFirst,
      onBack: () => goTo(state.si - 1),
      nextLabel: "Next",
      onNext: () => goTo(state.si + 1),
      progress
    }));

    if (step.kind === "mc") {
      const panel = document.querySelector(".passagePanel");
      if (panel) panel.scrollTop = state.scrollPos[step.sec.id] || 0;
    }
  }

  // ----------------------------------------------------------
  // Complete the Words screen
  // ----------------------------------------------------------
  function buildCompleteStep(step) {
    const r = state.resp[state.mi];
    const box = el("div", { class: "fillblankBox" });
    const cells = []; // every letter box in order, across the whole paragraph

    function setLetter(cell, ch) {
      r.fill[cell.q][cell.i] = ch;
      cell.inp.value = ch;
      cell.inp.classList.toggle("filled", !!ch);
    }
    function focusCell(i) {
      if (!cells[i]) return;
      cells[i].inp.focus();
      cells[i].inp.select(); // so the next letter replaces the current one
    }

    step.segs.forEach((seg) => {
      if (seg.t !== undefined) {
        box.append(document.createTextNode(seg.t));
        return;
      }
      const len = seg.ans.length;
      if (!Array.isArray(r.fill[seg.q])) r.fill[seg.q] = new Array(len).fill("");
      const group = el("span", { class: "blankGroup", role: "group", "aria-label": "Question " + seg.q + ", " + len + " missing letters after " + seg.prefix });
      for (let i = 0; i < len; i++) {
        const existing = r.fill[seg.q][i] || "";
        const inp = el("input", {
          type: "text",
          class: "blankCell" + (existing ? " filled" : ""),
          value: existing,
          autocomplete: "off",
          autocapitalize: "off",
          autocorrect: "off",
          spellcheck: "false",
          "aria-label": "Question " + seg.q + ", letter " + (i + 1) + " of " + len
        });
        cells.push({ inp, q: seg.q, i });
        group.append(inp);
      }
      box.append(el("span", { class: "blankWord" }, [seg.prefix, group, seg.suffix]));
    });

    cells.forEach((cell, idx) => {
      const inp = cell.inp;
      inp.addEventListener("focus", () => inp.select());
      inp.addEventListener("click", () => inp.select());
      inp.addEventListener("input", () => {
        const typed = inp.value.replace(/[^A-Za-z]/g, "");
        if (!typed) {
          setLetter(cell, "");
          return;
        }
        let pos = idx;
        for (let k = 0; k < typed.length && pos < cells.length; k++, pos++) setLetter(cells[pos], typed[k]);
        focusCell(Math.min(pos, cells.length - 1));
      });
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && inp.value === "" && idx > 0) {
          e.preventDefault();
          setLetter(cells[idx - 1], "");
          focusCell(idx - 1);
        } else if (e.key === "ArrowLeft" && idx > 0) {
          e.preventDefault();
          focusCell(idx - 1);
        } else if (e.key === "ArrowRight" && idx < cells.length - 1) {
          e.preventDefault();
          focusCell(idx + 1);
        }
      });
    });

    return [
      el("div", { class: "screenMeta" }, step.label),
      el("p", { class: "screenInstructions" }, "Fill in the missing letters in the paragraph."),
      box
    ];
  }

  // ----------------------------------------------------------
  // Reading text + question screen
  // ----------------------------------------------------------
  function richInto(parent, text, mode, ctx) {
    text.split(/(\[[A-D]\]|\*\*[^*]+\*\*)/).forEach((tok) => {
      if (!tok) return;
      let m;
      if (mode === "passage" && (m = /^\[([A-D])\]$/.exec(tok))) {
        const L = m[1];
        if (ctx && ctx.interactive) {
          const btn = el("button", {
            type: "button",
            class: "marker",
            "aria-label": "Location " + L,
            "aria-pressed": "false",
            onclick: () => ctx.pick(L)
          }, "[" + L + "]");
          ctx.markers[L] = btn;
          parent.append(btn);
        } else {
          parent.append(el("span", { class: "marker" }, "[" + L + "]"));
        }
        return;
      }
      if ((m = /^\*\*([^*]+)\*\*$/.exec(tok))) {
        parent.append(mode === "passage" ? el("mark", { class: "hl" }, m[1]) : el("strong", {}, m[1]));
        return;
      }
      parent.append(document.createTextNode(tok));
    });
  }

  function buildMcStep(step, mod) {
    const r = state.resp[state.mi];
    const { sec, q, isInsert, options } = step;
    const ctx = { interactive: isInsert, markers: {}, pick: (L) => setAnswer(L) };

    // ---- left: the reading text ----
    const panel = el("div", { class: "passagePanel", tabindex: "0", "aria-label": "Reading text" });
    const paras = (host) => sec.paragraphs.forEach((p) => {
      const node = el("p");
      richInto(node, p, sec.type === "passage" ? "passage" : "plain", ctx);
      host.append(node);
    });

    if (sec.type === "email") {
      const body = el("div", { class: "emailBody" });
      paras(body);
      panel.append(el("div", { class: "emailBox" }, [
        el("div", { class: "emailSubject" }, [el("span", { class: "label" }, "Subject:"), el("span", {}, sec.subject)]),
        body
      ]));
    } else if (sec.type === "post") {
      const card = el("div", { class: "postCard" }, [
        el("div", { class: "postAuthor" }, [el("span", { class: "avatar", "aria-hidden": "true" }, sec.author.charAt(0)), sec.author])
      ]);
      paras(card);
      panel.append(card);
    } else {
      panel.append(el("h2", { class: "passageTitle" }, sec.title));
      paras(panel);
    }

    // ---- right: the question ----
    const promptId = "prompt-" + q.n;
    const qPanel = el("div", { class: "questionPanel" });
    qPanel.append(el("div", { class: "qNumber" }, "Question " + q.n + " of " + mod.questions.length));
    if (isInsert) {
      qPanel.append(
        el("p", { class: "qPrompt", id: promptId }, "There are four locations in the passage (marked with [A], [B], [C], and [D]) that indicate where the following sentence could be added."),
        el("div", { class: "insertBox" }, q.sentence),
        el("p", { class: "qPrompt" }, "Where would the sentence best fit?")
      );
    } else {
      qPanel.append(el("p", { class: "qPrompt", id: promptId }, q.prompt));
    }

    const optionEls = [];
    const list = el("div", { class: "options", role: "radiogroup", "aria-labelledby": promptId });
    options.forEach((text, i) => {
      const L = LETTERS[i];
      const radio = el("input", { type: "radio", name: "q" + q.n, value: L });
      radio.addEventListener("change", () => setAnswer(L));
      const label = el("label", { class: "option" }, [radio, el("span", {}, text)]);
      optionEls.push({ L, label, radio });
      list.append(label);
    });
    qPanel.append(list);

    function paint(letter) {
      optionEls.forEach((o) => {
        o.label.classList.toggle("selected", o.L === letter);
        o.radio.checked = o.L === letter;
      });
      Object.keys(ctx.markers).forEach((L) => {
        ctx.markers[L].classList.toggle("selected", L === letter);
        ctx.markers[L].setAttribute("aria-pressed", L === letter ? "true" : "false");
      });
    }
    function setAnswer(letter) {
      r.mc[q.n] = letter;
      paint(letter);
    }
    paint(r.mc[q.n] || null);

    return [
      el("div", { class: "screenMeta" }, sec.heading),
      el("div", { class: "split" }, [panel, qPanel])
    ];
  }

  // ----------------------------------------------------------
  // Review page (last page of each module; Back still works)
  // ----------------------------------------------------------
  function renderReview() {
    const mod = MODULES[state.mi];
    const r = state.resp[state.mi];
    const isLast = state.mi === MODULES.length - 1;

    function statusOf(q) {
      if (q.kind === "blank") {
        const filled = (r.fill[q.n] || []).filter(Boolean).length;
        return filled === q.answer.length ? "done" : filled > 0 ? "partial" : "empty";
      }
      return r.mc[q.n] ? "done" : "empty";
    }
    const statuses = mod.questions.map(statusOf);
    const answered = statuses.filter((s) => s === "done").length;
    const label = { done: "answered", partial: "partly filled", empty: "not answered" };

    const chips = el("div", { class: "chipGrid" });
    mod.questions.forEach((q, i) => {
      const s = statuses[i];
      chips.append(el("button", {
        type: "button",
        class: "chip" + (s === "done" ? "" : " " + s),
        "aria-label": "Question " + q.n + ", " + label[s],
        onclick: () => goTo(q.step)
      }, String(q.n)));
    });

    const stage = el("main", { class: "stage", tabindex: "-1" }, [
      el("div", { class: "centerCard wide" }, [
        el("h1", {}, "Review your answers"),
        el("p", {}, "You have answered " + answered + " of " + mod.questions.length + " questions in " + mod.label + ". Select a question number to go back to it."),
        chips,
        el("div", { class: "legend" }, [
          el("span", {}, "Answered"),
          el("span", { class: "partial" }, "Partly filled"),
          el("span", { class: "empty" }, "Not answered")
        ]),
        el("div", { class: "notice" }, isLast
          ? "The timer is still running. After you submit, you will not be able to change your answers."
          : "The timer is still running. After you continue to " + MODULES[state.mi + 1].label + ", you will not be able to return to " + mod.label + ".")
      ])
    ]);

    currentSecId = null;
    show(mod.label, true, stage, navBar({
      backDisabled: false,
      onBack: () => goTo(state.si - 1),
      nextLabel: isLast ? "Submit Reading Section" : "Continue to " + MODULES[state.mi + 1].label,
      onNext: () => finishModule(state.mi, false),
      progress: "Review"
    }));
  }

  // ----------------------------------------------------------
  // Scoring (never shown to the test taker)
  // ----------------------------------------------------------
  function grade() {
    const rows = [];
    MODULES.forEach((mod, mi) => {
      const r = state.resp[mi];
      mod.questions.forEach((q) => {
        let given = "", correct = "", ok = false;
        if (q.kind === "blank") {
          const letters = (r.fill[q.n] || []).join("");
          given = letters ? q.prefix + letters : "";
          correct = q.prefix + q.answer;
          ok = letters.length === q.answer.length && letters.toLowerCase() === q.answer.toLowerCase();
        } else {
          given = r.mc[q.n] || "";
          correct = q.answer;
          ok = given === q.answer;
        }
        rows.push({ module: mod.id, q: q.n, scored: q.scored, given, correct, isCorrect: ok });
      });
    });
    return rows;
  }

  function buildPayload() {
    const rows = grade();
    const sum = (arr) => arr.filter((x) => x.isCorrect).length;
    const scoredRows = rows.filter((x) => x.scored);
    const m = (id, scored) => rows.filter((x) => x.module === id && x.scored === scored);
    const readingScore = sum(scoredRows);
    return {
      submissionId: state.submissionId,
      submittedAt: new Date().toISOString(),
      testTitle: CFG.TEST_TITLE,
      name: state.name,
      email: state.email,
      readingScore,
      readingMax: scoredRows.length,
      percent: scoredRows.length ? Math.round((readingScore / scoredRows.length) * 1000) / 10 : 0,
      module1Score: sum(m(1, true)),
      module1Max: m(1, true).length,
      module2Score: sum(m(2, true)),
      module2Max: m(2, true).length,
      unscoredCorrect: sum(rows.filter((x) => !x.scored)),
      unscoredTotal: rows.filter((x) => !x.scored).length,
      module1Seconds: state.secondsUsed[0],
      module2Seconds: state.secondsUsed[1],
      responses: rows.map((x) => ({
        module: x.module, q: x.q, scored: x.scored ? 1 : 0, given: x.given, correct: x.correct, isCorrect: x.isCorrect ? 1 : 0
      }))
    };
  }

  // ----------------------------------------------------------
  // Sending results to Google Sheets
  // ----------------------------------------------------------
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  async function postToSheet(payload) {
    const url = CFG.GOOGLE_SCRIPT_URL;
    const body = JSON.stringify(payload);
    const headers = { "Content-Type": "text/plain;charset=utf-8" };
    // 1) Normal request: lets us read the reply and confirm it was saved.
    try {
      const res = await fetch(url, { method: "POST", headers, body, redirect: "follow" });
      const data = await res.json();
      if (data && data.status === "ok") return "saved";
      return "rejected:" + ((data && data.message) || res.status);
    } catch (err) {
      // 2) The reply could not be read (browser/CORS). Send once more without
      //    reading it. The script ignores duplicates by submissionId.
      try {
        await fetch(url, { method: "POST", mode: "no-cors", headers, body });
        return "sent";
      } catch (err2) {
        return "network";
      }
    }
  }

  async function sendSubmission() {
    const status = document.getElementById("submitStatus");
    if (!status) return;
    const setStatus = (cls, text, withRetry) => {
      status.className = "statusMsg " + cls;
      status.textContent = text;
      if (withRetry) status.append(el("button", { type: "button", class: "navBtn secondary", onclick: sendSubmission }, "Try again"));
    };

    if (!CFG.GOOGLE_SCRIPT_URL) {
      setStatus("error", "Answers are not being recorded: the Google Apps Script URL has not been added to config.js.");
      return;
    }
    if (!state.payload) state.payload = buildPayload();
    setStatus("pending", "Submitting your answers…");

    let result = "network";
    for (let attempt = 0; attempt < 3; attempt++) {
      result = await postToSheet(state.payload);
      if (result !== "network") break;
      await sleep(1500 * (attempt + 1));
    }
    if (result === "saved" || result === "sent") {
      if (result === "sent") console.warn("Answers were sent but the reply could not be read, so the save is unconfirmed.");
      setStatus("ok", "Your answers have been submitted.");
    } else if (result.indexOf("rejected") === 0) {
      console.error("The recording script refused the submission:", result);
      setStatus("error", "Your answers could not be saved. Please tell your instructor.", true);
    } else {
      setStatus("error", "Your answers could not be sent. Check your internet connection and try again.", true);
    }
  }

  // ----------------------------------------------------------
  // Thank-you page (no score is shown)
  // ----------------------------------------------------------
  function renderThanks() {
    state.phase = "done";
    state.payload = buildPayload();
    const stage = el("main", { class: "stage", tabindex: "-1" }, [
      el("div", { class: "centerCard" }, [
        el("h1", {}, "Thank you"),
        el("p", {}, "You have completed the Reading section of the test, " + state.name + "."),
        el("div", { class: "statusMsg pending", id: "submitStatus", role: "status" }, ""),
        CFG.LISTENING_SECTION_URL
          ? el("div", { class: "actions" }, [
              el("a", { class: "navBtn", href: CFG.LISTENING_SECTION_URL, rel: "noopener" }, "Continue to Listening Section")
            ])
          : null
      ])
    ]);
    show("Reading section complete", false, stage);
    sendSubmission();
  }

  // ----------------------------------------------------------
  // Instructor connection check: open the page with ?check at the end
  // of the address to test the Google Sheet connection.
  // ----------------------------------------------------------
  function renderCheck() {
    state.phase = "check";
    const out = el("pre", { style: "white-space:pre-wrap;font-family:var(--mono);font-size:0.85rem;background:#fff;border:1px solid var(--rule);padding:0.8rem;min-height:4rem;" }, "");
    const log = (t) => { out.textContent += t + "\n"; };
    const url = CFG.GOOGLE_SCRIPT_URL;

    const btnGet = el("button", { type: "button", class: "navBtn secondary", onclick: async () => {
      out.textContent = "";
      if (!url) return log("No Google Apps Script URL in config.js yet.");
      log("Asking the web app to identify itself...");
      try {
        const res = await fetch(url, { redirect: "follow" });
        const data = await res.json();
        log(data && data.status === "ok" ? "OK: the web app answered. " + (data.message || "") : "The web app answered, but not as expected: " + JSON.stringify(data));
      } catch (e) {
        log("FAILED: the browser could not read a reply. Most often the deployment's 'Who has access' is not set to 'Anyone', or the URL in config.js is old or incomplete.");
      }
    } }, "1. Check the web app");

    const btnPost = el("button", { type: "button", class: "navBtn", onclick: async () => {
      out.textContent = "";
      if (!url) return log("No Google Apps Script URL in config.js yet.");
      log("Sending a test row (named CONNECTION TEST)...");
      const res = await postToSheet({
        test: true, submissionId: "test-" + uuid(), submittedAt: new Date().toISOString(), testTitle: CFG.TEST_TITLE,
        name: "CONNECTION TEST", email: "", readingScore: 0, readingMax: 35, percent: 0, module1Score: 0, module1Max: 20,
        module2Score: 0, module2Max: 15, unscoredCorrect: 0, unscoredTotal: 15, module1Seconds: 0, module2Seconds: 0,
        responses: [{ module: 1, q: 1, scored: 1, given: "", correct: "report", isCorrect: 0 }]
      });
      if (res === "saved") log("OK: the script confirmed it saved the row. Check the 'Results' sheet.");
      else if (res === "sent") log("Sent, but the reply could not be read. Check the 'Results' sheet for a row named CONNECTION TEST. If there is none, see the Troubleshooting section of the README.");
      else log("FAILED (" + res + "). See the Troubleshooting section of the README.");
    } }, "2. Send a test row");

    const stage = el("main", { class: "stage" }, [
      el("div", { class: "centerCard" }, [
        el("h1", {}, "Connection check"),
        el("p", {}, "For instructors only. Students never see this page."),
        el("p", {}, "Web app URL: " + (url || "(not set)")),
        el("div", { class: "actions" }, [btnGet, btnPost]),
        out
      ])
    ]);
    show("Instructor check", false, stage);
  }

  // ----------------------------------------------------------
  // Warn before leaving the page in the middle of a test
  // ----------------------------------------------------------
  window.addEventListener("beforeunload", (e) => {
    if (state.phase === "testing") {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  // ----------------------------------------------------------
  // Go
  // ----------------------------------------------------------
  resetResponses();
  if (new URLSearchParams(window.location.search).has("check")) renderCheck();
  else renderStart();
})();
