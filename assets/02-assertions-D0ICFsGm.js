var e={id:`assertions`,h:{en:`Your first assertion: PASS, FAIL and AssertionError`,hi:`Aapka pehla assertion: PASS, FAIL aur AssertionError`},body:{en:`
<p>A test needs one thing above all: a way to say "this must be true, and if it is not, shout". Python has this built in. It is the <b>assert</b> statement. This chapter teaches only that one idea, with tiny examples that have nothing to do with networks yet.</p>

<h3>Analogy: the security guard at the gate</h3>
<p>A guard checks every visitor: "Do you have a pass?" If yes, you walk through and nothing is said. If no, the guard stops you and tells you why. An <code>assert</code> is that guard. When the condition is true the script carries on silently. When it is false the script stops and prints a message.</p>

<h3>The shape of an assert</h3>
<p>You write the word <code>assert</code>, then a condition, then (optionally) a comma and a message that explains what went wrong.</p>
<pre class="code"><span class="c"># Reference code (a plain Python file, nothing network-specific)</span>
neighbours = 2          <span class="c"># a variable holding the number 2</span>
assert neighbours == 2  <span class="c"># true, so Python says nothing and moves on</span>
assert neighbours == 3, "expected 3 neighbours"   <span class="c"># false, so Python stops here</span></pre>
<p>Read it line by line. Line 1 is a comment: anything after <code>#</code> is ignored by Python. Line 2 creates a variable named <code>neighbours</code> and stores 2 in it. Line 3 asks "is neighbours equal to 2?" The double equals <code>==</code> means <b>compare</b>; a single <code>=</code> means <b>store</b>. It is true, so nothing happens. Line 4 asks "is it equal to 3?" It is not, so Python raises an <b>AssertionError</b> and prints the text after the comma.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="assert decides pass or fail">
<rect x="20" y="45" width="150" height="55" rx="10" fill="#bae6fd"/><text x="95" y="78" text-anchor="middle" class="svg-ink" font-size="14">assert condition</text>
<rect x="270" y="15" width="170" height="45" rx="10" fill="#bbf7d0"/><text x="355" y="43" text-anchor="middle" class="svg-ink" font-size="13">True: carry on quietly</text>
<rect x="270" y="90" width="170" height="45" rx="10" fill="#fed7aa"/><text x="355" y="118" text-anchor="middle" class="svg-ink" font-size="13">False: AssertionError</text>
<line x1="170" y1="65" x2="270" y2="38" stroke="#64748b" stroke-width="2"/><line x1="170" y1="80" x2="270" y2="112" stroke="#64748b" stroke-width="2"/>
<text x="540" y="43" text-anchor="middle" class="svg-muted" font-size="12">next line runs</text><text x="540" y="118" text-anchor="middle" class="svg-muted" font-size="12">script stops, message shown</text>
</svg><p class="cap">A true condition is silent; a false one stops the script.</p></div>

<h3>What a failure looks like</h3>
<p>When an assert fails, Python prints a <b>traceback</b>: the path it took to reach the failure, ending with the error type and your message. Here is a real one, captured from the lab tests in this module when R2 had lost an OSPF neighbour:</p>
<pre class="out">Traceback (most recent call last):
  File "tests.py", line 44, in &lt;module&gt;
    test()
  File "tests.py", line 25, in test_ospf_neighbors
    assert full == expected[router], f"{router} has {full} FULL OSPF neighbours, expected {expected[router]}"
<span class="hl">AssertionError: R2 has 1 FULL OSPF neighbours, expected 2</span></pre>
<p>Always read a traceback from the <b>bottom up</b>. The last line is the answer: which error and what message. The line above it shows the exact code that failed. Everything above is the route Python took to get there.</p>

<h3>Good messages are half of testing</h3>
<p>Compare two messages. "assertion failed" tells you nothing. "R2 has 1 FULL OSPF neighbours, expected 2" tells you the device, the observed value and the expected value, so you know where to look before you type a single command. The text after the comma is an <b>f-string</b>: a string that starts with <code>f</code> and puts the value of a variable inside curly braces. So <code>f"{router} has {full}"</code> becomes "R2 has 1".</p>
<ul>
<li>Say <b>who</b> failed (device name).</li>
<li>Say what you <b>saw</b> and what you <b>expected</b>.</li>
<li>Keep it to one line.</li>
</ul>

<h3>Conditions you will use</h3>
<table class="cmp"><tr><th>Condition</th><th>Meaning</th><th>Network use</th></tr>
<tr><td><code>a == b</code></td><td>equal</td><td>state is "Established"</td></tr>
<tr><td><code>a != b</code></td><td>not equal</td><td>state is not "Idle"</td></tr>
<tr><td><code>a &gt; 0</code></td><td>greater than</td><td>received prefixes above zero</td></tr>
<tr><td><code>x in y</code></td><td>x is inside y</td><td>"0.0.0.0/0" in routes</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A script reads that R1 received 0 prefixes from the ISP. <code>assert prefixes &gt; 0, "ISP sends 0 prefixes"</code> stops with that message. The BGP session might be Established (a weaker test would pass), but the test still catches the real problem: nothing is being advertised to you.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Writing <code>assert (x == 2, "message")</code> with brackets around both parts. That is a pair of values, which is always true, so the test can never fail. Write the condition, a comma, then the message, with no outer brackets. Also do not use a single <code>=</code> inside an assert; Python reports a syntax error.</p></div>
<div class="exam"><p><b>Exam trap.</b> An assertion that holds produces <b>no output at all</b>. Silence means PASS. In our scripts we print a PASS line ourselves after the test function returns, so the human can see progress.</p></div>

<div class="scn"><h4>The test that could never fail</h4><p>A team wrote <code>assert (state == "Established", "BGP down")</code> in their pre-change check. For months it printed nothing and everyone assumed BGP was fine. During an outage a reviewer noticed the brackets. After removing them, the very next run failed with "BGP down", exactly as it should have done on the first day.</p><p><b>Lesson:</b> prove every new test by making it fail once on purpose.</p></div>

<div class="iv"><p class="q">"What does assert do in Python and why is it useful for network validation?"</p><p>It evaluates a condition; if false it raises AssertionError with an optional message, stopping the test. It is useful because the message can name the device, the observed value and the expected value, giving a clear failure. Add that a passing assert is silent, and that frameworks such as pytest and pyATS build on the same idea.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>assert condition, message</code> is silent when true and raises AssertionError when false.</li>
<li><code>==</code> compares; <code>=</code> stores.</li>
<li>Read a traceback from the bottom line upwards.</li>
<li>A good message names the device, the value seen and the value expected.</li>
<li>Never put brackets around the condition and message together.</li>
</ul></div>
`,hi:`
<p>Test ko sabse zyada ek cheez chahiye: "yeh sach hona chahiye, aur nahi hai to chillao" bolne ka tareeka. Python mein yeh built-in hai. Yeh <b>assert</b> statement hai. Is chapter mein sirf yahi ek idea hai, chhote examples ke saath jinka abhi network se koi lena-dena nahi.</p>

<h3>Analogy: gate ka security guard</h3>
<p>Guard har visitor ko check karta hai: "Pass hai?" Haan to aap chale jaate ho aur kuch nahi bola jaata. Nahi to guard rokta hai aur wajah batata hai. <code>assert</code> wahi guard hai. Condition true ho to script chupchap aage badhti hai. False ho to script ruk jaati hai aur message print karti hai.</p>

<h3>Assert ki shape</h3>
<p>Aap <code>assert</code> likhte ho, phir condition, phir (chaaho to) comma aur ek message jo batata hai kya galat hua.</p>
<pre class="code"><span class="c"># Reference code (simple Python file, network se related nahi)</span>
neighbours = 2          <span class="c"># variable jisme number 2 stored hai</span>
assert neighbours == 2  <span class="c"># true, isliye Python kuch nahi bolta aur aage badhta hai</span>
assert neighbours == 3, "expected 3 neighbours"   <span class="c"># false, isliye Python yahin ruk jaata hai</span></pre>
<p>Line by line padho. Line 1 comment hai: <code>#</code> ke baad ka sab Python ignore karta hai. Line 2 <code>neighbours</code> naam ka variable banati hai aur usme 2 rakhti hai. Line 3 poochti hai "neighbours 2 ke barabar hai?" Double equals <code>==</code> ka matlab <b>compare</b>; single <code>=</code> ka matlab <b>store</b>. Yeh true hai, isliye kuch nahi hota. Line 4 poochti hai "3 ke barabar hai?" Nahi hai, to Python <b>AssertionError</b> raise karta hai aur comma ke baad ka text print karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="assert pass ya fail decide karta hai">
<rect x="20" y="45" width="150" height="55" rx="10" fill="#bae6fd"/><text x="95" y="78" text-anchor="middle" class="svg-ink" font-size="14">assert condition</text>
<rect x="270" y="15" width="170" height="45" rx="10" fill="#bbf7d0"/><text x="355" y="43" text-anchor="middle" class="svg-ink" font-size="13">True: chupchap aage</text>
<rect x="270" y="90" width="170" height="45" rx="10" fill="#fed7aa"/><text x="355" y="118" text-anchor="middle" class="svg-ink" font-size="13">False: AssertionError</text>
<line x1="170" y1="65" x2="270" y2="38" stroke="#64748b" stroke-width="2"/><line x1="170" y1="80" x2="270" y2="112" stroke="#64748b" stroke-width="2"/>
<text x="540" y="43" text-anchor="middle" class="svg-muted" font-size="12">agli line chalti hai</text><text x="540" y="118" text-anchor="middle" class="svg-muted" font-size="12">script ruki, message dikha</text>
</svg><p class="cap">True condition chup rehti hai; false script ko rok deti hai.</p></div>

<h3>Failure kaisa dikhta hai</h3>
<p>Assert fail ho to Python ek <b>traceback</b> print karta hai: failure tak pahunchne ka raasta, jo error type aur aapke message par khatam hota hai. Yeh ek real traceback hai, is module ke lab tests se capture kiya, jab R2 ka ek OSPF neighbour kho gaya tha:</p>
<pre class="out">Traceback (most recent call last):
  File "tests.py", line 44, in &lt;module&gt;
    test()
  File "tests.py", line 25, in test_ospf_neighbors
    assert full == expected[router], f"{router} has {full} FULL OSPF neighbours, expected {expected[router]}"
<span class="hl">AssertionError: R2 has 1 FULL OSPF neighbours, expected 2</span></pre>
<p>Traceback hamesha <b>neeche se upar</b> padho. Aakhri line jawab hai: kaunsa error aur kya message. Uske upar wali line woh exact code dikhati hai jo fail hua. Baaki upar ka sab Python ka raasta hai.</p>

<h3>Achhe messages testing ka aadha kaam hain</h3>
<p>Do messages compare karo. "assertion failed" kuch nahi batata. "R2 has 1 FULL OSPF neighbours, expected 2" device, dekhi gayi value aur expected value batata hai, isliye ek bhi command type karne se pehle pata hai kahan dekhna hai. Comma ke baad ka text <b>f-string</b> hai: <code>f</code> se shuru hone wali string jo curly braces ke andar variable ki value daalti hai. Isliye <code>f"{router} has {full}"</code> bante hai "R2 has 1".</p>
<ul>
<li><b>Kaun</b> fail hua (device ka naam) batao.</li>
<li>Kya <b>dekha</b> aur kya <b>expected</b> tha batao.</li>
<li>Ek line mein rakho.</li>
</ul>

<h3>Conditions jo aap use karoge</h3>
<table class="cmp"><tr><th>Condition</th><th>Matlab</th><th>Network use</th></tr>
<tr><td><code>a == b</code></td><td>barabar</td><td>state "Established" hai</td></tr>
<tr><td><code>a != b</code></td><td>barabar nahi</td><td>state "Idle" nahi hai</td></tr>
<tr><td><code>a &gt; 0</code></td><td>se bada</td><td>received prefixes zero se zyada</td></tr>
<tr><td><code>x in y</code></td><td>x, y ke andar hai</td><td>"0.0.0.0/0" in routes</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Script padhti hai ki R1 ko ISP se 0 prefixes mile. <code>assert prefixes &gt; 0, "ISP sends 0 prefixes"</code> us message ke saath ruk jaata hai. BGP session Established ho sakta hai (kamzor test pass ho jaata), phir bhi yeh test asli problem pakadta hai: aapko kuch advertise nahi ho raha.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> <code>assert (x == 2, "message")</code> likhna, dono hisson ke chaaron taraf brackets ke saath. Yeh values ka ek jodi (pair) hai, jo hamesha true hota hai, isliye test kabhi fail nahi ho sakta. Condition, comma, phir message likho, bahar brackets nahi. Assert ke andar single <code>=</code> bhi mat likho; Python syntax error deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jo assertion hold karta hai woh <b>bilkul output nahi</b> deta. Chup rehna matlab PASS. Hamari scripts test function laut aane ke baad khud PASS line print karti hain, taaki insaan progress dekh sake.</p></div>

<div class="scn"><h4>Woh test jo kabhi fail nahi ho sakta tha</h4><p>Ek team ne pre-change check mein <code>assert (state == "Established", "BGP down")</code> likha. Mahino tak kuch print nahi hua aur sabne maan liya BGP theek hai. Outage ke dauraan ek reviewer ne brackets dekhe. Hatane ke baad agli hi run "BGP down" ke saath fail hui, bilkul jaise pehle din hona chahiye tha.</p><p><b>Lesson:</b> har naye test ko ek baar jaan-boojh kar fail karake prove karo.</p></div>

<div class="iv"><p class="q">"Python mein assert kya karta hai aur network validation ke liye kyun useful hai?"</p><p>Woh condition evaluate karta hai; false ho to optional message ke saath AssertionError raise karke test rok deta hai. Useful isliye ki message device, observed value aur expected value bata sakta hai, jisse saaf failure milta hai. Yeh bhi jodo ki passing assert chup rehta hai, aur pytest aur pyATS jaise frameworks isi idea par bane hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>assert condition, message</code> true par chup, false par AssertionError raise karta hai.</li>
<li><code>==</code> compare karta hai; <code>=</code> store karta hai.</li>
<li>Traceback aakhri line se upar ki taraf padho.</li>
<li>Achha message device, dekhi value aur expected value batata hai.</li>
<li>Condition aur message ke upar kabhi brackets mat lagao.</li>
</ul></div>
`}};export{e as default};