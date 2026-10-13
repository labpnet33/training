var e={id:`checks-lint-test`,h:{en:`Lint and unit test: catching mistakes before the network`,hi:`Lint aur unit test: network se pehle galti pakadna`},body:{en:`

<p><b>One idea in this chapter:</b> two different checks catch two different kinds of mistake. A <b>lint</b> check asks "is the file written correctly?". A <b>unit test</b> asks "does the data make sense?". You need both.</p>

<h3>Lint: is the grammar right?</h3>
<p>YAML is sensitive to spaces. One space too many and the file is no longer valid. <code>yamllint</code> reads the file and reports the first problem with its line and column. On a good file:</p>
<pre class="code">yamllint vlans.yml</pre>
<pre class="out">vlans.yml: <span class="hl">valid YAML</span> (mapping with keys: vlans)</pre>
<p>Lint knows about syntax only. It would happily accept a VLAN with id 4100, because "4100" is a perfectly good number. For that you need a second kind of check.</p>

<h3>Unit test: does the data make sense?</h3>
<p>A <b>unit test</b> is a small program that checks one thing and fails loudly if it is wrong. In the labs it is <code>check.py</code>. You do not have to write Python. Just read it, because it shows what a test really is:</p>
<pre class="code"><span class="c"># check.py - test the VLAN file BEFORE anything touches the network</span>
import yaml

with open("vlans.yml") as f:
    data = yaml.safe_load(f.read())   <span class="c"># YAML text -&gt; Python dict</span>

seen = []
for v in data["vlans"]:
    <span class="c"># 1. a VLAN id must be a valid 802.1Q id</span>
    assert 1 &lt;= v["id"] &lt;= 4094, f"VLAN {v['id']} is out of range 1-4094"
    <span class="c"># 2. the same id must not be listed twice</span>
    assert v["id"] not in seen, f"VLAN {v['id']} is listed twice"
    <span class="c"># 3. every VLAN needs a name</span>
    assert v.get("name"), f"VLAN {v['id']} has no name"
    seen.append(v["id"])

print(f"check OK: {len(seen)} VLANs look valid")</pre>
<ul>
<li><code>yaml.safe_load</code> turns the YAML text into Python data: a list of VLANs, each with an <code>id</code> and a <code>name</code>.</li>
<li>Each <code>assert</code> line states a rule. If the rule is false, Python stops with an <code>AssertionError</code> carrying the message after the comma.</li>
<li>Three rules: the id is between 1 and 4094 (the valid 802.1Q range), no id appears twice, and every VLAN has a name.</li>
<li>The last line prints a friendly summary only if every rule passed.</li>
</ul>
<p>On the good Lab 1 file:</p>
<pre class="code">python3 check.py</pre>
<pre class="out">check OK: <span class="hl">3 VLANs look valid</span></pre>
<p>The important idea is the exit status. A passing script ends normally, and the runner marks the job passed. A failing script ends with an error, and the runner marks the job failed. That is how any command, in any language, becomes a pipeline check: <b>if it fails, the job fails</b>.</p>

<h3>Which check catches what?</h3>
<table class="cmp"><tr><th>Mistake</th><th>lint</th><th>unit test</th></tr><tr><td>One extra space in front of name</td><td>catches it</td><td>also stops, but with a Python error</td></tr><tr><td>VLAN id 4100</td><td>passes</td><td>catches it: out of range 1-4094</td></tr><tr><td>The same id listed twice</td><td>passes</td><td>catches it</td></tr><tr><td>A VLAN with no name</td><td>passes</td><td>catches it</td></tr></table>
<p>When the file is broken at the syntax level, even the test cannot read it. This is what <code>check.py</code> prints on the Lab 2 file, where one line is indented by a single space too few:</p>
<pre class="out">Traceback (most recent call last):
  File "check.py", line 5, in &lt;module&gt;
    data = yaml.safe_load(f.read())   # YAML text -&gt; Python dict
yaml.YAMLError: bad indentation of a sequence entry (this line is indented more than the list item above it)</pre>
<p>That is why lint comes first. Its message is clearer ("bad indentation", with line and column) and it is faster. The lesson from the pipeline order stays the same: cheap and clear checks first.</p>

<h3>Writing good checks</h3>
<ul><li>One rule per assert, each with a message that says what is wrong and the value that caused it.</li><li>Test the data, not the switch. A check that needs a live device is slow and may fail for reasons unrelated to your change.</li><li>Run the same check on your laptop and in the pipeline, so there are no surprises.</li><li>Every outage that a check could have caught is a reason to add a new rule.</li></ul>
<p>Reference configuration (not run in the simulator) Real teams often add checks such as <code>ansible-lint</code> for playbooks, a JSON schema to validate data files, and network testing tools such as pyATS to verify device state after a change. The idea is identical: a command that fails when a rule is broken.</p>

<div class="eg"><p><b>Worked example.</b> A colleague types id: 4100 for guest Wi-Fi. yamllint says valid YAML. python3 check.py fails with "VLAN 4100 is out of range 1-4094". The fix is the intended id, 40. Without the unit test, the switch would have been asked for an impossible VLAN.</p></div>
<div class="warn"><p><b>Common beginner mistakes.</b> Believing that "lint passed" means the change is safe. Writing a test that always passes. Reading only the last line of a Python traceback and missing the message that follows the AssertionError text.</p></div>
<div class="exam"><p><b>Exam trap.</b> Lint checks syntax and style; unit tests check logic and values. Both are static: they do not touch the network. Pipelines treat a non-zero exit status as a failure.</p></div>

<div class="scn"><h4>The valid but wrong file</h4><p>A change was reviewed by two people and passed yamllint, so everyone relaxed. The new VLAN id was out of range. The unit test in the next stage failed the pipeline, and nothing reached the switch. The team added a second rule that day: no duplicate names. The reviewer later said the test had paid for itself in the first week.</p><p><b>Lesson:</b> syntax-valid does not mean value-valid; keep a unit test beside the linter.</p></div>
<div class="iv"><p class="q">"Why have both a linter and a unit test in a network pipeline?"</p><p>They find different mistakes. A linter finds syntax problems such as bad indentation. A unit test finds data problems such as a VLAN id outside 1 to 4094, duplicates or missing names. Running both, cheap one first, catches problems before any device is touched.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Lint checks that the file is well formed; a unit test checks that the values make sense.</li><li>check.py asserts id range 1-4094, no duplicates and a name for each VLAN.</li><li>A failing command fails the job; that is all a pipeline check needs.</li><li>Run checks on your laptop first, then let the pipeline repeat them.</li><li>Real projects add ansible-lint, schemas and pyATS as references.</li></ul></div>

`,hi:`

<p><b>Is chapter ki ek idea:</b> do alag checks do alag tarah ki galti pakadte hain. <b>Lint</b> check poochta hai "kya file sahi likhi hai?". <b>Unit test</b> poochta hai "kya data ka matlab banta hai?". Dono chahiye.</p>

<h3>Lint: kya grammar sahi hai?</h3>
<p>YAML spaces ke liye sensitive hai. Ek space zyada aur file valid nahi rahti. <code>yamllint</code> file padhta hai aur pehli problem line aur column ke saath batata hai. Achhi file par:</p>
<pre class="code">yamllint vlans.yml</pre>
<pre class="out">vlans.yml: <span class="hl">valid YAML</span> (mapping with keys: vlans)</pre>
<p>Lint sirf syntax jaanta hai. Woh id 4100 wala VLAN khushi se maan lega, kyunki "4100" ek bilkul theek number hai. Uske liye doosre tarah ka check chahiye.</p>

<h3>Unit test: kya data ka matlab banta hai?</h3>
<p><b>Unit test</b> ek chhota program hai jo ek cheez check karta hai aur galat hone par zor se fail hota hai. Labs mein yeh <code>check.py</code> hai. Aapko Python likhni nahi hai. Bas padho, kyunki yeh dikhata hai ki test asal mein kya hota hai:</p>
<pre class="code"><span class="c"># check.py - test the VLAN file BEFORE anything touches the network</span>
import yaml

with open("vlans.yml") as f:
    data = yaml.safe_load(f.read())   <span class="c"># YAML text -&gt; Python dict</span>

seen = []
for v in data["vlans"]:
    <span class="c"># 1. a VLAN id must be a valid 802.1Q id</span>
    assert 1 &lt;= v["id"] &lt;= 4094, f"VLAN {v['id']} is out of range 1-4094"
    <span class="c"># 2. the same id must not be listed twice</span>
    assert v["id"] not in seen, f"VLAN {v['id']} is listed twice"
    <span class="c"># 3. every VLAN needs a name</span>
    assert v.get("name"), f"VLAN {v['id']} has no name"
    seen.append(v["id"])

print(f"check OK: {len(seen)} VLANs look valid")</pre>
<ul>
<li><code>yaml.safe_load</code> YAML text ko Python data bana deta hai: VLANs ki list, har ek mein <code>id</code> aur <code>name</code>.</li>
<li>Har <code>assert</code> line ek rule batati hai. Agar rule galat hai to Python <code>AssertionError</code> ke saath ruk jaata hai, comma ke baad wala message leke.</li>
<li>Teen rules: id 1 se 4094 ke beech (valid 802.1Q range), koi id do baar nahi, aur har VLAN ka naam.</li>
<li>Aakhri line friendly summary tab hi print karti hai jab har rule pass ho.</li>
</ul>
<p>Lab 1 ki achhi file par:</p>
<pre class="code">python3 check.py</pre>
<pre class="out">check OK: <span class="hl">3 VLANs look valid</span></pre>
<p>Zaroori idea exit status hai. Pass hone wali script normal khatam hoti hai, aur runner job ko passed mark karta hai. Fail hone wali script error ke saath khatam hoti hai, aur runner job ko failed mark karta hai. Isi tarah koi bhi command, kisi bhi language mein, pipeline check ban jaata hai: <b>agar woh fail hua, to job fail</b>.</p>

<h3>Kaun sa check kya pakadta hai?</h3>
<table class="cmp"><tr><th>Galti</th><th>lint</th><th>unit test</th></tr><tr><td>name se pehle ek extra space</td><td>pakadta hai</td><td>woh bhi rukta hai, par Python error ke saath</td></tr><tr><td>VLAN id 4100</td><td>pass kar deta hai</td><td>pakadta hai: out of range 1-4094</td></tr><tr><td>Ek hi id do baar</td><td>pass kar deta hai</td><td>pakadta hai</td></tr><tr><td>Bina naam ka VLAN</td><td>pass kar deta hai</td><td>pakadta hai</td></tr></table>
<p>Jab file syntax level par hi toot-ti hai, tab test bhi use padh nahi sakta. Lab 2 ki file par <code>check.py</code> yeh print karta hai, jahan ek line mein ek space kam hai:</p>
<pre class="out">Traceback (most recent call last):
  File "check.py", line 5, in &lt;module&gt;
    data = yaml.safe_load(f.read())   # YAML text -&gt; Python dict
yaml.YAMLError: bad indentation of a sequence entry (this line is indented more than the list item above it)</pre>
<p>Isiliye lint pehle aata hai. Uska message zyada saaf hai ("bad indentation", line aur column ke saath) aur woh tez hai. Pipeline order ka sabak wahi hai: sasta aur saaf check pehle.</p>

<h3>Achhe checks likhna</h3>
<ul><li>Ek assert mein ek rule, aur message jo batata ho ki kya galat hai aur kaun si value ki wajah se.</li><li>Data ko test karo, switch ko nahi. Live device chahiye wala check dheema hota hai aur aapke change se alag wajah se fail ho sakta hai.</li><li>Wahi check laptop par bhi chalao aur pipeline mein bhi, taaki koi surprise na ho.</li><li>Har outage jo koi check pakad sakta tha, ek naya rule jodne ki wajah hai.</li></ul>
<p>Reference configuration (not run in the simulator) Asli teams aksar playbooks ke liye <code>ansible-lint</code>, data files validate karne ke liye JSON schema, aur change ke baad device state verify karne ke liye pyATS jaise network testing tools jodte hain. Idea wahi hai: ek command jo rule tootne par fail ho.</p>

<div class="eg"><p><b>Worked example.</b> Ek colleague guest Wi-Fi ke liye id: 4100 type karta hai. yamllint kehta hai valid YAML. python3 check.py "VLAN 4100 is out of range 1-4094" ke saath fail hota hai. Fix sahi id, 40, hai. Unit test ke bina switch se ek impossible VLAN maanga jaata.</p></div>
<div class="warn"><p><b>Common beginner mistakes.</b> "Lint passed" ka matlab "change safe hai" maan lena. Aisa test likhna jo hamesha pass ho. Python traceback ki sirf aakhri line padhna aur AssertionError text ke baad wala message chhod dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Lint syntax aur style check karta hai; unit tests logic aur values. Dono static hain: network ko touch nahi karte. Pipelines non-zero exit status ko failure maanti hain.</p></div>

<div class="scn"><h4>Valid par galat file</h4><p>Ek change do logon ne review kiya aur yamllint pass hua, to sab nishchint ho gaye. Naya VLAN id range ke bahar tha. Agle stage ke unit test ne pipeline fail kar di, aur switch tak kuch nahi pahuncha. Team ne usi din doosra rule jodha: duplicate names nahi. Baad mein reviewer ne kaha ki test ne pehle hi hafte mein apna paisa vasool kar liya.</p><p><b>Lesson:</b> syntax-valid ka matlab value-valid nahi; linter ke saath unit test rakho.</p></div>
<div class="iv"><p class="q">"Network pipeline mein linter aur unit test dono kyun?"</p><p>Dono alag galtiyan pakadte hain. Linter syntax problems pakadta hai jaise bad indentation. Unit test data problems pakadta hai jaise 1 se 4094 ke bahar VLAN id, duplicates ya missing names. Dono chalana, sasta pehle, kisi device ko chhune se pehle problems pakad leta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Lint batata hai file well formed hai; unit test batata hai values ka matlab banta hai.</li><li>check.py id range 1-4094, koi duplicate nahi aur har VLAN ka naam assert karta hai.</li><li>Fail hota command job ko fail karta hai; pipeline check ko bas itna chahiye.</li><li>Pehle laptop par checks chalao, phir pipeline ko dohrane do.</li><li>Asli projects reference ke roop mein ansible-lint, schemas aur pyATS jodte hain.</li></ul></div>

`}};export{e as default};