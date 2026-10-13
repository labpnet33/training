var e=[{title:{en:`A failed assertion with a tiny difference`,hi:`Chhote se farak wala failed assertion`},ticket:{en:`The VLAN helper test suite went red after a refactor. You run it and get the output below. What does it tell you?`,hi:`Refactor ke baad VLAN helper test suite red ho gayi. Aap use chalate ho aur neeche ka output milta hai. Yeh kya batata hai?`},out:`$ python3 -m unittest test_vlan_tools
F
======================================================================
FAIL: test_config_lines (test_vlan_tools.TestVlan.test_config_lines)
----------------------------------------------------------------------
Traceback (most recent call last):
  File "test_vlan_tools.py", line 20, in test_config_lines
    self.assertEqual(make_vlan_config(10, "USERS"), ["vlan 10", " name USERS"])
AssertionError: Lists differ: ['vlan 10', 'name USERS'] != ['vlan 10', ' name USERS']

First differing element 1:
'name USERS'
' name USERS'

----------------------------------------------------------------------
Ran 1 test in 0.001s

FAILED (failures=1)`,q:{en:`What is the right next step?`,hi:`Sahi agla step kya hai?`},o:[{en:`Delete the test because unittest is unreliable`,hi:`Test delete karo kyunki unittest unreliable hai`},{en:`Check the requirement: the config line needs a leading space, so the refactored code lost it and must be fixed`,hi:`Requirement check karo: config line ko leading space chahiye, refactored code ne use kho diya aur use fix karna hoga`},{en:`Change the expected value to "name USERS" so the test passes`,hi:`Expected value ko "name USERS" karo taaki test pass ho`},{en:`Reinstall Python`,hi:`Python reinstall karo`}],a:1,w:{en:`The assertion reports a single differing element: the leading space. IOS sub-commands are indented, so the test states the requirement correctly and the code regressed. Editing the test would hide a real bug.`,hi:`Assertion sirf ek differing element batata hai: leading space. IOS sub-commands indented hote hain, isliye test requirement sahi likhta hai aur code regress hua. Test edit karna asli bug chhupa deta.`}},{title:{en:`What does this diff change?`,hi:`Yeh diff kya badalta hai?`},ticket:{en:`A pull request is waiting for your review. This is the diff. Which statement describes it correctly?`,hi:`Ek pull request aapke review ka intezaar kar rahi hai. Yeh diff hai. Kaun sa statement ise sahi describe karta hai?`},out:`--- a/vlan_tools.py
+++ b/vlan_tools.py
@@ -2,9 +2,11 @@
 
 def is_valid_vlan(vid):
     """True if vid is a whole number from 1 to 4094."""
-    return isinstance(vid, int) and 1 < vid < 4094
+    return isinstance(vid, int) and 1 <= vid <= 4094
 
 
 def make_vlan_config(vid, name):
     """Return the config lines for one VLAN."""
+    if not is_valid_vlan(vid):
+        raise ValueError(f"bad VLAN id {vid}")
     return [f"vlan {vid}", f" name {name}"]`,q:{en:`Which description is correct?`,hi:`Kaun sa description sahi hai?`},o:[{en:`It deletes make_vlan_config and adds is_valid_vlan`,hi:`Yeh make_vlan_config delete karta hai aur is_valid_vlan jodta hai`},{en:`It only renames two variables`,hi:`Yeh sirf do variables ka naam badalta hai`},{en:`It makes VLAN 1 and 4094 valid and makes make_vlan_config raise ValueError for bad ids`,hi:`Yeh VLAN 1 aur 4094 ko valid banata hai aur bad ids par make_vlan_config ko ValueError raise karwata hai`},{en:`It changes the file from version b to version a`,hi:`Yeh file ko version b se version a mein badalta hai`}],a:2,w:{en:`The minus line used strict comparisons and the plus line includes both end points. The two plus lines inside make_vlan_config add a validity check that raises ValueError. The @@ header shows the new side is two lines longer. The new file is the +++ side.`,hi:`Minus line strict comparisons use karti thi aur plus line dono end points shamil karti hai. make_vlan_config ke andar ki do plus lines validity check jodti hain jo ValueError raise karta hai. @@ header dikhata hai new side do lines lambi hai. New file +++ side hai.`}},{title:{en:`Green, but is it really testing?`,hi:`Green hai, par kya sach mein test ho raha hai?`},ticket:{en:`A colleague says the parser has 12 tests and all pass. You run the suite and see this output.`,hi:`Ek colleague kehta hai parser ke 12 tests hain aur sab pass hain. Aap suite chalate ho aur yeh output dikhta hai.`},out:`$ python3 -m unittest -v test_parser
test_parse_names (test_parser.TestParser.test_parse_names) ... ok
test_parse_ids (test_parser.TestParser.test_parse_ids) ... ok
test_bad_json_raises (test_parser.TestParser.test_bad_json_raises) ... ok

----------------------------------------------------------------------
Ran 3 tests in 0.002s

OK

$ grep -n "def " test_parser.py
 8:    def test_parse_names(self):
14:    def test_parse_ids(self):
20:    def test_bad_json_raises(self):
26:    def check_empty_response(self):
32:    def verify_missing_key(self):`,q:{en:`Why do only 3 of the 5 test-like methods run?`,hi:`5 test-jaise methods mein se sirf 3 kyun chalte hain?`},o:[{en:`unittest only collects methods whose names start with test; check_empty_response and verify_missing_key are silently skipped`,hi:`unittest sirf woh methods collect karta hai jinka naam test se shuru ho; check_empty_response aur verify_missing_key chupchaap skip ho jaate hain`},{en:`unittest runs a maximum of 3 tests per file`,hi:`unittest ek file mein maximum 3 tests chalata hai`},{en:`Two tests failed but unittest hid them`,hi:`Do tests fail hue par unittest ne chhupa diye`},{en:`setUp is missing`,hi:`setUp missing hai`}],a:0,w:{en:`Test discovery depends on the method name prefix test. Rename the two methods and they run; read the "Ran N tests" line, not only OK.`,hi:`Test discovery method naam ke prefix test par depend karti hai. Do methods ka naam badlo aur woh chalenge; sirf OK nahi, "Ran N tests" line padho.`}},{title:{en:`E instead of F`,hi:`F ki jagah E`},ticket:{en:`After adding a new parameter to make_vlan_config, one test shows E. A teammate says the VLAN logic must be wrong. Read the output.`,hi:`make_vlan_config mein naya parameter jodne ke baad ek test E dikhata hai. Teammate kehta hai VLAN logic galat hoga. Output padho.`},out:`E.
======================================================================
ERROR: test_config_lines (test_vlan_tools.TestVlan.test_config_lines)
----------------------------------------------------------------------
Traceback (most recent call last):
  File "test_vlan_tools.py", line 20, in test_config_lines
    self.assertEqual(make_vlan_config(10), ["vlan 10"])
TypeError: make_vlan_config() missing 1 required positional argument: 'name'

----------------------------------------------------------------------
Ran 2 tests in 0.001s

FAILED (errors=1)`,q:{en:`What does the E (error) tell you?`,hi:`E (error) kya batata hai?`},o:[{en:`An assertion was false, so the VLAN logic returned a wrong value`,hi:`Assertion false thi, isliye VLAN logic ne galat value di`},{en:`The switch is unreachable`,hi:`Switch unreachable hai`},{en:`unittest is not installed`,hi:`unittest installed nahi hai`},{en:`The test crashed before it could assert: it calls the function with the old signature, so update the call or the test for the new parameter`,hi:`Test assert karne se pehle crash hua: woh function ko purane signature se call karta hai, isliye naye parameter ke liye call ya test update karo`}],a:3,w:{en:`F means a false assertion, E means an unexpected exception. The TypeError shows a signature mismatch, not wrong logic. Update the test to the new interface (and add a test for the new parameter).`,hi:`F ka matlab false assertion, E ka matlab unexpected exception. TypeError signature mismatch dikhata hai, galat logic nahi. Test ko naye interface par update karo (aur naye parameter ka test jodo).`}},{title:{en:`Which model fits the firmware upgrade?`,hi:`Firmware upgrade ke liye kaun sa model fit hai?`},ticket:{en:`You are asked to recommend how to run the project below. Read the project notes.`,hi:`Aapse neeche ke project ko chalane ka tareeka suggest karne ko kaha gaya hai. Project notes padho.`},out:`PROJECT: Core switch software upgrade, 40 sites
- Scope fixed by the vendor and the regulator, signed off
- Maintenance windows booked 6 months ahead, no scope changes allowed
- Detailed documentation and test evidence required for audit
- Nothing is delivered to users until every site is finished`,q:{en:`Which approach matches this description best?`,hi:`Yeh description kis approach se sabse zyada match karta hai?`},o:[{en:`Agile with two-week sprints and a changing backlog`,hi:`Agile do-hafte ke sprints aur badalte backlog ke saath`},{en:`Waterfall: fixed scope, sign-offs, heavy documentation, delivery at the end`,hi:`Waterfall: fixed scope, sign-offs, bhaari documentation, end mein delivery`},{en:`Lean with no planning at all`,hi:`Bilkul planning ke bina Lean`},{en:`No process is needed for an upgrade`,hi:`Upgrade ke liye kisi process ki zaroorat nahi`}],a:1,w:{en:`Frozen requirements, audit documentation and a single delivery are the classic Waterfall conditions. Agile fits work where requirements keep changing.`,hi:`Frozen requirements, audit documentation aur ek hi delivery classic Waterfall conditions hain. Agile us kaam ke liye fit hai jahan requirements badalti rehti hain.`}},{title:{en:`Where does the validation belong?`,hi:`Validation kahan belong karta hai?`},ticket:{en:`Reviewing a VLAN web app that follows MVC, you find the code below. What is the design problem?`,hi:`MVC follow karne wali VLAN web app review karte hue aapko neeche ka code milta hai. Design problem kya hai?`},out:`class VlanView:
    def render_form_result(self, vid, name):
        if not (1 <= vid <= 4094):          # <-- business rule
            return "<p>Invalid VLAN</p>"
        db.save(vid, name)                  # <-- database write
        return "<p>Saved VLAN %d</p>" % vid`,q:{en:`What is wrong with this view?`,hi:`Is view mein kya galat hai?`},o:[{en:`Nothing: the view should do everything`,hi:`Kuch nahi: view ko sab kuch karna chahiye`},{en:`The HTML should be in the model`,hi:`HTML model mein hona chahiye`},{en:`It holds a business rule and writes to the database; those belong in the model, with the controller coordinating`,hi:`Isme business rule hai aur database write hota hai; yeh model mein belong karte hain, controller coordinate karta hai`},{en:`It should be an Observer instead`,hi:`Ise Observer hona chahiye`}],a:2,w:{en:`A view only presents data. Validation rules and storage belong to the model, and the controller passes input to the model and chooses the view. Mixing them removes the benefits of MVC: you cannot reuse the rule or change the screen safely.`,hi:`View sirf data present karta hai. Validation rules aur storage model ke hain, aur controller input model ko deta hai aur view chunta hai. Inhe mila dene se MVC ke benefits chale jaate hain: rule reuse nahi hota aur screen safely badli nahi ja sakti.`}},{title:{en:`A secret in the diff`,hi:`Diff mein ek secret`},ticket:{en:`You are reviewing this pull request that adds a controller query script. Read the diff.`,hi:`Aap yeh pull request review kar rahe ho jo controller query script jodti hai. Diff padho.`},out:`--- /dev/null
+++ b/query_controller.py
@@ -0,0 +1,9 @@
+import json
+
+BASE = "ctrl.example"
+TOKEN = "k9f3-REDACTED-sample-token"
+
+def get_devices(session):
+    reply = session.get(BASE + "/api/devices", headers={"X-Auth-Token": TOKEN})
+    return json.loads(reply.text)["devices"]`,q:{en:`What should your review comment say?`,hi:`Aapka review comment kya kehna chahiye?`},o:[{en:`Do not hard-code the token: read it from an environment variable or vault, revoke the exposed one, and add a test using a saved sample response`,hi:`Token hard-code mat karo: use environment variable ya vault se padho, jo expose hua use revoke karo, aur saved sample response se test jodo`},{en:`Approve: the file is new, so there is nothing to compare`,hi:`Approve karo: file nayi hai, compare karne ko kuch nahi`},{en:`Ask the author to rename TOKEN to token`,hi:`Author se kaho TOKEN ka naam token karo`},{en:`Ask for a longer file`,hi:`Lambi file maango`}],a:0,w:{en:`--- /dev/null means a new file, and every line is a plus line. A real token committed to history stays readable, so it must be revoked and loaded from the environment. Reviewing diffs line by line is how this is caught.`,hi:`--- /dev/null ka matlab nayi file, aur har line plus line hai. History mein commit hua asli token padha ja sakta hai, isliye use revoke karna aur environment se load karna chahiye. Diff ko line by line padhne se hi yeh pakda jaata hai.`}}];export{e as default};