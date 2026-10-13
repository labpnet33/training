var e={id:`fixtures-conftest`,h:{en:`Fixtures and conftest.py: sample show output for every test`,hi:`Fixtures aur conftest.py: har test ke liye sample show output`},body:{en:`
<p><b>The idea of this chapter:</b> many tests need the same starting material, here a saved <code>show ip interface brief</code>. A <b>fixture</b> is a small function that prepares that material, and any test that names it as an argument receives it. You will build the <code>brief</code> fixture in <code>conftest.py</code> for Lab 1, task 3, then learn setup and teardown with <code>yield</code> and what <code>scope</code> means.</p>

<h3>Analogy: the lab fridge with labelled samples</h3>
<p>In a laboratory nobody grows a new sample for every experiment. A technician keeps labelled samples, and each experiment says "give me sample brief". A fixture is the label and the recipe; the test just asks by name.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Tests ask for brief by name, conftest.py supplies it from samples/brief.txt">
<rect x="20" y="50" width="150" height="50" rx="10" fill="#e2e8f0"/><text x="95" y="80" text-anchor="middle" class="svg-ink" font-size="12">samples/brief.txt</text>
<rect x="230" y="50" width="150" height="50" rx="10" fill="#fde68a"/><text x="305" y="73" text-anchor="middle" class="svg-ink" font-size="12">conftest.py</text><text x="305" y="90" text-anchor="middle" class="svg-muted" font-size="11">fixture brief</text>
<rect x="450" y="10" width="170" height="38" rx="8" fill="#bae6fd"/><text x="535" y="34" text-anchor="middle" class="svg-ink" font-size="12">test_rows(brief)</text>
<rect x="450" y="56" width="170" height="38" rx="8" fill="#bae6fd"/><text x="535" y="80" text-anchor="middle" class="svg-ink" font-size="12">test_status(brief)</text>
<rect x="450" y="102" width="170" height="38" rx="8" fill="#bae6fd"/><text x="535" y="126" text-anchor="middle" class="svg-ink" font-size="12">test_down(brief)</text>
<line x1="170" y1="75" x2="230" y2="75" stroke="#64748b" stroke-width="2"/><line x1="380" y1="75" x2="450" y2="29" stroke="#64748b" stroke-width="2"/><line x1="380" y1="75" x2="450" y2="75" stroke="#64748b" stroke-width="2"/><line x1="380" y1="75" x2="450" y2="121" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">One fixture, three tests, no copy-paste.</p></div>

<h3>The brief fixture</h3>
<p>Fixtures that many files need live in <code>conftest.py</code>. pytest reads that file on its own; you never import it.</p>
<pre class="code">import pytest


@pytest.fixture
def brief():
    with open("samples/brief.txt") as f:
        return f.read()</pre>
<p>Now <code>test_parse.py</code>. Each test lists <code>brief</code> as a parameter:</p>
<pre class="code">from netlib import interfaces_down, parse_brief


def test_rows(brief):
    assert len(parse_brief(brief)) == 3


def test_status(brief):
    assert parse_brief(brief)[1]["status"] == "administratively down"


def test_down(brief):
    assert interfaces_down(parse_brief(brief)) == ["GigabitEthernet0/1"]</pre>
<ul>
<li><code>@pytest.fixture</code> marks <code>brief</code> as a fixture, not a test.</li>
<li>When pytest sees the argument name <code>brief</code> in a test, it calls the fixture and passes in the return value, here the text of the file.</li>
<li>The sample has three interfaces, so <code>test_rows</code> expects 3 rows. Row 1 (counting from 0) is <code>GigabitEthernet0/1</code>, whose status is two words, which is why the parser joins <code>parts[4:-1]</code>.</li>
<li>The path <code>samples/brief.txt</code> is relative to the folder you start pytest in, so run it from your home folder.</li>
</ul>
<pre class="out">AUTO01$ pytest -q test_parse.py
...                                                                      [100%]
<span class="hl">3 passed in 0.04s</span></pre>
<p>Answer to task 3: the interface reported as down is <b>GigabitEthernet0/1</b>. The Loopback and Gi0/0 have protocol up. Notice that <code>interfaces_down</code> looks at the protocol column, not the admin status.</p>

<h3>Fixtures can use other fixtures</h3>
<p>A fixture may take another fixture as a parameter, so you build material in layers:</p>
<pre class="code">import pytest

from netlib import parse_brief


@pytest.fixture
def rows(brief):
    return parse_brief(brief)


def test_names(rows):
    assert [r["name"] for r in rows] == ["GigabitEthernet0/0", "GigabitEthernet0/1", "Loopback0"]


def test_loopback(rows):
    assert rows[-1]["ip"] == "1.1.1.1"</pre>
<pre class="out">AUTO01$ pytest -q test_chain.py
..                                                                       [100%]
2 passed in 0.03s</pre>
<p>A fixture defined inside a test file is visible only in that file. One in <code>conftest.py</code> is visible to every test file in the folder. If a name is wrong, pytest reports an error at setup, <code>fixture 'name' not found</code>, instead of a failure.</p>

<h3>Setup, teardown and yield</h3>
<p>A fixture that opens something should also close it. Use <code>yield</code> instead of <code>return</code>: the code before <code>yield</code> is setup, the value after it goes to the test, and the code after it is <b>teardown</b>, which runs even when the test fails. Real examples are closing an SSH session or removing a temporary file. Here a list proves the teardown ran:</p>
<pre class="code">import pytest

closed = []


@pytest.fixture
def session():
    yield "R1-session"
    closed.append("R1")


def test_a(session):
    assert closed == []


def test_b(session):
    assert closed == ["R1"]</pre>
<pre class="out">AUTO01$ pytest -q test_teardown.py
..                                                                       [100%]
2 passed in 0.03s</pre>
<p><code>test_b</code> sees <code>["R1"]</code> only because the teardown of <code>test_a</code> ran after <code>test_a</code> finished.</p>

<h3>Scope: how long a fixture lives</h3>
<p>By default a fixture is rebuilt for every test (<b>function scope</b>). That is safe: each test starts clean. With <code>scope="module"</code> it is built once per test file and shared:</p>
<pre class="code">import pytest

built = []


@pytest.fixture(scope="module")
def inventory():
    built.append("built")
    return ["R1", "R2", "SW1"]


def test_one(inventory):
    assert len(inventory) == 3


def test_two(inventory):
    assert "R2" in inventory


def test_built_once():
    assert built == ["built"]</pre>
<pre class="out">AUTO01$ pytest -q test_scope2.py
...                                                                      [100%]
3 passed in 0.04s</pre>
<p>In the lab a module-scoped fixture is shared within one test file, as in real pytest. Use a wider scope only for material that is slow to build and never changed by a test. If a test modifies a shared list, the next test sees the change. Lab 2 has exactly that bug.</p>

<div class="warn"><p><b>Common mistakes.</b> Calling the fixture like a function (<code>brief()</code>) instead of taking it as an argument. Opening a file path that only works from one folder. Using <code>return</code> where cleanup is needed. Sharing a mutable list or dictionary with a wide scope.</p></div>
<div class="exam"><p><b>Exam trap.</b> A fixture is requested by <i>parameter name</i>, not imported. Default scope is function. Teardown is the part after <code>yield</code>. <code>conftest.py</code> is picked up automatically.</p></div>

<div class="scn"><h4>Fifteen copies of the same sample</h4><p>A parser suite had fifteen tests, each opening a different pasted copy of a show command. When the platform team changed the output format, nobody knew which copy was current. Moving the sample into one fixture and one file meant one edit updated every test, and the diff showed the format change clearly.</p><p><b>Lesson:</b> keep one source of truth for sample device output.</p></div>

<div class="iv"><p class="q">"What is a pytest fixture and where do you put one?"</p><p>A fixture is a function that supplies setup material, such as sample show output or a temporary folder. Tests request it by naming it as an argument. I put shared ones in conftest.py, use yield for teardown, and keep the default function scope unless building is expensive and the data is read-only.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>@pytest.fixture</code> turns a function into reusable setup; tests request it by argument name.</li>
<li><code>conftest.py</code> shares fixtures with every test file in the folder, with no import.</li>
<li>Code after <code>yield</code> is teardown and runs even if the test fails.</li>
<li>Default scope is per test; <code>scope="module"</code> shares one object per file.</li>
<li>Never share a mutable object across tests that change it.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> kai tests ko wahi starting material chahiye, yahan saved <code>show ip interface brief</code>. <b>Fixture</b> ek chhota function hai jo woh material taiyaar karta hai, aur jo test usse argument ki tarah naam de, use mil jaata hai. Lab 1, task 3 ke liye <code>conftest.py</code> mein <code>brief</code> fixture banaoge, phir <code>yield</code> se setup aur teardown, aur <code>scope</code> ka matlab seekhoge.</p>

<h3>Analogy: labelled samples wala lab fridge</h3>
<p>Laboratory mein har experiment ke liye koi naya sample nahi ugata. Technician labelled samples rakhta hai, aur har experiment kehta hai "mujhe sample brief do". Fixture label aur recipe hai; test bas naam se maangta hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Tests naam se brief maangte hain, conftest.py use samples/brief.txt se deta hai">
<rect x="20" y="50" width="150" height="50" rx="10" fill="#e2e8f0"/><text x="95" y="80" text-anchor="middle" class="svg-ink" font-size="12">samples/brief.txt</text>
<rect x="230" y="50" width="150" height="50" rx="10" fill="#fde68a"/><text x="305" y="73" text-anchor="middle" class="svg-ink" font-size="12">conftest.py</text><text x="305" y="90" text-anchor="middle" class="svg-muted" font-size="11">fixture brief</text>
<rect x="450" y="10" width="170" height="38" rx="8" fill="#bae6fd"/><text x="535" y="34" text-anchor="middle" class="svg-ink" font-size="12">test_rows(brief)</text>
<rect x="450" y="56" width="170" height="38" rx="8" fill="#bae6fd"/><text x="535" y="80" text-anchor="middle" class="svg-ink" font-size="12">test_status(brief)</text>
<rect x="450" y="102" width="170" height="38" rx="8" fill="#bae6fd"/><text x="535" y="126" text-anchor="middle" class="svg-ink" font-size="12">test_down(brief)</text>
<line x1="170" y1="75" x2="230" y2="75" stroke="#64748b" stroke-width="2"/><line x1="380" y1="75" x2="450" y2="29" stroke="#64748b" stroke-width="2"/><line x1="380" y1="75" x2="450" y2="75" stroke="#64748b" stroke-width="2"/><line x1="380" y1="75" x2="450" y2="121" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek fixture, teen tests, copy-paste nahi.</p></div>

<h3>brief fixture</h3>
<p>Jo fixtures kai files ko chahiye woh <code>conftest.py</code> mein rehte hain. pytest yeh file khud padhta hai; aap use kabhi import nahi karte.</p>
<pre class="code">import pytest


@pytest.fixture
def brief():
    with open("samples/brief.txt") as f:
        return f.read()</pre>
<p>Ab <code>test_parse.py</code>. Har test <code>brief</code> ko parameter ki tarah list karta hai:</p>
<pre class="code">from netlib import interfaces_down, parse_brief


def test_rows(brief):
    assert len(parse_brief(brief)) == 3


def test_status(brief):
    assert parse_brief(brief)[1]["status"] == "administratively down"


def test_down(brief):
    assert interfaces_down(parse_brief(brief)) == ["GigabitEthernet0/1"]</pre>
<ul>
<li><code>@pytest.fixture</code> <code>brief</code> ko fixture mark karta hai, test nahi.</li>
<li>Jab pytest test mein argument naam <code>brief</code> dekhta hai, to fixture call karta hai aur return value pass kar deta hai, yahan file ka text.</li>
<li>Sample mein teen interfaces hain, isliye <code>test_rows</code> 3 rows expect karta hai. Row 1 (0 se ginke) <code>GigabitEthernet0/1</code> hai, jiska status do shabdon ka hai, isi liye parser <code>parts[4:-1]</code> jodta hai.</li>
<li>Path <code>samples/brief.txt</code> us folder ke relative hai jahan se pytest shuru karte ho, isliye ise home folder se chalao.</li>
</ul>
<pre class="out">AUTO01$ pytest -q test_parse.py
...                                                                      [100%]
<span class="hl">3 passed in 0.04s</span></pre>
<p>Task 3 ka jawab: down report hone wala interface <b>GigabitEthernet0/1</b> hai. Loopback aur Gi0/0 ka protocol up hai. Dhyan do ki <code>interfaces_down</code> protocol column dekhta hai, admin status nahi.</p>

<h3>Fixtures doosre fixtures bhi use kar sakte hain</h3>
<p>Fixture doosre fixture ko parameter ki tarah le sakta hai, to material parton mein banta hai:</p>
<pre class="code">import pytest

from netlib import parse_brief


@pytest.fixture
def rows(brief):
    return parse_brief(brief)


def test_names(rows):
    assert [r["name"] for r in rows] == ["GigabitEthernet0/0", "GigabitEthernet0/1", "Loopback0"]


def test_loopback(rows):
    assert rows[-1]["ip"] == "1.1.1.1"</pre>
<pre class="out">AUTO01$ pytest -q test_chain.py
..                                                                       [100%]
2 passed in 0.03s</pre>
<p>Test file ke andar define fixture sirf usi file mein dikhta hai. <code>conftest.py</code> wala folder ki har test file ko dikhta hai. Naam galat ho to pytest failure ki jagah setup par error deta hai, <code>fixture 'name' not found</code>.</p>

<h3>Setup, teardown aur yield</h3>
<p>Jo fixture kuch kholta hai use band bhi karna chahiye. <code>return</code> ki jagah <code>yield</code> use karo: <code>yield</code> se pehle ka code setup hai, uske baad ki value test ko jaati hai, aur uske baad ka code <b>teardown</b> hai, jo test fail hone par bhi chalta hai. Asli examples: SSH session band karna ya temporary file hatana. Yahan ek list saabit karti hai ki teardown chala:</p>
<pre class="code">import pytest

closed = []


@pytest.fixture
def session():
    yield "R1-session"
    closed.append("R1")


def test_a(session):
    assert closed == []


def test_b(session):
    assert closed == ["R1"]</pre>
<pre class="out">AUTO01$ pytest -q test_teardown.py
..                                                                       [100%]
2 passed in 0.03s</pre>
<p><code>test_b</code> ko <code>["R1"]</code> isliye dikhta hai kyunki <code>test_a</code> ke khatam hone ke baad uska teardown chala.</p>

<h3>Scope: fixture kitni der jeeta hai</h3>
<p>Default mein fixture har test ke liye dobara banta hai (<b>function scope</b>). Yeh safe hai: har test saaf shuru hota hai. <code>scope="module"</code> ke saath woh ek test file ke liye ek baar banta hai aur share hota hai:</p>
<pre class="code">import pytest

built = []


@pytest.fixture(scope="module")
def inventory():
    built.append("built")
    return ["R1", "R2", "SW1"]


def test_one(inventory):
    assert len(inventory) == 3


def test_two(inventory):
    assert "R2" in inventory


def test_built_once():
    assert built == ["built"]</pre>
<pre class="out">AUTO01$ pytest -q test_scope2.py
...                                                                      [100%]
3 passed in 0.04s</pre>
<p>Lab mein module-scoped fixture ek test file ke andar share hota hai, asli pytest ki tarah. Chauda scope sirf us material ke liye use karo jo banane mein slow ho aur jise koi test badalta na ho. Agar koi test shared list badalta hai to agla test badlav dekhta hai. Lab 2 mein bilkul yahi bug hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Fixture ko argument ki jagah function ki tarah call karna (<code>brief()</code>). Aisa file path kholna jo sirf ek folder se chalta hai. Jahan cleanup chahiye wahan <code>return</code> use karna. Chauda scope ke saath mutable list ya dictionary share karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Fixture <i>parameter naam</i> se maanga jaata hai, import nahi hota. Default scope function hai. Teardown <code>yield</code> ke baad ka hissa hai. <code>conftest.py</code> apne aap utha li jaati hai.</p></div>

<div class="scn"><h4>Ek hi sample ki pandrah copies</h4><p>Ek parser suite mein pandrah tests the, har ek show command ki alag paste ki hui copy kholta tha. Platform team ne output format badla to kisi ko pata nahi tha kaunsi copy current hai. Sample ko ek fixture aur ek file mein le jaane se ek edit sab tests ko update kar gaya, aur diff ne format change saaf dikhaya.</p><p><b>Lesson:</b> sample device output ka ek hi source of truth rakho.</p></div>

<div class="iv"><p class="q">"pytest fixture kya hai aur use kahan rakhte ho?"</p><p>Fixture woh function hai jo setup material deta hai, jaise sample show output ya temporary folder. Tests use argument ki tarah naam dekar maangte hain. Shared fixtures conftest.py mein rakhta hoon, teardown ke liye yield use karta hoon, aur default function scope tabhi badalta hoon jab banana mehnga ho aur data read-only ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>@pytest.fixture</code> function ko reusable setup banata hai; tests argument naam se maangte hain.</li>
<li><code>conftest.py</code> folder ki har test file ko fixtures deta hai, import ke bina.</li>
<li><code>yield</code> ke baad ka code teardown hai aur test fail hone par bhi chalta hai.</li>
<li>Default scope per test hai; <code>scope="module"</code> ek file ke liye ek object share karta hai.</li>
<li>Aisa mutable object kabhi share mat karo jise tests badalte hain.</li>
</ul></div>
`}};export{e as default};