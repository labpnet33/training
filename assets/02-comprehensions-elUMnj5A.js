var e={id:`comprehensions`,h:{en:`List, dictionary and set comprehensions`,hi:`List, dictionary aur set comprehensions`},body:{en:`
<p><b>The idea of this chapter:</b> a very common loop takes a collection, does a small thing to each item and collects the results. Python has a one-line form for that loop, called a <b>comprehension</b>. It is not magic and it is not faster to think about than a loop, but once you can read it, inventories and show output become easy to reshape.</p>

<h3>Analogy: a rubber stamp</h3>
<p>You have a tray of device cards. You pick up each card, stamp out one field (the hostname) and drop the stamp mark into a new tray. A <b>list comprehension</b> says the whole job in one sentence: "for each card in the tray, give me its hostname".</p>

<h3>From loop to comprehension</h3>
<p>This is the inventory we use throughout the chapter. Each device is a dictionary, as you built in <code>auto-py-data</code>.</p>
<pre class="code">devices = [
    {"name": "PUN-CORE-R1", "ip": "10.99.0.1", "role": "core", "up": True},
    {"name": "BLR-EDGE-R2", "ip": "10.99.0.2", "role": "edge", "up": True},
    {"name": "HYD-EDGE-R3", "ip": "10.99.0.3", "role": "edge", "up": False},
    {"name": "SW1", "ip": "10.99.0.11", "role": "access", "up": True},
]

names = []
for d in devices:
    names.append(d["name"])
print(names)

names = [d["name"] for d in devices]
print(names)
print([n.lower() for n in names])
print([len(n) for n in names])</pre>
<pre class="out">AUTO01$ python3 c2.py
['PUN-CORE-R1', 'BLR-EDGE-R2', 'HYD-EDGE-R3', 'SW1']
<span class="hl">['PUN-CORE-R1', 'BLR-EDGE-R2', 'HYD-EDGE-R3', 'SW1']</span>
['pun-core-r1', 'blr-edge-r2', 'hyd-edge-r3', 'sw1']
[11, 11, 11, 3]</pre>
<p>The loop and the comprehension give the same list. Read the comprehension from the right: <code>for d in devices</code> walks the list, and <code>d["name"]</code> is the value to keep for each pass.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Anatomy of a list comprehension: expression, for clause, optional if clause">
<rect x="20" y="60" width="26" height="40" rx="6" fill="#e2e8f0"/><text x="33" y="86" text-anchor="middle" class="svg-ink" font-size="16">[</text>
<rect x="56" y="50" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="131" y="76" text-anchor="middle" class="svg-ink" font-size="13">d["name"]</text><text x="131" y="96" text-anchor="middle" class="svg-muted" font-size="11">what to keep</text>
<rect x="216" y="50" width="190" height="60" rx="8" fill="#bae6fd"/><text x="311" y="76" text-anchor="middle" class="svg-ink" font-size="13">for d in devices</text><text x="311" y="96" text-anchor="middle" class="svg-muted" font-size="11">where items come from</text>
<rect x="416" y="50" width="170" height="60" rx="8" fill="#fde68a"/><text x="501" y="76" text-anchor="middle" class="svg-ink" font-size="13">if d["up"]</text><text x="501" y="96" text-anchor="middle" class="svg-muted" font-size="11">optional filter</text>
<rect x="596" y="60" width="24" height="40" rx="6" fill="#e2e8f0"/><text x="608" y="86" text-anchor="middle" class="svg-ink" font-size="16">]</text>
<text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">[ keep  for item in source  if test ]</text>
</svg><p class="cap">Three parts: what to keep, where from, and an optional test.</p></div>

<h3>Dictionary and set comprehensions</h3>
<p>Swap the square brackets for curly braces. With a <code>key: value</code> pair you get a <b>dictionary comprehension</b>; with a single value you get a <b>set comprehension</b>. A set keeps each value only once.</p>
<pre class="code">print({d["name"]: d["ip"] for d in devices})
roles = {d["role"] for d in devices}
print(sorted(roles), len(roles))</pre>
<pre class="out">AUTO01$ python3 c2.py
{'PUN-CORE-R1': '10.99.0.1', 'BLR-EDGE-R2': '10.99.0.2', 'HYD-EDGE-R3': '10.99.0.3', 'SW1': '10.99.0.11'}
<span class="hl">['access', 'core', 'edge'] 3</span></pre>
<p>Four devices, but only three distinct roles: the set threw away the duplicate <code>edge</code>. We print <code>sorted(roles)</code> because a set has no fixed order; sorting makes the output the same every time. Two quick relatives: <code>dict(zip(names, ips))</code> builds a dictionary from two parallel lists, and <code>{ip: name for name, ip in addressed.items()}</code> flips a dictionary so you can look up a device by address.</p>

<div class="eg"><p><b>Worked example: show ip interface brief.</b> A pasted output is just text. Split each line into words and the table becomes a list of lists.</p></div>
<pre class="code">output = """Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/1     unassigned      YES unset  administratively down down
GigabitEthernet0/2     192.0.2.1       YES manual down                  down"""

rows = [line.split() for line in output.splitlines()[1:]]
print(rows[0])
addressed = {r[0]: r[1] for r in rows if r[1] != "unassigned"}
print(addressed)
print([r[0] for r in rows if r[-1] == "down"])</pre>
<pre class="out">AUTO01$ python3 c5.py
['GigabitEthernet0/0', '10.99.0.1', 'YES', 'manual', 'up', 'up']
<span class="hl">{'GigabitEthernet0/0': '10.99.0.1', 'GigabitEthernet0/2': '192.0.2.1'}</span>
['GigabitEthernet0/1', 'GigabitEthernet0/2']</pre>
<p>Three one-line answers from one pasted table: the first row split into words, a dictionary of interfaces that have an address, and the interfaces whose protocol is down. <code>[1:]</code> skips the header line, and <code>r[-1]</code> is the last word of the row, the Protocol column. Note that "administratively down" is two words, so we counted columns from the end for the last one.</p>

<h3>The loop variable stays inside</h3>
<p>In Python 3 the name after <code>for</code> exists only inside the comprehension. After the line has run, <code>d</code> is gone, so it cannot overwrite a variable of the same name that you were using elsewhere. Trying to print it afterwards raises <code>NameError</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> Using a set comprehension when you wanted a dictionary: <code>{d["name"] for d in devices}</code> has no colon, so it is a set. Forgetting that a set has no order. Calling <code>print</code> inside a comprehension to "do something": <code>[print(n) for n in names]</code> prints the names but also builds a useless list of <code>None</code> values. Use a plain <code>for</code> loop when you want an action rather than a result.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>[...]</code> makes a list, <code>{k: v ...}</code> a dictionary, <code>{x ...}</code> a set. And <code>(x for x ...)</code> with round brackets is <i>not</i> a tuple comprehension; it is a generator expression, which is the next big topic.</p></div>

<div class="scn"><h4>Which VLANs does the site really use?</h4><p>An engineer had a dictionary of switch name to VLAN list and was asked for the list of distinct VLANs across the campus before a clean-up. One set comprehension over all the lists and a <code>sorted()</code> around it gave the answer in a single line, and the duplicates that tripped up a manual spreadsheet count disappeared on their own.</p><p><b>Lesson:</b> when you need "distinct", reach for a set.</p></div>

<div class="iv"><p class="q">"What is a comprehension, and when would you not use one?"</p><p>It is a compact expression that builds a list, dictionary or set from another iterable, with an optional filter. I use it when the job is one clear transformation or filter. If I need several statements, side effects such as printing, or the line stops being readable, I write a normal loop.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A comprehension has three parts: what to keep, where it comes from, an optional test.</li>
<li><code>[...]</code> is a list, <code>{k: v ...}</code> a dictionary, <code>{x ...}</code> a set.</li>
<li>Sets drop duplicates and have no order; wrap them in <code>sorted()</code> to print.</li>
<li>The loop variable does not leak out of the comprehension in Python 3.</li>
<li>Use a comprehension for results; use a loop for actions.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> bahut common loop ek collection leta hai, har item par chhota kaam karta hai aur results jama karta hai. Python ke paas us loop ka ek-line form hai, jise <b>comprehension</b> kehte hain. Yeh jaadu nahi hai aur loop se sochne mein tez bhi nahi, par ek baar padhna aa jaye to inventories aur show output ko naya shape dena aasaan ho jaata hai.</p>

<h3>Analogy: rubber stamp</h3>
<p>Aapke paas device cards ki tray hai. Har card uthao, ek field (hostname) stamp karke nikalo aur stamp ka nishan nayi tray mein daalo. <b>List comprehension</b> poora kaam ek vaakya mein kehti hai: "tray ke har card ke liye, mujhe uska hostname do".</p>

<h3>Loop se comprehension tak</h3>
<p>Yeh woh inventory hai jo hum poore chapter mein use karte hain. Har device ek dictionary hai, jaise aapne <code>auto-py-data</code> mein banayi thi.</p>
<pre class="code">devices = [
    {"name": "PUN-CORE-R1", "ip": "10.99.0.1", "role": "core", "up": True},
    {"name": "BLR-EDGE-R2", "ip": "10.99.0.2", "role": "edge", "up": True},
    {"name": "HYD-EDGE-R3", "ip": "10.99.0.3", "role": "edge", "up": False},
    {"name": "SW1", "ip": "10.99.0.11", "role": "access", "up": True},
]

names = []
for d in devices:
    names.append(d["name"])
print(names)

names = [d["name"] for d in devices]
print(names)
print([n.lower() for n in names])
print([len(n) for n in names])</pre>
<pre class="out">AUTO01$ python3 c2.py
['PUN-CORE-R1', 'BLR-EDGE-R2', 'HYD-EDGE-R3', 'SW1']
<span class="hl">['PUN-CORE-R1', 'BLR-EDGE-R2', 'HYD-EDGE-R3', 'SW1']</span>
['pun-core-r1', 'blr-edge-r2', 'hyd-edge-r3', 'sw1']
[11, 11, 11, 3]</pre>
<p>Loop aur comprehension same list dete hain. Comprehension ko daayein se padho: <code>for d in devices</code> list par chalta hai, aur <code>d["name"]</code> har pass ke liye rakhne wali value hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="List comprehension ki anatomy: expression, for clause, optional if clause">
<rect x="20" y="60" width="26" height="40" rx="6" fill="#e2e8f0"/><text x="33" y="86" text-anchor="middle" class="svg-ink" font-size="16">[</text>
<rect x="56" y="50" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="131" y="76" text-anchor="middle" class="svg-ink" font-size="13">d["name"]</text><text x="131" y="96" text-anchor="middle" class="svg-muted" font-size="11">kya rakhna hai</text>
<rect x="216" y="50" width="190" height="60" rx="8" fill="#bae6fd"/><text x="311" y="76" text-anchor="middle" class="svg-ink" font-size="13">for d in devices</text><text x="311" y="96" text-anchor="middle" class="svg-muted" font-size="11">items kahan se aate hain</text>
<rect x="416" y="50" width="170" height="60" rx="8" fill="#fde68a"/><text x="501" y="76" text-anchor="middle" class="svg-ink" font-size="13">if d["up"]</text><text x="501" y="96" text-anchor="middle" class="svg-muted" font-size="11">optional filter</text>
<rect x="596" y="60" width="24" height="40" rx="6" fill="#e2e8f0"/><text x="608" y="86" text-anchor="middle" class="svg-ink" font-size="16">]</text>
<text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">[ keep  for item in source  if test ]</text>
</svg><p class="cap">Teen hisse: kya rakhna hai, kahan se, aur optional test.</p></div>

<h3>Dictionary aur set comprehensions</h3>
<p>Square brackets ki jagah curly braces lagao. <code>key: value</code> jodi ke saath <b>dictionary comprehension</b> milti hai; ek akeli value ke saath <b>set comprehension</b>. Set har value sirf ek baar rakhta hai.</p>
<pre class="code">print({d["name"]: d["ip"] for d in devices})
roles = {d["role"] for d in devices}
print(sorted(roles), len(roles))</pre>
<pre class="out">AUTO01$ python3 c2.py
{'PUN-CORE-R1': '10.99.0.1', 'BLR-EDGE-R2': '10.99.0.2', 'HYD-EDGE-R3': '10.99.0.3', 'SW1': '10.99.0.11'}
<span class="hl">['access', 'core', 'edge'] 3</span></pre>
<p>Chaar devices, par sirf teen alag roles: set ne duplicate <code>edge</code> phenk diya. Hum <code>sorted(roles)</code> print karte hain kyunki set ka koi fixed order nahi hota; sort karne se output har baar same aata hai. Do chhote rishtedaar: <code>dict(zip(names, ips))</code> do parallel lists se dictionary banata hai, aur <code>{ip: name for name, ip in addressed.items()}</code> dictionary ko ulat deta hai taaki aap address se device dhoondh sako.</p>

<div class="eg"><p><b>Worked example: show ip interface brief.</b> Paste kiya hua output sirf text hai. Har line ko words mein todo aur table lists ki list ban jaati hai.</p></div>
<pre class="code">output = """Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/1     unassigned      YES unset  administratively down down
GigabitEthernet0/2     192.0.2.1       YES manual down                  down"""

rows = [line.split() for line in output.splitlines()[1:]]
print(rows[0])
addressed = {r[0]: r[1] for r in rows if r[1] != "unassigned"}
print(addressed)
print([r[0] for r in rows if r[-1] == "down"])</pre>
<pre class="out">AUTO01$ python3 c5.py
['GigabitEthernet0/0', '10.99.0.1', 'YES', 'manual', 'up', 'up']
<span class="hl">{'GigabitEthernet0/0': '10.99.0.1', 'GigabitEthernet0/2': '192.0.2.1'}</span>
['GigabitEthernet0/1', 'GigabitEthernet0/2']</pre>
<p>Ek paste kiye table se teen one-line jawab: pehli row words mein tooti hui, un interfaces ki dictionary jinke paas address hai, aur woh interfaces jinka protocol down hai. <code>[1:]</code> header line skip karta hai, aur <code>r[-1]</code> row ka aakhri word hai, yaani Protocol column. Dhyan do ki "administratively down" do words hai, isliye aakhri column ko humne peeche se ginta.</p>

<h3>Loop variable andar hi rehta hai</h3>
<p>Python 3 mein <code>for</code> ke baad ka naam sirf comprehension ke andar exist karta hai. Line chalne ke baad <code>d</code> gayab ho jaata hai, isliye woh aapke kisi doosre same-naam variable ko overwrite nahi kar sakta. Baad mein use print karne par <code>NameError</code> aata hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Dictionary chahiye thi par set comprehension likhna: <code>{d["name"] for d in devices}</code> mein colon nahi hai, isliye woh set hai. Yeh bhoolna ki set ka order nahi hota. Comprehension ke andar "kuch karne" ke liye <code>print</code> lagana: <code>[print(n) for n in names]</code> names print karta hai par <code>None</code> values ki bekaar list bhi banata hai. Jab result nahi balki action chahiye to seedha <code>for</code> loop use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>[...]</code> list banata hai, <code>{k: v ...}</code> dictionary, <code>{x ...}</code> set. Aur round brackets wala <code>(x for x ...)</code> tuple comprehension <i>nahi</i> hai; woh generator expression hai, jo agla bada topic hai.</p></div>

<div class="scn"><h4>Site asal mein kaunse VLANs use karti hai?</h4><p>Ek engineer ke paas switch naam se VLAN list ki dictionary thi aur clean-up se pehle poore campus ke distinct VLANs ki list maangi gayi. Saari lists par ek set comprehension aur uske ird-gird <code>sorted()</code> ne jawab ek line mein de diya, aur woh duplicates jo manual spreadsheet count mein galti karwate the apne aap gayab ho gaye.</p><p><b>Lesson:</b> jab "distinct" chahiye, set uthao.</p></div>

<div class="iv"><p class="q">"Comprehension kya hai, aur kab use nahi karoge?"</p><p>Yeh ek compact expression hai jo kisi doosre iterable se list, dictionary ya set banata hai, optional filter ke saath. Jab kaam ek saaf transformation ya filter ka ho tab use karta hoon. Agar kai statements chahiye, print jaise side effects hain, ya line padhne layak nahi rahi, to normal loop likhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Comprehension ke teen hisse hain: kya rakhna hai, kahan se aata hai, optional test.</li>
<li><code>[...]</code> list hai, <code>{k: v ...}</code> dictionary, <code>{x ...}</code> set.</li>
<li>Set duplicates hata deta hai aur uska order nahi hota; print ke liye <code>sorted()</code> lagao.</li>
<li>Python 3 mein loop variable comprehension se bahar leak nahi hota.</li>
<li>Result ke liye comprehension, action ke liye loop.</li>
</ul></div>
`}};export{e as default};