var e={id:`exam-drills`,h:{en:`Interpret the script: exam drills`,hi:`Script interpret karo: exam drills`},body:{en:`
<p>A chess coach does not ask a beginner to play whole games at first; he sets up a position and asks "what happens after this move?". Exam item 6.1 works the same way: a short snippet, one question, four answers. This chapter is a set of positions. Cover the answer, work it out on paper, then check. The skill you are building is <b>tracing</b>: executing the code in your head, line by line, and writing down the value of each variable as it changes.</p>

<h3>The tracing method</h3>
<ol>
<li>Read the whole snippet once. Spot syntax problems first: a missing colon or bad indentation means nothing runs.</li>
<li>Make a small table with one column per variable.</li>
<li>Go line by line. For a loop, add a row per iteration. For a condition, write True or False before deciding which branch runs.</li>
<li>Only <code>print()</code> produces output. Write exactly what it prints, including spaces and quotes.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Trace table for drill 2">
<rect x="20" y="10" width="600" height="30" fill="#e2e8f0"/><text x="80" y="30" text-anchor="middle" class="svg-ink" font-size="13">v</text><text x="250" y="30" text-anchor="middle" class="svg-ink" font-size="13">1 &lt; v &lt; 1002 ?</text><text x="470" y="30" text-anchor="middle" class="svg-ink" font-size="13">user so far</text>
<text x="80" y="62" text-anchor="middle" class="svg-ink" font-size="13">1</text><text x="250" y="62" text-anchor="middle" class="svg-accent" font-size="13">False</text><text x="470" y="62" text-anchor="middle" class="svg-ink" font-size="13">[]</text>
<text x="80" y="90" text-anchor="middle" class="svg-ink" font-size="13">10</text><text x="250" y="90" text-anchor="middle" class="svg-accent" font-size="13">True</text><text x="470" y="90" text-anchor="middle" class="svg-ink" font-size="13">[10]</text>
<text x="80" y="118" text-anchor="middle" class="svg-ink" font-size="13">20</text><text x="250" y="118" text-anchor="middle" class="svg-accent" font-size="13">True</text><text x="470" y="118" text-anchor="middle" class="svg-ink" font-size="13">[10, 20]</text>
<text x="80" y="146" text-anchor="middle" class="svg-ink" font-size="13">1002</text><text x="250" y="146" text-anchor="middle" class="svg-accent" font-size="13">False</text><text x="470" y="146" text-anchor="middle" class="svg-ink" font-size="13">[10, 20]</text>
<text x="80" y="174" text-anchor="middle" class="svg-ink" font-size="13">1003</text><text x="250" y="174" text-anchor="middle" class="svg-accent" font-size="13">False</text><text x="470" y="174" text-anchor="middle" class="svg-ink" font-size="13">[10, 20]</text>
<line x1="160" y1="10" x2="160" y2="190" stroke="#64748b" stroke-width="1"/><line x1="340" y1="10" x2="340" y2="190" stroke="#64748b" stroke-width="1"/>
</svg><p class="cap">A trace table turns guessing into bookkeeping.</p></div>

<h3>Drill 1: strings and slices</h3>
<pre class="code">intf = "GigabitEthernet1/0/24"
print(intf[:2] + intf[15:])</pre>
<p><b>Answer:</b> <code>Gi1/0/24</code>. "GigabitEthernet" has 15 characters (indexes 0 to 14), so <code>intf[15:]</code> starts at the 1. <code>intf[:2]</code> is "Gi". The <code>+</code> joins two strings.</p>

<h3>Drill 2: list comprehension</h3>
<pre class="code">vlans = [1, 10, 20, 1002, 1003]
user = [v for v in vlans if 1 &lt; v &lt; 1002]
print(len(user), user[-1])</pre>
<p><b>Answer:</b> <code>2 20</code>. The chained comparison keeps only 10 and 20 (see the table). <code>print</code> with two values puts a space between them.</p>

<h3>Drill 3: nested dict and get()</h3>
<pre class="code">dev = {"hostname": "ACC-SW1", "ports": {"Gi0/2": 10, "Gi0/3": 20}}
print(dev["ports"].get("Gi0/4", "unused"), len(dev["ports"]))</pre>
<p><b>Answer:</b> <code>unused 2</code>. The key Gi0/4 is missing, so <code>.get</code> returns the default instead of raising KeyError. <code>len</code> of a dict counts its keys.</p>

<h3>Drill 4: JSON in, JSON out</h3>
<pre class="code">import json
text = '{"response": [{"hostname": "R1", "up": true}, {"hostname": "R2", "up": false}]}'
data = json.loads(text)
down = [d["hostname"] for d in data["response"] if not d["up"]]
print(down)
print(json.dumps({"down": len(down), "ok": True}))</pre>
<pre class="out">['R2']
{"down": 1, "ok": true}</pre>
<p><b>Why:</b> <code>false</code> became Python <code>False</code>, so <code>not d["up"]</code> is True only for R2. Printing a list shows Python's single quotes; <code>json.dumps</code> writes JSON with double quotes and lowercase <code>true</code>.</p>

<h3>Drill 5: functions and default arguments</h3>
<pre class="code">def cfg(n, desc="uplink"):
    return "description {} {}".format(desc, n)

print(cfg(3))
print(cfg(desc="core", n=1))</pre>
<p><b>Answer:</b> <code>description uplink 3</code>, then <code>description core 1</code>. The first call uses the default; the second passes both arguments by name, so their order does not matter.</p>

<h3>Drill 6: status-code logic</h3>
<pre class="code">code = 204
if code == 200:
    print("data")
elif 200 &lt;= code &lt; 300:
    print("ok, no body")
elif code == 401:
    print("login again")
else:
    print("error")</pre>
<p><b>Answer:</b> <code>ok, no body</code>. 204 is not 200, but it is in the 2xx range, and only the first True branch runs. Change <code>code</code> to 403 and the output is <code>error</code>, because no branch tests 403.</p>

<h3>Drill 7: exceptions</h3>
<pre class="code">try:
    vlan = int("VLAN10")
    print("parsed")
except ValueError:
    print("bad value")
finally:
    print("done")</pre>
<p><b>Answer:</b> <code>bad value</code> then <code>done</code>. <code>int()</code> cannot convert letters, so it raises ValueError before <code>print("parsed")</code>; <code>finally</code> always runs.</p>

<h3>Drill 8: find the broken line</h3>
<pre class="code">1  routers = ["10.99.0.1", "10.99.0.2"]
2  for ip in routers
3      print("polling " + ip)
4  print("finished")</pre>
<p><b>Answer:</b> line 2 is missing the colon, so Python reports <code>SyntaxError: expected ':'</code> and <b>prints nothing at all</b>, not even "finished", because the whole file is checked before it runs.</p>

<div class="eg"><p><b>Worked example: a full mini-script.</b> <code>rows = [{"intf": "Gi0/0", "status": "up"}, {"intf": "Gi0/1", "status": "down"}, {"intf": "Lo100", "status": "up"}]</code>, then <code>count = 0</code>, then a loop <code>for r in rows:</code> whose body is <code>if r["status"] == "up": count += 1</code>, then <code>print("{} of {} up".format(count, len(rows)))</code>. Trace: Gi0/0 up (1), Gi0/1 down (1), Lo100 up (2). Output: <b>2 of 3 up</b>. <code>count += 1</code> is shorthand for <code>count = count + 1</code>.</p></div>

<div class="warn"><p><b>Common mistakes in drills.</b> Starting to count at 1; forgetting that a slice end is excluded; reading <code>=</code> as a comparison; assuming both branches of an if/elif can run; and printing Python True where the question shows <code>json.dumps</code> output (it is <code>true</code>).</p></div>

<div class="exam"><p><b>Exam trap.</b> Many distractors are "almost right": <code>['R2']</code> versus <code>["R2"]</code>, <code>5.0</code> versus <code>5</code>, <code>Gi1/0/24</code> versus <code>Gi/1/0/24</code>. Decide the exact output on paper before you look at the options, then match character by character.</p></div>

<div class="scn"><h4>The interview whiteboard</h4><p>A candidate for a network automation role was shown a ten-line script and asked what it printed. He guessed quickly and got it wrong: he assumed <code>range(1, 4)</code> produced 1 to 4. A second candidate drew a three-column trace table, walked the loop, and answered correctly in about the same time. The hiring manager said afterwards that the table itself was what impressed him: it showed a method that would also work on a failing production script.</p><p><b>Lesson:</b> tracing is not just an exam trick; it is how you debug scripts you did not write.</p></div>

<div class="iv"><p class="q">"Here is a short script. Tell me what it prints, and talk me through how you worked it out."</p><p>Strong answer: first check syntax and indentation, then trace line by line out loud, keeping a table of variables, stating each condition as True or False, and noting where an exception would be raised. Call out Python specifics as you meet them: zero-based indexes, excluded slice ends, <code>/</code> returning a float, <code>.get()</code> defaults, only the first true elif running. Say what you would run in the REPL to confirm.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Check syntax first: a SyntaxError means no output at all.</li>
<li>Trace with a table: one column per variable, one row per step or loop iteration.</li>
<li>Only <code>print</code> produces output; <code>print(a, b)</code> puts one space between values.</li>
<li>Python lists print with single quotes; <code>json.dumps</code> prints double quotes and lowercase true/false/null.</li>
<li>Work out the exact answer before reading the options.</li>
</ul></div>
`,hi:`
<p>Chess coach beginner se shuru mein poore games nahi khilwata; woh ek position set karta hai aur poochta hai "is chaal ke baad kya hoga?". Exam item 6.1 bhi aise hi kaam karta hai: ek chhota snippet, ek sawaal, chaar answers. Yeh chapter positions ka set hai. Answer chhupao, kaagaz par nikaalo, phir check karo. Aap jo skill bana rahe ho woh <b>tracing</b> hai: code ko dimaag mein line by line chalana, aur har variable ki value badalte hi likhna.</p>

<h3>Tracing ka tarika</h3>
<ol>
<li>Poora snippet ek baar padho. Pehle syntax problems pakdo: missing colon ya galat indentation ka matlab kuch nahi chalega.</li>
<li>Ek chhoti table banao, har variable ke liye ek column.</li>
<li>Line by line chalo. Loop ke liye har iteration ki ek row jodo. Condition ke liye pehle True ya False likho, phir decide karo kaunsa branch chalega.</li>
<li>Sirf <code>print()</code> output banata hai. Bilkul wahi likho jo woh print karta hai, spaces aur quotes samet.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Drill 2 ki trace table">
<rect x="20" y="10" width="600" height="30" fill="#e2e8f0"/><text x="80" y="30" text-anchor="middle" class="svg-ink" font-size="13">v</text><text x="250" y="30" text-anchor="middle" class="svg-ink" font-size="13">1 &lt; v &lt; 1002 ?</text><text x="470" y="30" text-anchor="middle" class="svg-ink" font-size="13">ab tak user</text>
<text x="80" y="62" text-anchor="middle" class="svg-ink" font-size="13">1</text><text x="250" y="62" text-anchor="middle" class="svg-accent" font-size="13">False</text><text x="470" y="62" text-anchor="middle" class="svg-ink" font-size="13">[]</text>
<text x="80" y="90" text-anchor="middle" class="svg-ink" font-size="13">10</text><text x="250" y="90" text-anchor="middle" class="svg-accent" font-size="13">True</text><text x="470" y="90" text-anchor="middle" class="svg-ink" font-size="13">[10]</text>
<text x="80" y="118" text-anchor="middle" class="svg-ink" font-size="13">20</text><text x="250" y="118" text-anchor="middle" class="svg-accent" font-size="13">True</text><text x="470" y="118" text-anchor="middle" class="svg-ink" font-size="13">[10, 20]</text>
<text x="80" y="146" text-anchor="middle" class="svg-ink" font-size="13">1002</text><text x="250" y="146" text-anchor="middle" class="svg-accent" font-size="13">False</text><text x="470" y="146" text-anchor="middle" class="svg-ink" font-size="13">[10, 20]</text>
<text x="80" y="174" text-anchor="middle" class="svg-ink" font-size="13">1003</text><text x="250" y="174" text-anchor="middle" class="svg-accent" font-size="13">False</text><text x="470" y="174" text-anchor="middle" class="svg-ink" font-size="13">[10, 20]</text>
<line x1="160" y1="10" x2="160" y2="190" stroke="#64748b" stroke-width="1"/><line x1="340" y1="10" x2="340" y2="190" stroke="#64748b" stroke-width="1"/>
</svg><p class="cap">Trace table andaze ko hisaab-kitaab mein badal deti hai.</p></div>

<h3>Drill 1: strings aur slices</h3>
<pre class="code">intf = "GigabitEthernet1/0/24"
print(intf[:2] + intf[15:])</pre>
<p><b>Answer:</b> <code>Gi1/0/24</code>. "GigabitEthernet" mein 15 characters hain (indexes 0 se 14), isliye <code>intf[15:]</code> 1 se shuru hota hai. <code>intf[:2]</code> "Gi" hai. <code>+</code> do strings jodta hai.</p>

<h3>Drill 2: list comprehension</h3>
<pre class="code">vlans = [1, 10, 20, 1002, 1003]
user = [v for v in vlans if 1 &lt; v &lt; 1002]
print(len(user), user[-1])</pre>
<p><b>Answer:</b> <code>2 20</code>. Chained comparison sirf 10 aur 20 rakhta hai (table dekho). Do values wala <code>print</code> unke beech ek space daalta hai.</p>

<h3>Drill 3: nested dict aur get()</h3>
<pre class="code">dev = {"hostname": "ACC-SW1", "ports": {"Gi0/2": 10, "Gi0/3": 20}}
print(dev["ports"].get("Gi0/4", "unused"), len(dev["ports"]))</pre>
<p><b>Answer:</b> <code>unused 2</code>. Key Gi0/4 missing hai, isliye <code>.get</code> KeyError dene ki jagah default return karta hai. Dict ka <code>len</code> uski keys ginta hai.</p>

<h3>Drill 4: JSON andar, JSON bahar</h3>
<pre class="code">import json
text = '{"response": [{"hostname": "R1", "up": true}, {"hostname": "R2", "up": false}]}'
data = json.loads(text)
down = [d["hostname"] for d in data["response"] if not d["up"]]
print(down)
print(json.dumps({"down": len(down), "ok": True}))</pre>
<pre class="out">['R2']
{"down": 1, "ok": true}</pre>
<p><b>Kyun:</b> <code>false</code> Python <code>False</code> ban gaya, isliye <code>not d["up"]</code> sirf R2 ke liye True hai. List print karne par Python ke single quotes dikhte hain; <code>json.dumps</code> double quotes aur lowercase <code>true</code> ke saath JSON likhta hai.</p>

<h3>Drill 5: functions aur default arguments</h3>
<pre class="code">def cfg(n, desc="uplink"):
    return "description {} {}".format(desc, n)

print(cfg(3))
print(cfg(desc="core", n=1))</pre>
<p><b>Answer:</b> <code>description uplink 3</code>, phir <code>description core 1</code>. Pehli call default use karti hai; doosri dono arguments naam se pass karti hai, isliye unka order matter nahi karta.</p>

<h3>Drill 6: status-code logic</h3>
<pre class="code">code = 204
if code == 200:
    print("data")
elif 200 &lt;= code &lt; 300:
    print("ok, no body")
elif code == 401:
    print("login again")
else:
    print("error")</pre>
<p><b>Answer:</b> <code>ok, no body</code>. 204 200 nahi hai, par 2xx range mein hai, aur sirf pehla True branch chalta hai. <code>code</code> ko 403 karo to output <code>error</code> hoga, kyunki koi branch 403 test nahi karta.</p>

<h3>Drill 7: exceptions</h3>
<pre class="code">try:
    vlan = int("VLAN10")
    print("parsed")
except ValueError:
    print("bad value")
finally:
    print("done")</pre>
<p><b>Answer:</b> <code>bad value</code> phir <code>done</code>. <code>int()</code> letters convert nahi kar sakta, isliye woh <code>print("parsed")</code> se pehle ValueError raise karta hai; <code>finally</code> hamesha chalta hai.</p>

<h3>Drill 8: tooti line dhoondho</h3>
<pre class="code">1  routers = ["10.99.0.1", "10.99.0.2"]
2  for ip in routers
3      print("polling " + ip)
4  print("finished")</pre>
<p><b>Answer:</b> line 2 mein colon missing hai, isliye Python <code>SyntaxError: expected ':'</code> report karta hai aur <b>kuch bhi print nahi karta</b>, "finished" bhi nahi, kyunki chalne se pehle poori file check hoti hai.</p>

<div class="eg"><p><b>Worked example: ek poora mini-script.</b> <code>rows = [{"intf": "Gi0/0", "status": "up"}, {"intf": "Gi0/1", "status": "down"}, {"intf": "Lo100", "status": "up"}]</code>, phir <code>count = 0</code>, phir ek loop <code>for r in rows:</code> jiski body <code>if r["status"] == "up": count += 1</code> hai, phir <code>print("{} of {} up".format(count, len(rows)))</code>. Trace: Gi0/0 up (1), Gi0/1 down (1), Lo100 up (2). Output: <b>2 of 3 up</b>. <code>count += 1</code> <code>count = count + 1</code> ka shortcut hai.</p></div>

<div class="warn"><p><b>Drills mein common galtiyan.</b> 1 se ginna shuru karna; bhool jaana ki slice ka end shaamil nahi; <code>=</code> ko comparison padhna; maan lena ki if/elif ke dono branch chal sakte hain; aur jahan question <code>json.dumps</code> output dikhata hai wahan Python True likhna (woh <code>true</code> hai).</p></div>

<div class="exam"><p><b>Exam trap.</b> Kai distractors "lagbhag sahi" hote hain: <code>['R2']</code> vs <code>["R2"]</code>, <code>5.0</code> vs <code>5</code>, <code>Gi1/0/24</code> vs <code>Gi/1/0/24</code>. Options dekhne se pehle kaagaz par exact output decide karo, phir character by character match karo.</p></div>

<div class="scn"><h4>Interview whiteboard</h4><p>Network automation role ke ek candidate ko das line ka script dikhaya gaya aur poocha gaya woh kya print karega. Usne jaldi andaza lagaya aur galat nikla: usne maana ki <code>range(1, 4)</code> 1 se 4 deta hai. Doosre candidate ne teen column ki trace table banayi, loop chalaya, aur lagbhag utne hi samay mein sahi jawab diya. Hiring manager ne baad mein kaha ki table hi usse impressive lagi: usne ek aisa tarika dikhaya jo failing production script par bhi kaam karega.</p><p><b>Seekh:</b> tracing sirf exam trick nahi; yahi tarika hai un scripts ko debug karne ka jo aapne nahi likhe.</p></div>

<div class="iv"><p class="q">"Yeh ek chhota script hai. Batao yeh kya print karega, aur samjhao aapne kaise nikaala."</p><p>Strong answer: pehle syntax aur indentation check karo, phir variables ki table rakhte hue line by line zor se trace karo, har condition ko True ya False bolo, aur note karo kahan exception raise hoga. Python ki specifics jaise jaise milein batao: zero-based indexes, slice ka end shaamil nahi, <code>/</code> float deta hai, <code>.get()</code> defaults, sirf pehla true elif chalta hai. Batao confirm karne ke liye REPL mein kya chalaoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle syntax check karo: SyntaxError matlab bilkul koi output nahi.</li>
<li>Table se trace karo: har variable ka ek column, har step ya loop iteration ki ek row.</li>
<li>Sirf <code>print</code> output banata hai; <code>print(a, b)</code> values ke beech ek space daalta hai.</li>
<li>Python lists single quotes ke saath print hoti hain; <code>json.dumps</code> double quotes aur lowercase true/false/null print karta hai.</li>
<li>Options padhne se pehle exact answer nikaalo.</li>
</ul></div>
`}};export{e as default};