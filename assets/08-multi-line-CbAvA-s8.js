var e={id:`multi-line`,h:{en:`Multi-line output: Filldown, List and Continue`,hi:`Multi-line output: Filldown, List aur Continue`},body:{en:`
<p><b>The idea of this chapter:</b> so far one line made one row. Real output is not always so kind. A heading may apply to many rows below it, one field may spread over several lines, and one line may carry several values. Three tools solve these: <b>Filldown</b>, <b>List</b> and <b>Continue</b>.</p>

<h3>Analogy: a ledger page</h3>
<p>A ledger page has the date written once at the top, and ten entries below it. The clerk copies the date into every entry (Filldown). One entry may list several items on separate lines, and the clerk gathers them into one bundle (List). And when a new entry starts, the clerk first closes the previous one (Continue with Record).</p>

<h3>Filldown: a heading that applies to the rows below</h3>
<p>A routing table per VRF prints the name of the VRF once. The file <code>show_route_vrf.txt</code> looks like this:</p>
<pre class="out">AUTO01$ cat show_route_vrf.txt
Routing Table: CORP
C        10.10.0.0/24 is directly connected, Vlan10
S        10.20.0.0/24 [1/0] via 10.10.0.2
Routing Table: GUEST
C        172.16.5.0/24 is directly connected, Vlan50</pre>
<pre class="code">Value Filldown VRF (\\S+)
Value Required CODE ([A-Z])
Value NETWORK (\\d+\\.\\d+\\.\\d+\\.\\d+/\\d+)
Value NEXTHOP (\\S+)

Start
  ^Routing Table: &#36;{VRF}
  ^&#36;{CODE}\\s+&#36;{NETWORK}\\s+is directly connected, &#36;{NEXTHOP} -&gt; Record
  ^&#36;{CODE}\\s+&#36;{NETWORK}\\s+\\[\\d+/\\d+\\]\\s+via\\s+&#36;{NEXTHOP} -&gt; Record</pre>
<pre class="out">AUTO01$ python3 parse_one.py route.textfsm show_route_vrf.txt
['VRF', 'CODE', 'NETWORK', 'NEXTHOP']
['CORP', 'C', '10.10.0.0/24', 'Vlan10']
['CORP', 'S', '10.20.0.0/24', '10.10.0.2']
['GUEST', 'C', '172.16.5.0/24', 'Vlan50']</pre>
<p>The first rule has no action: it only stores the VRF name. After each Record the normal Values are cleared, but a <code>Filldown</code> Value keeps its content, so the second route of CORP also carries "CORP". Without the option (the same template with <code>Value VRF (\\S+)</code>) the second row loses it:</p>
<pre class="out">AUTO01$ python3 parse_one.py nofill.textfsm show_route_vrf.txt
['VRF', 'CODE', 'NETWORK', 'NEXTHOP']
['CORP', 'C', '10.10.0.0/24', 'Vlan10']
<span class="hl">['', 'S', '10.20.0.0/24', '10.10.0.2']</span>
['GUEST', 'C', '172.16.5.0/24', 'Vlan50']</pre>

<h3>List and Continue: one field over several lines</h3>
<p>In <code>show vlan</code> the ports of a VLAN may wrap onto the next line, and one line may hold several ports. We want a list of ports per VLAN. The sample <code>show_vlan_wrap.txt</code>:</p>
<pre class="out">AUTO01$ cat show_vlan_wrap.txt
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/3
10   USERS                            active    Gi0/1, Gi0/2
                                                Gi0/4
20   VOICE                            active
99   MGMT                             active</pre>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="VLAN 10 line with two ports and a wrapped line with a third port, all collected into the PORTS list">
<rect x="10" y="15" width="400" height="30" rx="6" fill="#bae6fd"/><text x="20" y="35" class="svg-ink" font-size="12">10   USERS    active    Gi0/1, Gi0/2</text>
<rect x="10" y="55" width="400" height="30" rx="6" fill="#e2e8f0"/><text x="20" y="75" class="svg-ink" font-size="12">                         Gi0/4   (wrapped line)</text>
<rect x="450" y="25" width="180" height="70" rx="10" fill="#bbf7d0"/><text x="540" y="50" text-anchor="middle" class="svg-ink" font-size="13">PORTS (List)</text><text x="540" y="72" text-anchor="middle" class="svg-muted" font-size="11">['Gi0/1','Gi0/2','Gi0/4']</text>
<line x1="410" y1="30" x2="450" y2="50" stroke="#64748b" stroke-width="2"/><line x1="410" y1="70" x2="450" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">A List Value collects every match instead of keeping the last one.</text>
</svg><p class="cap">Two lines, three ports, one List Value.</p></div>

<pre class="code">Value Required VLAN_ID (\\d+)
Value VLAN_NAME (\\S+)
Value STATUS (\\S+)
Value List PORTS (Gi\\d+/\\d+)

Start
  ^VLAN\\s+Name -&gt; Vlans

Vlans
  ^\\d+\\s -&gt; Continue.Record
  ^&#36;{VLAN_ID}\\s+&#36;{VLAN_NAME}\\s+&#36;{STATUS} -&gt; Continue
  ^\\d+\\s+\\S+\\s+\\S+\\s+&#36;{PORTS}\\b -&gt; Continue
  ^\\d+\\s+\\S+\\s+\\S+\\s+Gi\\d+/\\d+,\\s+&#36;{PORTS}\\b
  ^\\s+&#36;{PORTS}\\b</pre>
<pre class="out">AUTO01$ python3 parse_one.py vlan_ports.textfsm show_vlan_wrap.txt
['VLAN_ID', 'VLAN_NAME', 'STATUS', 'PORTS']
['1', 'default', 'active', ['Gi0/3']]
<span class="hl">['10', 'USERS', 'active', ['Gi0/1', 'Gi0/2', 'Gi0/4']]</span>
['20', 'VOICE', 'active', []]
['99', 'MGMT', 'active', []]</pre>
<p>Walk through the rules for the line "10 USERS active Gi0/1, Gi0/2":</p>
<ol>
<li><code>^\\d+\\s -&gt; Continue.Record</code>: the line starts with a number, so a <b>new VLAN begins</b>. Save the previous VLAN's row now (for the first VLAN there is nothing to save, and Required throws it away), then keep going.</li>
<li>The second rule captures id, name and status, and says Continue.</li>
<li>The third captures the first port and says Continue.</li>
<li>The fourth captures the second port (after a port and a comma). It has no action, so processing of this line ends.</li>
</ol>
<p>The wrapped line "Gi0/4" starts with spaces, so rules 1 to 4 fail and only the last rule, <code>^\\s+&#36;{PORTS}\\b</code>, adds <code>Gi0/4</code> to the same list. The last VLAN is saved by the implicit Record at the end of the text. A VLAN without ports gets an empty list <code>[]</code>, not an empty string.</p>
<p>This is the pattern behind many ntc-templates: <b>Continue lets several rules look at the same line</b>, and <code>Continue.Record</code> means "a new item starts, save the old one".</p>

<h3>A trap: the extra last row</h3>
<p>A Filldown Value is never cleared by a normal Record, so at the end of the text the engine may find a "non-empty" row made only of the Filldown value. With a site name as Filldown and a host list:</p>
<pre class="out">AUTO01$ python3 parse_one.py site1.textfsm site.txt
['SITE', 'HOST']
['PUNE', 'r1']
['PUNE', 'r2']
['PUNE', 'r3']
<span class="hl">['PUNE', '']</span></pre>
<p>The last row is the implicit Record at the end of the text. The cure is to make the field that proves a real row <code>Required</code> (<code>Value Required HOST (\\S+)</code>). The row with an empty HOST is then discarded. To forget a Filldown value at the end of a section, use <code>-&gt; Clearall</code>.</p>

<div class="eg"><p><b>Worked example.</b> <code>show interfaces trunk</code> prints a list of allowed VLANs per port, wrapped over lines. Use <code>Value List ALLOWED (\\d+)</code>, one rule for the first line, one for the continuation lines, and <code>Continue.Record</code> when a new port line starts. You then have every VLAN of every trunk as a Python list.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>Filldown</code> on a heading Value. Forgetting that a List Value is a Python list in the result, not a string. Putting a rule with no action before a rule that records the same line and expecting both to run: without <code>Continue</code> only the first match counts. Using <code>Record</code> instead of <code>Continue.Record</code> and saving the row before the other rules captured the line.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>Continue</code> cannot be combined with a state change. A <code>Filldown</code> Value survives <code>Record</code> and <code>Clear</code>; only <code>Clearall</code> removes it. A <code>List</code> Value comes back as a list, and an empty one as <code>[]</code>.</p></div>

<div class="scn"><h4>The route table with no VRF name</h4><p>A report listed routes for the whole data centre, but half the rows showed an empty VRF column and could not be grouped. The template stored the VRF name but forgot the Filldown option, so only the first route after each heading had a name. One word in the Value line fixed the report.</p><p><b>Lesson:</b> when a heading applies to many rows, mark the Value Filldown.</p></div>

<div class="iv"><p class="q">"How do you parse output where one record spans several lines?"</p><p>I use Continue so several rules can read the same line, a List Value to collect repeated items, and Continue.Record on the line that starts a new item so the previous item is saved. For headings that apply to many rows I use Filldown. Then I check the last record, because the implicit Record at the end can add an empty row.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>Filldown</code> repeats a heading value into the following rows.</li>
<li><code>List</code> collects every match into a Python list (empty list if none).</li>
<li><code>Continue</code> lets later rules also read the same line; <code>Continue.Record</code> closes the previous item.</li>
<li>Wrapped lines usually start with spaces: give them their own rule.</li>
<li>Use <code>Required</code> on the real-row field to drop the extra last row.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> ab tak ek line se ek row banti thi. Asli output hamesha itna meherbaan nahi hota. Ek heading neeche ki kai rows par lagu ho sakti hai, ek field kai lines mein phail sakta hai, aur ek line kai values rakh sakti hai. Teen tools yeh solve karte hain: <b>Filldown</b>, <b>List</b> aur <b>Continue</b>.</p>

<h3>Analogy: ledger ka page</h3>
<p>Ledger ke page par tareekh upar ek baar likhi hoti hai, aur uske neeche das entries. Clerk tareekh ko har entry mein copy karta hai (Filldown). Ek entry mein alag lines par kai items ho sakte hain, aur clerk unhe ek bundle mein jama karta hai (List). Aur jab nayi entry shuru hoti hai, clerk pehle pichhli ko band karta hai (Continue ke saath Record).</p>

<h3>Filldown: heading jo neeche ki rows par lagti hai</h3>
<p>Har VRF ka routing table VRF ka naam ek baar print karta hai. File <code>show_route_vrf.txt</code> aisi dikhti hai:</p>
<pre class="out">AUTO01$ cat show_route_vrf.txt
Routing Table: CORP
C        10.10.0.0/24 is directly connected, Vlan10
S        10.20.0.0/24 [1/0] via 10.10.0.2
Routing Table: GUEST
C        172.16.5.0/24 is directly connected, Vlan50</pre>
<pre class="code">Value Filldown VRF (\\S+)
Value Required CODE ([A-Z])
Value NETWORK (\\d+\\.\\d+\\.\\d+\\.\\d+/\\d+)
Value NEXTHOP (\\S+)

Start
  ^Routing Table: &#36;{VRF}
  ^&#36;{CODE}\\s+&#36;{NETWORK}\\s+is directly connected, &#36;{NEXTHOP} -&gt; Record
  ^&#36;{CODE}\\s+&#36;{NETWORK}\\s+\\[\\d+/\\d+\\]\\s+via\\s+&#36;{NEXTHOP} -&gt; Record</pre>
<pre class="out">AUTO01$ python3 parse_one.py route.textfsm show_route_vrf.txt
['VRF', 'CODE', 'NETWORK', 'NEXTHOP']
['CORP', 'C', '10.10.0.0/24', 'Vlan10']
['CORP', 'S', '10.20.0.0/24', '10.10.0.2']
['GUEST', 'C', '172.16.5.0/24', 'Vlan50']</pre>
<p>Pehle rule mein koi action nahi: woh sirf VRF ka naam store karta hai. Har Record ke baad normal Values saaf ho jaati hain, par <code>Filldown</code> Value apna content rakhti hai, isliye CORP ke doosre route par bhi "CORP" aata hai. Option ke bina (wahi template, <code>Value VRF (\\S+)</code> ke saath) doosri row mein woh kho jaata hai:</p>
<pre class="out">AUTO01$ python3 parse_one.py nofill.textfsm show_route_vrf.txt
['VRF', 'CODE', 'NETWORK', 'NEXTHOP']
['CORP', 'C', '10.10.0.0/24', 'Vlan10']
<span class="hl">['', 'S', '10.20.0.0/24', '10.10.0.2']</span>
['GUEST', 'C', '172.16.5.0/24', 'Vlan50']</pre>

<h3>List aur Continue: ek field kai lines mein</h3>
<p><code>show vlan</code> mein VLAN ke ports agli line par wrap ho sakte hain, aur ek line mein kai ports ho sakte hain. Humein har VLAN ke ports ki list chahiye. Sample <code>show_vlan_wrap.txt</code>:</p>
<pre class="out">AUTO01$ cat show_vlan_wrap.txt
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/3
10   USERS                            active    Gi0/1, Gi0/2
                                                Gi0/4
20   VOICE                            active
99   MGMT                             active</pre>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="VLAN 10 ki line mein do ports aur wrapped line mein teesra port, sab PORTS list mein jama">
<rect x="10" y="15" width="400" height="30" rx="6" fill="#bae6fd"/><text x="20" y="35" class="svg-ink" font-size="12">10   USERS    active    Gi0/1, Gi0/2</text>
<rect x="10" y="55" width="400" height="30" rx="6" fill="#e2e8f0"/><text x="20" y="75" class="svg-ink" font-size="12">                         Gi0/4   (wrapped line)</text>
<rect x="450" y="25" width="180" height="70" rx="10" fill="#bbf7d0"/><text x="540" y="50" text-anchor="middle" class="svg-ink" font-size="13">PORTS (List)</text><text x="540" y="72" text-anchor="middle" class="svg-muted" font-size="11">['Gi0/1','Gi0/2','Gi0/4']</text>
<line x1="410" y1="30" x2="450" y2="50" stroke="#64748b" stroke-width="2"/><line x1="410" y1="70" x2="450" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">List Value aakhri ko rakhne ki jagah har match jama karti hai.</text>
</svg><p class="cap">Do lines, teen ports, ek List Value.</p></div>

<pre class="code">Value Required VLAN_ID (\\d+)
Value VLAN_NAME (\\S+)
Value STATUS (\\S+)
Value List PORTS (Gi\\d+/\\d+)

Start
  ^VLAN\\s+Name -&gt; Vlans

Vlans
  ^\\d+\\s -&gt; Continue.Record
  ^&#36;{VLAN_ID}\\s+&#36;{VLAN_NAME}\\s+&#36;{STATUS} -&gt; Continue
  ^\\d+\\s+\\S+\\s+\\S+\\s+&#36;{PORTS}\\b -&gt; Continue
  ^\\d+\\s+\\S+\\s+\\S+\\s+Gi\\d+/\\d+,\\s+&#36;{PORTS}\\b
  ^\\s+&#36;{PORTS}\\b</pre>
<pre class="out">AUTO01$ python3 parse_one.py vlan_ports.textfsm show_vlan_wrap.txt
['VLAN_ID', 'VLAN_NAME', 'STATUS', 'PORTS']
['1', 'default', 'active', ['Gi0/3']]
<span class="hl">['10', 'USERS', 'active', ['Gi0/1', 'Gi0/2', 'Gi0/4']]</span>
['20', 'VOICE', 'active', []]
['99', 'MGMT', 'active', []]</pre>
<p>Line "10 USERS active Gi0/1, Gi0/2" ke liye rules ko walk-through karo:</p>
<ol>
<li><code>^\\d+\\s -&gt; Continue.Record</code>: line number se shuru hoti hai, isliye <b>nayi VLAN shuru hui</b>. Pichhli VLAN ki row abhi save karo (pehli VLAN ke liye save karne ko kuch nahi, aur Required use phenk deta hai), phir aage badho.</li>
<li>Doosra rule id, name aur status capture karta hai, aur Continue kehta hai.</li>
<li>Teesra pehla port capture karta hai aur Continue kehta hai.</li>
<li>Chautha doosra port capture karta hai (ek port aur comma ke baad). Isme koi action nahi, isliye is line ki processing yahin khatam.</li>
</ol>
<p>Wrapped line "Gi0/4" spaces se shuru hoti hai, isliye rules 1 se 4 fail hote hain aur sirf aakhri rule, <code>^\\s+&#36;{PORTS}\\b</code>, <code>Gi0/4</code> ko usi list mein jodta hai. Aakhri VLAN text ke ant ke implicit Record se save hoti hai. Bina ports wali VLAN ko khaali string nahi, khaali list <code>[]</code> milti hai.</p>
<p>Kai ntc-templates ke peeche yahi pattern hai: <b>Continue kai rules ko ek hi line padhne deta hai</b>, aur <code>Continue.Record</code> ka matlab "nayi item shuru hui, purani save karo".</p>

<h3>Ek jaal: extra aakhri row</h3>
<p>Filldown Value ko normal Record kabhi saaf nahi karta, isliye text ke ant mein engine ko sirf Filldown value se bani "non-empty" row mil sakti hai. Site ke naam ko Filldown aur hosts ki list ke saath:</p>
<pre class="out">AUTO01$ python3 parse_one.py site1.textfsm site.txt
['SITE', 'HOST']
['PUNE', 'r1']
['PUNE', 'r2']
['PUNE', 'r3']
<span class="hl">['PUNE', '']</span></pre>
<p>Aakhri row text ke ant ka implicit Record hai. Ilaaj hai us field ko <code>Required</code> banana jo asli row saabit karta hai (<code>Value Required HOST (\\S+)</code>). Tab khaali HOST wali row phenk di jaati hai. Section ke ant mein Filldown value bhulane ke liye <code>-&gt; Clearall</code> use karo.</p>

<div class="eg"><p><b>Worked example.</b> <code>show interfaces trunk</code> har port ke allowed VLANs ki list print karta hai, lines par wrap hoti hui. <code>Value List ALLOWED (\\d+)</code> use karo, pehli line ke liye ek rule, continuation lines ke liye ek, aur jab nayi port line shuru ho tab <code>Continue.Record</code>. Phir har trunk ki har VLAN Python list mein milti hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Heading Value par <code>Filldown</code> bhool jaana. Yeh bhool jaana ki List Value result mein Python list hai, string nahi. Bina action wale rule ko usi line ko record karne wale rule se pehle rakhkar dono ke chalne ki umeed karna: <code>Continue</code> ke bina sirf pehla match ginta hai. <code>Continue.Record</code> ki jagah <code>Record</code> use karna aur doosre rules ke line capture karne se pehle row save kar dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>Continue</code> ko state change ke saath nahi jod sakte. <code>Filldown</code> Value <code>Record</code> aur <code>Clear</code> se bachti hai; sirf <code>Clearall</code> use hataata hai. <code>List</code> Value list ki tarah aati hai, aur khaali ho to <code>[]</code>.</p></div>

<div class="scn"><h4>Bina VRF naam wala route table</h4><p>Ek report ne poore data centre ke routes list kiye, par aadhi rows mein VRF column khaali tha aur group nahi ho sakta tha. Template VRF naam store karta tha par Filldown option bhool gaya tha, isliye har heading ke baad sirf pehle route ko naam mila. Value line mein ek shabd ne report theek kar di.</p><p><b>Lesson:</b> jab heading kai rows par lagti ho, Value ko Filldown mark karo.</p></div>

<div class="iv"><p class="q">"Jis output mein ek record kai lines mein phailta hai use kaise parse karte ho?"</p><p>Continue use karta hoon taaki kai rules ek hi line padh sakein, repeated items jama karne ke liye List Value, aur nayi item shuru karne wali line par Continue.Record taaki pichhli item save ho. Jo headings kai rows par lagti hain unke liye Filldown. Phir aakhri record check karta hoon, kyunki ant ka implicit Record ek khaali row jod sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>Filldown</code> heading value ko neeche ki rows mein dohrata hai.</li>
<li><code>List</code> har match ko Python list mein jama karta hai (kuch na mile to khaali list).</li>
<li><code>Continue</code> baad ke rules ko bhi wahi line padhne deta hai; <code>Continue.Record</code> pichhli item band karta hai.</li>
<li>Wrapped lines aam taur par spaces se shuru hoti hain: unhe apna rule do.</li>
<li>Asli-row field par <code>Required</code> lagao taaki extra aakhri row hat jaye.</li>
</ul></div>
`}};export{e as default};