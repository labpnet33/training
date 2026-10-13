var e={id:`rules-actions`,h:{en:`Rules and actions: Record, states, Error and the order of rules`,hi:`Rules aur actions: Record, states, Error aur rules ka order`},body:{en:`
<p><b>The idea of this chapter:</b> a rule has two jobs. The regex decides <i>which lines</i> it applies to. The part after the arrow <code>-&gt;</code> decides <i>what to do</i>. You will learn every action, and you will see three behaviours that explain most wrong results: a missing Record, a missing state change and a line that nobody expected.</p>

<h3>Analogy: the clerk's rubber stamps</h3>
<p>A clerk reads each line and may use one of a few stamps. <b>Record</b>: "file this row now". <b>Clear</b>: "wipe the fields". <b>Error</b>: "stop, this is not what I expected". A different kind of stamp, <b>change state</b>, says "from now on use the rules of the other page". If the clerk never uses the Record stamp, nothing is filed.</p>

<h3>The shape of an action</h3>
<pre class="code">  ^regex  -&gt; LineAction.RecordAction  NewState</pre>
<p>Every part is optional. The two actions are joined by a dot.</p>
<table class="cmp"><tr><th>Action</th><th>Kind</th><th>Meaning</th></tr>
<tr><td><code>Next</code></td><td>line</td><td>Default. Stop trying rules on this line, go to the next line.</td></tr>
<tr><td><code>Continue</code></td><td>line</td><td>Keep trying the following rules on the same line (chapter 8). It cannot be combined with a state change.</td></tr>
<tr><td><code>Error</code></td><td>line</td><td>Stop and raise an exception. An optional text in quotes becomes the message.</td></tr>
<tr><td><code>NoRecord</code></td><td>record</td><td>Default. Do not save a row.</td></tr>
<tr><td><code>Record</code></td><td>record</td><td>Save one row from the current Values, then clear them (except Filldown Values).</td></tr>
<tr><td><code>Clear</code></td><td>record</td><td>Empty the current Values without saving, except Filldown ones.</td></tr>
<tr><td><code>Clearall</code></td><td>record</td><td>Empty all Values, including Filldown ones.</td></tr>
<tr><td>a state name</td><td>state</td><td>Move to that state; the next line is read with its rules.</td></tr></table>
<p>So <code>-&gt; Record</code> is short for <code>Next.Record</code>, and <code>-&gt; Continue.Record</code> means "save the row, then keep matching rules on this same line".</p>

<h3>Behaviour 1: no Record means one row</h3>
<p>Here is the Lab 1 template with the action removed. The rule matches every interface line and stores the Values, but nothing ever files the row.</p>
<pre class="code">Start
  ^&#36;{INTF}\\s+&#36;{IP}\\s+\\w+\\s+\\w+\\s+&#36;{STATUS}\\s+&#36;{PROTO}</pre>
<pre class="out">AUTO01$ python3 parse_one.py norecord.textfsm r1_ipbrief.txt
['INTF', 'IP', 'STATUS', 'PROTO']
<span class="hl">['Loopback0', '1.1.1.1', 'up', 'up']</span></pre>
<p>Each match overwrote the one before. At the very end of the text, TextFSM does one <b>implicit Record</b> (unless the template has an <code>EOF</code> state), so the last interface survives. This is the "one row" symptom, and it is exactly the second bug of Lab 2.</p>

<h3>Behaviour 2: states let you read part of the output</h3>
<p>The real <code>show vlan</code> prints two tables. The second one, starting with "VLAN Type SAID MTU", begins with the same VLAN ids. A flat template with loose Values reads both tables:</p>
<pre class="out">AUTO01$ python3 parse_one.py flat.textfsm show_vlan_full.txt
['VLAN_ID', 'VLAN_NAME', 'STATUS']
['1', 'default', 'active']
['10', 'USERS', 'active']
['20', 'VOICE', 'active']
['99', 'MGMT', 'active']
<span class="hl">['1', 'enet', '100001']</span>
<span class="hl">['10', 'enet', '100010']</span>
<span class="hl">['20', 'enet', '100020']</span>
<span class="hl">['99', 'enet', '100099']</span></pre>
<p>Four extra rows with SAID numbers in the STATUS field appeared. A template with three states fixes this by moving to a state that ignores everything:</p>
<pre class="code">Start
  ^VLAN\\s+Name -&gt; Vlans

Vlans
  ^&#36;{VLAN_ID}\\s+&#36;{VLAN_NAME}\\s+&#36;{STATUS} -&gt; Record
  ^VLAN\\s+Type -&gt; Ignore

Ignore
  ^.*</pre>
<pre class="out">AUTO01$ python3 parse_one.py states.textfsm show_vlan_full.txt
['VLAN_ID', 'VLAN_NAME', 'STATUS']
['1', 'default', 'active']
['10', 'USERS', 'active']
['20', 'VOICE', 'active']
['99', 'MGMT', 'active']</pre>
<ul>
<li>In <code>Start</code> only the header line "VLAN Name" is interesting. It moves to the state <code>Vlans</code>.</li>
<li>In <code>Vlans</code> the rows are recorded. The header "VLAN Type" moves to <code>Ignore</code>.</li>
<li>In <code>Ignore</code> the rule <code>^.*</code> matches every line and does nothing, so the second table is skipped.</li>
</ul>

<h3>Behaviour 3: Error catches lines you did not expect</h3>
<p>Adding a catch-all rule at the bottom turns silent skipping into a loud failure:</p>
<pre class="code">Start
  ^Interface\\s+IP-Address
  ^&#36;{INTF}\\s+&#36;{IP}\\s+\\w+\\s+\\w+\\s+&#36;{STATUS}\\s+&#36;{PROTO} -&gt; Record
  ^. -&gt; Error</pre>
<p>The first rule recognises the header and does nothing with it. The second records rows. Any other non-empty line reaches <code>^. -&gt; Error</code>. The script <code>strict.py</code> loads this template, parses the file you name and catches the error. Running it over a good file and over a file that contains an error message gives:</p>
<pre class="out">AUTO01$ python3 strict.py r1_ipbrief.txt
5 rows
AUTO01$ python3 strict.py bad.txt; echo "rc=$?"
<span class="hl">parse failed: State Error raised. Rule Line: ^. -&gt; Error Line: % Invalid input detected at '^' marker.</span>
rc=1</pre>
<p>The script catches <code>textfsm.TextFSMError</code>, prints the problem and exits with code 1. The exact wording of the message differs between versions of the library, so catch the class, never compare the text.</p>

<div class="eg"><p><b>Worked example.</b> Rule order. If you put a broad rule such as <code>^&#36;{INTF}\\s+ -&gt; Record</code> above a precise one, the precise one never runs, because the first match wins and the engine moves on. Put the most specific rules first and the catch-all (<code>^. -&gt; Error</code>) last.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>Record</code> and getting one row. Writing <code>-&gt; Continue Neighbors</code>; a state change cannot be combined with Continue and the template will not load. Naming a state in a rule but never defining it. Putting <code>^. -&gt; Error</code> first, so it fires on every line.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>Record</code> clears the Values after saving, but Filldown Values stay. <code>Clear</code> keeps Filldown Values; <code>Clearall</code> does not. The default action of a rule is Next with NoRecord.</p></div>

<div class="scn"><h4>Four VLANs became eight</h4><p>An inventory job stored VLAN rows in a database. After a switch upgrade the count doubled overnight. The new software printed the second table of <code>show vlan</code> and the loose template recorded it too. Two extra states, one for the first table and one that ignores the rest, brought the count back.</p><p><b>Lesson:</b> use states to say which part of the output you want, not only which lines.</p></div>

<div class="iv"><p class="q">"What is the difference between Next, Continue and Record in TextFSM?"</p><p>Next and Continue are line actions: Next stops processing the line after a match, Continue lets later rules also look at it. Record is a record action: it saves the current Values as a row. They combine with a dot, for example Continue.Record. I also mention Clear, Clearall, Error and state changes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Action shape: <code>-&gt; LineAction.RecordAction NewState</code>, all parts optional.</li>
<li>No <code>Record</code> means one row (the implicit Record at the end of the text).</li>
<li>States let you start at a header, switch tables and ignore the rest.</li>
<li><code>^. -&gt; Error</code> as the last rule makes unexpected lines visible.</li>
<li>The first matching rule wins, so order rules from specific to general.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> rule ke do kaam hain. Regex tay karta hai ki rule <i>kin lines</i> par lagta hai. Arrow <code>-&gt;</code> ke baad ka hissa tay karta hai <i>kya karna hai</i>. Aap har action seekhoge, aur teen behaviours dekhoge jo zyadatar galat results samjhate hain: missing Record, missing state change aur ek aisi line jiski kisi ko umeed nahi thi.</p>

<h3>Analogy: clerk ki rubber stamps</h3>
<p>Clerk har line padhta hai aur kuch stamps mein se ek use kar sakta hai. <b>Record</b>: "yeh row abhi file karo". <b>Clear</b>: "fields saaf karo". <b>Error</b>: "ruko, yeh woh nahi hai jiski umeed thi". Ek alag kism ki stamp, <b>state badlo</b>, kehti hai "ab se doosre page ke rules use karo". Agar clerk Record stamp kabhi use na kare to kuch file nahi hota.</p>

<h3>Action ka shape</h3>
<pre class="code">  ^regex  -&gt; LineAction.RecordAction  NewState</pre>
<p>Har hissa optional hai. Do actions dot se jude hote hain.</p>
<table class="cmp"><tr><th>Action</th><th>Kism</th><th>Matlab</th></tr>
<tr><td><code>Next</code></td><td>line</td><td>Default. Is line par rules try karna band karo, agli line par jao.</td></tr>
<tr><td><code>Continue</code></td><td>line</td><td>Isi line par agle rules try karte raho (chapter 8). Ise state change ke saath nahi jod sakte.</td></tr>
<tr><td><code>Error</code></td><td>line</td><td>Ruko aur exception uthao. Quotes mein optional text message ban jaata hai.</td></tr>
<tr><td><code>NoRecord</code></td><td>record</td><td>Default. Row save mat karo.</td></tr>
<tr><td><code>Record</code></td><td>record</td><td>Maujooda Values se ek row save karo, phir unhe saaf karo (Filldown Values chhodkar).</td></tr>
<tr><td><code>Clear</code></td><td>record</td><td>Bina save kiye maujooda Values khaali karo, Filldown wali chhodkar.</td></tr>
<tr><td><code>Clearall</code></td><td>record</td><td>Saari Values khaali karo, Filldown wali bhi.</td></tr>
<tr><td>state ka naam</td><td>state</td><td>Us state mein jao; agli line uske rules se padhi jaayegi.</td></tr></table>
<p>Isliye <code>-&gt; Record</code>, <code>Next.Record</code> ka chhota roop hai, aur <code>-&gt; Continue.Record</code> ka matlab "row save karo, phir isi line par rules match karte raho".</p>

<h3>Behaviour 1: Record nahi to ek row</h3>
<p>Yeh Lab 1 ka template hai jisme action hata diya gaya. Rule har interface line ko match karta hai aur Values store karta hai, par row ko kabhi file nahi karta.</p>
<pre class="code">Start
  ^&#36;{INTF}\\s+&#36;{IP}\\s+\\w+\\s+\\w+\\s+&#36;{STATUS}\\s+&#36;{PROTO}</pre>
<pre class="out">AUTO01$ python3 parse_one.py norecord.textfsm r1_ipbrief.txt
['INTF', 'IP', 'STATUS', 'PROTO']
<span class="hl">['Loopback0', '1.1.1.1', 'up', 'up']</span></pre>
<p>Har match ne pichhle ko overwrite kiya. Text ke bilkul ant mein TextFSM ek <b>implicit Record</b> karta hai (jab tak template mein <code>EOF</code> state na ho), isliye aakhri interface bach gaya. Yeh "ek row" wala symptom hai, aur yahi Lab 2 ka doosra bug hai.</p>

<h3>Behaviour 2: states se output ka ek hissa padho</h3>
<p>Asli <code>show vlan</code> do tables print karta hai. Doosri table, jo "VLAN Type SAID MTU" se shuru hoti hai, wahi VLAN ids se shuru hoti hai. Loose Values wala flat template dono tables padh leta hai:</p>
<pre class="out">AUTO01$ python3 parse_one.py flat.textfsm show_vlan_full.txt
['VLAN_ID', 'VLAN_NAME', 'STATUS']
['1', 'default', 'active']
['10', 'USERS', 'active']
['20', 'VOICE', 'active']
['99', 'MGMT', 'active']
<span class="hl">['1', 'enet', '100001']</span>
<span class="hl">['10', 'enet', '100010']</span>
<span class="hl">['20', 'enet', '100020']</span>
<span class="hl">['99', 'enet', '100099']</span></pre>
<p>STATUS field mein SAID numbers wali chaar extra rows aa gayi. Teen states wala template ise theek karta hai: woh aise state mein jaata hai jo sab kuch ignore karta hai:</p>
<pre class="code">Start
  ^VLAN\\s+Name -&gt; Vlans

Vlans
  ^&#36;{VLAN_ID}\\s+&#36;{VLAN_NAME}\\s+&#36;{STATUS} -&gt; Record
  ^VLAN\\s+Type -&gt; Ignore

Ignore
  ^.*</pre>
<pre class="out">AUTO01$ python3 parse_one.py states.textfsm show_vlan_full.txt
['VLAN_ID', 'VLAN_NAME', 'STATUS']
['1', 'default', 'active']
['10', 'USERS', 'active']
['20', 'VOICE', 'active']
['99', 'MGMT', 'active']</pre>
<ul>
<li><code>Start</code> mein sirf header line "VLAN Name" dilchasp hai. Woh state <code>Vlans</code> mein le jaati hai.</li>
<li><code>Vlans</code> mein rows record hoti hain. Header "VLAN Type" <code>Ignore</code> mein le jaata hai.</li>
<li><code>Ignore</code> mein rule <code>^.*</code> har line match karta hai aur kuch nahi karta, isliye doosri table skip ho jaati hai.</li>
</ul>

<h3>Behaviour 3: Error unexpected lines pakadta hai</h3>
<p>Neeche catch-all rule jodne se chupchaap skip karna zor ki failure mein badal jaata hai:</p>
<pre class="code">Start
  ^Interface\\s+IP-Address
  ^&#36;{INTF}\\s+&#36;{IP}\\s+\\w+\\s+\\w+\\s+&#36;{STATUS}\\s+&#36;{PROTO} -&gt; Record
  ^. -&gt; Error</pre>
<p>Pehla rule header ko pehchanta hai aur uske saath kuch nahi karta. Doosra rows record karta hai. Koi bhi aur non-empty line <code>^. -&gt; Error</code> tak pahunchti hai. Script <code>strict.py</code> yeh template load karti hai, aapki di hui file parse karti hai aur error pakadti hai. Ise ek achhi file par aur ek aisi file par chalane se jisme error message hai:</p>
<pre class="out">AUTO01$ python3 strict.py r1_ipbrief.txt
5 rows
AUTO01$ python3 strict.py bad.txt; echo "rc=$?"
<span class="hl">parse failed: State Error raised. Rule Line: ^. -&gt; Error Line: % Invalid input detected at '^' marker.</span>
rc=1</pre>
<p>Script <code>textfsm.TextFSMError</code> pakadti hai, problem print karti hai aur exit code 1 se nikalti hai. Message ke shabd library ke versions ke beech alag ho sakte hain, isliye class pakdo, text kabhi compare mat karo.</p>

<div class="eg"><p><b>Worked example.</b> Rule ka order. Agar aap <code>^&#36;{INTF}\\s+ -&gt; Record</code> jaisa broad rule precise rule ke upar rakhoge, to precise rule kabhi nahi chalega, kyunki pehla match jeetta hai aur engine aage badh jaata hai. Sabse specific rules pehle rakho aur catch-all (<code>^. -&gt; Error</code>) aakhir mein.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>Record</code> bhool kar ek row paana. <code>-&gt; Continue Neighbors</code> likhna; state change ko Continue ke saath nahi jod sakte aur template load nahi hoga. Rule mein state ka naam likhna par use kabhi define na karna. <code>^. -&gt; Error</code> sabse pehle rakhna, jisse woh har line par fire ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>Record</code> save karne ke baad Values saaf karta hai, par Filldown Values rehti hain. <code>Clear</code> Filldown Values rakhta hai; <code>Clearall</code> nahi. Rule ka default action Next with NoRecord hai.</p></div>

<div class="scn"><h4>Chaar VLANs aath ho gaye</h4><p>Ek inventory job VLAN rows database mein store karti thi. Switch upgrade ke baad raat bhar mein count double ho gaya. Naye software ne <code>show vlan</code> ki doosri table bhi print ki aur loose template ne use bhi record kar liya. Do extra states, ek pehli table ke liye aur ek jo baaki ignore kare, ne count wapas theek kar diya.</p><p><b>Lesson:</b> states se batao ki output ka kaunsa hissa chahiye, sirf kaunsi lines nahi.</p></div>

<div class="iv"><p class="q">"TextFSM mein Next, Continue aur Record ka fark kya hai?"</p><p>Next aur Continue line actions hain: Next match ke baad line ki processing rok deta hai, Continue baad ke rules ko bhi use dekhne deta hai. Record ek record action hai: woh maujooda Values ko row ki tarah save karta hai. Yeh dot se jud jaate hain, jaise Continue.Record. Main Clear, Clearall, Error aur state changes ka bhi zikr karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Action shape: <code>-&gt; LineAction.RecordAction NewState</code>, sab hisse optional.</li>
<li><code>Record</code> nahi to ek row (text ke ant ka implicit Record).</li>
<li>States se header se shuru kar sakte ho, tables badal sakte ho aur baaki ignore kar sakte ho.</li>
<li>Aakhri rule <code>^. -&gt; Error</code> unexpected lines dikhata hai.</li>
<li>Pehla matching rule jeetta hai, isliye rules ko specific se general order mein rakho.</li>
</ul></div>
`}};export{e as default};