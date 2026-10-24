import io
import os
import tempfile
import unittest
import zipfile
from datetime import date

import logging

from n2q import create_app

logging.disable(logging.CRITICAL)

NOTES = """Biology: Cell Structure

Mitochondria are organelles that produce most of the cell's ATP through the electron transport chain.
The cell membrane is a selectively permeable barrier that controls what enters and leaves the cell.
Ribosomes are small structures that build proteins by translating messenger RNA.
Osmosis is the movement of water across a semipermeable membrane from low to high solute concentration.
Photosynthesis is the process plants use to convert light energy into chemical energy stored in glucose.
Cristae: folds of the inner mitochondrial membrane that increase surface area for ATP production.
ATP yield = 36 per glucose molecule
"""


class Base(unittest.TestCase):
    def setUp(self):
        fd, self.path = tempfile.mkstemp(suffix=".db"); os.close(fd)
        self.app = create_app({"DATABASE": self.path, "TESTING": True, "RATE_LIMIT_AUTH": False, "ANTHROPIC_API_KEY": ""})
        self.c = self.app.test_client()

    def tearDown(self):
        for ext in ("", "-wal", "-shm"):
            try: os.remove(self.path + ext)
            except FileNotFoundError: pass

    def signup(self, name="Maya Chen", email="maya@x.com", college="Northfield"):
        r = self.c.post("/api/auth/signup", json={"name": name, "email": email, "password": "supersecret1", "college": college})
        self.assertEqual(r.status_code, 201, r.get_data(as_text=True))
        return {"Authorization": "Bearer " + r.get_json()["token"]}

    def upload(self, h, name="bio.txt", text=NOTES, folder="Biology"):
        r = self.c.post("/api/notes", headers=h, data={"files": (io.BytesIO(text.encode()), name), "folder": folder}, content_type="multipart/form-data")
        self.assertEqual(r.status_code, 201, r.get_data(as_text=True))
        return r.get_json()["notes"][0]


class AuthTests(Base):
    def test_signup_login_me(self):
        h = self.signup()
        me = self.c.get("/api/auth/me", headers=h).get_json()["user"]
        self.assertEqual((me["first"], me["level"], me["xp"]), ("Maya", 1, 0))
        r = self.c.post("/api/auth/login", json={"email": "MAYA@x.com", "password": "supersecret1"})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(self.c.post("/api/auth/login", json={"email": "maya@x.com", "password": "wrong"}).status_code, 401)

    def test_validation_and_duplicates(self):
        r = self.c.post("/api/auth/signup", json={"name": "M", "email": "bad", "password": "short"})
        self.assertEqual(r.status_code, 422)
        self.signup()
        self.assertEqual(self.c.post("/api/auth/signup", json={"name": "Other", "email": "maya@x.com", "password": "supersecret1"}).status_code, 409)

    def test_requires_token(self):
        self.assertEqual(self.c.get("/api/notes").status_code, 401)
        self.assertEqual(self.c.get("/api/notes", headers={"Authorization": "Bearer junk"}).status_code, 401)

    def test_signup_logs_in_without_verification(self):
        h = self.signup()
        self.assertEqual(self.c.get("/api/auth/me", headers=h).status_code, 200)
        self.assertEqual(len(self.app.outbox), 0)  # no email is sent on signup
        self.assertIn(self.c.post("/api/auth/verify-email", json={"token": "x"}).status_code, (404, 405))  # route is gone

    def test_reset_flow(self):
        self.signup()
        self.c.post("/api/auth/forgot-password", json={"email": "nobody@x.com"})  # no leak
        self.assertEqual(len(self.app.outbox), 0)
        self.c.post("/api/auth/forgot-password", json={"email": "maya@x.com"})
        tok = self.app.outbox[-1]["text"].split("token=")[1].split()[0]
        self.assertEqual(self.c.post("/api/auth/reset-password", json={"token": tok, "password": "brandnewpass"}).status_code, 200)
        self.assertEqual(self.c.post("/api/auth/login", json={"email": "maya@x.com", "password": "brandnewpass"}).status_code, 200)


class NotesTests(Base):
    def test_upload_txt_and_analysis(self):
        h = self.signup()
        n = self.upload(h)
        self.assertEqual(n["status"], "ready")
        self.assertTrue(n["summary"])
        self.assertTrue(any(t == "Mitochondria" for t, _ in n["definitions"]))
        self.assertTrue(n["formulas"])
        self.assertEqual(self.c.get("/api/auth/me", headers=h).get_json()["user"]["xp"], 20)

    def test_upload_docx(self):
        h = self.signup()
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w") as z:
            body = "".join(f"<w:p><w:r><w:t>{l}</w:t></w:r></w:p>" for l in NOTES.splitlines() if l)
            z.writestr("word/document.xml", f'<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>{body}</w:body></w:document>')
        r = self.c.post("/api/notes", headers=h, data={"files": (io.BytesIO(buf.getvalue()), "bio.docx")}, content_type="multipart/form-data")
        self.assertEqual(r.status_code, 201)
        self.assertIn("Mitochondria", r.get_json()["notes"][0]["text"])

    def test_bad_type_and_isolation(self):
        h = self.signup()
        r = self.c.post("/api/notes", headers=h, data={"files": (io.BytesIO(b"x"), "evil.exe")}, content_type="multipart/form-data")
        self.assertEqual(r.status_code, 422)
        n = self.upload(h)
        other = self.signup("Dan", "dan@x.com")
        self.assertEqual(self.c.get(f"/api/notes/{n['id']}", headers=other).status_code, 404)
        self.assertEqual(self.c.delete(f"/api/notes/{n['id']}", headers=other).status_code, 404)
        self.assertEqual(self.c.get("/api/notes", headers=other).get_json()["notes"], [])

    def test_image_needs_text_then_paste(self):
        h = self.signup()
        r = self.c.post("/api/notes", headers=h, data={"files": (io.BytesIO(b"\x89PNG"), "board.png")}, content_type="multipart/form-data")
        n = r.get_json()["notes"][0]
        self.assertEqual(n["status"], "needs_text")
        r = self.c.patch(f"/api/notes/{n['id']}", headers=h, json={"text": NOTES})
        self.assertEqual(r.get_json()["note"]["status"], "ready")


class StudyFlowTests(Base):
    def test_quiz_flow_and_analytics(self):
        h = self.signup()
        self.assertEqual(self.c.post("/api/quiz/generate", headers=h, json={"subject": "Biology"}).status_code, 400)
        self.upload(h)
        r = self.c.post("/api/quiz/generate", headers=h, json={"subject": "Biology", "count": 5})
        self.assertEqual(r.status_code, 201, r.get_data(as_text=True))
        quiz = r.get_json()
        self.assertGreaterEqual(len(quiz["questions"]), 3)
        answers = [q["a"] for q in quiz["questions"]]  # all correct
        res = self.c.post(f"/api/quiz/{quiz['quizId']}/submit", headers=h, json={"answers": answers, "seconds": 90}).get_json()
        self.assertEqual(res["score"], 100)
        self.assertGreater(res["xp"], 0)
        self.assertEqual(self.c.post(f"/api/quiz/{quiz['quizId']}/submit", headers=h, json={"answers": answers}).status_code, 409)
        att = self.c.get(f"/api/quiz/attempts/{res['attemptId']}", headers=h).get_json()
        self.assertEqual(att["correct"], att["total"])
        an = self.c.get("/api/analytics?range=week", headers=h).get_json()
        self.assertEqual(an["averageScore"], 100)
        self.assertEqual(an["subjects"][0]["name"], "Biology")

    def test_wrong_answers_show_as_weak_topics(self):
        h = self.signup()
        self.upload(h)
        for _ in range(2):
            quiz = self.c.post("/api/quiz/generate", headers=h, json={"subject": "Biology", "count": 4}).get_json()
            self.c.post(f"/api/quiz/{quiz['quizId']}/submit", headers=h, json={"answers": [None] * len(quiz["questions"])})
        weak = self.c.get("/api/dashboard", headers=h).get_json()["weakTopics"]
        self.assertTrue(weak and weak[0]["score"] == 0)
        self.assertEqual(self.c.post("/api/planner/ai-plan", headers=h).status_code, 201)

    def test_flashcards_generate_and_review(self):
        h = self.signup()
        n = self.upload(h)
        r = self.c.post("/api/flashcards/generate", headers=h, json={"noteId": n["id"], "count": 6})
        cards = r.get_json()["cards"]
        self.assertGreaterEqual(len(cards), 3)
        lst = self.c.get("/api/flashcards?due=1", headers=h).get_json()
        self.assertEqual(lst["dueCount"], len(cards))
        rv = self.c.post("/api/flashcards/review", headers=h, json={"reviews": [{"id": cards[0]["id"], "rating": "good"}, {"id": cards[1]["id"], "rating": "again"}]}).get_json()
        self.assertEqual(rv["xp"], 4)
        by = {c["id"]: c for c in rv["cards"]}
        self.assertEqual(by[cards[0]["id"]]["intervalDays"], 3)
        self.assertEqual(by[cards[1]["id"]]["intervalDays"], 0)
        self.assertEqual(self.c.get("/api/flashcards?due=1", headers=h).get_json()["dueCount"], len(cards) - 2)
        self.assertEqual(self.c.post("/api/flashcards/review", headers=h, json={"reviews": [{"id": cards[0]["id"], "rating": "meh"}]}).status_code, 422)

    def test_partner_answers_from_notes(self):
        h = self.signup()
        self.upload(h)
        r = self.c.post("/api/partner/chat", headers=h, json={"message": "What do mitochondria do?", "mode": "explain"}).get_json()
        self.assertIn("ATP", r["message"]["text"])
        self.assertTrue(r["message"]["src"])
        r2 = self.c.post("/api/partner/chat", headers=h, json={"message": "And ribosomes?", "sessionId": r["sessionId"]}).get_json()
        self.assertEqual(r2["sessionId"], r["sessionId"])
        s = self.c.get(f"/api/partner/sessions/{r['sessionId']}", headers=h).get_json()
        self.assertEqual(len(s["messages"]), 4)

    def test_revision_pack_cached(self):
        h = self.signup()
        self.upload(h)
        a = self.c.get("/api/revision?subject=Biology", headers=h).get_json()
        self.assertTrue(a["definitions"] and a["quick"])
        self.assertTrue(self.c.get("/api/revision?subject=Biology", headers=h).get_json()["cached"])


class ProductivityTests(Base):
    def test_planner_xp_paid_once(self):
        h = self.signup()
        t = self.c.post("/api/planner/tasks", headers=h, json={"title": "Entropy set", "day": date.today().isoformat(), "minutes": 45}).get_json()["task"]
        xp = lambda: self.c.get("/api/auth/me", headers=h).get_json()["user"]["xp"]
        self.c.patch(f"/api/planner/tasks/{t['id']}", headers=h, json={"done": True})
        self.c.patch(f"/api/planner/tasks/{t['id']}", headers=h, json={"done": False})
        self.c.patch(f"/api/planner/tasks/{t['id']}", headers=h, json={"done": True})
        self.assertEqual(xp(), 15)
        week = self.c.get("/api/planner", headers=h).get_json()["days"]
        self.assertEqual(len(week), 7)
        self.assertEqual(self.c.post("/api/planner/tasks", headers=h, json={"title": "x", "day": "tomorrow"}).status_code, 422)

    def test_focus_and_streak(self):
        h = self.signup()
        self.assertEqual(self.c.post("/api/focus/sessions", headers=h, json={"minutes": 25}).get_json()["xp"], 50)
        self.assertEqual(self.c.post("/api/focus/sessions", headers=h, json={"minutes": 0}).status_code, 422)
        me = self.c.get("/api/auth/me", headers=h).get_json()["user"]
        self.assertEqual((me["xp"], me["streak"], me["coins"]), (50, 1, 10))
        d = self.c.get("/api/dashboard", headers=h).get_json()
        self.assertEqual(d["week"][-1]["value"], 25)

    def test_leaderboard_and_friends(self):
        a, b = self.signup("Ann A", "a@x.com", "Uni"), self.signup("Bob B", "b@x.com", "Uni")
        self.c.post("/api/focus/sessions", headers=a, json={"minutes": 30})
        self.c.post("/api/focus/sessions", headers=b, json={"minutes": 10})
        lb = self.c.get("/api/leaderboard?scope=college&period=week", headers=b).get_json()
        self.assertEqual([r["name"] for r in lb["rows"]], ["Ann A", "Bob B"])
        self.assertEqual(lb["me"]["rank"], 2)
        self.assertEqual(lb["gap"]["xp"], 41)
        self.assertEqual(self.c.get("/api/leaderboard?scope=friends", headers=b).get_json()["rows"][0]["name"], "Bob B")
        self.assertEqual(self.c.post("/api/friends", headers=b, json={"email": "a@x.com"}).status_code, 201)
        self.assertEqual(len(self.c.get("/api/leaderboard?scope=friends", headers=b).get_json()["rows"]), 2)

    def test_health_and_cors(self):
        r = self.c.get("/api/health", headers={"Origin": "http://localhost:5173"})
        self.assertEqual(r.get_json()["ai"], "offline")
        self.assertEqual(r.headers["Access-Control-Allow-Origin"], "http://localhost:5173")
        self.assertNotIn("Access-Control-Allow-Origin", self.c.get("/api/health", headers={"Origin": "http://evil.com"}).headers)


if __name__ == "__main__":
    unittest.main()
