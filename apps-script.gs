/**
 * Google Apps Script backend for the iBT Reading Mock Test.
 * Saves every student's submission into two sheets of one Google Sheet:
 *
 *   "Results"   - one row per student: name, score out of 35, module scores, time used.
 *   "Responses" - one row per question per student: what they answered, the key, right/wrong.
 *
 * SET UP (details in README.md):
 *   1. Open your Google Sheet > Extensions > Apps Script. Paste this whole file.
 *   2. Select the function "setup" in the toolbar and click Run. Approve the permissions.
 *   3. Deploy > New deployment > type "Web app".
 *        Execute as: Me      Who has access: Anyone
 *   4. Copy the Web app URL into config.js (GOOGLE_SCRIPT_URL).
 *
 * After you EDIT this script later: Deploy > Manage deployments > pencil icon >
 * Version: "New version" > Deploy. The URL stays the same.
 */

// Leave empty when this script was opened from inside the Sheet (Extensions > Apps Script).
// If the script is a stand-alone project, paste the Sheet's ID here
// (the long code in the Sheet's address between /d/ and /edit).
var SPREADSHEET_ID = "";

var RESULTS_SHEET = "Results";
var RESPONSES_SHEET = "Responses";

var RESULTS_HEADERS = [
  "Timestamp", "Name", "Email",
  "Reading Score (out of 35)", "Percent",
  "Module 1 Score (out of 20)", "Module 2 Score (out of 15)",
  "Module 1 Unscored Correct (of 15, not counted)",
  "Module 1 Time Used (min:sec)", "Module 2 Time Used (min:sec)",
  "Test", "Submission ID"
];

var RESPONSES_HEADERS = [
  "Timestamp", "Name", "Submission ID", "Module", "Question",
  "Counted in score?", "Student answer", "Correct answer", "Correct (1/0)"
];

function getSpreadsheet_() {
  return SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
  return sheet;
}

function mmss_(seconds) {
  var s = Math.max(0, Math.round(Number(seconds) || 0));
  var m = Math.floor(s / 60);
  var r = s % 60;
  return m + ":" + (r < 10 ? "0" : "") + r;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** The test page sends each submission here. */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var data = JSON.parse(e.postData.contents);
    return json_(saveSubmission_(data));
  } catch (err) {
    return json_({ status: "error", message: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

/** Opening the Web app URL in a browser shows this, so you can check the deployment. */
function doGet() {
  return json_({ status: "ok", message: "iBT Reading Mock Test recorder is running." });
}

function saveSubmission_(data) {
  var ss = getSpreadsheet_();
  var results = getSheet_(ss, RESULTS_SHEET, RESULTS_HEADERS);
  var responses = getSheet_(ss, RESPONSES_SHEET, RESPONSES_HEADERS);
  var idColumn = RESULTS_HEADERS.indexOf("Submission ID") + 1;

  // The page may send the same submission twice if a reply gets lost. Ignore repeats.
  var lastRow = results.getLastRow();
  if (data.submissionId && lastRow > 1) {
    var ids = results.getRange(2, idColumn, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0] === data.submissionId) return { status: "ok", message: "duplicate ignored" };
    }
  }

  var when = data.submittedAt ? new Date(data.submittedAt) : new Date();

  results.appendRow([
    when, data.name || "", data.email || "",
    data.readingScore, data.percent / 100,
    data.module1Score, data.module2Score,
    data.unscoredCorrect,
    mmss_(data.module1Seconds), mmss_(data.module2Seconds),
    data.testTitle || "", data.submissionId || ""
  ]);
  results.getRange(results.getLastRow(), 5).setNumberFormat("0.0%");

  var list = data.responses || [];
  if (list.length) {
    var rows = list.map(function (r) {
      return [
        when, data.name || "", data.submissionId || "", "Module " + r.module, r.q,
        r.scored ? "Yes" : "No", r.given, r.correct, r.isCorrect
      ];
    });
    responses.getRange(responses.getLastRow() + 1, 1, rows.length, RESPONSES_HEADERS.length).setValues(rows);
  }
  return { status: "ok" };
}

/** Run this once from the editor: creates the sheets and asks you to approve permissions. */
function setup() {
  var ss = getSpreadsheet_();
  getSheet_(ss, RESULTS_SHEET, RESULTS_HEADERS);
  getSheet_(ss, RESPONSES_SHEET, RESPONSES_HEADERS);
  Logger.log("Ready. Sheets 'Results' and 'Responses' exist in: " + ss.getName());
}

/** Optional: run from the editor to write a sample row and confirm the Sheet is reachable. */
function testWrite() {
  var out = saveSubmission_({
    submissionId: "editor-test-" + new Date().getTime(),
    submittedAt: new Date().toISOString(),
    testTitle: "Editor test",
    name: "EDITOR TEST (delete this row)", email: "",
    readingScore: 0, percent: 0, module1Score: 0, module2Score: 0, unscoredCorrect: 0,
    module1Seconds: 0, module2Seconds: 0,
    responses: [{ module: 1, q: 1, scored: 1, given: "", correct: "report", isCorrect: 0 }]
  });
  Logger.log(JSON.stringify(out));
}
