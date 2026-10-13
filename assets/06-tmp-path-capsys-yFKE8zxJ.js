var e={id:`tmp-path-capsys`,h:{en:`tmp_path and capsys: testing files and printed output`,hi:`tmp_path aur capsys: files aur printed output ko test karna`},body:{en:`
<p><b>The idea of this chapter:</b> network scripts write backup files and print reports. A good test checks both without leaving a mess. pytest gives you two built-in fixtures for this: <code>tmp_path</code>, a private empty folder per test, and <code>capsys</code>, which catches what a function prints. You will use <code>tmp_path</code> for Lab 1, task 4.</p>

<h3>Analogy: a disposable test bench</h3>
<p>An electronics lab does not test a new circuit on the customer's equipment. The engineer uses a clean bench, and when the test ends the bench is cleared. <code>tmp_path</code> is that bench for files: new for every test, and nothing from it reaches your project folder.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Each test gets its own empty tmp_path folder, away from the project folder">
<rect x="20" y="20" width="190" height="110" rx="10" fill="#e2e8f0"/><text x="115" y="44" text-anchor="middle" class="svg-ink" font-size="13">/home/netadmin</text><text x="115" y="68" text-anchor="middle" class="svg-muted" font-size="11">netlib.py, tests</text><text x="115" y="90" text-anchor="middle" class="svg-muted" font-size="11">stays clean</text>
<rect x="260" y="15" width="170" height="50" rx="10" fill="#bbf7d0"/><text x="345" y="45" text-anchor="middle" class="svg-ink" font-size="12">tmp_path of test A</text>
<rect x="260" y="85" width="170" height="50" rx="10" fill="#bbf7d0"/><text x="345" y="115" text-anchor="middle" class="svg-ink" font-size="12">tmp_path of test B</text>
<rect x="470" y="40" width="150" height="70" rx="10" fill="#fde68a"/><text x="545" y="68" text-anchor="middle" class="svg-ink" font-size="12">save_backup()</text><text x="545" y="88" text-anchor="middle" class="svg-muted" font-size="11">writes R1.cfg</text>
<line x1="470" y1="75" x2="430" y2="40" stroke="#64748b" stroke-width="2"/><line x1="470" y1="75" x2="430" y2="110" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Every test writes in its own folder, never in the project.</p></div>

<h3>What save_backup does</h3>
<pre class="code">def save_backup(folder, host, text):
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, host + ".cfg")
    with open(path, "w") as f:
        f.write(text)
    return path</pre>
<p>It creates the folder if it is missing, writes <code>host.cfg</code>, and returns the path as a string. Testing it against a real <code>backups</code> folder would leave files behind, and the next run might pass only because an old file was already there. So the test writes into <code>tmp_path</code>.</p>

<h3>The backup test</h3>
<p>Write <code>test_backup.py</code>:</p>
<pre class="code">from netlib import save_backup


def test_backup_file(tmp_path):
    path = save_backup(tmp_path / "bk", "R1", "hostname R1\\n")
    assert open(path).read() == "hostname R1\\n"
    assert path.endswith("R1.cfg")</pre>
<ul>
<li><code>tmp_path</code> is a fixture you do not define; naming it as an argument is enough. It is a <code>pathlib.Path</code> pointing at a fresh, empty folder.</li>
<li><code>tmp_path / "bk"</code> builds a sub-path with the <code>/</code> operator. The folder <code>bk</code> does not exist yet, so the test also proves that <code>save_backup</code> creates it.</li>
<li>The first assert reads the file back and compares the content. The second checks the name. <code>path.endswith</code> works because <code>save_backup</code> returns a string; a <code>Path</code> object would use <code>path.name</code> instead.</li>
</ul>
<pre class="out">AUTO01$ pytest -q test_backup.py
.                                                                        [100%]
<span class="hl">1 passed in 0.02s</span>
AUTO01$ ls
conftest.py  netlib.py  samples  test_backup.py  test_parse.py  test_table.py  test_vlan.py</pre>
<p>Answer to task 4: <b>no</b>, there is no <code>bk</code> folder in the home folder. The file went into a temporary folder that pytest manages.</p>

<h3>More things to check in a folder</h3>
<p>Because <code>tmp_path</code> is a normal <code>Path</code>, you can list and read it:</p>
<pre class="code">from netlib import save_backup


def test_two_hosts(tmp_path):
    save_backup(tmp_path, "R1", "hostname R1\\n")
    save_backup(tmp_path, "R2", "hostname R2\\n")
    names = sorted(p.name for p in tmp_path.iterdir())
    assert names == ["R1.cfg", "R2.cfg"]


def test_nested_folder(tmp_path):
    folder = tmp_path / "deep" / "er"
    save_backup(folder, "SW1", "hostname SW1\\n")
    assert (folder / "SW1.cfg").read_text() == "hostname SW1\\n"


def test_fresh_each_time(tmp_path):
    assert list(tmp_path.iterdir()) == []</pre>
<pre class="out">AUTO01$ pytest -q test_tmp.py
...                                                                      [100%]
3 passed in 0.04s</pre>
<p>The third test is the proof of isolation: even after the first two tests wrote files, this test finds its folder empty. Each test gets its own.</p>

<h3>A fixture built on tmp_path</h3>
<p>When several tests need an empty backup folder that already exists, wrap it in a fixture. Fixtures can use fixtures:</p>
<pre class="code">import pytest


@pytest.fixture
def backup_dir(tmp_path):
    folder = tmp_path / "bk"
    folder.mkdir()
    return folder


def test_empty(backup_dir):
    assert list(backup_dir.iterdir()) == []


def test_file(backup_dir):
    (backup_dir / "R1.cfg").write_text("hostname R1\\n")
    assert [p.name for p in backup_dir.iterdir()] == ["R1.cfg"]</pre>
<pre class="out">AUTO01$ pytest -q test_auto.py
..                                                                       [100%]
2 passed in 0.03s</pre>

<h3>capsys: testing what a function prints</h3>
<p>Report functions print for humans. To test them, ask for <code>capsys</code> and read what was printed. This extra example is not one of the lab tasks, but you can create both files on AUTO01. It reuses the sample from Chapter 5.</p>
<pre class="code">from netlib import interfaces_down, parse_brief


def print_report(text):
    rows = parse_brief(text)
    down = interfaces_down(rows)
    print(f"{len(rows)} interfaces, {len(down)} down")
    for name in down:
        print(f"  DOWN {name}")</pre>
<p>Save that as <code>report.py</code>, then write <code>test_report.py</code>:</p>
<pre class="code">from report import print_report


def test_report(capsys, brief):
    print_report(brief)
    out = capsys.readouterr().out
    assert out == "3 interfaces, 1 down\\n  DOWN GigabitEthernet0/1\\n"


def test_report_lines(capsys, brief):
    print_report(brief)
    lines = capsys.readouterr().out.splitlines()
    assert lines[0].startswith("3 interfaces")
    assert "  DOWN GigabitEthernet0/1" in lines</pre>
<pre class="out">AUTO01$ pytest -q test_report.py
..                                                                       [100%]
2 passed in 0.03s</pre>
<p><code>capsys.readouterr()</code> returns what was written so far; <code>.out</code> is standard output and <code>.err</code> is standard error. The second test shows a kinder style: split into lines and check the parts that matter, so a harmless spacing change does not break it. Use <code>capsys</code> for report functions, and leave exact formatting to a single test.</p>

<div class="warn"><p><b>Common mistakes.</b> Writing test files into the project folder and forgetting them. Comparing a string with a <code>Path</code> object. Testing a function that prints and returns nothing, but never reading the output. Reusing one folder between tests so results depend on order.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>tmp_path</code> and <code>capsys</code> are built-in fixtures: you request them by name, you do not import them. <code>tmp_path</code> is a <code>pathlib.Path</code>, and each test gets a different one.</p></div>

<div class="scn"><h4>The backup test that passed by accident</h4><p>A team tested their backup function against a folder called <code>backups</code> in the project. The function silently failed to write for a new hostname, but the old file from last week was still there, so the test passed. Moving the test to <code>tmp_path</code> made the folder empty at the start, and the missing write failed at once.</p><p><b>Lesson:</b> a test must start from a known empty state, or it can pass for the wrong reason.</p></div>

<div class="iv"><p class="q">"How do you unit test a function that writes a file?"</p><p>I give it a temporary folder from the tmp_path fixture, call the function, then read the file back and assert on its content and name. The folder is new for every test, so no state leaks between tests and the project stays clean.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>tmp_path</code> is a fresh empty <code>pathlib.Path</code> folder for each test.</li>
<li>Write the file, read it back, and assert on content and name.</li>
<li>The project folder stays clean, so no <code>bk</code> folder appears after the test.</li>
<li><code>capsys.readouterr().out</code> returns what a function printed.</li>
<li>Check the meaningful lines of a report, not every space.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> network scripts backup files likhti hain aur reports print karti hain. Achha test dono ko bina gandagi chhode check karta hai. pytest iske liye do built-in fixtures deta hai: <code>tmp_path</code>, har test ka private khali folder, aur <code>capsys</code>, jo function ke print kiye hue ko pakadta hai. Lab 1, task 4 ke liye <code>tmp_path</code> use karoge.</p>

<h3>Analogy: disposable test bench</h3>
<p>Electronics lab naya circuit customer ke equipment par test nahi karta. Engineer saaf bench use karta hai, aur test khatam hone par bench saaf kar di jaati hai. <code>tmp_path</code> files ke liye wahi bench hai: har test ke liye nayi, aur usse kuch bhi aapke project folder tak nahi pahunchta.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Har test ko apna khali tmp_path folder milta hai, project folder se door">
<rect x="20" y="20" width="190" height="110" rx="10" fill="#e2e8f0"/><text x="115" y="44" text-anchor="middle" class="svg-ink" font-size="13">/home/netadmin</text><text x="115" y="68" text-anchor="middle" class="svg-muted" font-size="11">netlib.py, tests</text><text x="115" y="90" text-anchor="middle" class="svg-muted" font-size="11">saaf rehta hai</text>
<rect x="260" y="15" width="170" height="50" rx="10" fill="#bbf7d0"/><text x="345" y="45" text-anchor="middle" class="svg-ink" font-size="12">test A ka tmp_path</text>
<rect x="260" y="85" width="170" height="50" rx="10" fill="#bbf7d0"/><text x="345" y="115" text-anchor="middle" class="svg-ink" font-size="12">test B ka tmp_path</text>
<rect x="470" y="40" width="150" height="70" rx="10" fill="#fde68a"/><text x="545" y="68" text-anchor="middle" class="svg-ink" font-size="12">save_backup()</text><text x="545" y="88" text-anchor="middle" class="svg-muted" font-size="11">R1.cfg likhta hai</text>
<line x1="470" y1="75" x2="430" y2="40" stroke="#64748b" stroke-width="2"/><line x1="470" y1="75" x2="430" y2="110" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Har test apne folder mein likhta hai, project mein kabhi nahi.</p></div>

<h3>save_backup kya karta hai</h3>
<pre class="code">def save_backup(folder, host, text):
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, host + ".cfg")
    with open(path, "w") as f:
        f.write(text)
    return path</pre>
<p>Folder missing ho to banata hai, <code>host.cfg</code> likhta hai, aur path string ki tarah return karta hai. Ise asli <code>backups</code> folder par test karne se files peeche reh jaati, aur agla run sirf isliye pass ho sakta tha ki purani file pehle se wahan thi. Isliye test <code>tmp_path</code> mein likhta hai.</p>

<h3>Backup test</h3>
<p><code>test_backup.py</code> likho:</p>
<pre class="code">from netlib import save_backup


def test_backup_file(tmp_path):
    path = save_backup(tmp_path / "bk", "R1", "hostname R1\\n")
    assert open(path).read() == "hostname R1\\n"
    assert path.endswith("R1.cfg")</pre>
<ul>
<li><code>tmp_path</code> aisa fixture hai jo aap define nahi karte; argument ki tarah naam dena kaafi hai. Yeh ek <code>pathlib.Path</code> hai jo fresh, khali folder ki taraf point karta hai.</li>
<li><code>tmp_path / "bk"</code> <code>/</code> operator se sub-path banata hai. Folder <code>bk</code> abhi exist nahi karta, isliye test yeh bhi saabit karta hai ki <code>save_backup</code> use banata hai.</li>
<li>Pehla assert file ko wapas padhta hai aur content compare karta hai. Doosra naam check karta hai. <code>path.endswith</code> isliye chalta hai kyunki <code>save_backup</code> string return karta hai; <code>Path</code> object hota to <code>path.name</code> use karte.</li>
</ul>
<pre class="out">AUTO01$ pytest -q test_backup.py
.                                                                        [100%]
<span class="hl">1 passed in 0.02s</span>
AUTO01$ ls
conftest.py  netlib.py  samples  test_backup.py  test_parse.py  test_table.py  test_vlan.py</pre>
<p>Task 4 ka jawab: <b>no</b>, home folder mein <code>bk</code> folder nahi hai. File ek temporary folder mein gayi jise pytest manage karta hai.</p>

<h3>Folder mein aur kya check karein</h3>
<p><code>tmp_path</code> normal <code>Path</code> hai, isliye aap use list aur read kar sakte ho:</p>
<pre class="code">from netlib import save_backup


def test_two_hosts(tmp_path):
    save_backup(tmp_path, "R1", "hostname R1\\n")
    save_backup(tmp_path, "R2", "hostname R2\\n")
    names = sorted(p.name for p in tmp_path.iterdir())
    assert names == ["R1.cfg", "R2.cfg"]


def test_nested_folder(tmp_path):
    folder = tmp_path / "deep" / "er"
    save_backup(folder, "SW1", "hostname SW1\\n")
    assert (folder / "SW1.cfg").read_text() == "hostname SW1\\n"


def test_fresh_each_time(tmp_path):
    assert list(tmp_path.iterdir()) == []</pre>
<pre class="out">AUTO01$ pytest -q test_tmp.py
...                                                                      [100%]
3 passed in 0.04s</pre>
<p>Teesra test isolation ka saboot hai: pehle do tests ne files likhi, phir bhi yeh test apna folder khali paata hai. Har test ko apna milta hai.</p>

<h3>tmp_path par bana fixture</h3>
<p>Jab kai tests ko aisa khali backup folder chahiye jo pehle se bana ho, use fixture mein lapeto. Fixtures fixtures ko use kar sakte hain:</p>
<pre class="code">import pytest


@pytest.fixture
def backup_dir(tmp_path):
    folder = tmp_path / "bk"
    folder.mkdir()
    return folder


def test_empty(backup_dir):
    assert list(backup_dir.iterdir()) == []


def test_file(backup_dir):
    (backup_dir / "R1.cfg").write_text("hostname R1\\n")
    assert [p.name for p in backup_dir.iterdir()] == ["R1.cfg"]</pre>
<pre class="out">AUTO01$ pytest -q test_auto.py
..                                                                       [100%]
2 passed in 0.03s</pre>

<h3>capsys: function ne kya print kiya, yeh test karna</h3>
<p>Report functions insaanon ke liye print karte hain. Unhe test karne ke liye <code>capsys</code> maango aur print hua text padho. Yeh extra example lab tasks mein nahi hai, par dono files AUTO01 par bana sakte ho. Yeh Chapter 5 ke sample ko hi use karta hai.</p>
<pre class="code">from netlib import interfaces_down, parse_brief


def print_report(text):
    rows = parse_brief(text)
    down = interfaces_down(rows)
    print(f"{len(rows)} interfaces, {len(down)} down")
    for name in down:
        print(f"  DOWN {name}")</pre>
<p>Ise <code>report.py</code> naam se save karo, phir <code>test_report.py</code> likho:</p>
<pre class="code">from report import print_report


def test_report(capsys, brief):
    print_report(brief)
    out = capsys.readouterr().out
    assert out == "3 interfaces, 1 down\\n  DOWN GigabitEthernet0/1\\n"


def test_report_lines(capsys, brief):
    print_report(brief)
    lines = capsys.readouterr().out.splitlines()
    assert lines[0].startswith("3 interfaces")
    assert "  DOWN GigabitEthernet0/1" in lines</pre>
<pre class="out">AUTO01$ pytest -q test_report.py
..                                                                       [100%]
2 passed in 0.03s</pre>
<p><code>capsys.readouterr()</code> ab tak likha hua return karta hai; <code>.out</code> standard output hai aur <code>.err</code> standard error. Doosra test narm style dikhata hai: lines mein todo aur sirf kaam ke hisse check karo, taaki harmless spacing change se woh na toote. Report functions ke liye <code>capsys</code> use karo, aur exact formatting ek hi test par chhodo.</p>

<div class="warn"><p><b>Common mistakes.</b> Test files ko project folder mein likhkar bhool jaana. String ko <code>Path</code> object se compare karna. Aise function ko test karna jo print karta hai aur kuch return nahi karta, par output kabhi nahi padhna. Tests ke beech ek hi folder reuse karna, jisse results order par depend karein.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>tmp_path</code> aur <code>capsys</code> built-in fixtures hain: naam se maangte ho, import nahi karte. <code>tmp_path</code> ek <code>pathlib.Path</code> hai, aur har test ko alag milta hai.</p></div>

<div class="scn"><h4>Backup test jo ittefaq se pass hua</h4><p>Ek team ne apna backup function project mein <code>backups</code> naam ke folder par test kiya. Function ek naye hostname ke liye chupchaap likhne mein fail hua, par pichhle hafte ki purani file wahin thi, isliye test pass ho gaya. Test ko <code>tmp_path</code> par le jaane se folder shuru mein khali tha, aur missing write turant fail hua.</p><p><b>Lesson:</b> test ko ek jaani-pehchani khali state se shuru karna chahiye, warna woh galat wajah se pass ho sakta hai.</p></div>

<div class="iv"><p class="q">"File likhne wale function ko unit test kaise karte ho?"</p><p>Use tmp_path fixture se temporary folder deta hoon, function call karta hoon, phir file wapas padhkar uske content aur naam par assert karta hoon. Folder har test ke liye naya hota hai, isliye tests ke beech state leak nahi hoti aur project saaf rehta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>tmp_path</code> har test ke liye fresh khali <code>pathlib.Path</code> folder hai.</li>
<li>File likho, wapas padho, aur content tatha naam par assert karo.</li>
<li>Project folder saaf rehta hai, isliye test ke baad <code>bk</code> folder nahi dikhta.</li>
<li><code>capsys.readouterr().out</code> function ka print kiya hua text deta hai.</li>
<li>Report ki kaam ki lines check karo, har space nahi.</li>
</ul></div>
`}};export{e as default};