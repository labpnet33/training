var e=[{title:{en:`The pipeline finished, but nothing ran`,hi:`Pipeline khatam hui, par kuch chala hi nahi`},ticket:{en:`An engineer saved new VLAN tests as vlan_tests.py with functions named check_top and check_over. The pipeline step "unit tests" printed the lines below and the team chat said "finished". The step later turned red in the pipeline. What is going on?`,hi:`Ek engineer ne naye VLAN tests vlan_tests.py mein save kiye, functions ke naam check_top aur check_over. Pipeline ke "unit tests" step ne neeche ki lines print ki aur team chat ne kaha "finished". Baad mein woh step pipeline mein red ho gaya. Kya ho raha hai?`},out:`AUTO01$ ls
netlib.py  samples  vlan_tests.py
AUTO01$ pytest -q; echo "exit code: $?"
============================ no tests ran in 0.01s =============================
exit code: 5`,q:{en:`What is the cause and the fix?`,hi:`Wajah aur fix kya hai?`},o:[{en:`pytest is not installed; run pip install pytest`,hi:`pytest installed nahi hai; pip install pytest chalao`},{en:`The tests passed so fast that pytest printed nothing; no action is needed`,hi:`Tests itne tez pass hue ki pytest ne kuch print nahi kiya; kuch karne ki zaroorat nahi`},{en:`Nothing was collected, so the exit code is 5; rename the file to test_vlan.py and the functions to test_top and test_over`,hi:`Kuch collect nahi hua, isliye exit code 5 hai; file ka naam test_vlan.py aur functions ke naam test_top aur test_over karo`},{en:`Add -v so pytest prints the tests`,hi:`-v jodo taaki pytest tests print kare`}],a:2,w:{en:`pytest collects files named test_*.py and functions named test_*. Anything else is ignored, so "no tests ran" and exit code 5 mean discovery found nothing. A pytest that ran tests would have printed dots and "passed". Rename the file and functions, then check that the passed count matches what you wrote.`,hi:`pytest test_*.py naam ki files aur test_* naam ke functions collect karta hai. Baaki sab ignore hota hai, isliye "no tests ran" aur exit code 5 ka matlab discovery ko kuch nahi mila. Jo pytest tests chalata woh dots aur "passed" print karta. File aur functions rename karo, phir dekho ki passed count aapke likhe tests se milta hai.`}},{title:{en:`VLAN 4094 is rejected by the helper`,hi:`Helper VLAN 4094 ko reject karta hai`},ticket:{en:`The test table says VLAN 4094 must be valid. The suite is red on that one row and green on all others. The docstring of valid_vlan is shown below the test run. Which file do you change?`,hi:`Test table kehti hai ki VLAN 4094 valid hona chahiye. Suite sirf us ek row par red hai aur baaki sab par green. valid_vlan ka docstring test run ke neeche dikhaya gaya hai. Kaunsi file badalte ho?`},out:`AUTO01$ pytest -q --tb=short test_vlan.py
..F...                                                                   [100%]

=================================== FAILURES ===================================
__________________________ test_valid_vlan[4094-True] __________________________
test_vlan.py:8: in test_valid_vlan
    assert valid_vlan(vid) is ok
E   assert False is True
E    +  where False = valid_vlan(4094)
=========================== short test summary info ============================
FAILED test_vlan.py::test_valid_vlan[4094-True] - assert False is True
1 failed, 5 passed in 0.07s
AUTO01$ sed -n '7,8p' netlib.py
def valid_vlan(vid):
    """VLAN ids run from 1 to 4094; 1002-1005 are reserved on Cisco switches."""`,q:{en:`Where is the bug?`,hi:`Bug kahan hai?`},o:[{en:`In valid_vlan: the upper bound excludes 4094, so fix the code`,hi:`valid_vlan mein: upper bound 4094 ko exclude karta hai, to code theek karo`},{en:`In the test: delete the 4094 row`,hi:`Test mein: 4094 wali row delete karo`},{en:`In pytest: reinstall it`,hi:`pytest mein: use dobara install karo`},{en:`Nowhere: mark the row xfail and move on`,hi:`Kahin nahi: row ko xfail mark karo aur aage badho`}],a:0,w:{en:`The docstring says VLAN ids run from 1 to 4094, so the test row agrees with the rule and the code deviates. Only that row fails, which points to the top edge, a classic less-than instead of less-than-or-equal. Fix valid_vlan with vid <= 4094. Deleting the row or hiding it with xfail would remove the protection.`,hi:`Docstring kehta hai VLAN ids 1 se 4094 tak chalte hain, isliye test row rule se match karti hai aur code hatta hai. Sirf wahi row fail hoti hai, jo upar ke kinare ki taraf ishara karti hai, less-than-or-equal ki jagah less-than ki classic galti. valid_vlan ko vid <= 4094 se theek karo. Row delete karna ya xfail se chhupana protection hata deta.`}},{title:{en:`Four lines in the file, three interfaces`,hi:`File mein chaar lines, teen interfaces`},ticket:{en:`test_row_count expects four rows from parse_brief, but the parser returns three. The two neighbouring tests, which list the interface names and the down interface, pass. A teammate wants to change parse_brief to return one more row. Read the evidence.`,hi:`test_row_count parse_brief se chaar rows expect karta hai, par parser teen return karta hai. Do padosi tests, jo interface names aur down interface list karte hain, pass hain. Ek teammate parse_brief ko ek aur row return karwana chahta hai. Saboot padho.`},out:`AUTO01$ pytest -q --tb=line test_parse.py
F..                                                                      [100%]

=================================== FAILURES ===================================
________________________________ test_row_count ________________________________
/home/netadmin/test_parse.py:10: assert 3 == 4
=========================== short test summary info ============================
FAILED test_parse.py::test_row_count - assert 3 == 4
1 failed, 2 passed in 0.04s
AUTO01$ cat samples/brief.txt
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/1     unassigned      YES unset  administratively down down
Loopback0              1.1.1.1         YES manual up                    up`,q:{en:`What is the correct decision?`,hi:`Sahi faisla kya hai?`},o:[{en:`Change parse_brief to return the header line as a fourth row`,hi:`parse_brief ko badlo ki header line ko chautha row banakar return kare`},{en:`Delete test_row_count`,hi:`test_row_count delete karo`},{en:`Mark test_row_count as xfail`,hi:`test_row_count ko xfail mark karo`},{en:`The test is wrong: the first line is a column header, so the expected count is 3`,hi:`Test galat hai: pehli line column header hai, isliye expected count 3 hai`}],a:3,w:{en:`The file has one header line and three interfaces. The parser correctly skips the header, and the neighbouring tests that name exactly three interfaces already pass. The test counted the header. Change the expectation to 3. Changing the parser would break the passing tests and the real behaviour.`,hi:`File mein ek header line aur teen interfaces hain. Parser header ko sahi skip karta hai, aur padosi tests jo theek teen interfaces ke naam dete hain pehle se pass hain. Test ne header ko gin liya. Expectation ko 3 karo. Parser badalne se pass hone wale tests aur asli behaviour dono toot jaate.`}},{title:{en:`Green alone, red together`,hi:`Akela green, saath mein red`},ticket:{en:`test_second_starts_empty fails when the file runs, yet an engineer says "it works on my laptop" and runs it by itself. Compare the two runs and the fixture line.`,hi:`test_second_starts_empty file chalne par fail hota hai, phir bhi ek engineer kehta hai "mere laptop par chalta hai" aur use akela chalata hai. Dono runs aur fixture line compare karo.`},out:`AUTO01$ pytest -q --tb=short test_state.py
.F                                                                       [100%]

=================================== FAILURES ===================================
___________________________ test_second_starts_empty ___________________________
test_state.py:15: in test_second_starts_empty
    assert seen == []
E   assert ['R1'] == []
E     Left contains one more item: 'R1'
E     Use -v to get more diff
=========================== short test summary info ============================
FAILED test_state.py::test_second_starts_empty - assert ['R1'] == []
1 failed, 1 passed in 0.03s
AUTO01$ pytest -q test_state.py -k second
.                                                                        [100%]
1 passed in 0.02s
AUTO01$ grep -n fixture test_state.py
4:@pytest.fixture(scope="module")`,q:{en:`What is the root cause and fix?`,hi:`Asli wajah aur fix kya hai?`},o:[{en:`pytest is flaky; rerun until it passes`,hi:`pytest flaky hai; pass hone tak dobara chalao`},{en:`Both tests share one list through a module-scoped fixture; remove the scope so every test gets a new list`,hi:`Dono tests module-scoped fixture se ek hi list share karte hain; scope hatao taaki har test ko nayi list mile`},{en:`Add a sleep before the assert`,hi:`assert se pehle sleep jodo`},{en:`Run with -x so the failure is hidden`,hi:`-x se chalao taaki failure chhup jaye`}],a:1,w:{en:`It passes alone because the first test never ran, so the list was empty. In the full file the first test appends "R1" to the same list and the second sees it. This is shared state, caused by the wide scope. A plain function-scoped fixture gives each test a fresh list.`,hi:`Yeh akela isliye pass hota hai kyunki pehla test chala hi nahi, to list khali thi. Poori file mein pehla test usi list mein "R1" append karta hai aur doosra use dekhta hai. Yeh shared state hai, chauda scope ki wajah se. Plain function-scoped fixture har test ko nayi list deta hai.`}},{title:{en:`The hostname comes back as the word hostname`,hi:`Hostname ki jagah shabd hostname aata hai`},ticket:{en:`The fake connection answers hostname PUN-CORE-R1, exactly like the router. The test expects PUN-CORE-R1. It fails. A teammate wants to change the test to expect "hostname". Look at the evidence first.`,hi:`Fake connection hostname PUN-CORE-R1 jawab deta hai, bilkul router ki tarah. Test PUN-CORE-R1 expect karta hai. Yeh fail hota hai. Ek teammate test ko "hostname" expect karne ke liye badalna chahta hai. Pehle saboot dekho.`},out:`AUTO01$ pytest -q --tb=line test_conn.py
F                                                                        [100%]

=================================== FAILURES ===================================
________________________________ test_hostname _________________________________
/home/netadmin/test_conn.py:14: AssertionError: assert 'hostname' == 'PUN-CORE-R1'
=========================== short test summary info ============================
FAILED test_conn.py::test_hostname - assert 'hostname' == 'PUN-CORE-R1'
1 failed in 0.02s
AUTO01$ grep -n "split" netlib.py
30:    for line in text.splitlines():
31:        parts = line.split()
55:    return line.split()[0] if line.startswith("hostname") else None`,q:{en:`What do you change?`,hi:`Kya badalte ho?`},o:[{en:`The test: expect "hostname"`,hi:`Test: "hostname" expect karo`},{en:`The fake: make it return only the name`,hi:`Fake: use sirf naam return karne do`},{en:`The code: read_hostname must take the last word, so [0] becomes [-1]`,hi:`Code: read_hostname ko aakhri shabd lena chahiye, isliye [0] ko [-1] karo`},{en:`The place of the patch`,hi:`Patch ki jagah`}],a:2,w:{en:`A router prints the line "hostname NAME", so the name is the last word. The code returns index 0, which is the word hostname. The fake and the test are right. Fix line.split()[0] to line.split()[-1], rerun the file, then the whole suite. Changing the test would make every backup file be named hostname.cfg.`,hi:`Router "hostname NAME" line print karta hai, isliye naam aakhri shabd hai. Code index 0 return karta hai, jo shabd hostname hai. Fake aur test sahi hain. line.split()[0] ko line.split()[-1] karo, file chalao, phir poori suite. Test badalne se har backup file ka naam hostname.cfg ho jaata.`}},{title:{en:`The fake was never used`,hi:`Fake kabhi use hi nahi hua`},ticket:{en:`A test patches the SSH library with a fake and asserts that the fake was called. It fails, and the run took almost a second, far longer than a unit test. The module netlib begins with from nkmiko import ConnectHandler, and the test calls monkeypatch.setattr(nkmiko, "ConnectHandler", ...). Why?`,hi:`Ek test SSH library ko fake se patch karta hai aur assert karta hai ki fake call hua. Yeh fail hota hai, aur run mein lagbhag ek second laga, jo unit test se bahut zyada hai. Module netlib from nkmiko import ConnectHandler se shuru hota hai, aur test monkeypatch.setattr(nkmiko, "ConnectHandler", ...) call karta hai. Kyon?`},out:`AUTO01$ pytest -q --tb=short test_place.py
F.                                                                       [100%]

=================================== FAILURES ===================================
_______________________________ test_wrong_place _______________________________
test_place.py:17: in test_wrong_place
    assert used == [1]
E   assert [] == [1]
E     Right contains one more item: 1
E     Use -v to get more diff
=========================== short test summary info ============================
FAILED test_place.py::test_wrong_place - assert [] == [1]
1 failed, 1 passed in 0.88s`,q:{en:`What went wrong?`,hi:`Kya galat hua?`},o:[{en:`FakeConn is missing a method`,hi:`FakeConn mein ek method missing hai`},{en:`The used list was cleared by pytest`,hi:`used list ko pytest ne clear kar diya`},{en:`monkeypatch does not work with lambdas`,hi:`monkeypatch lambdas ke saath kaam nahi karta`},{en:`netlib holds its own copy of the name, so patching nkmiko changed nothing for it and the real router was contacted; patch netlib.ConnectHandler or netlib.connect`,hi:`netlib ke paas naam ki apni copy hai, isliye nkmiko patch karne se uske liye kuch nahi badla aur asli router se baat hui; netlib.ConnectHandler ya netlib.connect patch karo`}],a:3,w:{en:`from nkmiko import ConnectHandler copies the name into netlib at import time. The code looks the name up in netlib, so the patch must be applied there. The 0.88 second run time shows the test reached the real router. Patch where the name is used.`,hi:`from nkmiko import ConnectHandler naam ko import ke waqt netlib mein copy kar deta hai. Code naam ko netlib mein lookup karta hai, isliye patch wahin lagana hoga. 0.88 second ka run time dikhata hai ki test asli router tak pahuncha. Naam wahan patch karo jahan use hota hai.`}},{title:{en:`The regex did not match`,hi:`Regex match nahi hua`},ticket:{en:`A test expects vlan_range("abc") to raise a ValueError whose message matches "backwards". The error is raised, yet the test is red. The real message is shown below. Decide which side is wrong.`,hi:`Ek test expect karta hai ki vlan_range("abc") ValueError raise kare jiska message "backwards" se match kare. Error raise hota hai, phir bhi test red hai. Asli message neeche dikhaya gaya hai. Tay karo ki kaunsi side galat hai.`},out:`AUTO01$ pytest -q --tb=short test_range.py
F                                                                        [100%]

=================================== FAILURES ===================================
________________________________ test_backwards ________________________________
test_range.py:8: in test_backwards
    vlan_range("abc")
E   AssertionError: Regex pattern did not match.
E    Regex: 'backwards'
E    Input: "not a range: 'abc'"
=========================== short test summary info ============================
FAILED test_range.py::test_backwards - AssertionError: Regex pattern did not ...
1 failed in 0.02s
AUTO01$ grep -n "not a range" netlib.py
18:        raise ValueError(f"not a range: {text!r}")`,q:{en:`Which fix is right?`,hi:`Kaunsa fix sahi hai?`},o:[{en:`Change the code so every error message contains the word backwards`,hi:`Code badlo ki har error message mein shabd backwards aaye`},{en:`The test is wrong: "abc" is not a backwards range; test a backwards input such as "20-10", or match "not a range"`,hi:`Test galat hai: "abc" backwards range nahi hai; backwards input jaise "20-10" test karo, ya "not a range" match karo`},{en:`Replace pytest.raises by try/except with pass`,hi:`pytest.raises ki jagah pass ke saath try/except use karo`},{en:`Mark the test xfail`,hi:`Test ko xfail mark karo`}],a:1,w:{en:`The code raised the right type of error with an accurate message for an input that is simply not a range. The test mixed up two cases. Use "20-10" for the backwards case, or match "not a range" for "abc". A try/except with pass would pass even when nothing is raised, and xfail would only hide the mistake.`,hi:`Code ne sahi type ka error aur sahi message diya ek aise input ke liye jo range hai hi nahi. Test ne do cases mila diye. Backwards case ke liye "20-10" use karo, ya "abc" ke liye "not a range" match karo. Pass ke saath try/except tab bhi pass hota jab kuch raise na ho, aur xfail galti ko bas chhupata.`}}];export{e as default};