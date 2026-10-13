var e={id:`loops`,h:{en:`Loops in templates: one block, many VLANs and ports`,hi:`Templates mein loops: ek block, kai VLANs aur ports`},body:{en:`
<p><b>The idea of this chapter:</b> a switch has many VLANs and many user ports. You do not want to write a block for each one. A <code>{% for %}</code> loop repeats a piece of the template once per item in a list.</p>

<h3>Analogy: the stamp</h3>
<p>You have one rubber stamp that prints a port block. You press it once for every port on the list. The stamp (the lines inside the loop) never changes; the ink (the values) changes each press. The list tells you when to stop.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="For loop prints one block per item">
<rect x="20" y="20" width="200" height="140" rx="10" fill="#fde68a"/><text x="120" y="42" text-anchor="middle" class="svg-ink" font-size="13">vlans (a list)</text>
<text x="120" y="70" text-anchor="middle" class="svg-muted" font-size="12">10  USERS</text><text x="120" y="92" text-anchor="middle" class="svg-muted" font-size="12">20  VOICE</text><text x="120" y="114" text-anchor="middle" class="svg-muted" font-size="12">99  MGMT</text>
<line x1="220" y1="90" x2="270" y2="90" stroke="#64748b" stroke-width="2"/>
<rect x="270" y="50" width="150" height="80" rx="10" fill="#bae6fd"/><text x="345" y="78" text-anchor="middle" class="svg-ink" font-size="12">{% for v in vlans %}</text><text x="345" y="98" text-anchor="middle" class="svg-muted" font-size="12">vlan {{ v.id }}</text><text x="345" y="116" text-anchor="middle" class="svg-ink" font-size="12">{% endfor %}</text>
<line x1="420" y1="90" x2="470" y2="90" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="20" width="150" height="140" rx="10" fill="#bbf7d0"/><text x="545" y="42" text-anchor="middle" class="svg-ink" font-size="13">rendered</text>
<text x="545" y="70" text-anchor="middle" class="svg-muted" font-size="12">vlan 10 / name USERS</text><text x="545" y="92" text-anchor="middle" class="svg-muted" font-size="12">vlan 20 / name VOICE</text><text x="545" y="114" text-anchor="middle" class="svg-muted" font-size="12">vlan 99 / name MGMT</text>
</svg><p class="cap">The loop body is printed once for every item in the list.</p></div>

<h3>The for tag</h3>
<p>Statements in Jinja2 use <code>{% ... %}</code>. They never print anything themselves; they control what is printed. A loop needs an opening and a closing tag:</p>
<pre class="code">from jinja2 import Template

text = """{% for v in vlans %}
vlan {{ v.id }}
 name {{ v.name }}
{% endfor %}"""
vlans = [{"id": 10, "name": "USERS"}, {"id": 20, "name": "VOICE"}]
print(Template(text).render(vlans=vlans))</pre>
<ul>
<li><code>{% for v in vlans %}</code> means: for each item in the list <code>vlans</code>, call the current item <code>v</code> and run the lines below.</li>
<li><code>{% endfor %}</code> closes the loop. <b>Every <code>for</code> needs an <code>endfor</code>.</b> Forget it and Jinja2 raises a syntax error (chapter 8).</li>
<li>Each item <code>v</code> is a dictionary, so <code>{{ v.id }}</code> and <code>{{ v.name }}</code> read its keys.</li>
</ul>

<h3>The blank-line problem and trim_blocks</h3>
<p>A statement tag sits on its own line, and the line break after it is also text. Jinja2 prints that line break, so the output has stray empty lines. Run <code>t4.py</code>, which renders the same template twice, once with default settings and once with an Environment that has <code>trim_blocks=True</code> and <code>lstrip_blocks=True</code>:</p>
<pre class="out">AUTO01$ python3 t4.py

vlan 10
 name USERS

vlan 20
 name VOICE
---- with trim_blocks
vlan 10
 name USERS
vlan 20
 name VOICE</pre>
<p>Look at the first block: an empty line comes before the first vlan and another between the two VLANs. With the two options on, the statement lines vanish cleanly. For configuration, <b>always</b> turn them on:</p>
<ul>
<li><code>trim_blocks=True</code> removes the first newline after a block tag such as <code>{% for %}</code>.</li>
<li><code>lstrip_blocks=True</code> strips spaces and tabs from the start of a line that begins with a block tag, so you can indent your template for readability.</li>
</ul>
<pre class="code">from jinja2 import Environment

env = Environment(trim_blocks=True, lstrip_blocks=True)
template = env.from_string(text)</pre>
<p>An <code>Environment</code> holds settings for your templates. You will meet it again in chapter 6, where it also knows which folder holds the template files.</p>

<h3>loop.index: numbering the items</h3>
<p>Inside a loop, Jinja2 gives you a helper named <code>loop</code>. <code>loop.index</code> counts 1, 2, 3 and so on. The lab's access-switch template uses it to number user ports:</p>
<pre class="code">{% for port in sw.ports %}
interface {{ port }}
 description USER-{{ loop.index }}
 switchport mode access
{% endfor %}</pre>
<p>For PUN-ACC-SW1 with three ports the rendered file contains <code>description USER-1</code>, <code>USER-2</code> and <code>USER-3</code>. For a tiny test list the same helper prints this (from <code>t6.py</code>):</p>
<pre class="out">AUTO01$ python3 t6.py
...
<span class="hl">1=a 2=b 3=c</span>
...</pre>
<p>Other helpers: <code>loop.first</code> and <code>loop.last</code> are true for the first and last round, and <code>loop.length</code> is the number of items.</p>

<div class="eg"><p><b>Worked example.</b> The Pune access switch PUN-ACC-SW1 has user ports Gi0/2, Gi0/3 and Gi0/4. The data says <code>ports = ["GigabitEthernet0/2", "GigabitEthernet0/3", "GigabitEthernet0/4"]</code>. Three lines of template produce three complete interface blocks. When the building adds ports Gi0/5 and Gi0/6, you edit the CSV, not the template.</p></div>

<div class="warn"><p><b>Common mistakes.</b> A missing <code>{% endfor %}</code>. Putting the <code>{% endfor %}</code> too early or too late, so lines that should repeat do not, or lines that should print once repeat. Forgetting <code>trim_blocks</code> and then wondering about blank lines. Looping over a string instead of a list: a string such as <code>"Gi0/2 Gi0/3"</code> loops over single characters, so split it into a list first.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>{% for %}</code> and <code>{% endfor %}</code> are <i>statements</i> and use percent signs; <code>{{ }}</code> prints values. <code>loop.index</code> starts at <b>1</b>, not 0 (<code>loop.index0</code> starts at 0).</p></div>

<div class="scn"><h4>Every file ended with the default route</h4><p>A branch template had the default route line at the very end, but the <code>{% endfor %}</code> for the LAN sub-interfaces was missing. In Jinja2 that is an error, so the engineer put the <code>endfor</code> at the end of the file. The render succeeded, but the default route was now printed inside the loop, once per LAN: two identical <code>ip route</code> lines for a two-LAN branch. The diff against the reviewed config exposed it. The fix was to close the loop <i>before</i> the route line.</p><p><b>Lesson:</b> the position of <code>endfor</code> decides what repeats. Check what the loop includes.</p></div>

<div class="iv"><p class="q">"How do you generate one interface block per port in Jinja2?"</p><p>A <code>{% for port in ports %}</code> loop over a list of ports with the interface lines inside, closed with <code>{% endfor %}</code>. I use <code>loop.index</code> for numbering descriptions and I set <code>trim_blocks</code> and <code>lstrip_blocks</code> so the statement lines do not leave blank lines in the config.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>{% for item in list %}</code> ... <code>{% endfor %}</code> repeats the lines between for each item.</li>
<li>Statements use <code>{% %}</code> and print nothing themselves.</li>
<li>Set <code>trim_blocks=True, lstrip_blocks=True</code> for clean config output.</li>
<li><code>loop.index</code> counts from 1; <code>loop.first</code>, <code>loop.last</code> and <code>loop.length</code> also exist.</li>
<li>Where you put <code>endfor</code> decides what repeats.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> switch par kai VLANs aur kai user ports hote hain. Aap har ek ke liye alag block nahi likhna chahte. <code>{% for %}</code> loop template ka ek hissa list ke har item ke liye ek baar repeat karta hai.</p>

<h3>Analogy: stamp</h3>
<p>Aapke paas ek rubber stamp hai jo port block print karta hai. List ke har port ke liye use ek baar dabate ho. Stamp (loop ke andar ki lines) kabhi nahi badalta; syahi (values) har baar badalti hai. List batati hai kab rukna hai.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="For loop har item ke liye ek block print karta hai">
<rect x="20" y="20" width="200" height="140" rx="10" fill="#fde68a"/><text x="120" y="42" text-anchor="middle" class="svg-ink" font-size="13">vlans (ek list)</text>
<text x="120" y="70" text-anchor="middle" class="svg-muted" font-size="12">10  USERS</text><text x="120" y="92" text-anchor="middle" class="svg-muted" font-size="12">20  VOICE</text><text x="120" y="114" text-anchor="middle" class="svg-muted" font-size="12">99  MGMT</text>
<line x1="220" y1="90" x2="270" y2="90" stroke="#64748b" stroke-width="2"/>
<rect x="270" y="50" width="150" height="80" rx="10" fill="#bae6fd"/><text x="345" y="78" text-anchor="middle" class="svg-ink" font-size="12">{% for v in vlans %}</text><text x="345" y="98" text-anchor="middle" class="svg-muted" font-size="12">vlan {{ v.id }}</text><text x="345" y="116" text-anchor="middle" class="svg-ink" font-size="12">{% endfor %}</text>
<line x1="420" y1="90" x2="470" y2="90" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="20" width="150" height="140" rx="10" fill="#bbf7d0"/><text x="545" y="42" text-anchor="middle" class="svg-ink" font-size="13">rendered</text>
<text x="545" y="70" text-anchor="middle" class="svg-muted" font-size="12">vlan 10 / name USERS</text><text x="545" y="92" text-anchor="middle" class="svg-muted" font-size="12">vlan 20 / name VOICE</text><text x="545" y="114" text-anchor="middle" class="svg-muted" font-size="12">vlan 99 / name MGMT</text>
</svg><p class="cap">Loop body list ke har item ke liye ek baar print hoti hai.</p></div>

<h3>for tag</h3>
<p>Jinja2 mein statements <code>{% ... %}</code> use karte hain. Yeh khud kuch print nahi karte; yeh control karte hain ki kya print hoga. Loop ko opening aur closing tag chahiye:</p>
<pre class="code">from jinja2 import Template

text = """{% for v in vlans %}
vlan {{ v.id }}
 name {{ v.name }}
{% endfor %}"""
vlans = [{"id": 10, "name": "USERS"}, {"id": 20, "name": "VOICE"}]
print(Template(text).render(vlans=vlans))</pre>
<ul>
<li><code>{% for v in vlans %}</code> matlab: list <code>vlans</code> ke har item ke liye, current item ko <code>v</code> kaho aur neeche ki lines chalao.</li>
<li><code>{% endfor %}</code> loop band karta hai. <b>Har <code>for</code> ko ek <code>endfor</code> chahiye.</b> Bhoolo to Jinja2 syntax error deta hai (chapter 8).</li>
<li>Har item <code>v</code> dictionary hai, isliye <code>{{ v.id }}</code> aur <code>{{ v.name }}</code> uski keys padhte hain.</li>
</ul>

<h3>Blank-line ki problem aur trim_blocks</h3>
<p>Statement tag apni line par hota hai, aur uske baad ka line break bhi text hai. Jinja2 woh line break print karta hai, isliye output mein faltu khaali lines aati hain. <code>t4.py</code> chalao, jo wahi template do baar render karti hai, ek baar default settings ke saath aur ek baar aise Environment ke saath jisme <code>trim_blocks=True</code> aur <code>lstrip_blocks=True</code> hai:</p>
<pre class="out">AUTO01$ python3 t4.py

vlan 10
 name USERS

vlan 20
 name VOICE
---- with trim_blocks
vlan 10
 name USERS
vlan 20
 name VOICE</pre>
<p>Pehla block dekho: pehle vlan se pehle ek khaali line hai aur dono VLANs ke beech ek aur. Dono options on hone par statement lines saaf gaayab ho jaati hain. Configuration ke liye <b>hamesha</b> on rakho:</p>
<ul>
<li><code>trim_blocks=True</code> block tag, jaise <code>{% for %}</code>, ke baad ki pehli newline hata deta hai.</li>
<li><code>lstrip_blocks=True</code> us line ke shuru ke spaces aur tabs hata deta hai jo block tag se shuru hoti hai, taaki aap template ko padhne layak indent kar sako.</li>
</ul>
<pre class="code">from jinja2 import Environment

env = Environment(trim_blocks=True, lstrip_blocks=True)
template = env.from_string(text)</pre>
<p><code>Environment</code> aapke templates ki settings rakhta hai. Chapter 6 mein phir milega, jahan use yeh bhi pata hota hai ki template files kaunse folder mein hain.</p>

<h3>loop.index: items ko number dena</h3>
<p>Loop ke andar Jinja2 aapko <code>loop</code> naam ka helper deta hai. <code>loop.index</code> 1, 2, 3 aise ginta hai. Lab ka access-switch template ise user ports number karne ke liye use karta hai:</p>
<pre class="code">{% for port in sw.ports %}
interface {{ port }}
 description USER-{{ loop.index }}
 switchport mode access
{% endfor %}</pre>
<p>Teen ports wale PUN-ACC-SW1 ke liye rendered file mein <code>description USER-1</code>, <code>USER-2</code> aur <code>USER-3</code> hote hain. Ek chhoti test list ke liye wahi helper yeh print karta hai (<code>t6.py</code> se):</p>
<pre class="out">AUTO01$ python3 t6.py
...
<span class="hl">1=a 2=b 3=c</span>
...</pre>
<p>Aur helpers: <code>loop.first</code> aur <code>loop.last</code> pehle aur aakhri round ke liye true hote hain, aur <code>loop.length</code> items ki ginti hai.</p>

<div class="eg"><p><b>Worked example.</b> Pune access switch PUN-ACC-SW1 ke user ports Gi0/2, Gi0/3 aur Gi0/4 hain. Data kehta hai <code>ports = ["GigabitEthernet0/2", "GigabitEthernet0/3", "GigabitEthernet0/4"]</code>. Template ki teen lines teen poore interface blocks banati hain. Building mein ports Gi0/5 aur Gi0/6 judein to aap CSV edit karte ho, template nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>{% endfor %}</code> gaayab hona. <code>{% endfor %}</code> bahut jaldi ya bahut der se rakhna, jisse jo lines repeat honi chahiye woh nahi hoti, ya jo ek baar print honi chahiye woh repeat hoti hain. <code>trim_blocks</code> bhool jaana aur phir blank lines par hairaan hona. List ki jagah string par loop karna: <code>"Gi0/2 Gi0/3"</code> jaisi string akshar-akshar par loop karti hai, isliye pehle use list mein split karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>{% for %}</code> aur <code>{% endfor %}</code> <i>statements</i> hain aur percent signs use karte hain; <code>{{ }}</code> values print karta hai. <code>loop.index</code> <b>1</b> se shuru hota hai, 0 se nahi (<code>loop.index0</code> 0 se).</p></div>

<div class="scn"><h4>Har file default route par khatam hui</h4><p>Ek branch template mein default route line bilkul end mein thi, par LAN sub-interfaces ka <code>{% endfor %}</code> gaayab tha. Jinja2 mein yeh error hai, isliye engineer ne <code>endfor</code> file ke end mein rakh diya. Render safal hua, par ab default route loop ke andar print ho rahi thi, har LAN ke liye ek baar: do-LAN branch ke liye do ek jaisi <code>ip route</code> lines. Reviewed config se diff ne yeh pakda. Fix tha loop ko route line se <i>pehle</i> band karna.</p><p><b>Lesson:</b> <code>endfor</code> ki position tay karti hai kya repeat hoga. Check karo loop mein kya shamil hai.</p></div>

<div class="iv"><p class="q">"Jinja2 mein har port ke liye ek interface block kaise banate ho?"</p><p>Ports ki list par <code>{% for port in ports %}</code> loop, jiske andar interface lines hon, aur <code>{% endfor %}</code> se band. Descriptions number karne ke liye <code>loop.index</code> use karta hoon aur <code>trim_blocks</code> aur <code>lstrip_blocks</code> set karta hoon taaki statement lines config mein blank lines na chhodein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>{% for item in list %}</code> ... <code>{% endfor %}</code> beech ki lines har item ke liye repeat karta hai.</li>
<li>Statements <code>{% %}</code> use karte hain aur khud kuch print nahi karte.</li>
<li>Saaf config output ke liye <code>trim_blocks=True, lstrip_blocks=True</code> set karo.</li>
<li><code>loop.index</code> 1 se ginta hai; <code>loop.first</code>, <code>loop.last</code> aur <code>loop.length</code> bhi hain.</li>
<li><code>endfor</code> kahan rakha hai yeh tay karta hai kya repeat hoga.</li>
</ul></div>
`}};export{e as default};